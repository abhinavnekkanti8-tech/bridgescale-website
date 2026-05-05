# Doc Edit Checklist

## Summary
Update `README.md`, `TECHNICAL.md`, and `backend/.env.example` so the docs describe the current codebase honestly: dev setup, ports, payment amounts, API auth, route names, schema shape, and implementation status must all match the repo and the current failed-build reality.

## File-by-File Changes

### `README.md`
- Change `FRONTEND_URL` default from `http://localhost:3001` to the actual local default used by the frontend flow: `http://localhost:3000`.
- Add a short note in Quick Start or Project Status that `npm run dev` working does not guarantee `npm run build` passes.
- Replace the current Phase/Status table wording so Phase 2 is not labeled fully “Done” while production builds still fail.
- Add a brief “Known build blockers” list:
  - Next.js production build fails on `useSearchParams()` handling for `/application/status` and `/auth/magic`
  - `useAuth()` provider wiring fails on both unlock-matching pages
  - backend `ApplicationsService` currently has TypeScript/service wiring issues
- Normalize product/payment wording:
  - company unlock fee: `₹8,500`
  - talent unlock fee: `$50`
- Verify the final “See TECHNICAL.md” link target and path text are correct for this repo layout.

### `TECHNICAL.md`
- Fix the `Application` model description so it no longer claims `userId` and `orgId` exist on `Application`; describe the current Prisma model instead.
- Fix the API reference entry for `GET /applications/:id/status` to show it is public, matching the controller.
- Reconcile frontend route documentation:
  - either document `/startup/matching` as the canonical route and remove `/startup/shortlist` references from narrative text
  - or document the current product intent if `/startup/shortlist` is the intended route and explicitly mark it as not yet implemented
- Update the AI integrations section so “Talent pre-screen” is described as partially wired, not fully complete, until the service call path is fixed.
- Update the Implementation Status section:
  - move AI/pre-screen and payment-unlock flows from “Done” to “Partially implemented” or “In progress”
  - mention that frontend and backend production builds are currently failing
- Add a short “Current known gaps” subsection near Implementation Status for the concrete build blockers already verified.
- Standardize `FRONTEND_URL` examples to `http://localhost:3000` unless the code/config is intentionally being changed elsewhere.
- Keep payment amounts aligned with code:
  - company unlock: `₹8,500`
  - talent unlock: `$50`

### `backend/.env.example`
- Change the Razorpay fee comment from `₹15,000 INR fee` to `₹8,500 INR fee`.
- Change `FRONTEND_URL=http://localhost:3001` to `FRONTEND_URL=http://localhost:3000` to match frontend dev usage and backend default behavior.
- Review surrounding comments so they describe current behavior rather than older planned integrations.

### Optional consistency pass
- Search for stale fee/route/port references in docs and templates outside the main docs:
  - company fee mismatches such as `$200` in email copy
  - `/startup/shortlist` vs `/startup/matching`
  - `localhost:3001` vs `localhost:3000`
- If this pass is included, update `HOSTING.md` and any user-facing template copy that repeats those values.

## Public Interface / Behavior Notes
- No code APIs need to change for this docs pass unless you explicitly choose to make docs match planned behavior instead of current behavior.
- If the team wants docs to reflect intended future behavior rather than current code, mark those items clearly as “planned” or “not yet wired” instead of documenting them as live.

## Test Plan
- Re-read each edited section against:
  - `frontend/package.json`
  - `frontend/next.config.js`
  - `backend/.env.example`
  - `backend/src/applications/applications.controller.ts`
  - `backend/src/applications/applications.service.ts`
  - `backend/prisma/schema.prisma`
- Run a grep-based consistency pass for:
  - `3001`
  - `3000`
  - `8500`
  - `15000`
  - `/startup/shortlist`
  - `/startup/matching`
  - `generatePreScreenForApplication`
- Acceptance criteria:
  - no doc claims contradict the current code on ports, auth, routes, payment amounts, or schema fields
  - implementation/status sections do not claim features are complete while the builds still fail

## Assumptions
- Default assumption: docs should reflect the current repo truth, not aspirational future behavior.
- Default assumption: the canonical local frontend port should be `3000`.
- Default assumption: the known build failures should be documented briefly rather than hidden.
