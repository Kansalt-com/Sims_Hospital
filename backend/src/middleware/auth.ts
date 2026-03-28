import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import { getPermissionsForRole } from "../services/permission.service.js";
import type { UserRoleValue } from "../types/domain.js";
import { AppError } from "../utils/appError.js";
import { verifyToken } from "../utils/jwt.js";

export type AuthenticatedUser = {
  id: number;
  role: UserRoleValue;
  username: string;
  name: string;
  forcePasswordChange: boolean;
  permissions?: string[];
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

const sendAuthError = (res: Response, message: string, code: string, statusCode = 401) =>
  res.status(statusCode).json({
    error: true,
    message,
    code,
  });

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendAuthError(res, "Unauthorized", "UNAUTHORIZED");
    }

    const token = authHeader.slice("Bearer ".length);
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, username: true, name: true, active: true, forcePasswordChange: true, updatedAt: true },
    });

    if (!user || !user.active) {
      return sendAuthError(res, "User account is inactive", "SESSION_INVALID");
    }

    if (payload.sessionVersion !== user.updatedAt.toISOString()) {
      return sendAuthError(res, "Session expired. Please sign in again.", "SESSION_INVALID");
    }

    req.user = {
      id: user.id,
      role: user.role as UserRoleValue,
      username: user.username,
      name: user.name,
      forcePasswordChange: user.forcePasswordChange,
      permissions: await getPermissionsForRole(user.role as UserRoleValue),
    };
    next();
  } catch (_error) {
    return sendAuthError(res, "Invalid token", "TOKEN_INVALID");
  }
};

export const authorize = (...roles: UserRoleValue[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendAuthError(res, "Unauthorized", "UNAUTHORIZED");
    }

    if (!roles.includes(req.user.role)) {
      return sendAuthError(res, "Forbidden", "FORBIDDEN", 403);
    }

    next();
  };
};

export const authorizePermission = (...permissionCodes: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendAuthError(res, "Unauthorized", "UNAUTHORIZED");
    }

    const permissions = req.user.permissions ?? [];
    const hasPermission = permissionCodes.every((code) => permissions.includes(code));
    if (!hasPermission) {
      return sendAuthError(res, "Forbidden", "FORBIDDEN", 403);
    }

    next();
  };
};

export const requireActiveUser = (user?: AuthenticatedUser) => {
  if (!user) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  return user;
};
