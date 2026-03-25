import type { Invoice, Visit } from "../../types";
import type { ServiceCatalogItem, ServiceDepartment } from "../../data/serviceCatalog";

export type VisitOption = Pick<Visit, "id" | "type" | "scheduledAt" | "consultationFee" | "patient" | "doctor" | "invoice">;

export type PaymentMode = "CASH" | "UPI" | "CARD" | "INSURANCE";

export type PaymentFormState = {
  paymentMode: PaymentMode;
  amount: string;
  referenceNo: string;
};

export type BillingErrors = {
  visitId: string;
  items: string;
  paymentAmount: string;
};

export type InvoiceListItem = Invoice;

export type DraftBillingItem = {
  id: string;
  name: string;
  category: "CONSULTATION" | "LAB" | "PROCEDURE" | "MEDICINE" | "MISC";
  invoiceType: "OPD" | "IPD" | "PHARMACY" | "LAB" | "GENERAL";
  qty: string;
  unitPrice: string;
  source?: string;
  department?: ServiceDepartment;
  editablePrice?: boolean;
};

export type ExistingInvoiceSummary = Pick<Invoice, "id" | "invoiceNo" | "total" | "paidAmount" | "dueAmount" | "paymentStatus" | "invoiceType">;

export type CatalogSelection = {
  department: ServiceDepartment;
  itemId: string;
};

export type CatalogOption = ServiceCatalogItem;
