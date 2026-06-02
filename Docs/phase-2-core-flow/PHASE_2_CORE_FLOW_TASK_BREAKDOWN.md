# Phase 2 Core Flow Task Breakdown

## Plain-English Overview

Phase 2 turns the Phase 1 foundation into one working test engagement flow on dev.

The goal is not to make the legal, finance, tax, payout, or EOR machinery production-ready. The goal is to prove that BridgeScale can move one company and one operator through the core journey:

`company signup -> diagnosis/match -> unlock -> call request -> mutual intent -> Pre-SOW Summary -> MSA -> SOW -> signed contract -> engagement workspace`

For now, documents are placeholders, signatures are manual typed signature IDs, and payments can use dummy/local behavior.

## Core Flow Checklist

| Step | Founder-friendly meaning | Engineering deliverable | Done when |
| --- | --- | --- | --- |
| 1. Operator readiness | Show whether talent is ready for matching, MSA, and payout. | Operator gate UI/API plus placeholder tax profile controls. | Operator dashboard can show missing readiness items. |
| 2. Unlock flow cleanup | Keep the unlock prices consistent. | Company unlock remains INR 8,500; operator unlock remains USD 50. | Backend tests protect those amounts. |
| 3. Call request | Let a company request a call with a selected operator. | Call request model and API. | Operator can accept or decline a call request. |
| 4. Engagement intent | Capture whether both sides want to proceed. | Intent model and API. | Pre-SOW cannot be created until both sides indicate intent. |
| 5. Pre-SOW Summary | Create the commercial alignment record before contracts. | Structured Pre-SOW Summary model/API. | Both sides can confirm the same summary. |
| 6. MSA | Create one MSA per company/operator pair. | MSA service and manual signature API. | Duplicate MSAs are blocked and signatures update status. |
| 7. SOW v1 | Generate SOW from the confirmed summary and ServiceTemplate. | DB-backed SOW generation from summary. | SOW version 1 is created without hardcoded package template logic. |
| 8. Cancellation/conversion | Track cancellations and full-time conversion. | Cancellation events and lifecycle events. | Cancellation and conversion are visible in the database. |
| 9. Engagement workspace | Start the delivery workspace. | Reuse existing engagement initialization. | Fully signed contract can become an active engagement. |

## Backend/API Tasks

- Add core-flow models for calls, engagement intents, and Pre-SOW summaries.
- Add `POST /api/v1/operator-tax-profile` for placeholder readiness data.
- Add call APIs: request, respond, and outcome.
- Add intent API for company/operator engagement intent.
- Add Pre-SOW APIs: create and confirm.
- Add MSA APIs: find/create and sign.
- Add SOW API: generate from confirmed Pre-SOW Summary.
- Add cancellation API for SOWs.
- Add conversion API for engagements.

## Frontend/Dashboard Tasks

- Show the Phase 1 readiness gate on the operator dashboard.
- Add simple controls for tax residency, payout country, payout currency, and placeholder document status.
- Keep unlock CTAs using INR 8,500 for companies and USD 50 for operators.
- Add admin/dev surfaces later if needed; Phase 2 can be validated through API and existing dashboards first.

## Test Scenario

Use one company and one operator on dev:

1. Company signs up.
2. Operator signs up and becomes matching-ready.
3. A shortlist/match exists.
4. Company unlocks matching.
5. Company requests a call.
6. Operator accepts.
7. Both sides indicate engagement intent.
8. Pre-SOW Summary is created and confirmed.
9. MSA is created and signed.
10. SOW is generated and signed.
11. Engagement workspace becomes active.

## Founder Review Checklist

- Can I see the call request?
- Can I see both sides saying they want to proceed?
- Can I see a Pre-SOW Summary before contracts?
- Can one company/operator pair reuse the same MSA?
- Can I manually sign the MSA and SOW in dev?
- Can the signed contract become an active engagement?
- Are legal/finance/payment/EOR items still clearly placeholder-only?

## Intentionally Manual or Placeholder

- Placeholder MSA/SOW/Pre-SOW content.
- Manual typed signature IDs.
- Dummy/local payment behavior.
- No live payouts.
- No live Stripe Connect.
- No Wise.
- No EOR providers.
- No legal enforceability automation.

