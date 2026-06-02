# Task Breakdown

## Epic 1: Commercial Model Finalization

### Task 1.1: Confirm Fee Model

Owner: Founder / Product / Finance

Decisions:

- company unlock fee
- talent unlock fee
- platform fee percentage
- platform fee payer
- platform fee credit/refund rule
- full-time conversion fee

Acceptance criteria:

- One fee table exists.
- All rows include amount, currency, trigger event, payer, refund/credit rule, and downstream unlock.

### Task 1.2: Confirm Payment Flow

Owner: Product / Finance / Engineering

Decisions:

- company invoice timing
- operator payout timing
- payment processor by flow
- whether BridgeScale collects before talent starts
- whether payouts require milestone approval

Acceptance criteria:

- Payment flow diagram is approved.
- Copy can truthfully explain who pays whom and when.

### Task 1.3: Confirm Tax and Compliance Language

Owner: Legal / Finance

Decisions:

- whether BridgeScale issues 1099s
- whether a payment partner issues tax documents
- whether international tax documents are supported
- whether EOR support is included, optional, or partner-led

Acceptance criteria:

- Approved language exists for US and non-US talent.
- Product copy avoids unapproved tax promises.

## Epic 2: Shared Content System

### Task 2.1: Add Pricing Constants

Files:

- `frontend/src/content/pricing.ts`

Acceptance criteria:

- All public pricing copy uses the shared constants.
- Company unlock fee is consistent everywhere.
- Talent unlock fee is consistent everywhere.

### Task 2.2: Add Engagement Menu Constants

Files:

- `frontend/src/content/engagement-menu.ts`

Acceptance criteria:

- Every launched service has:
  - name
  - buyer outcome
  - ideal customer
  - role categories
  - duration
  - payment model
  - deliverables
  - success metrics
  - contract documents required

### Task 2.3: Add Contracts & Payments FAQ Content

Files:

- `frontend/src/content/contracts-payments-faq.ts`

Acceptance criteria:

- FAQ includes all required sections.
- FAQ language is synced with approved fee and contract model.

## Epic 3: Public Page Updates

### Task 3.1: Update Company Page

Files:

- `frontend/src/app/for-companies/page.tsx`

Acceptance criteria:

- Engagement menu is simplified and pulled from shared content.
- Page explains standard agreement + editable SOW model.
- Page links to Contracts & Payments FAQ.

### Task 3.2: Update Talent Page

Files:

- `frontend/src/app/for-talent/page.tsx`

Acceptance criteria:

- Talent page explains paid/scoped work through service models.
- Talent obligations and payout timing are summarized.
- Talent page links to Contracts & Payments FAQ.

### Task 3.3: Update Landing Page

Files:

- `frontend/src/app/page.tsx`

Acceptance criteria:

- Landing page communicates outcomes first, then services.
- Role names are no longer mixed randomly with service categories.

## Epic 4: Contracts & Payments FAQ Page

### Task 4.1: Build Public FAQ Route

Files:

- `frontend/src/app/contracts-payments-faq/page.tsx`
- `frontend/src/app/contracts-payments-faq/page.module.css`

Acceptance criteria:

- Page renders FAQ groups.
- Page includes agreement model summary.
- Page includes payment flow summary.
- Page includes links to terms/privacy.

### Task 4.2: Link FAQ Across Product

Files:

- marketing nav/footer
- SOW editor
- contracts dashboards
- billing dashboard

Acceptance criteria:

- Users can access FAQ before signing or paying.

## Epic 5: SOW and Contract UX

### Task 5.1: Replace Legacy Agreement Copy

Files:

- `frontend/src/app/contracts/sow/page.tsx`
- `backend/src/contracts/contracts.service.ts`

Acceptance criteria:

- No user-facing `Antigravity` reference remains.
- SOW screen references `BridgeScale Master Services Agreement`.

### Task 5.2: Add Agreement Model Explainer

Files:

- `frontend/src/app/contracts/sow/page.tsx`
- `frontend/src/app/startup/contracts/page.tsx`
- `frontend/src/app/operator/contracts/page.tsx`

Acceptance criteria:

- Users see the relationship between agreement, SOW, addendum, and signatures.

### Task 5.3: Add SOW Change Guidance

Acceptance criteria:

- Users understand that changes create a new version.
- Users understand when re-approval or re-signing is required.

## Epic 6: Engagement Menu Backend Alignment

### Task 6.1: Expand Service/Package Types

Files:

- `backend/prisma/schema.prisma`

Acceptance criteria:

- All launched engagement models are representable.

### Task 6.2: Add SOW Templates for All Services

Files:

- `backend/src/contracts/contracts.service.ts`
- `backend/src/contracts/sow-templates.service.ts`

Acceptance criteria:

- Every engagement menu item can generate a draft SOW.
- Every SOW includes scope, deliverables, timeline, hours, price, reporting cadence, and payment terms.

### Task 6.3: Add Addendum Support

Acceptance criteria:

- Success-fee terms can be attached.
- Hybrid cash + equity terms can be attached.
- Full-time conversion terms can be attached.
- Scope changes can be versioned or attached as addenda.

## Epic 7: Payment and Invoice Alignment

### Task 7.1: Expand Payment Plan Types

Files:

- `backend/prisma/schema.prisma`
- `backend/src/payments/payments.service.ts`

Acceptance criteria:

- Payment plans support all engagement models.

### Task 7.2: Add Platform Fee Handling

Acceptance criteria:

- Invoice can show talent fee and BridgeScale platform fee separately if fee is charged to company.
- If fee is deducted from talent payout, UI says so clearly.

### Task 7.3: Add Invoice Explanation UI

Files:

- `frontend/src/app/startup/billing/page.tsx`
- `frontend/src/app/admin/billing/page.tsx`

Acceptance criteria:

- Billing page explains invoice status, due date, payment method, and payout dependency.

## Epic 8: Role and Category Education

### Task 8.1: Create Education Content

Files:

- `frontend/src/content/role-education.ts`

Acceptance criteria:

- Role pages explain fractional talent in founder-friendly language.

### Task 8.2: Build Learn Pages

Routes:

- `/learn/what-is-fractional-talent`
- `/learn/which-role-do-you-need`
- `/learn/when-to-hire-each-role`
- `/learn/how-to-measure-success`
- `/learn/sample-engagements`

Acceptance criteria:

- Each article maps services, roles, outcomes, and metrics.

## Epic 9: Documentation Updates

### Task 9.1: Update README

Acceptance criteria:

- README fee and flow descriptions match product.

### Task 9.2: Update Internal Docs

Acceptance criteria:

- Existing docs do not conflict with the approved service model.

## Epic 10: QA

### Task 10.1: Text Consistency Audit

Search terms:

- `Antigravity`
- `$100`
- `₹8,500`
- `₹15,000`
- `10%`
- `escrow`
- `1099`
- `EOR`
- `FAST`

Acceptance criteria:

- Every usage is approved and accurate.

### Task 10.2: Golden Path QA

Flows:

- company signup to unlock to SOW to contract to invoice
- talent signup to approval to match to SOW to contract to payout explanation
- admin SOW/payment plan/invoice flow

Acceptance criteria:

- User can understand what happens next at every stage.
