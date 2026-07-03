# BridgeScale

A curated B2B marketplace connecting Indian startups and MSMEs with fractional diaspora sales talent for international growth. Companies get vetted fractional operators — sales leaders, pipeline builders, and BD professionals — without the risk or cost of a full-time hire. Talent gets structured, compensated fractional work with platform-managed contracts, milestones, and payments.

BridgeScale manages the full engagement lifecycle: **intake → AI diagnosis → vetting → matching → contract → active engagement → closeout.**

---

## Monorepo structure

```
Platform/
├── backend/           NestJS API (TypeScript) — port 4000
├── frontend/          Next.js 14 App Router (TypeScript) — port 3000
├── Docs/              Reference and design documentation
└── docker-compose.yml PostgreSQL 16 + Redis 7
```

---

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop

---

## Quick start

### 1. Start infrastructure

```bash
docker-compose up -d
```

Starts PostgreSQL 16 on port 5432 and Redis 7 on port 6379.

### 2. Backend

```bash
cd backend
cp .env.example .env      # edit with real values, or leave dummy values for local dev
npm install
npx prisma migrate dev    # apply migrations
npm run start:dev         # hot-reload dev server on port 4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # starts on port 3000
```

Visit [http://localhost:3000](http://localhost:3000).

### Windows shortcut

Double-click `START.bat` to run the above steps automatically.
> **Warning:** `START.bat` runs `prisma db push --accept-data-loss` which resets the database on every run. Use the manual steps above if you need to preserve data between restarts.

---

## Access points

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api/v1 |
| Health check | http://localhost:4000/api/v1/health |
| Prisma Studio | `npx prisma studio` (in backend/) |

---

## Key environment variables

| Variable | Description | Default (dev) |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | `postgresql://platform:platform_dev@localhost:5432/platform_dev` |
| `SESSION_SECRET` | express-session secret | change in production |
| `OPENAI_API_KEY` | OpenAI key — prefix `sk-dummy-` to use mock AI | `sk-dummy-...` |
| `DUMMY_AI_MODE` | `true` forces mock AI responses without a real API key | `false` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Company payments (INR) | dummy values |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Talent payments (USD) | dummy values |
| `FRONTEND_URL` | Used in magic-link emails and Stripe redirects | `http://localhost:3001` |
| `DUMMY_PAYMENT_MODE` | `true` skips real payment gateways | `true` |

See `backend/.env.example` for the full reference.

---

## User flows

### Company (startup)

1. Apply free at `/for-companies/apply` — creates account, auto-logs in, redirects to `/startup/dashboard`
2. AI generates a needs diagnosis in the background
3. Platform admin reviews and approves
4. Company pays ₹8,500 to unlock talent matches
5. View ranked shortlist → select a candidate → review SOW → sign contract → engagement begins

### Talent (operator)

1. Apply free at `/for-talent/apply` — creates account, auto-logs in, redirects to `/operator/dashboard`
2. Complete profile if skipped at signup (references, case study, availability)
3. Pass three-stage vetting: references checked, expert interview, peer-reviewed pitch video
4. Pay $50 to unlock company matches
5. View matched companies → express interest → sign SOW → engagement begins

---

## Development commands

```bash
# Backend
npm run start:dev           # dev server with hot reload
npm run build               # production build
npx prisma migrate dev      # create + apply a new migration
npx prisma studio           # visual database browser

# Frontend
npm run dev                 # dev server
npm run build               # production build
npm run lint                # ESLint
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, CSS Modules |
| Backend | NestJS 11, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | express-session, bcryptjs, magic links via Resend |
| Payments | Razorpay (INR, companies), Stripe (USD, talent — dummy mode only, integration pending) |
| AI | OpenAI gpt-4o (diagnosis, pre-screen, matching, health monitoring) |
| Email | Resend |
| Infrastructure | Docker Compose (local) |

---

## Project status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Marketing pages, apply forms, auth, API proxy | Done |
| Phase 2 | Free signup flow, dashboards, payment unlock | Done |
| Phase 3 | Matching UI, contract signing, engagement workspace, admin dashboard | In progress |

See [`Docs/TECHNICAL.md`](Docs/TECHNICAL.md) for full architecture, API reference, and data model documentation.
