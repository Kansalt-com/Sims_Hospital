import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../../middleware/auth.js";
import { createRequestRateLimiter } from "../../middleware/requestRateLimit.js";
import { validateQuery } from "../../middleware/validate.js";
import { exportOperationalReportWorkbook, getDashboardSnapshot, getOperationalReports } from "../../services/reports.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();
const analyticsRateLimit = createRequestRateLimiter({
  key: "reports.analytics",
  windowMs: 60_000,
  maxRequests: 30,
});
const exportRateLimit = createRequestRateLimiter({
  key: "reports.export",
  windowMs: 60_000,
  maxRequests: 10,
});

const querySchema = z.object({
  date: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

router.use(authenticate);

router.get(
  "/dashboard",
  analyticsRateLimit,
  validateQuery(querySchema),
  asyncHandler(async (req, res) => {
    const { date } = req.query as z.infer<typeof querySchema>;
    const data = await getDashboardSnapshot(date);
    res.json({ data });
  }),
);

router.get(
  "/analytics",
  authorize("ADMIN", "RECEPTION", "DOCTOR", "BILLING", "PHARMACY", "LAB_TECHNICIAN"),
  analyticsRateLimit,
  validateQuery(querySchema),
  asyncHandler(async (req, res) => {
    const { date, fromDate, toDate } = req.query as z.infer<typeof querySchema>;
    const data = await getOperationalReports({ date, fromDate, toDate });
    res.json({ data });
  }),
);

router.get(
  "/analytics/export",
  authorize("ADMIN", "RECEPTION", "DOCTOR", "BILLING", "PHARMACY", "LAB_TECHNICIAN"),
  exportRateLimit,
  validateQuery(querySchema),
  asyncHandler(async (req, res) => {
    const { date, fromDate, toDate } = req.query as z.infer<typeof querySchema>;
    const { buffer, fileName } = await exportOperationalReportWorkbook({ date, fromDate, toDate });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buffer);
  }),
);

export const reportsRouter = router;
