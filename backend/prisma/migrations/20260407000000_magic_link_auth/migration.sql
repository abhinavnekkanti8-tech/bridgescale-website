-- ── Magic-link auth fields on users ──────────────────────────────────────────
-- Make passwordHash nullable (users created from payment flow have no password)
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

-- Add magic link token + expiry
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "magic_link_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "magic_link_expiry" TIMESTAMP(3);

-- Unique index on magic link token for fast lookup
CREATE UNIQUE INDEX IF NOT EXISTS "users_magic_link_token_key" ON "users"("magic_link_token");
CREATE INDEX IF NOT EXISTS "users_magic_link_token_idx" ON "users"("magic_link_token");
