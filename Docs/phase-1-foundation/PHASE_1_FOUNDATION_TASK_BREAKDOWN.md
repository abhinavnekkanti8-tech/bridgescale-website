# Phase 1 Foundation Task Breakdown

## Plain-English Overview

Phase 1 is the foundation layer for the new BridgeScale operating model. It does not try to solve legal, finance, live payouts, EOR partners, or production tax workflows yet.

The goal is simpler: make the database and backend understand the real BridgeScale building blocks:

- what service is being sold
- what engagement type it belongs to
- which operator roles can deliver it
- whether an operator is ready for matching, MSA, or payout
- how a company/operator pair will later attach to one Master Service Agreement

This phase should leave the old working product intact while adding the new structure beside it.

## Task Checklist

| Task | Founder-friendly meaning | Engineering deliverable | Dependency | Done when |
| --- | --- | --- | --- | --- |
| 1. Planning folder | Keep this phase easy to understand and review. | Create `Docs/phase-1-foundation/PHASE_1_FOUNDATION_TASK_BREAKDOWN.md`. | None | This document exists and can be used as the Phase 1 checklist. |
| 2. Service model fields | Replace confusing old package labels with BridgeScale service language. | Add `ServiceLane`, `EngagementType`, `RetainerFlavour`, and `ServiceTemplateCode`. Keep old fields where needed. | None | Database accepts the new fields and old flows still build. |
| 3. Operator role system | Use a fixed role list instead of loose text. | Add `OperatorRole`, `roles` on operator profiles, and a role-to-lane helper. | Task 2 | Every role maps to exactly one lane. |
| 4. MSA foundation | Prepare for one MSA per company/operator pair. | Add `MasterServiceAgreement` with signature timestamps and unique pair rule. | Task 2 | Duplicate MSAs for the same pair are blocked by the database. |
| 5. Service template seed | Move the service menu into the database. | Seed 10 service templates from the Master Plan. | Task 2 | Seed creates/updates all 10 service templates. |
| 6. Role-service matrix seed | Make matching rules readable by the app. | Add and seed `RoleTemplateEngagementCombination`. | Tasks 3 and 5 | Backend can query which services fit an operator role. |
| 7. Auxiliary foundation models | Prepare for later payment, compliance, addendum, cancellation, and lifecycle flows. | Add placeholder/foundation models only. No live provider wiring. | Task 2 | Schema supports Phase 2/3 work without promising live finance/legal operations. |
| 8. Three-stage operator gate API | Tell the app what an operator can do next. | Add API that reports matching-ready, MSA-ready, and payout-ready status. | Task 7 | API lists current status and missing items clearly. |
| 9. Tests and validation | Prove the foundation does not break existing product paths. | Add focused tests and run Prisma/build checks. | All engineering tasks | Backend tests, Prisma generate, and backend build pass. |
| 10. Founder review | Confirm the foundation is understandable and useful. | Review checklist below. | All tasks | Founder approves moving to Phase 2. |

## Definition of Done

Phase 1 is done when:

- all three high-risk foundation migrations are applied in dev without regression
- the 10 service templates are loaded into the database
- the role/service combination matrix is queryable from the database
- a typical role/service lookup is indexed for fast reads
- the operator gate API reports matching-ready, MSA-ready, and payout-ready status
- the gate is controlled by a feature flag so it can report before it blocks
- existing company and talent signup paths still work
- backend tests, Prisma generate, and backend build pass

## Founder Review Checklist

Use this checklist at the end of Phase 1:

- Can I see the 10 service templates in the database?
- Can I see the role/service combination rules?
- Can one company/operator pair have only one MSA?
- Can the app tell whether an operator is matching-ready, MSA-ready, or payout-ready?
- Did the app build without breaking old flows?
- Are legal/finance/provider items clearly marked as placeholders rather than live operations?

## Important Assumptions

- Phase 1 does not wire live Stripe Connect, Wise, Razorpay payouts, Deel, Remote, or Multiplier.
- Legal and finance fields are placeholders/foundation only.
- Old database fields may remain temporarily if removing them would increase risk.
- The priority is a working foundation, not perfect cleanup.
- Phase 2 can build the actual MSA/SOW flow on top of this foundation.

