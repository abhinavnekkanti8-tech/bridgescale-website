-- ── Free signup flow control fields ────────────────────────────────────────
-- Tracks signup flow: assessment/references can be skipped at signup but must
-- be completed before payment. matchingUnlocked = 1 when payment is confirmed.
-- New AWAITING_COMPLETION status for talent who skipped steps.

-- Add new ApplicationStatus enum value
ALTER TYPE "ApplicationStatus" ADD VALUE 'AWAITING_COMPLETION' AFTER 'SUBMITTED';

-- Add new columns to applications table
ALTER TABLE "applications"
  ADD COLUMN IF NOT EXISTS "assessmentSkipped"       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "referencesSkipped"       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "assessmentCompletedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "referencesCompletedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "matchingUnlocked"        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "matchingUnlockedAt"      TIMESTAMP(3);
