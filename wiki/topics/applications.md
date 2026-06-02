# Applications

*Sources: `backend/src/applications/` (controller + service + 5 DTOs) · `backend/prisma/schema.prisma` · `CLAUDE.md`*

---

## Purpose
[coverage: high]

The Applications module is the primary intake mechanism for both companies and talent. It handles the full lifecycle from public signup through admin review. Signup is **free** — no payment required at submission. Payment ("unlock matching") happens later from the dashboard.

The single `POST /api/v1/applications` endpoint creates the application, user account, organization, and membership in one shot, then sets the session cookie so the user is immediately logged in and redirected to their dashboard.

---

## Architecture
[coverage: high]

```
ApplicationsController   ← NestJS @Controller('applications')
  └── ApplicationsService
        ├── PrismaService          (DB)
        ├── EmailService           (confirmation emails, magic links)
        ├── RazorpayService        (payment orders)
        ├── AiWorkflowService      (async diagnosis / pre-screen trigger)
        └── CrossVerifyService     (async reference cross-verification)
```

The service is the only place that writes to `applications`, `users`, `organizations`, and `memberships`. Everything AI-related is fire-and-forget (`.catch(logger.error)` — never blocks the HTTP response).

---

## Talks To
[coverage: high]

| Module | How |
|--------|-----|
| `auth` | Session object set on `req.session` after `createApplication` |
| `email` | Sends confirmation, status-update, magic-link, diagnosis-generated emails |
| `payments/razorpay.service` | `createOrder` and `verifyPaymentSignature` for unlock-matching |
| `ai/ai-workflow.service` | `generateDiagnosisForApplication`, `generatePreScreenForApplication` |
| `ai/cross-verify.service` | `verifyReferences` for talent applications |
| `prisma` | All DB writes (application, user, org, membership, talentPreScreen) |

---

## API Surface
[coverage: high]

All routes live under `/api/v1/applications`.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/` | Public | Create application + account → auto-login |
| `GET` | `/my-application` | Session | Dashboard: get own application + AI results |
| `GET` | `/completion-status` | Session | Checklist: is assessment/references done? |
| `POST` | `/complete-assessment` | Session | Talent submits assessment from dashboard |
| `POST` | `/complete-references` | Session | Talent submits references from dashboard |
| `POST` | `/initiate-unlock` | Session | Start unlock-matching payment (Razorpay/Stripe) |
| `POST` | `/verify-unlock` | Public | Verify Razorpay payment for unlock |
| `GET` | `/:id/status` | Public | Post-payment status polling |
| `POST` | `/:id/upload-cv` | Public | Upload CV (PDF/DOC/DOCX, max 5 MB) |
| `POST` | `/payment/razorpay/verify` | Public | Legacy Razorpay verify (old flow) |
| `POST` | `/payment/dummy-confirm` | Public | Dev: instant confirm (DUMMY_PAYMENT_MODE only) |
| `POST` | `/payment/razorpay/webhook` | Public | Razorpay server webhook |
| `POST` | `/webhook` | Public | Stripe server webhook |
| `GET` | `/` | PLATFORM_ADMIN | List all applications (filterable by status) |
| `PATCH` | `/:id/status` | PLATFORM_ADMIN | Manual status update |
| `POST` | `/:id/schedule-interview` | PLATFORM_ADMIN | Set INTERVIEW_SCHEDULED + date |
| `POST` | `/:id/approve` | PLATFORM_ADMIN | Final approval → activates user account |
| `POST` | `/:id/reject` | PLATFORM_ADMIN | Final rejection with reason |

---

## Data
[coverage: high]

The `Application` model holds everything: company fields, talent profile, assessment, references, payment metadata, and free-signup control flags.

**Key status flow:**

```
(new) → SUBMITTED or AWAITING_COMPLETION
         ↓
      UNDER_REVIEW
         ↓
   [Company track]               [Talent track]
  DIAGNOSIS_GENERATED          PRESCREENED
  DIAGNOSIS_UNDER_REVIEW       INTERVIEW_SCHEDULED
  DIAGNOSIS_APPROVED           ↓
  BRIEF_GENERATED         APPROVED / REJECTED
         ↓
   APPROVED / REJECTED
```

`AWAITING_COMPLETION` is set when talent skips assessment or references at signup. They can complete later via dashboard endpoints.

**Free-signup control flags (on `Application`):**
- `assessmentSkipped` / `referencesSkipped` — set at signup
- `assessmentCompletedAt` / `referencesCompletedAt` — set when completed from dashboard
- `matchingUnlocked` / `matchingUnlockedAt` — set after payment

**Fee configuration:**
- Company: ₹8,500 = 850,000 paisa via Razorpay (INR)
- Talent: $50 = 5,000 cents via Stripe (USD)
- Stored in `feeAmountMinor` + `feeCurrency` + `paymentProvider`

---

## Key Decisions
[coverage: high]

**Free signup (Phase 2):** Removed the payment gate at signup. Applications are created immediately with `SUBMITTED` or `AWAITING_COMPLETION` status; `provisionAccountWithPassword` is called synchronously to create the user, org, and membership in one transaction. Membership `status` is set to `ACTIVE` immediately (not `PENDING`).

**Single endpoint creates everything:** `POST /applications` creates application + user + org + membership in one shot, sets the express-session cookie, and returns `{ session: { userId, orgId, role } }`. The frontend then does `window.location.href = '/startup/dashboard'` or `/operator/dashboard`.

**Duplicate guard:** Applications from the same email within 24h are rejected (excluding REJECTED status) to prevent accidents.

**Payment mode flag:** `DUMMY_PAYMENT_MODE=true` skips real Razorpay/Stripe and auto-confirms. Used in dev/staging.

---

## Gotchas
[coverage: high]

- `provisionAccount` (the old post-payment variant) and `provisionAccountWithPassword` (free signup) are both in the service — make sure you're calling the right one. The old one sends a magic link; the new one does not.
- CV upload uses `multer` with disk storage to `uploads/cv/` at the NestJS process CWD. In production, this directory needs to exist or be on a persistent volume.
- `stripeSessionId` is used to store Razorpay order IDs in the unlock-matching flow (field name mismatch — legacy from before dual-payment). This is confusing but intentional for backwards compat.
- The `feeAmountUsd` field is deprecated; use `feeAmountMinor` + `feeCurrency` instead.
- AI workflows are never awaited — errors only appear in logs, never in API responses.
