import fs from "node:fs";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { ensurePermissionCatalog } from "../services/permission.service.js";
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

const ensureInitialAdmin = async (client: PrismaClient) => {
  const adminCount = await client.user.count({
    where: {
      role: "ADMIN",
      active: true,
    },
  });
  if (adminCount > 0) {
    return;
  }

  const username = env.initialAdminUsername;
  const password = env.initialAdminPassword;
  const name = env.initialAdminName ?? "Initial Administrator";

  if (!username || !password) {
    if (env.nodeEnv === "production") {
      throw new Error(
        "No active admin user exists. Set INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD before first production startup.",
      );
    }
    return;
  }

  if (password.length < 10) {
    throw new Error("INITIAL_ADMIN_PASSWORD must be at least 10 characters long.");
  }

  const passwordHash = await hashPassword(password);

  await client.user.upsert({
    where: { username },
    update: {
      name,
      role: "ADMIN",
      active: true,
      forcePasswordChange: true,
      passwordHash,
    },
    create: {
      name,
      username,
      passwordHash,
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
  await ensurePermissionCatalog();
  await ensureDefaultSettings(prisma);
  await ensureInitialAdmin(prisma);
  await ensureMasterData(prisma);
};
