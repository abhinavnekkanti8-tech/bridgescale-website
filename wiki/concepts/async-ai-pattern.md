# Concept: Async AI Pattern

*Cross-cuts: ai-services · applications · engagements · matching*

---

## The pattern

All AI calls in the platform are fire-and-forget. They never block an HTTP response and never throw to the caller:

```ts
// In ApplicationsService.createApplication:
this.aiWorkflow
  .generatePreScreenForApplication(application.id)
  .catch((err) => this.logger.error(`Failed to trigger pre-screen: ${err.message}`));
// ← returns immediately; HTTP response is sent
```

---

## Where it applies

| Trigger | AI action |
|---------|-----------|
| Company signup | `generateDiagnosisForApplication` (after matching unlock) |
| Talent signup with assessment | `generatePreScreenForApplication` |
| Talent completes assessment | `generatePreScreenForApplication` |
| Talent signup / completeReferences | `runCrossVerifyForApplication` (reference check) |
| Engagement closeout | AI closeout report generation |

---

## Why fire-and-forget

- AI calls can take 5–30 seconds — too long to block a signup or payment confirmation response
- Failures are logged but don't affect the user's flow
- All AI results are idempotent — safe to retry or run multiple times (checked by existence of existing record)

---

## Idempotency guard

Before calling AI, the workflow service checks for an existing result:
```ts
const existingDiagnosis = await this.prisma.needDiagnosis.findUnique({ where: { applicationId } });
if (existingDiagnosis) { return; }
```
This means re-triggering (e.g., webhook retry) won't duplicate AI records.

---

## How to check if AI ran

After triggering, the AI result appears on the application's related records:
- `application.needDiagnosis` — company diagnosis
- `application.talentPreScreen` — talent pre-screen
- `application.opportunityBrief` — opportunity brief

Query `GET /api/v1/applications/my-application` — if these relations are `null`, the AI hasn't run yet (or failed silently).

---

## Debugging AI failures

Since errors are swallowed, failures only show in logs:
1. Check NestJS logs for `Failed to generate diagnosis` / `Failed to trigger pre-screen`
2. Check `ANTHROPIC_API_KEY` is set
3. Check the `NeedDiagnosis` / `TalentPreScreen` tables for the applicationId
4. Safe to manually re-trigger by calling the workflow methods directly (they're idempotent)
