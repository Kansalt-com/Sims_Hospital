import type { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  key: string;
  windowMs: number;
  maxRequests: number;
};

type RequestCounter = {
  count: number;
  resetAt: number;
};

const counters = new Map<string, RequestCounter>();

const getClientIp = (req: Request) =>
  String(req.headers["x-forwarded-for"] ?? req.ip ?? req.socket.remoteAddress ?? "unknown")
    .split(",")[0]
    .trim();

const cleanup = (now: number) => {
  for (const [key, value] of counters) {
    if (value.resetAt <= now) {
      counters.delete(key);
    }
  }
};

export const createRequestRateLimiter = ({ key, windowMs, maxRequests }: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    cleanup(now);

    const bucketKey = `${key}:${getClientIp(req)}`;
    const current = counters.get(bucketKey);
    if (!current || current.resetAt <= now) {
      counters.set(bucketKey, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        error: true,
        message: "Too many requests. Please slow down and try again shortly.",
        code: "RATE_LIMITED",
      });
      return;
    }

    current.count += 1;
    counters.set(bucketKey, current);
    next();
  };
};
