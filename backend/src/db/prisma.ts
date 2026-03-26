import type { PrismaClient as PrismaClientType } from "@prisma/client";
import prismaClientPkg from "@prisma/client";

const { PrismaClient: PrismaClientCtor } = prismaClientPkg;

export const prisma = new PrismaClientCtor({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export type { PrismaClientType };
