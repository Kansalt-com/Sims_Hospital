import type { Request } from "express";
import { env } from "../config/env.js";

type LogLevel = "info" | "warn" | "error";

type LogPayload = Record<string, unknown> & {
  message: string;
  level?: LogLevel;
};

const writeLog = (payload: LogPayload) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level: payload.level ?? "info",
    ...payload,
  };
  process.stdout.write(`${JSON.stringify(entry)}\n`);
};

export const logInfo = (message: string, metadata?: Record<string, unknown>) =>
  writeLog({ message, ...(metadata ?? {}) });

export const logWarn = (message: string, metadata?: Record<string, unknown>) =>
  writeLog({ level: "warn", message, ...(metadata ?? {}) });

export const logError = (message: string, metadata?: Record<string, unknown>) =>
  writeLog({ level: "error", message, ...(metadata ?? {}) });

export const logSlowOperation = (
  message: string,
  durationMs: number,
  metadata?: Record<string, unknown>,
) => {
  const payload = {
    durationMs,
    slowThresholdMs: env.slowRequestMs,
    ...(metadata ?? {}),
  };

  if (durationMs >= env.slowRequestMs) {
    logWarn(message, payload);
    return;
  }

  logInfo(message, payload);
};

export const requestLogContext = (req: Request) => ({
  method: req.method,
  route: req.originalUrl,
  requestId: req.headers["x-request-id"] ?? null,
  userId: (req as Request & { user?: { id?: number } }).user?.id ?? null,
  ipAddress: req.ip ?? req.socket.remoteAddress ?? null,
});
