import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/client";
import { visitApi } from "../../api/services";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/ui/Loader";
import { formatDate } from "../../utils/format";

export const PrescriptionPage = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const load = async (search = query) => {
    setLoading(true);
    try {
      const res = await visitApi.list({ page: 1, pageSize: 100, date: today, type: "OPD", q: search });
      const eligible = res.data.data.filter((visit) => visit.invoice);
      setRows(eligible);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Prescription Sheets</h1>
        <p className="text-sm text-slate-500">Available once an OPD bill exists. Designed for quick print or download after billing.</p>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap gap-2">
          <Input className="max-w-sm" placeholder="Search patient / MRN" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button onClick={() => load(query)}>Search</Button>
          <Button variant="secondary" onClick={() => { setQuery(""); load(""); }}>Reset</Button>
        </div>

        {loading ? <Loader /> : rows.length === 0 ? <EmptyState text="No billed OPD visits found for prescription printing." /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Visit</th>
                  <th className="py-2">Patient</th>
                  <th className="py-2">Doctor</th>
                  <th className="py-2">Billing</th>
                  <th className="py-2">Prescription</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <p className="font-medium">#{row.id}</p>
                      <p className="text-xs text-slate-500">{formatDate(row.scheduledAt)}</p>
                    </td>
                    <td className="py-3">
                      <p className="font-medium">{row.patient.name}</p>
                      <p className="text-xs text-slate-500">MRN: {row.patient.mrn}</p>
                    </td>
                    <td className="py-3">
                      <p>Dr. {row.doctor.name}</p>
                      <p className="text-xs text-slate-500">{row.doctor?.doctorProfile?.qualification || ""}</p>
                    </td>
                    <td className="py-3">
                      <Badge tone="success">
                        Bill Available
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge tone={row.prescription ? "success" : "default"}>{row.prescription ? "Generated" : "Ready to Print"}</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {row.invoice ? (
                          <Link to={`/invoices/${row.invoice.id}/print`}>
                            <Button variant="ghost" className="h-8 px-3 py-1 text-xs">Print Bill</Button>
                          </Link>
                        ) : null}
                        <Link to={`/prescriptions/${row.id}/print`}>
                          <Button variant="secondary" className="h-8 px-3 py-1 text-xs">Print Prescription</Button>
                        </Link>
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
