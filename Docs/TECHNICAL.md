# BridgeScale — Technical Documentation

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [Backend (NestJS)](#2-backend-nestjs)
3. [Frontend (Next.js)](#3-frontend-nextjs)
4. [Database schema](#4-database-schema)
5. [Authentication](#5-authentication)
6. [Payments](#6-payments)
7. [AI integrations](#7-ai-integrations)
8. [Email](#8-email)
9. [API reference](#9-api-reference)
10. [Environment variables](#10-environment-variables)
11. [Infrastructure & deployment](#11-infrastructure--deployment)
12. [Implementation status](#12-implementation-status)

---

## 1. Architecture overview

```
Browser
  │
  ├── Next.js 14 (App Router) — port 3000
  │     ├── Public marketing  /  /for-companies  /for-talent  /about  /blog
  │     ├── Auth              /auth/login  /auth/magic
  │     ├── Company portal    /startup/dashboard  /startup/*
  │     ├── Talent portal     /operator/dashboard  /operator/*
  │     └── Admin             /admin/*
  │           │
  │           │ fetch('/api/v1/...', { credentials: 'include' })
  │           │ rewrites proxied by next.config.js → localhost:4000
  │           ▼
  ├── NestJS API — port 4000
  │     ├── Global prefix: /api/v1/
  │     ├── Session auth (express-session, platform.sid cookie)
  │     ├── 20+ feature modules (see §2)
  │     ├── Prisma ORM → PostgreSQL
  │     └── Background AI tasks (fire-and-forget, non-blocking)
  │
  ├── PostgreSQL 16 — port 5432
  │     └── 30+ tables via Prisma schema
  │
  ├── Redis 7 — port 6379
  │     └── Available for session store in production (currently MemoryStore in dev)
  │
  └── External services
        ├── OpenAI (gpt-4o) — AI diagnosis, pre-screen, matching
        ├── Razorpay — company payments (INR)
        ├── Stripe — talent payments (USD)
        └── Resend — transactional email
```

**Key design decisions:**
- Session-based auth (not JWT) — simpler, no token rotation complexity, secure HttpOnly cookies
- AI tasks run asynchronously and never block HTTP responses
- `DUMMY_PAYMENT_MODE=true` lets the full flow run without hitting real payment gateways
- `sk-dummy-*` OpenAI key triggers mock AI responses for local development

---

## 2. Backend (NestJS)

### Entry point

`backend/src/main.ts` → `backend/src/app.module.ts`

```
Port:         4000 (BACKEND_PORT env)
API prefix:   /api/v1/
CORS:         credentials enabled; origin = FRONTEND_URL
Session:      express-session, cookie name platform.sid, 24h TTL
Logging:      Pino (JSON structured)
File uploads: Multer, disk storage → backend/uploads/
```

### Modules

| Module | Responsibility |
|---|---|
| `AuthModule` | Register, login, magic-link, session validation, logout |
| `UsersModule` | User queries and profile updates |
| `ApplicationsModule` | Intake forms, application lifecycle, payment hooks |
| `OperatorsModule` | Operator profile management |
| `StartupsModule` | Startup profile management |
| `DiscoveryModule` | Discovery calls, readiness assessment |
| `MatchingModule` | AI-driven matching engine, shortlists |
| `ContractsModule` | SOW versioning, contract signatures |
| `PaymentsModule` | Payment plans, invoice management |
| `EngagementsModule` | Active work tracking, milestones, workspace notes |
| `CloseoutModule` | Closeout reports, renewal recommendations |
| `AiModule` | OpenAI integration — all AI workflows |
| `EmailModule` | Transactional email via Resend |
| `AnalyticsModule` | Platform KPI dashboards |
| `DiagnosesModule` | AI-generated startup needs analysis |
| `OpportunityBriefsModule` | AI-generated matched opportunity scopes |
| `TalentPreScreenModule` | AI talent qualification |
| `InterviewsModule` | Interview scheduling and tracking |
| `ApprovalsModule` | Admin approval workflows |
| `SowModule` | Statement of Work generation and versioning |
| `ApplicationMatchingModule` | Matching orchestration post-approval |

### Auth guard

`SessionAuthGuard` — checks `req.session.user` exists. Applied globally; excluded on public routes.

```typescript
@CurrentUser() user: SessionUser   // injects current user in controllers
```

### Application status flow

```
SUBMITTED
  → AWAITING_COMPLETION       (talent skipped optional steps)
  → UNDER_REVIEW              (admin reviewing)
  → DIAGNOSIS_GENERATED       (AI needs diagnosis ready — company only)
  → DIAGNOSIS_APPROVED        (admin approved diagnosis)
  → BRIEF_GENERATED           (opportunity brief generated)
  → PRESCREENED               (AI pre-screen complete — talent only)
  → INTERVIEW_SCHEDULED       (interview booked — talent only)
  → APPROVED
  → REJECTED
```

---

## 3. Frontend (Next.js)

### Config

```
Framework:    Next.js 14.2, App Router
TypeScript:   5.4
Styling:      CSS Modules + global CSS custom properties (globals.css)
API calls:    fetch('/api/v1/...', { credentials: 'include' })
Proxy:        next.config.js rewrites /api/v1/* → BACKEND_URL/api/v1/*
```

### Route map

```
/                          Landing (marketing)
/for-companies             Companies marketing page + FAQ
/for-talent                Talent marketing page + FAQ
/for-companies/apply       Company signup form (multi-section)
/for-talent/apply          Talent signup form (multi-step)
/about                     About page
/blog                      Blog index
/blog/[slug]               Blog post

/auth/login                Password login
/auth/magic                Magic-link handler (?token=...)

/startup/dashboard         Company dashboard (post-login)
/startup/profile           Company profile editor
/startup/discovery         Discovery call scheduling
/startup/matching          Match shortlist view
/startup/contracts         Contract list
/startup/engagements       Engagement list
/startup/engagements/[id]  Active engagement workspace
/startup/billing           Invoices and payments

/operator/dashboard        Talent dashboard (post-login)
/operator/profile          Talent profile editor
/operator/matches          Matched companies view
/operator/invitations      Invitation management
/operator/contracts        Contract list
/operator/engagements      Engagement list

/admin/applications        All applications
/admin/startups            Startup management
/admin/operators           Operator management
/admin/matching            Matching oversight
/admin/deal-desk           Deal management
/admin/contracts           Contract management
/admin/analytics           Platform analytics
/admin/billing             Billing overview
/admin/settings            Platform settings
/admin/escalations         Escalation cases

/application/success       Post-submission success screen
/contracts/sow             SOW viewer/editor
```

### Design system

Global CSS tokens defined in `frontend/src/app/globals.css`:

```css
/* Crimson accent family */
--color-accent:        #99081F   /* button fills, borders */
--color-accent-hover:  #660013   /* hover state for all interactive elements */
--color-accent-light:  #D63A56   /* on dark backgrounds */
--color-accent-text:   #BA0C2F   /* typography highlights, links */
--color-accent-bg:     #E8E4DE   /* neutral warm fill (info states) */
--muted-bg:            #E8E4DE

/* Neutrals */
--color-bg:            #f5f3ef   /* page background (cream) */
--color-surface:       #f5f3ef
--color-surface-alt:   #ffffff   /* card / input backgrounds */
--color-border:        #d9d4cc
--color-text-primary:  #0f0f0f
--color-text-secondary:#706b65
--color-text-muted:    #9e9890

/* Error (distinct from brand red) */
/* --error: #EF4444 */
```

Button conventions (global `.btn`, `.btn-primary`, `.btn-secondary`):
- Primary: crimson fill → darker crimson on hover
- Secondary: crimson outline → crimson fill inversion on hover
- Ghost: muted text → crimson text on hover

Typography: `Playfair Display` (serif, headings) + `DM Sans` (body).

---

## 4. Database schema

Full schema: `backend/prisma/schema.prisma`

### Identity & access

| Model | Key fields |
|---|---|
| `User` | `email`, `name`, `passwordHash`, `status` (ACTIVE\|PENDING_APPROVAL\|INACTIVE\|SUSPENDED), `magicLinkToken`, `magicLinkExpiry`, `lastLoginAt` |
| `Organization` | `orgType` (STARTUP\|OPERATOR_ENTITY\|PLATFORM), `name`, `country`, `website` |
| `Membership` | links User ↔ Organization; `membershipRole`, `status` (PENDING\|ACTIVE\|INACTIVE) |
| `InviteToken` | team invite flow; `email`, `role`, `expiresAt`, `status` |

**Membership roles:** `STARTUP_ADMIN`, `STARTUP_MEMBER`, `OPERATOR`, `PLATFORM_ADMIN`, `DEAL_DESK`

### Applications & intake

`Application` — the central intake record:

| Field group | Fields |
|---|---|
| Identity | `type` (COMPANY\|TALENT), `status`, `userId`, `orgId` |
| Company fields | `companyName`, `stage`, `targetMarkets[]`, `salesMotion`, `budgetBand`, `needArea`, `urgency` |
| Talent fields | `talentCategory`, `currentRole`, `seniority`, `yearsExperience`, `employmentStatus`, `caseStudyResponse`, `references` (JSON), `availabilityHours` |
| Completion flags | `assessmentSkipped`, `referencesSkipped`, `matchingUnlocked` |
| Payment | `razorpayOrderId`, `stripeSessionId`, `paymentProvider`, `paidAt` |

### Profiles & scoring

| Model | Purpose |
|---|---|
| `StartupProfile` | Full company profile post-intake; linked to Organization |
| `DemandReadinessScore` | AI-generated readiness; 7-component breakdown; `eligibility` enum |
| `OperatorProfile` | Full talent profile; `lanes[]`, `regions[]`, `tier` (TIER_A\|TIER_B\|TIER_C\|UNVERIFIED) |
| `SupplyQualityScore` | AI-generated talent quality score |

### Matching

| Model | Purpose |
|---|---|
| `MatchShortlist` | Generated per startup; status (DRAFT\|PUBLISHED\|SELECTION_MADE\|EXPIRED) |
| `MatchCandidate` | Individual operator in a shortlist; `matchScore`, `scoreBreakdown` (JSON), `explanation`, `mainRisk` |

### Contracts & SOW

| Model | Purpose |
|---|---|
| `StatementOfWork` | Scoped engagement doc; versioned; status flow DRAFT → APPROVED → SIGNED → LOCKED |
| `SowVersion` | Version history with `content` (JSON), `changedBy`, `changeNote` |
| `Contract` | e-signature wrapper; tracks `startupSignedAt`, `operatorSignedAt`; status PENDING → FULLY_SIGNED |
| `DocumentLog` | Immutable audit trail for all contract actions |
| `SowTemplate` | Reusable templates by type (PIPELINE_SPRINT\|BD_SPRINT\|FRACTIONAL_RETAINER\|MARKET_ENTRY\|HYBRID_EQUITY) |

### Payments

| Model | Purpose |
|---|---|
| `PaymentPlan` | Per-contract; `planType` (CASH_SPRINT_FEE\|MONTHLY_RETAINER\|SUCCESS_FEE_ADDENDUM), `totalAmountUsd` |
| `Invoice` | Per plan; status DRAFT → ISSUED → PAID (or OVERDUE\|CANCELLED); `stripeUrl`, `paidAt` |
| `PaymentEvent` | Stripe/Razorpay webhook record; idempotency via `stripeEventId` |

### Engagements

| Model | Purpose |
|---|---|
| `Engagement` | Active work record; status NOT_STARTED → ACTIVE → COMPLETED\|TERMINATED; `healthScore` |
| `EngagementMilestone` | Deliverable; status PENDING → IN_PROGRESS → REVIEW → COMPLETED; `evidenceUrl` |
| `WorkspaceNote` | Async collaboration between company + talent |
| `ActivityLog` | Immutable engagement history |

### Health & governance

| Model | Purpose |
|---|---|
| `HealthScoreSnapshot` | Periodic AI health check; 3-component score (milestone pace, communication, payment) |
| `SystemNudge` | Platform-generated alerts (MILESTONE_DUE_SOON, PAYMENT_REMINDER, etc.) |
| `EscalationCase` | Issue tracking; status OPEN → INVESTIGATING → RESOLVED\|CLOSED |

### Closeout

| Model | Purpose |
|---|---|
| `CloseoutReport` | AI + human engagement summary; DRAFT → PUBLISHED |
| `EngagementRating` | Peer rating (1–5); `components` (JSON breakdown) |
| `RenewalRecommendation` | AI-suggested next step (RENEWAL\|RETAINER_CONVERSION\|FOLLOW_ON_SPRINT\|NONE) |

### AI workflow models

| Model | Purpose |
|---|---|
| `NeedDiagnosis` | Company needs analysis; AI draft → human review → client approval |
| `OpportunityBrief` | Matched opportunity scope; internal + client-facing versions |
| `TalentPreScreen` | AI talent qualification; `recommendation` (STRONG_PASS\|PASS\|CONDITIONAL\|FAIL), red flags, probe questions |

---

## 5. Authentication

### Session setup

```
Cookie name:   platform.sid
HttpOnly:      true
Secure:        true (production only)
SameSite:      lax
Max age:       24 hours (SESSION_MAX_AGE_MS)
Store:         MemoryStore (dev) — replace with connect-redis for production
```

A second non-HttpOnly cookie `platform.user_status` is set alongside the session cookie so the frontend can read the user's status without an API call.

### Password login

```
POST /api/v1/auth/login
├── Find user by email
├── Validate bcrypt password (10 salt rounds)
├── Check status not SUSPENDED/INACTIVE
├── Regenerate session (prevents fixation)
├── Set req.session.user + status cookie
└── Return { message, user }
```

### Magic link

```
1. Application submitted → POST /api/v1/auth/magic-init
   ├── Generate 32-byte hex token
   ├── Store token + expiry (15–30 min) on user record
   └── Send email: ${FRONTEND_URL}/auth/magic?token=<token>

2. User clicks link → frontend navigates to /auth/magic?token=X

3. POST /api/v1/auth/magic  { token }
   ├── Find user by token
   ├── Check expiry not passed
   ├── Check status not SUSPENDED
   ├── Consume token (set to null — single use)
   ├── Activate PENDING memberships
   ├── Regenerate session
   └── Return { message, user }
```

### Free signup (applies flow)

```
POST /api/v1/applications
└── Single transaction creates:
    ├── User  (status: PENDING_APPROVAL)
    ├── Organization  (type: STARTUP or OPERATOR_ENTITY)
    ├── Membership  (role: STARTUP_ADMIN or OPERATOR)
    └── Application  (status: SUBMITTED or AWAITING_COMPLETION)
└── Returns { session: { userId, orgId, role } }
└── Frontend hard-redirects to /startup/dashboard or /operator/dashboard
```

---

## 6. Payments

### Razorpay (companies, INR)

- **Amount:** ₹8,500 (850,000 paisa)
- **Purpose:** unlock talent matching
- **Flow:**
  1. `POST /api/v1/applications/initiate-unlock` → creates Razorpay order, returns `{ orderId, key }`
  2. Frontend opens `window.Razorpay` modal
  3. On success → `POST /api/v1/applications/payment/razorpay/verify`
     - Verifies HMAC-SHA256 signature
     - Sets `Application.matchingUnlocked = true`, `Application.paidAt`
     - Triggers opportunity brief generation (AI, background)
- **Dummy mode:** orders starting with `pay_dummy_*` auto-confirm when `RAZORPAY_KEY_ID=rzp_test_dummy`

### Stripe (talent, USD)

- **Amount:** $50 (5,000 cents)
- **Purpose:** unlock company matches
- **Webhook verification:** HMAC-SHA256 via `STRIPE_WEBHOOK_SECRET`
- **Idempotency:** PaymentEvent records keyed on `stripeEventId`
- **Dummy mode:** auto-confirmed when `DUMMY_PAYMENT_MODE=true`

### Engagement invoicing

After a contract is signed:

```
Contract (FULLY_SIGNED)
  └── PaymentPlan created  (planType: CASH_SPRINT_FEE | MONTHLY_RETAINER | ...)
        └── Invoice issued  (status: ISSUED)
              └── Stripe payment link → Invoice.stripeUrl
                    └── Webhook → PaymentEvent → Invoice.status = PAID
```

---

## 7. AI integrations

**Provider:** OpenAI `gpt-4o` (configurable via `OPENAI_MODEL`)

**Mock mode:** Set `OPENAI_API_KEY=sk-dummy-anything` — all AI functions return heuristic-based mock responses derived from input data. Useful for local dev and CI.

All AI tasks run as background fire-and-forget operations — they never block HTTP responses. Errors are logged and don't interrupt request flow.

### Features

#### Demand readiness scoring (startup)

Scores a startup's readiness to engage fractional talent. Generates `DemandReadinessScore`.

| Component | Max points |
|---|---|
| ICP clarity | 15 |
| Collateral readiness (deck + demo) | 15 |
| Execution capacity (named owner + bandwidth) | 20 |
| Budget readiness | 20 |
| Sales motion fit | 10 |
| Tooling readiness | 10 |
| Responsiveness commitment | 10 |

**Output:** `eligibility` — `INELIGIBLE` (<60) | `SPRINT_ONLY` (60–74) | `SPRINT_AND_RETAINER` (≥75)

#### Supply quality scoring (talent)

Scores a talent profile's quality and fit. Generates `SupplyQualityScore`. Output tier: `TIER_A` | `TIER_B` | `TIER_C` | `UNVERIFIED`.

#### Needs diagnosis (company)

`generateNeedsDiagnosis(applicationData)` → `NeedDiagnosis`

Generates structured analysis: challenges, opportunities, recommended role type, estimated sprint. Goes through AI draft → admin review → client approval before being shared with the company.

#### Talent pre-screen

`generatePreScreenForApplication(applicationId)` → `TalentPreScreen`

Assesses:
- **Completeness score** (0–100): all required fields filled
- **Consistency score**: cross-referenced claims
- **Reference score**: quality and seniority of references
- **Assessment score**: case study / pitch response quality

Output: `recommendation` (STRONG_PASS | PASS | CONDITIONAL | FAIL), red flags list, suggested probe questions for the expert interview.

Supports optional external verification via Hunter.io (email/LinkedIn) — falls back to GPT analysis if API keys are not set.

#### Matching

`generateMatchShortlist(startupId, operatorProfiles[])` → ranked `MatchCandidate[]`

Scores each operator against the startup profile and outputs: `matchScore`, `scoreBreakdown` (JSON), human-readable `explanation`, `mainRisk`.

#### Opportunity brief

`generateOpportunityBrief(startupId, operatorId)` → `OpportunityBrief`

Generates client-facing + internal scope briefs post-payment. Suggests an appropriate `SowTemplate`.

#### Health monitoring

Periodic review of active engagements. Generates `HealthScoreSnapshot` with 3 components: milestone pace, communication frequency, payment status. Suggests actions when score drops.

#### Closeout & renewal

AI generates `CloseoutReport` summary from milestone evidence + workspace notes. AI suggests renewal type: `RENEWAL` | `RETAINER_CONVERSION` | `FOLLOW_ON_SPRINT` | `NONE`.

---

## 8. Email

**Provider:** Resend (`EMAIL_API_KEY`)

Emails sent for:
- Magic link authentication
- Application confirmation
- Match notification
- Contract signing request
- Invoice issued
- Milestone reminders (via `SystemNudge`)

From address: `EMAIL_FROM` env var (e.g. `hello@bridgescale.com`)

---

## 9. API reference

All routes prefixed `/api/v1/`. Authenticated routes require the `platform.sid` session cookie.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create account |
| `POST` | `/auth/login` | No | Password login |
| `POST` | `/auth/magic` | No | Magic-link login |
| `POST` | `/auth/magic-init` | No | Send magic link email |
| `GET` | `/auth/session` | Yes | Current user |
| `POST` | `/auth/logout` | Yes | Destroy session |

### Applications

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/applications` | No | Create application + account (free signup) |
| `GET` | `/applications/my-application` | Yes | Current user's application |
| `GET` | `/applications/:id/status` | Yes | Application status |
| `GET` | `/applications/completion-status` | Yes | What's left to complete |
| `POST` | `/applications/complete-assessment` | Yes | Submit assessment (talent) |
| `POST` | `/applications/complete-references` | Yes | Submit references (talent) |
| `POST` | `/applications/initiate-unlock` | Yes | Create payment order |
| `POST` | `/applications/payment/razorpay/verify` | Yes | Verify Razorpay payment |
| `POST` | `/applications/payment/dummy-confirm` | Yes | Dev: auto-confirm payment |
| `POST` | `/applications/payment/razorpay/webhook` | No | Razorpay webhook |

### Profiles

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/startups/:id` | Yes | Get startup profile |
| `PATCH` | `/startups/:id` | Yes | Update startup profile |
| `GET` | `/operators/:id` | Yes | Get operator profile |
| `PATCH` | `/operators/:id` | Yes | Update operator profile |

### Matching

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/matching/:startupId/shortlist` | Yes | Get shortlist |
| `POST` | `/matching/:startupId/select` | Yes | Company selects candidate |
| `PATCH` | `/matching/candidates/:id/interest` | Yes | Operator expresses interest |

### Contracts & SOW

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/contracts/:id` | Yes | Get contract |
| `POST` | `/contracts/:id/sign` | Yes | Sign contract |
| `GET` | `/sow/:id` | Yes | Get SOW |
| `PATCH` | `/sow/:id` | Yes | Update SOW |

### Engagements

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/engagements/:id` | Yes | Get engagement |
| `POST` | `/engagements/:id/milestones` | Yes | Create milestone |
| `PATCH` | `/engagements/:id/milestones/:milestoneId` | Yes | Update milestone |
| `POST` | `/engagements/:id/notes` | Yes | Add workspace note |

### Admin

| Method | Path | Auth (admin) | Description |
|---|---|---|---|
| `GET` | `/admin/applications` | Yes | List all applications |
| `PATCH` | `/admin/applications/:id/approve` | Yes | Approve application |
| `PATCH` | `/admin/applications/:id/reject` | Yes | Reject application |
| `POST` | `/admin/applications/:id/schedule-interview` | Yes | Schedule interview (talent) |
| `GET` | `/admin/startups` | Yes | List startups |
| `GET` | `/admin/operators` | Yes | List operators |
| `GET` | `/admin/analytics` | Yes | Platform KPIs |

### Utility

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |

---

## 10. Environment variables

### Backend (`backend/.env`)

```bash
# Database
DATABASE_URL="postgresql://platform:platform_dev@localhost:5432/platform_dev"
DB_USER=platform
DB_PASSWORD=platform_dev
DB_NAME=platform_dev

# Session
SESSION_SECRET=change_this_to_a_long_random_secret_in_production
SESSION_MAX_AGE_MS=86400000

# AI
OPENAI_API_KEY=sk-dummy-replace-with-real-key
OPENAI_MODEL=gpt-4o

# Stripe (talent, USD)
STRIPE_SECRET_KEY=sk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_dummy
STRIPE_PUBLISHABLE_KEY=pk_test_dummy

# Razorpay (companies, INR)
RAZORPAY_KEY_ID=rzp_test_dummy
RAZORPAY_KEY_SECRET=dummy_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=dummy_webhook_secret

# Email
EMAIL_PROVIDER=resend
EMAIL_API_KEY=dummy_replace_with_real_key
EMAIL_FROM=noreply@bridgescale.com

# External verification (optional)
HUNTER_API_KEY=               # falls back to GPT if blank
LINKEDIN_VERIFIER_API_KEY=
CROSS_VERIFY_MODE=dummy       # or real

# Application
NODE_ENV=development
BACKEND_PORT=4000
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:4000

# Feature flags
DUMMY_PAYMENT_MODE=true       # true = skip real payment gateways
```

### Frontend (`frontend/.env.local`)

```bash
BACKEND_URL=http://localhost:4000
```

---

## 11. Infrastructure & deployment

### Local (Docker Compose)

`docker-compose.yml` provides:

| Service | Image | Port | Notes |
|---|---|---|---|
| `db` | postgres:16 | 5432 | Named volume `postgres_data` — data persists across restarts |
| `redis` | redis:7 | 6379 | No persistence in dev |

**Safe restart (preserves data):**
```bash
docker-compose up -d          # start/restart containers
cd backend && npx prisma migrate deploy   # apply pending migrations
npm run start:dev
```

**Full reset (wipes data):**
```bash
docker-compose down --volumes  # destroys postgres_data volume
docker-compose up -d
npx prisma db push --accept-data-loss
```

### Production checklist

- [ ] Replace `SESSION_SECRET` with a long random string
- [ ] Set `NODE_ENV=production` (enables secure cookies, HTTPS-only session)
- [ ] Replace MemoryStore with `connect-redis` or `connect-pg-simple` for session storage (multi-instance safe)
- [ ] Set `DUMMY_PAYMENT_MODE=false` and configure real Razorpay + Stripe keys
- [ ] Set `OPENAI_API_KEY` to a real key
- [ ] Set `EMAIL_API_KEY` (Resend) with a verified sending domain
- [ ] Configure `FRONTEND_URL` to the production domain
- [ ] Set up SSL termination (Nginx / Caddy / load balancer)
- [ ] Set up Postgres backups (daily snapshots minimum)
- [ ] Configure Redis persistence (`appendonly yes`) if using for sessions

### Health check

`GET /health` — returns `200 OK` with no auth required. Use for load balancer / uptime monitoring.

---

## 12. Implementation status

### Done

- Auth system (register, login, magic link, session management)
- Company and talent intake forms (multi-step, validation, Rest-of-World detail input)
- Free signup flow — single API call creates user + org + membership + application
- Auto-login after signup, redirect to dashboard
- Payment unlock flow (Razorpay for companies, Stripe for talent)
- Full database schema (30+ models, complete lifecycle)
- AI integrations (demand scoring, supply scoring, diagnosis, pre-screen, matching, brief generation, health, closeout)
- 20+ backend modules with full service/controller/DTO layers
- Docker Compose dev environment
- Marketing pages (landing, for-companies, for-talent, about, blog)
- FAQ accordion sections on marketing pages
- Crimson color system across all frontend CSS
- Admin application review, interview scheduling, approve/reject

### In progress / pending

| Area | What's needed |
|---|---|
| Company dashboard | Match display (`BlurredMatchCard`), `UnlockMatchingCTA`, application status timeline |
| Talent dashboard | `CompletionChecklist`, match notifications, unlock CTA |
| Matching UI | Shortlist browsing, candidate selection, interest flow |
| Contract signing | SOW review UI, e-signature integration (DocuSign API is stubbed) |
| Engagement workspace | Milestone tracking UI, workspace notes, health score display |
| Admin dashboard | Full CRUD UI for all admin workflows |
| Email templates | Transactional email HTML templates (Resend configured, templates not written) |
| S3 document storage | Config ready in env, integration not implemented |
| Interview scheduling | Backend endpoint exists, no UI |
| Analytics dashboard | Backend module exists, no UI |
| Blog | Route exists, no CMS/content layer |
