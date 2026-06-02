-- CreateEnum
CREATE TYPE "EquityType" AS ENUM ('FAST', 'DIRECT');

-- CreateEnum
CREATE TYPE "EquityGrantStatus" AS ENUM ('PENDING', 'ACTIVE', 'FULLY_VESTED', 'LAPSED', 'ACCELERATED');

-- AlterEnum
ALTER TYPE "OperatorLane" ADD VALUE 'HYBRID_EQUITY';

-- AlterEnum
ALTER TYPE "PackageType" ADD VALUE 'HYBRID_EQUITY';

-- DropForeignKey
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_actorId_fkey";

-- DropForeignKey
ALTER TABLE "engagement_ratings" DROP CONSTRAINT "engagement_ratings_revieweeId_fkey";

-- DropForeignKey
ALTER TABLE "engagement_ratings" DROP CONSTRAINT "engagement_ratings_reviewerId_fkey";

-- DropForeignKey
ALTER TABLE "engagements" DROP CONSTRAINT "engagements_contractId_fkey";

-- DropForeignKey
ALTER TABLE "engagements" DROP CONSTRAINT "engagements_operatorId_fkey";

-- DropForeignKey
ALTER TABLE "engagements" DROP CONSTRAINT "engagements_startupId_fkey";

-- DropForeignKey
ALTER TABLE "escalation_cases" DROP CONSTRAINT "escalation_cases_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "workspace_notes" DROP CONSTRAINT "workspace_notes_authorId_fkey";

-- AlterTable
ALTER TABLE "applications" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "equityDocumentRef" TEXT,
ADD COLUMN     "hasEquityComponent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "email_action_tokens" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "oauth_identities" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "operator_profiles" ADD COLUMN     "openToEquity" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "statements_of_work" ADD COLUMN     "equityCashComponentUsd" INTEGER,
ADD COLUMN     "equityCliffMonths" INTEGER,
ADD COLUMN     "equityKpiMilestones" JSONB,
ADD COLUMN     "equityPct" DOUBLE PRECISION,
ADD COLUMN     "equityReviewApprovedAt" TIMESTAMP(3),
ADD COLUMN     "equityReviewRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "equityType" "EquityType",
ADD COLUMN     "equityVestingMonths" INTEGER,
ADD COLUMN     "fastValueUsd" INTEGER,
ADD COLUMN     "operatorLegalAck" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startupLegalAck" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vestingSchedule" TEXT;

-- CreateTable
CREATE TABLE "equity_grants" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "equityType" "EquityType" NOT NULL DEFAULT 'FAST',
    "equityPct" DOUBLE PRECISION,
    "fastValueUsd" INTEGER,
    "vestingStartDate" TIMESTAMP(3),
    "cliffMonths" INTEGER NOT NULL DEFAULT 6,
    "vestingMonths" INTEGER NOT NULL DEFAULT 36,
    "status" "EquityGrantStatus" NOT NULL DEFAULT 'PENDING',
    "vestedPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastEventAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equity_grants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "equity_grants_contractId_key" ON "equity_grants"("contractId");

-- CreateIndex
CREATE INDEX "equity_grants_contractId_idx" ON "equity_grants"("contractId");

-- CreateIndex
CREATE INDEX "statements_of_work_startupProfileId_idx" ON "statements_of_work"("startupProfileId");

-- CreateIndex
CREATE INDEX "statements_of_work_operatorId_idx" ON "statements_of_work"("operatorId");

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startup_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operator_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_notes" ADD CONSTRAINT "workspace_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_cases" ADD CONSTRAINT "escalation_cases_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_ratings" ADD CONSTRAINT "engagement_ratings_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_ratings" ADD CONSTRAINT "engagement_ratings_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equity_grants" ADD CONSTRAINT "equity_grants_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "role_template_engagement_combinations_operatorRole_serviceTempl" RENAME TO "role_template_engagement_combinations_operatorRole_serviceT_key";

-- RenameIndex
ALTER INDEX "role_template_engagement_combinations_serviceTemplate_engagemen" RENAME TO "role_template_engagement_combinations_serviceTemplate_engag_idx";

-- RenameIndex
ALTER INDEX "statements_of_work_serviceTemplate_engagementType_retainerFlavo" RENAME TO "statements_of_work_serviceTemplate_engagementType_retainerF_idx";
