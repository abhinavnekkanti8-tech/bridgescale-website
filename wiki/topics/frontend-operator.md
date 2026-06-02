# Frontend — Operator (Talent) UI

*Sources: `frontend/src/app/operator/` · `frontend/src/app/for-talent/` · `frontend/src/components/operator/*` · `frontend/src/components/engagement/` · `frontend/src/lib/api-client.ts` · `CLAUDE.md`*

---

## Purpose
[coverage: high]

All pages for a talent / operator user (role: `OPERATOR`). Covers the public talent landing + apply flow, the post-signup dashboard (with profile-completion checklist, supply quality score, and the four Phase-3 readiness panels), discovery calls, engagement workspace, and ancillary pages (contracts, profile, invitations, diagnoses).

The operator UI is the *supply* side: an operator applies, completes vetting (assessment, references), unlocks matching for $50, and progressively layers on the readiness data BridgeScale needs to invoice them and route payouts (tax forms → Stripe Connect → optional EOR enrolment).

---

## Architecture
[coverage: medium]

Same shape as the startup UI: Next.js 14 App Router, CSS Modules, fetch with `credentials: 'include'`, no global state library. Authenticated pages wrap in `<AuthProvider><ProtectedLayout>`.

The operator dashboard is the central composition surface — it stitches together six separate components, each backed by its own API call:

```
/operator/dashboard
  ├── PaymentModeBanner            (dummy / stub mode warning)
  ├── CompletionChecklist          (profile + assessment + references)
  ├── UnlockMatchingCTA            ($50 Stripe; auto-confirms in dummy mode)
  ├── Supply Quality Score card    (7-component breakdown, polled if missing)
  ├── StripeConnectPanel           (Connect Express onboarding — STUB until P6.2)
  ├── TaxFormsPanel                (W-9 / W-8BEN / GST/PAN / VAT)
  ├── EorEnrollmentPanel           (Deel / Remote / Multiplier — STUB until P6.5–6.7)
  └── CancellationPolicyPanel      (no-show / late-cancel / strikes explainer)
```

The dashboard polls every 3 s while the supply quality score has not yet been computed (`prof.scores.length === 0`).

---

## Talks To
[coverage: high]

| Backend endpoint | Used by |
|-----------------|---------|
| `POST /api/v1/applications` | `/for-talent/apply` |
| `GET  /api/v1/applications/completion-status` | dashboard checklist |
| `POST /api/v1/applications/complete-assessment` | `/operator/dashboard/complete-assessment` |
| `POST /api/v1/applications/complete-references` | `/operator/dashboard/complete-references` |
| `POST /api/v1/applications/initiate-unlock` | dashboard `UnlockMatchingCTA` (Stripe Checkout in live mode) |
| `GET  /api/v1/operators/me` | dashboard (`operatorsApi.getMyProfile`) |
| `GET  /api/v1/operator-tax-profile/me` | TaxFormsPanel + StripeConnectPanel (`operatorTaxApi.getMine`) |
| `POST /api/v1/operator-tax-profile`           | TaxFormsPanel save |
| `POST /api/v1/partners/stripe/onboarding-link` | StripeConnectPanel "Start onboarding" |
| `GET  /api/v1/operator-eor-enrollments/me`    | EorEnrollmentPanel |
| `POST /api/v1/operator-eor-enrollments`       | EorEnrollmentPanel "Request enrolment" |
| `POST /api/v1/partners/eor/:id/sync`          | EorEnrollmentPanel "Sync status" |
| `GET  /api/v1/cancellations/my-strikes`       | CancellationPolicyPanel |
| `GET  /api/v1/calls/me`                       | `/operator/calls` |
| `POST /api/v1/calls/:id/respond`              | EngagementIntentPanel — accept/decline |
| `POST /api/v1/engagement-intents`             | EngagementIntentPanel |
| `POST /api/v1/msa/:id/sign`                   | ContractsAgreementsPanel |
| `POST /api/v1/contracts/:id/sign-operator`    | ContractsAgreementsPanel |

---

## API Surface (Routes)
[coverage: high]

### Public marketing

| Route | Purpose |
|-------|---------|
| `/for-talent` | Talent landing — why join, vetting, flow, compensation, role buckets, FAQ |
| `/for-talent/apply` | Free signup form; can skip assessment/references and complete later |

### Authenticated operator portal

| Route | Purpose |
|-------|---------|
| `/operator/dashboard` | Main dashboard — checklist, score, four readiness panels |
| `/operator/dashboard/complete-assessment` | Submit case-study response |
| `/operator/dashboard/complete-references` | Submit professional references |
| `/operator/dashboard/unlock-matching` | $50 Stripe Checkout flow |
| `/operator/calls` | Discovery calls — accept/decline + engagement intent |
| `/operator/matches` | Shortlists where operator appears |
| `/operator/contracts` | Contract list |
| `/operator/engagements` | Engagement list |
| `/operator/engagements/[id]` | Engagement workspace — Contracts & Agreements panel + milestones, notes, activity |
| `/operator/engagements/[id]/closeout` | Closeout |
| `/operator/profile` | Edit operator profile |
| `/operator/invitations` | View + accept invitation tokens |
| `/operator/diagnoses` | View own AI pre-screen result |
| `/operator/workflow` · `/operator/apply` | Workflow overview, alt apply route |

---

## Data
[coverage: medium]

**Dashboard state:**
- `profile: OperatorProfile` (tier, verification, lanes[], regions[], scores[]).
- `score: SupplyQualityScore` — `scoreTotal` and `scoreBreakdown` keyed by 7 dimensions (domain expertise, region experience, references verified, track record, platform fit, availability, responsiveness). Plus `blockers[]` and a free-text `recommendation`.
- `completion: { assessmentComplete, referencesComplete, canPay, matchingUnlocked, matchingUnlockedAt? }` — drives both the checklist and the `UnlockMatchingCTA` `reason` text.

**Tax forms (`TaxFormsPanel`):**
- `TaxProfileStatus` exposes three gates rendered as `Gate` components:
  - **Basic info** — residency + payout country + currency on file.
  - **MSA-ready** — at least one form collected.
  - **Payout-ready** — at least one form verified by ops.
- `expectedForms[]` is computed from payout country and is highlighted in the form list (e.g. `W9` for US payouts; `GST_PAN` for India).
- Form upload itself is deferred to Phase 6; today's panel records form *type* and basic metadata only.

**Stripe Connect (`StripeConnectPanel`):**
- Local-only `stripeStatus` state because the live row lands in P6.2. Three steps shown: basic tax info → Stripe-hosted KYC → first payout enabled.
- `partnersApi.stripeOnboardingLink(returnUrl)` returns `{ url, liveMode }`. In stub mode it `alert()`s the placeholder URL; in live mode it `window.location.href`-redirects.
- Hard-blocked if `tax.basicComplete === false`.
- Other rails (Wise, Razorpay direct INR, EOR) are documented inline as sibling options.

**EOR enrolment (`EorEnrollmentPanel`):**
- Three day-1 partners: `DEEL` (broad global), `REMOTE` (EU strong), `MULTIPLIER` (India + APAC).
- Each row carries `OperatorEorEnrollment.status` (`NOT_STARTED | PENDING | ACTIVE | REJECTED | TERMINATED`).
- "Request enrolment" creates the row with `status=PENDING`; "Sync status" calls the partner-side stub. Live partner integrations land in Phase 6 (P6.5–6.7).

**Cancellation policy (`CancellationPolicyPanel`):**
- Reads `coreFlowApi.getMyStrikes()` → `StrikeStatus { total, threshold, lateCancels, noShows, windowDays, paused, pausedAtRisk }`.
- Three-strikes rule: 3 no-shows or 3 late-cancels in a rolling 90-day window pauses the operator's matching pool entry.
- Strikes badge has three states: clean record, "one more strike pauses you", and "Matching pool paused".

**Calls + engagement workspace** — same shapes as the startup side; `EngagementIntentPanel` and `ContractsAgreementsPanel` both take a `viewer` prop and render `'OPERATOR'`-flavoured affordances (e.g. operator gets the Accept/Decline call button and the "Sign as Operator" actions).

---

## Key Decisions
[coverage: high]

**Talent can skip vetting at signup.** The apply form has optional "skip assessment" / "skip references" toggles. If skipped, the application status is `AWAITING_COMPLETION` and the dashboard surfaces a checklist with the missing items. `canPay` stays false until both are done.

**Payment is Stripe (USD, $50).** In dummy mode `initiate-unlock` auto-confirms. In live mode the response carries `checkoutUrl` and the page redirects.

**Hard redirect after signup.** Same pattern as startup — `window.location.href = '/operator/dashboard'`.

**Phase-3 readiness panels are stub-aware.** `StripeConnectPanel` and `EorEnrollmentPanel` both display an explicit `STUB MODE — live in P6.x` pill so operators understand status changes are coming from ops, not partner APIs. This keeps the surface honest while the real wires aren't in place yet.

**MSA gating is visible to the operator.** `TaxFormsPanel` exposes `msaReady` as a Gate so an operator who hasn't filed forms can see, before they hit the workspace, why no MSA exists yet.

**Cancellation rules are a UI policy doc, not a workflow.** `CancellationPolicyPanel` is purely explanatory plus a strikes counter — actual cancellation events are recorded server-side from call/engagement actions elsewhere.

**Discovery calls are dual-flow.** Operator sees an Accept/Decline action while `call.status === 'REQUESTED'`. Once `ACCEPTED` or `COMPLETED`, the same panel surfaces the Interested / Not interested intent buttons. Mutual `INTERESTED` triggers the Pre-SOW summary issuance banner.

---

## Gotchas
[coverage: medium]

- `/operator/engagements/[id]/page.tsx` was originally written to re-export the startup workspace but Next.js page routing doesn't allow that cleanly. The current file is a near-verbatim copy with the operator-specific affordances (no escalation modal). When fixing bugs in workspace logic, update both files or extract the shared body into a real component.
- `/operator/calls/page.tsx` imports the startup page's CSS module by path (`@/app/startup/calls/calls.module.css`). Renaming or moving the startup file will silently break the operator page.
- `EorEnrollmentPanel.onSync` uses `setBusyPartner('SYNC' as EorPartner)` as a sentinel — that string is not a real partner enum value. It's only used to disable the buttons during the sync round-trip.
- `StripeConnectPanel` keeps `stripeStatus` in local React state. On reload it always reverts to `NOT_STARTED` regardless of any backend onboarding-intent record. The real server-driven state lands with P6.2.
- The `CompletionChecklist` and `UnlockMatchingCTA` are now extracted components under `@/components/...` — the stale note in `CLAUDE.md` referring to them as TODOs is outdated.
- `/operator/apply` and `/for-talent/apply` both exist and likely share the same form. Consolidate when touched.
- The cancellation `CancellationPolicyPanel` shows operator-side rules even when the strikes API errors (the call is `.catch(() => {})`); only the strikes badge is hidden, the explainer table always renders.
- Operators can only see shortlists where they are a candidate. The matches page filters by `MatchCandidate.operatorId = operator.orgId` server-side; the frontend trusts the result.
