import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import type { InvoiceListItem, PaymentFormState } from "./invoiceTypes";

type PaymentModalProps = {
  invoice: InvoiceListItem | null;
  payment: PaymentFormState;
  saving: boolean;
  onClose: () => void;
  onChange: (value: PaymentFormState) => void;
  onSubmit: () => void;
};

export const PaymentModal = ({ invoice, payment, saving, onClose, onChange, onSubmit }: PaymentModalProps) => {
  if (!invoice) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">Collect Payment</h2>
          <p className="mt-1 text-sm text-slate-500">
            {invoice.invoiceNo} for {invoice.visit.patient.name}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Payment Mode"
            value={payment.paymentMode}
            onChange={(event) => onChange({ ...payment, paymentMode: event.target.value as PaymentFormState["paymentMode"] })}
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="INSURANCE">Insurance</option>
          </Select>
          <Input
            label="Amount"
            placeholder="Enter payment amount"
            inputMode="decimal"
            prefix="Rs"
            value={payment.amount}
            onChange={(event) => onChange({ ...payment, amount: event.target.value })}
          />
          <Input
            className="md:col-span-2"
            label="Reference Number"
            placeholder="Optional transaction reference"
            value={payment.referenceNo}
            onChange={(event) => onChange({ ...payment, referenceNo: event.target.value })}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} loading={saving}>Collect Payment</Button>
        </div>
      </div>
    </div>
  );
};
