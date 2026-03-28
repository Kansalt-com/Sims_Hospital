import dayjs from "dayjs";
import { prisma } from "../../db/prisma.js";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import { writeAuditLog } from "../../services/audit.service.js";
import { assertBedAvailability, setBedOccupancy } from "../../services/beds.service.js";
import { AppError } from "../../utils/appError.js";
import { generateMrn } from "../../utils/id.js";
import { parsePage } from "../../utils/pagination.js";
import type {
  CreateVisitInput,
  TransferToIpdInput,
  VisitListQuery,
  VisitNoteInput,
  VisitPrescriptionInput,
} from "./visits.validation.js";

export const listVisits = async (query: VisitListQuery, requestUser?: AuthenticatedRequest["user"]) => {
  const { doctorId, date, status, type, page, pageSize, q } = query;
  const { skip, take, page: safePage, pageSize: safeSize } = parsePage(page, pageSize);

  const selectedDay = date ? dayjs(date) : null;
  const dayStart = selectedDay?.startOf("day").toDate();
  const dayEnd = selectedDay?.endOf("day").toDate();

  const resolvedDoctorId =
    requestUser?.role === "DOCTOR" ? requestUser.id : doctorId ? Number(doctorId) : undefined;

  const where = {
    doctorId: resolvedDoctorId,
    status: status ?? undefined,
    type: type ?? undefined,
    scheduledAt: dayStart && dayEnd ? { gte: dayStart, lte: dayEnd } : undefined,
    OR: q
      ? [
          { patient: { name: { contains: q } } },
          { patient: { phone: { contains: q } } },
          { patient: { mrn: { contains: q } } },
        ]
      : undefined,
  };

  const [total, rows] = await Promise.all([
    prisma.visit.count({ where }),
    prisma.visit.findMany({
      where,
      select: {
        id: true,
        patientId: true,
        doctorId: true,
        type: true,
        status: true,
        consultationFee: true,
        reason: true,
        scheduledAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        patient: {
          select: {
            id: true,
            mrn: true,
            name: true,
            age: true,
            dob: true,
            gender: true,
            phone: true,
            address: true,
            idProof: true,
            active: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            doctorProfile: { select: { qualification: true, specialization: true } },
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNo: true,
            total: true,
            paidAmount: true,
            dueAmount: true,
            paymentStatus: true,
            invoiceType: true,
          },
        },
        prescription: {
          select: {
            id: true,
            visitId: true,
            createdAt: true,
            printedAt: true,
            templateType: true,
          },
        },
        ipdAdmission: {
          select: {
            id: true,
            visitId: true,
            patientId: true,
            attendingDoctorId: true,
            roomId: true,
            bedId: true,
            status: true,
            admittedAt: true,
            dischargedAt: true,
            ward: true,
            room: true,
            bed: true,
            diagnosis: true,
            reason: true,
            createdAt: true,
            roomAllocation: true,
            bedAllocation: true,
          },
        },
        opdToIpdTransfer: {
          select: {
            id: true,
            opdVisitId: true,
            ipdAdmissionId: true,
            patientId: true,
            transferredById: true,
            notes: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { scheduledAt: "asc" }],
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

export const getVisitById = async (visitId: number) => {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      doctor: {
        select: {
          id: true,
          name: true,
          doctorProfile: { select: { qualification: true, specialization: true, signaturePath: true } },
        },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { doctor: { select: { id: true, name: true } } },
      },
      prescription: true,
      invoice: { include: { items: true, payments: true } },
      ipdAdmission: {
        include: {
          attendingDoctor: { select: { id: true, name: true } },
          transfer: true,
          roomAllocation: true,
          bedAllocation: true,
        },
      },
      opdToIpdTransfer: true,
    },
  });

  if (!visit) {
    throw new AppError("Visit not found", 404, "VISIT_NOT_FOUND");
  }

  return visit;
};

export const createVisit = async (payload: CreateVisitInput, req: AuthenticatedRequest) => {
  const doctor = await prisma.user.findFirst({
    where: {
      id: payload.doctorId,
      role: "DOCTOR",
      active: true,
    },
  });

  if (!doctor) {
    throw new AppError("Assigned doctor not found", 400, "DOCTOR_NOT_FOUND");
  }

  const settings = await prisma.hospitalSettings.findUnique({ where: { id: 1 } });
  const defaultFee = settings?.defaultConsultationFee ?? 500;

  return prisma.$transaction(async (tx) => {
    const patientId = payload.patientId
      ? payload.patientId
      : (
          await tx.patient.create({
            data: {
              mrn: generateMrn(),
              name: payload.patient!.name,
              age: payload.patient!.age ?? null,
              gender: payload.patient!.gender,
              phone: payload.patient!.phone,
              address: payload.patient!.address,
              idProof: payload.patient!.idProof ?? null,
              createdById: req.user?.id,
            },
          })
        ).id;

    const createdVisit = await tx.visit.create({
      data: {
        patientId,
        doctorId: payload.doctorId,
        createdById: req.user?.id,
        type: payload.type,
        status: "SCHEDULED",
        consultationFee: payload.consultationFee ?? defaultFee,
        reason: payload.reason ?? null,
        scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : new Date(),
      },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            name: true,
            doctorProfile: { select: { qualification: true, specialization: true } },
          },
        },
      },
    });

    await writeAuditLog({
      actorId: req.user?.id,
      action: "visit.create",
      entityType: "visit",
      entityId: createdVisit.id,
      description: `Created ${createdVisit.type} visit`,
      patientId,
      visitId: createdVisit.id,
      request: req,
      client: tx,
    });

    return createdVisit;
  });
};

export const updateVisitStatus = async (
  visitId: number,
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  req: AuthenticatedRequest,
) => {
  const visit = await prisma.visit.findUnique({ where: { id: visitId } });
  if (!visit) {
    throw new AppError("Visit not found", 404, "VISIT_NOT_FOUND");
  }

  if (req.user?.role === "DOCTOR" && visit.doctorId !== req.user.id) {
    throw new AppError("You can only update your own visits", 403, "FORBIDDEN");
  }

  const updated = await prisma.visit.update({
    where: { id: visitId },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  await writeAuditLog({
    actorId: req.user?.id,
    action: "visit.update-status",
    entityType: "visit",
    entityId: updated.id,
    description: `Visit status changed to ${status}`,
    patientId: updated.patientId,
    visitId: updated.id,
    request: req,
  });

  return updated;
};

export const addVisitNote = async (visitId: number, payload: VisitNoteInput, req: AuthenticatedRequest) => {
  const visit = await prisma.visit.findUnique({ where: { id: visitId } });
  if (!visit) {
    throw new AppError("Visit not found", 404, "VISIT_NOT_FOUND");
  }

  if (visit.doctorId !== req.user?.id) {
    throw new AppError("You can only add notes to your own visits", 403, "FORBIDDEN");
  }

  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const note = await prisma.note.create({
    data: {
      visitId: visit.id,
      doctorId: req.user.id,
      text: payload.text,
    },
    include: { doctor: { select: { id: true, name: true } } },
  });

  await writeAuditLog({
    actorId: req.user.id,
    action: "visit.add-note",
    entityType: "visit",
    entityId: visit.id,
    description: "Doctor note added",
    patientId: visit.patientId,
    visitId: visit.id,
    request: req,
  });

  return note;
};

export const saveVisitPrescription = async (visitId: number, payload: VisitPrescriptionInput, req: AuthenticatedRequest) => {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: { invoice: true },
  });
  if (!visit) {
    throw new AppError("Visit not found", 404, "VISIT_NOT_FOUND");
  }

  if (visit.doctorId !== req.user?.id) {
    throw new AppError("You can only prescribe on your own visits", 403, "FORBIDDEN");
  }

  if (!visit.invoice || visit.invoice.dueAmount > 0) {
    throw new AppError("Prescription is available only after consultation bill is fully paid", 400, "PAYMENT_REQUIRED");
  }

  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const prescription = await prisma.prescription.upsert({
    where: { visitId: visit.id },
    create: {
      visitId: visit.id,
      patientId: visit.patientId,
      doctorId: req.user.id,
      invoiceId: visit.invoice.id,
      symptoms: payload.symptoms ?? null,
      diagnosis: payload.diagnosis ?? null,
      advice: payload.advice ?? null,
      notes: payload.notes ?? null,
      itemsJson: JSON.stringify(payload.items),
    },
    update: {
      patientId: visit.patientId,
      invoiceId: visit.invoice.id,
      symptoms: payload.symptoms ?? null,
      diagnosis: payload.diagnosis ?? null,
      advice: payload.advice ?? null,
      notes: payload.notes ?? null,
      itemsJson: JSON.stringify(payload.items),
    },
  });

  await writeAuditLog({
    actorId: req.user.id,
    action: "prescription.save",
    entityType: "prescription",
    entityId: prescription.id,
    description: "Prescription updated",
    patientId: visit.patientId,
    visitId: visit.id,
    invoiceId: visit.invoice.id,
    request: req,
  });

  return prescription;
};

export const markVisitPrescriptionPrinted = async (visitId: number, req: AuthenticatedRequest) => {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: { prescription: true },
  });

  if (!visit || !visit.prescription) {
    throw new AppError("Prescription not found for this visit", 404, "PRESCRIPTION_NOT_FOUND");
  }

  if (req.user?.role === "DOCTOR" && visit.doctorId !== req.user.id) {
    throw new AppError("You can only print your own prescriptions", 403, "FORBIDDEN");
  }

  const updated = await prisma.prescription.update({
    where: { visitId },
    data: { printedAt: new Date() },
  });

  await writeAuditLog({
    actorId: req.user?.id,
    action: "prescription.print",
    entityType: "prescription",
    entityId: updated.id,
    description: "Prescription marked as printed",
    patientId: visit.patientId,
    visitId,
    request: req,
  });

  return updated;
};

export const transferOpdVisitToIpd = async (visitId: number, payload: TransferToIpdInput, req: AuthenticatedRequest) => {
  const opdVisit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      doctor: { select: { id: true } },
      opdToIpdTransfer: true,
    },
  });

  if (!opdVisit) {
    throw new AppError("Visit not found", 404, "VISIT_NOT_FOUND");
  }

  if (opdVisit.type !== "OPD") {
    throw new AppError("Only OPD visits can be transferred to IPD", 400, "INVALID_VISIT_TYPE");
  }

  if (opdVisit.opdToIpdTransfer) {
    throw new AppError("This OPD visit has already been transferred to IPD", 400, "TRANSFER_EXISTS");
  }

  const attendingDoctorId = payload.attendingDoctorId ?? opdVisit.doctorId;

  const doctor = await prisma.user.findFirst({
    where: { id: attendingDoctorId, role: "DOCTOR", active: true },
    select: { id: true },
  });

  if (!doctor) {
    throw new AppError("Attending doctor not found", 400, "DOCTOR_NOT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    const selectedBed = await assertBedAvailability(tx, payload.roomId, payload.bedId);

    const ipdVisit = await tx.visit.create({
      data: {
        patientId: opdVisit.patientId,
        doctorId: attendingDoctorId,
        createdById: req.user?.id,
        type: "IPD",
        status: "IN_PROGRESS",
        consultationFee: 0,
        reason: payload.reason ?? opdVisit.reason ?? null,
        scheduledAt: payload.admittedAt ? new Date(payload.admittedAt) : new Date(),
      },
    });

    const admission = await tx.iPDAdmission.create({
      data: {
        visitId: ipdVisit.id,
        patientId: opdVisit.patientId,
        attendingDoctorId,
        roomId: payload.roomId ?? null,
        bedId: payload.bedId ?? null,
        ward: payload.ward,
        room: selectedBed?.room.name ?? payload.room,
        bed: selectedBed?.bedNumber ?? payload.bed,
        diagnosis: payload.diagnosis ?? opdVisit.reason ?? null,
        reason: payload.reason ?? opdVisit.reason ?? null,
        admittedAt: payload.admittedAt ? new Date(payload.admittedAt) : new Date(),
        createdById: req.user?.id,
      },
      include: {
        visit: true,
        patient: true,
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
    });

    await tx.opdToIpdTransfer.create({
      data: {
        opdVisitId: opdVisit.id,
        ipdAdmissionId: admission.id,
        patientId: opdVisit.patientId,
        transferredById: req.user!.id,
        notes: payload.notes ?? null,
      },
    });

    await setBedOccupancy(tx, payload.bedId, "OCCUPIED");

    await writeAuditLog({
      actorId: req.user?.id,
      action: "visit.transfer-to-ipd",
      entityType: "ipdAdmission",
      entityId: admission.id,
      description: "OPD patient admitted to IPD",
      patientId: opdVisit.patientId,
      visitId: ipdVisit.id,
      admissionId: admission.id,
      request: req,
      metadata: {
        sourceVisitId: opdVisit.id,
        ward: payload.ward,
        room: payload.room,
        bed: payload.bed,
      },
      client: tx,
    });

    return admission;
  });
};
