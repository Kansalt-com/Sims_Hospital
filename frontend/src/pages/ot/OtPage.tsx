import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { SERVICE_CATALOG } from "../../data/serviceCatalog";
import { formatCurrency } from "../../utils/format";

export const OtPage = () => {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return SERVICE_CATALOG.filter((item) => item.department === "OT").filter((item) =>
      normalized ? item.name.toLowerCase().includes(normalized) : true,
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">OT Module</h1>
        <p className="text-sm text-slate-500">Review surgery package pricing and OT-related bill heads. Use the Billing Desk to add these charges into an open bill for the patient.</p>
      </div>

      <Card className="rounded-[28px]">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Search OT Service"
            placeholder="Search surgery package or OT charge"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex items-end">
            <Link to="/invoices" className="w-full">
              <Button className="w-full">Open Billing Desk</Button>
            </Link>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
          Showing {rows.length} OT bill heads including surgery packages and editable OT billing items from the bill format.
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">OT Service</th>
                <th className="py-2">Price</th>
                <th className="py-2">Price Rule</th>
                <th className="py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="py-3">{formatCurrency(item.price)}</td>
                  <td className="py-3">{item.editablePrice ? "Editable at billing time" : "Fixed price master"}</td>
                  <td className="py-3 text-xs text-slate-500">{item.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
