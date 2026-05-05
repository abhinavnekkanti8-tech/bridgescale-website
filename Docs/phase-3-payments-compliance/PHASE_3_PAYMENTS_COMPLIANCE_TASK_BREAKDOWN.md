# Phase 3 Payments and Compliance Skeleton

## Plain-English Overview

Phase 3 builds the money-and-compliance tracking structure without moving real money.

The goal is to let BridgeScale see, for a test engagement:

`invoice amount -> platform fee -> operator payout placeholder -> compliance mode -> tax status -> payout readiness`

This is backend-first. No product UI is included in this phase.

## What This Phase Builds

| Area | Founder-friendly meaning | Engineering deliverable | Done when |
| --- | --- | --- | --- |
| Payment ledger | One place to see how money splits. | Ledger snapshot for company invoice, platform fee, operator payout, and optional EOR fee. | Admin API returns the split for a contract. |
| Provider skeletons | Prepare Stripe/Razorpay/Wise without live API calls. | Dummy provider router records what would happen. | API can create placeholder payout attempts. |
| Tax/compliance status | Track whether an operator is payout-ready. | Reuse operator tax profile and compliance decision logs. | Admin status shows tax status and compliance mode. |
| Compliance resolver | Simple placeholder rules, not legal advice. | Rule-based resolver returns contractor/review/EOR/block modes. | Resolver output is stored in audit log. |
| Admin review | Let founder/admin manually approve or block. | Admin review status on ledger. | Admin can mark reviewed, approved, blocked, or ready. |
| FX placeholder | Store billing/payout currencies and FX rate. | Existing payment plan currency fields plus ledger snapshot. | No real FX conversion is performed. |

## Founder Review Checklist

- Can I see the full payment split for a contract?
- Can I see the operator payout placeholder?
- Can I see whether tax documents are verified?
- Can I see the compliance mode?
- Can I manually mark the payment/compliance review status?
- Are all provider actions clearly dummy/skeleton only?

## Intentionally Out of Scope

- No live Stripe Connect payouts.
- No live Wise transfers.
- No live Razorpay payouts.
- No real EOR provider integration.
- No legal/tax advice automation.
- No production finance reconciliation.
- No frontend/admin UI changes.

