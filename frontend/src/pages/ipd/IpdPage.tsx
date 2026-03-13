import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/client";
import { doctorApi, ipdApi, patientApi, roomApi } from "../../api/services";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/ui/Loader";
import { Select } from "../../components/ui/Select";
import type { IPDAdmission, Patient, Room, User } from "../../types";
import { formatDateTime } from "../../utils/format";

export const IpdPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<IPDAdmission[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Array<User & { active?: boolean }>>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    patientId: "",
    attendingDoctorId: "",
    roomId: "",
    bedId: "",
    ward: "General",
    room: "101",
    bed: "A",
    diagnosis: "",
    reason: "",
    admittedAt: "",
  });

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const selectedRoom = useMemo(() => rooms.find((room) => String(room.id) === form.roomId), [rooms, form.roomId]);
  const availableBeds = useMemo(
    () => (selectedRoom?.beds ?? []).filter((bed) => bed.status === "AVAILABLE" || bed.status === "RESERVED"),
    [selectedRoom],
  );

  const load = async () => {
    setLoading(true);
    try {
      const [ipdRes, patientRes, doctorRes, roomRes] = await Promise.all([
        ipdApi.list({ q: query, status: statusFilter || undefined, date: today, page: 1, pageSize: 40 }),
        patientApi.list({ page: 1, pageSize: 200, q: "" }),
        doctorApi.list({ active: true }),
        roomApi.list(),
      ]);
      setRows(ipdRes.data.data);
      setPatients(patientRes.data.data);
      setDoctors(doctorRes.data.data);
      setRooms(roomRes.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;
    setForm((prev) => ({
      ...prev,
      ward: selectedRoom.ward,
      room: selectedRoom.name,
      bed: availableBeds.find((bed) => String(bed.id) === prev.bedId)?.bedNumber ?? prev.bed,
    }));
  }, [selectedRoom, availableBeds]);

  const createAdmission = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const selectedBed = availableBeds.find((bed) => String(bed.id) === form.bedId);
      await ipdApi.create({
        patientId: Number(form.patientId),
        attendingDoctorId: Number(form.attendingDoctorId),
        roomId: form.roomId ? Number(form.roomId) : undefined,
        bedId: form.bedId ? Number(form.bedId) : undefined,
        ward: form.ward,
        room: form.room,
        bed: selectedBed?.bedNumber ?? form.bed,
        diagnosis: form.diagnosis || undefined,
        reason: form.reason || undefined,
        admittedAt: form.admittedAt ? new Date(form.admittedAt).toISOString() : undefined,
      });
      toast.success("IPD admission created");
      setForm((prev) => ({ ...prev, diagnosis: "", reason: "", admittedAt: "" }));
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (row: IPDAdmission, status: IPDAdmission["status"]) => {
    try {
      if (status === "DISCHARGED") {
        await ipdApi.discharge(row.id);
        toast.success("Patient discharged");
      } else {
        await ipdApi.update(row.id, { status });
        toast.success("IPD status updated");
      }
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">IPD Admissions</h1>
        <p className="text-sm text-slate-500">Manage inpatient admissions, assign real beds, and complete discharge workflow without oversubscribing inventory.</p>
      </div>

      <Card className="rounded-[28px]">
        <h2 className="mb-4 text-lg font-semibold">New IPD Admission</h2>
        <form onSubmit={createAdmission} className="grid gap-3 md:grid-cols-3">
          <Select label="Patient" value={form.patientId} onChange={(e) => setForm((p) => ({ ...p, patientId: e.target.value }))} required>
            <option value="">Select patient</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>)}
          </Select>
          <Select label="Attending Doctor" value={form.attendingDoctorId} onChange={(e) => setForm((p) => ({ ...p, attendingDoctorId: e.target.value }))} required>
            <option value="">Select doctor</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Input label="Admitted At" type="datetime-local" value={form.admittedAt} onChange={(e) => setForm((p) => ({ ...p, admittedAt: e.target.value }))} />
          <Select label="Room" value={form.roomId} onChange={(e) => setForm((p) => ({ ...p, roomId: e.target.value, bedId: "" }))}>
            <option value="">Select room</option>
            {rooms.map((room) => <option key={room.id} value={room.id}>{room.ward} / {room.name}</option>)}
          </Select>
          <Select label="Bed" value={form.bedId} onChange={(e) => setForm((p) => ({ ...p, bedId: e.target.value }))}>
            <option value="">Select bed</option>
            {availableBeds.map((bed) => <option key={bed.id} value={bed.id}>{bed.bedNumber} ({bed.status})</option>)}
          </Select>
          <Input label="Ward" value={form.ward} onChange={(e) => setForm((p) => ({ ...p, ward: e.target.value }))} required />
          <Input label="Room Label" value={form.room} onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))} required />
          <Input label="Bed Label" value={form.bed} onChange={(e) => setForm((p) => ({ ...p, bed: e.target.value }))} required />
          <Input label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm((p) => ({ ...p, diagnosis: e.target.value }))} />
          <Input label="Reason for Admission" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} />
          <div className="md:col-span-3">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Admit Patient"}</Button>
          </div>
        </form>
      </Card>

      <Card className="rounded-[28px]">
        <div className="mb-4 flex flex-wrap gap-2">
          <Input className="max-w-sm" placeholder="Search patient/MRN/ward/room/bed" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All status</option>
            <option value="ADMITTED">Admitted</option>
            <option value="UNDER_TREATMENT">Under Treatment</option>
            <option value="RECOVERED">Recovered</option>
            <option value="DISCHARGED">Discharged</option>
          </Select>
          <Button onClick={load}>Apply</Button>
        </div>

        {loading ? <Loader /> : rows.length === 0 ? <EmptyState text="No IPD records found." /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Patient</th>
                  <th className="py-2">Doctor</th>
                  <th className="py-2">Ward/Room/Bed</th>
                  <th className="py-2">Admitted</th>
                  <th className="py-2">Billing</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <p className="font-medium">{row.patient.name}</p>
                      <p className="text-xs text-slate-500">{row.patient.mrn}</p>
                    </td>
                    <td className="py-3">Dr. {row.attendingDoctor.name}</td>
                    <td className="py-3">{row.ward} / {row.room} / {row.bed}</td>
                    <td className="py-3">{formatDateTime(row.admittedAt)}</td>
                    <td className="py-3">
                      {row.visit?.invoice ? (
                        <Badge tone={row.visit.invoice.paymentStatus === "PAID" ? "success" : "warning"}>{row.visit.invoice.paymentStatus}</Badge>
                      ) : (
                        <span className="text-xs text-slate-500">Pending billing</span>
                      )}
                    </td>
                    <td className="py-3">
                      <Select
                        value={row.status}
                        disabled={row.status === "DISCHARGED"}
                        onChange={(event) => updateStatus(row, event.target.value as IPDAdmission["status"])}
                        className="min-w-[180px]"
                      >
                        <option value="ADMITTED">Admitted</option>
                        <option value="UNDER_TREATMENT">Under Treatment</option>
                        <option value="RECOVERED">Recovered</option>
                        <option value="DISCHARGED">Discharged</option>
                      </Select>
                    </td>
                    <td className="py-3">
                      {row.status === "DISCHARGED" ? (
                        <span className="text-xs text-slate-500">Discharged {row.dischargedAt ? formatDateTime(row.dischargedAt) : ""}</span>
                      ) : (
                        <Badge tone={row.status === "RECOVERED" ? "success" : "warning"}>{row.status.split("_").join(" ")}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
