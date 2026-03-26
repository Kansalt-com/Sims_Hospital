import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import type { HospitalSettings, User } from "../../types";
import { PrescriptionSheet, type PrescriptionSheetVisit } from "./PrescriptionSheet";

type PrescriptionPrintProps = {
  visit: PrescriptionSheetVisit;
  settings: HospitalSettings;
  doctor: (User & { doctorProfile?: User["doctorProfile"] }) | null;
  backTo: string;
};

export const PrescriptionPrint = ({ visit, settings, doctor, backTo }: PrescriptionPrintProps) => {
  return (
    <div className="mx-auto max-w-6xl space-y-4 prescription-print-shell">
      <div className="print-controls no-print flex items-center justify-between rounded-[28px] border border-slate-200 bg-white p-4 shadow-panel">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Prescription</h1>
          <p className="text-sm text-slate-500">OP case sheet format with print-only doctor details and A4-ready layout.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.print()}>Print Prescription</Button>
          <Link to={backTo}>
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      </div>

      <PrescriptionSheet visit={visit} settings={settings} doctor={doctor} />
    </div>
  );
};
