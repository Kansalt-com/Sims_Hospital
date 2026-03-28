import dayjs from "dayjs";
import type { Prisma } from "@prisma/client";
import type { PaymentStatusValue } from "../types/domain.js";
import { AppError } from "../utils/appError.js";
import { roundMoney } from "../utils/id.js";
import { clearCache } from "../utils/memoryCache.js";

type InvoiceItemInput = {
  category: "CONSULTATION" | "LAB" | "PROCEDURE" | "MEDICINE" | "MISC";
  name: string;
  qty: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
};

type PaymentInput = {
  amount: number;
  paymentMode: "CASH" | "UPI" | "CARD" | "INSURANCE";
  referenceNo?: string | null;
  notes?: string | null;
  receivedAt?: string | null;
};

type BuildInvoiceInput = {
  items: InvoiceItemInput[];
  discount?: number;
  tax?: number;
};

export const prepareInvoiceTotals = (input: BuildInvoiceInput) => {
  const linePreview = input.items.map((item) => {
    const base = roundMoney(item.qty * item.unitPrice);
    const discount = roundMoney(item.discount ?? 0);
    const tax = roundMoney(item.tax ?? 0);
    const amount = roundMoney(base - discount + tax);

    if (amount < 0) {
      throw new AppError(`Invalid amount for item: ${item.name}`, 400);
    }

    return {
      ...item,
      discount,
      tax,
      amount,
      base,
    };
  });

  const subtotal = roundMoney(linePreview.reduce((sum, item) => sum + item.base, 0));
  const lineDiscount = roundMoney(linePreview.reduce((sum, item) => sum + item.discount, 0));
  const lineTax = roundMoney(linePreview.reduce((sum, item) => sum + item.tax, 0));
  const invoiceDiscount = roundMoney(input.discount ?? 0);
  const invoiceTax = roundMoney(input.tax ?? 0);
  const discount = roundMoney(lineDiscount + invoiceDiscount);
  const tax = roundMoney(lineTax + invoiceTax);
  const total = roundMoney(subtotal - discount + tax);

  if (total < 0) {
    throw new AppError("Invoice total cannot be negative", 400);
  }

  return {
    subtotal,
    discount,
    tax,
    total,
    linePreview,
  };
};

export const computePaymentSummary = (total: number, payments: PaymentInput[]) => {
  const paidAmount = roundMoney(payments.reduce((sum, payment) => sum + roundMoney(payment.amount), 0));
  if (paidAmount > total) {
    throw new AppError("Paid amount cannot exceed total", 400);
  }

  const dueAmount = roundMoney(total - paidAmount);
  const paymentStatus: PaymentStatusValue =
    dueAmount <= 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "PENDING";

  return {
    paidAmount,
    dueAmount,
    paymentStatus,
  };
};

export const createInvoiceNumber = async (tx: Prisma.TransactionClient) => {
  const settings =
    (await tx.hospitalSettings.findUnique({ where: { id: 1 } })) ??
    (await tx.hospitalSettings.create({
      data: {
        hospitalName: "SIMS Hospital",
        address: "Update hospital address",
        phone: "0000000000",
        invoicePrefix: "SIMS",
        invoiceSequence: 1,
        footerNote: "Thank you for choosing SIMS Hospital.",
        kansaltLogoPath: "/assets/branding/qode27-wordmark.svg",
      },
    }));

  const dateCode = dayjs().format("YYYYMMDD");
  const sequence = String(settings.invoiceSequence).padStart(4, "0");
  const invoiceNo = `${settings.invoicePrefix}-${dateCode}-${sequence}`;

  await tx.hospitalSettings.update({
    where: { id: 1 },
    data: { invoiceSequence: settings.invoiceSequence + 1 },
  });

  return invoiceNo;
};

export const createPaymentRecords = async (
  tx: Prisma.TransactionClient,
  invoiceId: number,
  patientId: number,
  payments: PaymentInput[],
  recordedById?: number | null,
) => {
  if (payments.length === 0) {
    return [];
  }

  const created = await Promise.all(
    payments.map((payment) =>
      tx.payment.create({
        data: {
          invoiceId,
          patientId,
          amount: roundMoney(payment.amount),
          paymentMode: payment.paymentMode,
          referenceNo: payment.referenceNo ?? null,
          notes: payment.notes ?? null,
          receivedAt: payment.receivedAt ? new Date(payment.receivedAt) : new Date(),
          recordedById: recordedById ?? null,
        },
      }),
    ),
  );

  clearCache("dashboard:");
  clearCache("reports:");
  return created;
};
