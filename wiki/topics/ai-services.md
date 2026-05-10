# AI Services

*Sources: `backend/src/ai/` · `backend/src/diagnoses/` · `backend/src/opportunity-briefs/` · `backend/src/talent-pre-screen/` · `CLAUDE.md`*

---

## Purpose
[coverage: high]

All AI-driven automation on the platform. Three pipelines run asynchronously in the background, triggered by application events:

1. **Need Diagnosis** — analyzes a company application to produce a readiness report + recommended operator role
2. **Talent Pre-Screen** — scores a talent application on completeness, consistency, and references
3. **Opportunity Brief** — post-approval brief for matching (not yet surfaced in free-signup flow)

Cross-verification of LinkedIn/references is a fourth sub-pipeline.

---

## Architecture
[coverage: high]

```
AiWorkflowService             ← orchestrator, called by ApplicationsService
  ├── AiService               ← wraps Anthropic/Claude API calls
  │     └── prompts/          ← need-diagnosis.prompt.ts, opportunity-brief.prompt.ts,
  │                              talent-prescreen.prompt.ts
  ├── TalentPreScreenService  ← generates + persists TalentPreScreen records
  └── CrossVerifyService      ← cross-checks LinkedIn + reference emails
```

`AiService` holds the Anthropic client and the model name. All calls from `AiWorkflowService` are fire-and-forget — errors log but never propagate to the HTTP layer.

---

## Talks To
[coverage: high]

| Consumer | Trigger |
|----------|---------|
| `applications` service | Calls `generateDiagnosisForApplication` and `generatePreScreenForApplication` after signup/payment |
| `diagnoses` module | Admin-facing CRUD over `NeedDiagnosis` records |
| `opportunity-briefs` module | Admin-facing CRUD over `OpportunityBrief` records |
| `talent-pre-screen` module | Admin-facing CRUD over `TalentPreScreen` records |
| `email` service | Sends `diagnosisGenerated` notification after diagnosis completes |

---

## API Surface
[coverage: medium]

AI itself has no public HTTP surface — it's purely internal. Admin modules expose:

| Module | Route prefix | Purpose |
|--------|-------------|---------|
| `diagnoses` | `/api/v1/diagnoses` | List, view, update, approve company diagnoses |
| `opportunity-briefs` | `/api/v1/opportunity-briefs` | CRUD for opportunity briefs |
| `talent-pre-screen` | `/api/v1/talent-pre-screen` | View pre-screen results + recommended questions |

---

## Data
[coverage: high]

**`NeedDiagnosis`** (company workflow):
```
aiContent: { analysis, challenges, opportunities, recommendedRole, estimatedSprint }
humanEditedContent: admin-edited version
clientFacingContent: simplified summary sent to company
status: DRAFT_AI → UNDER_REVIEW → READY_FOR_CLIENT → APPROVED
```

**`TalentPreScreen`** (talent workflow):
```
recommendation: STRONG_PASS | PASS | CONDITIONAL | FAIL
completenessScore, consistencyScore, referenceScore, assessmentScore  (0–100 each)
redFlags: [{ type, description, severity }]
suggestedProbeQuestions: string[]
referenceVerification: [{ email, verified, confidence }]
```

**`OpportunityBrief`** (post-approval):
```
internalContent: full brief used for matching + admin
clientFacingContent: simplified version shown to company
suggestedTemplateId: soft reference to SowTemplate
```

---

## Key Decisions
[coverage: high]

**Fire-and-forget:** All AI calls are `.catch(logger.error)` — they never block the API response. This means a user can see their dashboard immediately while diagnosis runs in the background.

**Idempotent:** `generateDiagnosisForApplication` checks for an existing `NeedDiagnosis` record before calling the AI. Safe to call multiple times.

**`aiModel` stored on records:** Each AI-generated record stores the model name and prompt version for auditability and regression testing.

**Note in code:** `aiModel: 'gpt-4o'` is hardcoded in `AiWorkflowService.generateDiagnosisForApplication` but the actual service uses Claude (Anthropic SDK) via `AiService`. The hardcoded string is a metadata label bug — the real model comes from `AiService.getModelName()`.

---

## Gotchas
[coverage: medium]

- `ANTHROPIC_API_KEY` env var must be set; AI calls fail silently if missing (fire-and-forget swallows the error).
- Cross-verification runs for talent on both signup (if references provided) and after `completeReferences`. Both paths upsert the same `TalentPreScreen` row — the second upsert wins.
- `TalentPreScreen` is created lazily by `runCrossVerifyForApplication` with zeroed scores if no pre-screen exists yet. A subsequent `generatePreScreenForApplication` call will then update it.
- `CrossVerifyService.getMode()` returns the current verification mode — check this if reference verification results look like stubs.
