import { api } from "./client";
import type {
  AnalyticsReport,
  DashboardSnapshot,
  DoctorProfile,
  HospitalSettings,
  IPDAdmission,
  Invoice,
  InvoiceListResponse,
  Patient,
  Prescription,
  Room,
  User,
  Visit,
  VisitListResponse,
} from "../types";

type DoctorPayload = {
  fullName: string;
  qualification: string;
  specialization: string;
  experienceYears?: number;
  registrationNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  username: string;
  password: string;
  active?: boolean;
};

type UpdateDoctorPayload = Partial<DoctorPayload>;

type PatientPayload = {
  name: string;
  age?: number;
  dob?: string | null;
  gender: string;
  phone: string;
  address: string;
  idProof?: string | null;
};

type VisitCreatePayload = {
  patientId?: number;
  patient?: {
    name: string;
    age?: number;
    gender: string;
    phone: string;
    address: string;
    idProof?: string;
  };
  doctorId: number;
  consultationFee?: number;
  type: "OPD" | "IPD";
  reason?: string;
  scheduledAt?: string;
};

type VisitPrescriptionPayload = {
  symptoms?: string;
  diagnosis?: string;
  advice?: string;
  items: Array<{
    medicine: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instruction?: string;
  }>;
};

type TransferToIpdPayload = {
  attendingDoctorId?: number;
  roomId?: number;
  bedId?: number;
  ward: string;
  room: string;
  bed: string;
  diagnosis?: string;
  reason?: string;
  notes?: string;
  admittedAt?: string;
};

type InvoiceCreatePayload = {
  visitId: number;
  invoiceType: "OPD" | "IPD" | "PHARMACY" | "LAB" | "GENERAL";
  items: Array<{
    category: "CONSULTATION" | "LAB" | "RADIOLOGY" | "PROCEDURE" | "MEDICINE" | "MISC";
    name: string;
    qty: number;
    unitPrice: number;
  }>;
  payments?: Array<{
    paymentMode: "CASH" | "UPI" | "CARD" | "INSURANCE";
    amount: number;
    referenceNo?: string;
  }>;
  notes?: string;
};

type InvoiceItemsPayload = {
  items: Array<{
    category: "CONSULTATION" | "LAB" | "RADIOLOGY" | "PROCEDURE" | "MEDICINE" | "MISC";
    name: string;
    qty: number;
    unitPrice: number;
  }>;
  payments?: Array<{
    paymentMode: "CASH" | "UPI" | "CARD" | "INSURANCE";
    amount: number;
    referenceNo?: string;
  }>;
  notes?: string;
};

type InvoicePaymentsPayload = {
  payments: Array<{
    paymentMode: "CASH" | "UPI" | "CARD" | "INSURANCE";
    amount: number;
    referenceNo?: string;
  }>;
};

type ChangePasswordResponse = {
  message: string;
  token?: string;
};

export const authApi = {
  login: (payload: { username: string; password: string }) =>
    api.post<{ token: string; user: User }>("/auth/login", payload),
  me: () => api.get<{ user: User }>("/auth/me"),
  changePassword: (payload: { oldPassword: string; newPassword: string }) =>
    api.post<ChangePasswordResponse>("/auth/change-password", payload),
};

export const userApi = {
  list: () => api.get<{ data: User[] }>("/users"),
  create: (payload: { name: string; username: string; role: string; password: string }) =>
    api.post("/users", payload),
  update: (id: number, payload: Partial<{ name: string; role: string; active: boolean }>) =>
    api.patch(`/users/${id}`, payload),
  resetPassword: (id: number, password: string) => api.post(`/users/${id}/reset-password`, { password }),
  remove: (id: number) => api.delete(`/users/${id}`),
};

export const doctorApi = {
  list: (params?: { active?: boolean; q?: string }) =>
    api.get<{ data: Array<User & { doctorProfile?: DoctorProfile | null }> }>("/doctors", {
      params: {
        active: params?.active === undefined ? undefined : String(params.active),
        q: params?.q,
      },
    }),
  get: (id: number) => api.get<{ data: User & { doctorProfile?: DoctorProfile | null } }>(`/doctors/${id}`),
  create: (payload: DoctorPayload) => api.post("/doctors", payload),
  update: (id: number, payload: UpdateDoctorPayload) => api.patch(`/doctors/${id}`, payload),
  uploadSignature: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("signature", file);
    return api.post(`/doctors/${id}/signature`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const patientApi = {
  list: (params: { q?: string; page?: number; pageSize?: number; limit?: number; active?: boolean }) =>
    api.get<{ data: Patient[]; pagination: { total: number; page: number; totalPages: number } }>("/patients", {
      params,
    }),
  search: (q: string, active?: boolean) =>
    api.get<{ data: Patient[]; total: number; page: number; limit: number }>("/patients/search", {
      params: { q, active },
    }),
  get: (id: number) =>
    api.get<{ data: Patient & { visits: Visit[]; ipdAdmissions?: IPDAdmission[]; prescriptions?: Prescription[] } }>(`/patients/${id}`),
  create: (payload: PatientPayload) => api.post<{ data: Patient }>("/patients", payload),
  bulkUpload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<{
      data: {
        totalRows: number;
        inserted: number;
        failed: number;
        successRecords: Array<{ row: number; name: string; mrn: string }>;
        failedRecords: Array<{ row: number; reason: string; payload?: Record<string, unknown> }>;
      };
    }>("/patients/bulk-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  update: (id: number, payload: PatientPayload) => api.put<{ data: Patient }>(`/patients/${id}`, payload),
  remove: (id: number) => api.delete(`/patients/${id}`),
};

export const visitApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<VisitListResponse>("/visits", { params }),
  get: (id: number) =>
    api.get<{
      data: Visit & {
        notes: Array<{ id: number; text: string; createdAt: string; doctor: { name: string } }>;
        prescription?: {
          itemsJson: string;
          symptoms?: string | null;
          diagnosis?: string | null;
          advice?: string | null;
        } | null;
      };
    }>(`/visits/${id}`),
  create: (payload: VisitCreatePayload) => api.post<{ data: Visit }>("/visits", payload),
  updateStatus: (id: number, status: string) => api.patch(`/visits/${id}/status`, { status }),
  addNote: (id: number, text: string) => api.post(`/visits/${id}/notes`, { text }),
  savePrescription: (id: number, payload: VisitPrescriptionPayload) => api.put(`/visits/${id}/prescription`, payload),
  transferToIpd: (id: number, payload: TransferToIpdPayload) => api.post(`/visits/${id}/transfer-to-ipd`, payload),
};

export const ipdApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<{ data: IPDAdmission[]; pagination: { total: number; page: number; totalPages: number } }>("/ipd", { params }),
  get: (id: number) => api.get<{ data: IPDAdmission }>(`/ipd/${id}`),
  create: (payload: {
    patientId: number;
    attendingDoctorId: number;
    roomId?: number;
    bedId?: number;
    ward: string;
    room: string;
    bed: string;
    diagnosis?: string;
    reason?: string;
    admittedAt?: string;
  }) => api.post<{ data: IPDAdmission }>("/ipd", payload),
  update: (
    id: number,
    payload: Partial<{
      attendingDoctorId: number;
      status: "ADMITTED" | "UNDER_TREATMENT" | "RECOVERED" | "DISCHARGED";
      roomId?: number | null;
      bedId?: number | null;
      ward: string;
      room: string;
      bed: string;
      diagnosis: string | null;
      reason: string | null;
    }>,
  ) => api.patch<{ data: IPDAdmission }>(`/ipd/${id}`, payload),
  discharge: (id: number, payload?: { dischargedAt?: string }) =>
    api.post<{ data: IPDAdmission }>(`/ipd/${id}/discharge`, payload ?? {}),
};

export const invoiceApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<InvoiceListResponse>("/invoices", { params }),
  listCancelled: () =>
    api.get<{
      data: Array<{
        id: number;
        action: string;
        createdAt: string;
        description?: string | null;
        actor?: { id: number; name: string; username: string } | null;
        invoiceId?: number | null;
        metadata?: Record<string, unknown> | null;
      }>;
    }>("/invoices/cancelled"),
  get: (id: number) => api.get<{ data: Invoice; settings: HospitalSettings }>(`/invoices/${id}`),
  create: (payload: InvoiceCreatePayload) =>
    api.post<{ data: Invoice & { prescription?: { id: number; visitId: number } | null } }>("/invoices", payload),
  addItems: (id: number, payload: InvoiceItemsPayload) =>
    api.post<{ data: Invoice }>(`/invoices/${id}/items`, payload),
  addPayments: (id: number, payload: InvoicePaymentsPayload) =>
    api.post<{ data: Invoice }>(`/invoices/${id}/payments`, payload),
  cancel: (id: number) => api.delete<{ message: string }>(`/invoices/${id}`),
};

export const prescriptionApi = {
  list: (params?: { patientId?: number; visitId?: number }) =>
    api.get<{
      data: Array<
        Prescription & {
          patient?: { id: number; name: string; mrn: string; age?: number | null; gender: string } | null;
          doctor: { id: number; name: string; doctorProfile?: { qualification?: string; specialization?: string; signaturePath?: string | null } | null };
          visit: { id: number; scheduledAt: string; status: string; type: string };
          invoice?: { id: number; invoiceNo: string; dueAmount: number } | null;
        }
      >;
    }>("/prescriptions", { params }),
  markPrinted: (id: number) => api.post(`/prescriptions/${id}/mark-printed`),
};

export const settingsApi = {
  getPublic: () =>
    api.get<{ data: Pick<HospitalSettings, "id" | "hospitalName" | "logoPath" | "kansaltLogoPath" | "updatedAt"> | null }>("/settings/public"),
  get: () => api.get<{ data: HospitalSettings }>("/settings"),
  update: (payload: {
    hospitalName: string;
    address: string;
    phone: string;
    gstin?: string | null;
    defaultConsultationFee: number;
    invoicePrefix: string;
    invoiceSequence: number;
    footerNote?: string | null;
    kansaltLogoPath?: string | null;
  }) => api.put<{ data: HospitalSettings }>("/settings", payload),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    return api.post<{ data: HospitalSettings }>("/settings/logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  uploadKansaltLogo: (file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    return api.post<{ data: HospitalSettings }>("/settings/kansalt-logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const roomApi = {
  list: () => api.get<{ data: Room[] }>("/rooms"),
};

export const reportsApi = {
  dashboard: (date?: string) => api.get<{ data: DashboardSnapshot }>("/reports/dashboard", { params: { date } }),
  analytics: (params?: { date?: string; fromDate?: string; toDate?: string }) =>
    api.get<{ data: AnalyticsReport }>("/reports/analytics", { params }),
  exportAnalytics: (params?: { date?: string; fromDate?: string; toDate?: string }) =>
    api.get<Blob>("/reports/analytics/export", {
      params,
      responseType: "blob",
    }),
};
