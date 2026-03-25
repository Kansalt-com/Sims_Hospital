import dayjs from "dayjs";
import { prisma } from "../../db/prisma.js";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import { writeAuditLog } from "../../services/audit.service.js";
import {
  computePaymentSummary,
  createInvoiceNumber,
  createPaymentRecords,
  prepareInvoiceTotals,
} from "../../services/billing.service.js";
import { AppError } from "../../utils/appError.js";
import { parsePage } from "../../utils/pagination.js";
import type {
  AddInvoicePaymentsInput,
  AppendInvoiceItemsInput,
  CreateInvoiceInput,
  InvoiceListQuery,
} from "./invoices.validation.js";

export const listInvoices = async (query: InvoiceListQuery) => {
  const { q, page, pageSize, date, paymentStatus, invoiceType } = query;
  const { skip, take, page: safePage, pageSize: safeSize } = parsePage(page, pageSize);

  const where = {
    createdAt: date
      ? {
          gte: dayjs(date).startOf("day").toDate(),
          lte: dayjs(date).endOf("day").toDate(),
        }
      : undefined,
    paymentStatus: paymentStatus ?? undefined,
    invoiceType: invoiceType ?? undefined,
    OR: q
      ? [
          { invoiceNo: { contains: q } },
          { patient: { name: { contains: q } } },
          { patient: { phone: { contains: q } } },
          { patient: { mrn: { contains: q } } },
        ]
      : undefined,
  };

  const [total, rows] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      include: {
        payments: true,
        prescription: { select: { id: true, visitId: true, createdAt: true, printedAt: true } },
        visit: {
          include: {
            patient: true,
            doctor: {
              select: {
                id: true,
                name: true,
                doctorProfile: { select: { qualification: true, specialization: true, signaturePath: true } },
              },
            },
          },
        },
        patient: true,
        doctor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    data: rows,
    pagination: {
      page: safePage,
      pageSize: safeSize,
      total,
      totalPages: Math.ceil(total / safeSize),
    },
  };
};

export const getInvoiceById = async (invoiceId: number) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: true,
      payments: true,
      prescription: true,
      patient: true,
      doctor: { select: { id: true, name: true, doctorProfile: { select: { qualification: true, specialization: true, signaturePath: true } } } },
      visit: {
        include: {
          patient: true,
          doctor: {
            select: {
              id: true,
              name: true,
              doctorProfile: { select: { qualification: true, specialization: true, signaturePath: true } },
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  }

  const settings = await prisma.hospitalSettings.findUnique({ where: { id: 1 } });
  return { data: invoice, settings };
};

export const createInvoice = async (payload: CreateInvoiceInput, req: AuthenticatedRequest) => {
  const visit = await prisma.visit.findUnique({
    where: { id: payload.visitId },
    include: { patient: true, doctor: true, invoice: true },
  });

  if (!visit) {
    throw new AppError("Visit not found", 404, "VISIT_NOT_FOUND");
  }

  if (visit.invoice) {
    throw new AppError("Invoice already exists for this visit", 400, "INVOICE_EXISTS");
  }

  const totals = prepareInvoiceTotals({
    items: payload.items,
    discount: payload.discount,
    tax: payload.tax,
  });

  const payments =
    payload.payments && payload.payments.length > 0
      ? payload.payments
      : payload.paidAmount && payload.paidAmount > 0 && payload.paymentMode
        ? [
            {
              amount: payload.paidAmount,
              paymentMode: payload.paymentMode,
              notes: payload.notes,
            },
          ]
        : [];

  const paymentSummary = computePaymentSummary(totals.total, payments);

  const invoice = await prisma.$transaction(async (tx) => {
    const invoiceNo = await createInvoiceNumber(tx);

    const created = await tx.invoice.create({
      data: {
        visitId: payload.visitId,
        invoiceNo,
        patientId: visit.patientId,
        doctorId: visit.doctorId,
        invoiceType: payload.invoiceType,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        paymentStatus: paymentSummary.paymentStatus,
        paymentMode: payments[0]?.paymentMode ?? null,
        paidAmount: paymentSummary.paidAmount,
        dueAmount: paymentSummary.dueAmount,
        notes: payload.notes ?? null,
        createdById: req.user?.id,
        items: {
          create: totals.linePreview.map((item) => ({
            category: item.category,
            name: item.name,
            qty: item.qty,
            unitPrice: item.unitPrice,
            discount: item.discount,
            tax: item.tax,
            amount: item.amount,
          })),
        },
      },
    });

    await createPaymentRecords(tx, created.id, visit.patientId, payments, req.user?.id);

    if (visit.status !== "COMPLETED") {
      await tx.visit.update({
        where: { id: visit.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    }

    if (paymentSummary.dueAmount <= 0) {
      await tx.prescription.upsert({
        where: { visitId: visit.id },
        create: {
          visitId: visit.id,
          patientId: visit.patientId,
          doctorId: visit.doctorId,
          invoiceId: created.id,
          templateType: "OP_CASE_SHEET",
          notes: payload.notes ?? null,
          itemsJson: JSON.stringify([]),
        },
        update: {
          patientId: visit.patientId,
          doctorId: visit.doctorId,
          invoiceId: created.id,
          templateType: "OP_CASE_SHEET",
          notes: payload.notes ?? undefined,
        },
      });
    }

    await writeAuditLog({
      actorId: req.user?.id,
      action: "invoice.create",
      entityType: "invoice",
      entityId: created.id,
      description: `Invoice ${invoiceNo} created`,
      patientId: visit.patientId,
      visitId: visit.id,
      invoiceId: created.id,
      request: req,
      metadata: {
        invoiceType: payload.invoiceType,
        paymentStatus: paymentSummary.paymentStatus,
        total: totals.total,
      },
      client: tx,
    });

    return tx.invoice.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        items: true,
        payments: true,
        prescription: true,
        visit: {
          include: {
            patient: true,
            doctor: {
              select: {
                id: true,
                name: true,
                doctorProfile: { select: { qualification: true, specialization: true, signaturePath: true } },
              },
            },
          },
        },
      },
    });
  });

  return invoice;
};

export const addInvoicePayments = async (invoiceId: number, payload: AddInvoicePaymentsInput, req: AuthenticatedRequest) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });

  if (!invoice) {
    throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  }

  if (invoice.paymentStatus === "PAID") {
    throw new AppError("Invoice is already fully paid", 400, "INVOICE_ALREADY_PAID");
  }

  const paymentSummary = computePaymentSummary(invoice.total, [
    ...invoice.payments.map((payment) => ({
      amount: payment.amount,
      paymentMode: payment.paymentMode,
    })),
    ...payload.payments,
  ]);

  return prisma.$transaction(async (tx) => {
    await createPaymentRecords(tx, invoice.id, invoice.patientId, payload.payments, req.user?.id);

    const row = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        paymentStatus: paymentSummary.paymentStatus,
        paymentMode: payload.payments[payload.payments.length - 1]?.paymentMode ?? invoice.paymentMode,
        paidAmount: paymentSummary.paidAmount,
        dueAmount: paymentSummary.dueAmount,
      },
      include: {
        items: true,
        payments: true,
        visit: true,
        patient: true,
        doctor: { select: { id: true, name: true } },
        prescription: true,
      },
    });

    if (paymentSummary.dueAmount <= 0) {
      await tx.prescription.upsert({
        where: { visitId: row.visitId },
        create: {
          visitId: row.visitId,
          patientId: row.patientId,
          doctorId: row.doctorId,
          invoiceId: row.id,
          templateType: "OP_CASE_SHEET",
          itemsJson: JSON.stringify([]),
        },
        update: {
          invoiceId: row.id,
        },
      });
    }

    await writeAuditLog({
      actorId: req.user?.id,
      action: "invoice.add-payment",
      entityType: "invoice",
      entityId: row.id,
      description: `Additional payment recorded on ${row.invoiceNo}`,
      patientId: row.patientId,
      visitId: row.visitId,
      invoiceId: row.id,
      request: req,
      metadata: {
        addedPayments: payload.payments.length,
        paymentStatus: paymentSummary.paymentStatus,
        dueAmount: paymentSummary.dueAmount,
      },
      client: tx,
    });

    return row;
  });
};

export const addInvoiceItems = async (invoiceId: number, payload: AppendInvoiceItemsInput, req: AuthenticatedRequest) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: true,
      payments: true,
      visit: true,
      patient: true,
      doctor: { select: { id: true, name: true } },
      prescription: true,
    },
  });

  if (!invoice) {
    throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  }

  const addedTotals = prepareInvoiceTotals({
    items: payload.items,
  });

  const paymentSummary = computePaymentSummary(invoice.total + addedTotals.total, [
    ...invoice.payments.map((payment) => ({
      amount: payment.amount,
      paymentMode: payment.paymentMode,
    })),
    ...(payload.payments ?? []),
  ]);

  return prisma.$transaction(async (tx) => {
    await tx.invoiceItem.createMany({
      data: addedTotals.linePreview.map((item) => ({
        invoiceId: invoice.id,
        category: item.category,
        name: item.name,
        qty: item.qty,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        amount: item.amount,
      })),
    });

    await createPaymentRecords(tx, invoice.id, invoice.patientId, payload.payments ?? [], req.user?.id);

    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        subtotal: invoice.subtotal + addedTotals.subtotal,
        discount: invoice.discount + addedTotals.discount,
        tax: invoice.tax + addedTotals.tax,
        total: invoice.total + addedTotals.total,
        paymentStatus: paymentSummary.paymentStatus,
        paymentMode:
          payload.payments && payload.payments.length > 0
            ? payload.payments[payload.payments.length - 1]?.paymentMode
            : invoice.paymentMode,
        paidAmount: paymentSummary.paidAmount,
        dueAmount: paymentSummary.dueAmount,
        notes: payload.notes
          ? [invoice.notes, payload.notes].filter(Boolean).join(" | ")
          : invoice.notes,
      },
      include: {
        items: true,
        payments: true,
        visit: true,
        patient: true,
        doctor: { select: { id: true, name: true } },
        prescription: true,
      },
    });

    if (paymentSummary.dueAmount <= 0) {
      await tx.prescription.upsert({
        where: { visitId: updated.visitId },
        create: {
          visitId: updated.visitId,
          patientId: updated.patientId,
          doctorId: updated.doctorId,
          invoiceId: updated.id,
          templateType: "OP_CASE_SHEET",
          itemsJson: JSON.stringify([]),
          notes: payload.notes ?? undefined,
        },
        update: {
          invoiceId: updated.id,
          notes: payload.notes ?? undefined,
        },
      });
    }

    await writeAuditLog({
      actorId: req.user?.id,
      action: "invoice.add-items",
      entityType: "invoice",
      entityId: updated.id,
      description: `Additional charges added to ${updated.invoiceNo}`,
      patientId: updated.patientId,
      visitId: updated.visitId,
      invoiceId: updated.id,
      request: req,
      metadata: {
        addedItems: payload.items.length,
        addedTotal: addedTotals.total,
        paymentStatus: paymentSummary.paymentStatus,
        dueAmount: paymentSummary.dueAmount,
      },
      client: tx,
    });

    return updated;
  });
};
