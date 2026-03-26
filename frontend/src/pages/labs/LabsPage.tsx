import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useServiceCatalog, type EditableServiceCatalogItem } from "../../hooks/useServiceCatalog";
import type { ServiceDepartment } from "../../data/serviceCatalog";
import { formatCurrency } from "../../utils/format";

const allowedDepartments: ServiceDepartment[] = ["LAB", "XRAY", "ULTRASOUND"];

const blankForm = {
  id: "",
  department: "LAB" as ServiceDepartment,
  name: "",
  price: "",
  editablePrice: false,
};

export const LabsPage = () => {
  const { catalog, upsertItem } = useServiceCatalog();
  const [department, setDepartment] = useState<ServiceDepartment>("LAB");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(blankForm);

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalog
      .filter((item) => item.department === department)
      .filter((item) => (normalized ? item.name.toLowerCase().includes(normalized) : true));
  }, [catalog, department, query]);

  const submit = () => {
    if (!form.name.trim() || Number(form.price || 0) < 0) {
      return;
    }

    upsertItem({
      id: form.id || undefined,
      department: form.department,
      name: form.name.trim(),
      price: Number(form.price || 0),
      invoiceType: "LAB",
      category: form.department === "XRAY" || form.department === "ULTRASOUND" ? "RADIOLOGY" : "LAB",
      source: "Labs Module",
      editablePrice: form.editablePrice,
      costBreakup: [],
      isCustom: !form.id,
    });
    setForm(blankForm);
  };

  const startEdit = (item: EditableServiceCatalogItem) => {
    setForm({
      id: item.id,
      department: item.department,
      name: item.name,
      price: String(item.price),
      editablePrice: Boolean(item.editablePrice),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Labs Module</h1>
        <p className="text-sm text-slate-500">Maintain lab, X-ray, and ultrasound tests here so billing can pick them up immediately.</p>
      </div>

      <Card className="rounded-[28px]">
        <div className="grid gap-4 md:grid-cols-3">
          <Select label="Department" value={department} onChange={(event) => setDepartment(event.target.value as ServiceDepartment)}>
            <option value="LAB">Lab Tests</option>
            <option value="XRAY">X-Ray</option>
            <option value="ULTRASOUND">Ultrasound</option>
          </Select>
          <Input
            label="Search Service"
            placeholder="Search by service name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex items-end gap-3">
            <Button type="button" variant="secondary" className="w-full" onClick={() => setForm({ ...blankForm, department })}>
              Add New Service
            </Button>
            <Link to="/invoices" className="w-full">
              <Button className="w-full">Billing Desk</Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 lg:grid-cols-2">
          <Select label="Service Type" value={form.department} onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value as ServiceDepartment }))}>
            <option value="LAB">Lab Test</option>
            <option value="XRAY">X-Ray</option>
            <option value="ULTRASOUND">Ultrasound</option>
          </Select>
          <Input label="Service Name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <Input
            label="Price"
            type="number"
            min={0}
            prefix="Rs"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
          />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.editablePrice}
              onChange={(event) => setForm((prev) => ({ ...prev, editablePrice: event.target.checked }))}
            />
            Allow price edit at billing time
          </label>
          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <Button type="button" onClick={submit}>
              {form.id ? "Update Service" : "Save Service"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(blankForm)}>
              Clear
            </Button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
          Showing {rows.length} priced services for {department === "LAB" ? "Lab Tests" : department === "XRAY" ? "X-Ray" : "Ultrasound"}.
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Service</th>
                <th className="py-2">Department</th>
                <th className="py-2">Price</th>
                <th className="py-2">Pricing Type</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="py-3">{item.department}</td>
                  <td className="py-3">{formatCurrency(item.price)}</td>
                  <td className="py-3">{item.editablePrice ? "Editable at billing time" : "Fixed price master"}</td>
                  <td className="py-3">
                    <Button type="button" variant="ghost" onClick={() => startEdit(item)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
