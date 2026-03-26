import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { useServiceCatalog, type EditableServiceCatalogItem } from "../../hooks/useServiceCatalog";
import { formatCurrency } from "../../utils/format";

const blankForm = {
  id: "",
  name: "",
  price: "",
  editablePrice: false,
  costBreakup: "",
};

export const OtPage = () => {
  const { catalog, upsertItem } = useServiceCatalog();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(blankForm);

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalog
      .filter((item) => item.department === "OT")
      .filter((item) => (normalized ? item.name.toLowerCase().includes(normalized) : true));
  }, [catalog, query]);

  const submit = () => {
    if (!form.name.trim() || Number(form.price || 0) < 0) {
      return;
    }

    upsertItem({
      id: form.id || undefined,
      department: "OT",
      name: form.name.trim(),
      price: Number(form.price || 0),
      invoiceType: "GENERAL",
      category: "PROCEDURE",
      source: "OT Module",
      editablePrice: form.editablePrice,
      costBreakup: form.costBreakup
        .split("\n")
        .map((part) => part.trim())
        .filter(Boolean),
      isCustom: !form.id,
    });
    setForm(blankForm);
  };

  const startEdit = (item: EditableServiceCatalogItem) => {
    setForm({
      id: item.id,
      name: item.name,
      price: String(item.price),
      editablePrice: Boolean(item.editablePrice),
      costBreakup: (item.costBreakup ?? []).join("\n"),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">OT Module</h1>
        <p className="text-sm text-slate-500">Manage OT packages, maintain cost breakup, and keep OT billing items editable from one place.</p>
      </div>

      <Card className="rounded-[28px]">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Search OT Service"
            placeholder="Search surgery package or OT charge"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex items-end">
            <Button className="w-full" type="button" variant="secondary" onClick={() => setForm(blankForm)}>
              Add New OT Package
            </Button>
          </div>
          <div className="flex items-end">
            <Link to="/invoices" className="w-full">
              <Button className="w-full">Billing Desk</Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 lg:grid-cols-2">
          <Input label="Package / OT Service" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
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
          <div className="text-sm text-slate-500">
            Cost breakup entered here is shown directly in the OT module so staff can explain the package components before billing.
          </div>
          <div className="lg:col-span-2">
            <Textarea
              label="Cost Breakup"
              className="min-h-[120px]"
              placeholder={"One item per line\nSurgeon Fees\nAnaesthetist Fees\nOT Assistant Charges"}
              value={form.costBreakup}
              onChange={(event) => setForm((prev) => ({ ...prev, costBreakup: event.target.value }))}
            />
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <Button type="button" onClick={submit}>
              {form.id ? "Update OT Package" : "Save OT Package"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(blankForm)}>
              Clear
            </Button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
          Showing {rows.length} OT items. Cost breakup can be edited per package, and new packages can be added anytime.
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">OT Service</th>
                <th className="py-2">Price</th>
                <th className="py-2">Price Rule</th>
                <th className="py-2">Cost Breakup</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 align-top">
                  <td className="py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="py-3">{formatCurrency(item.price)}</td>
                  <td className="py-3">{item.editablePrice ? "Editable at billing time" : "Fixed price master"}</td>
                  <td className="py-3 text-xs text-slate-600">
                    {(item.costBreakup ?? []).length ? (
                      <div className="space-y-1">
                        {(item.costBreakup ?? []).map((part) => (
                          <div key={`${item.id}-${part}`}>{part}</div>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
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
