import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const required = ["JWT_SECRET"] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const resolvePathMaybe = (value: string) => (path.isAbsolute(value) ? value : path.resolve(process.cwd(), value));
const nodeEnv = process.env.NODE_ENV ?? "development";

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
};

const defaultUploadDir = path.resolve(process.cwd(), "uploads");

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres?schema=public";
const corsOrigin = process.env.CORS_ORIGIN ?? (nodeEnv === "production" ? "" : "*");

if (nodeEnv === "production") {
  if ((process.env.JWT_SECRET ?? "").length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production.");
  }

  if (!corsOrigin || corsOrigin === "*") {
    throw new Error("CORS_ORIGIN must be explicitly configured in production.");
  }

  if (!databaseUrl.startsWith("postgres")) {
    throw new Error("DATABASE_URL must point to a PostgreSQL database in production.");
  }
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  databaseUrl,
  uploadDirPath: process.env.UPLOAD_DIR_PATH ? resolvePathMaybe(process.env.UPLOAD_DIR_PATH) : defaultUploadDir,
  uploadUrlPath: process.env.UPLOAD_URL_PATH ?? "uploads",
  corsOrigin,
  frontendDistDir: process.env.FRONTEND_DIST_DIR ? resolvePathMaybe(process.env.FRONTEND_DIST_DIR) : undefined,
  migrationsDir: process.env.MIGRATIONS_DIR ? resolvePathMaybe(process.env.MIGRATIONS_DIR) : path.resolve(process.cwd(), "prisma", "migrations"),
  logDir: process.env.LOG_DIR ? resolvePathMaybe(process.env.LOG_DIR) : path.resolve(process.cwd(), "logs"),
  enableFileLogging: parseBoolean(process.env.ENABLE_FILE_LOGGING, true),
};
