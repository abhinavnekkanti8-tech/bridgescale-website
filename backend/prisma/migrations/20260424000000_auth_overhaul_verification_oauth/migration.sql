DO $$
BEGIN
  CREATE TYPE "OnboardingStage" AS ENUM ('ONBOARDING', 'PENDING_APPROVAL', 'ACTIVE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'MICROSOFT', 'APPLE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "EmailActionType" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE "ApplicationStatus" ADD VALUE 'EMAIL_VERIFICATION_PENDING';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "onboardingStage" "OnboardingStage" NOT NULL DEFAULT 'ACTIVE';

UPDATE "users"
SET
  "onboardingStage" = CASE
    WHEN "status" = 'PENDING_APPROVAL' THEN 'PENDING_APPROVAL'::"OnboardingStage"
    ELSE 'ACTIVE'::"OnboardingStage"
  END,
  "emailVerifiedAt" = COALESCE("emailVerifiedAt", NOW());

DROP INDEX IF EXISTS "users_magicLinkToken_key";
DROP INDEX IF EXISTS "users_magicLinkToken_idx";

ALTER TABLE "users"
  DROP COLUMN IF EXISTS "magicLinkToken",
  DROP COLUMN IF EXISTS "magicLinkExpiry";

CREATE TABLE IF NOT EXISTS "oauth_identities" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" "AuthProvider" NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "providerEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "oauth_identities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "email_action_tokens" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "email" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "type" "EmailActionType" NOT NULL,
  "metadata" JSONB,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_action_tokens_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "oauth_identities"
    ADD CONSTRAINT "oauth_identities_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "email_action_tokens"
    ADD CONSTRAINT "email_action_tokens_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "oauth_identities_provider_providerAccountId_key"
  ON "oauth_identities"("provider", "providerAccountId");
CREATE INDEX IF NOT EXISTS "oauth_identities_userId_idx"
  ON "oauth_identities"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "email_action_tokens_tokenHash_key"
  ON "email_action_tokens"("tokenHash");
CREATE INDEX IF NOT EXISTS "email_action_tokens_email_type_idx"
  ON "email_action_tokens"("email", "type");
CREATE INDEX IF NOT EXISTS "email_action_tokens_expiresAt_idx"
  ON "email_action_tokens"("expiresAt");
CREATE INDEX IF NOT EXISTS "users_onboardingStage_idx"
  ON "users"("onboardingStage");
