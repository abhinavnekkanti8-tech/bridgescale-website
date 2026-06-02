# Auth

*Sources: `backend/src/auth/` · `backend/src/common/guards/` · `backend/src/common/types/session.types.ts` · `backend/src/main.ts`*

---

## Purpose
[coverage: high]

Handles user authentication via three mechanisms: password login, magic-link login, and session-based auth guard. All state lives in an express-session cookie (`connect.sid`). There is no JWT.

---

## Architecture
[coverage: high]

```
AuthController
  └── AuthService
        ├── UsersService           (find user, touch login timestamp)
        └── PrismaService          (magic-link token lookup, membership activation)

SessionAuthGuard                   ← reads req.session.user
RolesGuard                         ← checks session role vs @Roles() decorator
CurrentUser decorator              ← extracts SessionUser from session
```

Session is configured in `main.ts` with `express-session` + Prisma session store. The session secret comes from `SESSION_SECRET` env var.

---

## Talks To
[coverage: medium]

| Module | How |
|--------|-----|
| `prisma` | User lookup by email, magic-link token, membership updates |
| `applications` | Applications service sets `req.session.user` after `createApplication` |
| `email` | Auth controller sends magic-link emails |

---

## API Surface
[coverage: high]

All routes under `/api/v1/auth`.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/login` | Public | Password login → sets session |
| `POST` | `/register` | Public | Register new user + org → sets session |
| `POST` | `/magic-link` | Public | Request a magic-link email |
| `GET` | `/magic` | Public | Consume magic-link token → sets session |
| `POST` | `/logout` | Session | Destroy session |
| `GET` | `/me` | Session | Return current `SessionUser` |

---

## Data
[coverage: high]

**`SessionUser` shape** (stored in `req.session.user`):
```ts
{
  id: string;
  name: string;
  email: string;
  role: MembershipRole;   // STARTUP_ADMIN | OPERATOR | PLATFORM_ADMIN | ...
  orgId: string;
  status: UserStatus;     // ACTIVE | PENDING_APPROVAL | SUSPENDED | INACTIVE
}
```

**Magic link flow:**
1. 32-byte random token generated with `crypto.randomBytes`
2. Stored on `User.magicLinkToken` (unique index) + expiry 30 min
3. URL: `${FRONTEND_URL}/auth/magic?token=<token>`
4. On consumption: token cleared, pending memberships activated, `lastLoginAt` updated

**Password auth:**
- bcrypt with 10 salt rounds
- Accounts created via free signup get `passwordHash` set from `dto.password`
- Magic-link-only accounts have `passwordHash = null` → password login throws with helpful message

---

## Key Decisions
[coverage: high]

**Session-based, not JWT:** Chosen for simplicity and to avoid refresh token complexity. The session store is Prisma-backed (or in-memory for dev). All auth checks happen via `SessionAuthGuard` which reads `req.session.user`.

**Magic-link activates memberships:** Consuming a magic link sets all `PENDING` memberships for the user to `ACTIVE`. This is the mechanism that bridges the old payment-gated provisioning flow with the new free-signup flow.

**Role guards use `@Roles()` decorator:** `RolesGuard` requires both `SessionAuthGuard` AND `RolesGuard` to be applied. Forgetting `SessionAuthGuard` means the role check runs against an undefined user.

---

## Gotchas
[coverage: high]

- `@UseGuards(SessionAuthGuard, RolesGuard)` — order matters: SessionAuthGuard must come first.
- The `@CurrentUser()` decorator returns `null` if not behind `SessionAuthGuard`. The controllers check `if (!user) throw new BadRequestException(...)` defensively.
- `PENDING_APPROVAL` users CAN log in — their session is valid. The application status page uses this to show them their review status.
- Magic-link tokens expire in 30 minutes and are single-use (cleared on first consumption).
- Users created by free signup get `status = PENDING_APPROVAL` — they can browse their dashboard but matching is locked until admin approval + payment.
