# Frontend — Startup (Company) UI

*Sources: `frontend/src/app/startup/` · `frontend/src/app/for-companies/` · `frontend/src/app/services/*` · `frontend/src/components/engagement/` · `frontend/src/components/ServicePage.tsx` · `frontend/src/lib/api-client.ts` · `CLAUDE.md`*

---

## Purpose
[coverage: high]

All pages accessible to a company user (role: `STARTUP_ADMIN`). Covers the public marketing surface (`/for-companies`, `/services/*`), the apply flow, the post-signup dashboard, matching, discovery calls, the engagement workspace (with Pre-SOW / MSA / SOW signing), and ancillary pages (contracts, billing, closeout).

The startup UI is the *demand* side of the marketplace: a company applies free, gets a curated shortlist, requests a discovery call, indicates engagement intent, and walks through the three-step contracting funnel before reaching an active engagement workspace.

---

## Architecture
[coverage: high]

Next.js 14 App Router under `frontend/src/app/`. Each page is a client or server component; protected pages are wrapped in `<AuthProvider><ProtectedLayout>...` to ensure session cookies and user context are loaded.

API calls use either:
- raw `fetch('/api/v1/...', { credentials: 'include' })` (older pages and the dashboard) — proxied by `next.config.js` rewrites to the NestJS backend on port 4000, or
- the typed wrapper layer in `frontend/src/lib/api-client.ts` (`matchingApi`, `coreFlowApi`, `engagementsApi`, `contractsApi`, `msaApi`, `paymentsApi`, etc.) — preferred for new code.

No global state library. Each page fetches its own data. Styling uses CSS Modules + global CSS variables (`--color-*`, `--space-*`).

Marketing pages share a few cross-cutting components:
- `MarketingNav` — top nav.
- `FaqSection` (data from `frontend/src/content/faq.ts`).
- `ServicePage` — generic template for the three `/services/*` pages.
- `PaymentModeBanner` — surfaces dummy-payment / stub-partner mode on every authenticated page.

---

## Talks To
[coverage: high]

| Backend endpoint | Used by |
|-----------------|---------|
| `POST /api/v1/applications` | `/for-companies/apply` — signup form, sets session |
| `GET /api/v1/applications/my-application` | `/startup/dashboard` |
| `GET /api/v1/applications/completion-status` | `/startup/dashboard` — unlock CTA gating |
| `POST /api/v1/applications/initiate-unlock` | dashboard + `/startup/dashboard/unlock-matching` |
| `POST /api/v1/applications/verify-unlock` | Razorpay handler in unlock-matching page |
| `GET  /api/v1/payments/mode` | `PaymentModeBanner` (via `paymentsApi.getMode`) |
| `GET  /api/v1/matching/shortlists/:id` | `/startup/matching` (via `matchingApi.findOne`) |
| `POST /api/v1/matching/shortlists/:id/select` | "Select This Operator" |
| `POST /api/v1/calls` (request) | `/startup/matching` "Request 30-min discovery call" |
| `GET  /api/v1/calls/me` | `/startup/calls` (via `coreFlowApi.listMyCalls`) |
| `POST /api/v1/calls/:id/defer` | EngagementIntentPanel deferral |
| `POST /api/v1/engagement-intents` | EngagementIntentPanel — Interested / Not interested |
| `POST /api/v1/pre-sow-summaries/:id/confirm` | ContractsAgreementsPanel — Pre-SOW row |
| `POST /api/v1/msa/:id/sign` | ContractsAgreementsPanel — MSA row |
| `POST /api/v1/contracts/:id/sign-startup` | ContractsAgreementsPanel — SOW row |
| `GET  /api/v1/engagements/:id` + `/workspace` | `/startup/engagements/[id]` |
| `POST /api/v1/engagements/:id/notes` | Workspace messages |
| `POST /api/v1/health/escalations` | Workspace "Request Replacement" modal |

---

## API Surface (Routes)
[coverage: high]

### Public marketing

| Route | Purpose |
|-------|---------|
| `/` | Marketing home (shared) |
| `/for-companies` | Company landing — problem, how matching works, results, 3-column engagement matrix, FAQ, guarantee, CTA |
| `/for-companies/apply` | Free-signup form; auto-logs in and hard-redirects to `/startup/dashboard` |
| `/services/sales-leadership` | Service explainer — fractional VP/CRO/Head of Sales |
| `/services/sales-execution` | Service explainer — AE / SDR / outbound execution |
| `/services/partnerships-bd` | Service explainer — channels, alliances, market access |

### Authenticated startup portal

| Route | Purpose |
|-------|---------|
| `/startup/dashboard` | Main dashboard — completion status, top-3 blurred matches, unlock CTA, Next Steps |
| `/startup/dashboard/unlock-matching` | Razorpay payment flow (loaded via Razorpay checkout.js) |
| `/startup/matching` | Shortlist view — score breakdown, request call, select operator |
| `/startup/calls` | Discovery calls — `EngagementIntentPanel` per call |
| `/startup/contracts` | Contract list |
| `/startup/billing` | Invoice history |
| `/startup/engagements` | Engagement list |
| `/startup/engagements/[id]` | Engagement workspace — Contracts & Agreements panel + milestones, notes, activity, escalation modal |
| `/startup/engagements/[id]/closeout` | Closeout report |
| `/startup/discovery` · `/startup/discovery/summary` | Diagnosis / discovery summary surfaces |
| `/startup/profile` · `/startup/shortlist` · `/startup/apply` | Profile editor, alt shortlist link, alt apply route |

---

## Data
[coverage: medium]

**Dashboard (`/startup/dashboard`) — local state shape:**
- `matchData` from `GET /applications/my-application` — includes `startupProfile.shortlists[0].candidates[]` for the top-3 preview.
- `completionStatus` from `GET /applications/completion-status` — `{ matchingUnlocked, canPay, feeCurrency, paymentProvider }`.
- Top three candidates render through `BlurredMatchCard` (component now extracted under `@/components/BlurredMatchCard`); `UnlockMatchingCTA` displays `feeCurrency === 'INR' ? '₹8,500' : '$100'`.
- Dummy mode (`initiate-unlock` returns `dummyMode && unlocked`) reloads the page; live mode is wired to the dedicated `/unlock-matching` route which loads Razorpay checkout.js.

**Matching (`/startup/matching`) — `MatchCandidate` shape:**
- `matchScore` (0–100) with colour bands (≥80 teal, ≥65 amber, else red).
- `scoreBreakdown` keyed by 7 components (lane alignment, region overlap, budget fit, experience, availability, tier bonus, motion fit).
- Lifecycle fields: `status` (SHORTLISTED → INTERESTED → SELECTED/PASSED), `interest` (PENDING/ACCEPTED/DECLINED).
- Selection button only appears once `interest === 'ACCEPTED'`. Discovery-call request is independent and can be sent any time after interest is accepted.

**Calls (`/startup/calls`) — `EngagementCall` and `EngagementIntent`:**
- `EngagementIntentPanel` reads `call.intents[]` and computes mutual-interest from `STARTUP` and `OPERATOR` intent rows.
- Mutual `INTERESTED` triggers the "BridgeScale will issue your Pre-SOW Commercial Summary" banner (backend generates the row separately).
- Defer flow posts a new proposed time + optional reason.

**Engagement workspace — `Engagement` plus side-loads:**
- `engagement.preSowSummary`, `engagement.contract.sow.msa`, `engagement.contract` are all rendered in `ContractsAgreementsPanel`. Each row is independently advanced (Pre-SOW confirm → MSA sign → SOW sign), per the Phase-2 core flow plan.
- Workspace fetches `getOne(id)` + `getWorkspace(id)` (milestones, notes, logs).
- Health score colour: ≥80 green, ≥50 amber, else red.

---

## Key Decisions
[coverage: high]

**Hard redirect after signup.** `POST /api/v1/applications` sets the session and the form does `window.location.href = '/startup/dashboard'` (not Next.js router) to ensure the cookie is picked up on the new request.

**Marketing engagement matrix is a 3-column CSS grid.** `/for-companies` renders Consultation / Sprint / Retainer (with two retainer flavours nested) and three Add-ons (success-fee, equity-only, conversion to full-time) in one matrix in `companies.module.css`. The same conceptual structure appears in `/services/*` pages via `ServicePage`. The 10% platform fee is footnoted at the bottom.

**Service pages are data-driven.** All three `/services/*` pages are ~50-line files that pass a typed `ServiceData` object to the shared `ServicePage` component. To add a new service surface, drop a new `page.tsx` with a `ServiceData` literal.

**Discovery call is self-serve from the shortlist.** `/startup/matching` includes a "Request 30-min discovery call" button that posts to `coreFlowApi.requestCall`. This decouples calls from operator selection — startups can request calls with multiple candidates concurrently.

**Contracts panel is shared between roles.** `ContractsAgreementsPanel` accepts a `viewer: 'STARTUP' | 'OPERATOR'` prop and renders the right "Sign as ..." action for the caller. Same component lives on both `/startup/engagements/[id]` and `/operator/engagements/[id]` (the operator page is a copy of the workspace content; see Gotchas).

**Mutual-intent gates Pre-SOW issuance.** `EngagementIntentPanel` will not generate the Pre-SOW Commercial Summary itself — both parties must record `INTERESTED` and the backend issues the summary out-of-band.

**Payment-mode banner everywhere.** Every authenticated page renders `<PaymentModeBanner />` first thing. It hides itself when `dummyPaymentMode === false && partnerLiveMode === true` (i.e. fully live).

---

## Gotchas
[coverage: medium]

- The unlock CTA on the dashboard hard-codes the display amount (`'₹8,500'` vs `'$100'`) based on `feeCurrency` rather than reading `feeAmountMinor / 100`. The dedicated `/unlock-matching` page does the same. When pricing changes, update both files.
- `/startup/dashboard/unlock-matching` does *not* wrap itself in `AuthProvider` / `ProtectedLayout` — it relies on the session cookie being present and uses `useAuth()` from a parent context. If linked-to directly without that wrapper, `user` will be `null` until reload.
- Two apply routes exist: `/for-companies/apply` (canonical) and `/startup/apply` (legacy). They appear to share the same form component but should be consolidated.
- `/startup/matching` reads the shortlist by `?id=` query param. Without an id it shows "No shortlist ID." Don't deep-link without one.
- The `BlurredMatchCard` and `UnlockMatchingCTA` components are now imported from `@/components/...` (Phase-2 task 2.7 is complete despite the stale note in `CLAUDE.md`).
- `ContractsAgreementsPanel` posts a manually-generated signature ID (`MANUAL-${viewer}-${Date.now()}`) for SOW signing — placeholder for the real e-signature integration in Phase 6.
- Workspace escalation posts to `/api/v1/health/escalations` with `reason` prefixed `[REPLACEMENT REQUEST]`. The category is implicit in the prefix string, not a structured field.
