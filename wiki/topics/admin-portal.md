# Admin Portal

*Sources: `frontend/src/app/admin/` · `backend/src/approvals/` · `backend/src/analytics/` · `backend/src/common/guards/`*

---

## Purpose
[coverage: medium]

The platform admin interface for managing applications, users, matching, contracts, billing, and analytics. Accessible to users with role `PLATFORM_ADMIN` (and `DEAL_DESK` for some views). All admin routes require both `SessionAuthGuard` and `RolesGuard`.

---

## Architecture
[coverage: medium]

```
Frontend: /admin/* routes (Next.js App Router)
  └── calls backend API with session cookie (credentials: 'include')

Backend:
  SessionAuthGuard + RolesGuard(@PLATFORM_ADMIN) on all admin endpoints
  ApprovalsController / ApprovalsService   ← application review workflow
  AnalyticsController / AnalyticsService   ← platform metrics
```

---

## API Surface (Frontend Routes)
[coverage: high]

| Route | Purpose |
|-------|---------|
| `/admin/dashboard` | Overview metrics, recent activity |
| `/admin/applications` | Application list + review queue |
| `/admin/applications/[id]/diagnosis` | View + edit AI need diagnosis |
| `/admin/applications/[id]/prescreen` | View talent pre-screen result |
| `/admin/matching` | Generate and manage match shortlists |
| `/admin/operators` | Operator list, verification, tier management |
| `/admin/startups` | Startup list, profile management |
| `/admin/contracts` | Contract oversight |
| `/admin/deal-desk` | Deal desk view (DEAL_DESK role) |
| `/admin/billing` | Invoice management |
| `/admin/sow-templates` | SOW template library |
| `/admin/sow-templates/[id]` | Template editor |
| `/admin/discovery` | Discovery call scheduling |
| `/admin/analytics` | Platform-wide metrics |
| `/admin/escalations` | Open escalation cases |
| `/admin/settings` | Platform settings |

---

## Data
[coverage: medium]

**Application review actions (backend endpoints):**
- `PATCH /api/v1/applications/:id/status` — manual status override
- `POST /api/v1/applications/:id/schedule-interview` — sets `INTERVIEW_SCHEDULED` + date/location
- `POST /api/v1/applications/:id/approve` — sets `APPROVED`, activates user account
- `POST /api/v1/applications/:id/reject` — sets `REJECTED` with mandatory reason

**Approvals module** (`/api/v1/approvals`): Additional multi-step approval workflow layer on top of application status updates.

**Analytics** (`/api/v1/analytics`): Platform-wide counts and metrics (application volume, conversion rates, engagement health, etc.).

---

## Key Decisions
[coverage: medium]

**Admin approval activates user:** `approveApplication` sets `User.status = ACTIVE` if it was `PENDING_APPROVAL`. This is the gate that lets approved users access full platform features.

**`DEAL_DESK` role:** A separate role from `PLATFORM_ADMIN` for staff who handle contracts and billing without full admin access. Check `RolesGuard` decorators on specific endpoints for which roles are allowed.

**Diagnosis review workflow:** AI-generated `NeedDiagnosis` starts as `DRAFT_AI`. Admin can edit it (`humanEditedContent`) and promote through `UNDER_REVIEW → READY_FOR_CLIENT → APPROVED`. Only `APPROVED` diagnoses are shown to companies.

---

## Gotchas
[coverage: low]

- Admin routes have no shared layout authentication check in the frontend — each admin page independently checks the session. A missing `SessionAuthGuard` on a backend endpoint would expose it.
- The `/admin/applications/[id]/diagnosis` page needs the `applicationId` to fetch both the application and its `needDiagnosis` relation — make sure `getMyApplication` or a dedicated admin endpoint returns both.
- `ApprovalsService` and `ApplicationsService` both have approval logic — ensure they're not duplicating state changes.
