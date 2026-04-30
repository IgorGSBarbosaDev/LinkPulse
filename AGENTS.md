# AGENTS.md

## Purpose

LinkPulse = fullstack monorepo for short links + analytics.

Source of truth:
- Product target: `./linkpulse_prd.md`
- Extra docs: `./docs/*`
- Actual impl state: current code in `./apps/*` and `./packages/*`

Rule: if PRD and code differ, treat code as "what exists now", PRD as "what build next".

## Product

User can:
- register
- login
- create short link
- set custom alias
- set expiration
- set max clicks
- manage own links
- use public redirect
- view analytics dashboard

MVP focus:
- auth
- links CRUD
- redirect
- click tracking
- basic analytics
- Redis cache + rate limit
- web dashboard
- tests
- docs

Out of MVP:
- refresh token
- social login
- password reset
- email verify
- 2FA
- paid plans
- teams
- custom domains
- QR code
- advanced bot detection
- real-time analytics
- webhooks
- CSV export
- microservices

## Stack

Backend:
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Redis
- Zod
- JWT
- bcrypt

Frontend:
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Tailwind
- Recharts
- Sonner

Repo:
- `apps/api`
- `apps/web`
- `packages/shared`
- `docs`

## Architecture

Backend = modular monolith.
Frontend = feature-based.
Postgres = source of truth.
Redis = cache + rate limit only.

Prefer:
- thin controllers
- business rules in services
- DB access in repositories
- Zod for request validation
- ownership checks on every private resource
- shared types/contracts in `packages/shared` when cross-app need real reuse

Avoid:
- fat controllers
- DB calls scattered in random files
- auth logic duplicated across modules
- hidden cross-feature coupling
- Redis as permanent data store

## Repo Map

`apps/api`
- `src/modules/auth`: register, login, me
- `src/modules/links`: link CRUD
- `src/shared`: config, errors, middlewares, utils
- `prisma/schema.prisma`: DB schema

`apps/web`
- Vite React app
- current UI lives in `src/`
- build toward feature-based structure from PRD

`packages/shared`
- shared TS code/types

`docs`
- architecture
- API contract
- DB model
- decisions
- roadmap

## Core Rules

Auth:
- JWT auth
- hash password with bcrypt
- never expose password hash
- private routes require auth

Links:
- `originalUrl` required, valid URL
- `shortCode` unique
- `customAlias` optional, unique
- alias chars: letters, numbers, `-`, `_`
- user manages only own links
- soft-delete preferred over hard delete when flow needs history

Redirect:
- public route = `GET /r/:shortCode`
- block if missing
- block if inactive
- block if expired
- block if max clicks hit
- rate limit by IP
- valid click must increment count + record access event

Analytics:
- store per-click event
- minimum fields: link id, timestamp, IP if available, user-agent, referer if available
- show totals, recent activity, clicks by day, top links

## API Shape

Key endpoints from PRD:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/links`
- `GET /api/v1/links`
- `GET /api/v1/links/:id`
- `PATCH /api/v1/links/:id`
- `DELETE /api/v1/links/:id`
- `PATCH /api/v1/links/:id/activate`
- `PATCH /api/v1/links/:id/deactivate`
- `GET /r/:shortCode`
- `GET /api/v1/links/:id/analytics/summary`
- `GET /api/v1/links/:id/analytics/clicks-by-day`
- `GET /api/v1/links/:id/analytics/events`
- `GET /api/v1/analytics/top-links`

Keep error handling consistent. Use shared app error model.

## Frontend Rules

Build for:
- private routes
- login/register flows
- dashboard
- links list
- create/edit link forms
- filters + pagination
- analytics cards/table/chart

Prefer:
- API layer separated from UI
- TanStack Query for server state
- forms with React Hook Form + Zod
- explicit loading, empty, error states

Must handle:
- 401
- 403
- 404
- 429
- network failure
- expired session

## Commands

Root:
```bash
npm run dev:api
npm run dev:web
npm run build
npm run test
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

API:
```bash
npm run dev -w apps/api
npm run build -w apps/api
npm run test -w apps/api
```

Web:
```bash
npm run dev -w apps/web
npm run build -w apps/web
npm run lint -w apps/web
```

Infra:
- Docker Compose runs PostgreSQL + Redis

## Delivery Order

Build in this order unless task says otherwise:
1. monorepo/setup
2. backend base
3. Prisma schema + migrations
4. auth
5. links core
6. redirect
7. analytics backend
8. Redis cache + rate limit
9. API docs
10. frontend base
11. frontend auth
12. frontend links
13. frontend analytics
14. tests
15. docs/polish

## Done Means

Task done when:
- behavior matches PRD slice
- types compile
- tests for changed behavior exist or gap called out
- auth/ownership rules preserved
- docs updated if contract or architecture changed

## Agent Behavior

When changing code:
- read nearby files first
- preserve monorepo structure
- prefer small, composable modules
- update shared contracts when API shape changes
- verify commands on touched app when possible

When unsure:
- choose simplest MVP-safe path
- do not add V2 scope by accident
- do not invent architecture outside PRD without reason
