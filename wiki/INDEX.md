# AG Platform — Wiki Index

Last compiled: 2026-05-06 | Topics: 15 | Concepts: 3

> **How to use:** Read a topic article before reading raw source files. One topic article replaces reading 10–20 raw files. For cross-cutting questions, start with the Concepts section.

---

## Topics

| Topic | Coverage | Key Sources | Summary |
|-------|----------|-------------|---------|
| [Product Overview](topics/product-overview.md) | high | `Docs/`, `CLAUDE.md` | What the platform is, its architecture, external services, and current phase |
| [Data Models](topics/data-models.md) | high | `prisma/schema.prisma` | All Prisma models — identity, intake, matching, contracts, payments, engagements, AI |
| [Applications](topics/applications.md) | high | `backend/src/applications/` | Intake flow, free signup, all 17 API endpoints, unlock-matching, admin review |
| [Auth](topics/auth.md) | high | `backend/src/auth/`, guards | Session-based auth, magic links, password login, `SessionAuthGuard`, `RolesGuard` |
| [AI Services](topics/ai-services.md) | high | `backend/src/ai/` | Need diagnosis, talent pre-screen, opportunity brief, cross-verification |
| [Matching](topics/matching.md) | high | `backend/src/matching/` | 7-component scoring algorithm, shortlist composition, operator selection |
| [Payments](topics/payments.md) | high | `backend/src/payments/` | Razorpay (INR/company) + Stripe (USD/talent), DUMMY_PAYMENT_MODE, engagement invoices |
| [Contracts & SOW](topics/contracts-sow.md) | medium | `backend/src/contracts/`, `sow/` | SOW lifecycle, dual-signature contracts, versioning, templates |
| [Engagements](topics/engagements.md) | high | `backend/src/engagements/` | Active workspace, milestones, health score, nudges, escalations, closeout |
| [Frontend — Startup UI](topics/frontend-startup.md) | medium | `frontend/src/app/startup/` | Company dashboard, match unlock flow, all startup routes |
| [Frontend — Operator UI](topics/frontend-operator.md) | medium | `frontend/src/app/operator/` | Talent dashboard, completion checklist, all operator routes |
| [Admin Portal](topics/admin-portal.md) | medium | `frontend/src/app/admin/` | Application review, matching admin, contract oversight, analytics |
| [Compliance & EOR](topics/compliance-eor.md) | high | `backend/src/compliance/`, `backend/src/operator-eor-enrollment/`, `Docs/SERVICE_MODEL/06_*.md` | Tax profiles, EOR enrollment, cross-border compliance, W-8BEN, FAST equity docs |
| [Partners](topics/partners.md) | high | `backend/src/partners/` | Razorpay payouts, Stripe Connect, Wise transfers, Deel/Remote/Multiplier EOR adapters |
| [Core Flow](topics/core-flow.md) | high | `backend/src/core-flow/`, `frontend/src/app/*/calls/` | Pre-SOW calls, engagement intent capture, commercial summary, handoff to contracts |

---

## Concepts

| Concept | Summary | Topics Referenced |
|---------|---------|-----------------|
| [Free Signup Flow](concepts/free-signup-flow.md) | How Phase 2 free signup works end-to-end: state machine, flags, pending TODOs | applications, auth, frontend-startup, frontend-operator, payments |
| [Session Auth Pattern](concepts/session-auth-pattern.md) | How session cookies flow from backend to frontend; guard usage; common mistakes | auth, applications, all frontends |
| [Async AI Pattern](concepts/async-ai-pattern.md) | Why all AI calls are fire-and-forget; idempotency guards; how to debug | ai-services, applications, engagements |

---

## Quick Reference

**Starting a new feature?**
1. Read [Product Overview](topics/product-overview.md) for context
2. Read [Data Models](topics/data-models.md) for schema
3. Read the relevant topic article for the module you're working in

**Debugging auth issues?** → [Session Auth Pattern](concepts/session-auth-pattern.md)

**AI results not appearing?** → [Async AI Pattern](concepts/async-ai-pattern.md)

**Working on signup flow?** → [Free Signup Flow](concepts/free-signup-flow.md) + [Applications](topics/applications.md)

**Adding a payment?** → [Payments](topics/payments.md) (note DUMMY_PAYMENT_MODE default)

**Understanding the match algorithm?** → [Matching](topics/matching.md)
