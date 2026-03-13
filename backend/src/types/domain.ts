export const USER_ROLES = ["ADMIN", "RECEPTION", "DOCTOR", "BILLING", "PHARMACY", "LAB_TECHNICIAN"] as const;
export type UserRoleValue = (typeof USER_ROLES)[number];

export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export type GenderValue = (typeof GENDERS)[number];

export const VISIT_TYPES = ["OPD", "IPD"] as const;
export type VisitTypeValue = (typeof VISIT_TYPES)[number];

export const VISIT_STATUSES = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type VisitStatusValue = (typeof VISIT_STATUSES)[number];

export const IPD_ADMISSION_STATUSES = ["ADMITTED", "UNDER_TREATMENT", "RECOVERED", "DISCHARGED"] as const;
export type IpdAdmissionStatusValue = (typeof IPD_ADMISSION_STATUSES)[number];

export const PAYMENT_MODES = ["CASH", "UPI", "CARD", "INSURANCE"] as const;
export type PaymentModeValue = (typeof PAYMENT_MODES)[number];

export const INVOICE_ITEM_CATEGORIES = ["CONSULTATION", "LAB", "PROCEDURE", "MEDICINE", "MISC"] as const;
export type InvoiceItemCategoryValue = (typeof INVOICE_ITEM_CATEGORIES)[number];

export const PAYMENT_STATUSES = ["PENDING", "PARTIAL", "PAID"] as const;
export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];

export const INVOICE_TYPES = ["OPD", "IPD", "PHARMACY", "LAB", "GENERAL"] as const;
export type InvoiceTypeValue = (typeof INVOICE_TYPES)[number];

export const BED_STATUSES = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"] as const;
export type BedStatusValue = (typeof BED_STATUSES)[number];
