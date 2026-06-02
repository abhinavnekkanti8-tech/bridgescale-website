-- Phase 3 backend-first payment/compliance skeleton.

CREATE TYPE "PaymentLedgerStatus" AS ENUM (
  'DRAFT',
  'REVIEWED',
  'APPROVED',
  'BLOCKED',
  'READY_FOR_PAYOUT'
);

CREATE TYPE "PayoutProvider" AS ENUM (
  'STRIPE_CONNECT',
  'RAZORPAY',
  'WISE',
  'MANUAL',
  'DUMMY'
);

CREATE TYPE "PayoutAttemptStatus" AS ENUM (
  'PLANNED',
  'QUEUED',
  'SUCCEEDED',
  'FAILED',
  'CANCELLED'
);

CREATE TABLE "payment_ledgers" (
  "id" TEXT NOT NULL,
  "paymentPlanId" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "invoiceAmount" INTEGER NOT NULL,
  "billingCurrency" TEXT NOT NULL DEFAULT 'USD',
  "platformFeeAmount" INTEGER NOT NULL,
  "operatorPayoutAmount" INTEGER NOT NULL,
  "eorFeeAmount" INTEGER NOT NULL DEFAULT 0,
  "payoutCurrency" TEXT,
  "fxRateAtSigning" DOUBLE PRECISION,
  "complianceMode" "ComplianceMode" NOT NULL DEFAULT 'UNKNOWN',
  "taxReady" BOOLEAN NOT NULL DEFAULT false,
  "payoutReady" BOOLEAN NOT NULL DEFAULT false,
  "status" "PaymentLedgerStatus" NOT NULL DEFAULT 'DRAFT',
  "reviewNotes" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payment_ledgers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payout_attempts" (
  "id" TEXT NOT NULL,
  "ledgerId" TEXT NOT NULL,
  "provider" "PayoutProvider" NOT NULL,
  "status" "PayoutAttemptStatus" NOT NULL DEFAULT 'PLANNED',
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "providerRef" TEXT,
  "dummyMode" BOOLEAN NOT NULL DEFAULT true,
  "errorMessage" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payout_attempts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_ledgers_paymentPlanId_key" ON "payment_ledgers"("paymentPlanId");
CREATE INDEX "payment_ledgers_contractId_idx" ON "payment_ledgers"("contractId");
CREATE INDEX "payment_ledgers_status_idx" ON "payment_ledgers"("status");
CREATE INDEX "payout_attempts_ledgerId_idx" ON "payout_attempts"("ledgerId");
CREATE INDEX "payout_attempts_provider_idx" ON "payout_attempts"("provider");

ALTER TABLE "payment_ledgers"
  ADD CONSTRAINT "payment_ledgers_paymentPlanId_fkey"
  FOREIGN KEY ("paymentPlanId") REFERENCES "payment_plans"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_ledgers"
  ADD CONSTRAINT "payment_ledgers_contractId_fkey"
  FOREIGN KEY ("contractId") REFERENCES "contracts"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payout_attempts"
  ADD CONSTRAINT "payout_attempts_ledgerId_fkey"
  FOREIGN KEY ("ledgerId") REFERENCES "payment_ledgers"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
