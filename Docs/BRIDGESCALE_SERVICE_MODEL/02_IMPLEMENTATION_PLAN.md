# Implementation Plan

## Phase 1: Commercial Model Decisions

Purpose: settle the business rules before changing code.

Decisions required:

- company unlock fee
- talent active-pool unlock fee
- platform fee percentage
- whether platform fee is paid by company, talent, or both
- full-time conversion fee
- invoice timing
- talent payout timing
- tax-document support at launch
- whether `escrow` is legally/operationally accurate
- equity/hybrid documentation approach

Deliverables:

- final fee table
- final engagement menu
- final party-obligation matrix
- final contract document model
- final terms to avoid until operationally implemented

Recommendation:

Do not continue using broad claims like `escrow-backed`, `EOR support`, or `1099s handled` until the operational flow is confirmed.

## Phase 2: Content Architecture

Purpose: make the public and in-app communication consistent.

Deliverables:

- `contracts-payments-faq` content module
- public Contracts & Payments FAQ page
- public Engagement Menu page or section
- public Role Education index
- five educational articles:
  - What Is Fractional Talent?
  - Which Role Do You Need?
  - When to Hire Each Role
  - How to Measure Success
  - Sample Engagements
- shared pricing/fee constants
- shared engagement menu constants

Recommended content structure:

```text
frontend/src/content/
  pricing.ts
  engagement-menu.ts
  contracts-payments-faq.ts
  role-education.ts
```

## Phase 3: Product UX Updates

Purpose: bring the contract/payment model into the actual product experience.

Surfaces to update:

- company page
- talent page
- company application page
- talent application page
- SOW editor/review page
- startup contracts dashboard
- operator contracts dashboard
- startup billing dashboard
- admin contracts dashboard
- admin billing dashboard

Required UX additions:

- agreement model explainer
- SOW change/version explainer
- platform fee explainer
- payment timeline explainer
- obligation checklist
- link to Contracts & Payments FAQ

## Phase 4: Backend and Schema Alignment

Purpose: make the data model support the menu being advertised.

Required work:

- expand package/service enum values or replace enum with database-managed service types
- align SOW templates to every launched engagement model
- add payment plan types for all payment models
- support addenda:
  - success-fee addendum
  - hybrid cash + equity addendum
  - full-time conversion addendum
  - scope change addendum
- ensure invoice creation can support:
  - one-time sprint fee
  - monthly retainer
  - milestone schedule
  - success fee
  - platform fee
  - conversion fee
- ensure role-based access controls remain correct for startup, operator, and admin users

## Phase 5: Legal and Compliance Review

Purpose: prevent product copy from promising legal/accounting capabilities BridgeScale cannot yet deliver.

Review required:

- tri-party agreement structure
- SOW template
- payment flow
- non-circumvention clause
- IP and confidentiality language
- tax-document statements
- international contractor statements
- EOR references
- equity/FAST references
- full-time conversion fee
- refund/credit rules

Deliverables:

- approved legal copy
- approved FAQ copy
- approved agreement/SOW naming
- approved prohibited-terms list

## Phase 6: QA and Launch Readiness

Purpose: ensure the journey is coherent.

QA checklist:

- public pages use one engagement menu
- FAQ and application pages use one fee structure
- SOW screen uses BridgeScale naming
- contracts dashboard links to FAQ
- billing dashboard explains invoices and timing
- all services have SOW templates
- all services have payment logic
- all services have success metrics
- all services have party obligations
- no user-facing `Antigravity` references
- no stale `$100` vs `₹8,500` fee mismatch
- no unconfirmed `1099` or `escrow` promise

## Recommended Sequence

1. Approve engagement menu and fee model.
2. Create shared content constants.
3. Add Contracts & Payments FAQ.
4. Replace scattered FAQ/payment copy with shared content.
5. Update SOW and contracts screens.
6. Expand SOW templates and payment plan types.
7. Add role education pages.
8. Perform legal/compliance review.
9. QA full company and talent journeys.
