# AG Platform (BridgeScale) — Codebase Guide

## What This Is
A B2B fractional sales talent marketplace. Companies apply to find fractional operators; operators apply to get matched with companies. The platform runs the full lifecycle: intake → matching → contracts → engagements → closeout.

## Monorepo Structure
```
Platform/
├── backend/            NestJS API (TypeScript) — port 4000
├── frontend/           Next.js 14 App Router (TypeScript) — port 3000
├── Docs/               Reference docs, task lists (TASKS_PHASE*.md), ADRs
└── docker-compose.yml  PostgreSQL 16 + Redis 7 (Redis provisioned but not yet used by code)
```

## Backend (`backend/`)
- **Framework:** NestJS 11 with Prisma ORM → PostgreSQL
- **Entry:** `src/main.ts` → `src/app.module.ts`
- **Auth:** Session-based (express-session, in-memory store — dev only), magic links. Guard: `SessionAuthGuard`
- **API prefix:** `/api/v1/` (applies to ALL routes, including the health check: `GET /api/v1/health`)
- **Key modules:** applications, auth, startups, operators, matching, contracts, payments, engagements, closeout, health, diagnoses, opportunity-briefs, talent-pre-screen, interviews, approvals, analytics, compliance, partners, admin-ops
- **Payments:** Razorpay (companies, INR — real SDK installed) + Stripe (talent, USD — **NOT integrated yet**, see below). Controlled by `DUMMY_PAYMENT_MODE=true` env var.
- **AI:** OpenAI `gpt-4o` via `openai` SDK in `src/ai/ai.service.ts` and `ai-workflow.service.ts`. Async background jobs. An `OPENAI_API_KEY` starting with `sk-dummy` triggers deterministic mock responses.

### Stripe status (intentional)
Stripe is deliberately dummy-only — the business relationship/integration hasn't been set up yet. There is **no `stripe` package** in `package.json`. Talent checkout "sessions" are fake IDs (`applications.service.ts`, search `TODO: Create real Stripe`), and webhook signature verification is hand-rolled. When real Stripe integration happens: install the SDK, replace the dummy session creation, and swap the manual signature check for `stripe.webhooks.constructEvent`. Note: Razorpay payment IDs are currently stored in the `stripePaymentId` column — don't assume that field is Stripe-only.

## Frontend (`frontend/`)
- **Framework:** Next.js 14 App Router, `src/app/` directory
- **Styling:** CSS Modules + global CSS variables (`--color-*`, `--space-*`)
- **API calls:** Direct `fetch('/api/v1/...')` with `credentials: 'include'` — proxied to the backend via a rewrite in `next.config.js`
- **Route protection:** `src/middleware.ts` gates `/startup`, `/operator`, `/admin` on the session cookie (UX-level only; real authz is backend guards)
- **Key route groups:**
  - `/for-companies/apply` + `/for-talent/apply` — public signup forms
  - `/startup/dashboard` — company user dashboard
  - `/operator/dashboard` — talent user dashboard
  - `/admin/*` — platform admin
  - `/auth/login` + `/auth/magic` — authentication
- **Build config gotcha:** `next.config.js` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` — `next build` will NOT catch type errors. Always run `npm run type-check` and `npm run lint` (CI does both).

## Data Model (key models)
- `User` — email, passwordHash, status (PENDING_APPROVAL|ACTIVE|...)
- `Organization` — STARTUP | OPERATOR_ENTITY | PLATFORM
- `Membership` — links User ↔ Organization with role (STARTUP_ADMIN | OPERATOR | PLATFORM_ADMIN | ...)
- `Application` — the intake form. type=COMPANY or TALENT. Status flow: SUBMITTED → AWAITING_COMPLETION → UNDER_REVIEW → APPROVED/REJECTED
- `StartupProfile` / `OperatorProfile` — detailed profiles after approval
- `MatchShortlist` / `MatchCandidate` — matching results
- `StatementOfWork` → `Contract` → `PaymentPlan` → `Invoice`
- `Engagement` — active work, with milestones and workspace notes

## Free Signup Flow (Phase 2 — implemented)
- Signup is FREE. No payment at application time.
- `POST /api/v1/applications` creates the application + user + org + membership in one shot, sets session cookie, returns `{ session: { userId, orgId, role } }`.
- Frontend hard-redirects to dashboard: `window.location.href = '/startup/dashboard'` or `/operator/dashboard`
- Talent can skip assessment/references at signup → status becomes `AWAITING_COMPLETION`
- Completing skipped steps: `POST /api/v1/applications/complete-assessment` and `POST /api/v1/applications/complete-references`
- Payment comes LATER to "unlock matching": `POST /api/v1/applications/initiate-unlock`
- Check what's left: `GET /api/v1/applications/completion-status`
- The Phase 2 UI components exist: `frontend/src/components/BlurredMatchCard.tsx`, `UnlockMatchingCTA.tsx`, `CompletionChecklist.tsx`

## Environment Variables (backend)
Full reference: `backend/.env.example` (kept accurate). Highlights:
- `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` — express-session secret
- `DUMMY_PAYMENT_MODE` — `true` skips real payment (auto-confirms). **Warning:** service defaults are inconsistent when unset (`razorpay.service.ts` defaults `true`, `contracts.service.ts` defaults `false`) — always set it explicitly.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — dummy until Stripe is integrated
- `OPENAI_API_KEY` / `OPENAI_MODEL` — for AI features (`sk-dummy` prefix = mock mode)
- `FRONTEND_URL` — used in email links, payment redirects, and CORS origin

## Common Commands
```bash
# Backend
cd backend && npm run start:dev
cd backend && npx prisma migrate dev --name <name>
cd backend && npx prisma studio

# Frontend
cd frontend && npm run dev
```

## Task / Planning Files
- `Docs/TASKS_PHASE1.md`, `Docs/TASKS_PHASE2.md` — historical phase task lists (Phases 1–2 done)
- `Docs/TECHNICAL.md` — architecture, API reference, data model
- `Docs/PRODUCTION_READINESS_PLAN.md` — plan for closing production gaps (sessions, uploads, rate limiting, secrets hygiene, dependency upgrades)
