# Core Flow

*Sources: `backend/src/core-flow/core-flow.module.ts` · `backend/src/core-flow/core-flow.controller.ts` · `backend/src/core-flow/core-flow.service.ts` · `backend/src/core-flow/dto/core-flow.dto.ts` · `backend/prisma/schema.prisma` (EngagementCall, EngagementIntent, PreSowCommercialSummary) · `frontend/src/app/operator/calls/page.tsx` · `frontend/src/app/startup/calls/page.tsx` · `frontend/src/components/engagement/EngagementIntentPanel.tsx` · `Docs/phase-2-core-flow/PHASE_2_CORE_FLOW_TASK_BREAKDOWN.md` · `Docs/BRIDGESCALE_SERVICE_MODEL/07_SERVICE_ROLE_ENGAGEMENT_PAYMENT_COMPLIANCE_MAPPING.md`*

---

## Purpose
[coverage: high]

The `core-flow` module orchestrates the post-match commercial path: the segment of the marketplace journey between *"company sees an unblurred match"* and *"SOW is signed and engagement begins."* It exists because that segment was previously implicit — a company would unlock matches and the next coherent surface was a draft SOW, with the 30-minute call, mutual intent, and Pre-SOW summary handled out of band.

Per `Docs/BRIDGESCALE_SERVICE_MODEL/07_…/Corrected Marketplace Flow`, the spec is an 18-step path. Steps 7–13 — call request, call accept, call happens, both sides indicate intent, Pre-SOW Commercial Summary, MSA generation, MSA signing — all live in this module. Steps 1–6 are upstream (`applications`, `matching`, `payments`); steps 14–18 (SOW draft → engagement) live downstream in `sow`, `contracts`, `engagements`.

This is an explicit "Phase 2 Core Flow" deliverable: the goal is to prove BridgeScale can move *one* company and *one* operator through the core journey end-to-end on dev. Documents are placeholder, signatures are typed-string IDs, and payments use dummy mode — the real value is the state machine.

---

## Architecture
[coverage: high]

Single-controller, single-service module. Three primary models on Prisma drive the state machine.

```
CoreFlowController                 (no controller path prefix — each route names itself)
  ├─ POST   /calls/request
  ├─ GET    /calls/me
  ├─ GET    /calls/:id
  ├─ PATCH  /calls/:id/respond
  ├─ PATCH  /calls/:id/outcome
  ├─ PATCH  /calls/:id/defer
  ├─ POST   /engagement-intents
  ├─ POST   /pre-sow-summaries
  ├─ GET    /pre-sow-summaries/:id
  ├─ PATCH  /pre-sow-summaries/:id/confirm
  └─ GET    /strikes/me
        │
        ▼
CoreFlowService
  ├─ requestCall / respondToCall / recordCallOutcome / deferCall
  ├─ recordIntent          (upserts on (callId, party) unique)
  ├─ createPreSowSummary   (asserts mutual INTERESTED first)
  ├─ confirmPreSowSummary  (auto-flips to CONFIRMED on second party)
  └─ getStrikesForOperator (90-day cancellation/no-show window)
```

The service is small (~280 lines) and stateful only via Prisma. Almost every method begins with a `getCallOrThrow` lookup; the only meaningful business invariants are `assertMutualIntent` (gates Pre-SOW creation) and the auto-CONFIRMED transition when both parties' `confirmedAt` timestamps are set.

---

## Talks To
[coverage: high]

| Module | How |
|--------|-----|
| `prisma` | All persistence: `EngagementCall`, `EngagementIntent`, `PreSowCommercialSummary`, `ServiceTemplate`, `CancellationEvent`, `StartupProfile`, `OperatorProfile` |
| `auth` (session) | Every route guarded by `SessionAuthGuard + RolesGuard` |
| `matching` | Calls reference `shortlistId` / `candidateId` from `MatchShortlist` (the call request points back to the shortlist that produced the match) |
| `sow` | Downstream consumer — reads confirmed `PreSowCommercialSummary` to template SOW v1 |
| `engagements` (cancellation) | `getStrikesForOperator` reads `CancellationEvent` rows linked via `sow.operatorId` |
| Frontend `/operator/calls` and `/startup/calls` | Both pages call `coreFlowApi.listMyCalls` and render `EngagementIntentPanel` per call |

---

## API Surface
[coverage: high]

All routes guarded; role required is per-route.

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| `POST` | `/calls/request` | STARTUP_ADMIN, PLATFORM_ADMIN | Company requests a 30-min call with an operator (optionally tied to a shortlist/candidate) |
| `GET` | `/calls/me` | STARTUP_ADMIN, OPERATOR, PLATFORM_ADMIN | Lists calls visible to caller; includes `intents`, `startup`, `operator` fields |
| `GET` | `/calls/:id` | All three | Single call with intents |
| `PATCH` | `/calls/:id/respond` | OPERATOR, PLATFORM_ADMIN | Operator accepts/declines; sets `scheduledAt`, `meetingLink`, `respondedAt` |
| `PATCH` | `/calls/:id/outcome` | All three | Records outcome notes; flips status to `COMPLETED` |
| `PATCH` | `/calls/:id/defer` | All three | Either party requests a new time; resets status to `REQUESTED`, clears `scheduledAt`, appends reason to notes |
| `POST` | `/engagement-intents` | All three | Upsert (`callId`, `party`) → `INTERESTED \| NOT_INTERESTED` |
| `POST` | `/pre-sow-summaries` | PLATFORM_ADMIN | Create summary; throws if both intents aren't `INTERESTED` |
| `GET` | `/pre-sow-summaries/:id` | All three | Read summary with parent call |
| `PATCH` | `/pre-sow-summaries/:id/confirm` | All three | Set `startupConfirmedAt` or `operatorConfirmedAt`; auto-flip to `CONFIRMED` when both set |
| `GET` | `/strikes/me` | OPERATOR | 90-day cancellation/no-show count + `pausedAtRisk` / `paused` flags |

---

## Data
[coverage: high]

### State machines

```
EngagementCall.status:    REQUESTED → ACCEPTED → COMPLETED
                                ↓
                             DECLINED  (or  CANCELLED)
                                
                          (deferCall resets ACCEPTED/COMPLETED → REQUESTED with new proposedAt)

EngagementIntent.status:  INTERESTED  |  NOT_INTERESTED      (upsert per (callId, party))

PreSowCommercialSummary:  DRAFT → SHARED → CONFIRMED → CANCELLED
                            (created in SHARED state; CONFIRMED requires both party timestamps)
```

### Key fields

| Model | Field | Notes |
|-------|-------|-------|
| `EngagementCall` | `proposedAt` / `scheduledAt` / `respondedAt` / `completedAt` | Time-keeping per stage |
| `EngagementCall` | `shortlistId`, `candidateId` | Optional pointers back to matching |
| `EngagementCall` | `meetingLink`, `notes`, `outcomeNotes` | Free-text |
| `EngagementIntent` | `(callId, party)` | Unique compound — one intent per side |
| `PreSowCommercialSummary` | `serviceTemplate` | FK → `ServiceTemplate.code` (validated to exist) |
| `PreSowCommercialSummary` | `engagementType`, `retainerFlavour`, `compensationMode` | Service-model enums (see `service-model.md`) |
| `PreSowCommercialSummary` | `indicativePrice`, `currency`, `weeklyHours`, `durationDays` | Commercial fields |
| `PreSowCommercialSummary` | `startupConfirmedAt`, `operatorConfirmedAt` | Both set → status auto-flips to `CONFIRMED` |

### `getStrikesForOperator` output

| Field | Source |
|-------|--------|
| `lateCancels` | `CancellationEvent` rows where party=OPERATOR, reason ∉ no-show variants |
| `noShows` | Same rows, reason matches `no-show` / `no show` / `noshow` |
| `total` | `lateCancels + noShows` over rolling 90-day window |
| `windowDays` | `90` (constant) |
| `threshold` | `3` (constant) |
| `pausedAtRisk` | `noShows >= 2 \|\| total >= 2` |
| `paused` | `noShows >= 3 \|\| total >= 3` |

The comment in code is explicit: when call-level cancellation tracking lands, this method will also count `CallCancelEvent` rows. Today it only sees SOW-level cancels.

---

## Key Decisions
[coverage: high]

**The 30-minute call is a gate, not just a meeting.** Decision Register entry D12 marks "Match unlock → call → mutual engagement intent → MSA/SOW flow" as Locked. The call exists so neither side commits to legal paperwork before a real conversation. `assertMutualIntent` enforces this invariant: `createPreSowSummary` throws `BadRequestException` unless both `EngagementIntent` rows exist with status `INTERESTED`.

**Pre-SOW Summary is a structured record, not a document.** Per D14, BridgeScale shares a commercial summary *before* MSA signing. The model carries `serviceTemplate`, `engagementType`, `compensationMode`, `indicativePrice`, `weeklyHours`, `durationDays`, plus optional `specialTerms` and `cancellationNote` — all the fields a downstream SOW needs. v1 templates the SOW from this row; v2 (Decision D16, Proposed) layers LLM call-note synthesis on top.

**Manual progression in Phase 2.** Per `PHASE_2_CORE_FLOW_TASK_BREAKDOWN.md`, signatures are typed strings, payments are dummy mode, and EOR/Wise/Stripe Connect are explicitly non-goals. The state machine is real; the documents on either side of it are placeholder.

**Defer resets the call.** `deferCall` doesn't introduce a new status — it *reverts* to `REQUESTED` with a new `proposedAt`, clears `scheduledAt`/`respondedAt`, and appends the reason to notes. This means downstream "has this call been accepted before?" queries need to look at `respondedAt` history, not just current status.

**Auto-confirm on second `confirm`.** `confirmPreSowSummary` reads back the row after writing one party's timestamp, and if *both* are set, immediately fires a second update flipping status to `CONFIRMED`. The two writes are not transactional — the brief intermediate state where one timestamp is set but status is still `SHARED` is observable.

**Strikes are read-only.** This module computes the strike count; it does not persist it or enforce it. The `paused` flag in the response is advisory — gating the operator out of matching is the responsibility of upstream `matching` (or `operators`).

---

## Gotchas
[coverage: medium]

- `listCallsForUser` returns `[]` (not 404) when a STARTUP_ADMIN has no `StartupProfile` for their org. Operators with no profile would also see only operator-id-matching calls (likely empty).
- `recordIntent` upserts on `(callId, party)` — calling it twice with the same `party` *replaces* the intent. There is no audit trail of the previous answer beyond `updatedAt`.
- `assertMutualIntent` requires *both* intents to be `INTERESTED`. A missing intent throws the same 400 as `NOT_INTERESTED`. The error message is generic — frontend has to inspect intents itself to render which side is missing.
- `deferCall` resets `status` to `REQUESTED` even if the call had already been `COMPLETED`. This is intentional (rebooking a completed call) but means status alone is not a reliable "has this call ever happened" signal.
- The strike calculation matches reasons by lowercase substring: `no-show` / `no show` / `noshow`. Anything else falls into `lateCancels` — including reasons like `"company-side change"` that arguably shouldn't count against the operator at all.
- `serviceTemplate` is validated against a DB row by `code`. If the seed data doesn't include the code your DTO references, `createPreSowSummary` 404s before the mutual-intent check runs. Order of errors can be surprising.
- The controller has no `@Controller('core-flow')` prefix — routes are named individually (`/calls/...`, `/engagement-intents`, `/pre-sow-summaries/...`, `/strikes/me`). Check `core-flow.controller.ts` directly when looking for routes; they don't show up under a single prefix.
- `EngagementCall.intents` is included by `getCallWithIntents` and `listCallsForUser` but not by `requestCall` / `respondToCall` / `recordCallOutcome`. Frontend code that relies on `call.intents` after a mutation needs to refetch.
