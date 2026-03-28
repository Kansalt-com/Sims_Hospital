import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useServiceCatalog } from "../../hooks/useServiceCatalog";
import type { DoctorOption, PatientOption, VisitFormState } from "./visitTypes";

type VisitRegistrationFormProps = {
  patientMode: "existing" | "new";
  doctors: DoctorOption[];
  patients: PatientOption[];
  form: VisitFormState;
  saving: boolean;
  onPatientModeChange: (value: "existing" | "new") => void;
  onFormChange: (value: VisitFormState) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export const VisitRegistrationForm = ({
  patientMode,
  doctors,
  patients,
  form,
  saving,
  onPatientModeChange,
  onFormChange,
  onSubmit,
}: VisitRegistrationFormProps) => {
  const { catalog } = useServiceCatalog();
  const labServices = catalog.filter(
    (item) => item.department === "LAB" || item.department === "XRAY" || item.department === "ULTRASOUND",
  );

  return (
    <Card className="rounded-[28px]">
      <h2 className="mb-4 text-lg font-semibold">Create OPD Visit</h2>
      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3">
        <Select label="OPD Service" value={form.visitPurpose} onChange={(e) => onFormChange({ ...form, visitPurpose: e.target.value as VisitFormState["visitPurpose"] })}>
          <option value="CONSULTATION">Consultation</option>
          <option value="LAB_ONLY">Labs Only</option>
        </Select>

        <Select label="Patient Mode" value={patientMode} onChange={(e) => onPatientModeChange(e.target.value as "existing" | "new")}>
          <option value="existing">Existing Patient</option>
          <option value="new">New Patient</option>
        </Select>

        {patientMode === "existing" ? (
          <Select label="Select Patient" value={form.patientId} onChange={(e) => onFormChange({ ...form, patientId: e.target.value })} required>
            <option value="">Choose patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>{patient.name} ({patient.phone})</option>
            ))}
          </Select>
        ) : (
          <Input label="New Patient Name" value={form.newName} onChange={(e) => onFormChange({ ...form, newName: e.target.value })} required />
        )}

        {form.visitPurpose === "CONSULTATION" ? (
          <Select
            label="Doctor"
            value={form.doctorId}
            onChange={(e) => onFormChange({ ...form, doctorId: e.target.value })}
            required
          >
            <option value="">Assign doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
            ))}
          </Select>
        ) : (
          <Select
            label="Labs / Radiology"
            value={form.selectedCatalogItemId}
            onChange={(e) => {
              const selectedItem = labServices.find((item) => item.id === e.target.value);
              onFormChange({
                ...form,
                selectedCatalogItemId: e.target.value,
                reason: selectedItem?.name ?? "",
                consultationFee: selectedItem ? String(selectedItem.price) : "0",
              });
            }}
            required
          >
            <option value="">Choose service</option>
            {labServices.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - Rs {item.price.toFixed(2)}
              </option>
            ))}
          </Select>
        )}

        <Input
          label={form.visitPurpose === "LAB_ONLY" ? "Selected Service Cost" : "Consultation Fee"}
          type="number"
          min={0}
          prefix="Rs"
          value={form.visitPurpose === "LAB_ONLY" ? form.consultationFee : form.consultationFee}
          onChange={(e) => onFormChange({ ...form, consultationFee: e.target.value })}
          disabled={form.visitPurpose === "LAB_ONLY" && Boolean(form.selectedCatalogItemId)}
          required={form.visitPurpose !== "LAB_ONLY"}
        />
        <Input label="Scheduled Date" type="date" value={form.scheduledAt} onChange={(e) => onFormChange({ ...form, scheduledAt: e.target.value })} />
        <Input
          label="Reason"
          placeholder={form.visitPurpose === "LAB_ONLY" ? "Selected automatically from lab service" : undefined}
          value={form.reason}
          onChange={(e) => onFormChange({ ...form, reason: e.target.value })}
          readOnly={form.visitPurpose === "LAB_ONLY"}
        />

        {patientMode === "new" ? (
          <>
            <Input label="Age" type="number" min={0} value={form.newAge} onChange={(e) => onFormChange({ ...form, newAge: e.target.value })} />
            <Select label="Gender" value={form.newGender} onChange={(e) => onFormChange({ ...form, newGender: e.target.value as VisitFormState["newGender"] })}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
            <Input label="Phone" value={form.newPhone} onChange={(e) => onFormChange({ ...form, newPhone: e.target.value })} required />
            <Input label="Address" value={form.newAddress} onChange={(e) => onFormChange({ ...form, newAddress: e.target.value })} required />
            <Input label="ID Proof" value={form.newIdProof} onChange={(e) => onFormChange({ ...form, newIdProof: e.target.value })} />
          </>
        ) : null}

        <div className="md:col-span-3">
          <Button type="submit" disabled={saving}>
            {saving
              ? "Creating..."
              : form.visitPurpose === "LAB_ONLY"
                ? "Print Bill"
                : "Create Visit & Print Bill"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
