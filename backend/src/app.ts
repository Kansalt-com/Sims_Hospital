import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import compression from "compression";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { patientsRouter } from "./modules/patients/patients.routes.js";
import { visitsRouter } from "./modules/visits/visits.routes.js";
import { invoicesRouter } from "./modules/invoices/invoices.routes.js";
import { settingsRouter } from "./modules/settings/settings.routes.js";
import { doctorsRouter } from "./modules/doctors/doctors.routes.js";
import { ipdRouter } from "./modules/ipd/ipd.routes.js";
import { prescriptionsRouter } from "./modules/prescriptions/prescriptions.routes.js";
import { reportsRouter } from "./modules/reports/reports.routes.js";
import { roomsRouter } from "./modules/rooms/rooms.routes.js";
import { logInfo, requestLogContext } from "./utils/logger.js";
import { getMetricsSnapshot, recordRequestMetric } from "./utils/metrics.js";

const app = express();

const origins = env.corsOrigin
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins.includes("*") ? true : origins,
    credentials: false,
  }),
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  req.headers["x-request-id"] = req.headers["x-request-id"] ?? requestId;
  res.setHeader("x-request-id", String(req.headers["x-request-id"]));
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    recordRequestMetric(durationMs);
    logInfo("request.completed", {
      ...requestLogContext(req),
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
});

app.use(morgan("dev"));

if (env.enableFileLogging) {
  fs.mkdirSync(env.logDir, { recursive: true });
  const logPath = path.join(env.logDir, "backend.log");
  const stream = fs.createWriteStream(logPath, { flags: "a" });
  app.use(morgan("combined", { stream }));
}

app.use(
  `/${env.uploadUrlPath}`,
  express.static(env.uploadDirPath, {
    etag: true,
    maxAge: env.nodeEnv === "production" ? "7d" : 0,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".svg")) {
        res.setHeader("Content-Type", "image/svg+xml");
      }
      res.setHeader("Cache-Control", env.nodeEnv === "production" ? "public, max-age=604800, immutable" : "no-cache");
    },
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get("/api/metrics", (_req, res) => {
  res.json({ data: getMetricsSnapshot() });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/visits", visitsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/ipd", ipdRouter);
app.use("/api/prescriptions", prescriptionsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/rooms", roomsRouter);

if (env.frontendDistDir && fs.existsSync(env.frontendDistDir)) {
  const frontendFallbackPattern = new RegExp(`^(?!\\/api|\\/${env.uploadUrlPath}).*`);
  app.use(express.static(env.frontendDistDir));
  app.get(frontendFallbackPattern, (_req, res) => {
    res.sendFile(path.join(env.frontendDistDir!, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
