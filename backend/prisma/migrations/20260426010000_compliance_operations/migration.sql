CREATE TYPE "DataRequestType" AS ENUM ('EXPORT', 'DELETE');

CREATE TYPE "DataRequestStatus" AS ENUM ('COMPLETED', 'REJECTED');

CREATE TABLE "data_subject_requests" (
    "id" TEXT NOT NULL,
    "type" "DataRequestType" NOT NULL,
    "status" "DataRequestStatus" NOT NULL DEFAULT 'COMPLETED',
    "subjectEmail" TEXT NOT NULL,
    "subjectUserId" TEXT,
    "requestedBy" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "data_subject_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "data_subject_requests_subjectEmail_idx" ON "data_subject_requests"("subjectEmail");
CREATE INDEX "data_subject_requests_requestedBy_idx" ON "data_subject_requests"("requestedBy");
