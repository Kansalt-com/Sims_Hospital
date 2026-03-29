import { z } from "zod";
import { GENDERS, VISIT_STATUSES, VISIT_TYPES } from "../../types/domain.js";

export const createVisitSchema = z
  .object({
    patientId: z.number().int().positive().optional(),
    patient: z
      .object({
        name: z.string().min(2),
        age: z.number().int().min(0).max(130).optional(),
        gender: z.enum(GENDERS),
        phone: z.string().min(7).max(15),
        address: z.string().min(2),
        idProof: z.string().max(100).optional(),
      })
      .optional(),
    doctorId: z.number().int().positive(),
    consultationFee: z.number().nonnegative().optional(),
    type: z.enum(VISIT_TYPES).default("OPD"),
    reason: z.string().max(500).optional(),
    scheduledAt: z.string().datetime().optional(),
  })
  .refine((data) => data.patientId || data.patient, {
    message: "Either patientId or patient object is required",
  });

export const listQuerySchema = z.object({
  doctorId: z.string().regex(/^\d+$/).optional(),
  date: z.string().optional(),
  status: z.enum(VISIT_STATUSES).optional(),
  type: z.enum(VISIT_TYPES).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  q: z.string().optional(),
  compact: z
    .union([z.literal("true"), z.literal("false")])
    .optional(),
});

export const idParamsSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

export const statusSchema = z.object({
  status: z.enum(VISIT_STATUSES),
});

export const noteSchema = z.object({
  text: z.string().min(2).max(5000),
});

export const prescriptionSchema = z.object({
  symptoms: z.string().max(5000).optional(),
  diagnosis: z.string().max(5000).optional(),
  advice: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
  items: z
    .array(
      z.object({
        medicine: z.string().min(1),
        dosage: z.string().min(1),
        frequency: z.string().min(1),
        durationDays: z.number().int().min(1).max(365),
        instruction: z.string().optional(),
      }),
    )
    .min(1),
});

export const transferToIpdSchema = z.object({
  attendingDoctorId: z.number().int().positive().optional(),
  roomId: z.number().int().positive().optional(),
  bedId: z.number().int().positive().optional(),
  ward: z.string().min(1).max(120),
  room: z.string().min(1).max(120),
  bed: z.string().min(1).max(120),
  diagnosis: z.string().max(5000).optional(),
  reason: z.string().max(5000).optional(),
  notes: z.string().max(1000).optional(),
  admittedAt: z.string().datetime().optional(),
});

export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type VisitListQuery = z.infer<typeof listQuerySchema>;
export type VisitStatusInput = z.infer<typeof statusSchema>;
export type VisitNoteInput = z.infer<typeof noteSchema>;
export type VisitPrescriptionInput = z.infer<typeof prescriptionSchema>;
export type TransferToIpdInput = z.infer<typeof transferToIpdSchema>;
