# Diaspora-First Sales and Business Development Marketplace Tasks

We complete one artifact at a time and review it before proceeding.

---

## [ ] Artifact 1: Application Scaffolding & Infrastructure
**Goal:** A runnable, base-level stack a developer can boot with one command.
- [ ] Bootstrap Next.js (TypeScript) frontend in `frontend/`
- [ ] Bootstrap NestJS (TypeScript) backend in `backend/`
- [ ] Set up Prisma ORM connected to PostgreSQL
- [ ] Add a `docker-compose.yml` to run PostgreSQL and Redis locally
- [ ] Add a root `.env.example` with all required environment variable keys (dummy values)
- [ ] Configure ESLint, Prettier, TypeScript strict mode for both apps
- [ ] Configure CI pipeline (lint, type-check, schema migration test)
- [ ] Scaffold Jest/Vitest test runners in the backend
- [ ] Set up structured logging (correlation IDs on every request) and an error tracker stub
- [ ] Add an internal health check endpoint (`GET /health`) showing DB, queue, and Redis status
- [ ] Create a root `start.bat` / `start.sh` one-click launch script for the full stack

---

## [ ] Artifact 2: Authentication, RBAC, and Core Data Models
**Goal:** Every role can register, log in, and is restricted to their permissions.
- [ ] Define Prisma models: `User`, `Organization`, `Membership`
- [ ] Implement session-based authentication (login, logout, session expiry, device invalidation)
- [ ] Implement RBAC middleware covering all five roles: Startup Admin, Startup Member, Operator, Platform Admin, Deal Desk
- [ ] Enforce object-level permission checks (cross-tenant denial by default)
- [ ] Build frontend login, logout, and protected route scaffolding
- [ ] Seed script for initial Platform Admin account
- [ ] Role and permission unit tests

---

## [ ] Artifact 3: Startup Intake, Profile & Readiness Scoring
**Goal:** A startup can apply, submit a full profile, and receive a scored readiness result.
- [ ] Define Prisma models: `StartupProfile`, `DemandReadinessScore`
- [ ] Build multi-step Startup intake form UI (industry, stage, target market, budget, execution owner, collateral upload)
- [ ] Build backend API for startup profile creation and update (`POST /startups`, `PATCH /startups/:id`)
- [ ] Connect to OpenAI (gpt-4o) using a structured output schema (dummy API key)
- [ ] Implement AI-native Demand Readiness Scoring engine (7 components, 100-point weighted scale)
- [ ] Store score breakdown, blockers, and snapshot history
- [ ] Enforce thresholds: below 60 → preparation path; 60–74 → Sprint only; 75+ → Sprint or Retainer
- [ ] Build Startup Dashboard showing readiness score, breakdown, and blockers
- [ ] Admin screen to view and override readiness scores with audit log
- [ ] Unit tests for scoring logic; API contract tests for intake endpoints

---

## [ ] Artifact 4: Operator Onboarding, Verification & Supply Quality Scoring
**Goal:** An operator can be invited, register, and be assigned a verified quality tier.
- [ ] Define Prisma models: `OperatorProfile`, `SupplyQualityScore`
- [ ] Build Operator invite email workflow (invite token, account creation)
- [ ] Build Operator profile creation UI (lane, region, functions, experience tags, references, availability)
- [ ] Build backend APIs for operator profile management and reference capture
- [ ] Implement AI-assisted Supply Quality Scoring engine (7 components, 100-point weighted scale)
- [ ] Implement Tier assignment (Tier A ≥ 80, Tier B 65–79, Tier C < 65)
- [ ] Build Platform Admin verification screen: approve, reject, override tier
- [ ] Store score snapshots for auditability
- [ ] Unit tests for scoring; role-based access tests for admin verification screen

---

## [ ] Artifact 5: Discovery Call Scheduling & Package Recommendation
**Goal:** A startup books a discovery call, gets an AI summary, and receives a package recommendation.
- [ ] Define Prisma models: `DiscoveryCall`, `Package`
- [ ] Build discovery call scheduling UI (calendar availability picker, confirmation)
- [ ] Build in-platform meeting link and structured notes capture form
- [ ] Implement AI-native Discovery Summary generator (from notes + startup profile)
- [ ] Implement AI-native Package Recommendation engine (Pipeline Sprint, BD Sprint, or Retainer)
- [ ] Build Startup UI showing discovery summary and recommended package(s)
- [ ] Store discovery notes, summary, and recommendation with prompt version metadata
- [ ] Admin screen to view, edit, and override discovery summaries and recommendations
- [ ] Integration test for scheduling → summary → recommendation flow

---

## [ ] Artifact 6: Matching, Shortlist Generation & Operator Interest
**Goal:** An AI-powered shortlist is generated, explained, and acted on by both parties.
- [ ] Define Prisma models: `MatchShortlist`, `MatchCandidate`
- [ ] Implement Match Fit Scoring engine (7 components, 100-point weighted scale, hard filters applied first)
- [ ] Implement Shortlist Generation workflow: top 5 candidates, ≥ 2 Tier A if available, 1 adjacent-fit candidate
- [ ] Generate AI explanations per candidate (why they fit, main risk, appropriate package tier)
- [ ] Build Platform Admin screen to review and publish shortlist to startup
- [ ] Build Startup UI: view shortlist with explanations, risks, and expected weekly fit
- [ ] Build Operator UI: receive notification and confirm or decline interest
- [ ] Enforce single operator selection per package engagement
- [ ] Anti-offlining: mask direct contact details on all shortlist and profile views
- [ ] Integration test for shortlist generation and selection flow

---

## [ ] Artifact 7: Statements of Work, Contracts & E-Signature
**Goal:** An SoW is AI-generated, versioned, edited, signed, and locked before engagement begins.
- [ ] Define Prisma models: `StatementOfWork`, `Contract`, `Document`
- [ ] Implement AI-native SoW generation from package template + discovery summary
- [ ] Build in-platform SoW editor UI (controlled fields only, with field-level permissions by role)
- [ ] Implement SoW version tracking (immutable versions, re-sign required on change)
- [ ] Integrate dummy E-signature workflow (send, sign, webhook callback, status tracking)
- [ ] Build frontend contract review and sign UI for both Startup Admin and Operator
- [ ] Implement non-circumvention clause injection in all contract templates
- [ ] Unlock direct contact details only after both signatures confirmed and first payment received
- [ ] Watermark generated documents and log all document downloads
- [ ] Idempotency on contract send and sign actions (prevent double-click race conditions)
- [ ] API contract tests for SoW versioning and contract state machine

---

## [ ] Artifact 8: Payments, Invoicing & Payment State Tracking
**Goal:** Invoices are issued, payments tracked, and overdue states are enforced automatically.
- [ ] Define Prisma models: `PaymentPlan`, `Invoice`, `PaymentEvent`
- [ ] Build Payment Plan setup UI (cash sprint fee / retainer / success fee addendum)
- [ ] Build Invoice issuance and list UI for Startup Admin and Platform Admin
- [ ] Integrate dummy Payment Gateway (Stripe sandbox): create payment links, handle webhooks
- [ ] Implement idempotent webhook handler for payment events (prevent duplicate processing)
- [ ] Implement payment pending, confirmed, overdue, and paused state machine
- [ ] Auto-pause engagement milestones when invoice is overdue
- [ ] Admin payment intervention: mark paid, extend due date, pause/resume engagement
- [ ] Build Startup payment status view
- [ ] Webhook handler tests and payment state machine unit tests

---

## [ ] Artifact 9: Engagement Workspace — Milestones, Messaging & Files
**Goal:** Both parties have a shared workspace to track delivery, communicate, and share files.
- [ ] Define Prisma models: `Engagement`, `EngagementMilestone`, `ActivityLog`
- [ ] Build Engagement Workspace landing UI (status, health score, start/end dates)
- [ ] Build Milestone management UI (create, assign, due date, mark complete, attach evidence)
- [ ] Build in-platform Notes and Messages thread per engagement
- [ ] Build File upload and retrieval UI (signed S3-compatible URLs that expire)
- [ ] Build weekly governance meeting log (scheduled, completed, notes captured)
- [ ] Immutable ActivityLog recording all actions (milestone updates, messages, file uploads)
- [ ] Startup Member role: read-only access to workspace (no commercial actions)
- [ ] Integration tests for workspace actions and ActivityLog entries

---

## [ ] Artifact 10: Health Scoring, Nudges & Escalations
**Goal:** The system proactively monitors engagement health and escalates risks.
- [ ] Define Prisma models: `HealthScoreSnapshot`, `EscalationCase`, `ReplacementRequest`
- [ ] Implement Engagement Health Score engine (5 components, 100-point weighted scale)
- [ ] Set up background recurring job to recalculate health score on milestone/note/payment events
- [ ] Implement health status labels (On Track ≥ 80, Watch 65–79, At Risk 50–64, Escalate < 50)
- [ ] Build nudge notification system: 3 days inactivity, before unscheduled meeting, past-due milestone
- [ ] Implement Escalation ladder workflow and EscalationCase management UI for Platform Admin
- [ ] Build AI-generated health commentary and suggested interventions
- [ ] Implement Replacement Request workflow (requestor, reason, admin approval)
- [ ] Admin screen to review and act on all active escalations and replacements
- [ ] Deal Desk case routing: trigger, assign partner, manage status and notes
- [ ] Unit tests for health score engine; integration tests for nudge triggers

---

## [ ] Artifact 11: Closeout, Ratings & Renewal
**Goal:** Engagements close formally with a report, ratings, and a data-driven renewal recommendation.
- [ ] Build AI-powered Closeout Report generator (completed actions, outcomes, evidence, next steps)
- [ ] Build two-sided structured Rating submission UI (component scores, comments)
- [ ] Implement renewal recommendation engine (Renewal, Retainer conversion, or Follow-on Sprint)
- [ ] Build Renewal flow UI to initiate a new engagement from existing context
- [ ] Store closeout report and ratings with prompt version metadata
- [ ] Integration test for full closeout → rating → renewal path

---

## [ ] Artifact 12: Admin Controls, Scoring Config & Deal Desk
**Goal:** Platform Admin has full control over scoring, approvals, overrides, and special cases.
- [ ] Build Admin Scoring Configuration UI (edit and save scoring weights per engine)
- [ ] Ensure historical scores remain audit-locked when weights change mid-cycle
- [ ] Build Admin Approval workflows (startup application, operator activation)
- [ ] Build Deal Desk case management UI (trigger types, partner assignment, document access)
- [ ] Restrict Deal Desk partner to assigned cases only (object-level permission)
- [ ] Build Admin intervention tools: override score, pause/resume engagement, force replacement

---

## [ ] Artifact 13: KPI Dashboard & Observability
**Goal:** Platform Admin can monitor marketplace health and operational metrics in real time.
- [ ] Build Marketplace Health dashboard (applications, approval rate, time-to-match, shortlist-to-selection rate)
- [ ] Build Engagement Health dashboard (completion rate, renewal rate, average health score, risk share)
- [ ] Build Outcome Metrics dashboard (qualified meetings/sprint, partner pilots, retainer upgrades)
- [ ] Build Supply Utilization dashboard (active operators, utilization %, Tier A share)
- [ ] Build AI & Ops dashboard (AI spend, token usage, schema validity rate, override rate, queue depth)
- [ ] Wire structured logs with request correlation IDs across API and background workers
- [ ] Add metrics for API latency, queue depth, error rate, AI spend and failed job count
- [ ] Set up Prometheus/Grafana stub or equivalent lightweight metrics dashboard

---

## [ ] Artifact 14: Testing, Edge Cases & Release Checklist
**Goal:** The platform passes all automated tests, handles every documented edge case, and is release-ready.
- [ ] API contract tests for all major endpoints and validation rules
- [ ] Role and object-level permission tests for all five roles
- [ ] Integration tests for all 5 core journeys end-to-end
- [ ] AI regression tests: fixed inputs → expected structured outputs for each AI task type
- [ ] Webhook handler tests: payment and e-signature double-delivery and idempotency
- [ ] Edge case validation: empty profiles, duplicate applications, operator declines, payment webhook race, concurrent SoW edits, expired signed URLs, dead queue workers
- [ ] Smoke test checklist execution on staging
- [ ] Confirm migrations apply cleanly on fresh database
- [ ] Confirm background workers boot and queue clears
- [ ] Verify environment secrets, error tracking, and structured logs on staging

---

## [ ] Artifact 15: Deployment, One-Click Run & Final Integration
**Goal:** A complete, deployment-ready platform that can be launched with a single command and demonstrated end-to-end.
- [ ] Finalize `docker-compose.yml` for full-stack local boot (frontend, backend, PostgreSQL, Redis)
- [ ] Create a root `START.bat` (Windows) and `start.sh` (Unix) to run the complete stack
- [ ] Verify all services start, migrate, and seed correctly in one command
- [ ] End-to-end walkthrough: Startup applies → scored → discovery call → shortlist → SoW signed → payment → active engagement → health scored → closeout → renewal recommended
- [ ] Create final `WALKTHROUGH.md` documenting each UI screen and how to demo the platform
