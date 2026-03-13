import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BedDouble, BriefcaseMedical, CalendarRange, CircleDollarSign, Stethoscope } from "lucide-react";
import { reportsApi, visitApi } from "../api/services";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Loader } from "../components/ui/Loader";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import type { DashboardSnapshot, Visit } from "../types";
import { formatCurrency, formatDateTime } from "../utils/format";
import { getErrorMessage } from "../api/client";

const widgetCards = [
  { key: "todayOpdPatients", label: "Today's OPD Patients", icon: <BriefcaseMedical size={18} /> },
  { key: "currentIpdAdmissions", label: "IPD Admissions", icon: <BedDouble size={18} /> },
  { key: "todayRevenue", label: "Today's Revenue", icon: <CircleDollarSign size={18} /> },
  { key: "doctorsAvailable", label: "Doctors Available", icon: <Stethoscope size={18} /> },
  { key: "appointments", label: "Appointments", icon: <CalendarRange size={18} /> },
  { key: "bedOccupancyRate", label: "Bed Occupancy", icon: <BedDouble size={18} /> },
] as const;

export const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [visitRows, setVisitRows] = useState<Visit[]>([]);
  const [pageError, setPageError] = useState("");

  const load = async () => {
    setLoading(true);
    setPageError("");
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [dashboardRes, visitsRes] = await Promise.all([
        reportsApi.dashboard(today),
        visitApi.list({ page: 1, pageSize: 6, date: today }),
      ]);

      setSnapshot(dashboardRes.data.data);
      setVisitRows(visitsRes.data.data);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const topWidgetRows = useMemo(() => {
    if (!snapshot) return [];
    return widgetCards.map((card) => ({
      ...card,
      value: snapshot.widgets[card.key],
    }));
  }, [snapshot]);

  if (loading) {
    return <Loader />;
  }

  if (pageError) {
    return <EmptyState text={pageError} action={<Button onClick={load}>Retry</Button>} />;
  }

  return (
    <div className="space-y-6">
      <section className="min-h-[220px] overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#0f172a,_#155e75,_#0f766e)] p-8 text-white shadow-2xl shadow-cyan-900/15">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-cyan-100">Enterprise Operations</p>
            <h1 className="mt-3 text-3xl font-semibold">Hospital command center for {user?.name}</h1>
            <p className="mt-3 max-w-2xl text-sm text-cyan-50/85">
              Monitor admissions, consult queues, collections, and bed occupancy in real time with a workflow designed for production hospital teams.
            </p>
          </div>
          <div className="grid min-w-[240px] gap-3 rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100">Operational Pulse</p>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-4xl font-semibold">{snapshot?.widgets.bedOccupancyRate ?? 0}%</span>
              <span className="text-sm text-cyan-50/80">Bed occupancy</span>
            </div>
            <Link className="inline-flex items-center gap-2 text-sm text-white/90 transition hover:text-white" to="/reports">
              Open analytics <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topWidgetRows.map((widget) => (
          <Card key={widget.key} className="rounded-[28px] border border-white/60 bg-white/90 shadow-lg shadow-slate-200/60">
            <div className="flex items-start justify-between">
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">{widget.icon}</div>
              <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Live</span>
            </div>
            <p className="mt-5 text-sm text-slate-500">{widget.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {widget.key === "todayRevenue"
                ? formatCurrency(Number(widget.value))
                : widget.key === "bedOccupancyRate"
                  ? `${widget.value}%`
                  : widget.value}
            </p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[28px] border border-white/60 bg-white/90 shadow-lg shadow-slate-200/60">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Today's Care Queue</h2>
              <p className="text-sm text-slate-500">Active visit movement across OPD and IPD</p>
            </div>
            <Link className="text-sm font-medium text-cyan-700" to={user?.role === "DOCTOR" ? "/doctor" : "/visits"}>
              Open workflow
            </Link>
          </div>
          {visitRows.length === 0 ? (
            <EmptyState text="No visits found for today." />
          ) : (
            <div className="space-y-3">
              {visitRows.map((visit) => (
                <div key={visit.id} className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{visit.patient.name}</p>
                      <p className="text-sm text-slate-500">Dr. {visit.doctor.name}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">{visit.status}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{visit.type}</span>
                    <span>{formatDateTime(visit.scheduledAt)}</span>
                    {visit.invoice ? <span>{visit.invoice.paymentStatus}</span> : <span>Awaiting billing</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-[28px] border border-white/60 bg-white/90 shadow-lg shadow-slate-200/60">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Recent Collections</h2>
              <p className="text-sm text-slate-500">Latest paid invoices for today</p>
            </div>
            <Link className="text-sm font-medium text-cyan-700" to="/invoices">
              View billing
            </Link>
          </div>
          {snapshot?.recentCollections.length ? (
            <div className="space-y-3">
              {snapshot.recentCollections.map((invoice) => (
                <div key={invoice.id} className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{invoice.invoiceNo}</p>
                      <p className="text-sm text-slate-500">{invoice.patient?.name ?? invoice.visit?.patient?.name ?? "Patient"}</p>
                    </div>
                    <p className="text-lg font-semibold text-emerald-700">{formatCurrency(invoice.paidAmount)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{invoice.paymentStatus}</span>
                    <span>{invoice.paymentMode ?? "Mixed"}</span>
                    <span>{formatDateTime(invoice.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No collections recorded for today." />
          )}
        </Card>
      </section>
    </div>
  );
};
