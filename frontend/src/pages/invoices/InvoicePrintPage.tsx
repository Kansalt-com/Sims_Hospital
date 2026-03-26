import dayjs from "dayjs";
import html2pdf from "html2pdf.js";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useParams } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import { invoiceApi } from "../../api/services";
import { BillLayout } from "../../components/print/BillLayout";
import type { BillSection } from "../../components/print/BillTable";
import { Button } from "../../components/ui/Button";
import { Loader } from "../../components/ui/Loader";
import { useServiceCatalog } from "../../hooks/useServiceCatalog";
import type { HospitalSettings, Invoice, InvoiceItem } from "../../types";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/format";
import "../../styles/print.css";

const billSectionOrder = [
  "doctorCharges",
  "wardCharges",
  "medicines",
  "diagnostics",
  "surgery",
  "childSpecialist",
  "services",
] as const;

const billSectionTitles: Record<(typeof billSectionOrder)[number], string> = {
  doctorCharges: "Doctor Charges",
  wardCharges: "Ward Charges",
  medicines: "Medicines & Consumables",
  diagnostics: "Diagnostics (Lab Tests)",
  surgery: "Surgery Charges in Package",
  childSpecialist: "Child Specialist",
  services: "Services & Procedures",
};

const formatChargeDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  return dayjs(value).format("DD-MM-YYYY");
};

const formatNumber = (value: number) => {
  const numericValue = Number(value || 0);
  return numericValue ? numericValue.toFixed(2) : "0";
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const getSectionKey = (item: InvoiceItem): (typeof billSectionOrder)[number] => {
  const name = normalize(item.name);

  if (
    item.category === "CONSULTATION" ||
    /(doctor|consult|visit|emergency|specialist fee|physician)/.test(name)
  ) {
    return "doctorCharges";
  }

  if (/(ward|bed|room|cabin|icu|nicu|admission)/.test(name)) {
    return "wardCharges";
  }

  if (item.category === "MEDICINE" || /(medicine|consumable|drug|pharmacy|injection|syringe)/.test(name)) {
    return "medicines";
  }

  if (item.category === "LAB" || /(lab|test|x ray|xray|ultrasound|scan|diagnostic|ecg|echo)/.test(name)) {
    return "diagnostics";
  }

  if (/(surgery|surgeon|anesth|anaesth|ot |operation|package|assistant charge)/.test(name)) {
    return "surgery";
  }

  if (/(child|pediatric|paediatric|vaccination|nicu specialist)/.test(name)) {
    return "childSpecialist";
  }

  return "services";
};

const getItemHead = (item: InvoiceItem, sectionKey: (typeof billSectionOrder)[number]) => {
  if (sectionKey === "doctorCharges") {
    return /emergency/.test(normalize(item.name)) ? "Emergency Charges" : "Doctor Visit";
  }
  if (sectionKey === "wardCharges") {
    return /bed/.test(normalize(item.name)) ? "Bed Charge" : "Ward Procedure / Services";
  }
  if (sectionKey === "medicines") {
    return /ot/.test(normalize(item.name)) ? "OT Medicine" : "Ward Medicine";
  }
  if (sectionKey === "diagnostics") {
    return /ultrasound/.test(normalize(item.name))
      ? "Ultrasound"
      : /x ray|xray/.test(normalize(item.name))
        ? "X-Ray"
        : "Lab Test";
  }
  if (sectionKey === "surgery") {
    if (/surgeon/.test(normalize(item.name))) return "Surgeon Fees";
    if (/anesth|anaesth/.test(normalize(item.name))) return "Anesthetist Fees";
    if (/assistant/.test(normalize(item.name))) return "OT Assistant Charges";
    return "Surgery Name";
  }
  if (sectionKey === "childSpecialist") {
    return /vaccination/.test(normalize(item.name)) ? "Vaccination Charges" : "Child Specialist";
  }

  return "Ward Procedure / Services";
};

const buildSections = (invoice: Invoice, costBreakupMap: Map<string, string[]>): BillSection[] => {
  const grouped = new Map<(typeof billSectionOrder)[number], BillSection["items"]>();
  const rowDate = formatChargeDate(invoice.visit.ipdAdmission?.admittedAt || invoice.visit.scheduledAt || invoice.createdAt);

  for (const item of invoice.items) {
    const sectionKey = getSectionKey(item);
    const bucket = grouped.get(sectionKey) ?? [];
    const costBreakup = costBreakupMap.get(normalize(item.name)) ?? [];
    bucket.push({
      chargeDate: rowDate,
      head: getItemHead(item, sectionKey),
      description: costBreakup.length ? `${item.name} (${costBreakup.join(", ")})` : item.name,
      rate: formatNumber(item.unitPrice),
      qty: formatNumber(item.qty),
      amount: formatNumber(item.amount || item.unitPrice * item.qty),
    });
    grouped.set(sectionKey, bucket);
  }

  return billSectionOrder.map((key) => ({
    key,
    title: billSectionTitles[key],
    items: grouped.get(key) ?? [],
  }));
};

export const InvoicePrintPage = () => {
  const { catalog } = useServiceCatalog();
  const location = useLocation();
  const params = useParams();
  const invoiceId = Number(params.id);
  const backTo = (location.state as { backTo?: string } | null)?.backTo ?? "/invoices";
  const printRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<HospitalSettings | null>(null);

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

  const costBreakupMap = useMemo(
    () =>
      new Map(
        catalog
          .filter((item) => (item.costBreakup ?? []).length > 0)
          .map((item) => [normalize(item.name), item.costBreakup ?? []]),
      ),
    [catalog],
  );

  const sections = useMemo(() => (invoice ? buildSections(invoice, costBreakupMap) : []), [invoice, costBreakupMap]);

  const leftDetails = useMemo(() => {
    if (!invoice) {
      return [];
    }

    const patient = invoice.patient ?? invoice.visit.patient;
    const admission = invoice.visit.ipdAdmission;
    const doctorProfile = invoice.visit.doctor.doctorProfile;

    return [
      { label: "Name", value: patient.name || "-" },
      {
        label: "Age / Gender",
        value: `${patient.age ?? "-"} / ${patient.gender || "-"}`,
      },
      { label: "Address", value: patient.address || "-" },
      { label: "Doctor", value: invoice.doctor?.name || invoice.visit.doctor.name || "-" },
      {
        label: "Department",
        value: doctorProfile?.specialization || (invoice.visit.type === "IPD" ? "In Patient" : "Out Patient"),
      },
      {
        label: "Discharge Type",
        value: admission?.status === "DISCHARGED" ? "Discharged" : invoice.visit.status.replace(/_/g, " "),
      },
    ];
  }, [invoice]);

  const rightDetails = useMemo(() => {
    if (!invoice) {
      return [];
    }

    const admission = invoice.visit.ipdAdmission;

    return [
      { label: "Bill No", value: invoice.invoiceNo || "-" },
      { label: "Bill Date + Time", value: formatDateTime(invoice.createdAt) },
      { label: "PRN", value: invoice.visit.patient.mrn || "-" },
      { label: "Ward", value: admission?.ward || invoice.visit.type },
      { label: "Admission Date", value: formatDate(admission?.admittedAt || invoice.visit.scheduledAt) },
      { label: "Discharge Date", value: formatDate(admission?.dischargedAt) },
    ];
  }, [invoice]);

  const handleDownload = async () => {
    if (!printRef.current || !invoice) {
      return;
    }

    setDownloading(true);
    try {
      const pdfOptions: Record<string, unknown> = {
        margin: [6, 6, 6, 6],
        filename: `${invoice.invoiceNo || "final-bill"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css"] },
      };

      await html2pdf()
        .set(pdfOptions)
        .from(printRef.current)
        .save();
    } catch (error) {
      toast.error("Unable to download the bill right now.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <Loader text="Loading bill..." />;
  }

  if (!invoice || !settings) {
    return <div className="p-6">Bill not found.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="print-controls no-print flex flex-wrap items-center justify-between rounded-[28px] border border-slate-200 bg-white p-4 shadow-panel">
        <div>
          <h1 className="text-lg font-semibold">Final Bill</h1>
          <p className="text-sm text-slate-500">SIMS bill layout for print, PDF export, and patient sharing.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => window.print()}>Print Bill</Button>
          <Button variant="secondary" onClick={handleDownload} disabled={downloading}>
            {downloading ? "Preparing PDF..." : "Download Bill"}
          </Button>
          <Link to={backTo}>
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </div>

      <div ref={printRef} className="print-sheet-a4 bill-print-shell">
        <BillLayout
          leftDetails={leftDetails}
          rightDetails={rightDetails}
          sections={sections}
          total={formatCurrency(invoice.subtotal + invoice.tax)}
          discount={formatCurrency(invoice.discount)}
          net={formatCurrency(invoice.total)}
        />
      </div>
    </div>
  );
};
