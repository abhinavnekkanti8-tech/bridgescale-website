# GAP_ANALYSIS.md Plan

## Summary
Create a new root-level document, `GAP_ANALYSIS.md`, that explains the gap between the BridgeScale vision and the current implementation. The document should be useful to both business and engineering readers, with separate sections for each. It should explicitly cover product vision, current state, what is working, what is partially built, what is missing, and what blocks a credible launch.

## Key Changes
- Add `GAP_ANALYSIS.md` at the repo root.
- Organize the file into two primary audiences:
  - Founder / Product / GTM view
  - Engineering / Delivery view
- Use the current repo as the source of truth, not aspirational docs.

### Proposed document structure
- Title
  - `BridgeScale Gap Analysis`
- Executive summary
  - 1 short section describing what BridgeScale is trying to be
  - 1 short section describing what it currently is in practice
  - 1 short section describing the main gap: strong marketplace vision, partial lifecycle implementation
- Section 1: Product purpose
  - Purpose: curated marketplace for fractional diaspora GTM talent
  - Problem: startups need senior commercial capability without full-time risk
  - Gap in market: uncertainty around diagnosis, role definition, vetting, matching, and structured execution
  - Intended solution: intake → AI diagnosis → vetting → matching → brief/SOW → engagement management
- Section 2: Founder / PM gap analysis
  - What feels real today
    - marketing site
    - application flows
    - account creation and session flow
    - dashboards/admin surfaces exist
  - What is only partially real
    - AI diagnosis
    - talent pre-screen
    - opportunity brief
    - matching reveal / payment unlock
    - contract and engagement orchestration
  - What is missing for the full business promise
    - stronger company intake for commercial diagnosis
    - clearer operator-side value loop
    - tighter handoff from diagnosis to matching and engagement
    - proof that brief/matching outputs are actually trustworthy
  - Launch-readiness assessment
    - usable as prototype / demo / internal alpha
    - not yet trustworthy as a production marketplace operating system
- Section 3: Engineering gap analysis
  - Build and release blockers
    - frontend `useSearchParams()` production-build failures
    - missing `AuthProvider` wrapping on unlock pages
    - backend TypeScript compile failures in `ApplicationsService`
    - service wiring mismatch for talent pre-screen generation
    - Prisma include/query mismatch around `startupProfile`
  - Workflow gaps
    - opportunity brief exists but is not fully lifecycle-driven
    - diagnosis approval does not clearly auto-trigger brief generation
    - opportunity brief generation uses deterministic mock output
    - richer company inputs are not fully consumed downstream
    - matching, brief, and SOW flows are loosely connected
  - Product-model drift
    - docs/status overstate completion
    - route naming drift such as `/startup/matching` vs `/startup/shortlist`
    - fee/port/documentation inconsistencies
  - Operational gaps
    - incomplete production confidence
    - no evidence yet of a stable end-to-end golden path
- Section 4: Opportunity brief deep dive
  - What exists
    - prompt definition
    - Prisma model
    - service/controller
    - admin generation/update endpoints
  - What is missing
    - automatic lifecycle trigger from approved diagnosis
    - live AI generation
    - richer input usage
    - operator-facing consumption
    - stronger tie into matching and SoW generation
  - Why this matters
    - this is the bridge between “company need” and “talent match”
    - if this layer is weak, the marketplace feels generic instead of curated
- Section 5: Input quality for AI briefing
  - Current company inputs are good enough for a v1 diagnosis
  - Current inputs are not yet enough for a high-confidence GTM/opportunity brief
  - Recommended additional inputs
    - traction / revenue / pipeline baseline
    - sales team size and ownership
    - average deal size / cycle
    - working vs failing channels
    - geography priority order
    - hard 30/60/90 success metrics
    - primary commercial bottleneck
  - Important nuance
    - some startups will not know ICP or buyer persona yet, and the product should support discovery rather than require that knowledge upfront
- Section 6: Recommended next priorities
  - Priority 1: restore build health
  - Priority 2: align docs with actual repo state
  - Priority 3: complete one reliable company-side golden path
    - apply
    - diagnosis
    - approval
    - brief
    - shortlist/matching reveal
  - Priority 4: strengthen intake inputs for better AI output
  - Priority 5: tighten operator-side workflow and value proposition
- Section 7: Conclusion
  - BridgeScale already expresses a strong product thesis
  - the main challenge is not lack of vision, but incomplete stitching between lifecycle stages
  - the next milestone is not “more surfaces,” but “one trustworthy end-to-end path”

## Public Interfaces / Types
- No code interfaces or APIs should change for this task.
- The new markdown file should describe current behavior and current gaps, not redefine system contracts.
- References to routes, API behavior, statuses, and AI workflows should match the repo as it exists today.

## Test Plan
- Verify every claim in `GAP_ANALYSIS.md` against current repo files before writing:
  - `README.md`
  - `TECHNICAL.md`
  - `backend/src/applications/applications.service.ts`
  - `backend/src/diagnoses/diagnoses.service.ts`
  - `backend/src/opportunity-briefs/opportunity-briefs.service.ts`
  - `backend/src/ai/prompts/need-diagnosis.prompt.ts`
  - `backend/src/ai/prompts/opportunity-brief.prompt.ts`
  - `backend/prisma/schema.prisma`
  - relevant frontend dashboard/status pages
- Confirm the document clearly separates:
  - what is implemented
  - what is partially implemented
  - what is mocked
  - what is missing
- Acceptance criteria
  - a founder can read it and understand business readiness
  - an engineer can read it and understand delivery gaps
  - the document does not overclaim completed functionality

## Assumptions
- Default audience is mixed, with distinct sections for business and engineering readers.
- Default filename is `GAP_ANALYSIS.md` in the repo root.
- Default stance is honest/current-state analysis, not pitch-deck language.
- The document should emphasize “fractional” positioning consistently, since that is central to the product thesis.
