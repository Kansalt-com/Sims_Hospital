import { z } from "zod";
import { IPD_ADMISSION_STATUSES } from "../../types/domain.js";

export const listQuerySchema = z.object({
  q: z.string().optional(),
  status: z.enum(IPD_ADMISSION_STATUSES).optional(),
  doctorId: z.string().regex(/^\d+$/).optional(),
  date: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

export const idParamsSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

export const createAdmissionSchema = z.object({
  patientId: z.number().int().positive(),
  attendingDoctorId: z.number().int().positive(),
  roomId: z.number().int().positive().optional(),
  bedId: z.number().int().positive().optional(),
  ward: z.string().min(1).max(120),
  room: z.string().min(1).max(120),
  bed: z.string().min(1).max(120),
  diagnosis: z.string().max(5000).optional(),
  reason: z.string().max(5000).optional(),
  admittedAt: z.string().datetime().optional(),
});

export const updateAdmissionSchema = z.object({
  attendingDoctorId: z.number().int().positive().optional(),
  status: z.enum(IPD_ADMISSION_STATUSES).optional(),
  roomId: z.number().int().positive().optional().nullable(),
  bedId: z.number().int().positive().optional().nullable(),
  ward: z.string().min(1).max(120).optional(),
  room: z.string().min(1).max(120).optional(),
  bed: z.string().min(1).max(120).optional(),
  diagnosis: z.string().max(5000).optional().nullable(),
  reason: z.string().max(5000).optional().nullable(),
});

export const dischargeSchema = z.object({
  dischargedAt: z.string().datetime().optional(),
});

export type IpdListQuery = z.infer<typeof listQuerySchema>;
export type CreateAdmissionInput = z.infer<typeof createAdmissionSchema>;
export type UpdateAdmissionInput = z.infer<typeof updateAdmissionSchema>;
export type DischargeAdmissionInput = z.infer<typeof dischargeSchema>;
