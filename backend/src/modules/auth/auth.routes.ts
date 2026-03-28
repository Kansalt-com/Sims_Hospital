import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { authenticate, type AuthenticatedRequest } from "../../middleware/auth.js";
import { writeAuditLog } from "../../services/audit.service.js";
import { getPermissionsForRole } from "../../services/permission.service.js";
import { validateBody } from "../../middleware/validate.js";
import { assertLoginAttemptAllowed, clearLoginFailures, recordLoginFailure } from "../../middleware/loginRateLimit.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";
import { signToken } from "../../utils/jwt.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z
    .string()
    .min(10)
    .regex(/[A-Z]/, "New password must include one uppercase letter")
    .regex(/[a-z]/, "New password must include one lowercase letter")
    .regex(/[0-9]/, "New password must include one number")
    .regex(/[^A-Za-z0-9]/, "New password must include one special character"),
});

router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const attempt = assertLoginAttemptAllowed(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress, username);
    if (!attempt.allowed) {
      res.setHeader("Retry-After", String(attempt.retryAfterSeconds));
      throw new AppError("Too many login attempts. Try again shortly.", 429, "TOO_MANY_LOGIN_ATTEMPTS");
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.active) {
      recordLoginFailure(attempt.key);
      throw new AppError("Invalid credentials", 401);
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      recordLoginFailure(attempt.key);
      throw new AppError("Invalid credentials", 401);
    }

    clearLoginFailures(attempt.key);

    const token = signToken({
      userId: user.id,
      role: user.role,
      username: user.username,
      sessionVersion: user.updatedAt.toISOString(),
    });

    const permissions = await getPermissionsForRole(user.role);

    await writeAuditLog({
      actorId: user.id,
      action: "auth.login",
      entityType: "user",
      entityId: user.id,
      description: `User ${user.username} signed in`,
      request: req,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        forcePasswordChange: user.forcePasswordChange,
        permissions,
      },
    });
  }),
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  }),
);

router.post(
  "/change-password",
  authenticate,
  validateBody(changePasswordSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const { oldPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.active) {
      throw new AppError("User not found", 404);
    }

    const oldPasswordValid = await verifyPassword(oldPassword, user.passwordHash);
    if (!oldPasswordValid) {
      throw new AppError("Old password is incorrect", 400);
    }

    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        forcePasswordChange: false,
      },
    });

    const refreshed = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        updatedAt: true,
      },
    });

    const token = signToken({
      userId: refreshed.id,
      role: refreshed.role,
      username: refreshed.username,
      sessionVersion: refreshed.updatedAt.toISOString(),
    });

    await writeAuditLog({
      actorId: userId,
      action: "auth.change-password",
      entityType: "user",
      entityId: userId,
      description: "User changed password",
      request: req,
    });

    res.json({ message: "Password updated successfully", token });
  }),
);

export const authRouter = router;
