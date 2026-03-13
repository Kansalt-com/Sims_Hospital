import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import { invoiceApi } from "../../api/services";
import { PrintFooter } from "../../components/print/PrintFooter";
import { PrintHeader } from "../../components/print/PrintHeader";
import { PrintTable } from "../../components/print/PrintTable";
import { HospitalBrand } from "../../components/branding/HospitalBrand";
import { Button } from "../../components/ui/Button";
import { Loader } from "../../components/ui/Loader";
import type { HospitalSettings, Invoice } from "../../types";
import { aggregateInvoiceCharges, BILLING_CHARGE_FIELDS } from "../../utils/billing";
import { formatCurrency, formatDateTime } from "../../utils/format";
import "../../styles/print.css";

export const InvoicePrintPage = () => {
  const location = useLocation();
  const params = useParams();
  const invoiceId = Number(params.id);
  const [searchParams] = useSearchParams();
  const format = searchParams.get("format") === "thermal" ? "thermal" : "a4";
  const backTo = (location.state as { backTo?: string } | null)?.backTo ?? "/invoices";

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<HospitalSettings | null>(null);

  const chargeSummary = useMemo(() => aggregateInvoiceCharges(invoice?.items ?? []), [invoice?.items]);
  const primaryPaymentMode = invoice?.payments?.[0]?.paymentMode ?? invoice?.paymentMode ?? "-";

  useEffect(() => {
    document.body.setAttribute("data-print-format", format);
    return () => {
      document.body.removeAttribute("data-print-format");
    };
  }, [format]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await invoiceApi.get(invoiceId);
        setInvoice(res.data.data);
        setSettings(res.data.settings);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      load();
    }
  }, [invoiceId]);

  if (loading) {
    return <Loader text="Loading invoice..." />;
  }

  if (!invoice || !settings) {
    return <div className="p-6">Invoice not found.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="print-controls no-print flex flex-wrap items-center justify-between rounded-[28px] border border-slate-200 bg-white p-4 shadow-panel">
        <div>
          <h1 className="text-lg font-semibold">Invoice Print View</h1>
          <p className="text-sm text-slate-500">Simplified hospital invoice layout for A4 and thermal printing</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/invoices/${invoice.id}/print`} state={{ backTo }}>
            <Button variant={format === "a4" ? "primary" : "secondary"}>A4</Button>
          </Link>
          <Link to={`/invoices/${invoice.id}/print?format=thermal`} state={{ backTo }}>
            <Button variant={format === "thermal" ? "primary" : "secondary"}>80mm</Button>
          </Link>
          <Button onClick={() => window.print()}>Print Invoice</Button>
          <Link to={backTo}>
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </div>

      <article className={`print-sheet-a4 invoice-sheet ${format === "a4" ? "" : "hidden"}`}>
        <PrintHeader
          address={settings.address}
          phone={settings.phone}
          hospitalName={settings.hospitalName}
          metaLabel="Bill ID"
          metaValue={invoice.invoiceNo}
          metaText={`Date: ${formatDateTime(invoice.createdAt)}`}
        />

        <section className="invoice-sheet__info-grid">
          <div className="invoice-sheet__info-card">
            <p className="invoice-sheet__section-label">Patient Information</p>
            <p><strong>Patient Name:</strong> {invoice.visit.patient.name}</p>
            <p><strong>Patient ID:</strong> {invoice.visit.patient.mrn}</p>
            <p><strong>Phone:</strong> {invoice.visit.patient.phone}</p>
          </div>
          <div className="invoice-sheet__info-card">
            <p className="invoice-sheet__section-label">Doctor Information</p>
            <p><strong>Doctor Name:</strong> Dr. {invoice.visit.doctor.name}</p>
            <p><strong>Visit ID:</strong> #{invoice.visit.id}</p>
            <p><strong>Payment Mode:</strong> {primaryPaymentMode}</p>
          </div>
        </section>

        <PrintTable
          headers={["Charge", "Amount"]}
          rows={BILLING_CHARGE_FIELDS.map((field) => [field.label, formatCurrency(chargeSummary[field.key])])}
        />

        <section className="invoice-sheet__summary-grid">
          <div className="invoice-sheet__payments">
            <p className="invoice-sheet__section-label">Payment Information</p>
            <div className="invoice-sheet__payment-row">
              <div>
                <p className="font-medium text-slate-800">{primaryPaymentMode}</p>
                <p className="text-xs text-slate-500">{invoice.payments?.[0]?.referenceNo || "No reference provided"}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{formatCurrency(invoice.paidAmount)}</p>
                <p className="text-xs text-slate-500">{invoice.payments?.[0]?.receivedAt ? formatDateTime(invoice.payments[0].receivedAt) : formatDateTime(invoice.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="invoice-sheet__totals">
            <div className="invoice-sheet__totals-row"><span>Total Amount</span><strong>{formatCurrency(invoice.total)}</strong></div>
            <div><span>Paid Amount</span><strong>{formatCurrency(invoice.paidAmount)}</strong></div>
            <div><span>Balance</span><strong>{formatCurrency(invoice.dueAmount)}</strong></div>
          </div>
        </section>

        <PrintFooter note={settings.footerNote} />
      </article>

      <article className={`print-sheet-thermal rounded-2xl border border-slate-200 bg-white p-4 shadow-panel ${format === "thermal" ? "" : "hidden"}`}>
        <div className="text-center">
          <div className="mb-2 flex justify-center">
            <HospitalBrand compact className="items-center" logoClassName="h-10" titleClassName="text-sm" subtitleClassName="text-[10px]" />
          </div>
          <p className="text-xs">{settings.address}</p>
          <p className="text-xs">{settings.phone}</p>
          <p className="mt-2 text-xs">Bill ID: {invoice.invoiceNo}</p>
          <p className="text-xs">{formatDateTime(invoice.createdAt)}</p>
        </div>

        <div className="mt-3 border-y border-dashed border-slate-300 py-2 text-xs">
          <p>Patient: {invoice.visit.patient.name}</p>
          <p>Doctor: Dr. {invoice.visit.doctor.name}</p>
          <p>Payment: {primaryPaymentMode}</p>
        </div>

        <table className="mt-2 w-full text-xs">
          <tbody>
            {BILLING_CHARGE_FIELDS.map((field) => (
              <tr key={field.key} className="border-b border-slate-100">
                <td className="py-1 text-left">{field.label}</td>
                <td className="py-1 text-right">{formatCurrency(chargeSummary[field.key])}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between"><span>Total Amount</span><span>{formatCurrency(invoice.total)}</span></div>
          <div className="flex justify-between"><span>Paid Amount</span><span>{formatCurrency(invoice.paidAmount)}</span></div>
          <div className="flex justify-between"><span>Balance</span><span>{formatCurrency(invoice.dueAmount)}</span></div>
        </div>

        <div className="mt-3 text-center text-[10px]">
          <p>{settings.footerNote || "Thank you"}</p>
        </div>
      </article>
    </div>
  );
};
