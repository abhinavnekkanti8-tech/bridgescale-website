-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_FAILED', 'SUBMITTED', 'UNDER_REVIEW', 'DIAGNOSIS_GENERATED', 'DIAGNOSIS_UNDER_REVIEW', 'DIAGNOSIS_APPROVED', 'BRIEF_GENERATED', 'PRESCREENED', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('RAZORPAY', 'STRIPE', 'DUMMY');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('EMPLOYED_FULL_TIME', 'FREELANCE', 'BETWEEN_ROLES', 'OTHER');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('IC', 'MANAGER', 'DIRECTOR', 'VP', 'C_SUITE');

-- CreateEnum
CREATE TYPE "AvailabilityHours" AS ENUM ('H5_10', 'H10_20', 'H20_30', 'FULL_FRACTIONAL');

-- CreateEnum
CREATE TYPE "DiagnosisStatus" AS ENUM ('DRAFT_AI', 'UNDER_REVIEW', 'READY_FOR_CLIENT', 'APPROVED', 'REVISION_REQUESTED');

-- CreateEnum
CREATE TYPE "PreScreenRecommendation" AS ENUM ('STRONG_PASS', 'PASS', 'CONDITIONAL', 'FAIL');

-- CreateEnum
CREATE TYPE "SowTemplateType" AS ENUM ('PIPELINE_SPRINT', 'BD_SPRINT', 'FRACTIONAL_RETAINER', 'MARKET_ENTRY', 'HYBRID_EQUITY');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('STARTUP', 'OPERATOR_ENTITY', 'PLATFORM');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('STARTUP_ADMIN', 'STARTUP_MEMBER', 'OPERATOR', 'PLATFORM_ADMIN', 'DEAL_DESK');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StartupStage" AS ENUM ('PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B_PLUS', 'BOOTSTRAPPED');

-- CreateEnum
CREATE TYPE "SalesMotion" AS ENUM ('OUTBOUND', 'INBOUND', 'PARTNER_LED', 'PRODUCT_LED', 'BLENDED');

-- CreateEnum
CREATE TYPE "BudgetBand" AS ENUM ('UNDER_2K', 'TWO_TO_5K', 'FIVE_TO_10K', 'ABOVE_10K');

-- CreateEnum
CREATE TYPE "TargetMarket" AS ENUM ('EU', 'US', 'AU', 'REST_OF_WORLD');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Eligibility" AS ENUM ('INELIGIBLE', 'SPRINT_ONLY', 'SPRINT_AND_RETAINER');

-- CreateEnum
CREATE TYPE "OperatorLane" AS ENUM ('PIPELINE_SPRINT', 'BD_SPRINT', 'FRACTIONAL_RETAINER');

-- CreateEnum
CREATE TYPE "OperatorTier" AS ENUM ('TIER_A', 'TIER_B', 'TIER_C', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "OperatorVerification" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('SENT', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "DiscoveryStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('PIPELINE_SPRINT', 'BD_SPRINT', 'FRACTIONAL_RETAINER');

-- CreateEnum
CREATE TYPE "ShortlistStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SELECTION_MADE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('SHORTLISTED', 'INTERESTED', 'DECLINED', 'SELECTED', 'PASSED');

-- CreateEnum
CREATE TYPE "CandidateInterest" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "SowStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'SIGNED', 'LOCKED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('PENDING_SIGNATURES', 'STARTUP_SIGNED', 'OPERATOR_SIGNED', 'FULLY_SIGNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentPlanType" AS ENUM ('CASH_SPRINT_FEE', 'MONTHLY_RETAINER', 'SUCCESS_FEE_ADDENDUM');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentEventStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "EngagementStatus" AS ENUM ('NOT_STARTED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NudgeType" AS ENUM ('MILESTONE_DUE_SOON', 'MILESTONE_OVERDUE', 'INACTIVITY_WARNING', 'PAYMENT_REMINDER', 'MEETING_PREP');

-- CreateEnum
CREATE TYPE "EscalationStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CloseoutStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "RenewalType" AS ENUM ('RENEWAL', 'RETAINER_CONVERSION', 'FOLLOW_ON_SPRINT', 'NONE');

-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('COMPANY', 'TALENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "orgType" "OrgType" NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "membershipRole" "MembershipRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_profiles" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "stage" "StartupStage" NOT NULL,
    "targetMarkets" "TargetMarket"[],
    "salesMotion" "SalesMotion" NOT NULL,
    "budgetBand" "BudgetBand" NOT NULL,
    "executionOwner" TEXT,
    "hasProductDemo" BOOLEAN NOT NULL DEFAULT false,
    "hasDeck" BOOLEAN NOT NULL DEFAULT false,
    "toolingReady" BOOLEAN NOT NULL DEFAULT false,
    "responsivenessCommit" BOOLEAN NOT NULL DEFAULT false,
    "additionalContext" TEXT,
    "status" "ProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_readiness_scores" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "scoreTotal" INTEGER NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "blockers" TEXT[],
    "recommendation" TEXT,
    "eligibility" "Eligibility" NOT NULL,
    "generatedBy" TEXT NOT NULL DEFAULT 'AI',
    "promptVersion" TEXT,
    "modelName" TEXT,
    "temperature" DOUBLE PRECISION,
    "adminOverride" BOOLEAN NOT NULL DEFAULT false,
    "overrideReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_readiness_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "orgName" TEXT,
    "status" "InviteStatus" NOT NULL DEFAULT 'SENT',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_profiles" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "lanes" "OperatorLane"[],
    "regions" "TargetMarket"[],
    "functions" TEXT[],
    "experienceTags" TEXT[],
    "yearsExperience" INTEGER,
    "linkedIn" TEXT,
    "references" JSONB,
    "availability" TEXT,
    "bio" TEXT,
    "verification" "OperatorVerification" NOT NULL DEFAULT 'PENDING',
    "tier" "OperatorTier" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_quality_scores" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "scoreTotal" INTEGER NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "blockers" TEXT[],
    "recommendation" TEXT,
    "tier" "OperatorTier" NOT NULL,
    "generatedBy" TEXT NOT NULL DEFAULT 'AI',
    "promptVersion" TEXT,
    "modelName" TEXT,
    "temperature" DOUBLE PRECISION,
    "adminOverride" BOOLEAN NOT NULL DEFAULT false,
    "overrideReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supply_quality_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discovery_calls" (
    "id" TEXT NOT NULL,
    "startupProfileId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "meetingLink" TEXT,
    "status" "DiscoveryStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "aiSummary" TEXT,
    "aiRecommendation" TEXT,
    "recommendedPkgs" "PackageType"[],
    "promptVersion" TEXT,
    "modelName" TEXT,
    "adminOverride" BOOLEAN NOT NULL DEFAULT false,
    "overrideSummary" TEXT,
    "overrideReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discovery_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "type" "PackageType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationWeeks" INTEGER NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "priceUsd" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_shortlists" (
    "id" TEXT NOT NULL,
    "startupProfileId" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL DEFAULT 'AI',
    "status" "ShortlistStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "selectionDeadline" TIMESTAMP(3),
    "promptVersion" TEXT,
    "modelName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_shortlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_candidates" (
    "id" TEXT NOT NULL,
    "shortlistId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "explanation" TEXT,
    "mainRisk" TEXT,
    "packageTier" "PackageType",
    "weeklyFitHours" INTEGER,
    "status" "CandidateStatus" NOT NULL DEFAULT 'SHORTLISTED',
    "interest" "CandidateInterest" NOT NULL DEFAULT 'PENDING',
    "declineReason" TEXT,
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statements_of_work" (
    "id" TEXT NOT NULL,
    "shortlistId" TEXT NOT NULL,
    "startupProfileId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "packageType" "PackageType" NOT NULL,
    "title" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "deliverables" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "totalPriceUsd" INTEGER NOT NULL,
    "nonCircumvention" BOOLEAN NOT NULL DEFAULT true,
    "status" "SowStatus" NOT NULL DEFAULT 'DRAFT',
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "promptVersion" TEXT,
    "modelName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statements_of_work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sow_versions" (
    "id" TEXT NOT NULL,
    "sowId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sow_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "sowId" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'PENDING_SIGNATURES',
    "startupSignedAt" TIMESTAMP(3),
    "operatorSignedAt" TIMESTAMP(3),
    "startupSignatureId" TEXT,
    "operatorSignatureId" TEXT,
    "fullySignedAt" TIMESTAMP(3),
    "contactsUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "watermarked" BOOLEAN NOT NULL DEFAULT true,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_logs" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_plans" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "planType" "PaymentPlanType" NOT NULL,
    "totalAmountUsd" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "paymentPlanId" TEXT NOT NULL,
    "amountUsd" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "stripeUrl" TEXT,
    "stripeId" TEXT,
    "metadata" JSONB,
    "issuedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_events" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "amountCaptured" INTEGER NOT NULL,
    "status" "PaymentEventStatus" NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagements" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "status" "EngagementStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "healthScore" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_milestones" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "evidenceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engagement_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_notes" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_score_snapshots" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "scoreTotal" INTEGER NOT NULL,
    "components" JSONB NOT NULL,
    "aiCommentary" TEXT,
    "suggestedAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_nudges" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "nudgeType" "NudgeType" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_nudges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalation_cases" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "EscalationStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escalation_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closeout_reports" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "outcomes" TEXT NOT NULL,
    "nextSteps" TEXT NOT NULL,
    "generatedByAi" BOOLEAN NOT NULL DEFAULT true,
    "promptVersion" TEXT,
    "status" "CloseoutStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "closeout_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_ratings" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "components" JSONB,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renewal_recommendations" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "recommendedType" "RenewalType" NOT NULL,
    "reasoning" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "renewal_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "type" "ApplicationType" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "notes" TEXT,
    "companyName" TEXT,
    "companyWebsite" TEXT,
    "companyStage" TEXT,
    "needArea" TEXT,
    "targetMarkets" TEXT,
    "engagementModel" TEXT,
    "budgetRange" TEXT,
    "urgency" TEXT,
    "salesMotion" TEXT,
    "teamStructure" TEXT,
    "hasDeck" BOOLEAN,
    "hasDemo" BOOLEAN,
    "hasCrm" BOOLEAN,
    "previousAttempts" TEXT,
    "idealOutcome90d" TEXT,
    "specificTargets" TEXT,
    "location" TEXT,
    "talentCategory" TEXT,
    "currentRole" TEXT,
    "currentEmployer" TEXT,
    "employmentStatus" "EmploymentStatus",
    "yearsExperience" INTEGER,
    "seniorityLevel" "SeniorityLevel",
    "seniority" TEXT,
    "engagementPref" TEXT,
    "markets" TEXT,
    "dealHistory" JSONB,
    "confidenceMarkets" JSONB,
    "languagesSpoken" TEXT[],
    "linkedInUrl" TEXT,
    "references" JSONB,
    "cvFileName" TEXT,
    "cvFileUrl" TEXT,
    "caseStudyResponse" TEXT,
    "availabilityHours" "AvailabilityHours",
    "earliestStart" TIMESTAMP(3),
    "rateExpectationMin" INTEGER,
    "rateExpectationMax" INTEGER,
    "rateCurrency" TEXT DEFAULT 'USD',
    "preferredStructures" TEXT[],
    "paymentProvider" "PaymentProvider",
    "feeAmountMinor" INTEGER NOT NULL DEFAULT 0,
    "feeCurrency" TEXT,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "feeAmountUsd" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "need_diagnoses" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "DiagnosisStatus" NOT NULL DEFAULT 'DRAFT_AI',
    "aiContent" JSONB NOT NULL,
    "humanEditedContent" JSONB,
    "clientFacingContent" JSONB,
    "reviewerNotes" TEXT,
    "revisionNotes" TEXT,
    "aiModel" TEXT,
    "promptVersion" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizedAt" TIMESTAMP(3),
    "clientApprovedAt" TIMESTAMP(3),

    CONSTRAINT "need_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity_briefs" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "internalContent" JSONB NOT NULL,
    "clientFacingContent" JSONB NOT NULL,
    "suggestedTemplateId" TEXT,
    "aiModel" TEXT,
    "promptVersion" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunity_briefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_pre_screens" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "recommendation" "PreScreenRecommendation" NOT NULL,
    "completenessScore" INTEGER NOT NULL,
    "consistencyScore" INTEGER NOT NULL,
    "referenceScore" INTEGER NOT NULL,
    "assessmentScore" INTEGER NOT NULL,
    "redFlags" JSONB NOT NULL,
    "suggestedProbeQuestions" JSONB NOT NULL,
    "linkedinVerification" JSONB,
    "referenceVerification" JSONB,
    "aiModel" TEXT,
    "promptVersion" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talent_pre_screens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sow_templates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateType" "SowTemplateType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    "contentPlainText" TEXT NOT NULL,
    "placeholders" JSONB NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "suggestedFeeMin" INTEGER NOT NULL,
    "suggestedFeeMax" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sow_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE UNIQUE INDEX "memberships_userId_orgId_key" ON "memberships"("userId", "orgId");
CREATE INDEX "memberships_userId_idx" ON "memberships"("userId");
CREATE INDEX "memberships_orgId_idx" ON "memberships"("orgId");
CREATE UNIQUE INDEX "startup_profiles_startupId_key" ON "startup_profiles"("startupId");
CREATE INDEX "demand_readiness_scores_profileId_idx" ON "demand_readiness_scores"("profileId");
CREATE UNIQUE INDEX "invite_tokens_token_key" ON "invite_tokens"("token");
CREATE INDEX "invite_tokens_token_idx" ON "invite_tokens"("token");
CREATE INDEX "invite_tokens_email_idx" ON "invite_tokens"("email");
CREATE UNIQUE INDEX "operator_profiles_operatorId_key" ON "operator_profiles"("operatorId");
CREATE INDEX "supply_quality_scores_profileId_idx" ON "supply_quality_scores"("profileId");
CREATE INDEX "discovery_calls_startupProfileId_idx" ON "discovery_calls"("startupProfileId");
CREATE INDEX "discovery_calls_scheduledAt_idx" ON "discovery_calls"("scheduledAt");
CREATE UNIQUE INDEX "match_candidates_shortlistId_operatorId_key" ON "match_candidates"("shortlistId", "operatorId");
CREATE INDEX "match_candidates_shortlistId_idx" ON "match_candidates"("shortlistId");
CREATE INDEX "match_candidates_operatorId_idx" ON "match_candidates"("operatorId");
CREATE INDEX "match_shortlists_startupProfileId_idx" ON "match_shortlists"("startupProfileId");
CREATE UNIQUE INDEX "sow_versions_sowId_version_key" ON "sow_versions"("sowId", "version");
CREATE UNIQUE INDEX "contracts_sowId_key" ON "contracts"("sowId");
CREATE UNIQUE INDEX "contracts_idempotencyKey_key" ON "contracts"("idempotencyKey");
CREATE INDEX "document_logs_contractId_idx" ON "document_logs"("contractId");
CREATE UNIQUE INDEX "payment_plans_contractId_key" ON "payment_plans"("contractId");
CREATE INDEX "invoices_paymentPlanId_idx" ON "invoices"("paymentPlanId");
CREATE INDEX "invoices_status_idx" ON "invoices"("status");
CREATE UNIQUE INDEX "invoices_stripeId_key" ON "invoices"("stripeId");
CREATE UNIQUE INDEX "payment_events_stripeEventId_key" ON "payment_events"("stripeEventId");
CREATE INDEX "payment_events_invoiceId_idx" ON "payment_events"("invoiceId");
CREATE UNIQUE INDEX "engagements_contractId_key" ON "engagements"("contractId");
CREATE INDEX "engagements_startupId_idx" ON "engagements"("startupId");
CREATE INDEX "engagements_operatorId_idx" ON "engagements"("operatorId");
CREATE INDEX "engagement_milestones_engagementId_idx" ON "engagement_milestones"("engagementId");
CREATE INDEX "workspace_notes_engagementId_idx" ON "workspace_notes"("engagementId");
CREATE INDEX "activity_logs_engagementId_idx" ON "activity_logs"("engagementId");
CREATE INDEX "health_score_snapshots_engagementId_idx" ON "health_score_snapshots"("engagementId");
CREATE INDEX "system_nudges_engagementId_idx" ON "system_nudges"("engagementId");
CREATE INDEX "system_nudges_targetUserId_idx" ON "system_nudges"("targetUserId");
CREATE INDEX "escalation_cases_engagementId_idx" ON "escalation_cases"("engagementId");
CREATE UNIQUE INDEX "closeout_reports_engagementId_key" ON "closeout_reports"("engagementId");
CREATE INDEX "engagement_ratings_engagementId_idx" ON "engagement_ratings"("engagementId");
CREATE INDEX "engagement_ratings_reviewerId_idx" ON "engagement_ratings"("reviewerId");
CREATE INDEX "engagement_ratings_revieweeId_idx" ON "engagement_ratings"("revieweeId");
CREATE UNIQUE INDEX "renewal_recommendations_engagementId_key" ON "renewal_recommendations"("engagementId");
CREATE INDEX "applications_email_idx" ON "applications"("email");
CREATE INDEX "applications_status_idx" ON "applications"("status");
CREATE UNIQUE INDEX "applications_stripeSessionId_key" ON "applications"("stripeSessionId");
CREATE UNIQUE INDEX "need_diagnoses_applicationId_key" ON "need_diagnoses"("applicationId");
CREATE UNIQUE INDEX "opportunity_briefs_applicationId_key" ON "opportunity_briefs"("applicationId");
CREATE UNIQUE INDEX "talent_pre_screens_applicationId_key" ON "talent_pre_screens"("applicationId");
CREATE UNIQUE INDEX "sow_templates_slug_key" ON "sow_templates"("slug");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "startup_profiles" ADD CONSTRAINT "startup_profiles_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "demand_readiness_scores" ADD CONSTRAINT "demand_readiness_scores_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "operator_profiles" ADD CONSTRAINT "operator_profiles_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "supply_quality_scores" ADD CONSTRAINT "supply_quality_scores_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "operator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "discovery_calls" ADD CONSTRAINT "discovery_calls_startupProfileId_fkey" FOREIGN KEY ("startupProfileId") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "match_shortlists" ADD CONSTRAINT "match_shortlists_startupProfileId_fkey" FOREIGN KEY ("startupProfileId") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "match_candidates" ADD CONSTRAINT "match_candidates_shortlistId_fkey" FOREIGN KEY ("shortlistId") REFERENCES "match_shortlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "match_candidates" ADD CONSTRAINT "match_candidates_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operator_profiles"("operatorId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sow_versions" ADD CONSTRAINT "sow_versions_sowId_fkey" FOREIGN KEY ("sowId") REFERENCES "statements_of_work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_sowId_fkey" FOREIGN KEY ("sowId") REFERENCES "statements_of_work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_logs" ADD CONSTRAINT "document_logs_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_paymentPlanId_fkey" FOREIGN KEY ("paymentPlanId") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON UPDATE CASCADE;
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startup_profiles"("id") ON UPDATE CASCADE;
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operator_profiles"("id") ON UPDATE CASCADE;
ALTER TABLE "engagement_milestones" ADD CONSTRAINT "engagement_milestones_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "engagements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workspace_notes" ADD CONSTRAINT "workspace_notes_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "engagements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workspace_notes" ADD CONSTRAINT "workspace_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "engagements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON UPDATE CASCADE;
ALTER TABLE "health_score_snapshots" ADD CONSTRAINT "health_score_snapshots_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "engagements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "system_nudges" ADD CONSTRAINT "system_nudges_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "engagements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "system_nudges" ADD CONSTRAINT "system_nudges_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "escalation_cases" ADD CONSTRAINT "escalation_cases_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "engagements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "escalation_cases" ADD CONSTRAINT "escalation_cases_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON UPDATE CASCADE;
ALTER TABLE "closeout_reports" ADD CONSTRAINT "closeout_reports_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "engagements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "engagement_ratings" ADD CONSTRAINT "engagement_ratings_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "engagements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "engagement_ratings" ADD CONSTRAINT "engagement_ratings_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON UPDATE CASCADE;
ALTER TABLE "engagement_ratings" ADD CONSTRAINT "engagement_ratings_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "users"("id") ON UPDATE CASCADE;
ALTER TABLE "renewal_recommendations" ADD CONSTRAINT "renewal_recommendations_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "engagements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "need_diagnoses" ADD CONSTRAINT "need_diagnoses_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "opportunity_briefs" ADD CONSTRAINT "opportunity_briefs_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "talent_pre_screens" ADD CONSTRAINT "talent_pre_screens_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
