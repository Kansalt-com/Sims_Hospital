import { z } from "zod";
import {
  INVOICE_ITEM_CATEGORIES,
  INVOICE_TYPES,
  PAYMENT_MODES,
  PAYMENT_STATUSES,
} from "../../types/domain.js";

export const invoiceItemSchema = z.object({
  category: z.enum(INVOICE_ITEM_CATEGORIES).default("MISC"),
  name: z.string().min(1),
  qty: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  discount: z.number().nonnegative().optional().default(0),
  tax: z.number().nonnegative().optional().default(0),
});

export const paymentEntrySchema = z.object({
  amount: z.number().positive(),
  paymentMode: z.enum(PAYMENT_MODES),
  referenceNo: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  receivedAt: z.string().datetime().optional(),
});

export const createInvoiceSchema = z.object({
  visitId: z.number().int().positive(),
  invoiceType: z.enum(INVOICE_TYPES).default("OPD"),
  items: z.array(invoiceItemSchema).min(1),
  discount: z.number().nonnegative().optional().default(0),
  tax: z.number().nonnegative().optional().default(0),
  paymentMode: z.enum(PAYMENT_MODES).optional(),
  paidAmount: z.number().nonnegative().optional(),
  payments: z.array(paymentEntrySchema).optional(),
  notes: z.string().max(500).optional(),
});

export const addPaymentSchema = z.object({
  payments: z.array(paymentEntrySchema).min(1),
});

export const appendInvoiceItemsSchema = z.object({
  items: z.array(invoiceItemSchema).min(1),
  payments: z.array(paymentEntrySchema).optional(),
  notes: z.string().max(500).optional(),
});

export const listQuerySchema = z.object({
  q: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  date: z.string().optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  invoiceType: z.enum(INVOICE_TYPES).optional(),
});

export const idParamsSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type AddInvoicePaymentsInput = z.infer<typeof addPaymentSchema>;
export type AppendInvoiceItemsInput = z.infer<typeof appendInvoiceItemsSchema>;
export type InvoiceListQuery = z.infer<typeof listQuerySchema>;
