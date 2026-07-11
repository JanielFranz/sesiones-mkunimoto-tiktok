# Kuni — Mentoring Landing Page

Single-page marketing/landing site for **Kuni**, a Peruvian software-mentorship service selling S/30 one-on-one sessions. All UI copy is Spanish (Peru); the site's only goal is converting visitors into a booked, paid session. Targets exactly three audiences: school students (4to/5to secundaria), early-university/institute students (1er/2do ciclo), and people changing industry into tech (reconversión).

## Status

The full flow is implemented and working end-to-end: pick a motive → pay via Yape (OTP) → get a Calendly link → book.

**Implemented**
- Booking gated behind payment (`pay before you can book`), with mock and real Mercado Pago providers behind one interface
- Supabase (Postgres) persistence for `payments`/`bookings`, RLS enabled with zero public policies — only the service role can touch these tables
- Calendly single-use scheduling links, with polling-based sync to detect when a paid customer actually books
- Deterministic, local-data career roadmap generator (no external AI calls)
- Rate limiting on checkout — Upstash Redis, sliding window, 5 requests / 10 min per IP
- reCAPTCHA v3 bot protection on checkout
- Dual deployment targets: Vercel serverless (`api/index.ts`) and a persistent-process build for non-Vercel hosts (`server.ts`)

**Pending for full production go-live**
- Swap `MP_PUBLIC_KEY` / `MP_ACCESS_TOKEN` / `MP_WEBHOOK_SECRET` for real (non-`TEST-`) Mercado Pago production keys. The Yape flow (token exchange → payment) has already been exercised end-to-end against Mercado Pago's sandbox API and confirmed working, so this should be a config-only change.
- Point the deployed app at a hosted Supabase project: apply `db/schema.sql` via the hosted project's SQL Editor, then set `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` in the Vercel dashboard (local dev currently targets the local Docker Supabase stack).

See `CLAUDE.md` for the full architecture writeup, environment variable reference, and the reasoning behind non-obvious decisions.

## Tech stack

- **Frontend:** React 19, Vite 6, TypeScript, Tailwind CSS v4 (CSS-first — no `tailwind.config.js`), `lucide-react` icons
- **Backend:** Express, shared between local/non-Vercel hosting and Vercel serverless functions
- **Data:** Supabase (Postgres), service-role only
- **Payments:** Mercado Pago (Yape "código de aprobación" flow), with a deterministic mock provider for local dev
- **Scheduling:** Calendly — single-use scheduling links via API, with a public-link fallback
- **Rate limiting:** Upstash Redis (`@upstash/ratelimit`)
- **Bot protection:** Google reCAPTCHA v3

## Getting started

**Prerequisites:** Node.js, Docker (for the local Supabase stack)

```bash
npm install
cp .env.example .env   # fill in the values — see Environment below
```

Local dev needs the local Supabase Docker stack running first. From the parent folder that has the Supabase project: `npx supabase start`, then copy `API_URL` and `SERVICE_ROLE_KEY` from `npx supabase status` into `.env`.

```bash
npm run db:setup   # applies db/schema.sql to the local Supabase Postgres (idempotent)
npm run dev         # http://localhost:3000 — Express + Vite middleware, one process
```

Payments run in **mock mode** by default (`PAYMENT_MODE=mock`) — any 6-digit Yape approval code is accepted, except `000000` (simulates insufficient funds) and `111111` (simulates an expired code). No external API keys are required to get the app running locally; the career roadmap is generated from a curated local dataset, not an AI service.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Local dev server — Express + Vite middleware on one port |
| `npm run build` | Builds the frontend to `dist/` and bundles `server.ts` → `dist/server.cjs`, for non-Vercel hosts |
| `npm run vercel-build` | Frontend-only build; Vercel compiles `api/index.ts` separately with its own Node builder |
| `npm run start` | Runs the built app (`dist/server.cjs`) — set `NODE_ENV=production` |
| `npm run lint` | `tsc --noEmit` — the only automated check; must be clean before committing |
| `npm run db:setup` | Applies `db/schema.sql` to the local Supabase Postgres container |

No test suite is configured (no Jest/Vitest) — typecheck plus manual smoke-testing (`GET /api/health`, a `POST /api/checkout` run) is the verification loop.

## Environment variables

All secrets are server-only and never reach the browser bundle, with one deliberate exception: `VITE_RECAPTCHA_SITE_KEY` is meant to be public. `.env.example` has the full working list; `CLAUDE.md`'s Environment section documents what's required vs optional and what happens if each is left unset.

| Group | Variables |
|---|---|
| Supabase | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Mercado Pago | `PAYMENT_MODE`, `MP_PUBLIC_KEY`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` |
| Calendly | `CALENDLY_URL`, `CALENDLY_API_TOKEN`, `CALENDLY_EVENT_TYPE_URI` |
| Rate limiting (optional) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — skipped entirely if unset |
| Bot protection (optional) | `VITE_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` — skipped entirely if unset |
| Misc | `SESSION_PRICE_CENTS`, `PORT`, `BOOKING_SYNC_INTERVAL_MS` |

Env is read once at server startup — restart `npm run dev` after editing `.env`.

## Architecture

- `server/app.ts` — the Express app and every API route, imported by both `server.ts` (local/non-Vercel) and `api/index.ts` (Vercel serverless function)
- `server/` — payment providers (`payments.ts`), Calendly scheduling (`scheduling.ts`), Supabase client (`supabase.ts`), rate limiting (`rateLimit.ts`), reCAPTCHA verification (`recaptcha.ts`), booking sync (`bookingSync.ts`)
- `src/` — the React frontend; `src/App.tsx` composes one vertical stack of section components (`Header`, `Hero`, `BentoStats`, `WhoIsItFor`, `WhatYouGet`, `RoadmapBuilder`, `TestimonialsGuestbook`, `BookingCalendar`, `FaqSection`, `Footer`)
- `db/schema.sql` — idempotent Postgres schema (`payments`, `bookings`), RLS-locked to the service role

Full architectural detail — including why things are split the way they are — lives in `CLAUDE.md`.

## Deployment

Deployed on Vercel: `vercel.json` builds the frontend (`vite build` → static `dist/`) and rewrites `/api/*` to `api/index.ts`, which exports the same Express app as a serverless function. Environment variables are set in the Vercel dashboard, not `.env` (which is local-only), and require a redeploy to take effect — in particular, `VITE_*` vars are baked in at build time, so a var-only change still needs a rebuild, not just a function restart.
