-- Phase 2 core flow: call request, mutual intent, Pre-SOW Summary, and MSA signature IDs.

CREATE TYPE "EngagementCallStatus" AS ENUM (
  'REQUESTED',
  'ACCEPTED',
  'DECLINED',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE "EngagementIntentParty" AS ENUM (
  'STARTUP',
  'OPERATOR'
);

CREATE TYPE "EngagementIntentStatus" AS ENUM (
  'INTERESTED',
  'NOT_INTERESTED'
);

CREATE TYPE "PreSowSummaryStatus" AS ENUM (
  'DRAFT',
  'SHARED',
  'CONFIRMED',
  'CANCELLED'
);

ALTER TABLE "master_service_agreements"
  ADD COLUMN "platformSignatureId" TEXT,
  ADD COLUMN "startupSignatureId" TEXT,
  ADD COLUMN "operatorSignatureId" TEXT;

CREATE TABLE "engagement_calls" (
  "id" TEXT NOT NULL,
  "startupProfileId" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "shortlistId" TEXT,
  "candidateId" TEXT,
  "requestedBy" TEXT NOT NULL,
  "status" "EngagementCallStatus" NOT NULL DEFAULT 'REQUESTED',
  "proposedAt" TIMESTAMP(3),
  "scheduledAt" TIMESTAMP(3),
  "meetingLink" TEXT,
  "notes" TEXT,
  "outcomeNotes" TEXT,
  "respondedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "engagement_calls_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "engagement_intents" (
  "id" TEXT NOT NULL,
  "callId" TEXT NOT NULL,
  "startupProfileId" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "party" "EngagementIntentParty" NOT NULL,
  "status" "EngagementIntentStatus" NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "engagement_intents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pre_sow_commercial_summaries" (
  "id" TEXT NOT NULL,
  "callId" TEXT NOT NULL,
  "startupProfileId" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "masterAgreementId" TEXT,
  "serviceTemplate" "ServiceTemplateCode" NOT NULL,
  "engagementType" "EngagementType" NOT NULL,
  "retainerFlavour" "RetainerFlavour",
  "compensationMode" "CompensationMode" NOT NULL DEFAULT 'CASH',
  "indicativePrice" INTEGER,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "weeklyHours" INTEGER,
  "durationDays" INTEGER,
  "specialTerms" TEXT,
  "cancellationNote" TEXT,
  "status" "PreSowSummaryStatus" NOT NULL DEFAULT 'DRAFT',
  "startupConfirmedAt" TIMESTAMP(3),
  "operatorConfirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pre_sow_commercial_summaries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "engagement_calls_startupProfileId_idx" ON "engagement_calls"("startupProfileId");
CREATE INDEX "engagement_calls_operatorId_idx" ON "engagement_calls"("operatorId");
CREATE INDEX "engagement_calls_status_idx" ON "engagement_calls"("status");

CREATE UNIQUE INDEX "engagement_intents_callId_party_key" ON "engagement_intents"("callId", "party");
CREATE INDEX "engagement_intents_startupProfileId_operatorId_idx" ON "engagement_intents"("startupProfileId", "operatorId");

CREATE INDEX "pre_sow_commercial_summaries_callId_idx" ON "pre_sow_commercial_summaries"("callId");
CREATE INDEX "pre_sow_commercial_summaries_startupProfileId_operatorId_idx" ON "pre_sow_commercial_summaries"("startupProfileId", "operatorId");
CREATE INDEX "pre_sow_commercial_summaries_status_idx" ON "pre_sow_commercial_summaries"("status");

ALTER TABLE "engagement_calls"
  ADD CONSTRAINT "engagement_calls_startupProfileId_fkey"
  FOREIGN KEY ("startupProfileId") REFERENCES "startup_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "engagement_calls"
  ADD CONSTRAINT "engagement_calls_operatorId_fkey"
  FOREIGN KEY ("operatorId") REFERENCES "operator_profiles"("operatorId")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "engagement_intents"
  ADD CONSTRAINT "engagement_intents_callId_fkey"
  FOREIGN KEY ("callId") REFERENCES "engagement_calls"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pre_sow_commercial_summaries"
  ADD CONSTRAINT "pre_sow_commercial_summaries_callId_fkey"
  FOREIGN KEY ("callId") REFERENCES "engagement_calls"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pre_sow_commercial_summaries"
  ADD CONSTRAINT "pre_sow_commercial_summaries_startupProfileId_fkey"
  FOREIGN KEY ("startupProfileId") REFERENCES "startup_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pre_sow_commercial_summaries"
  ADD CONSTRAINT "pre_sow_commercial_summaries_operatorId_fkey"
  FOREIGN KEY ("operatorId") REFERENCES "operator_profiles"("operatorId")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pre_sow_commercial_summaries"
  ADD CONSTRAINT "pre_sow_commercial_summaries_masterAgreementId_fkey"
  FOREIGN KEY ("masterAgreementId") REFERENCES "master_service_agreements"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
