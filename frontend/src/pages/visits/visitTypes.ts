import type { Room, Visit } from "../../types";

export type DoctorOption = {
  id: number;
  name: string;
};

export type PatientOption = {
  id: number;
  name: string;
  phone: string;
};

export type VisitFormState = {
  visitPurpose: "CONSULTATION" | "LAB_ONLY";
  patientId: string;
  doctorId: string;
  selectedCatalogItemId: string;
  consultationFee: string;
  reason: string;
  scheduledAt: string;
  newName: string;
  newAge: string;
  newGender: "MALE" | "FEMALE" | "OTHER";
  newPhone: string;
  newAddress: string;
  newIdProof: string;
};

export type TransferFormState = {
  attendingDoctorId: string;
  roomId: string;
  bedId: string;
  ward: string;
  room: string;
  bed: string;
  diagnosis: string;
  reason: string;
  notes: string;
};

export type VisitQueueItem = Visit;
export type RoomOption = Room;
