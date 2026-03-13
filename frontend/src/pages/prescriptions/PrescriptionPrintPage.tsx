import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/client";
import { prescriptionApi, settingsApi, visitApi } from "../../api/services";
import type { HospitalSettings, Visit } from "../../types";
import { HospitalBrand } from "../../components/branding/HospitalBrand";
import { Button } from "../../components/ui/Button";
import { Loader } from "../../components/ui/Loader";
import { formatDateTime } from "../../utils/format";
import "../../styles/print.css";

type PrescriptionVisit = Visit & {
  invoice?: { invoiceNo: string; dueAmount: number } | null;
  prescription?: { id: number } | null;
  vitals?: Record<string, string | number | null | undefined>;
};

const fieldOrBlank = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

export const PrescriptionPrintPage = () => {
  const location = useLocation();
  const params = useParams();
  const visitId = Number(params.visitId);
  const backTo = (location.state as { backTo?: string } | null)?.backTo ?? "/prescriptions";
  const [loading, setLoading] = useState(true);
  const [visit, setVisit] = useState<PrescriptionVisit | null>(null);
  const [settings, setSettings] = useState<HospitalSettings | null>(null);
  const markedPrintedRef = useRef(false);

  useEffect(() => {
    document.body.setAttribute("data-print-format", "a4");
    return () => {
      document.body.removeAttribute("data-print-format");
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [visitRes, settingsRes] = await Promise.all([visitApi.get(visitId), settingsApi.get()]);
        setVisit(visitRes.data.data as PrescriptionVisit);
        setSettings(settingsRes.data.data);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    if (visitId) {
      load();
    }
  }, [visitId]);

  useEffect(() => {
    const markPrinted = async () => {
      if (!visit?.prescription?.id || markedPrintedRef.current) return;
      markedPrintedRef.current = true;
      try {
        await prescriptionApi.markPrinted(visit.prescription.id);
      } catch {
        // Print should still continue if tracking fails.
      }
    };

    markPrinted();
  }, [visit?.prescription?.id]);

  if (loading) {
    return <Loader text="Loading prescription..." />;
  }

  if (!visit || !settings) {
    return <div className="p-6">Prescription record not found.</div>;
  }

  if (!visit.invoice || Number(visit.invoice.dueAmount || 0) > 0) {
    return <div className="p-6">Prescription print is allowed only after full payment.</div>;
  }

  if (!visit.prescription) {
    return <div className="p-6">Prescription not available for this visit yet.</div>;
  }

  const rawVitals = visit.vitals || {};
  const pulse = fieldOrBlank(rawVitals.pulse);
  const temp = fieldOrBlank(rawVitals.temperature || rawVitals.temp);
  const bp = fieldOrBlank(rawVitals.bp || (rawVitals.bpSystolic && rawVitals.bpDiastolic ? `${rawVitals.bpSystolic}/${rawVitals.bpDiastolic}` : ""));
  const spo2 = fieldOrBlank(rawVitals.spo2);
  const weight = fieldOrBlank(rawVitals.weight);

  return (
    <div className="mx-auto max-w-5xl space-y-4 prescription-print-shell">
      <div className="print-controls no-print flex items-center justify-between rounded-[28px] border border-slate-200 bg-white p-4 shadow-panel">
        <div>
          <h1 className="text-lg font-semibold">Prescription Sheet</h1>
          <p className="text-sm text-slate-500">Professional A4 prescription layout for doctor handwriting</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.print()}>Print Prescription</Button>
          <Link to={backTo}><Button variant="secondary">Back</Button></Link>
        </div>
      </div>

      <article className="print-sheet-a4 prescription-sheet">
        <div className="prescription-header-band" />

        <header className="prescription-header">
          <div className="prescription-header-left">
            <div>
              <HospitalBrand
                className="prescription-brand"
                logoClassName="prescription-brand__logo"
                titleClassName="prescription-hospital-name"
                subtitleClassName="prescription-brand__subtitle"
              />
              <p className="prescription-hospital-meta">{settings.address || "Hospital Address"}</p>
              <p className="prescription-hospital-meta">Contact: {settings.phone || "-"}</p>
            </div>
          </div>
          <div className="prescription-doctor-block">
            <p className="prescription-doctor-name">Dr. {visit.doctor.name}</p>
            <p>{visit.doctor?.doctorProfile?.qualification || ""}</p>
            <p>{visit.doctor?.doctorProfile?.specialization || ""}</p>
          </div>
        </header>

        <section className="prescription-patient-grid">
          <div className="line-field"><span className="label">Patient Name:</span> <span className="line-fill">{visit.patient.name}</span></div>
          <div className="line-field"><span className="label">Date:</span> <span className="line-fill">{new Date(visit.scheduledAt).toLocaleDateString()}</span></div>
          <div className="line-field"><span className="label">Age / Gender:</span> <span className="line-fill">{visit.patient.age || ""} / {visit.patient.gender || ""}</span></div>
          <div className="line-field"><span className="label">MRN:</span> <span className="line-fill">{visit.patient.mrn || ""}</span></div>

          <div className="line-field"><span className="label">Pulse:</span> <span className="line-fill">{pulse}</span><span className="suffix">/Min.</span></div>
          <div className="line-field"><span className="label">Temp:</span> <span className="line-fill">{temp}</span><span className="suffix">°C</span></div>
          <div className="line-field"><span className="label">B.P:</span> <span className="line-fill">{bp}</span></div>
          <div className="line-field"><span className="label">SPO2:</span> <span className="line-fill">{spo2}</span><span className="suffix">%</span></div>
          <div className="line-field"><span className="label">Weight:</span> <span className="line-fill">{weight}</span><span className="suffix">Kg</span></div>
        </section>

        <section className="prescription-writing-area">
          <p className="rx-mark">Rx</p>
          <div className="writing-lines" />
          <div className="prescription-subsections">
            <div>
              <p className="sub-head">Advice</p>
              <div className="sub-lines" />
            </div>
            <div>
              <p className="sub-head">Follow-up</p>
              <div className="sub-lines" />
            </div>
          </div>
        </section>

        <div className="prescription-footer-row">
          <p className="visit-meta">Visit: #{visit.id} | Bill ID: {visit.invoice.invoiceNo} | {formatDateTime(visit.scheduledAt)}</p>
        </div>
        <footer className="prescription-sheet__footer">
          <p className="prescription-sheet__thank-you">{settings.footerNote || "Thank you for choosing SIMS Hospital."}</p>
          <div className="prescription-sheet__signature">
            <div className="invoice-sheet__signature-line" />
            <p>Doctor Signature</p>
          </div>
        </footer>
      </article>
    </div>
  );
};
