CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "User_role_active_idx" ON "User"("role", "active");
CREATE INDEX IF NOT EXISTS "User_updatedAt_idx" ON "User"("updatedAt");

CREATE INDEX IF NOT EXISTS "Patient_active_createdAt_idx" ON "Patient"("active", "createdAt");
CREATE INDEX IF NOT EXISTS "Patient_active_updatedAt_idx" ON "Patient"("active", "updatedAt");
CREATE INDEX IF NOT EXISTS "Patient_name_trgm_idx" ON "Patient" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Patient_phone_trgm_idx" ON "Patient" USING GIN ("phone" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Patient_mrn_trgm_idx" ON "Patient" USING GIN ("mrn" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Visit_createdAt_idx" ON "Visit"("createdAt");
CREATE INDEX IF NOT EXISTS "Visit_status_scheduledAt_idx" ON "Visit"("status", "scheduledAt");
CREATE INDEX IF NOT EXISTS "Visit_doctorId_status_scheduledAt_idx" ON "Visit"("doctorId", "status", "scheduledAt");
CREATE INDEX IF NOT EXISTS "Visit_patientId_createdAt_idx" ON "Visit"("patientId", "createdAt");

CREATE INDEX IF NOT EXISTS "Prescription_doctorId_createdAt_idx" ON "Prescription"("doctorId", "createdAt");
CREATE INDEX IF NOT EXISTS "Prescription_patientId_createdAt_idx" ON "Prescription"("patientId", "createdAt");

CREATE INDEX IF NOT EXISTS "Invoice_invoiceType_createdAt_idx" ON "Invoice"("invoiceType", "createdAt");
CREATE INDEX IF NOT EXISTS "Invoice_patientId_paymentStatus_createdAt_idx" ON "Invoice"("patientId", "paymentStatus", "createdAt");
CREATE INDEX IF NOT EXISTS "Invoice_invoiceNo_trgm_idx" ON "Invoice" USING GIN ("invoiceNo" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "DoctorProfile_specialization_idx" ON "DoctorProfile"("specialization");

CREATE INDEX IF NOT EXISTS "IPDAdmission_attendingDoctorId_status_admittedAt_idx" ON "IPDAdmission"("attendingDoctorId", "status", "admittedAt");
CREATE INDEX IF NOT EXISTS "IPDAdmission_patientId_status_admittedAt_idx" ON "IPDAdmission"("patientId", "status", "admittedAt");

CREATE INDEX IF NOT EXISTS "Payment_receivedAt_idx" ON "Payment"("receivedAt");
CREATE INDEX IF NOT EXISTS "Payment_paymentMode_receivedAt_idx" ON "Payment"("paymentMode", "receivedAt");

CREATE INDEX IF NOT EXISTS "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_invoiceId_createdAt_idx" ON "AuditLog"("invoiceId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_visitId_createdAt_idx" ON "AuditLog"("visitId", "createdAt");
