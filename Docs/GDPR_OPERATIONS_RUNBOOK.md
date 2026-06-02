# BridgeScale GDPR Operations Runbook

## Purpose
This runbook defines the minimum operational process for privacy, DSAR, retention, vendor review, and incident handling on the BridgeScale platform.

## Live Processor Register
The launch processor set is:

- `Resend` for transactional email delivery.
- `Razorpay` and `Stripe` for payment processing and payment verification.
- `OpenAI` for AI-assisted diagnosis, matching support, summaries, and evaluation support.
- Hosting, database, cache, and protected document storage providers for application runtime and file storage.

## Retention Schedule
- Applications and intake submissions: retain for 24 months after final decision or last meaningful activity.
- Reference details and verification outputs: retain for 12 months after final decision or withdrawal, unless deletion is approved earlier.
- Audit logs and document-action history: retain for 36 months for accountability and dispute review.
- Contracts, invoices, and payment records: retain for 7 years from contract end or settlement.
- Uploaded CVs and supporting documents: retain for 12 months after final decision or profile withdrawal unless a legal hold applies.

## DSAR Export Workflow
Use the admin-only compliance API:

- `POST /api/v1/compliance/requests/export`
- Body:

```json
{
  "subjectEmail": "person@example.com",
  "reason": "DSAR export request"
}
```

Result:
- Returns the exported subject data payload.
- Logs a completed `EXPORT` request in `data_subject_requests`.

## DSAR Delete / Anonymization Workflow
Use the admin-only compliance API:

- `POST /api/v1/compliance/requests/delete`
- Body:

```json
{
  "subjectEmail": "person@example.com",
  "reason": "Approved deletion request"
}
```

Behavior:
- Redacts the user account where present.
- Anonymizes linked application PII.
- Clears stored references, LinkedIn URLs, case-study answers, and CV references.
- Removes stored CV files from protected uploads where present.
- Logs a completed `DELETE` request in `data_subject_requests`.

## Reference Notice Policy
- Talent users must only submit reference details they are permitted to share.
- Reference data is used only for vetting, suitability review, and dispute or audit follow-up.
- Reference verification outputs follow the same retention and deletion rules defined above.

## Third-Party Notice Policy
- Privacy and Terms pages must identify the launch processor categories.
- New processors require:
  - documented purpose
  - contractual review
  - privacy notice update if the processing purpose changes materially

## Incident Response
Within the first 24 hours:

- Confirm the scope of the incident.
- Preserve relevant logs, document actions, and supporting evidence.
- Disable affected credentials, sessions, uploads, or integrations if needed.
- Record impacted systems, data categories, and suspected exposure window.
- Escalate to legal/privacy review for notification obligations.

Within 72 hours where required:

- Decide whether regulator or user notification is required.
- Record rationale, evidence, and remediation status.
- Track corrective actions to completion.

## Retention Review
- Review retention and deletion outcomes quarterly.
- Verify that anonymization requests completed successfully.
- Confirm that stale CVs and expired application data are being handled according to policy.

## Vendor Review
- Review processor inventory at least annually and whenever a new vendor is added.
- Confirm security posture, data-processing terms, and subprocessor disclosures where relevant.
- Update the privacy notice and this runbook when the live processor set changes.
