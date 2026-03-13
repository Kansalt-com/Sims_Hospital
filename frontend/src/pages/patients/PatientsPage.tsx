import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import { patientApi } from "../../api/services";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/ui/Loader";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import type { Patient } from "../../types";
import { formatDateTime } from "../../utils/format";

type PatientForm = {
  name: string;
  age: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  patientType: "OPD" | "IPD";
  phone: string;
  address: string;
  idProof: string;
};

const defaultForm: PatientForm = {
  name: "",
  age: "",
  gender: "MALE",
  patientType: "OPD",
  phone: "",
  address: "",
  idProof: "",
};

export const PatientsPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState<PatientForm>(defaultForm);

  const canEdit = useMemo(() => user?.role === "ADMIN" || user?.role === "RECEPTION", [user?.role]);

  const load = async (nextPage = page, query = search) => {
    setLoading(true);
    try {
      const res = await patientApi.list({ page: nextPage, pageSize: 10, q: query });
      setRows(res.data.data);
      setTotalPages(res.data.pagination.totalPages || 1);
      setPage(nextPage);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, "");
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditing(null);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
        phone: form.phone,
        address: form.address,
        idProof: form.idProof || null,
      };

      if (editing) {
        await patientApi.update(editing.id, payload);
        toast.success("Patient updated");
      } else {
        await patientApi.create(payload);
        toast.success(`Patient registered for ${form.patientType}`);
      }

      resetForm();
      setFormOpen(false);
      await load(page, search);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const onArchive = async (id: number) => {
    if (!confirm("Archive this patient?")) {
      return;
    }

    try {
      await patientApi.archive(id);
      toast.success("Patient archived");
      await load(page, search);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const startEdit = (patient: Patient) => {
    setEditing(patient);
    setForm({
      name: patient.name,
      age: patient.age ? String(patient.age) : "",
      gender: patient.gender,
      patientType: "OPD",
      phone: patient.phone,
      address: patient.address,
      idProof: patient.idProof ?? "",
    });
    setFormOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Patient Management</h1>
          <p className="text-sm text-slate-500">Search and maintain complete patient records.</p>
        </div>
        {canEdit ? (
          <Button
            onClick={() => {
              resetForm();
              setFormOpen((prev) => !prev);
            }}
          >
            {formOpen ? "Close Form" : "+ New Patient"}
          </Button>
        ) : null}
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          <Input
            className="max-w-sm"
            placeholder="Search by name / phone / MRN"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => load(1, search)}>Search</Button>
          <Button variant="secondary" onClick={() => {
            setSearch("");
            load(1, "");
          }}>
            Reset
          </Button>
        </div>
      </Card>

      {formOpen ? (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">{editing ? "Edit Patient" : "Register New Patient"}</h2>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              required
            />
            <Input
              label="Age"
              type="number"
              min={0}
              value={form.age}
              onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
            />
            <Select
              label="Gender"
              value={form.gender}
              onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value as PatientForm["gender"] }))}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
            <Select
              label="Patient Type"
              value={form.patientType}
              onChange={(e) => setForm((prev) => ({ ...prev, patientType: e.target.value as PatientForm["patientType"] }))}
            >
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
            </Select>
            <Input
              label="ID Proof (optional)"
              value={form.idProof}
              onChange={(e) => setForm((prev) => ({ ...prev, idProof: e.target.value }))}
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              required
            />
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Register"}</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  resetForm();
                  setFormOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        {loading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState text="No patients found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">MRN</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Gender</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-3 font-medium">{row.mrn}</td>
                    <td className="py-3">{row.name}</td>
                    <td className="py-3">{row.phone}</td>
                    <td className="py-3">{row.gender}</td>
                    <td className="py-3">{formatDateTime(row.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/patients/${row.id}`}>
                          <Button variant="secondary" className="h-8 px-3 py-1 text-xs">View</Button>
                        </Link>
                        {canEdit ? (
                          <>
                            <Button variant="ghost" className="h-8 px-3 py-1 text-xs" onClick={() => startEdit(row)}>
                              Edit
                            </Button>
                            <Button variant="danger" className="h-8 px-3 py-1 text-xs" onClick={() => onArchive(row.id)}>
                              Archive
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => load(page - 1, search)}>Prev</Button>
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => load(page + 1, search)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
