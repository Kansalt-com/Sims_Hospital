import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { doctorApi } from "../../api/services";
import { getErrorMessage } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/ui/Loader";
import type { DoctorProfile, User } from "../../types";

type DoctorRow = User & {
  active: boolean;
  doctorProfile?: DoctorProfile | null;
};

const emptyForm = {
  fullName: "",
  qualification: "",
  specialization: "",
  experienceYears: "0",
  registrationNumber: "",
  phone: "",
  email: "",
  username: "",
  password: "",
};

export const DoctorsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<DoctorRow[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [form, setForm] = useState(emptyForm);

  const load = async (search = query) => {
    setLoading(true);
    try {
      const res = await doctorApi.list({ q: search });
      setRows(res.data.data as DoctorRow[]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        experienceYears: Number(form.experienceYears || 0),
        registrationNumber: form.registrationNumber || null,
        phone: form.phone || null,
        email: form.email || null,
        password: form.password || undefined,
      };

      if (editingId) {
        await doctorApi.update(editingId, payload);
        toast.success("Doctor updated");
      } else {
        await doctorApi.create({
          ...payload,
          password: form.password,
        });
        toast.success("Doctor added");
      }

      resetForm();
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row: DoctorRow) => {
    setEditingId(row.id);
    setForm({
      fullName: row.name || "",
      qualification: row.doctorProfile?.qualification || "",
      specialization: row.doctorProfile?.specialization || "",
      experienceYears: String(row.doctorProfile?.experienceYears ?? 0),
      registrationNumber: row.doctorProfile?.registrationNumber || "",
      phone: row.doctorProfile?.phone || "",
      email: row.doctorProfile?.email || "",
      username: row.username || "",
      password: "",
    });
  };

  const toggleStatus = async (row: DoctorRow) => {
    try {
      await doctorApi.update(row.id, { active: !row.active });
      toast.success(row.active ? "Doctor disabled" : "Doctor enabled");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (statusFilter === "ACTIVE") return row.active;
        if (statusFilter === "INACTIVE") return !row.active;
        return true;
      }),
    [rows, statusFilter],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Doctors</h1>
        <p className="text-sm text-slate-500">Add, edit, and control active doctor profiles and credentials.</p>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit Doctor" : "Add Doctor"}</h2>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <Input label="Full Name" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} required />
          <Input label="Qualification" value={form.qualification} onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))} required />
          <Input label="Specialization" value={form.specialization} onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))} required />
          <Input
            label="Experience (years)"
            type="number"
            min={0}
            inputMode="numeric"
            value={form.experienceYears}
            onChange={(e) => setForm((p) => ({ ...p, experienceYears: e.target.value }))}
            required
          />
          <Input label="License No. (optional)" value={form.registrationNumber} onChange={(e) => setForm((p) => ({ ...p, registrationNumber: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          <Input label="Username" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} required />
          <Input label={editingId ? "New Password (optional)" : "Password"} type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required={!editingId} />

          <div className="md:col-span-3 flex flex-wrap gap-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Doctor" : "Add Doctor"}</Button>
            <Button variant="secondary" type="button" onClick={resetForm}>Reset</Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-3 flex gap-2">
          <Input className="max-w-sm" placeholder="Search doctor / specialization" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select
            className="rounded-[6px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <Button onClick={() => load(query)}>Search</Button>
          <Button variant="secondary" onClick={() => { setQuery(""); setStatusFilter("ALL"); load(""); }}>Reset</Button>
        </div>

        {loading ? <Loader /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Qualification</th>
                  <th className="py-2">Specialization</th>
                  <th className="py-2">Experience</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.username}</p>
                    </td>
                    <td className="py-3">{row.doctorProfile?.qualification || "-"}</td>
                    <td className="py-3">{row.doctorProfile?.specialization || "-"}</td>
                    <td className="py-3">{row.doctorProfile?.experienceYears ?? 0} years</td>
                    <td className="py-3">{row.doctorProfile?.phone || "-"}</td>
                    <td className="py-3">{row.active ? "Active" : "Inactive"}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" className="h-9 px-3 py-1 text-xs" onClick={() => startEdit(row)}>Edit</Button>
                        <Button variant="secondary" className="h-9 px-3 py-1 text-xs" onClick={() => toggleStatus(row)}>{row.active ? "Disable" : "Enable"}</Button>
                      </div>
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
