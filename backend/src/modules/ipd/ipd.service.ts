import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { prisma } from "../../db/prisma.js";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import { writeAuditLog } from "../../services/audit.service.js";
import { assertBedAvailability, setBedOccupancy } from "../../services/beds.service.js";
import { AppError } from "../../utils/appError.js";
import { parsePage } from "../../utils/pagination.js";
import type {
  CreateAdmissionInput,
  DischargeAdmissionInput,
  IpdListQuery,
  UpdateAdmissionInput,
} from "./ipd.validation.js";

export const listAdmissions = async (query: IpdListQuery, requestUser?: AuthenticatedRequest["user"]) => {
  const { q, status, doctorId, date, page, pageSize } = query;
  const { skip, take, page: safePage, pageSize: safeSize } = parsePage(page, pageSize);

  const selectedDay = date ? dayjs(date) : null;
  const dayStart = selectedDay?.startOf("day").toDate();
  const dayEnd = selectedDay?.endOf("day").toDate();

  const where = {
    status: status ?? undefined,
    attendingDoctorId: requestUser?.role === "DOCTOR" ? requestUser.id : doctorId ? Number(doctorId) : undefined,
    admittedAt: dayStart && dayEnd ? { gte: dayStart, lte: dayEnd } : undefined,
    OR: q
      ? [
          { patient: { name: { contains: q } } },
          { patient: { phone: { contains: q } } },
          { patient: { mrn: { contains: q } } },
          { ward: { contains: q } },
          { room: { contains: q } },
          { bed: { contains: q } },
        ]
      : undefined,
  };

  const [total, rows] = await Promise.all([
    prisma.iPDAdmission.count({ where }),
    prisma.iPDAdmission.findMany({
      where,
      include: {
        patient: true,
        visit: {
          include: {
            invoice: { select: { id: true, invoiceNo: true, dueAmount: true, paymentStatus: true } },
          },
        },
        attendingDoctor: {
          select: {
            id: true,
            name: true,
            doctorProfile: { select: { qualification: true, specialization: true } },
          },
        },
        transfer: true,
        roomAllocation: true,
        bedAllocation: true,
      },
      orderBy: [{ status: "asc" }, { admittedAt: "desc" }],
      skip,
      take,
    }),
  ]);

  return {
    data: rows,
    pagination: {
      page: safePage,
      pageSize: safeSize,
      total,
      totalPages: Math.ceil(total / safeSize),
    },
  };
};

export const getAdmissionById = async (admissionId: number) => {
  const admission = await prisma.iPDAdmission.findUnique({
    where: { id: admissionId },
    include: {
      patient: true,
      visit: {
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              doctorProfile: { select: { qualification: true, specialization: true } },
            },
          },
          invoice: { include: { payments: true, items: true } },
          prescription: true,
          notes: { orderBy: { createdAt: "desc" } },
        },
      },
      attendingDoctor: {
        select: {
          id: true,
          name: true,
          doctorProfile: { select: { qualification: true, specialization: true } },
        },
      },
      transfer: true,
      roomAllocation: true,
      bedAllocation: {
        include: {
          room: true,
        },
      },
    },
  });

  if (!admission) {
    throw new AppError("IPD admission not found", 404, "ADMISSION_NOT_FOUND");
  }

  return admission;
};

export const createAdmission = async (payload: CreateAdmissionInput, req: AuthenticatedRequest) => {
  const [patient, doctor] = await Promise.all([
    prisma.patient.findUnique({ where: { id: payload.patientId } }),
    prisma.user.findFirst({ where: { id: payload.attendingDoctorId, role: "DOCTOR", active: true } }),
  ]);

  if (!patient) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }

  if (!doctor) {
    throw new AppError("Attending doctor not found", 400, "DOCTOR_NOT_FOUND");
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const selectedBed = await assertBedAvailability(tx, payload.roomId, payload.bedId);

    const visit = await tx.visit.create({
      data: {
        patientId: payload.patientId,
        doctorId: payload.attendingDoctorId,
        createdById: req.user?.id,
        type: "IPD",
        status: "IN_PROGRESS",
        consultationFee: 0,
        reason: payload.reason ?? null,
        scheduledAt: payload.admittedAt ? new Date(payload.admittedAt) : new Date(),
      },
    });

    const admission = await tx.iPDAdmission.create({
      data: {
        visitId: visit.id,
        patientId: payload.patientId,
        attendingDoctorId: payload.attendingDoctorId,
        roomId: payload.roomId ?? null,
        bedId: payload.bedId ?? null,
        ward: payload.ward,
        room: selectedBed?.room.name ?? payload.room,
        bed: selectedBed?.bedNumber ?? payload.bed,
        diagnosis: payload.diagnosis ?? null,
        reason: payload.reason ?? null,
        admittedAt: payload.admittedAt ? new Date(payload.admittedAt) : new Date(),
        createdById: req.user?.id,
      },
      include: {
        patient: true,
        visit: true,
        attendingDoctor: { select: { id: true, name: true } },
        roomAllocation: true,
        bedAllocation: true,
      },
    });

    await setBedOccupancy(tx, payload.bedId, "OCCUPIED");

    await writeAuditLog({
      actorId: req.user?.id,
      action: "ipd.admit",
      entityType: "ipdAdmission",
      entityId: admission.id,
      description: "Patient admitted directly to IPD",
      patientId: payload.patientId,
      visitId: visit.id,
      admissionId: admission.id,
      request: req,
      client: tx,
    });

    return admission;
  });
};

export const updateAdmission = async (admissionId: number, payload: UpdateAdmissionInput, req: AuthenticatedRequest) => {
  const existing = await prisma.iPDAdmission.findUnique({ where: { id: admissionId } });
  if (!existing) {
    throw new AppError("IPD admission not found", 404, "ADMISSION_NOT_FOUND");
  }

  if (payload.status === "DISCHARGED") {
    throw new AppError("Use the discharge action to complete discharge", 400, "USE_DISCHARGE_ACTION");
  }

  if (existing.status === "DISCHARGED") {
    throw new AppError("Discharged admissions cannot be updated", 400, "DISCHARGED_ADMISSION_LOCKED");
  }

  if (payload.attendingDoctorId) {
    const doctor = await prisma.user.findFirst({
      where: { id: payload.attendingDoctorId, role: "DOCTOR", active: true },
      select: { id: true },
    });
    if (!doctor) {
      throw new AppError("Attending doctor not found", 400, "DOCTOR_NOT_FOUND");
    }
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const nextRoomId = payload.roomId === null ? null : payload.roomId ?? existing.roomId;
    const nextBedId = payload.bedId === null ? null : payload.bedId ?? existing.bedId;
    const selectedBed = await assertBedAvailability(tx, nextRoomId, nextBedId);

    if (existing.bedId && existing.bedId !== nextBedId) {
      await setBedOccupancy(tx, existing.bedId, "AVAILABLE");
    }

    if (nextBedId && existing.bedId !== nextBedId) {
      await setBedOccupancy(tx, nextBedId, "OCCUPIED");
    }

    const row = await tx.iPDAdmission.update({
      where: { id: admissionId },
      data: {
        attendingDoctorId: payload.attendingDoctorId ?? undefined,
        status: payload.status ?? undefined,
        roomId: payload.roomId === undefined ? undefined : payload.roomId,
        bedId: payload.bedId === undefined ? undefined : payload.bedId,
        ward: payload.ward ?? undefined,
        room: selectedBed?.room.name ?? payload.room ?? undefined,
        bed: selectedBed?.bedNumber ?? payload.bed ?? undefined,
        diagnosis: payload.diagnosis ?? undefined,
        reason: payload.reason ?? undefined,
      },
      include: {
        patient: true,
        visit: true,
        attendingDoctor: { select: { id: true, name: true } },
        roomAllocation: true,
        bedAllocation: true,
      },
    });

    await writeAuditLog({
      actorId: req.user?.id,
      action: "ipd.update",
      entityType: "ipdAdmission",
      entityId: row.id,
      description: "IPD admission updated",
      patientId: row.patientId,
      visitId: row.visitId,
      admissionId: row.id,
      request: req,
      client: tx,
    });

    return row;
  });
};

export const dischargeAdmission = async (admissionId: number, payload: DischargeAdmissionInput, req: AuthenticatedRequest) => {
  const admission = await prisma.iPDAdmission.findUnique({
    where: { id: admissionId },
    include: { visit: true },
  });

  if (!admission) {
    throw new AppError("IPD admission not found", 404, "ADMISSION_NOT_FOUND");
  }

  if (admission.status === "DISCHARGED") {
    throw new AppError("Patient is already discharged", 400, "ALREADY_DISCHARGED");
  }

  if (req.user?.role === "DOCTOR" && admission.attendingDoctorId !== req.user.id) {
    throw new AppError("You can only discharge your assigned IPD patients", 403, "FORBIDDEN");
  }

  const dischargeAt = payload.dischargedAt ? new Date(payload.dischargedAt) : new Date();

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const row = await tx.iPDAdmission.update({
      where: { id: admission.id },
      data: {
        status: "DISCHARGED",
        dischargedAt: dischargeAt,
        dischargedById: req.user?.id,
      },
      include: {
        patient: true,
        visit: true,
        attendingDoctor: { select: { id: true, name: true } },
        roomAllocation: true,
        bedAllocation: true,
      },
    });

    await tx.visit.update({
      where: { id: admission.visitId },
      data: {
        status: "COMPLETED",
        completedAt: dischargeAt,
      },
    });

    await setBedOccupancy(tx, admission.bedId, "AVAILABLE");

    await writeAuditLog({
      actorId: req.user?.id,
      action: "ipd.discharge",
      entityType: "ipdAdmission",
      entityId: admission.id,
      description: "Patient discharged from IPD",
      patientId: admission.patientId,
      visitId: admission.visitId,
      admissionId: admission.id,
      request: req,
      metadata: {
        dischargedAt: dischargeAt.toISOString(),
      },
      client: tx,
    });

    return row;
  });
};
