import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormSection } from "../../components/ui/FormSection";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { formatCurrency, formatVisitDate } from "../../utils/format";
import type {
  BillingErrors,
  CatalogSelection,
  DraftBillingItem,
  ExistingInvoiceSummary,
  PaymentFormState,
  VisitOption,
} from "./invoiceTypes";

type InvoiceBillingFormProps = {
  visitId: string;
  visits: VisitOption[];
  selectedVisit: VisitOption | null;
  existingInvoice: ExistingInvoiceSummary | null;
  errors: BillingErrors;
  draftItems: DraftBillingItem[];
  payment: PaymentFormState;
  notes: string;
  totalAmount: number;
  saving: boolean;
  lastCreatedInvoiceId?: number | null;
  catalogSelection: CatalogSelection;
  catalogItems: Array<{ id: string; name: string; price: number; source: string; editablePrice?: boolean }>;
  onVisitChange: (value: string) => void;
  onCatalogSelectionChange: (value: CatalogSelection) => void;
  onAddCatalogItem: () => void;
  onAddCustomItem: () => void;
  onDraftItemChange: (id: string, patch: Partial<DraftBillingItem>) => void;
  onRemoveDraftItem: (id: string) => void;
  onPaymentChange: (value: PaymentFormState) => void;
  onNotesChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onReset: () => void;
};

const itemCategories = ["CONSULTATION", "LAB", "RADIOLOGY", "PROCEDURE", "MEDICINE", "MISC"] as const;

const categoryLabels: Record<(typeof itemCategories)[number], string> = {
  CONSULTATION: "Consultation",
  LAB: "Labs",
  RADIOLOGY: "Radiology",
  PROCEDURE: "Procedure",
  MEDICINE: "Medicine",
  MISC: "Misc",
};

export const InvoiceBillingForm = ({
  visitId,
  visits,
  selectedVisit,
  existingInvoice,
  errors,
  draftItems,
  payment,
  notes,
  totalAmount,
  saving,
  lastCreatedInvoiceId,
  catalogSelection,
  catalogItems,
  onVisitChange,
  onCatalogSelectionChange,
  onAddCatalogItem,
  onAddCustomItem,
  onDraftItemChange,
  onRemoveDraftItem,
  onPaymentChange,
  onNotesChange,
  onSubmit,
  onReset,
}: InvoiceBillingFormProps) => {
  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-5">
        <FormSection title="Patient Information" description="Select the visit or admission bill you want to work on. Existing visit invoices can be updated with additional charges.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Select label="Visit" value={visitId} onChange={(event) => onVisitChange(event.target.value)} error={errors.visitId} required>
              <option value="">Choose patient visit</option>
              {visits.map((visit) => (
                <option key={visit.id} value={visit.id}>
                  #{visit.id} - {visit.patient.name} - Dr. {visit.doctor.name}
                  {visit.invoice ? ` - Bill ${visit.invoice.invoiceNo}` : ""}
                </option>
              ))}
            </Select>
            <Input label="Patient Name" placeholder="Selected automatically" value={selectedVisit?.patient.name ?? ""} readOnly />
            <Input label="Doctor Name" placeholder="Selected automatically" value={selectedVisit ? `Dr. ${selectedVisit.doctor.name}` : ""} readOnly />
            <Input label="Date" placeholder="Visit date" value={selectedVisit ? formatVisitDate(selectedVisit.scheduledAt, selectedVisit.type) : ""} readOnly />
          </div>

          {existingInvoice ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900">
              <p className="font-semibold">Existing bill detected: {existingInvoice.invoiceNo}</p>
              <p className="mt-1">
                Total {formatCurrency(existingInvoice.total)} | Paid {formatCurrency(existingInvoice.paidAmount)} | Due {formatCurrency(existingInvoice.dueAmount)}
              </p>
            </div>
          ) : null}
        </FormSection>

        <FormSection title="Service Catalog" description="Pick charges from the SIMS price master for labs, X-ray, ultrasound, wards, bed charges, and OT packages.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Select
              label="Department"
              value={catalogSelection.department}
              onChange={(event) =>
                onCatalogSelectionChange({
                  ...catalogSelection,
                  department: event.target.value as CatalogSelection["department"],
                  itemId: "",
                })
              }
            >
              <option value="LAB">Labs</option>
              <option value="XRAY">X-Ray</option>
              <option value="ULTRASOUND">Ultrasound</option>
              <option value="OT">OT / Package</option>
              <option value="BED">Bed Charges</option>
              <option value="WARD">Ward Procedures</option>
              <option value="OPD">OPD Charges</option>
              <option value="IPD">IP Doctor Charges</option>
            </Select>

            <Select
              label="Catalog Item"
              value={catalogSelection.itemId}
              onChange={(event) => onCatalogSelectionChange({ ...catalogSelection, itemId: event.target.value })}
            >
              <option value="">Choose service</option>
              {catalogItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {formatCurrency(item.price)}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" onClick={onAddCatalogItem} disabled={!catalogSelection.itemId}>
              Add Catalog Charge
            </Button>
            <Button type="button" variant="secondary" onClick={onAddCustomItem}>
              Add Custom Charge
            </Button>
          </div>
        </FormSection>

        <FormSection title="Bill Items" description="Add or edit charges freely before collecting payment.">
          {draftItems.length === 0 ? (
            <p className="text-sm text-slate-500">No charges added yet.</p>
          ) : (
            <div className="space-y-3">
              {draftItems.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <Input
                      label="Charge Name"
                      value={item.name}
                      onChange={(event) => onDraftItemChange(item.id, { name: event.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Select
                      label="Category"
                      value={item.category}
                      onChange={(event) =>
                        onDraftItemChange(item.id, {
                          category: event.target.value as DraftBillingItem["category"],
                        })
                      }
                    >
                      {itemCategories.map((category) => (
                        <option key={category} value={category}>
                          {categoryLabels[category]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Qty"
                      inputMode="decimal"
                      value={item.qty}
                      onChange={(event) => onDraftItemChange(item.id, { qty: event.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Rate"
                      inputMode="decimal"
                      prefix="Rs"
                      value={item.unitPrice}
                      onChange={(event) => onDraftItemChange(item.id, { unitPrice: event.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <Button type="button" variant="danger" className="w-full" onClick={() => onRemoveDraftItem(item.id)}>
                      Remove
                    </Button>
                  </div>
                  <div className="md:col-span-12 text-xs text-slate-500">
                    {item.source ? `Source: ${item.source}` : "Custom charge"} | Line total{" "}
                    {formatCurrency(Number(item.qty || 0) * Number(item.unitPrice || 0))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {errors.items ? <p className="mt-3 text-sm font-medium text-red-600">{errors.items}</p> : null}
        </FormSection>

        <FormSection title="Payment" description="Leave paid amount at 0 to collect later.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            <Select
              label="Payment Mode"
              value={payment.paymentMode}
              onChange={(event) => onPaymentChange({ ...payment, paymentMode: event.target.value as PaymentFormState["paymentMode"] })}
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="INSURANCE">Insurance</option>
            </Select>
            <Input
              label="Paid Amount"
              placeholder="Enter amount or leave 0"
              inputMode="decimal"
              prefix="Rs"
              value={payment.amount}
              error={errors.paymentAmount}
              onChange={(event) => onPaymentChange({ ...payment, amount: event.target.value })}
            />
            <Input
              label="Reference Number"
              placeholder="Optional transaction reference"
              value={payment.referenceNo}
              onChange={(event) => onPaymentChange({ ...payment, referenceNo: event.target.value })}
            />
            <Textarea
              label="Notes"
              className="min-h-[88px]"
              placeholder="Optional billing note, package note, surgery note, or billing remark"
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
            />
          </div>
        </FormSection>

        <FormSection title="Total" description="Totals are calculated from the charge lines being added right now.">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Charge Addition Total" placeholder="Calculated automatically" value={formatCurrency(totalAmount)} readOnly />
          </div>
        </FormSection>

        <FormSection title="Actions" description="Create a new bill or append these charges to the existing bill.">
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : existingInvoice ? "Add Charges to Bill" : "Create Bill"}
            </Button>
            <Button variant="secondary" onClick={onReset}>Clear Form</Button>
            {lastCreatedInvoiceId ? (
              <Link to={`/invoices/${lastCreatedInvoiceId}/print`}>
                <Button variant="ghost">Print Invoice</Button>
              </Link>
            ) : null}
          </div>
        </FormSection>
      </form>
    </Card>
  );
};
