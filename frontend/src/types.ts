export type Role = "ADMIN" | "RECEPTION" | "DOCTOR" | "BILLING" | "PHARMACY" | "LAB_TECHNICIAN";

export type DoctorProfile = {
  id: number;
  userId: number;
  qualification: string;
  specialization: string;
  experienceYears?: number;
  registrationNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  signaturePath?: string | null;
};

export type User = {
  id: number;
  name: string;
  username: string;
  role: Role;
  active?: boolean;
  forcePasswordChange: boolean;
  createdAt?: string;
  updatedAt?: string;
  permissions?: string[];
  doctorProfile?: DoctorProfile | null;
};

export type ApiErrorResponse = {
  error: boolean;
  message: string;
  code: string;
};

export type Patient = {
  id: number;
  mrn: string;
  name: string;
  age?: number | null;
  dob?: string | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone: string;
  address: string;
  idProof?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Room = {
  id: number;
  ward: string;
  name: string;
  floor?: string | null;
  description?: string | null;
  active: boolean;
  beds: Bed[];
};

export type Bed = {
  id: number;
  roomId: number;
  bedNumber: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "RESERVED";
  notes?: string | null;
  active: boolean;
};

export type Visit = {
  id: number;
  patientId: number;
  doctorId: number;
  type: "OPD" | "IPD";
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  consultationFee: number;
  reason?: string | null;
  scheduledAt: string;
  completedAt?: string | null;
  createdAt: string;
  patient: Patient;
  doctor: { id: number; name: string; doctorProfile?: DoctorProfile | null };
  invoice?: {
    id: number;
    invoiceNo: string;
    total: number;
    paidAmount: number;
    dueAmount: number;
    paymentStatus: "PENDING" | "PARTIAL" | "PAID";
    invoiceType: "OPD" | "IPD" | "PHARMACY" | "LAB" | "GENERAL";
  } | null;
  ipdAdmission?: IPDAdmission | null;
  opdToIpdTransfer?: OpdToIpdTransfer | null;
  prescription?: {
    id: number;
    visitId: number;
    createdAt: string;
    printedAt?: string | null;
    templateType: string;
  } | null;
};

export type VisitListResponse = {
  data: Visit[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    pageSize?: number;
  };
};

export type OpdToIpdTransfer = {
  id: number;
  opdVisitId: number;
  ipdAdmissionId: number;
  patientId: number;
  transferredById: number;
  notes?: string | null;
  createdAt: string;
};

export type IPDAdmission = {
  id: number;
  visitId: number;
  patientId: number;
  attendingDoctorId: number;
  roomId?: number | null;
  bedId?: number | null;
  status: "ADMITTED" | "UNDER_TREATMENT" | "RECOVERED" | "DISCHARGED";
  admittedAt: string;
  dischargedAt?: string | null;
  ward: string;
  room: string;
  bed: string;
  diagnosis?: string | null;
  reason?: string | null;
  createdAt: string;
  patient: Patient;
  visit: Visit;
  transfer?: OpdToIpdTransfer | null;
  roomAllocation?: Room | null;
  bedAllocation?: Bed | null;
  attendingDoctor: {
    id: number;
    name: string;
    doctorProfile?: DoctorProfile | null;
  };
};

export type Prescription = {
  id: number;
  patientId?: number | null;
  visitId: number;
  doctorId: number;
  invoiceId?: number | null;
  printedAt?: string | null;
  templateType: string;
  notes?: string | null;
  symptoms?: string | null;
  diagnosis?: string | null;
  advice?: string | null;
  itemsJson: string;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceItem = {
  id?: number;
  category: "CONSULTATION" | "LAB" | "PROCEDURE" | "MEDICINE" | "MISC";
  name: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  amount: number;
};

export type Payment = {
  id: number;
  invoiceId: number;
  patientId: number;
  amount: number;
  paymentMode: "CASH" | "UPI" | "CARD" | "INSURANCE";
  referenceNo?: string | null;
  notes?: string | null;
  receivedAt: string;
};

export type Invoice = {
  id: number;
  visitId: number;
  invoiceNo: string;
  patientId: number;
  doctorId: number;
  invoiceType: "OPD" | "IPD" | "PHARMACY" | "LAB" | "GENERAL";
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID";
  paymentMode?: "CASH" | "UPI" | "CARD" | "INSURANCE" | null;
  notes?: string | null;
  createdAt: string;
  items: InvoiceItem[];
  payments?: Payment[];
  visit: Visit;
  patient?: Patient;
  doctor?: {
    id: number;
    name: string;
  };
};

export type InvoiceListResponse = {
  data: Invoice[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    pageSize?: number;
  };
};

export type HospitalSettings = {
  id: number;
  hospitalName: string;
  address: string;
  phone: string;
  gstin?: string | null;
  logoPath?: string | null;
  kansaltLogoPath?: string | null;
  defaultConsultationFee: number;
  invoicePrefix: string;
  invoiceSequence: number;
  footerNote?: string | null;
  currencyCode?: string;
  timezone?: string;
  updatedAt?: string;
};

export type DashboardSnapshot = {
  date: string;
  widgets: {
    todayOpdPatients: number;
    currentIpdAdmissions: number;
    todayRevenue: number;
    doctorsAvailable: number;
    appointments: number;
    bedOccupancyRate: number;
  };
  recentCollections: Array<Invoice & { patient?: Patient; doctor?: { id: number; name: string } }>;
};

export type AnalyticsReport = {
  date: string;
  summary: {
    dailyOpd: number;
    dailyIpd: number;
    dailyRevenue: number;
    monthlyRevenue: number;
  };
  doctorWisePatients: Array<{
    doctorId: number;
    doctorName: string;
    specialization?: string | null;
    patientCount: number;
  }>;
  bedOccupancy: Array<{
    status: string;
    count: number;
  }>;
  paymentMix: Array<{
    paymentMode: string;
    payments: number;
    amount: number;
  }>;
};
