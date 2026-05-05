# Repo Change Requirements

## Objective

Update the BridgeScale repo so the product, copy, legal flows, and service menu consistently communicate a Knex-style engagement model adapted for BridgeScale:

> BridgeScale diagnoses the commercial need, matches the right diaspora GTM operator, generates an engagement-specific SOW, manages signatures, invoices, payments, compliance records, and supports delivery through closeout.

## Required Product Model Changes

### 1. Adopt Standard Agreement + Editable SOW

Current state:

- The repo has SOW generation, editing, versions, signatures, contracts, document logs, contact unlock, invoices, and admin payment plan surfaces.
- User-facing copy still references `Antigravity Master Services Agreement` in the SOW screen.
- The legal model is not explained clearly to users.

Required changes:

- Rename all user-facing agreement references to `BridgeScale Master Services Agreement`.
- Explain that every engagement has:
  - one standard tri-party agreement
  - one engagement-specific SOW
  - optional SOW addenda for changes
- Treat the SOW as the collaborative document.
- Treat the standard agreement as the fixed relationship document.
- Add a short agreement explanation block to:
  - SOW review page
  - startup contracts dashboard
  - operator contracts dashboard
  - admin contracts dashboard
  - public FAQ

Suggested terminology:

- `BridgeScale Master Services Agreement`
- `Engagement SOW`
- `SOW Addendum`
- `Change Order`
- `Full-Time Conversion Addendum`
- `Success-Fee Addendum`
- `Hybrid Cash + Equity Addendum`

### 2. Create Contracts & Payments FAQ

Current state:

- `frontend/src/content/faq.ts` has general company/talent FAQs.
- There is no dedicated contracts/payments FAQ.
- Pricing and fee language is inconsistent across README, public pages, and application flows.

Required changes:

- Create a dedicated content module for contracts/payments FAQ.
- Add a public page, recommended route: `/contracts-payments-faq`.
- Link it from:
  - public nav or footer
  - company page FAQ area
  - talent page FAQ area
  - SOW editor
  - startup contracts dashboard
  - operator contracts dashboard
  - billing dashboard
  - terms page

FAQ sections required:

- Agreement structure
- Signing flow
- SOW changes
- Payment flow
- Platform fees
- Invoices and receipts
- Compliance and tax documents
- IP and confidentiality
- Non-circumvention
- Full-time conversion
- Termination and rematch

### 3. Normalize Pricing and Fee Language

Current state:

- Company unlock fee appears as `₹8,500` in the apply flow and README.
- Company FAQ mentions `$100`.
- Talent unlock fee is `$50`.
- Platform fee is described as `10%`, but it is not always clear whether it is added to the company invoice or deducted from talent compensation.

Required changes:

- Create one source of truth for fees in code and content.
- Recommended file: `frontend/src/content/pricing.ts` or shared content constant.
- Backend should use matching constants or database-backed configuration.
- All public and in-app text should reference the same values.

Required fee fields:

- company unlock fee
- talent active-pool unlock fee
- platform fee percentage
- platform fee payer
- fee credit/refund rule
- currency display by market
- payment processor by flow

### 4. Build a Renewed Engagement Menu

Current state:

- Public pages communicate six models:
  - consultation
  - sprint
  - retainer
  - success-fee
  - hybrid
  - full leadership
- Backend SOW templates currently operationalize a narrower set:
  - pipeline sprint
  - BD sprint
  - fractional retainer

Required changes:

- Align the public menu, SOW templates, package types, payment plan types, and FAQ.
- Launch with all models, but distinguish standard models from addendum-heavy models.

Required package/service types:

- Free Intro Consultation
- Market Entry Diagnostic
- Pipeline Sprint
- Partnership / BD Sprint
- Fractional Sales Leadership Retainer
- Revenue Operations Sprint
- Customer Success / Expansion Sprint
- Success-Fee Engagement
- Hybrid Cash + Equity Engagement
- Full-Time Conversion

### 5. Create Role, Outcome, and Service Education

Current state:

- BridgeScale communicates roles, outcomes, and offerings, but they are mixed together.
- Buyers may not know what fractional talent means or which role they need.

Required changes:

- Create education content that maps:
  - buyer outcome
  - service package
  - role category
  - expected deliverables
  - success metrics
- Recommended public content routes:
  - `/learn/what-is-fractional-talent`
  - `/learn/which-role-do-you-need`
  - `/learn/when-to-hire-each-role`
  - `/learn/how-to-measure-success`
  - `/learn/sample-engagements`

### 6. Update Contracting, Payment, Compliance, Invoice, and Tax Copy

Current state:

- BridgeScale says it handles contracting, cross-border payments, compliance, EOR support, invoices, and milestone tracking.
- Details are not consistently explained.
- 1099/tax-document responsibilities are not clearly defined.

Required changes:

- Add precise, jurisdiction-aware language.
- Avoid overpromising EOR, escrow, or 1099 issuance unless operationally confirmed.
- Use `tax documents` as the general phrase unless US 1099 support is explicitly implemented.
- Sync every statement with the engagement menu.

### 7. Remove Brand and Legacy Mismatches

Current state:

- Some user-facing text says `Antigravity`.
- Docs and code may still carry legacy terms.

Required changes:

- Replace user-facing `Antigravity` references with `BridgeScale`.
- Keep internal historical names only if required by code, but never show them to users.
- Normalize `SOW`, `SoW`, and `Statement of Work` usage.

Recommended usage:

- Use `SOW` in headings and body copy.
- Use `Statement of Work (SOW)` on first mention.

## Primary Files Likely Affected

Public content:

- `frontend/src/app/page.tsx`
- `frontend/src/app/for-companies/page.tsx`
- `frontend/src/app/for-talent/page.tsx`
- `frontend/src/content/faq.ts`
- `frontend/src/app/about/page.tsx`
- `frontend/src/app/terms/page.tsx`
- `frontend/src/app/privacy/page.tsx`

Application and dashboard flows:

- `frontend/src/app/for-companies/apply/page.tsx`
- `frontend/src/app/for-talent/apply/page.tsx`
- `frontend/src/app/contracts/sow/page.tsx`
- `frontend/src/app/startup/contracts/page.tsx`
- `frontend/src/app/operator/contracts/page.tsx`
- `frontend/src/app/startup/billing/page.tsx`
- `frontend/src/app/admin/contracts/page.tsx`
- `frontend/src/app/admin/billing/page.tsx`

Backend services and schema:

- `backend/prisma/schema.prisma`
- `backend/src/contracts/contracts.service.ts`
- `backend/src/contracts/sow-templates.service.ts`
- `backend/src/payments/payments.service.ts`
- `backend/src/applications/applications.service.ts`
- `backend/src/legal/legal.constants.ts`

Docs:

- `README.md`
- `Docs/FAQ_DRAFT.md`
- `Docs/DOCS_AUDIT_AND_FEATURE_FLOWS.md`
- `Docs/GITHUB_REPO_PARTIAL_AND_NOT_BUILT.md`

## Definition of Done

- A user can explain the BridgeScale engagement model after reading one page.
- All public and in-app fee language matches.
- The SOW screen explains the standard agreement + editable SOW model.
- All engagement menu items have matching SOW/payment/legal language.
- Contract/payment/compliance FAQ exists and is linked from relevant surfaces.
- Role education maps outcomes to services and services to roles.
- No user-facing `Antigravity` references remain.
