import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { authenticate, authorize, type AuthenticatedRequest } from "../../middleware/auth.js";
import { validateParams, validateQuery } from "../../middleware/validate.js";
import { CACHE_PREFIXES, clearPrescriptionCache } from "../../services/cache.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";
import { getOrSetCache } from "../../utils/memoryCache.js";
import { parsePage } from "../../utils/pagination.js";

const router = Router();

const listQuerySchema = z.object({
  patientId: z.string().regex(/^\d+$/).optional(),
  visitId: z.string().regex(/^\d+$/).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

const idParamsSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

router.use(authenticate);

router.get(
  "/",
  validateQuery(listQuerySchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { patientId, visitId, page, pageSize } = req.query as z.infer<typeof listQuerySchema>;
    const { skip, take, page: safePage, pageSize: safeSize } = parsePage(page, pageSize);

    const where = {
      patientId: patientId ? Number(patientId) : undefined,
      visitId: visitId ? Number(visitId) : undefined,
      visit: req.user?.role === "DOCTOR" ? { doctorId: req.user.id } : undefined,
    };

    const payload = await getOrSetCache(
      `${CACHE_PREFIXES.prescriptions}list:${patientId ?? "all"}:${visitId ?? "all"}:${req.user?.role ?? "anon"}:${req.user?.id ?? 0}:${safePage}:${safeSize}`,
      60_000,
      async () => {
        const [total, rows] = await Promise.all([
          prisma.prescription.count({ where }),
          prisma.prescription.findMany({
            where,
            select: {
              id: true,
              patientId: true,
              doctorId: true,
              visitId: true,
              invoiceId: true,
              printedAt: true,
              templateType: true,
              createdAt: true,
              updatedAt: true,
              patient: { select: { id: true, mrn: true, name: true, age: true, gender: true } },
              doctor: {
                select: {
                  id: true,
                  name: true,
                  doctorProfile: { select: { qualification: true, specialization: true, signaturePath: true } },
                },
              },
              visit: { select: { id: true, scheduledAt: true, status: true, type: true } },
              invoice: { select: { id: true, invoiceNo: true, total: true, paidAmount: true, dueAmount: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take,
          }),
        ]);

        return {
          data: rows,
          pagination: {
            page: safePage,
            pageSize: safeSize,
            total,
            totalPages: Math.ceil(total / safeSize),
          },
        };
      },
    );

    res.json(payload);
  }),
);

router.get(
  "/:id",
  validateParams(idParamsSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params as z.infer<typeof idParamsSchema>;

    const row = await prisma.prescription.findUnique({
      where: { id: Number(id) },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            name: true,
            doctorProfile: { select: { qualification: true, specialization: true, signaturePath: true } },
          },
        },
        visit: true,
        invoice: true,
      },
    });

    if (!row) {
      throw new AppError("Prescription not found", 404);
    }

    if (req.user?.role === "DOCTOR" && row.doctorId !== req.user.id) {
      throw new AppError("Forbidden", 403);
    }

    res.json({ data: row });
  }),
);

router.post(
  "/:id/mark-printed",
  authorize("ADMIN", "RECEPTION", "DOCTOR"),
  validateParams(idParamsSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params as z.infer<typeof idParamsSchema>;
    const prescription = await prisma.prescription.findUnique({ where: { id: Number(id) } });

    if (!prescription) {
      throw new AppError("Prescription not found", 404);
    }

    if (req.user?.role === "DOCTOR" && prescription.doctorId !== req.user.id) {
      throw new AppError("Forbidden", 403);
    }

    const updated = await prisma.prescription.update({
      where: { id: Number(id) },
      data: { printedAt: new Date() },
    });

    clearPrescriptionCache();
    res.json({ data: updated });
  }),
);

export const prescriptionsRouter = router;
