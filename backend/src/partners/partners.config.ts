/**
 * Partner integration env-flag helper.
 *
 * Phase 6 wire-ups land partner SDKs on top of the Phase-3 plumbing. We
 * keep them gated behind PARTNER_LIVE_MODE so the full service surface ships
 * while the actual API keys/credentials are being provisioned. When the flag
 * is off, each partner method returns a deterministic stub that exercises the
 * same code paths and DB writes as a live response would.
 */
export function partnerLiveMode(): boolean {
  return process.env.PARTNER_LIVE_MODE === 'true';
}

export function envOrThrow(key: string): string {
  const v = process.env[key];
  if (!v || v.length === 0) {
    throw new Error(`Missing required partner env var: ${key}`);
  }
  return v;
}

/** Lightweight stub-id factory so test data is recognisable. */
export function stubId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
