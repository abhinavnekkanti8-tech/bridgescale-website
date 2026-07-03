# Production Readiness Plan

**Created:** 2026-07-03, from the verification audit of `main` (c01d3496).
**Scope:** production-readiness gaps, slow-burn risks, and secrets hygiene.
Stripe stays dummy-mode by design until the business integration exists (tracked in Phase C below).

Each item lists: what's wrong → what to do → effort (S = under an hour, M = half-day, L = 1–2 days).

---

## Phase A — Secrets hygiene (do first, before any other work lands)

### A1. Untrack committed env files — **S**
`backend/.env` and `frontend/.env.local` are tracked in git. They hold only dummy
values today, but `.gitignore` cannot protect already-tracked files — the first real
key pasted into them gets committed.

```bash
git rm --cached backend/.env frontend/.env.local
git commit -m "chore: untrack local env files"
```
The files stay on disk; git just stops tracking them. `.gitignore` already covers
`.env` / `.env.*`, so no gitignore change is needed.

> History note: because only dummy values were ever committed, rewriting git history
> is NOT required. If a real key is ever found in history later, rotate that key —
> don't bother scrubbing history.

### A2. Guardrails against future leaks — **S**
- Add a pre-commit secret scan (e.g. `gitleaks` via a git hook or CI step).
- Add a CI job step: `git ls-files | grep -E '^\.env$|/\.env$|\.env\.local' && exit 1`
  to fail the build if an env file ever gets tracked again.

### A3. Production secret management — **M**
- Never put production secrets in files on the server. Use the host's secret store
  (Railway/Render/Fly env vars, or AWS SSM/Secrets Manager).
- Generate `SESSION_SECRET` with `openssl rand -base64 48`. The placeholder-detection
  in `production-config.ts` already rejects the default — keep that.
- Document rotation owners: Razorpay, OpenAI, Resend keys each need a named place
  to rotate them (dashboard URL) noted in this file when provisioned.

---

## Phase B — Correctness fixes (small, do before deploy)

### B1. Unify `DUMMY_PAYMENT_MODE` defaults — **S**
`razorpay.service.ts:39` defaults to `'true'`; `contracts.service.ts:46` defaults to
`'false'`. Extract one helper (e.g. `PaymentModeService.isDummy()` or a shared config
constant) and use it everywhere. Pick **default `false`** (fail safe: never silently
fake payments) and set `DUMMY_PAYMENT_MODE=true` explicitly in dev envs.

### B2. Health endpoint path — **S**
Actual endpoint is `/api/v1/health` (global prefix applies). Docs are now fixed.
Decide one of:
- (preferred) exclude it from the prefix so infra tooling gets the conventional path:
  `app.setGlobalPrefix('api/v1', { exclude: ['health'] })` in `main.ts`, or
- keep `/api/v1/health` and configure every LB/uptime probe accordingly.
Also consider splitting the infra health check out of `HealthController`, which
currently mixes it with engagement-health endpoints (nudges/escalations).

### B3. docker-compose healthcheck DB name — **S**
`pg_isready -U platform -d platform_dev` is hardcoded while `POSTGRES_DB` defaults to
`platform`. Change to `pg_isready -U ${DB_USER:-platform} -d ${DB_NAME:-platform}`
(or align the defaults with `.env.example`, which now uses `platform_dev`).

### B4. CI lint must not use `--fix` — **S**
`backend` `npm run lint` includes `--fix`, so CI silently mutates files instead of
failing. Add a `lint:check` script without `--fix` and use it in `ci.yml`.

---

## Phase C — Production infrastructure gaps (required before real users)

### C1. Persistent session store — **M** (highest priority in this phase)
MemoryStore loses all sessions on every restart and breaks multi-instance deploys.
Redis is already in `docker-compose.yml` and `REDIS_URL` is in env, but no client is
installed.
1. `npm i connect-redis redis` in backend.
2. In `main.ts`, wire `RedisStore` into the existing `session()` config, keyed off
   `REDIS_URL`; fall back to MemoryStore only when `NODE_ENV !== 'production'`.
3. Extend `validateProductionConfig` to require `REDIS_URL` in production.
4. Enable Redis persistence (`appendonly yes`) or accept logout-on-Redis-restart.
   (Alternative if you want one less moving part: `connect-pg-simple` reuses Postgres.)

### C2. Durable file uploads — **M/L**
CV uploads go to local disk (`uploads/cv`) — lost on redeploy on any PaaS. S3 env
vars exist but no SDK is installed.
1. Decide: S3-compatible storage (recommended) vs. "single VM with a mounted volume".
2. If S3: `npm i @aws-sdk/client-s3`, add a `StorageService` abstraction with
   `local` and `s3` drivers selected by env, migrate the two write paths
   (`applications.controller.ts` multer storage, `compliance.service.ts` reads).
3. Add max-size + MIME allowlist validation on upload if not already enforced.

### C3. Rate limiting + security headers — **M**
No brute-force protection on login/magic-link; no security headers.
1. `npm i @nestjs/throttler` — global default (e.g. 100 req/min/IP) plus strict
   overrides on `POST /auth/login`, magic-link request, and signup (e.g. 5/min).
2. `npm i helmet` — `app.use(helmet())` in `main.ts` (verify CORS + cookie behavior
   afterwards).
3. Session hardening is already decent (httpOnly, sameSite=lax, secure-in-prod,
   session regeneration) — no change needed.

### C4. Stripe integration (blocked on business setup — parked) — **L**
When the Stripe account exists:
1. `npm i stripe`; create real Checkout Sessions in
   `applications.service.ts` (search `TODO: Create real Stripe`).
2. Replace hand-rolled webhook signature parsing with
   `stripe.webhooks.constructEvent` (keep the existing tests, adapt fixtures).
3. Rename/alias the `stripePaymentId` column usage for Razorpay payments
   (currently Razorpay IDs are stored there) — a small migration + code sweep.
4. End-to-end test in Stripe test mode before flipping `DUMMY_PAYMENT_MODE=false`.

### C5. Deploy pipeline & ops baseline — **M**
- Add a deploy workflow (or documented manual procedure): build → `prisma migrate
  deploy` → start; health-gate on `/api/v1/health`.
- Postgres backups: daily snapshots minimum, test a restore once.
- Error visibility: pino already logs JSON; ship logs somewhere (host's log drain is
  fine to start). Consider Sentry for the frontend.

---

## Phase D — Slow-burn risks (schedule, not urgent)

### D1. Re-enable build-time type/lint enforcement in Next — **S**
Remove `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` from
`next.config.js` (both currently mask errors in any deploy that only runs
`next build`, e.g. Vercel). Type-check and lint pass clean today, so this is a
config-only change. Re-test `next build` on Windows; if the old SWC issue is gone,
also drop `swcMinify: false`.

### D2. Dependency upgrades (in order) — **M each**
1. **ESLint 8 → 9** (EOL; flat config migration) — backend and frontend together.
2. **Prisma 5.22 → 6 → 7** (two majors; follow the official upgrade guides, run the
   full test suite + `prisma migrate diff` against a scratch DB between majors).
3. **Next 14 → 15** (React 19 comes with it; App Router codemods available).
4. Routine: `npm audit` in CI as a non-blocking report.

### D3. Test coverage for core business flows — **L**
50 unit tests across ~35 modules; matching, engagements, and closeout have none, and
the frontend smoke script never runs in CI.
1. Add service-level tests for matching and engagement lifecycle first (highest
   business risk).
2. Add one supertest-based e2e happy path: signup → complete profile → unlock →
   match → contract (dummy payment mode makes this feasible in CI today).
3. Wire `frontend npm run test:ui-smoke` into CI.

### D4. Repo hygiene — **S**
- Move binary docs (`GTM Phases.docx`, `BridgeScale_Operating_Matrix.xlsx`, `.rtf`)
  and research folders out of the repo root (into `Docs/` or out of git entirely).
- Delete merged branches and stale worktrees
  (`git worktree prune` + `git branch -d` the merged ones).
- Stash review is parked per decision on 2026-07-03 — revisit before any
  history-affecting cleanup.
- Optional: rename the GitHub repo (`bridgescale-website`) to match its actual
  contents (full platform monorepo).

---

## Suggested sequencing

| Week | Items |
|---|---|
| 1 | A1, A2, B1–B4 (all small; one PR each or one combined PR) |
| 2 | C1 (Redis sessions), C3 (throttler + helmet) |
| 3 | C2 (uploads → S3), C5 (deploy pipeline + backups) |
| 4+ | D1, then D2 upgrades one at a time, D3 tests alongside feature work |
| When Stripe account exists | C4 |
