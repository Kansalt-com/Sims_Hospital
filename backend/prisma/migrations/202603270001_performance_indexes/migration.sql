CREATE INDEX IF NOT EXISTS "Patient_name_idx" ON "Patient"("name");
CREATE INDEX IF NOT EXISTS "Patient_phone_idx" ON "Patient"("phone");
CREATE INDEX IF NOT EXISTS "Visit_scheduledAt_idx" ON "Visit"("scheduledAt");
