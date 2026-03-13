import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormSection } from "../../components/ui/FormSection";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import {
  BILLING_CHARGE_FIELDS,
  type BillingChargeState,
} from "../../utils/billing";
import { formatCurrency, formatDateTime } from "../../utils/format";
import type { BillingErrors, PaymentFormState, VisitOption } from "./invoiceTypes";

type InvoiceBillingFormProps = {
  visitId: string;
  visits: VisitOption[];
  selectedVisit: VisitOption | null;
  errors: BillingErrors;
  charges: BillingChargeState;
  payment: PaymentFormState;
  totalAmount: number;
  saving: boolean;
  lastCreatedInvoiceId?: number | null;
  onVisitChange: (value: string) => void;
  onChargeChange: (key: keyof BillingChargeState, value: string) => void;
  onPaymentChange: (value: PaymentFormState) => void;
  onSubmit: (event: React.FormEvent) => void;
  onReset: () => void;
};

export const InvoiceBillingForm = ({
  visitId,
  visits,
  selectedVisit,
  errors,
  charges,
  payment,
  totalAmount,
  saving,
  lastCreatedInvoiceId,
  onVisitChange,
  onChargeChange,
  onPaymentChange,
  onSubmit,
  onReset,
}: InvoiceBillingFormProps) => {
  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-5">
        <FormSection title="Patient Information" description="Select the visit and verify the basic patient details before billing.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Select label="Visit" value={visitId} onChange={(event) => onVisitChange(event.target.value)} error={errors.visitId} required>
              <option value="">Choose patient visit</option>
              {visits.map((visit) => (
                <option key={visit.id} value={visit.id}>
                  #{visit.id} - {visit.patient.name} - Dr. {visit.doctor.name}
                </option>
              ))}
            </Select>
            <Input label="Patient Name" placeholder="Selected automatically" value={selectedVisit?.patient.name ?? ""} readOnly />
            <Input label="Doctor Name" placeholder="Selected automatically" value={selectedVisit ? `Dr. ${selectedVisit.doctor.name}` : ""} readOnly />
            <Input label="Date" placeholder="Visit date" value={selectedVisit ? formatDateTime(selectedVisit.scheduledAt) : ""} readOnly />
          </div>
        </FormSection>

        <FormSection title="Charges" description="Enter only the essential hospital charges. Amounts are numeric and total is calculated automatically.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {BILLING_CHARGE_FIELDS.map((field) => (
              <Input
                key={field.key}
                label={field.label}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                inputMode="decimal"
                prefix="Rs"
                value={charges[field.key]}
                onChange={(event) => onChargeChange(field.key, event.target.value)}
              />
            ))}
          </div>
          {errors.charges ? <p className="mt-3 text-sm font-medium text-red-600">{errors.charges}</p> : null}
        </FormSection>

        <FormSection title="Payment" description="Select the payment mode to complete billing.">
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
              placeholder="Enter paid amount"
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
          </div>
        </FormSection>

        <FormSection title="Total" description="Total is calculated automatically from the selected charges.">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Total Amount" placeholder="Calculated automatically" value={formatCurrency(totalAmount)} readOnly />
          </div>
        </FormSection>

        <FormSection title="Actions" description="Generate and print the invoice once all values have been verified.">
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Generating Invoice..." : "Generate Invoice"}</Button>
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
