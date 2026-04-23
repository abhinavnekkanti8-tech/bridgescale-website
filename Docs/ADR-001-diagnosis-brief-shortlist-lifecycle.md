# ADR-001: Diagnosis → Brief → Shortlist Lifecycle

**Date:** 2026-04-22  
**Status:** Accepted  
**Deciders:** Platform engineering  

---

## Context

After a company submits an application, the platform runs a three-stage AI workflow before a match shortlist is revealed:

1. **Needs diagnosis** — AI analyses the application and produces a structured breakdown of the company's sales challenges, opportunities, and recommended role type.
2. **Opportunity brief** — Once the diagnosis is approved, AI generates a scoped brief (internal + client-facing versions) that describes the opportunity in terms talent can evaluate.
3. **Shortlist reveal** — Once the brief is generated and the company has unlocked matching (paid), the ranked match shortlist becomes visible.

Before this ADR the wiring between steps was incomplete: `clientApproveDiagnosis()` set `DIAGNOSIS_APPROVED` on the application but did **not** fire brief generation, leaving applications stuck at `DIAGNOSIS_APPROVED` indefinitely.

---

## Decision

**Auto-trigger opportunity brief generation immediately after a company client-approves their diagnosis.**

- The trigger is the `POST /api/v1/diagnoses/:id/client-approve` endpoint calling `DiagnosesService.clientApproveDiagnosis()`.
- The brief generation call is fire-and-forget — it does not block the HTTP response.
- The implementation routes through `AiWorkflowService.generateBriefForApplication()` (the existing orchestration layer), keeping `DiagnosesService` decoupled from `OpportunityBriefsService`.

---

## Trigger events and DB state transitions

```
Company submits application
  └─► Application.status = SUBMITTED (or AWAITING_COMPLETION)
        │
        │  POST /api/v1/applications   (auto-login, redirect to dashboard)
        │
        ▼
  AiWorkflowService.generateDiagnosisForApplication()  ← background, non-blocking
        │
        │  NeedDiagnosis.create(status = DRAFT_AI)
        │
        ▼
  Admin reviews diagnosis
        │
        │  POST /api/v1/diagnoses/:id/finalize
        │  NeedDiagnosis.status = READY_FOR_CLIENT
        │  Application.status  = DIAGNOSIS_UNDER_REVIEW
        │
        ▼
  Company reviews and approves  ◄──── or requests revision (→ REVISION_REQUESTED → admin re-review)
        │
        │  POST /api/v1/diagnoses/:id/client-approve
        │  NeedDiagnosis.status = APPROVED  +  clientApprovedAt = now
        │  Application.status  = DIAGNOSIS_APPROVED
        │
        │  ← trigger point — brief generation fired here (fire-and-forget)
        ▼
  AiWorkflowService.generateBriefForApplication()  ← background, non-blocking
        │
        │  OpportunityBrief.create(...)
        │  Application.status = BRIEF_GENERATED
        │
        ▼
  Company pays to unlock matching
        │
        │  POST /api/v1/applications/verify-unlock
        │  Application.matchingUnlocked = true
        │  Application.paidAt = now
        │
        ▼
  Match shortlist visible to company  (MatchShortlist.status = PUBLISHED)
```

### Application status progression (company path)

| Status | Set by | Meaning |
|---|---|---|
| `SUBMITTED` | `createApplication()` | Intake form received |
| `AWAITING_COMPLETION` | `createApplication()` | Talent skipped optional fields (talent path only) |
| `UNDER_REVIEW` | Admin action | Admin is reviewing application |
| `DIAGNOSIS_GENERATED` | `generateDiagnosisForApplication()` | AI draft diagnosis ready |
| `DIAGNOSIS_UNDER_REVIEW` | `finalizeDiagnosis()` | Diagnosis sent to company for review |
| `DIAGNOSIS_APPROVED` | `clientApproveDiagnosis()` | Company accepted the diagnosis |
| `BRIEF_GENERATED` | `generateBriefForApplication()` | Opportunity brief ready |
| `APPROVED` | Admin action | Application fully approved; shortlist match visible |
| `REJECTED` | Admin action | Application rejected |

### NeedDiagnosis status progression

| Status | Set by | Meaning |
|---|---|---|
| `DRAFT_AI` | `generateDiagnosisForApplication()` | Raw AI output; pending admin review |
| `UNDER_REVIEW` | Admin action | Admin started reviewing |
| `READY_FOR_CLIENT` | `finalizeDiagnosis()` | Admin approved; sent to company |
| `REVISION_REQUESTED` | `clientRequestRevision()` | Company wants changes; back to admin |
| `APPROVED` | `clientApproveDiagnosis()` | Company accepted; triggers brief |

---

## Failure modes and mitigations

### Brief generation fails (AI error, DB error, network)

- `generateBriefForApplication()` wraps all work in try/catch and logs the error.
- The HTTP response to `client-approve` has already returned `200` before the background task starts — the client-side is unaffected.
- Application stays at `DIAGNOSIS_APPROVED`. The brief can be manually re-triggered by calling the endpoint again (idempotent — `OpportunityBriefsService.generateBrief()` checks for an existing brief before calling AI).
- **Future:** add a dead-letter queue / retry table so ops can inspect and replay failed brief generations without code changes.

### Brief generation races with a second approval call

- `OpportunityBriefsService.generateBrief()` checks `opportunityBrief.findUnique({ applicationId })` before calling AI. If a brief already exists, it returns the existing record and skips AI. The second call is a no-op.

### Company approves diagnosis but has not yet reviewed it

- Guard is on `NeedDiagnosis.status === 'READY_FOR_CLIENT'`. A diagnosis can only be approved if it has been finalized and sent to the client — it cannot be approved directly from `DRAFT_AI`.

### Application stuck at DIAGNOSIS_APPROVED (pre-fix state)

- Existing applications already at `DIAGNOSIS_APPROVED` with no brief will not auto-resume. They need a one-off migration or an admin action to trigger `generateBriefForApplication()` for each affected application.
- Count: run `SELECT COUNT(*) FROM applications WHERE status = 'DIAGNOSIS_APPROVED'` to assess scope.

### Brief generated before matching is unlocked

- Brief generation and payment unlock are independent. A brief can exist before the company has paid. This is intentional — the platform prepares everything in advance so the shortlist is ready the moment payment clears.
- The frontend reveals the shortlist only when `Application.matchingUnlocked === true`, regardless of brief status.

### Diagnosis approval by wrong user

- `clientApproveDiagnosis()` validates `diagnosis.applicationId === applicationId` (passed from session context). A user cannot approve a diagnosis for a different application.

---

## Rejected alternatives

### A. Inject OpportunityBriefsService directly into DiagnosesService

Would create a direct cross-module dependency (`DiagnosesModule` → `OpportunityBriefsModule`) that makes the module graph harder to reason about. `AiWorkflowService` is the established orchestration layer for all background AI work — routing through it is consistent with how `generatePreScreenForApplication()` already works.

### B. Emit an event / use an EventEmitter

NestJS `EventEmitter2` would decouple the trigger cleanly. Rejected for now because it adds a dependency and a new pattern for a two-subscriber system. Revisit when there are three or more consumers of the `diagnosis.approved` event.

### C. Cron-based polling

A cron job scanning for `DIAGNOSIS_APPROVED` applications with no brief would eventually recover stuck records. Too slow for a user-facing flow where the brief should appear within seconds of approval. Could be added as a safety net in addition to the event-driven trigger.

---

## Consequences

- Applications no longer stall at `DIAGNOSIS_APPROVED`; brief generation starts within milliseconds of client approval.
- `AiWorkflowService` grows a third method (`generateBriefForApplication`) following the same fire-and-forget pattern as the existing two.
- `DiagnosesService` gains one new constructor injection (`AiWorkflowService`). Since `AiModule` is `@Global()`, no module-level import change is needed in `DiagnosesModule`.
- The end-to-end company lifecycle is now fully automated from submission through brief readiness — only the payment step and admin approval remain manual.
