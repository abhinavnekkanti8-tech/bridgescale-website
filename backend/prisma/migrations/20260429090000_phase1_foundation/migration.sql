-- Phase 1 foundation: additive schema for the BridgeScale operating model.

CREATE TYPE "ServiceLane" AS ENUM (
  'FRACTIONAL_LEADERSHIP',
  'FRACTIONAL_BD_PARTNERSHIPS',
  'FRACTIONAL_EXECUTION_OPS'
);

CREATE TYPE "EngagementType" AS ENUM (
  'CONSULTATION',
  'SPRINT',
  'RETAINER'
);

CREATE TYPE "RetainerFlavour" AS ENUM (
  'LEADERSHIP',
  'OPERATOR'
);

CREATE TYPE "ServiceTemplateCode" AS ENUM (
  'INTL_MARKET_ENTRY',
  'ICP_REFINEMENT',
  'GTM_STRATEGY',
  'PIPELINE_SPRINT',
  'FOUNDER_LED_SALES_TRANSITION',
  'REVENUE_CADENCE_SETUP',
  'PARTNER_CHANNEL_DEVELOPMENT',
  'CUSTOMER_SUCCESS_RETENTION',
  'SALES_PROCESS_CRM_CLEANUP',
  'CLOSING_SUPPORT'
);

CREATE TYPE "OperatorRole" AS ENUM (
  'VP_SALES',
  'VP_REVENUE',
  'CRO',
  'HEAD_OF_SALES',
  'GTM_LEADER',
  'FOUNDER_LED_SALES_COACH',
  'REVENUE_ADVISOR',
  'BD_LEAD',
  'PARTNERSHIPS_LEAD',
  'CHANNEL_LEAD',
  'ALLIANCES_LEAD',
  'MARKET_ACCESS_LEAD',
  'AE',
  'SDR',
  'BDR',
  'OUTBOUND_OPERATOR',
  'REVOPS',
  'SALES_OPS',
  'CUSTOMER_SUCCESS_OPERATOR',
  'EXPANSION_OPERATOR',
  'ACCOUNT_MANAGER',
  'SALES_ENABLEMENT_SOLUTIONS_CONSULTANT'
);

CREATE TYPE "MsaStatus" AS ENUM (
  'PENDING_SIGNATURES',
  'PARTIALLY_SIGNED',
  'FULLY_EXECUTED',
  'TERMINATED'
);

CREATE TYPE "TaxFormType" AS ENUM (
  'W9',
  'W8BEN',
  'W8BEN_E',
  'GST_PAN',
  'VAT',
  'OTHER'
);

CREATE TYPE "TaxFormStatus" AS ENUM (
  'NOT_STARTED',
  'COLLECTED',
  'UNDER_REVIEW',
  'VERIFIED',
  'EXPIRED',
  'REJECTED'
);

CREATE TYPE "CompensationMode" AS ENUM (
  'CASH',
  'SUCCESS_FEE',
  'HYBRID_CASH_EQUITY',
  'EQUITY_ONLY',
  'CONVERSION_FEE'
);

CREATE TYPE "ComplianceMode" AS ENUM (
  'CONTRACTOR',
  'CONTRACTOR_WITH_REVIEW',
  'EOR_REQUIRED',
  'AGENCY_OF_RECORD',
  'PAYROLL_REQUIRED',
  'BLOCKED_PENDING_REVIEW',
  'UNKNOWN'
);

CREATE TYPE "EorPartner" AS ENUM (
  'DEEL',
  'REMOTE',
  'MULTIPLIER'
);

CREATE TYPE "EorEnrollmentStatus" AS ENUM (
  'NOT_STARTED',
  'PENDING',
  'ACTIVE',
  'REJECTED',
  'TERMINATED'
);

CREATE TYPE "CancellationParty" AS ENUM (
  'STARTUP',
  'OPERATOR',
  'PLATFORM'
);

CREATE TYPE "LifecycleEventType" AS ENUM (
  'CREATED',
  'STATUS_CHANGED',
  'CONVERSION_CANDIDATE',
  'CONVERTED_TO_FULLTIME',
  'PAYMENT_MILESTONE',
  'CLOSEOUT'
);

ALTER TYPE "SowStatus" ADD VALUE IF NOT EXISTS 'AI_DRAFT';
ALTER TYPE "SowStatus" ADD VALUE IF NOT EXISTS 'HUMAN_APPROVED';
ALTER TYPE "SowStatus" ADD VALUE IF NOT EXISTS 'SHARED';
ALTER TYPE "SowStatus" ADD VALUE IF NOT EXISTS 'ACTIVE';
ALTER TYPE "SowStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE "SowStatus" ADD VALUE IF NOT EXISTS 'TERMINATED';

ALTER TYPE "PaymentPlanType" ADD VALUE IF NOT EXISTS 'HYBRID_CASH_EQUITY';
ALTER TYPE "PaymentPlanType" ADD VALUE IF NOT EXISTS 'EQUITY_ONLY';
ALTER TYPE "PaymentPlanType" ADD VALUE IF NOT EXISTS 'CONVERSION_FEE';
ALTER TYPE "PaymentPlanType" ADD VALUE IF NOT EXISTS 'MILESTONE_SCHEDULE';

ALTER TYPE "EngagementStatus" ADD VALUE IF NOT EXISTS 'CONVERTED_TO_FULLTIME';

ALTER TABLE "operator_profiles"
  ADD COLUMN "roles" "OperatorRole"[] NOT NULL DEFAULT ARRAY[]::"OperatorRole"[];

ALTER TABLE "statements_of_work"
  ADD COLUMN "masterAgreementId" TEXT,
  ADD COLUMN "serviceTemplate" "ServiceTemplateCode",
  ADD COLUMN "engagementType" "EngagementType",
  ADD COLUMN "retainerFlavour" "RetainerFlavour";

ALTER TABLE "payment_plans"
  ADD COLUMN "billingCurrency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN "payoutCurrency" TEXT,
  ADD COLUMN "fxRateAtSigning" DOUBLE PRECISION;

CREATE TABLE "master_service_agreements" (
  "id" TEXT NOT NULL,
  "startupProfileId" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "status" "MsaStatus" NOT NULL DEFAULT 'PENDING_SIGNATURES',
  "platformFeePercent" INTEGER NOT NULL DEFAULT 10,
  "conversionFeePercent" INTEGER NOT NULL DEFAULT 25,
  "nonCircMonths" INTEGER NOT NULL DEFAULT 12,
  "termNoticeDays" INTEGER NOT NULL DEFAULT 30,
  "governingLaw" TEXT NOT NULL DEFAULT 'India',
  "platformSignedAt" TIMESTAMP(3),
  "startupSignedAt" TIMESTAMP(3),
  "operatorSignedAt" TIMESTAMP(3),
  "fullyExecutedAt" TIMESTAMP(3),
  "documentUrl" TEXT,
  "watermarked" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "master_service_agreements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "service_templates" (
  "id" TEXT NOT NULL,
  "code" "ServiceTemplateCode" NOT NULL,
  "name" TEXT NOT NULL,
  "lane" "ServiceLane" NOT NULL,
  "engagementType" "EngagementType" NOT NULL,
  "retainerFlavour" "RetainerFlavour",
  "suggestedDurationDays" INTEGER,
  "description" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "service_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "role_template_engagement_combinations" (
  "id" TEXT NOT NULL,
  "operatorRole" "OperatorRole" NOT NULL,
  "serviceTemplate" "ServiceTemplateCode" NOT NULL,
  "engagementType" "EngagementType" NOT NULL,
  "retainerFlavour" "RetainerFlavour",
  "serviceLane" "ServiceLane" NOT NULL,
  "isRecommended" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "role_template_engagement_combinations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operator_tax_profiles" (
  "id" TEXT NOT NULL,
  "operatorProfileId" TEXT NOT NULL,
  "formType" "TaxFormType" NOT NULL,
  "formStatus" "TaxFormStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "taxResidencyCountry" TEXT,
  "payoutCountry" TEXT,
  "payoutCurrency" TEXT,
  "individualOrEntity" TEXT,
  "encryptedBlobRef" TEXT,
  "expiresAt" TIMESTAMP(3),
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "operator_tax_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "compliance_decision_logs" (
  "id" TEXT NOT NULL,
  "operatorProfileId" TEXT,
  "sowId" TEXT,
  "mode" "ComplianceMode" NOT NULL,
  "reason" TEXT NOT NULL,
  "decidedBy" TEXT NOT NULL DEFAULT 'SYSTEM',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "compliance_decision_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operator_eor_enrollments" (
  "id" TEXT NOT NULL,
  "operatorProfileId" TEXT NOT NULL,
  "partner" "EorPartner" NOT NULL,
  "status" "EorEnrollmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "partnerSideId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "operator_eor_enrollments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hybrid_addenda" (
  "id" TEXT NOT NULL,
  "sowId" TEXT NOT NULL,
  "compensationMode" "CompensationMode" NOT NULL DEFAULT 'HYBRID_CASH_EQUITY',
  "cashAmount" INTEGER,
  "cashCurrency" TEXT,
  "equitySummary" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hybrid_addenda_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "success_fee_addenda" (
  "id" TEXT NOT NULL,
  "sowId" TEXT NOT NULL,
  "compensationMode" "CompensationMode" NOT NULL DEFAULT 'SUCCESS_FEE',
  "successFeePercent" INTEGER,
  "triggerSummary" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "success_fee_addenda_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "equity_only_addenda" (
  "id" TEXT NOT NULL,
  "sowId" TEXT NOT NULL,
  "compensationMode" "CompensationMode" NOT NULL DEFAULT 'EQUITY_ONLY',
  "equitySummary" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "equity_only_addenda_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversion_addenda" (
  "id" TEXT NOT NULL,
  "sowId" TEXT NOT NULL,
  "compensationMode" "CompensationMode" NOT NULL DEFAULT 'CONVERSION_FEE',
  "conversionFeePercent" INTEGER NOT NULL DEFAULT 25,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "conversion_addenda_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cancellation_events" (
  "id" TEXT NOT NULL,
  "sowId" TEXT NOT NULL,
  "party" "CancellationParty" NOT NULL,
  "reason" TEXT NOT NULL,
  "refundAmount" INTEGER,
  "payoutPenalty" INTEGER,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cancellation_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lifecycle_events" (
  "id" TEXT NOT NULL,
  "engagementId" TEXT NOT NULL,
  "eventType" "LifecycleEventType" NOT NULL,
  "description" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lifecycle_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "master_service_agreements_startupProfileId_operatorId_key"
  ON "master_service_agreements"("startupProfileId", "operatorId");
CREATE INDEX "master_service_agreements_operatorId_idx" ON "master_service_agreements"("operatorId");

CREATE UNIQUE INDEX "service_templates_code_key" ON "service_templates"("code");
CREATE INDEX "service_templates_lane_idx" ON "service_templates"("lane");
CREATE INDEX "service_templates_engagementType_idx" ON "service_templates"("engagementType");

CREATE UNIQUE INDEX "role_template_engagement_combinations_operatorRole_serviceTemplate_engagementType_retainerFlavour_key"
  ON "role_template_engagement_combinations"("operatorRole", "serviceTemplate", "engagementType", "retainerFlavour");
CREATE INDEX "role_template_engagement_combinations_operatorRole_idx"
  ON "role_template_engagement_combinations"("operatorRole");
CREATE INDEX "role_template_engagement_combinations_serviceTemplate_engagementType_retainerFlavour_idx"
  ON "role_template_engagement_combinations"("serviceTemplate", "engagementType", "retainerFlavour");

CREATE INDEX "statements_of_work_masterAgreementId_idx" ON "statements_of_work"("masterAgreementId");
CREATE INDEX "statements_of_work_serviceTemplate_engagementType_retainerFlavour_idx"
  ON "statements_of_work"("serviceTemplate", "engagementType", "retainerFlavour");

CREATE INDEX "operator_tax_profiles_operatorProfileId_idx" ON "operator_tax_profiles"("operatorProfileId");
CREATE INDEX "operator_tax_profiles_formStatus_idx" ON "operator_tax_profiles"("formStatus");

CREATE INDEX "compliance_decision_logs_operatorProfileId_idx" ON "compliance_decision_logs"("operatorProfileId");
CREATE INDEX "compliance_decision_logs_sowId_idx" ON "compliance_decision_logs"("sowId");

CREATE UNIQUE INDEX "operator_eor_enrollments_operatorProfileId_partner_key"
  ON "operator_eor_enrollments"("operatorProfileId", "partner");

CREATE UNIQUE INDEX "hybrid_addenda_sowId_key" ON "hybrid_addenda"("sowId");
CREATE UNIQUE INDEX "success_fee_addenda_sowId_key" ON "success_fee_addenda"("sowId");
CREATE UNIQUE INDEX "equity_only_addenda_sowId_key" ON "equity_only_addenda"("sowId");
CREATE UNIQUE INDEX "conversion_addenda_sowId_key" ON "conversion_addenda"("sowId");
CREATE INDEX "cancellation_events_sowId_idx" ON "cancellation_events"("sowId");
CREATE INDEX "lifecycle_events_engagementId_idx" ON "lifecycle_events"("engagementId");
CREATE INDEX "lifecycle_events_eventType_idx" ON "lifecycle_events"("eventType");

ALTER TABLE "statements_of_work"
  ADD CONSTRAINT "statements_of_work_masterAgreementId_fkey"
  FOREIGN KEY ("masterAgreementId") REFERENCES "master_service_agreements"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "master_service_agreements"
  ADD CONSTRAINT "master_service_agreements_startupProfileId_fkey"
  FOREIGN KEY ("startupProfileId") REFERENCES "startup_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "master_service_agreements"
  ADD CONSTRAINT "master_service_agreements_operatorId_fkey"
  FOREIGN KEY ("operatorId") REFERENCES "operator_profiles"("operatorId")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_template_engagement_combinations"
  ADD CONSTRAINT "role_template_engagement_combinations_serviceTemplate_fkey"
  FOREIGN KEY ("serviceTemplate") REFERENCES "service_templates"("code")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "operator_tax_profiles"
  ADD CONSTRAINT "operator_tax_profiles_operatorProfileId_fkey"
  FOREIGN KEY ("operatorProfileId") REFERENCES "operator_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "compliance_decision_logs"
  ADD CONSTRAINT "compliance_decision_logs_operatorProfileId_fkey"
  FOREIGN KEY ("operatorProfileId") REFERENCES "operator_profiles"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "operator_eor_enrollments"
  ADD CONSTRAINT "operator_eor_enrollments_operatorProfileId_fkey"
  FOREIGN KEY ("operatorProfileId") REFERENCES "operator_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "hybrid_addenda"
  ADD CONSTRAINT "hybrid_addenda_sowId_fkey"
  FOREIGN KEY ("sowId") REFERENCES "statements_of_work"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "success_fee_addenda"
  ADD CONSTRAINT "success_fee_addenda_sowId_fkey"
  FOREIGN KEY ("sowId") REFERENCES "statements_of_work"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "equity_only_addenda"
  ADD CONSTRAINT "equity_only_addenda_sowId_fkey"
  FOREIGN KEY ("sowId") REFERENCES "statements_of_work"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "conversion_addenda"
  ADD CONSTRAINT "conversion_addenda_sowId_fkey"
  FOREIGN KEY ("sowId") REFERENCES "statements_of_work"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cancellation_events"
  ADD CONSTRAINT "cancellation_events_sowId_fkey"
  FOREIGN KEY ("sowId") REFERENCES "statements_of_work"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lifecycle_events"
  ADD CONSTRAINT "lifecycle_events_engagementId_fkey"
  FOREIGN KEY ("engagementId") REFERENCES "engagements"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
