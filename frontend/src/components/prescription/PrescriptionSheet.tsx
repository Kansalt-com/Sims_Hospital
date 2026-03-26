import type { HospitalSettings, User, Visit } from "../../types";
import { buildPublicAssetPath } from "../../utils/branding";

type VitalsRecord = Record<string, string | number | null | undefined>;

type PrescriptionRecord = {
  id: number;
  itemsJson: string;
  symptoms?: string | null;
  diagnosis?: string | null;
  advice?: string | null;
};

export type PrescriptionSheetVisit = Visit & {
  invoice?: { invoiceNo: string; dueAmount?: number } | null;
  prescription?: PrescriptionRecord | null;
  vitals?: VitalsRecord;
};

type PrescriptionSheetProps = {
  visit: PrescriptionSheetVisit;
  settings: HospitalSettings;
  doctor: (User & { doctorProfile?: User["doctorProfile"] }) | null;
};

type PrescriptionItem = {
  medicine: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instruction?: string;
};

const fieldOrBlank = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const parseItems = (itemsJson?: string | null): PrescriptionItem[] => {
  if (!itemsJson) return [];
  try {
    const parsed = JSON.parse(itemsJson) as PrescriptionItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getVitals = (vitals?: VitalsRecord) => {
  const pulse = fieldOrBlank(vitals?.pulse);
  const temperature = fieldOrBlank(vitals?.temperature ?? vitals?.temp);
  const bp = fieldOrBlank(
    vitals?.bp ??
      (vitals?.bpSystolic && vitals?.bpDiastolic ? `${vitals.bpSystolic}/${vitals.bpDiastolic}` : ""),
  );
  const spo2 = fieldOrBlank(vitals?.spo2);
  const weight = fieldOrBlank(vitals?.weight);

  return { pulse, temperature, bp, spo2, weight };
};

const doctorDetails = (doctor: PrescriptionSheetProps["doctor"], visit: PrescriptionSheetVisit) => {
  const name = doctor?.name || visit.doctor?.name || "";
  const degree = doctor?.doctorProfile?.qualification || visit.doctor?.doctorProfile?.qualification || "";
  const specialization = doctor?.doctorProfile?.specialization || visit.doctor?.doctorProfile?.specialization || "";

  return {
    name,
    degree,
    specialization,
  };
};

const buildRxLines = (items: PrescriptionItem[], advice?: string | null) => {
  const medicationLines = items.map((item, index) => {
    const detail = [
      item.medicine,
      item.dosage,
      item.frequency,
      item.durationDays ? `${item.durationDays} day${item.durationDays > 1 ? "s" : ""}` : "",
      item.instruction || "",
    ]
      .filter(Boolean)
      .join(" | ");
    return `${index + 1}. ${detail}`;
  });

  const noteLines = [fieldOrBlank(advice)].filter(Boolean);
  const lines = [...medicationLines, ...noteLines];

  if (lines.length >= 14) {
    return lines.slice(0, 14);
  }

  return [...lines, ...Array.from({ length: 14 - lines.length }, () => "")];
};

export const PrescriptionSheet = ({ visit, settings, doctor }: PrescriptionSheetProps) => {
  const { pulse, temperature, bp, spo2, weight } = getVitals(visit.vitals);
  const { name: doctorName, degree, specialization } = doctorDetails(doctor, visit);
  const rxLines = buildRxLines(parseItems(visit.prescription?.itemsJson), visit.prescription?.advice);
  const patientName = visit.patient.name;
  const age = visit.patient.age ? String(visit.patient.age) : "";
  const gender = visit.patient.gender ? visit.patient.gender.charAt(0) + visit.patient.gender.slice(1).toLowerCase() : "";
  const visitDate = new Date(visit.scheduledAt);
  const visitDay = String(visitDate.getDate()).padStart(2, "0");
  const visitMonth = String(visitDate.getMonth() + 1).padStart(2, "0");
  const visitYear = String(visitDate.getFullYear());
  const bannerSrc = buildPublicAssetPath("assets/branding/prescription-banner.png");

  return (
    <article className="print-sheet-a4 sims-rx-sheet bg-white">
      <header className="sims-rx-header">
        <img src={bannerSrc} alt="SIMS prescription banner" className="sims-rx-header__banner" />
      </header>

      <section className="sims-rx-meta">
        <div className="sims-rx-meta__left">
          <div className="sims-rx-meta__left-title">OP CASE SHEET</div>

          <div className="sims-rx-field-row">
            <span className="sims-rx-label">Patient Name :</span>
            <span className="sims-rx-line wide">{patientName}</span>
          </div>

          <div className="sims-rx-field-row sims-rx-field-row--triple">
            <div className="sims-rx-inline-field">
              <span className="sims-rx-label">Age / Gennder:</span>
              <span className="sims-rx-line">{[age, gender].filter(Boolean).join(" / ")}</span>
            </div>
            <div className="sims-rx-inline-field">
              <span className="sims-rx-label">B.P.</span>
              <span className="sims-rx-line">{bp}</span>
            </div>
          </div>

          <div className="sims-rx-field-row sims-rx-field-row--triple">
            <div className="sims-rx-inline-field">
              <span className="sims-rx-label">Pulse :</span>
              <span className="sims-rx-line">{pulse}</span>
              <span className="sims-rx-unit">/Mnt.</span>
            </div>
            <div className="sims-rx-inline-field">
              <span className="sims-rx-label">SPO2</span>
              <span className="sims-rx-line">{spo2}</span>
              <span className="sims-rx-unit">%</span>
            </div>
          </div>

          <div className="sims-rx-field-row sims-rx-field-row--triple">
            <div className="sims-rx-inline-field">
              <span className="sims-rx-label">Temp :</span>
              <span className="sims-rx-line">{temperature}</span>
              <span className="sims-rx-unit">°C</span>
            </div>
            <div className="sims-rx-inline-field">
              <span className="sims-rx-label">Weight :</span>
              <span className="sims-rx-line">{weight}</span>
              <span className="sims-rx-unit">Kg</span>
            </div>
          </div>
        </div>

        <div className="sims-rx-meta__right">
          <div className="sims-rx-doctor-box">
            <h2>{doctorName ? `Dr ${doctorName}` : ""}</h2>
            <p>{degree || ""}</p>
            <p>{specialization || ""}</p>
          </div>

          <div className="sims-rx-date-box">
            <span className="sims-rx-label">DATE :</span>
            <span className="sims-rx-line small">{visitDay}</span>
            <span className="sims-rx-line small">{visitMonth}</span>
            <span className="sims-rx-line year">{visitYear}</span>
          </div>
        </div>
      </section>

      <section className="sims-rx-body">
        <div className="sims-rx-rx-mark">Rx</div>
        <div className="sims-rx-writing-space">
          {rxLines.map((line, index) => (
            <div key={`${line}-${index}`} className="sims-rx-writing-line">
              <span>{line}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="sims-rx-footer">
        <div className="sims-rx-footer__rule" />
        <p className="sims-rx-footer__hindi">* यह पर्ची किसी भी प्रकार की कानूनी कार्यवाही के लिए मान्य नहीं है।</p>
        <p className="sims-rx-footer__english">
          * Consultation Charge - Valid for 6 days only after then consultation charge will have to be paid.
        </p>
      </footer>
    </article>
  );
};
