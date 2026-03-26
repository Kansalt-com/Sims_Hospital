import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useParams } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import { doctorApi, prescriptionApi, settingsApi, visitApi } from "../../api/services";
import { PrescriptionPrint } from "../../components/prescription/PrescriptionPrint";
import { Loader } from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import type { HospitalSettings, User, Visit } from "../../types";
import "../../styles/print.css";

type PrescriptionVisit = Visit & {
  invoice?: { invoiceNo: string; dueAmount: number } | null;
  prescription?: {
    id: number;
    itemsJson: string;
    symptoms?: string | null;
    diagnosis?: string | null;
    advice?: string | null;
  } | null;
  vitals?: Record<string, string | number | null | undefined>;
};

export const PrescriptionPrintPage = () => {
  const location = useLocation();
  const params = useParams();
  const { user } = useAuth();
  const visitId = Number(params.visitId);
  const backTo = (location.state as { backTo?: string } | null)?.backTo ?? "/prescriptions";
  const [loading, setLoading] = useState(true);
  const [visit, setVisit] = useState<PrescriptionVisit | null>(null);
  const [settings, setSettings] = useState<HospitalSettings | null>(null);
  const [doctor, setDoctor] = useState<(User & { doctorProfile?: User["doctorProfile"] }) | null>(null);
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
        const visitData = visitRes.data.data as PrescriptionVisit;
        setVisit(visitData);
        setSettings(settingsRes.data.data);

        const doctorId = user?.role === "DOCTOR" ? user.id : visitData.doctorId;
        if (doctorId) {
          try {
            const doctorRes = await doctorApi.get(doctorId);
            setDoctor(doctorRes.data.data);
          } catch {
            setDoctor({
              id: visitData.doctor.id,
              name: visitData.doctor.name,
              username: user?.username || "",
              role: "DOCTOR",
              forcePasswordChange: false,
              active: true,
              doctorProfile: visitData.doctor.doctorProfile ?? null,
            });
          }
        } else {
          setDoctor(null);
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    if (visitId) {
      load();
    }
  }, [user?.id, user?.role, user?.username, visitId]);

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

  if (!visit.invoice) {
    return <div className="p-6">Generate the bill first before printing the prescription.</div>;
  }

  if (!visit.prescription) {
    return <div className="p-6">Prescription not available for this visit yet.</div>;
  }

  return <PrescriptionPrint visit={visit} settings={settings} doctor={doctor} backTo={backTo} />;
};
