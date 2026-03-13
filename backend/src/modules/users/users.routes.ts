import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { authenticate, authorize, type AuthenticatedRequest } from "../../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { writeAuditLog } from "../../services/audit.service.js";
import { USER_ROLES } from "../../types/domain.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";
import { hashPassword } from "../../utils/password.js";

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3).max(40),
  password: z.string().min(10).max(100),
  role: z.enum(USER_ROLES),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(USER_ROLES).optional(),
  active: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  password: z.string().min(10).max(100),
});

const idParamsSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

const listQuerySchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  active: z.enum(["true", "false"]).optional(),
});

router.use(authenticate, authorize("ADMIN"));

router.get(
  "/",
  validateQuery(listQuerySchema),
  asyncHandler(async (req, res) => {
    const { role, active } = req.query as z.infer<typeof listQuerySchema>;

    const users = await prisma.user.findMany({
      where: {
        role,
        active: active === undefined ? undefined : active === "true",
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        active: true,
        forcePasswordChange: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: users });
  }),
);

router.post(
  "/",
  validateBody(createUserSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const payload = req.body as z.infer<typeof createUserSchema>;
    const { name, username, password, role } = payload;

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      throw new AppError("Username already exists", 400);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, username, passwordHash, role, forcePasswordChange: false },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        active: true,
        forcePasswordChange: true,
        createdAt: true,
      },
    });

    await writeAuditLog({
      actorId: req.user?.id,
      action: "user.create",
      entityType: "user",
      entityId: user.id,
      description: `Created ${role} user ${username}`,
      request: req,
    });

    res.status(201).json({ data: user });
  }),
);

router.patch(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(updateUserSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params as z.infer<typeof idParamsSchema>;
    const payload = req.body as z.infer<typeof updateUserSchema>;

    const userId = Number(id);
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new AppError("User not found", 404);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: payload,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        active: true,
        forcePasswordChange: true,
        updatedAt: true,
      },
    });

    await writeAuditLog({
      actorId: req.user?.id,
      action: "user.update",
      entityType: "user",
      entityId: user.id,
      description: `Updated ${user.username}`,
      request: req,
    });

    res.json({ data: user });
  }),
);

router.post(
  "/:id/reset-password",
  validateParams(idParamsSchema),
  validateBody(resetPasswordSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params as z.infer<typeof idParamsSchema>;
    const payload = req.body as z.infer<typeof resetPasswordSchema>;
    const userId = Number(id);

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new AppError("User not found", 404);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(payload.password), forcePasswordChange: true },
    });

    await writeAuditLog({
      actorId: req.user?.id,
      action: "user.reset-password",
      entityType: "user",
      entityId: userId,
      description: `Reset password for ${existing.username}`,
      request: req,
    });

    res.json({ message: "Password reset successful. User must change password on next login." });
  }),
);

router.delete(
  "/:id",
  validateParams(idParamsSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params as z.infer<typeof idParamsSchema>;
    const userId = Number(id);

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: true,
        _count: {
          select: {
            createdPatients: true,
            doctorVisits: true,
            createdVisits: true,
            notes: true,
            prescriptions: true,
            createdInvoices: true,
            attendingAdmissions: true,
            createdAdmissions: true,
            dischargedAdmissions: true,
            createdTransfers: true,
            recordedPayments: true,
            auditLogs: true,
          },
        },
      },
    });

    if (!existing) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    if (existing.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          id: { not: userId },
        },
      });

      if (adminCount === 0) {
        throw new AppError("At least one admin user must remain in the system", 400, "LAST_ADMIN_DELETE_FORBIDDEN");
      }
    }

    const linkedRecords = Object.values(existing._count).reduce((sum, value) => sum + value, 0);
    if (linkedRecords > 0) {
      throw new AppError("This user has linked operational records and cannot be deleted. Disable the account instead.", 400, "USER_IN_USE");
    }

    await prisma.user.delete({ where: { id: userId } });

    await writeAuditLog({
      actorId: req.user?.id,
      action: "user.delete",
      entityType: "user",
      entityId: userId,
      description: `Deleted user ${existing.username}`,
      request: req,
    });

    res.json({ message: "User deleted successfully." });
  }),
);

export const usersRouter = router;
