-- ── Normalize ApplicationStatus enum (T3.3 + T3.4) ──────────────────────────
--
-- Changes:
--   1. PAYMENT_FAILED  → dropped (never set by any code path; safe to remove)
--   2. PENDING_PAYMENT → kept as a legacy value for historical rows, but removed
--      as the column default
--   3. Column default  → changed from PENDING_PAYMENT to SUBMITTED
--
-- Strategy: PostgreSQL does not support ALTER TYPE ... DROP VALUE, so we
-- recreate the enum type without PAYMENT_FAILED, migrate the column, then
-- drop the old type.
-- ---------------------------------------------------------------------------

-- Step 1: Migrate any rows that carry removed statuses before we recreate the
--         type. PAYMENT_FAILED was never written by code, but be defensive.
UPDATE "applications"
  SET "status" = 'SUBMITTED'
  WHERE "status" = 'PAYMENT_FAILED';

-- Step 2: Create a replacement enum type without PAYMENT_FAILED.
--         PENDING_PAYMENT is retained so that any pre-free-signup historical
--         rows are not invalidated.
CREATE TYPE "ApplicationStatus_v2" AS ENUM (
  'SUBMITTED',
  'AWAITING_COMPLETION',
  'UNDER_REVIEW',
  'DIAGNOSIS_GENERATED',
  'DIAGNOSIS_UNDER_REVIEW',
  'DIAGNOSIS_APPROVED',
  'BRIEF_GENERATED',
  'PRESCREENED',
  'INTERVIEW_SCHEDULED',
  'APPROVED',
  'REJECTED',
  'PENDING_PAYMENT'
);

-- Step 3: Drop the column default before changing the type (required by Postgres).
ALTER TABLE "applications"
  ALTER COLUMN "status" DROP DEFAULT;

-- Step 4: Cast the column to the new enum type.
ALTER TABLE "applications"
  ALTER COLUMN "status" TYPE "ApplicationStatus_v2"
    USING "status"::text::"ApplicationStatus_v2";

-- Step 5: Swap types — drop old, rename new.
DROP TYPE "ApplicationStatus";
ALTER TYPE "ApplicationStatus_v2" RENAME TO "ApplicationStatus";

-- Step 6: Set the correct column default (SUBMITTED, not PENDING_PAYMENT).
ALTER TABLE "applications"
  ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
