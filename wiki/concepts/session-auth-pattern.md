# Concept: Session Auth Pattern

*Cross-cuts: auth · applications · frontend-startup · frontend-operator · admin-portal*

---

## How it works end-to-end

```
Browser                          NestJS
  │                                │
  ├─ POST /api/v1/applications ───→ creates session: req.session.user = { id, role, orgId, ... }
  │  (or POST /auth/login)         saves session → cookie set in response
  │
  ← Set-Cookie: connect.sid ──────┤
  │                                │
  ├─ GET /api/v1/applications/     SessionAuthGuard reads req.session.user
  │   my-application               ← throws 401 if missing
  │   credentials: 'include'       ← browser sends cookie automatically
```

---

## Guards

**`SessionAuthGuard`:**
- Checks `req.session?.user` exists
- Returns 401 if missing
- Must be the FIRST guard when combining with `RolesGuard`

**`RolesGuard`:**
- Reads `@Roles(MembershipRole.PLATFORM_ADMIN)` metadata
- Compares `req.session.user.role` against allowed roles
- Always apply AFTER `SessionAuthGuard`: `@UseGuards(SessionAuthGuard, RolesGuard)`

**`@CurrentUser()` decorator:**
- Extracts `req.session.user` as `SessionUser`
- Returns `null` if no session — controllers check defensively

---

## Session shape

```ts
interface SessionUser {
  id: string;           // User.id
  name: string;
  email: string;
  role: MembershipRole; // STARTUP_ADMIN | OPERATOR | PLATFORM_ADMIN | DEAL_DESK
  orgId: string;        // Membership.orgId
  status: UserStatus;   // ACTIVE | PENDING_APPROVAL | SUSPENDED | INACTIVE
}
```

---

## Frontend pattern

All authenticated API calls:
```ts
fetch('/api/v1/some-endpoint', {
  method: 'GET',
  credentials: 'include',  // ← required, sends session cookie
})
```

After signup: `window.location.href = '/startup/dashboard'` (NOT Next.js router) to force a full page reload and ensure the cookie is registered by the browser before subsequent requests.

---

## Common mistakes

- Using `router.push()` after signup instead of `window.location.href` — can miss the cookie
- Forgetting `credentials: 'include'` on fetch — session not sent, 401 returned
- Applying `RolesGuard` without `SessionAuthGuard` — role check runs on undefined user
- Checking `user.status === 'ACTIVE'` in auth — `PENDING_APPROVAL` users have valid sessions and can browse dashboards
