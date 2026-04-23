-- Migration: add_equity_engagement
-- Adds first-class HYBRID_EQUITY engagement support.
--
-- Changes:
--   • New enums:    EquityType, EquityGrantStatus
--   • Enum values:  PackageType += HYBRID_EQUITY
--                   OperatorLane += HYBRID_EQUITY
--   • New columns:  statements_of_work (12 equity fields)
--                   contracts (hasEquityComponent, equityDocumentRef)
--                   operator_profiles (openToEquity)
--   • New table:    equity_grants
--
-- All changes are purely additive — no existing data is modified.
-- ALTER TYPE ... ADD VALUE cannot run inside a transaction in PostgreSQL;
-- Prisma handles this correctly (these statements run outside the tx block).

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. New enums
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE "EquityType" AS ENUM ('FAST', 'DIRECT');

CREATE TYPE "EquityGrantStatus" AS ENUM (
  'PENDING',
  'ACTIVE',
  'FULLY_VESTED',
  'LAPSED',
  'ACCELERATED'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Extend existing enums (outside transaction — Postgres requirement)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE "PackageType"  ADD VALUE IF NOT EXISTS 'HYBRID_EQUITY';
ALTER TYPE "OperatorLane" ADD VALUE IF NOT EXISTS 'HYBRID_EQUITY';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. New columns on statements_of_work
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "statements_of_work"
  ADD COLUMN IF NOT EXISTS "equityCashComponentUsd" INTEGER,
  ADD COLUMN IF NOT EXISTS "equityType"              "EquityType",
  ADD COLUMN IF NOT EXISTS "equityPct"               DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "fastValueUsd"            INTEGER,
  ADD COLUMN IF NOT EXISTS "vestingSchedule"         TEXT,
  ADD COLUMN IF NOT EXISTS "equityCliffMonths"       INTEGER,
  ADD COLUMN IF NOT EXISTS "equityVestingMonths"     INTEGER,
  ADD COLUMN IF NOT EXISTS "equityKpiMilestones"     JSONB,
  ADD COLUMN IF NOT EXISTS "startupLegalAck"         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "operatorLegalAck"        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "equityReviewRequired"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "equityReviewApprovedAt"  TIMESTAMP(3);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. New columns on contracts
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "contracts"
  ADD COLUMN IF NOT EXISTS "hasEquityComponent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "equityDocumentRef"  TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. New column on operator_profiles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "operator_profiles"
  ADD COLUMN IF NOT EXISTS "openToEquity" BOOLEAN NOT NULL DEFAULT false;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. New table: equity_grants
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "equity_grants" (
  "id"               TEXT        NOT NULL,
  "contractId"       TEXT        NOT NULL,
  "equityType"       "EquityType" NOT NULL DEFAULT 'FAST',
  "equityPct"        DOUBLE PRECISION,
  "fastValueUsd"     INTEGER,
  "vestingStartDate" TIMESTAMP(3),
  "cliffMonths"      INTEGER     NOT NULL DEFAULT 6,
  "vestingMonths"    INTEGER     NOT NULL DEFAULT 36,
  "status"           "EquityGrantStatus" NOT NULL DEFAULT 'PENDING',
  "vestedPct"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "lastEventAt"      TIMESTAMP(3),
  "notes"            TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "equity_grants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "equity_grants_contractId_key"
  ON "equity_grants"("contractId");

CREATE INDEX IF NOT EXISTS "equity_grants_contractId_idx"
  ON "equity_grants"("contractId");

ALTER TABLE "equity_grants"
  ADD CONSTRAINT "equity_grants_contractId_fkey"
  FOREIGN KEY ("contractId")
  REFERENCES "contracts"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
