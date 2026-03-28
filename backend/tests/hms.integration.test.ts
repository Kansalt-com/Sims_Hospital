import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-with-uppercase-1!";
process.env.ENABLE_FILE_LOGGING = "false";
process.env.CORS_ORIGIN = "http://localhost:5173";

const baseDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const baseDirectUrl = process.env.TEST_DIRECT_URL ?? process.env.DIRECT_URL ?? baseDatabaseUrl;
const shouldRun = Boolean(baseDatabaseUrl && baseDirectUrl);
const testSchema = `test_${randomUUID().replace(/-/g, "")}`;

const withSchema = (connectionString: string, schema: string) => {
  const url = new URL(connectionString);
  url.searchParams.set("schema", schema);
  return url.toString();
};

if (shouldRun) {
  process.env.DATABASE_URL = withSchema(baseDatabaseUrl!, testSchema);
  process.env.DIRECT_URL = withSchema(baseDirectUrl!, testSchema);
}

type Runtime = {
  app: typeof import("../src/app.js").app;
  initializeRuntime: typeof import("../src/bootstrap/startup.js").initializeRuntime;
  prisma: typeof import("../src/db/prisma.js").prisma;
  hashPassword: typeof import("../src/utils/password.js").hashPassword;
};

let runtime: Runtime | null = null;
let server: Awaited<ReturnType<typeof import("node:http").createServer>> | null = null;
let baseUrl = "";
let receptionToken = "";
let doctorToken = "";
let doctorId = 0;
let createdPatientId = 0;
let createdVisitId = 0;
let createdInvoiceId = 0;
let createdAdmissionId = 0;

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const jsonFetch = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  const body = await response.json();
  return {
    status: response.status,
    body,
  };
};

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

test(
  "integration tests require TEST_DATABASE_URL/TEST_DIRECT_URL or DATABASE_URL/DIRECT_URL",
  { skip: shouldRun },
  (t) => {
    t.diagnostic(
      "Skipping HMS integration suite because no PostgreSQL test connection was provided.",
    );
  },
);

before(async () => {
  if (!shouldRun) {
    return;
  }

  execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "prisma:push", "--", "--skip-generate"], {
    cwd: backendRoot,
    env: process.env,
    stdio: "pipe",
  });

  runtime = {
    app: (await import("../src/app.js")).app,
    initializeRuntime: (await import("../src/bootstrap/startup.js")).initializeRuntime,
    prisma: (await import("../src/db/prisma.js")).prisma,
    hashPassword: (await import("../src/utils/password.js")).hashPassword,
  };

  const activeRuntime = runtime;
  if (!activeRuntime) {
    throw new Error("Failed to initialize test runtime");
  }

  await activeRuntime.initializeRuntime();

  const receptionPassword = "Reception@12345";
  const doctorPassword = "Doctor@12345";

  const reception = await activeRuntime.prisma.user.upsert({
    where: { username: "reception.test" },
    update: {},
    create: {
      name: "Reception Test",
      username: "reception.test",
      role: "RECEPTION",
      passwordHash: await activeRuntime.hashPassword(receptionPassword),
      active: true,
      forcePasswordChange: false,
    },
  });

  const doctor = await activeRuntime.prisma.user.upsert({
    where: { username: "doctor.test" },
    update: {},
    create: {
      name: "Dr. Test",
      username: "doctor.test",
      role: "DOCTOR",
      passwordHash: await activeRuntime.hashPassword(doctorPassword),
      active: true,
      forcePasswordChange: false,
      doctorProfile: {
        create: {
          qualification: "MBBS, MD",
          specialization: "General Medicine",
        },
      },
    },
    include: {
      doctorProfile: true,
    },
  });

  doctorId = doctor.id;

  server = activeRuntime.app.listen(0);
  await new Promise<void>((resolve) => server!.once("listening", () => resolve()));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not determine test server address");
  }
  baseUrl = `http://127.0.0.1:${address.port}/api`;

  const receptionLogin = await jsonFetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: reception.username,
      password: receptionPassword,
    }),
  });
  receptionToken = receptionLogin.body.token;

  const doctorLogin = await jsonFetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: doctor.username,
      password: doctorPassword,
    }),
  });
  doctorToken = doctorLogin.body.token;
});

after(async () => {
  if (!shouldRun) {
    return;
  }

  if (runtime) {
    await runtime.prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${testSchema}" CASCADE`);
    await runtime.prisma.$disconnect();
  }

  await new Promise<void>((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe("enterprise HMS workflow", { concurrency: false, skip: !shouldRun }, () => {
  test("registers a patient through the secured API", async () => {
    const response = await jsonFetch(`${baseUrl}/patients`, {
      method: "POST",
      headers: authHeaders(receptionToken),
      body: JSON.stringify({
        name: "Priya Enterprise",
        age: 32,
        gender: "FEMALE",
        phone: "9999912345",
        address: "Bengaluru",
      }),
    });

    assert.equal(response.status, 201);
    assert.ok(response.body.data.id);
    assert.match(response.body.data.mrn, /^MRN-/);
    createdPatientId = response.body.data.id;
  });

  test("creates OPD billing and auto-generates a printable prescription sheet after payment", async () => {
    const visitResponse = await jsonFetch(`${baseUrl}/visits`, {
      method: "POST",
      headers: authHeaders(receptionToken),
      body: JSON.stringify({
        patientId: createdPatientId,
        doctorId,
        type: "OPD",
        consultationFee: 650,
        reason: "Fever with cough",
      }),
    });

    assert.equal(visitResponse.status, 201);
    createdVisitId = visitResponse.body.data.id;

    const invoiceResponse = await jsonFetch(`${baseUrl}/invoices`, {
      method: "POST",
      headers: authHeaders(receptionToken),
      body: JSON.stringify({
        visitId: createdVisitId,
        invoiceType: "OPD",
        items: [
          {
            category: "CONSULTATION",
            name: "Consultation Fee",
            qty: 1,
            unitPrice: 650,
            discount: 0,
            tax: 0,
          },
        ],
        payments: [
          {
            paymentMode: "CASH",
            amount: 650,
          },
        ],
      }),
    });

    assert.equal(invoiceResponse.status, 201);
    assert.equal(invoiceResponse.body.data.paymentStatus, "PAID");
    assert.equal(invoiceResponse.body.data.dueAmount, 0);
    createdInvoiceId = invoiceResponse.body.data.id;

    const visitDetails = await jsonFetch(`${baseUrl}/visits/${createdVisitId}`, {
      headers: authHeaders(receptionToken),
    });

    assert.equal(visitDetails.status, 200);
    assert.equal(visitDetails.body.data.invoice.id, createdInvoiceId);
    assert.equal(visitDetails.body.data.prescription.invoiceId, createdInvoiceId);
  });

  test("allows the assigned doctor to complete the prescription after billing clearance", async () => {
    const response = await jsonFetch(`${baseUrl}/visits/${createdVisitId}/prescription`, {
      method: "PUT",
      headers: authHeaders(doctorToken),
      body: JSON.stringify({
        symptoms: "Fever, cough",
        diagnosis: "Upper respiratory tract infection",
        advice: "Rest and hydration",
        items: [
          {
            medicine: "Paracetamol 650",
            dosage: "1 tablet",
            frequency: "Twice daily",
            durationDays: 3,
            instruction: "After food",
          },
        ],
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.visitId, createdVisitId);
    assert.match(response.body.data.itemsJson, /Paracetamol/);
  });

  test("admits OPD patient to IPD, occupies a bed, and releases it on discharge", async () => {
    const roomsResponse = await jsonFetch(`${baseUrl}/rooms`, {
      headers: authHeaders(receptionToken),
    });
    assert.equal(roomsResponse.status, 200);

    const room = roomsResponse.body.data.find((entry: any) =>
      entry.beds.some((bed: any) => bed.status === "AVAILABLE" || bed.status === "RESERVED"),
    );
    assert.ok(room);
    const bed = room.beds.find((entry: any) => entry.status === "AVAILABLE" || entry.status === "RESERVED");
    assert.ok(bed);

    const transferResponse = await jsonFetch(`${baseUrl}/visits/${createdVisitId}/transfer-to-ipd`, {
      method: "POST",
      headers: authHeaders(receptionToken),
      body: JSON.stringify({
        attendingDoctorId: doctorId,
        roomId: room.id,
        bedId: bed.id,
        ward: room.ward,
        room: room.name,
        bed: bed.bedNumber,
        diagnosis: "Observation",
        reason: "Requires inpatient monitoring",
      }),
    });

    assert.equal(transferResponse.status, 201);
    createdAdmissionId = transferResponse.body.data.id;
    assert.equal(transferResponse.body.data.bedId, bed.id);

    const occupiedBed = await runtime!.prisma.bed.findUniqueOrThrow({ where: { id: bed.id } });
    assert.equal(occupiedBed.status, "OCCUPIED");

    const dischargeResponse = await jsonFetch(`${baseUrl}/ipd/${createdAdmissionId}/discharge`, {
      method: "POST",
      headers: authHeaders(doctorToken),
      body: JSON.stringify({
        dischargeNote: "Stable for discharge",
      }),
    });

    assert.equal(dischargeResponse.status, 200);
    assert.equal(dischargeResponse.body.data.status, "DISCHARGED");

    const releasedBed = await runtime!.prisma.bed.findUniqueOrThrow({ where: { id: bed.id } });
    assert.equal(releasedBed.status, "AVAILABLE");
  });
});
