# AG Platform — Codebase Guide

## What This Is
A B2B fractional sales talent marketplace. Companies apply to find fractional operators; operators apply to get matched with companies. The platform runs the full lifecycle: intake → matching → contracts → engagements → closeout.

## Monorepo Structure
```
Platform/
├── backend/          NestJS API (TypeScript)
├── frontend/         Next.js 14 App Router (TypeScript)
└── TASKS_PHASE*.md   Implementation task lists
```

## Backend (`backend/`)
- **Framework:** NestJS with Prisma ORM → PostgreSQL
- **Entry:** `src/main.ts` → `src/app.module.ts`
- **Auth:** Session-based (express-session), magic links. Guard: `SessionAuthGuard`
- **API prefix:** `/api/v1/`
- **Key modules:** applications, auth, startups, operators, matching, contracts, payments, engagements, closeout, health, diagnoses, opportunity-briefs, talent-pre-screen, interviews, approvals, analytics
- **Payments:** Razorpay (companies, INR) + Stripe (talent, USD). Controlled by `DUMMY_PAYMENT_MODE=true` env var.
- **AI:** Claude via `ai.service.ts` and `ai-workflow.service.ts`. Async background jobs.

## Frontend (`frontend/`)
- **Framework:** Next.js 14 App Router, `src/app/` directory
- **Styling:** CSS Modules + global CSS variables (`--color-*`, `--space-*`)
- **API calls:** Direct `fetch('/api/v1/...')` with `credentials: 'include'`
- **Key route groups:**
  - `/for-companies/apply` + `/for-talent/apply` — public signup forms
  - `/startup/dashboard` — company user dashboard
  - `/operator/dashboard` — talent user dashboard
  - `/admin/*` — platform admin
  - `/auth/login` + `/auth/magic` — authentication

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

## Pending Work (Phase 2 partials)
- **`BlurredMatchCard.tsx`** and **`UnlockMatchingCTA.tsx`** components not yet created in `frontend/src/components/` (Task 2.7). Startup dashboard has inline implementation but needs these proper components + match score display + price fixed to ₹8,500.
- **`CompletionChecklist.tsx`** component not yet created (Task 2.8). Operator dashboard has inline checklist but is missing the unlock payment button.

## Environment Variables (backend)
- `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` — express-session secret
- `DUMMY_PAYMENT_MODE` — `true` skips real payment (auto-confirms)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `ANTHROPIC_API_KEY` — for AI features
- `FRONTEND_URL` — used in email links and Stripe redirects

## Common Commands
```bash
# Backend
cd backend && npm run start:dev
cd backend && npx prisma migrate dev --name <name>
cd backend && npx prisma studio

# Frontend
cd frontend && npm run dev
```

## Task Files
- `TASKS_PHASE1.md` — copy/UX changes (mostly done)
- `TASKS_PHASE2.md` — free signup flow (Tasks 2.1–2.6 done, 2.7–2.8 partial, 2.9 done)
