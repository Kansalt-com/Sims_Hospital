import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { reportsApi } from "../../api/services";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loader } from "../../components/ui/Loader";
import type { AnalyticsReport } from "../../types";
import { formatCurrency } from "../../utils/format";
import { getErrorMessage } from "../../api/client";

const exportJson = (filename: string, payload: unknown) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [pageError, setPageError] = useState("");

  const load = async (selectedDate = date) => {
    setLoading(true);
    setPageError("");
    try {
      const res = await reportsApi.analytics(selectedDate);
      setReport(res.data.data);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !report) {
    return <Loader />;
  }

  if (pageError && !report) {
    return <EmptyState text={pageError} action={<Button onClick={() => load(date)}>Retry</Button>} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex min-h-[220px] flex-col gap-4 rounded-[32px] bg-[linear-gradient(135deg,#082f49,_#155e75,_#166534)] p-8 text-white shadow-2xl shadow-cyan-950/10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-100">Operational Intelligence</p>
          <h1 className="mt-3 text-3xl font-semibold">Hospital analytics and export-ready reports</h1>
          <p className="mt-3 max-w-2xl text-sm text-cyan-50/85">
            Daily OPD, IPD, revenue, doctor load, and payment mix in a format that can be printed or exported for finance and operations.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <input
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none backdrop-blur placeholder:text-white/70"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <Button onClick={() => load(date)}>Generate Report</Button>
          <Button variant="secondary" onClick={() => exportJson(`hospital-report-${date}.json`, report)}>
            <Download size={16} /> Export
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[28px]"><p className="text-sm text-slate-500">Daily OPD</p><p className="mt-2 text-3xl font-semibold">{report?.summary.dailyOpd ?? 0}</p></Card>
        <Card className="rounded-[28px]"><p className="text-sm text-slate-500">Daily IPD</p><p className="mt-2 text-3xl font-semibold">{report?.summary.dailyIpd ?? 0}</p></Card>
        <Card className="rounded-[28px]"><p className="text-sm text-slate-500">Daily Revenue</p><p className="mt-2 text-3xl font-semibold">{formatCurrency(report?.summary.dailyRevenue ?? 0)}</p></Card>
        <Card className="rounded-[28px]"><p className="text-sm text-slate-500">Monthly Revenue</p><p className="mt-2 text-3xl font-semibold">{formatCurrency(report?.summary.monthlyRevenue ?? 0)}</p></Card>
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
    </div>
  );
};
