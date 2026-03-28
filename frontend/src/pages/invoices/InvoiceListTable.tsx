import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/ui/Loader";
import { Select } from "../../components/ui/Select";
import { formatCurrency, formatDateTime } from "../../utils/format";
import type { CancelledInvoiceLog, InvoiceListItem } from "./invoiceTypes";

type InvoiceListTableProps = {
  loading: boolean;
  query: string;
  invoices: InvoiceListItem[];
  cancelledInvoices: CancelledInvoiceLog[];
  canCancelInvoices: boolean;
  pageError: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onRetry: () => void;
  onCollectPayment: (invoice: InvoiceListItem) => void;
  onAddCharges: (invoice: InvoiceListItem) => void;
  onCancelInvoice: (invoice: InvoiceListItem) => void;
};

export const InvoiceListTable = ({
  loading,
  query,
  invoices,
  cancelledInvoices,
  canCancelInvoices,
  pageError,
  onQueryChange,
  onSearch,
  onReset,
  onRetry,
  onCollectPayment,
  onAddCharges,
  onCancelInvoice,
}: InvoiceListTableProps) => {
  const location = useLocation();
  const backTo = `${location.pathname}${location.search}`;
  const [typeFilter, setTypeFilter] = useState<"ALL" | InvoiceListItem["invoiceType"]>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | InvoiceListItem["paymentStatus"]>("ALL");
  const [doctorFilter, setDoctorFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const doctorOptions = useMemo(
    () =>
      Array.from(
        new Map(
          invoices
            .filter((invoice) => invoice.visit?.doctor?.id && invoice.visit?.doctor?.name)
            .map((invoice) => [String(invoice.visit.doctor.id), invoice.visit.doctor.name]),
        ).entries(),
      ),
    [invoices],
  );
  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const typeMatch = typeFilter === "ALL" ? true : invoice.invoiceType === typeFilter;
        const statusMatch = statusFilter === "ALL" ? true : invoice.paymentStatus === statusFilter;
        const doctorMatch =
          doctorFilter === "ALL" ? true : String(invoice.visit?.doctor?.id ?? "") === doctorFilter;
        const invoiceDate = invoice.createdAt ? invoice.createdAt.slice(0, 10) : "";
        const dateMatch = dateFilter ? invoiceDate === dateFilter : true;
        return typeMatch && statusMatch && doctorMatch && dateMatch;
      }),
    [invoices, typeFilter, statusFilter, doctorFilter, dateFilter],
  );

  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          className="max-w-sm"
          label="Search Invoices"
          placeholder="Search invoice, patient, or phone number"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "ALL" | InvoiceListItem["invoiceType"])}>
          <option value="ALL">All Types</option>
          <option value="OPD">OPD</option>
          <option value="IPD">IPD</option>
          <option value="LAB">Labs</option>
          <option value="GENERAL">General</option>
          <option value="PHARMACY">Pharmacy</option>
        </Select>
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | InvoiceListItem["paymentStatus"])}>
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PARTIAL">Partial</option>
          <option value="PAID">Paid</option>
        </Select>
        <Select value={doctorFilter} onChange={(event) => setDoctorFilter(event.target.value)}>
          <option value="ALL">All Doctors</option>
          {doctorOptions.map(([id, name]) => (
            <option key={id} value={id}>
              Dr. {name}
            </option>
          ))}
        </Select>
        <Input className="max-w-[180px]" label="Bill Date" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
        <div className="flex items-end gap-2">
          <Button onClick={onSearch}>Search</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setTypeFilter("ALL");
              setStatusFilter("ALL");
              setDoctorFilter("ALL");
              setDateFilter("");
              onReset();
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : pageError ? (
        <EmptyState
          text={pageError}
          action={<Button onClick={onRetry}>Retry</Button>}
        />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState text="No invoices found." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Bill ID</th>
                <th className="py-2">Patient Name</th>
                <th className="py-2">Doctor Name</th>
                <th className="py-2">Date</th>
                <th className="py-2">Total Amount</th>
                <th className="py-2">Payment Mode</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
              </thead>
              <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-100 align-top">
                  <td className="py-3 font-medium">{invoice.invoiceNo}</td>
                  <td className="py-3">
                    <p className="font-medium text-slate-900">{invoice.visit?.patient?.name ?? "-"}</p>
                    <p className="text-xs text-slate-500">{invoice.visit?.patient?.mrn ?? ""}</p>
                  </td>
                  <td className="py-3">Dr. {invoice.visit?.doctor?.name ?? "-"}</td>
                  <td className="py-3">{formatDateTime(invoice.createdAt)}</td>
                  <td className="py-3">{formatCurrency(invoice.total)}</td>
                  <td className="py-3">{invoice.paymentMode ?? "Mixed"}</td>
                  <td className="py-3">
                    <Badge tone={invoice.paymentStatus === "PAID" ? "success" : invoice.paymentStatus === "PARTIAL" ? "warning" : "default"}>
                      {invoice.paymentStatus}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/invoices/${invoice.id}/print`} state={{ backTo }}>
                        <Button variant="secondary" className="h-9 px-3 py-1 text-xs">Print Invoice</Button>
                      </Link>
                      <Button variant="ghost" className="h-9 px-3 py-1 text-xs" onClick={() => onAddCharges(invoice)}>
                        Add Charges
                      </Button>
                      {Number(invoice.dueAmount || 0) <= 0 ? (
                        <Link to={`/prescriptions/${invoice.visit?.id}/print`} state={{ backTo }}>
                          <Button variant="ghost" className="h-9 px-3 py-1 text-xs">Print Prescription</Button>
                        </Link>
                      ) : (
                        <Button variant="ghost" className="h-9 px-3 py-1 text-xs" onClick={() => onCollectPayment(invoice)}>
                          Collect Payment
                        </Button>
                      )}
                      {canCancelInvoices ? (
                        <Button
                          variant="ghost"
                          className="h-9 border border-rose-200 px-3 py-1 text-xs text-rose-700 hover:bg-rose-50"
                          onClick={() => onCancelInvoice(invoice)}
                        >
                          Delete Bill
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canCancelInvoices ? (
        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-slate-900">Cancelled Bills</h3>
            <p className="text-sm text-slate-500">Visible only to the protected super-admin account for audit review.</p>
          </div>

          {cancelledInvoices.length === 0 ? (
            <EmptyState text="No cancelled bills found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2">Cancelled On</th>
                    <th className="py-2">Bill No</th>
                    <th className="py-2">Patient</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Cancelled By</th>
                    <th className="py-2">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {cancelledInvoices.map((entry) => {
                    const metadata = entry.metadata ?? {};
                    const invoiceNo = typeof metadata.invoiceNo === "string" ? metadata.invoiceNo : "-";
                    const patientName = typeof metadata.patientName === "string" ? metadata.patientName : "-";
                    const total = typeof metadata.total === "number" ? metadata.total : 0;
                    const actorName = entry.actor?.name || entry.actor?.username || "-";
                    return (
                      <tr key={entry.id} className="border-b border-slate-100 align-top">
                        <td className="py-3">{formatDateTime(entry.createdAt)}</td>
                        <td className="py-3 font-medium">{invoiceNo}</td>
                        <td className="py-3">{patientName}</td>
                        <td className="py-3">{formatCurrency(total)}</td>
                        <td className="py-3">{actorName}</td>
                        <td className="py-3">{entry.description || "Bill cancelled by super admin"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
};
