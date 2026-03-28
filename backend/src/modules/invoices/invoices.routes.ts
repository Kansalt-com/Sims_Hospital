import { Router } from "express";
import { authenticate, authorize, authorizePermission, type AuthenticatedRequest } from "../../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  addInvoiceItems,
  addInvoicePayments,
  cancelInvoice,
  createInvoice,
  getInvoiceById,
  listCancelledInvoices,
  listInvoices,
} from "./invoices.service.js";
import {
  addPaymentSchema,
  appendInvoiceItemsSchema,
  createInvoiceSchema,
  idParamsSchema,
  listQuerySchema,
  type AddInvoicePaymentsInput,
  type AppendInvoiceItemsInput,
  type CreateInvoiceInput,
  type InvoiceListQuery,
} from "./invoices.validation.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validateQuery(listQuerySchema),
  asyncHandler(async (req, res) => {
    const result = await listInvoices(req.query as InvoiceListQuery);
    res.json(result);
  }),
);

router.get(
  "/cancelled",
  authorizePermission("billing:cancel"),
  asyncHandler(async (_req, res) => {
    const result = await listCancelledInvoices();
    res.json(result);
  }),
);

router.get(
  "/:id",
  validateParams(idParamsSchema),
  asyncHandler(async (req, res) => {
    const result = await getInvoiceById(Number((req.params as { id: string }).id));
    res.json(result);
  }),
);

router.delete(
  "/:id",
  authorizePermission("billing:cancel"),
  validateParams(idParamsSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await cancelInvoice(Number((req.params as { id: string }).id), req);
    res.json(result);
  }),
);

router.post(
  "/",
  authorize("ADMIN", "RECEPTION", "BILLING", "PHARMACY"),
  validateBody(createInvoiceSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const invoice = await createInvoice(req.body as CreateInvoiceInput, req);
    res.status(201).json({ data: invoice });
  }),
);

router.post(
  "/:id/items",
  authorize("ADMIN", "RECEPTION", "BILLING", "PHARMACY"),
  validateParams(idParamsSchema),
  validateBody(appendInvoiceItemsSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const updated = await addInvoiceItems(
      Number((req.params as { id: string }).id),
      req.body as AppendInvoiceItemsInput,
      req,
    );
    res.status(201).json({ data: updated });
  }),
);

router.post(
  "/:id/payments",
  authorize("ADMIN", "RECEPTION", "BILLING", "PHARMACY"),
  validateParams(idParamsSchema),
  validateBody(addPaymentSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const updated = await addInvoicePayments(
      Number((req.params as { id: string }).id),
      req.body as AddInvoicePaymentsInput,
      req,
    );
    res.status(201).json({ data: updated });
  }),
);

export const invoicesRouter = router;
