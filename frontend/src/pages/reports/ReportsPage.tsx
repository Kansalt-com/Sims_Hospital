import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { reportsApi } from "../../api/services";
import { getErrorMessage } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loader } from "../../components/ui/Loader";
import type { AnalyticsReport } from "../../types";
import { formatCurrency } from "../../utils/format";

export const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [pageError, setPageError] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = async (selectedFromDate = fromDate, selectedToDate = toDate) => {
    setLoading(true);
    setPageError("");
    try {
      const res = await reportsApi.analytics({ fromDate: selectedFromDate, toDate: selectedToDate });
      setReport(res.data.data);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    setExporting(true);
    try {
      const res = await reportsApi.exportAnalytics({ fromDate, toDate });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sims-report-${fromDate}-to-${toDate}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !report) {
    return <Loader />;
  }

  if (pageError && !report) {
    return <EmptyState text={pageError} action={<Button onClick={() => load(fromDate, toDate)}>Retry</Button>} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex min-h-[220px] flex-col gap-4 rounded-[32px] bg-[linear-gradient(135deg,#082f49,_#155e75,_#166534)] p-8 text-white shadow-2xl shadow-cyan-950/10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-100">Operational Intelligence</p>
          <h1 className="mt-3 text-3xl font-semibold">Hospital analytics and export-ready reports</h1>
          <p className="mt-3 max-w-2xl text-sm text-cyan-50/85">
            Range-based OPD, IPD, revenue, doctor load, payment mix, and invoice reporting in a format that can be printed or exported for finance and operations.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[180px] flex-col gap-1 text-sm text-cyan-50">
            <span className="font-medium">From Date</span>
            <input
              className="rounded-2xl border border-white/20 bg-slate-950/20 px-4 py-2.5 text-sm text-white outline-none backdrop-blur placeholder:text-white/70"
              type="date"
              value={fromDate}
              max={toDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>
          <label className="flex min-w-[180px] flex-col gap-1 text-sm text-cyan-50">
            <span className="font-medium">To Date</span>
            <input
              className="rounded-2xl border border-white/20 bg-slate-950/20 px-4 py-2.5 text-sm text-white outline-none backdrop-blur placeholder:text-white/70"
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>
          <Button onClick={() => load(fromDate, toDate)}>Generate Report</Button>
          <Button variant="secondary" onClick={exportReport} disabled={exporting}>
            <Download size={16} /> {exporting ? "Exporting..." : "Export XLS"}
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[28px]"><p className="text-sm text-slate-500">OPD Count</p><p className="mt-2 text-3xl font-semibold">{report?.summary.opdCount ?? 0}</p></Card>
        <Card className="rounded-[28px]"><p className="text-sm text-slate-500">IPD Count</p><p className="mt-2 text-3xl font-semibold">{report?.summary.ipdCount ?? 0}</p></Card>
        <Card className="rounded-[28px]"><p className="text-sm text-slate-500">Range Revenue</p><p className="mt-2 text-3xl font-semibold">{formatCurrency(report?.summary.rangeRevenue ?? 0)}</p></Card>
        <Card className="rounded-[28px]"><p className="text-sm text-slate-500">Month To Date Revenue</p><p className="mt-2 text-3xl font-semibold">{formatCurrency(report?.summary.monthToDateRevenue ?? 0)}</p></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-[28px] xl:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Doctor Wise Patients</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Doctor</th>
                  <th className="py-2">Specialization</th>
                  <th className="py-2">Patients</th>
                </tr>
              </thead>
              <tbody>
                {(report?.doctorWisePatients ?? []).map((row) => (
                  <tr key={row.doctorId} className="border-b border-slate-100">
                    <td className="py-3 font-medium">{row.doctorName}</td>
                    <td className="py-3 text-slate-500">{row.specialization ?? "-"}</td>
                    <td className="py-3">{row.patientCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="rounded-[28px]">
          <h2 className="mb-4 text-xl font-semibold">Bed Occupancy</h2>
          <div className="space-y-3">
            {(report?.bedOccupancy ?? []).map((row) => (
              <div key={row.status} className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{row.status}</span>
                  <span className="text-2xl font-semibold text-slate-900">{row.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-[28px]">
        <h2 className="mb-4 text-xl font-semibold">Payment Mix</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(report?.paymentMix ?? []).map((row) => (
            <div key={row.paymentMode} className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">{row.paymentMode}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(row.amount)}</p>
              <p className="mt-1 text-xs text-slate-500">{row.payments} payment(s)</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-[28px]">
        <h2 className="mb-4 text-xl font-semibold">Invoices In Selected Range</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Invoice</th>
                <th className="py-2">Patient</th>
                <th className="py-2">Doctor</th>
                <th className="py-2">Type</th>
                <th className="py-2">Total</th>
                <th className="py-2">Paid</th>
                <th className="py-2">Due</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(report?.invoices ?? []).map((invoice) => (
                <tr key={`${invoice.invoiceNo}-${invoice.visitId}`} className="border-b border-slate-100">
                  <td className="py-3 font-medium">{invoice.invoiceNo}</td>
                  <td className="py-3">
                    <p className="font-medium">{invoice.patientName}</p>
                    <p className="text-xs text-slate-500">MRN: {invoice.patientMrn}</p>
                  </td>
                  <td className="py-3">{invoice.doctorName}</td>
                  <td className="py-3">{invoice.invoiceType}</td>
                  <td className="py-3">{formatCurrency(invoice.total)}</td>
                  <td className="py-3">{formatCurrency(invoice.paidAmount)}</td>
                  <td className="py-3">{formatCurrency(invoice.dueAmount)}</td>
                  <td className="py-3">{invoice.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
