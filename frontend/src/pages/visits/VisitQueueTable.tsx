import { useMemo, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/ui/Loader";
import { Select } from "../../components/ui/Select";
import { formatCurrency, formatDate } from "../../utils/format";
import type { VisitQueueItem } from "./visitTypes";

type VisitQueueTableProps = {
  rows: VisitQueueItem[];
  loading: boolean;
  query: string;
  pageError: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onRetry: () => void;
  onChangeStatus: (visitId: number, status: string) => void;
  onCreateBill: (visit: VisitQueueItem) => void;
  onPrintBill: (invoiceId: number) => void;
  onPrescription: (visitId: number) => void;
  onAdmitToIpd: (visit: VisitQueueItem) => void;
};

export const VisitQueueTable = ({
  rows,
  loading,
  query,
  pageError,
  onQueryChange,
  onSearch,
  onReset,
  onRetry,
  onChangeStatus,
  onCreateBill,
  onPrintBill,
  onPrescription,
  onAdmitToIpd,
}: VisitQueueTableProps) => {
  const [serviceFilter, setServiceFilter] = useState<"ALL" | "CONSULTATION" | "LAB_ONLY">("ALL");
  const [billingFilter, setBillingFilter] = useState<"ALL" | "BILLED" | "NOT_BILLED">("ALL");
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const serviceMatch =
          serviceFilter === "ALL"
            ? true
            : serviceFilter === "LAB_ONLY"
              ? Number(row.consultationFee || 0) <= 0
              : Number(row.consultationFee || 0) > 0;
        const billingMatch =
          billingFilter === "ALL"
            ? true
            : billingFilter === "BILLED"
              ? Boolean(row.invoice)
              : !row.invoice;
        return serviceMatch && billingMatch;
      }),
    [rows, serviceFilter, billingFilter],
  );

  return (
    <Card className="rounded-[28px]">
      <div className="mb-4 flex flex-wrap gap-2">
        <Input className="max-w-sm" label="Search Queue" placeholder="Search patient / phone / MRN" value={query} onChange={(e) => onQueryChange(e.target.value)} />
        <Select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value as "ALL" | "CONSULTATION" | "LAB_ONLY")}>
          <option value="ALL">All Services</option>
          <option value="CONSULTATION">Consultation</option>
          <option value="LAB_ONLY">Labs Only</option>
        </Select>
        <Select value={billingFilter} onChange={(e) => setBillingFilter(e.target.value as "ALL" | "BILLED" | "NOT_BILLED")}>
          <option value="ALL">All Billing</option>
          <option value="BILLED">Billed</option>
          <option value="NOT_BILLED">Not Billed</option>
        </Select>
        <div className="flex items-end gap-2">
          <Button onClick={onSearch}>Search</Button>
          <Button variant="secondary" onClick={() => { setServiceFilter("ALL"); setBillingFilter("ALL"); onReset(); }}>Reset</Button>
        </div>
      </div>

      {loading ? <Loader /> : pageError ? <EmptyState text={pageError} action={<Button onClick={onRetry}>Retry</Button>} /> : filteredRows.length === 0 ? <EmptyState text="No OPD visits found." /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Visit</th>
                <th className="py-2">Patient</th>
                <th className="py-2">Doctor</th>
                <th className="py-2">Fee</th>
                <th className="py-2">Billing</th>
                <th className="py-2">Date</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
              </thead>
              <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="py-3">#{row.id}</td>
                  <td className="py-3">
                    <p className="font-medium">{row.patient.name}</p>
                    <p className="text-xs text-slate-500">{row.patient.phone}</p>
                  </td>
                  <td className="py-3">Dr. {row.doctor.name}</td>
                  <td className="py-3">{formatCurrency(row.consultationFee)}</td>
                  <td className="py-3">
                    {row.invoice ? (
                      <Badge tone={row.invoice.paymentStatus === "PAID" ? "success" : row.invoice.paymentStatus === "PARTIAL" ? "warning" : "default"}>
                        {row.invoice.paymentStatus}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-500">Not billed</span>
                    )}
                  </td>
                  <td className="py-3">{formatDate(row.scheduledAt)}</td>
                  <td className="py-3">
                    <Badge tone={row.status === "COMPLETED" ? "success" : row.status === "IN_PROGRESS" ? "warning" : "default"}>{row.status}</Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      {row.status !== "IN_PROGRESS" ? <Button className="h-8 px-3 py-1 text-xs" variant="ghost" onClick={() => onChangeStatus(row.id, "IN_PROGRESS")}>Start</Button> : null}
                      {row.status !== "COMPLETED" ? <Button className="h-8 px-3 py-1 text-xs" variant="ghost" onClick={() => onChangeStatus(row.id, "COMPLETED")}>Complete</Button> : null}
                      {row.invoice ? (
                        <Button className="h-8 px-3 py-1 text-xs" variant="secondary" onClick={() => onPrintBill(row.invoice!.id)}>Print Bill</Button>
                      ) : (
                        <Button className="h-8 px-3 py-1 text-xs" variant="secondary" onClick={() => onCreateBill(row)}>Create Bill</Button>
                      )}
                      {row.invoice && Number(row.invoice.dueAmount || 0) <= 0 ? (
                        <Button className="h-8 px-3 py-1 text-xs" variant="ghost" onClick={() => onPrescription(row.id)}>Prescription</Button>
                      ) : null}
                      {!row.opdToIpdTransfer ? (
                        <Button className="h-8 px-3 py-1 text-xs" variant="secondary" onClick={() => onAdmitToIpd(row)}>
                          Admit to IPD
                        </Button>
                      ) : (
                        <Badge tone="success">Transferred</Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
