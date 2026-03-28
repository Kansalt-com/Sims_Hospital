import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { hashPassword } from "../src/utils/password.js";
import { generateMrn, roundMoney } from "../src/utils/id.js";
import type { UserRoleValue } from "../src/types/domain.js";

const prisma = new PrismaClient();

const ensureUser = async (name: string, username: string, role: UserRoleValue, password: string, forcePasswordChange = false) => {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    if (forcePasswordChange && !existing.forcePasswordChange) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { forcePasswordChange: true, active: true },
      });
    }
    return existing;
  }

  return prisma.user.create({
    data: {
      name,
      username,
      role,
      passwordHash: await hashPassword(password),
      active: true,
      forcePasswordChange,
    },
  });
};

const ensureDoctorProfile = async (
  userId: number,
  payload: { qualification: string; specialization: string; registrationNumber?: string | null; phone?: string | null; email?: string | null },
) => {
  await prisma.doctorProfile.upsert({
    where: { userId },
    create: {
      userId,
      qualification: payload.qualification,
      specialization: payload.specialization,
      registrationNumber: payload.registrationNumber ?? null,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
    },
    update: {
      qualification: payload.qualification,
      specialization: payload.specialization,
      registrationNumber: payload.registrationNumber ?? null,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
    },
  });
};

async function main() {
  const admin = await ensureUser("System Admin", "admin", "ADMIN", "Admin@12345");
  await ensureUser("Rehmat Syed Khan", "RehmatSyedKhan", "ADMIN", "Rehmat@123", true);
  const reception = await ensureUser("Front Desk", "reception", "RECEPTION", "reception123");
  const doctorA = await ensureUser("Dr. Ananya Rao", "doctor1", "DOCTOR", "doctor123");
  const doctorB = await ensureUser("Dr. Vivek Sharma", "doctor2", "DOCTOR", "doctor123");
  await ensureUser("Billing Desk", "billing", "BILLING", "Billing@12345");
  await ensureUser("Pharmacy Desk", "pharmacy", "PHARMACY", "Pharmacy@12345");
  await ensureUser("Lab Technician", "labtech", "LAB_TECHNICIAN", "Labtech@12345");
  await ensureDoctorProfile(doctorA.id, {
    qualification: "MBBS, MD",
    specialization: "General Medicine",
    registrationNumber: "KMC-10021",
    phone: "9876501111",
    email: "doctor1@sims.local",
  });
  await ensureDoctorProfile(doctorB.id, {
    qualification: "MBBS, DNB",
    specialization: "Neurology",
    registrationNumber: "KMC-10022",
    phone: "9876502222",
    email: "doctor2@sims.local",
  });

  await prisma.hospitalSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      hospitalName: "SIMS Hospital",
      address: "12 Wellness Road, Bengaluru",
      phone: "+91-9876543210",
      gstin: "29ABCDE1234F1Z5",
      defaultConsultationFee: 500,
      invoicePrefix: "SIMS",
      invoiceSequence: 1,
      footerNote: "Thank you for choosing SIMS Hospital.",
      kansaltLogoPath: "/assets/branding/qode27-wordmark.svg",
      currencyCode: "INR",
      timezone: "Asia/Kolkata",
    },
  });

  const patientCount = await prisma.patient.count();
  if (patientCount === 0) {
    const patients = await Promise.all([
      prisma.patient.create({
        data: {
          mrn: generateMrn(),
          name: "Amit Verma",
          age: 34,
          gender: "MALE",
          phone: "9876500011",
          address: "HSR Layout, Bengaluru",
          createdById: reception.id,
        },
      }),
      prisma.patient.create({
        data: {
          mrn: generateMrn(),
          name: "Nisha Kulkarni",
          age: 29,
          gender: "FEMALE",
          phone: "9876500022",
          address: "Indiranagar, Bengaluru",
          createdById: admin.id,
        },
      }),
      prisma.patient.create({
        data: {
          mrn: generateMrn(),
          name: "Rohan Iyer",
          age: 45,
          gender: "MALE",
          phone: "9876500033",
          address: "Jayanagar, Bengaluru",
          createdById: reception.id,
        },
      }),
    ]);

    const visit1 = await prisma.visit.create({
      data: {
        patientId: patients[0].id,
        doctorId: doctorA.id,
        createdById: reception.id,
        type: "OPD",
        status: "IN_PROGRESS",
        consultationFee: 500,
        reason: "Fever and sore throat",
        scheduledAt: dayjs().startOf("day").add(10, "hour").toDate(),
      },
    });

    const visit2 = await prisma.visit.create({
      data: {
        patientId: patients[1].id,
        doctorId: doctorB.id,
        createdById: reception.id,
        type: "OPD",
        status: "SCHEDULED",
        consultationFee: 700,
        reason: "Migraine follow-up",
        scheduledAt: dayjs().startOf("day").add(13, "hour").toDate(),
      },
    });

    await prisma.note.create({
      data: {
        visitId: visit1.id,
        doctorId: doctorA.id,
        text: "Likely viral fever. Hydration and rest advised.",
      },
    });

    await prisma.prescription.create({
      data: {
        visitId: visit1.id,
        patientId: patients[0].id,
        doctorId: doctorA.id,
        templateType: "OP_CASE_SHEET",
        itemsJson: JSON.stringify([
          {
            medicine: "Paracetamol 650",
            dosage: "1 tablet",
            frequency: "Twice daily",
            durationDays: 3,
            instruction: "After food",
          },
        ]),
      },
    });

    const settings = await prisma.hospitalSettings.findUniqueOrThrow({ where: { id: 1 } });
    const invoiceNo = `${settings.invoicePrefix}-${dayjs().format("YYYYMMDD")}-${String(settings.invoiceSequence).padStart(4, "0")}`;

    const lineItems = [
      {
        category: "CONSULTATION",
        name: "Consultation Fee",
        qty: 1,
        unitPrice: 500,
        discount: 0,
        tax: 0,
      },
      {
        category: "LAB",
        name: "CBC Test",
        qty: 1,
        unitPrice: 300,
        discount: 0,
        tax: 0,
      },
    ] as const;

    const subtotal = lineItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const total = roundMoney(subtotal);
    const paid = 800;

    const createdInvoice = await prisma.invoice.create({
      data: {
        visitId: visit1.id,
        invoiceNo,
        patientId: patients[0].id,
        doctorId: doctorA.id,
        invoiceType: "OPD",
        subtotal,
        discount: 0,
        tax: 0,
        total,
        paidAmount: paid,
        dueAmount: 0,
        paymentStatus: "PAID",
        paymentMode: "CASH",
        createdById: reception.id,
        items: {
          create: lineItems.map((item) => ({
            ...item,
            amount: roundMoney(item.qty * item.unitPrice),
          })),
        },
      },
    });

    await prisma.payment.create({
      data: {
        invoiceId: createdInvoice.id,
        patientId: patients[0].id,
        amount: paid,
        paymentMode: "CASH",
        recordedById: reception.id,
      },
    });

    await prisma.prescription.update({
      where: { visitId: visit1.id },
      data: {
        invoiceId: createdInvoice.id,
      },
    });

    await prisma.hospitalSettings.update({
      where: { id: 1 },
      data: { invoiceSequence: settings.invoiceSequence + 1 },
    });

    await prisma.visit.update({
      where: { id: visit1.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    await prisma.note.create({
      data: {
        visitId: visit2.id,
        doctorId: doctorB.id,
        text: "Pending consultation.",
      },
    });
  }

  console.log("Seed complete");
  console.log("Admin login -> username: admin, password: Admin@12345");
  console.log("Reception login -> username: reception, password: reception123");
  console.log("Doctor login -> username: doctor1, password: doctor123");
  console.log("Billing login -> username: billing, password: Billing@12345");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
