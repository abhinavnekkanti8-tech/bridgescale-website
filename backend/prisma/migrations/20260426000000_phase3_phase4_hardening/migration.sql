ALTER TABLE "users"
ADD COLUMN "privacyAcceptedAt" TIMESTAMP(3),
ADD COLUMN "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN "noticeVersion" TEXT;

ALTER TABLE "applications"
ADD COLUMN "privacyAcceptedAt" TIMESTAMP(3),
ADD COLUMN "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN "noticeVersion" TEXT;

ALTER TABLE "document_logs"
ADD COLUMN "metadata" JSONB;
