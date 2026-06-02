# BridgeScale Repo Audit And Feature Flows

Last reviewed: 2026-04-23

This document is a code-based snapshot of what the repository currently contains. It has two jobs:

1. Show which repo documentation exists and whether it still matches the implementation.
2. Give a product-level view of the implemented features and the step-by-step user and admin flows.

## 1. Documentation audit

| Doc | Present | Status | Notes |
|---|---|---|---|
| `README.md` | Yes | Partially up to date | Good quick-start and high-level overview, but several values and implementation details have drifted. |
| `Docs/TECHNICAL.md` | Yes | Partially up to date | Strong architecture summary, but some versions, endpoints, and route coverage no longer match the code. |
| `HOSTING.md` | Yes | Mostly present, needs verification pass | Good deployment walkthrough, but should be treated as operational guidance rather than source-of-truth for current implementation. |
| `backend/.env.example` | Yes | Partially up to date | Has broad coverage of environment variables, but some defaults and fee comments are inconsistent with the code. |
| `Docs/COLOR_SYSTEM.md` | Yes | Likely up to date for design tokens | Matches the current front-end branding direction. |
| `Docs/TASKS_PHASE1.md` / `Docs/TASKS_PHASE2.md` | Yes | Planning docs, not source-of-truth | Useful for history and roadmap context, but not for current feature verification. |
| `Docs/TECHNICAL.md` API section | Yes | Needs refresh | Missing multiple implemented modules and route families. |
| `CONTRIBUTING.md` | No | Missing | Recommended. |
| `CHANGELOG.md` | No | Missing | Recommended. |
| `SECURITY.md` | No | Missing | Recommended. |
| `CODE_OF_CONDUCT.md` | No | Missing | Recommended if the repo is collaborative/public. |
| `LICENSE` | No | Missing | Recommended if the repo is shared outside a private team. |

## 2. What is outdated or inconsistent

These are the main mismatches I found by comparing the docs to the codebase.

### README.md

- The backend stack is documented as NestJS 10, but `backend/package.json` is on NestJS 11.
- The health-check URL is documented as `http://localhost:4000/health`, but the app uses a global `/api/v1` prefix, so the implemented controller route is `/api/v1/health`.
- The README says the platform is in "Phase 3 in progress", but the repository already contains a broader set of modules and screens than that label suggests.

### Docs/TECHNICAL.md

- The document says `FRONTEND_URL` defaults to `http://localhost:3001`, but the runtime code in `backend/src/main.ts` defaults CORS to `http://localhost:3000`.
- The backend version references are outdated relative to NestJS 11 in `backend/package.json`.
- The route map omits implemented routes and screens such as:
  - `application-matches/*`
  - `talent-pre-screens/*`
  - `opportunity-briefs/*`
  - `approvals/*`
  - `interviews/*`
  - health sub-routes for snapshots, nudges, and escalations
  - `/startup/dashboard/unlock-matching`
  - `/operator/dashboard/unlock-matching`
  - `/operator/dashboard/complete-assessment`
  - `/operator/dashboard/complete-references`
  - `/admin/applications/[id]/diagnosis`
  - `/admin/applications/[id]/prescreen`
- The API reference section reflects an older surface area and should be regenerated from controllers.

### backend/.env.example and payment messaging

- The comment says company unlock is `INR 15,000`, but `ApplicationsService` currently uses `850000` minor units, which is `INR 8,500`.
- There is also a UI inconsistency:
  - `frontend/src/app/startup/dashboard/page.tsx` shows `INR 8,500`
  - `frontend/src/app/startup/dashboard/unlock-matching/page.tsx` shows `INR 15,000`

### Flow inconsistencies in the app itself

- The startup dashboard and startup unlock page redirect to `/startup/shortlist`, but the actual implemented shortlist page lives at `/startup/matching` and expects a query parameter like `?id=<shortlistId>`.
- `frontend/next.config.js` currently disables lint and type errors during production builds, so the build pipeline is not acting as a strict source-of-truth for front-end correctness.

## 3. Documentation that already exists and is useful

If you want a practical docs set without adding too many files, the repo already has a good base:

- `README.md` for setup and orientation
- `Docs/TECHNICAL.md` for architecture and schema overview
- `HOSTING.md` for deployment and DNS
- `backend/.env.example` for configuration reference
- `Docs/COLOR_SYSTEM.md` for front-end design tokens

The gap is not "no docs". The gap is "no single current-state product and process guide".

## 4. Current feature inventory from the codebase

### Public site and acquisition

- Marketing landing page
- Company marketing page
- Talent marketing page
- About page
- Blog index and blog detail routes
- Company application form
- Talent application form
- Startup application entry route
- Operator application entry route

### Authentication and session management

- Password login
- Magic-link login
- Session-based auth via `express-session`
- Auto-login immediately after application submission
- Role-based route protection

### Company-side product features

- Company application intake
- Startup dashboard
- Startup profile management
- Discovery scheduling UI
- Matching shortlist UI
- Contracts list
- Billing view
- Engagement list
- Engagement workspace
- Engagement closeout view
- Readiness page

### Talent-side product features

- Talent application intake
- Operator dashboard
- Operator profile management
- Assessment completion
- References completion
- Match opportunities view
- Contract list
- Engagement list
- Engagement workspace
- Engagement closeout view
- Workflow page
- Invitations page

### Admin-side product features

- Applications review dashboard
- Company diagnosis review page
- Talent pre-screen review page
- Startups management page
- Operators management page
- Matching oversight page
- Deal desk page
- Contracts page
- Billing page
- Analytics page
- Escalations page
- Settings page
- SoW templates list and detail page

### Backend workflow modules

- `AuthModule`
- `ApplicationsModule`
- `StartupsModule`
- `OperatorsModule`
- `DiscoveryModule`
- `MatchingModule`
- `ApplicationMatchingModule`
- `DiagnosesModule`
- `OpportunityBriefsModule`
- `TalentPreScreenModule`
- `InterviewsModule`
- `ApprovalsModule`
- `ContractsModule`
- `SowModule`
- `PaymentsModule`
- `EngagementsModule`
- `CloseoutModule`
- `HealthModule`
- `AnalyticsModule`
- `EmailModule`
- `AiModule`

### AI-assisted capabilities

- Need diagnosis generation for company applications
- Talent pre-screen generation
- Startup readiness scoring
- Operator quality scoring
- Match shortlist generation
- Opportunity brief generation
- Engagement health snapshot generation
- Closeout report and renewal recommendation support

## 5. Step-by-step processes

## 5.1 Company journey

### A. Company acquisition and signup

1. A founder lands on `/` or `/for-companies`.
2. They submit the company application at `/for-companies/apply`.
3. `POST /api/v1/applications` creates the user, organization, membership, and application.
4. The backend writes session data immediately, so the user is auto-logged in.
5. The user lands on `/startup/dashboard`.

### B. Company review and diagnosis

1. The company application exists in the admin applications queue.
2. Admin reviews the application in `/admin/applications`.
3. The diagnosis record is reviewed in `/admin/applications/[id]/diagnosis`.
4. Admin edits the AI output, saves a draft, and finalizes it for the client.
5. The company can approve the diagnosis or request revision through diagnosis endpoints.

### C. Company unlock and matching

1. The startup dashboard checks `/api/v1/applications/completion-status`.
2. When the account is ready, the company uses unlock matching from the dashboard or `/startup/dashboard/unlock-matching`.
3. `POST /api/v1/applications/initiate-unlock` creates a Razorpay order in the company flow.
4. After payment success, `/api/v1/applications/verify-unlock` confirms the unlock.
5. The company can access shortlist data and matching details.

### D. Company shortlist selection

1. Admin generates or curates a shortlist through matching or application-matching endpoints.
2. The shortlist is published.
3. The startup reviews candidates on `/startup/matching?id=<shortlistId>`.
4. The startup selects a candidate after the operator has accepted interest.

### E. Company contract and engagement

1. Admin generates a SoW.
2. The SoW is edited and versioned.
3. The startup reviews the SoW on `/contracts/sow?id=<sowId>`.
4. Startup approves the SoW, which creates the contract.
5. Startup signs the contract via contract endpoints.
6. Admin initializes the engagement from the contract.
7. The startup tracks milestones, notes, health, billing, and closeout from startup engagement routes.

## 5.2 Talent journey

### A. Talent acquisition and signup

1. A candidate lands on `/` or `/for-talent`.
2. They submit the talent application at `/for-talent/apply`.
3. `POST /api/v1/applications` creates user, organization, membership, and application.
4. The backend creates the session and auto-logs the user in.
5. The user lands on `/operator/dashboard`.

### B. Talent completion and verification

1. The operator dashboard loads profile and completion state.
2. If profile details are incomplete, the user updates `/operator/profile`.
3. If assessment is incomplete, they complete `/operator/dashboard/complete-assessment`.
4. If references are incomplete, they complete `/operator/dashboard/complete-references`.
5. The backend triggers pre-screen and verification logic.

### C. Talent review and approval

1. Admin sees the application in `/admin/applications`.
2. Admin opens `/admin/applications/[id]/prescreen`.
3. Admin can generate the pre-screen, review AI scores, and override recommendation details.
4. Admin can schedule interview, approve, or reject the applicant.

### D. Talent unlock and match response

1. Once completion requirements are met, the operator dashboard enables unlock.
2. `POST /api/v1/applications/initiate-unlock` creates the Stripe checkout path for talent.
3. After unlock, the operator can review match opportunities at `/operator/matches`.
4. The operator accepts or declines a match invitation.
5. If selected by the startup, the operator proceeds into the SoW and contract flow.

### E. Talent contract and engagement

1. The operator reviews the SoW and version history.
2. The operator signs the contract.
3. The operator works inside `/operator/engagements` and `/operator/engagements/[id]`.
4. The operator can create and update milestones and add workspace notes.
5. At the end of the engagement, the operator participates in closeout and ratings.

## 5.3 Admin operating process

### A. Intake review

1. Open `/admin/applications`.
2. Filter by company or talent.
3. Review details, CVs, references, and notes.
4. Move items to under review, interview, approved, or rejected.

### B. Company-side workflow

1. Review submitted company application.
2. Open diagnosis page.
3. Edit AI diagnosis.
4. Finalize and send to client.
5. Track client approval or revision request.
6. Generate opportunity brief and shortlist.

### C. Talent-side workflow

1. Review submitted talent application.
2. Open pre-screen page.
3. Generate or override the AI pre-screen.
4. Schedule interview if needed.
5. Approve or reject candidate.

### D. Matching and commercial workflow

1. Generate shortlist for startup profiles.
2. Publish shortlist.
3. Track operator interest responses.
4. Support startup selection.
5. Generate and manage SoWs.
6. Approve SoWs and create contracts.
7. Unlock contacts if required.

### E. Post-signature workflow

1. Initialize engagement from contract.
2. Monitor milestones, workspace notes, and health snapshots.
3. Create nudges and manage escalations.
4. Review closeout reports and renewal recommendations.

## 5.4 Contract and engagement lifecycle

1. Match candidate is selected.
2. SoW is generated from a template or by admin flow.
3. SoW is edited and versioned until review-ready.
4. Startup approves the SoW.
5. Contract record is created.
6. Startup signs.
7. Operator signs.
8. Admin can unlock contacts.
9. Engagement is initialized from the contract.
10. Milestones and notes are managed during delivery.
11. Health snapshots, nudges, and escalations support active governance.
12. Closeout, ratings, and renewal recommendation complete the lifecycle.

## 6. Recommended next documentation improvements

If you want the repo docs to feel "complete and current", these are the best next additions or updates:

1. Refresh `README.md` with current framework versions, correct health URL, and a short "what is implemented today" section.
2. Refresh `Docs/TECHNICAL.md` from controller and route definitions so it reflects the real API surface.
3. Add `Docs/API_CURRENT.md` generated from the Nest controllers.
4. Add `CONTRIBUTING.md` with setup, branch naming, testing, and PR expectations.
5. Add `SECURITY.md` if the repo will be shared externally.
6. Resolve fee and route inconsistencies in the product so the docs can stop carrying caveats.

## 7. Recommended source-of-truth docs set

For this repo, the most useful stable docs set would be:

- `README.md`
- `Docs/TECHNICAL.md`
- `Docs/DOCS_AUDIT_AND_FEATURE_FLOWS.md`
- `HOSTING.md`
- `backend/.env.example`
- `CONTRIBUTING.md`
- `SECURITY.md`

This file is intended to be the bridge between the technical docs and the actual product behavior currently present in the repository.
