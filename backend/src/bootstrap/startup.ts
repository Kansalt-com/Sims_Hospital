import fs from "node:fs";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { hashPassword } from "../utils/password.js";
import { env } from "../config/env.js";

const ensureFolders = () => {
  fs.mkdirSync(env.uploadDirPath, { recursive: true });
  fs.mkdirSync(path.join(env.uploadDirPath, "logo"), { recursive: true });
  fs.mkdirSync(path.join(env.uploadDirPath, "branding"), { recursive: true });
  fs.mkdirSync(env.logDir, { recursive: true });
};

const ensureDefaultSettings = async (client: PrismaClient) => {
  const existing = await client.hospitalSettings.findUnique({ where: { id: 1 } });
  if (existing) {
    return;
  }

  await client.hospitalSettings.create({
    data: {
      id: 1,
      hospitalName: "SIMS Hospital",
      address: "Update hospital address",
      phone: "0000000000",
      invoicePrefix: "SIMS",
      invoiceSequence: 1,
      defaultConsultationFee: 500,
      footerNote: "Thank you for choosing SIMS Hospital.",
      kansaltLogoPath: "/assets/branding/qode27-wordmark.svg",
      currencyCode: "INR",
      timezone: "Asia/Kolkata",
    },
  });
};

const ensureDefaultAdmin = async (client: PrismaClient) => {
  const existing = await client.user.findUnique({ where: { username: "admin" } });
  if (existing) {
    return;
  }

  await client.user.create({
    data: {
      name: "SIMS Administrator",
      username: "admin",
      passwordHash: await hashPassword("Admin@12345"),
      role: "ADMIN",
      active: true,
      forcePasswordChange: true,
    },
  });
};

const ensureSuperAdmin = async (client: PrismaClient) => {
  const existing = await client.user.findUnique({ where: { username: "RehmatSyedKhan" } });
  if (existing) {
    if (!existing.forcePasswordChange) {
      await client.user.update({
        where: { id: existing.id },
        data: { forcePasswordChange: true, active: true },
      });
    }
    return;
  }

  await client.user.create({
    data: {
      name: "Rehmat Syed Khan",
      username: "RehmatSyedKhan",
      passwordHash: await hashPassword("Rehmat@123"),
      role: "ADMIN",
      active: true,
      forcePasswordChange: true,
    },
  });
};

const ensureMasterData = async (client: PrismaClient) => {
  const roomCount = await client.room.count();
  if (roomCount === 0) {
    const defaults = [
      {
        ward: "General",
        name: "101",
        beds: ["A", "B", "C"],
      },
      {
        ward: "General",
        name: "102",
        beds: ["A", "B"],
      },
      {
        ward: "ICU",
        name: "ICU-1",
        beds: ["1", "2"],
      },
    ];

    for (const room of defaults) {
      await client.room.create({
        data: {
          ward: room.ward,
          name: room.name,
          beds: {
            create: room.beds.map((bedNumber) => ({
              bedNumber,
              status: "AVAILABLE",
            })),
          },
        },
      });
    }
  }
};

export const initializeRuntime = async () => {
  ensureFolders();
  await ensureDefaultSettings(prisma);
  await ensureDefaultAdmin(prisma);
  await ensureSuperAdmin(prisma);
  await ensureMasterData(prisma);
};
