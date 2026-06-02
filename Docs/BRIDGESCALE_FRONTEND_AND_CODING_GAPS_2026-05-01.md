# BridgeScale Frontend and Coding Gaps

Date: 2026-05-01

This note summarizes what is still missing from the current build, with extra focus on frontend work and the implementation-plan phases where engineering work remains.

## Current Build Blocker

The backend currently builds and tests successfully.

The frontend does not build. `npm run build` fails because `frontend/src/content/faq.ts` has a duplicated malformed `Contracts & payment` block after the FAQ array is already closed.

Immediate fix:

- Remove the duplicate stray block beginning around `frontend/src/content/faq.ts:131`.
- Re-run `npm run build` in `frontend/`.
- Re-check `/for-companies`, `/for-talent`, and `/learn`, because they import the shared FAQ content.

Until this is fixed, Phase 4 public website work should be treated as present in code but not shippable.

## Frontend Work Still Missing or Incomplete

### 1. Restore frontend production build

Status: Required before anything public can ship.

Needed:

- Fix `frontend/src/content/faq.ts`.
- Run `npm run build`.
- Run at least one browser smoke pass across key public pages.

Key pages:

- `/`
- `/for-companies`
- `/for-talent`
- `/learn`
- `/for-companies/apply`
- `/for-talent/apply`

### 2. Founder-approved public copy workflow

Status: Not visible in code as a tracked workflow.

The implementation plan requires founder approval before publishing public-facing strings. The website contains new legal/payment/tax/EOR language, but there is no obvious approval artifact or approval state tied to these copy changes.

Needed:

- Add a lightweight approval record for public copy, probably in `Docs/`.
- Mark which strings are draft, approved, or blocked by legal review.
- Avoid publishing claims that imply final legal/tax/payment support before Phase 5 and Phase 6 are complete.

High-risk copy areas:

- 1099-NEC handling
- EOR availability
- Tax-form handling
- Corridor-specific compliance claims
- Conversion fee enforceability
- INR payout language

### 3. Website legal/sample document UX

Status: PDFs exist, links exist, but the experience needs verification.

Built:

- Sample PDFs exist in `frontend/public/legal/`.
- FAQ content links to sample legal documents.
- `/learn` imports the same document references.

Needed:

- Confirm every public document link resolves in the browser.
- Confirm every sample document is clearly labeled as sample/finalization pending.
- Decide whether the source of truth is `Docs/legal-drafts/` or `frontend/public/legal/`.
- Add a simple static page or reusable banner if sample-document disclaimers need to appear before download.

### 4. `/learn` page validation

Status: Page exists, but cannot be considered complete while frontend build is broken.

Built:

- Hero section
- Fractional-fit section
- Wrong-hire-cost calculator
- Engagement type cards
- Role x engagement matrix
- FAQ section

Needed:

- Browser QA after build fix.
- Mobile layout check.
- Copy approval.
- Legal/compliance review for payment, EOR, tax, and corridor language.

### 5. Company-side core flow UI

Status: Partially present.

Built or partially built:

- Company dashboard
- Unlock matching surfaces
- Startup calls page
- Startup engagement detail page
- Startup contracts page
- Matching pages

Needed:

- End-to-end UI path from match selection to call request.
- Clear UI for call status: requested, accepted, declined, completed.
- UI for post-call engagement intent.
- UI for reviewing and confirming Pre-SOW Commercial Summary.
- UI handoff from confirmed Pre-SOW Summary to MSA and SOW.
- Clear error states when tax documents are missing and MSA generation is blocked.

### 6. Operator-side core flow UI

Status: Partially present.

Built or partially built:

- Operator dashboard
- Operator calls page
- Operator engagement detail page
- Tax forms panel
- Stripe Connect panel
- EOR enrollment panel
- Cancellation policy panel

Needed:

- Confirm operator can accept/decline a company call from the UI.
- Confirm operator can record engagement intent after the call.
- Confirm operator can review and confirm Pre-SOW Commercial Summary.
- Confirm operator sees exactly what tax/profile steps are required before MSA, before payout, and before matching.
- Confirm Stripe/EOR panels are clearly marked as not live where they are still stubbed.

### 7. Payment and payout UI clarity

Status: Unlock/payment UI exists, but live payout rails are not complete.

Needed:

- Make dummy/live payment mode explicit in non-production.
- Ensure company unlock amount is consistently `INR 8,500`.
- Ensure operator activation amount is consistently `USD 50`.
- Remove fallback `$100` display from startup unlock UI if it is not intended.
- Add admin/operator visibility into payout readiness: tax ready, compliance mode, ledger status, payout attempts.

### 8. Admin/deal-desk UI

Status: Basic admin pages exist, but plan-specific ops workflows are incomplete.

Needed:

- Admin view for Pre-SOW summaries needing edit/approval.
- Admin view for MSA/SOW signing status.
- Admin queue for compliance review decisions.
- Admin queue for EOR-required cases.
- Admin view for payment ledgers and payout readiness.
- Admin view for legal/founder approval status of public copy and templates.

## Coding Still Needed by Phase

## Phase 0 - Preparation

Mostly document and decision work, but some engineering deliverables remain.

Coding or engineering work still needed:

- Create/commit the Razorpay payout feasibility note required by P0.12.
- Produce a migration/backfill/rollback note that matches the actual Phase 1 migrations.
- Add a simple copy-approval tracking artifact or workflow if public copy is being moved into the site before final legal review.

Non-coding blockers:

- Decision Register v1.1.
- Legal counsel selection.
- Country/corridor classification research.
- Founder approvals.

## Phase 1 - Foundation

Mostly built in backend.

Still needed:

- Verify migrations against a production-shape dev database.
- Confirm backfill behavior for old `OperatorLane`, `PackageType`, and `functions` data.
- Confirm the combinations matrix seed matches the final Operating Matrix, not just placeholder rules.
- Add or run integration tests for migration/backfill and seeded lookup performance.
- Decide whether legacy enums/models stay permanently or need cleanup.

## Phase 2 - Core Flow

Backend skeleton is partially built. End-to-end product flow still needs coding and QA.

Still needed:

- Complete company and operator UI for call request/accept/complete.
- Complete mutual intent UI.
- Complete Pre-SOW Summary review, edit, and confirmation UI.
- Connect confirmed Pre-SOW Summary to MSA creation and SOW generation in the user-facing flow.
- Build a usable MSA signing UX, not just timestamp/signature-id endpoints.
- Build a usable SOW signing/review UX for both parties.
- Confirm tax-doc gate messaging when MSA cannot be generated.
- Add an end-to-end happy-path test:
  company signup -> diagnosis -> match -> unlock -> call -> mutual intent -> Pre-SOW Summary -> MSA -> SOW -> engagement start.
- Make cancellation and deferral behavior visible and testable in the UI.
- Confirm conversion-fee invoice trigger is reachable from the UI or admin.

## Phase 3 - Payments and Compliance Backend

Skeletons exist, but live partner behavior is not implemented.

Still needed:

- Implement real Stripe Connect Express account creation, onboarding links, webhook handling, and status sync.
- Implement real RazorpayX fund-account creation, payout creation, payout status sync, and webhooks.
- Implement real Wise recipient creation, quotes, transfers, transfer status sync, and webhooks.
- Add encrypted storage or real secure document handling for tax forms; current `encryptedBlobRef` is only a pointer shape.
- Add admin review flow for tax forms.
- Add compliance resolver rules based on final legal/corridor research.
- Add EOR review queue and partner enrollment lifecycle UI.
- Add ledger review UI and payout attempt execution flow.
- Add tests for payment ledger calculation, compliance modes, payout readiness, and webhook idempotency.

## Phase 4 - Website With Placeholders

Partially built, currently blocked by frontend build failure.

Still needed:

- Fix frontend build.
- Verify `/learn` across desktop and mobile.
- Verify `/for-companies` engagement cards and FAQ links.
- Verify `/for-talent` role buckets and FAQ links.
- Verify all legal sample PDFs open correctly.
- Add visible sample/finalization disclaimers wherever required.
- Add founder approval evidence for all public-facing copy.
- Remove or soften public promises that depend on Phase 5 legal validation or Phase 6 live integrations.

Optional:

- Public role-bucket landing pages are not built.

## Phase 5 - Legal and Finance Validation

Not an engineering-heavy phase, but it creates required coding follow-up.

Coding that will be needed after legal/finance output:

- Replace placeholder MSA/SOW/addendum content with final templates.
- Update compliance resolver with final corridor rules.
- Update tax-form requirements per corridor and entity type.
- Update public copy after legal review.
- Update conversion-fee logic if final percentage, window, or trigger language changes.
- Update EOR routing if partner/corridor rules change.
- Update 1099/tax form language and operational workflow once final.

## Phase 6 - Wire-Up and Polish

Mostly not built. Some models and stub services exist, but live integrations are still missing.

Still needed:

- Live Stripe Connect Express.
- Live RazorpayX payouts.
- Live Wise payouts.
- Live Deel integration.
- Live Remote integration.
- Live Multiplier integration.
- 1099-NEC issuance workflow or external provider integration.
- Final document replacement from sample to final.
- Final public compliance copy.
- Production smoke test using a real paid/signed engagement.
- Go-live checklist and rollback plan.

## Recommended Next Coding Order

1. Fix the frontend build blocker in `frontend/src/content/faq.ts`.
2. Run backend and frontend builds again.
3. Smoke-test public pages and sample document links.
4. Complete the Phase 2 frontend path: calls, intent, Pre-SOW, MSA, SOW.
5. Add a single happy-path E2E or scripted QA checklist.
6. Build admin review surfaces for compliance, tax docs, ledgers, and Pre-SOW/SOW approval.
7. Only then start live partner integrations for Stripe Connect, RazorpayX, Wise, and EOR partners.

## Short Version

The backend foundation is in decent shape. The frontend is currently blocked by a syntax error. The biggest remaining frontend work is not marketing polish; it is connecting the real engagement flow across calls, intent, Pre-SOW Summary, MSA, SOW, tax gates, and payment/compliance status.

The biggest remaining backend work is live integrations and legally validated rules. Stripe/Razorpay/Wise/EOR services are skeletons, not production rails. Phase 5 and Phase 6 remain the largest go-live blockers.
