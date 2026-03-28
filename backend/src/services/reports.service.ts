import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { prisma } from "../db/prisma.js";
import { getOrSetCache } from "../utils/memoryCache.js";

const toAmount = (value: unknown) => Number(value ?? 0);

type ReportRangeInput = {
  date?: string;
  fromDate?: string;
  toDate?: string;
};

type DoctorSummary = {
  id: number;
  name: string;
  doctorProfile: {
    specialization: string | null;
  } | null;
};

type DoctorWisePaymentSummary = {
  doctorId: number;
  doctorName: string;
  specialization: string | null;
  invoiceCount: number;
  paidAmount: number;
  dueAmount: number;
};

type CollectionSummary = {
  stream: string;
  invoices: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
};

const resolveDateRange = ({ date, fromDate, toDate }: ReportRangeInput) => {
  const resolvedFromDate = fromDate || date || dayjs().format("YYYY-MM-DD");
  const resolvedToDate = toDate || date || resolvedFromDate;

  const start = dayjs(resolvedFromDate).startOf("day");
  const end = dayjs(resolvedToDate).endOf("day");
  const monthStart = dayjs(resolvedToDate).startOf("month");

  return {
    fromDate: start.format("YYYY-MM-DD"),
    toDate: end.format("YYYY-MM-DD"),
    start: start.toDate(),
    end: end.toDate(),
    monthStart: monthStart.toDate(),
  };
};

const applyHeaderStyle = (worksheet: ExcelJS.Worksheet) => {
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
  };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });
};

const isRadiologyItem = (name: string) => /x ray|x-ray|xray|ultrasound|usg|sonography|scan/.test(name.toLowerCase());

export const getDashboardSnapshot = async (date = dayjs().format("YYYY-MM-DD")) => {
  return getOrSetCache(`dashboard:${date}`, 30_000, async () => {
    const start = dayjs(date).startOf("day").toDate();
    const end = dayjs(date).endOf("day").toDate();

    const [opdPatients, ipdAdmissions, doctorsAvailable, appointments, revenueAggregate, occupiedBeds, totalBeds] =
      await Promise.all([
        prisma.visit.count({ where: { type: "OPD", scheduledAt: { gte: start, lte: end } } }),
        prisma.iPDAdmission.count({ where: { admittedAt: { lte: end }, OR: [{ dischargedAt: null }, { dischargedAt: { gte: start } }] } }),
        prisma.user.count({ where: { role: "DOCTOR", active: true } }),
        prisma.visit.count({ where: { scheduledAt: { gte: start, lte: end } } }),
        prisma.invoice.aggregate({ _sum: { paidAmount: true }, where: { createdAt: { gte: start, lte: end } } }),
        prisma.bed.count({ where: { status: "OCCUPIED", active: true } }),
        prisma.bed.count({ where: { active: true } }),
      ]);

    const revenue = toAmount(revenueAggregate._sum.paidAmount);
    const bedOccupancyRate = totalBeds > 0 ? Number(((occupiedBeds / totalBeds) * 100).toFixed(2)) : 0;

    const recentCollections = await prisma.invoice.findMany({
      where: { createdAt: { gte: start, lte: end } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { id: true, name: true, mrn: true } },
        doctor: { select: { id: true, name: true } },
      },
    });

    return {
      date,
      widgets: {
        todayOpdPatients: opdPatients,
        currentIpdAdmissions: ipdAdmissions,
        todayRevenue: revenue,
        doctorsAvailable,
        appointments,
        bedOccupancyRate,
      },
      recentCollections,
    };
  });
};

export const getOperationalReports = async ({ date, fromDate, toDate }: ReportRangeInput = {}) => {
  const range = resolveDateRange({ date, fromDate, toDate });

  return getOrSetCache(`reports:${range.fromDate}:${range.toDate}`, 30_000, async () => {
    const { start, end, monthStart } = range;

    const [
      opdCount,
      ipdCount,
      dailyRevenue,
      monthlyRevenue,
      doctorWise,
      bedOccupancy,
      paymentMix,
      invoices,
    ] = await Promise.all([
      prisma.visit.count({ where: { type: "OPD", scheduledAt: { gte: start, lte: end } } }),
      prisma.iPDAdmission.count({ where: { admittedAt: { gte: start, lte: end } } }),
      prisma.invoice.aggregate({ _sum: { paidAmount: true }, where: { createdAt: { gte: start, lte: end } } }),
      prisma.invoice.aggregate({ _sum: { paidAmount: true }, where: { createdAt: { gte: monthStart, lte: end } } }),
      prisma.visit.groupBy({
        by: ["doctorId"],
        where: { scheduledAt: { gte: start, lte: end } },
        _count: { id: true },
      }),
      prisma.bed.groupBy({
        by: ["status"],
        where: { active: true },
        _count: { id: true },
      }),
      prisma.payment.groupBy({
        by: ["paymentMode"],
        where: { receivedAt: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.invoice.findMany({
        where: { createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: "asc" },
        include: {
          items: true,
          patient: { select: { id: true, name: true, mrn: true } },
          doctor: { select: { id: true, name: true } },
          visit: {
            select: {
              id: true,
              type: true,
            },
          },
        },
      }),
    ]);

    const doctorIds = doctorWise.map((row: typeof doctorWise[number]) => row.doctorId);
    const doctors: DoctorSummary[] = doctorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: doctorIds } },
          select: {
            id: true,
            name: true,
            doctorProfile: { select: { specialization: true } },
          },
        }) as DoctorSummary[]
      : [];

    const doctorMap = new Map(doctors.map((doctor: DoctorSummary) => [doctor.id, doctor] as const));
    const doctorWisePayments = Array.from(
      invoices.reduce(
        (map: Map<number, DoctorWisePaymentSummary>, invoice: typeof invoices[number]) => {
          const current = map.get(invoice.doctorId) ?? {
            doctorId: invoice.doctorId,
            doctorName: invoice.doctor?.name ?? `Doctor #${invoice.doctorId}`,
            specialization: doctorMap.get(invoice.doctorId)?.doctorProfile?.specialization ?? null,
            invoiceCount: 0,
            paidAmount: 0,
            dueAmount: 0,
          };

          current.invoiceCount += 1;
          current.paidAmount += toAmount(invoice.paidAmount);
          current.dueAmount += toAmount(invoice.dueAmount);
          map.set(invoice.doctorId, current);
          return map;
        },
        new Map<number, {
          doctorId: number;
          doctorName: string;
          specialization: string | null;
          invoiceCount: number;
          paidAmount: number;
          dueAmount: number;
        }>(),
      ).values(),
    ) as DoctorWisePaymentSummary[];
    doctorWisePayments.sort((a, b) => b.paidAmount - a.paidAmount);

    const collectionsMap = invoices.reduce(
      (map: Map<string, CollectionSummary>, invoice: typeof invoices[number]) => {
        const invoiceItems = invoice.items ?? [];
        const hasLabItems = invoiceItems.some((item: typeof invoiceItems[number]) => item.category === "LAB" && !isRadiologyItem(item.name));
        const hasRadiologyItems = invoiceItems.some((item: typeof invoiceItems[number]) => isRadiologyItem(item.name));
        const stream =
          invoice.invoiceType === "IPD" || invoice.visit?.type === "IPD"
            ? "IPD Collection"
            : invoice.invoiceType === "LAB" || hasLabItems || hasRadiologyItems
              ? "Labs Collection"
              : "OPD Collection";
        const current = map.get(stream) ?? { stream, invoices: 0, total: 0, paidAmount: 0, dueAmount: 0 };
        current.invoices += 1;
        current.total += toAmount(invoice.total);
        current.paidAmount += toAmount(invoice.paidAmount);
        current.dueAmount += toAmount(invoice.dueAmount);
        map.set(stream, current);
        return map;
      },
      new Map<string, { stream: string; invoices: number; total: number; paidAmount: number; dueAmount: number }>(),
    );

    return {
      fromDate: range.fromDate,
      toDate: range.toDate,
      summary: {
        opdCount,
        ipdCount,
        rangeRevenue: toAmount(dailyRevenue._sum.paidAmount),
        monthToDateRevenue: toAmount(monthlyRevenue._sum.paidAmount),
      },
      doctorWisePatients: doctorWise
        .map((row: typeof doctorWise[number]) => ({
          doctorId: row.doctorId,
          doctorName: doctorMap.get(row.doctorId)?.name ?? `Doctor #${row.doctorId}`,
          specialization: doctorMap.get(row.doctorId)?.doctorProfile?.specialization ?? null,
          patientCount: row._count.id,
        }))
        .sort((a: { patientCount: number }, b: { patientCount: number }) => b.patientCount - a.patientCount),
      bedOccupancy: bedOccupancy.map((row: typeof bedOccupancy[number]) => ({
        status: row.status,
        count: row._count.id,
      })),
      paymentMix: paymentMix.map((row: typeof paymentMix[number]) => ({
        paymentMode: row.paymentMode,
        payments: row._count.id,
        amount: toAmount(row._sum.amount),
      })),
      doctorWisePayments,
      collections: Array.from(collectionsMap.values()),
      invoices: invoices.map((invoice: typeof invoices[number]) => ({
        invoiceNo: invoice.invoiceNo,
        createdAt: invoice.createdAt.toISOString(),
        patientName: invoice.patient?.name ?? "-",
        patientMrn: invoice.patient?.mrn ?? "-",
        doctorName: invoice.doctor?.name ?? "-",
        visitId: invoice.visitId,
        visitType: invoice.visit?.type ?? invoice.invoiceType,
        invoiceType: invoice.invoiceType,
        total: invoice.total,
        paidAmount: invoice.paidAmount,
        dueAmount: invoice.dueAmount,
        paymentStatus: invoice.paymentStatus,
        paymentMode: invoice.paymentMode ?? "MIXED",
      })),
    };
  });
};

export const exportOperationalReportWorkbook = async (input: ReportRangeInput = {}) => {
  const report = await getOperationalReports(input);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SIMS Hospital";
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 28 },
    { header: "Value", key: "value", width: 22 },
  ];
  applyHeaderStyle(summarySheet);
  summarySheet.addRows([
    { metric: "From Date", value: report.fromDate },
    { metric: "To Date", value: report.toDate },
    { metric: "OPD Count", value: report.summary.opdCount },
    { metric: "IPD Count", value: report.summary.ipdCount },
    { metric: "Revenue For Selected Range", value: report.summary.rangeRevenue },
    { metric: "Month To Date Revenue", value: report.summary.monthToDateRevenue },
  ]);

  const doctorSheet = workbook.addWorksheet("Doctor Wise Patients");
  doctorSheet.columns = [
    { header: "Doctor Name", key: "doctorName", width: 28 },
    { header: "Specialization", key: "specialization", width: 26 },
    { header: "Patient Count", key: "patientCount", width: 16 },
  ];
  applyHeaderStyle(doctorSheet);
  doctorSheet.addRows(report.doctorWisePatients);

  const bedSheet = workbook.addWorksheet("Bed Occupancy");
  bedSheet.columns = [
    { header: "Status", key: "status", width: 24 },
    { header: "Count", key: "count", width: 14 },
  ];
  applyHeaderStyle(bedSheet);
  bedSheet.addRows(report.bedOccupancy);

  const paymentSheet = workbook.addWorksheet("Payment Mix");
  paymentSheet.columns = [
    { header: "Payment Mode", key: "paymentMode", width: 20 },
    { header: "Payments", key: "payments", width: 14 },
    { header: "Amount", key: "amount", width: 18 },
  ];
  applyHeaderStyle(paymentSheet);
  paymentSheet.addRows(report.paymentMix);

  const doctorPaymentSheet = workbook.addWorksheet("Doctor Wise Payment");
  doctorPaymentSheet.columns = [
    { header: "Doctor Name", key: "doctorName", width: 28 },
    { header: "Specialization", key: "specialization", width: 24 },
    { header: "Invoices", key: "invoiceCount", width: 12 },
    { header: "Paid Amount", key: "paidAmount", width: 16 },
    { header: "Due Amount", key: "dueAmount", width: 16 },
  ];
  applyHeaderStyle(doctorPaymentSheet);
  doctorPaymentSheet.addRows(report.doctorWisePayments);

  const collectionSheet = workbook.addWorksheet("Collections");
  collectionSheet.columns = [
    { header: "Collection Stream", key: "stream", width: 24 },
    { header: "Invoices", key: "invoices", width: 12 },
    { header: "Total", key: "total", width: 16 },
    { header: "Paid Amount", key: "paidAmount", width: 16 },
    { header: "Due Amount", key: "dueAmount", width: 16 },
  ];
  applyHeaderStyle(collectionSheet);
  collectionSheet.addRows(report.collections);

  const invoiceSheet = workbook.addWorksheet("Invoices");
  invoiceSheet.columns = [
    { header: "Invoice No", key: "invoiceNo", width: 18 },
    { header: "Created At", key: "createdAt", width: 22 },
    { header: "Patient Name", key: "patientName", width: 28 },
    { header: "MRN", key: "patientMrn", width: 18 },
    { header: "Doctor Name", key: "doctorName", width: 24 },
    { header: "Visit ID", key: "visitId", width: 12 },
    { header: "Visit Type", key: "visitType", width: 14 },
    { header: "Invoice Type", key: "invoiceType", width: 14 },
    { header: "Total", key: "total", width: 16 },
    { header: "Paid Amount", key: "paidAmount", width: 16 },
    { header: "Due Amount", key: "dueAmount", width: 16 },
    { header: "Payment Status", key: "paymentStatus", width: 18 },
    { header: "Payment Mode", key: "paymentMode", width: 16 },
  ];
  applyHeaderStyle(invoiceSheet);
  invoiceSheet.addRows(report.invoices);

  [summarySheet, doctorSheet, bedSheet, paymentSheet, doctorPaymentSheet, collectionSheet, invoiceSheet].forEach((sheet) => {
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return {
    buffer,
    fileName: `sims-report-${report.fromDate}-to-${report.toDate}.xlsx`,
  };
};
