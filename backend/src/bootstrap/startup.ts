import fs from "node:fs";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { hashPassword } from "../utils/password.js";

const sqlitePathFromUrl = (databaseUrl: string) => {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error(`Unsupported DATABASE_URL for SQLite runtime bootstrap: ${databaseUrl}`);
  }

  const raw = decodeURI(databaseUrl.slice("file:".length));
  if (!raw) {
    throw new Error("DATABASE_URL is missing sqlite file path.");
  }

  if (raw.startsWith("./") || raw.startsWith("../")) {
    return path.resolve(process.cwd(), raw);
  }

  if (/^[A-Za-z]:[\\/]/.test(raw) || raw.startsWith("/")) {
    return path.resolve(raw);
  }

  return path.resolve(process.cwd(), raw);
};

const ensureFolders = () => {
  fs.mkdirSync(path.dirname(sqlitePathFromUrl(env.databaseUrl)), { recursive: true });
  fs.mkdirSync(env.uploadDirPath, { recursive: true });
  fs.mkdirSync(path.join(env.uploadDirPath, "logo"), { recursive: true });
  fs.mkdirSync(path.join(env.uploadDirPath, "branding"), { recursive: true });
  fs.mkdirSync(env.logDir, { recursive: true });
};

const splitSqlStatements = (sql: string) => {
  const withoutComments = sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  return withoutComments
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
};

const isIgnorableSqliteError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("already exists") ||
    message.includes("duplicate column name") ||
    message.includes("no such table: sqlite_sequence")
  );
};

const ensureMigrationLedger = async (client: PrismaClient) => {
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "__sims_migrations" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL UNIQUE,
      "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

// Used only for local/test SQLite bootstrapping. Production deploys must use `prisma migrate deploy`.
export const applyLocalSqliteMigrations = async (client: PrismaClient = prisma) => {
  await ensureMigrationLedger(client);

  const appliedRows = (await client.$queryRawUnsafe(
    `SELECT "name" FROM "__sims_migrations" ORDER BY "name" ASC;`,
  )) as Array<{ name: string }>;

  const applied = new Set(appliedRows.map((row) => row.name));

  if (!fs.existsSync(env.migrationsDir)) {
    return;
  }

  const migrationDirs = fs
    .readdirSync(env.migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const migrationName of migrationDirs) {
    if (applied.has(migrationName)) {
      continue;
    }

    const filePath = path.join(env.migrationsDir, migrationName, "migration.sql");
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const sql = fs.readFileSync(filePath, "utf-8");
    const statements = splitSqlStatements(sql);

    for (const statement of statements) {
      try {
        await client.$executeRawUnsafe(statement);
      } catch (error) {
        if (!isIgnorableSqliteError(error)) {
          throw error;
        }
      }
    }

    await client.$executeRaw`
      INSERT INTO "__sims_migrations" ("name") VALUES (${migrationName});
    `;
  }
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
      kansaltLogoPath: "/assets/branding/kansalt-logo.svg",
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
  await ensureMasterData(prisma);
};
