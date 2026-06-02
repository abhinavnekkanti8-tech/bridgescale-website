# Contracting, Payments, Compliance, Invoices, Tax Documents, and Obligations

## Purpose

This document drafts the operational language BridgeScale should use for contracting, payments, compliance, invoices, tax documents, and obligations.

It is designed to sync with the full engagement menu. It is not final legal advice.

## Recommended Contract Model

BridgeScale should adopt a tri-party model adapted from Knex:

1. BridgeScale
2. Company
3. Operator / Talent

Every paid engagement should have:

- BridgeScale Master Services Agreement
- Engagement-specific SOW
- optional addendum when needed

## Document Stack by Engagement Type

| Engagement Type | Required Documents | Optional Documents |
|---|---|---|
| Free Intro Consultation | Platform Terms | NDA if needed |
| Market Entry Diagnostic | Platform Terms or Diagnostic SOW | NDA |
| Pipeline Sprint | Master Services Agreement + SOW | Success-Fee Addendum |
| Partnership / BD Sprint | Master Services Agreement + SOW | Success-Fee Addendum |
| Revenue Operations Sprint | Master Services Agreement + SOW | Data Access Addendum |
| Customer Success / Expansion Sprint | Master Services Agreement + SOW | Data Access Addendum |
| Fractional Sales Leadership Retainer | Master Services Agreement + SOW | Renewal Addendum |
| Success-Fee Engagement | Master Services Agreement + SOW + Success-Fee Addendum | Revenue Verification Addendum |
| Hybrid Cash + Equity Engagement | Master Services Agreement + SOW + Hybrid Addendum | FAST or equity-specific legal docs |
| Full-Time Conversion | Conversion Addendum | Employment offer docs handled outside BridgeScale |

## Standard Agreement Explanation

Suggested user-facing copy:

> BridgeScale uses a standard agreement structure for every paid engagement. The Master Services Agreement sets the relationship rules between BridgeScale, the company, and the operator. The SOW defines the specific work for the engagement: scope, deliverables, timeline, fees, reporting cadence, and payment terms. If the work changes, the SOW is updated through a new version or addendum.

## Payment Flow

### Recommended Default Payment Flow

1. Company approves SOW.
2. Company and operator sign.
3. BridgeScale issues invoice according to the SOW.
4. Company pays BridgeScale.
5. BridgeScale records payment.
6. Operator begins or continues work according to SOW terms.
7. BridgeScale pays operator according to the agreed payout schedule.
8. Invoice, receipt, and payment records remain available in the platform.

### User-Facing Summary

> For paid engagements, the company pays BridgeScale based on the signed SOW. BridgeScale pays the operator according to the agreed payout schedule after payment is received and any required milestone approvals are complete.

### Important Language Decision

Use `milestone-based payment workflow` unless BridgeScale has a legally valid escrow arrangement.

Avoid saying:

- escrow-backed
- escrow account
- funds held in escrow

unless legal and payment operations confirm this is true.

## Invoices

### What BridgeScale Should Communicate

> BridgeScale issues invoices to the company for engagement fees, platform fees, and any approved addendum fees. Companies can view invoice status, due dates, receipts, and payment history in the billing dashboard.

### Invoice Types

| Invoice Type | Applies To | Trigger |
|---|---|---|
| Unlock fee invoice/payment | company matching unlock | company unlocks matches |
| Sprint invoice | fixed-fee sprint | SOW signed or milestone date |
| Monthly retainer invoice | retainer | before each service month |
| Success-fee invoice | success-fee engagement | qualifying success event |
| Hybrid cash invoice | hybrid engagement | SOW schedule |
| Platform fee invoice | all paid cash engagements | same as engagement invoice or separate line item |
| Conversion fee invoice | full-time conversion | signed employment/conversion event |

## Platform Fee

### Required Decision

BridgeScale must decide whether the 10% platform fee is:

1. added to the company invoice on top of operator compensation
2. deducted from operator compensation
3. split between company and operator

### Recommended Model

For clarity and talent trust:

> Company pays the operator fee plus BridgeScale's platform fee. The platform fee does not reduce the operator's stated compensation unless explicitly agreed in the SOW.

### Suggested Copy

> BridgeScale charges a platform fee on paid cash engagements. This covers vetting, matching, SOW generation, contracting workflow, payment administration, document records, and engagement support. Unless the SOW says otherwise, this fee is added to the company invoice and does not reduce the operator's stated fee.

## Talent Payouts

### Suggested Copy

> Operator payouts are made according to the signed SOW. For fixed sprints, payout may be tied to the project schedule or milestone approval. For monthly retainers, payout typically follows company payment and the agreed monthly cadence. Cross-border payment timing may vary by banking provider, currency, and country.

### Required Product Fields

For each SOW/payment plan:

- payout schedule
- payout trigger
- payout currency
- payment method
- milestone approval requirement
- payment delay disclaimer

## Tax Documents and 1099s

### Current Risk

BridgeScale should not promise `1099s handled` unless operationally implemented.

### Recommended General Language

> BridgeScale maintains engagement, invoice, and payment records for platform transactions. Tax documentation depends on the operator's jurisdiction, payment provider, and engagement structure. Where applicable and operationally supported, BridgeScale or its payment partners may provide required contractor payment documentation. Operators remain responsible for their own tax reporting unless otherwise stated in writing.

### If US 1099 Support Is Implemented

Use:

> For eligible US-based operators paid through BridgeScale, BridgeScale or its payment partner may issue required US tax forms, such as Form 1099, where legally required.

### If Not Implemented

Use:

> BridgeScale does not currently provide tax advice or guarantee issuance of jurisdiction-specific tax forms. Operators and companies should consult their own tax advisors.

## Compliance

### What BridgeScale Can Safely Say

> BridgeScale supports compliance by standardizing engagement documentation, recording SOW versions, logging signature and document actions, maintaining invoice/payment records, and helping both parties define scope, confidentiality, non-circumvention, and payment obligations.

### What Needs Caution

Avoid broad claims like:

- We handle all compliance.
- We handle all contractor compliance globally.
- We handle all tax compliance.
- We are the employer of record.

unless legally and operationally confirmed.

### Recommended EOR Language

If EOR is not directly implemented:

> For engagements that require employer-of-record or specialized local compliance support, BridgeScale may refer the parties to approved partners or require additional documentation before the engagement can proceed.

## Company Obligations

The company should agree to:

- provide accurate company and billing information
- complete intake truthfully
- review SOW before approval
- pay invoices on time
- provide reasonable access to systems, context, and stakeholders required for the work
- review milestones and deliverables promptly
- maintain confidentiality of operator information
- not circumvent BridgeScale
- not solicit or hire operator outside the agreed conversion process
- respect agreed working hours and scope
- obtain written approval before using operator name, profile, or case study

## Operator Obligations

The operator should agree to:

- provide truthful experience, reference, and credential information
- disclose conflicts of interest
- perform work described in the SOW
- communicate progress according to the SOW cadence
- maintain confidentiality
- protect company data and access credentials
- not circumvent BridgeScale
- not subcontract without approval if prohibited by SOW
- use company logos, names, or case studies only with written approval
- maintain their own tax and professional obligations unless otherwise agreed

## BridgeScale Obligations

BridgeScale should commit to:

- provide the platform and workflow
- facilitate intake, diagnosis, and matching
- support talent vetting
- generate or support SOW creation
- maintain SOW version history
- maintain signature/document action logs
- issue or support invoices according to the platform workflow
- maintain payment records
- support rematch or escalation when appropriate
- maintain reasonable privacy and security practices
- clarify platform fees before payment

BridgeScale should not overcommit to:

- guaranteeing sales outcomes
- guaranteeing revenue
- guaranteeing tax treatment
- guaranteeing immigration/employment status
- acting as legal counsel
- acting as tax advisor
- acting as employer of record unless separately documented

## IP and Work Product

Suggested copy:

> Unless the SOW or agreement says otherwise, deliverables created specifically for the company under a paid engagement belong to the company after full payment. Pre-existing tools, templates, frameworks, playbooks, relationships, and know-how owned by the operator remain the operator's property unless expressly transferred in writing.

## Confidentiality

Suggested copy:

> Each party must protect confidential information received during the engagement. This includes business strategy, customer data, pricing, pipeline information, financial information, product plans, and non-public operator or company information.

## Non-Circumvention

Suggested copy:

> Company and operator agree not to bypass BridgeScale to continue, expand, or recreate the engagement outside the platform during the engagement and for the restricted period defined in the agreement, unless BridgeScale gives written approval or the parties complete an approved full-time conversion process.

## Full-Time Conversion

### Required Decision

BridgeScale should define whether it charges:

- no conversion fee
- a fixed conversion fee
- a percentage of first-year compensation
- a multiple of monthly retainer

### Recommended Model for Evaluation

> Companies may hire an operator full-time through an approved conversion process. If a company hires an operator introduced through BridgeScale during an engagement or within a defined post-engagement period, a conversion fee applies unless waived in writing.

### Required Terms

- covered period
- fee calculation
- payment due date
- triggering event
- operator consent
- exceptions

## Termination

Suggested copy:

> Termination rules are defined in the SOW. Fixed sprints may have limited cancellation rights once work has started. Monthly retainers may be terminated with the notice period stated in the SOW. Operators are paid for approved work performed up to the termination date, subject to the payment terms in the SOW.

## Rematch and Satisfaction Policy

Suggested copy:

> If a match is not the right fit, BridgeScale may support rematching according to the platform's rematch policy. Rematch support does not automatically waive amounts owed for work already performed, unless the SOW or BridgeScale's written policy states otherwise.

## FAQ Draft

### What is the BridgeScale Master Services Agreement?

It is the standard agreement that governs the relationship between BridgeScale, the company, and the operator for paid engagements.

### What is an SOW?

The Statement of Work is the engagement-specific document. It defines the service, deliverables, timeline, fees, payment schedule, reporting cadence, and special terms.

### Can the SOW be changed?

Yes. Changes should be captured through a new SOW version, change order, or addendum. Material changes may require approval or re-signing.

### Who pays whom?

The company pays BridgeScale according to the signed SOW and invoice schedule. BridgeScale pays the operator according to the payout terms once required payment and approval conditions are met.

### Does the platform fee reduce operator compensation?

Recommended answer:

No, unless the SOW says otherwise. BridgeScale's platform fee is normally added to the company invoice so the operator's stated fee remains clear.

### When does work begin?

Paid work begins after the required SOW and agreement are approved and signed, and any required upfront payment condition is satisfied.

### Who owns the work product?

Company-specific paid deliverables belong to the company after full payment. Operator pre-existing materials and know-how remain with the operator unless transferred in writing.

### Can the company hire the operator full-time?

Yes, if both sides agree and the approved conversion process is followed. A conversion fee may apply depending on BridgeScale's final policy.

### Does BridgeScale issue tax forms like 1099s?

Use the approved tax-document language from this document after legal/finance review.

### Can company and operator work outside BridgeScale?

Not for engagements introduced or managed through BridgeScale unless BridgeScale gives written approval or the parties complete the approved conversion process.

## Required Engineering Support

To support this model, the repo needs:

- service-level SOW templates
- addendum support
- payment plan types mapped to services
- platform fee line-item support
- payout schedule metadata
- invoice explanation UI
- document/action log UI
- public contracts/payments FAQ
- shared fee constants
- no legacy brand references
