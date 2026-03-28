import { Router } from "express";
import multer from "multer";
import XLSX from "xlsx";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { authenticate, authorize, type AuthenticatedRequest } from "../../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { GENDERS } from "../../types/domain.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";
import { generateMrn } from "../../utils/id.js";
import { clearCache, getOrSetCache } from "../../utils/memoryCache.js";
import { parsePage } from "../../utils/pagination.js";

const router = Router();
const bulkUpload = multer({ storage: multer.memoryStorage() });

const patientSchema = z.object({
  name: z.string().min(2),
  dob: z.string().datetime().optional().nullable(),
  age: z.number().int().min(0).max(130).optional().nullable(),
  gender: z.enum(GENDERS),
  phone: z.string().min(7).max(15),
  address: z.string().min(2),
  idProof: z.string().max(100).optional().nullable(),
});

const listQuerySchema = z.object({
  q: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  limit: z.string().optional(),
  active: z.enum(["true", "false"]).optional(),
});

const bulkPatientRowSchema = z.object({
  name: z.string().min(2),
  age: z.number().int().min(0).max(130),
  phone: z.string().min(7).max(15),
  gender: z.enum(GENDERS).optional().default("MALE"),
  address: z.string().min(2).default("NA"),
  idProof: z.string().optional().nullable(),
});

const idParamsSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

const normalizeName = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const normalizePhone = (value: string) => value.replace(/\D/g, "");

const createPatientWithUniqueMrn = async (data: {
  name: string;
  dob?: Date | null;
  age?: number | null;
  gender: z.infer<typeof patientSchema>["gender"];
  phone: string;
  address: string;
  idProof?: string | null;
  createdById?: number;
}) => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await prisma.patient.create({
        data: {
          mrn: generateMrn(),
          name: data.name,
          dob: data.dob ?? null,
          age: data.age ?? null,
          gender: data.gender,
          phone: data.phone,
          address: data.address,
          idProof: data.idProof ?? null,
          createdById: data.createdById,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("Unique constraint failed on the fields: (`mrn`)")) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new AppError("Unable to generate unique MRN", 500, "MRN_GENERATION_FAILED");
};

const findDuplicatePatient = async (
  payload: z.infer<typeof patientSchema>,
  excludeId?: number,
) => {
  const normalizedName = normalizeName(payload.name);
  const normalizedPhone = normalizePhone(payload.phone);

  const candidates = await prisma.patient.findMany({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      active: true,
      OR: [
        { phone: { contains: normalizedPhone.slice(-10) } },
        { name: { contains: payload.name.trim() } },
      ],
    },
    select: {
      id: true,
      name: true,
      phone: true,
      dob: true,
      age: true,
      gender: true,
    },
    take: 10,
  });

  return candidates.find((candidate) => {
    const samePhone = normalizePhone(candidate.phone) === normalizedPhone;
    const sameName = normalizeName(candidate.name) === normalizedName;
    const sameGender = candidate.gender === payload.gender;
    const sameAge =
      payload.age === undefined || payload.age === null || candidate.age === null ? true : candidate.age === payload.age;

    return samePhone && sameName && sameGender && sameAge;
  });
};

router.use(authenticate);

router.get(
  "/",
  validateQuery(listQuerySchema),
  asyncHandler(async (req, res) => {
    const { q, page, pageSize, limit, active } = req.query as z.infer<typeof listQuerySchema>;
    const requestedLimit = limit ?? pageSize ?? "20";
    const parsedPage = Math.max(1, Number(page ?? 1) || 1);
    const parsedLimit = Math.min(50, Math.max(1, Number(requestedLimit) || 20));
    const { skip, take, page: safePage, pageSize: safeSize } = parsePage(String(parsedPage), String(parsedLimit));
    const trimmedQuery = q?.trim();
    const effectiveTake = trimmedQuery ? Math.min(take, 20) : take;

    const where = {
      active: active === undefined ? undefined : active === "true",
      OR: trimmedQuery
        ? [
            { name: { contains: trimmedQuery } },
            { phone: { contains: trimmedQuery } },
            { mrn: { contains: trimmedQuery } },
            { idProof: { contains: trimmedQuery } },
          ]
        : undefined,
    };

    const cacheKey = trimmedQuery
      ? `patients:search:${trimmedQuery}:${safePage}:${effectiveTake}:${active ?? "all"}`
      : `patients_page_${safePage}_${effectiveTake}_${active ?? "all"}`;
    const payload = await getOrSetCache(cacheKey, 5 * 60_000, async () => {
      const [total, rows] = await Promise.all([
        prisma.patient.count({ where }),
        prisma.patient.findMany({
          where,
          skip,
          take: effectiveTake,
          orderBy: trimmedQuery ? [{ name: "asc" }] : [{ createdAt: "desc" }],
          select: {
            id: true,
            mrn: true,
            name: true,
            dob: true,
            age: true,
            gender: true,
            phone: true,
            address: true,
            idProof: true,
            active: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ]);

      return {
        data: rows,
        pagination: {
          page: safePage,
          pageSize: effectiveTake,
          total,
          totalPages: Math.ceil(total / effectiveTake),
        },
      };
    });

    res.json(payload);
  }),
);

router.get(
  "/search",
  validateQuery(
    z.object({
      q: z.string().optional(),
      active: z.enum(["true", "false"]).optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const { q, active } = req.query as { q?: string; active?: "true" | "false" };
    const trimmedQuery = q?.trim() ?? "";

    const where = trimmedQuery
      ? {
          active: active === undefined ? undefined : active === "true",
          OR: [
            { name: { contains: trimmedQuery } },
            { phone: { contains: trimmedQuery } },
          ],
        }
      : {
          active: active === undefined ? undefined : active === "true",
        };

    const cacheKey = trimmedQuery
      ? `patients:search:${trimmedQuery}:1:20:${active ?? "all"}`
      : `patients:search:recent:${active ?? "all"}`;

    const payload = await getOrSetCache(cacheKey, 5 * 60_000, async () => {
      const rows = await prisma.patient.findMany({
        where,
        take: 20,
        orderBy: trimmedQuery ? [{ name: "asc" }] : [{ createdAt: "desc" }],
        select: {
          id: true,
          mrn: true,
          name: true,
          dob: true,
          age: true,
          gender: true,
          phone: true,
          address: true,
          idProof: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        data: rows,
        total: rows.length,
        page: 1,
        limit: 20,
      };
    });

    res.json(payload);
  }),
);

router.get(
  "/:id",
  validateParams(idParamsSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof idParamsSchema>;

    const patient = await prisma.patient.findUnique({
      where: { id: Number(id) },
      include: {
        createdBy: { select: { id: true, name: true, username: true } },
        visits: {
          orderBy: { createdAt: "desc" },
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                doctorProfile: { select: { qualification: true, specialization: true, signaturePath: true } },
              },
            },
            notes: { orderBy: { createdAt: "desc" } },
            prescription: true,
            invoice: { include: { items: true } },
            ipdAdmission: {
              include: {
                attendingDoctor: {
                  select: {
                    id: true,
                    name: true,
                    doctorProfile: { select: { qualification: true, specialization: true } },
                  },
                },
                transfer: true,
              },
            },
            opdToIpdTransfer: true,
          },
        },
        ipdAdmissions: {
          orderBy: { admittedAt: "desc" },
          include: {
            visit: true,
            attendingDoctor: { select: { id: true, name: true } },
            transfer: true,
          },
        },
        prescriptions: {
          orderBy: { createdAt: "desc" },
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                doctorProfile: { select: { qualification: true, specialization: true } },
              },
            },
            visit: { select: { id: true, scheduledAt: true, status: true, type: true } },
            invoice: { select: { id: true, invoiceNo: true, dueAmount: true } },
          },
        },
      },
    });

    if (!patient) {
      throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
    }

    res.json({ data: patient });
  }),
);

router.post(
  "/",
  authorize("ADMIN", "RECEPTION"),
  validateBody(patientSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const payload = req.body as z.infer<typeof patientSchema>;
    const duplicate = await findDuplicatePatient(payload);
    if (duplicate) {
      throw new AppError("A matching patient record already exists", 409, "DUPLICATE_PATIENT");
    }

    const patient = await createPatientWithUniqueMrn({
      name: payload.name.trim().replace(/\s+/g, " "),
      dob: payload.dob ? new Date(payload.dob) : null,
      age: payload.age ?? null,
      gender: payload.gender,
      phone: normalizePhone(payload.phone),
      address: payload.address.trim(),
      idProof: payload.idProof?.trim() ?? null,
      createdById: req.user?.id,
    });

    clearCache("patients:list:");

    res.status(201).json({ data: patient });
  }),
);

router.post(
  "/bulk-upload",
  authorize("ADMIN", "RECEPTION"),
  bulkUpload.single("file"),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!req.file?.buffer) {
      throw new AppError("Excel file is required", 400, "FILE_REQUIRED");
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new AppError("No worksheet found in uploaded file", 400, "EMPTY_WORKBOOK");
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheetName], {
      defval: "",
      raw: false,
    });

    if (rows.length === 0) {
      throw new AppError("No patient rows found in uploaded file", 400, "EMPTY_ROWS");
    }

    const successful: Array<{ row: number; name: string; mrn: string }> = [];
    const failed: Array<{ row: number; reason: string; payload?: Record<string, unknown> }> = [];

    for (const [index, row] of rows.entries()) {
      const name = String(row.name ?? row.Name ?? "").trim();
      const phone = normalizePhone(String(row.phone ?? row.Phone ?? ""));
      const ageValue = Number(row.age ?? row.Age ?? 0);
      const genderValue = String(row.gender ?? row.Gender ?? "MALE").trim().toUpperCase();
      const address = String(row.address ?? row.Address ?? "NA").trim() || "NA";
      const idProof = String(row.idProof ?? row.IDProof ?? row["ID Proof"] ?? "").trim() || null;

      const parsed = bulkPatientRowSchema.safeParse({
        name,
        age: Number.isFinite(ageValue) ? ageValue : NaN,
        phone,
        gender: genderValue,
        address,
        idProof,
      });

      if (!parsed.success) {
        failed.push({
          row: index + 2,
          reason: parsed.error.issues.map((issue) => issue.message).join(", "),
          payload: row,
        });
        continue;
      }

      const duplicate = await findDuplicatePatient({
        name: parsed.data.name,
        age: parsed.data.age,
        gender: parsed.data.gender,
        phone: parsed.data.phone,
        address: parsed.data.address,
        dob: null,
        idProof: parsed.data.idProof ?? null,
      });

      if (duplicate) {
        failed.push({
          row: index + 2,
          reason: "Duplicate patient already exists",
          payload: row,
        });
        continue;
      }

      const patient = await createPatientWithUniqueMrn({
        name: parsed.data.name.trim().replace(/\s+/g, " "),
        age: parsed.data.age,
        gender: parsed.data.gender,
        phone: parsed.data.phone,
        address: parsed.data.address,
        idProof: parsed.data.idProof ?? null,
        createdById: req.user?.id,
      });

      successful.push({
        row: index + 2,
        name: patient.name,
        mrn: patient.mrn,
      });
    }

    clearCache("patients:list:");

    res.status(201).json({
      data: {
        totalRows: rows.length,
        inserted: successful.length,
        failed: failed.length,
        successRecords: successful,
        failedRecords: failed,
      },
    });
  }),
);

router.put(
  "/:id",
  authorize("ADMIN", "RECEPTION"),
  validateParams(idParamsSchema),
  validateBody(patientSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof idParamsSchema>;
    const payload = req.body as z.infer<typeof patientSchema>;
    const patientId = Number(id);

    const existing = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!existing) {
      throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
    }

    const duplicate = await findDuplicatePatient(payload, patientId);
    if (duplicate) {
      throw new AppError("A matching patient record already exists", 409, "DUPLICATE_PATIENT");
    }

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        name: payload.name.trim().replace(/\s+/g, " "),
        dob: payload.dob ? new Date(payload.dob) : null,
        age: payload.age ?? null,
        gender: payload.gender,
        phone: normalizePhone(payload.phone),
        address: payload.address.trim(),
        idProof: payload.idProof?.trim() ?? null,
      },
    });

    clearCache("patients:list:");

    res.json({ data: patient });
  }),
);

router.delete(
  "/:id",
  authorize("ADMIN", "RECEPTION"),
  validateParams(idParamsSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof idParamsSchema>;

    const existing = await prisma.patient.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
    }

    const patient = await prisma.patient.update({
      where: { id: Number(id) },
      data: { active: false },
    });

    clearCache("patients:list:");

    res.json({ data: patient, message: "Patient deleted" });
  }),
);

export const patientsRouter = router;
