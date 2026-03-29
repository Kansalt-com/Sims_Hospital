import type { PrismaClient as PrismaClientType } from "@prisma/client";
import prismaClientPkg from "@prisma/client";
import { env } from "../config/env.js";
import { logWarn } from "../utils/logger.js";
import { recordQuery, recordSlowQuery } from "../utils/metrics.js";

const { PrismaClient: PrismaClientCtor } = prismaClientPkg;

export const prisma = new PrismaClientCtor({
  log:
    process.env.NODE_ENV === "development"
      ? [{ emit: "event", level: "query" }, "warn", "error"]
      : [{ emit: "event", level: "query" }, "error"],
});

prisma.$on("query", (event) => {
  recordQuery();
  if (event.duration >= env.slowQueryMs) {
    recordSlowQuery(event.target ?? "database", "query", event.duration);
    logWarn("db.query.slow", {
      target: event.target ?? "database",
      durationMs: event.duration,
      query: event.query.slice(0, 400),
    });
  }
});

export type { PrismaClientType };
