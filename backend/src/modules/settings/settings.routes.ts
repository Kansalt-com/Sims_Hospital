import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import type { Request } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

const router = Router();

fs.mkdirSync(env.uploadDirPath, { recursive: true });
const logoUploadDir = path.join(env.uploadDirPath, "logo");
fs.mkdirSync(logoUploadDir, { recursive: true });

const buildLogoStorage = (folderPath: string, filePrefix: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, folderPath),
    filename: (_req, file, cb) => {
      const ext = file.originalname.includes(".") ? file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase() : ".png";
      const safeName = `${filePrefix}-${Date.now()}${ext}`.replace(/\s+/g, "-");
      cb(null, safeName);
    },
  });

const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]);

const uploadOptions = {
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new AppError("Only PNG, JPG, JPEG and SVG files are supported", 400));
      return;
    }
    cb(null, true);
  },
};

const settingsSchema = z.object({
  hospitalName: z.string().min(2),
  address: z.string().min(2),
  phone: z.string().min(7).max(20),
  gstin: z.string().max(30).optional().nullable(),
  defaultConsultationFee: z.number().nonnegative(),
  invoicePrefix: z.string().min(2).max(12),
  invoiceSequence: z.number().int().min(1),
  footerNote: z.string().max(300).optional().nullable(),
});

const ensureSettings = async () =>
  (await prisma.hospitalSettings.findUnique({ where: { id: 1 } })) ??
  prisma.hospitalSettings.create({
    data: {
      id: 1,
      hospitalName: "SIMS Hospital",
      address: "Update hospital address",
      phone: "0000000000",
      invoicePrefix: "SIMS",
      defaultConsultationFee: 500,
      footerNote: "Thank you for choosing SIMS Hospital.",
      kansaltLogoPath: "/assets/branding/qode27-wordmark.svg",
    },
  });

router.get(
  "/public",
  asyncHandler(async (_req, res) => {
    const settings = await prisma.hospitalSettings.findUnique({
      where: { id: 1 },
      select: {
        id: true,
        hospitalName: true,
        logoPath: true,
        kansaltLogoPath: true,
        updatedAt: true,
      },
    });

    res.json({ data: settings });
  }),
);

router.use(authenticate);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const settings = await ensureSettings();
    res.json({ data: settings });
  }),
);

router.put(
  "/",
  authorize("ADMIN"),
  validateBody(settingsSchema),
  asyncHandler(async (req, res) => {
    const payload = req.body as z.infer<typeof settingsSchema>;
    const existing = await ensureSettings();

    const settings = await prisma.hospitalSettings.update({
      where: { id: existing.id },
      data: {
        hospitalName: payload.hospitalName,
        address: payload.address,
        phone: payload.phone,
        gstin: payload.gstin ?? null,
        defaultConsultationFee: payload.defaultConsultationFee,
        invoicePrefix: payload.invoicePrefix,
        invoiceSequence: payload.invoiceSequence,
        footerNote: payload.footerNote ?? null,
      },
    });

    res.json({ data: settings });
  }),
);

router.post(
  "/kansalt-logo",
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    void req;
    void res;
    throw new AppError("Footer branding is managed by the application and cannot be changed here", 400, "FOOTER_BRANDING_LOCKED");
  }),
);

router.post(
  "/logo",
  authorize("ADMIN"),
  multer({ storage: buildLogoStorage(logoUploadDir, "logo"), ...uploadOptions }).single("logo"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError("Logo file is required", 400, "LOGO_FILE_REQUIRED");
    }

    const settings = await ensureSettings();
    const logoPath = `/${env.uploadUrlPath}/logo/${req.file.filename}`.replace(/\\/g, "/");

    const updated = await prisma.hospitalSettings.update({
      where: { id: settings.id },
      data: {
        logoPath,
      },
    });

    res.json({ data: updated });
  }),
);

export const settingsRouter = router;
