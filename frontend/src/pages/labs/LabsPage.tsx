import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { SERVICE_CATALOG, type ServiceDepartment } from "../../data/serviceCatalog";
import { formatCurrency } from "../../utils/format";

const allowedDepartments: ServiceDepartment[] = ["LAB", "XRAY", "ULTRASOUND"];

export const LabsPage = () => {
  const [department, setDepartment] = useState<ServiceDepartment>("LAB");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return SERVICE_CATALOG.filter((item) => item.department === department).filter((item) =>
      normalized ? item.name.toLowerCase().includes(normalized) : true,
    );
  }, [department, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Labs Module</h1>
        <p className="text-sm text-slate-500">Browse SIMS lab, X-ray, and ultrasound charges from the imported price master and then add them to an open bill from Billing.</p>
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
          <div className="flex items-end">
            <Link to="/invoices" className="w-full">
              <Button className="w-full">Open Billing Desk</Button>
            </Link>
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
                <th className="py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="py-3">{item.department}</td>
                  <td className="py-3">{formatCurrency(item.price)}</td>
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
