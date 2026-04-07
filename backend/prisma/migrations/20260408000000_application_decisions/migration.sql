-- ── Application admin decision fields (T3.13) ──────────────────────────────
-- Tracks interview scheduling + final approve/reject decisions on the
-- Application row itself, so admin actions are queryable without a side
-- table.

ALTER TABLE "applications"
  ADD COLUMN IF NOT EXISTS "interviewScheduledAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "interviewLocation"    TEXT,
  ADD COLUMN IF NOT EXISTS "interviewNotes"       TEXT,
  ADD COLUMN IF NOT EXISTS "decidedAt"            TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "decisionReason"       TEXT;
