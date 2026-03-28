import fs from "node:fs";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";
import { hashPassword } from "../../utils/password.js";

const router = Router();

const signatureUploadDir = path.join(env.uploadDirPath, "signatures");
fs.mkdirSync(signatureUploadDir, { recursive: true });

const allowedSignatureMimeTypes = new Set(["image/png", "image/jpeg", "image/jpg"]);

const signatureUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, signatureUploadDir),
    filename: (_req, file, cb) => {
      const extension = file.originalname.includes(".")
        ? file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase()
        : ".png";
      cb(null, `doctor-signature-${Date.now()}${extension}`.replace(/\s+/g, "-"));
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedSignatureMimeTypes.has(file.mimetype)) {
      cb(new AppError("Only PNG, JPG and JPEG files are supported", 400, "INVALID_SIGNATURE_FILE"));
      return;
    }
    cb(null, true);
  },
});

const createDoctorSchema = z.object({
  fullName: z.string().min(2),
  qualification: z.string().min(2),
  specialization: z.string().min(2),
  experienceYears: z.number().int().min(0).max(80).optional(),
  registrationNumber: z.string().max(100).optional().nullable(),
  phone: z.string().min(7).max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  username: z.string().min(3).max(40),
  password: z.string().min(6).max(100),
  active: z.boolean().optional(),
});

const updateDoctorSchema = z.object({
  fullName: z.string().min(2).optional(),
  qualification: z.string().min(2).optional(),
  specialization: z.string().min(2).optional(),
  experienceYears: z.number().int().min(0).max(80).optional(),
  registrationNumber: z.string().max(100).optional().nullable(),
  phone: z.string().min(7).max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  username: z.string().min(3).max(40).optional(),
  password: z.string().min(6).max(100).optional(),
  active: z.boolean().optional(),
});

const idParamsSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

const listQuerySchema = z.object({
  active: z.enum(["true", "false"]).optional(),
  q: z.string().optional(),
});

router.use(authenticate);

router.get(
  "/",
  validateQuery(listQuerySchema),
  asyncHandler(async (req, res) => {
    const { active, q } = req.query as z.infer<typeof listQuerySchema>;

    const rows = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
        active: active === undefined ? undefined : active === "true",
        OR: q
          ? [
              { name: { contains: q } },
              { username: { contains: q } },
              { doctorProfile: { specialization: { contains: q } } },
              { doctorProfile: { qualification: { contains: q } } },
            ]
          : undefined,
      },
      include: {
        doctorProfile: true,
      },
      orderBy: { name: "asc" },
    });

    res.json({ data: rows });
  }),
);

router.get(
  "/:id",
  validateParams(idParamsSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof idParamsSchema>;

    const doctor = await prisma.user.findFirst({
      where: {
        id: Number(id),
        role: "DOCTOR",
      },
      include: {
        doctorProfile: true,
      },
    });

    if (!doctor) {
      throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
    }

    res.json({ data: doctor });
  }),
);

router.post(
  "/",
  authorize("ADMIN"),
  validateBody(createDoctorSchema),
  asyncHandler(async (req, res) => {
    const payload = req.body as z.infer<typeof createDoctorSchema>;

    const existing = await prisma.user.findUnique({ where: { username: payload.username } });
    if (existing) {
      throw new AppError("Username already exists", 400, "DUPLICATE_USERNAME");
    }

    const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name: payload.fullName,
          username: payload.username,
          passwordHash: await hashPassword(payload.password),
          role: "DOCTOR",
          active: payload.active ?? true,
          forcePasswordChange: false,
        },
      });

      await tx.doctorProfile.create({
        data: {
          userId: user.id,
          qualification: payload.qualification,
          specialization: payload.specialization,
          experienceYears: payload.experienceYears ?? 0,
          registrationNumber: payload.registrationNumber ?? null,
          phone: payload.phone ?? null,
          email: payload.email ?? null,
        },
      });

      return tx.user.findUnique({
        where: { id: user.id },
        include: { doctorProfile: true },
      });
    });

    res.status(201).json({ data: created });
  }),
);

router.patch(
  "/:id",
  authorize("ADMIN"),
  validateParams(idParamsSchema),
  validateBody(updateDoctorSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof idParamsSchema>;
    const payload = req.body as z.infer<typeof updateDoctorSchema>;
    const userId = Number(id);

    const existing = await prisma.user.findFirst({
      where: { id: userId, role: "DOCTOR" },
      include: { doctorProfile: true },
    });

    if (!existing) {
      throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
    }

    if (payload.username && payload.username !== existing.username) {
      const usernameConflict = await prisma.user.findUnique({ where: { username: payload.username } });
      if (usernameConflict) {
        throw new AppError("Username already exists", 400, "DUPLICATE_USERNAME");
      }
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          name: payload.fullName ?? undefined,
          username: payload.username ?? undefined,
          active: payload.active ?? undefined,
          passwordHash: payload.password ? await hashPassword(payload.password) : undefined,
        },
      });

      if (existing.doctorProfile) {
        await tx.doctorProfile.update({
          where: { userId },
          data: {
            qualification: payload.qualification ?? undefined,
            specialization: payload.specialization ?? undefined,
            experienceYears: payload.experienceYears ?? undefined,
            registrationNumber: payload.registrationNumber ?? undefined,
            phone: payload.phone ?? undefined,
            email: payload.email ?? undefined,
          },
        });
      } else {
        await tx.doctorProfile.create({
          data: {
            userId,
            qualification: payload.qualification ?? "MBBS",
            specialization: payload.specialization ?? "General Medicine",
            experienceYears: payload.experienceYears ?? 0,
            registrationNumber: payload.registrationNumber ?? null,
            phone: payload.phone ?? null,
            email: payload.email ?? null,
          },
        });
      }

      return tx.user.findUnique({ where: { id: userId }, include: { doctorProfile: true } });
    });

    res.json({ data: updated });
  }),
);

router.post(
  "/:id/signature",
  authorize("ADMIN"),
  validateParams(idParamsSchema),
  signatureUpload.single("signature"),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof idParamsSchema>;
    const userId = Number(id);

    const doctor = await prisma.user.findFirst({
      where: { id: userId, role: "DOCTOR" },
      include: { doctorProfile: true },
    });

    if (!doctor) {
      throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
    }

    if (!req.file) {
      throw new AppError("Signature file is required", 400, "SIGNATURE_REQUIRED");
    }

    const signaturePath = `/${env.uploadUrlPath}/signatures/${req.file.filename}`.replace(/\\/g, "/");

    if (doctor.doctorProfile) {
      await prisma.doctorProfile.update({
        where: { userId },
        data: { signaturePath },
      });
    } else {
      await prisma.doctorProfile.create({
        data: {
          userId,
          qualification: "MBBS",
          specialization: "General Medicine",
          signaturePath,
        },
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    res.json({ data: updated });
  }),
);

export const doctorsRouter = router;
