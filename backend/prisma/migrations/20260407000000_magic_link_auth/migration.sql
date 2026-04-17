-- ── Magic-link auth fields on users ──────────────────────────────────────────
-- Make passwordHash nullable (users created from payment flow have no password)
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- Add magic link token + expiry
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "magicLinkToken" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "magicLinkExpiry" TIMESTAMP(3);

-- Unique index on magic link token for fast lookup
CREATE UNIQUE INDEX IF NOT EXISTS "users_magicLinkToken_key" ON "users"("magicLinkToken");
CREATE INDEX IF NOT EXISTS "users_magicLinkToken_idx" ON "users"("magicLinkToken");
