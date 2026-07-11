# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page marketing/landing site for **Kuni**, a Peruvian software-mentorship service that sells S/30 one-on-one sessions. All UI copy is **Spanish (Peru)** written in an informal Peruvian-mentor voice ("crack", "manya", "pata"), and prices are in soles (S/). The site's only goal is converting visitors into booked sessions.

**Audience scope (hard product constraint):** the product targets exactly three groups — school students (4to/5to de secundaria), early-university/institute students (1er/2do ciclo), and people changing industry into tech (reconversión). Do not add copy, sections, or features aimed at other segments (senior devs, general public, B2B). These three map to the cards in `WhoIsItFor.tsx` and the stages in `RoadmapBuilder.tsx` / booking motives (`secundaria`, `universidad_inicial`, `reconversion`).

## Commands

```bash
npm install
npm run dev       # tsx server.ts — runs Express + Vite middleware on one port (default 3000; override with PORT env)
npm run db:setup  # applies db/schema.sql to the LOCAL Supabase DB container (idempotent; requires supabase docker stack running)
npm run build     # vite build (client → dist/) + esbuild bundle server.ts → dist/server.cjs
npm run start     # node dist/server.cjs — serves the built app (set NODE_ENV=production)
npm run lint      # tsc --noEmit — typecheck (also typechecks the test files)
npm test          # vitest run — the unit/integration suite (node env, no DB/network)
npm run test:coverage  # vitest run --coverage (v8; server/ coverage report)
```

**Local prerequisites:** the local Supabase stack must be running (Docker containers named `supabase_*_projects`; API on `:54321`, Postgres on `:54322`, Studio on `:54323`). Get its credentials with `npx supabase status` (run from the parent `projects` folder). Copy `.env.example` → `.env` if missing.

**Tests:** there is a **Vitest suite** under `test/` (config in `vitest.config.ts`, not `vite.config.ts` — the React/Tailwind plugins are deliberately excluded). Run it with `npm test`. Verification gate before committing = `npm run lint` (typecheck, which also covers the test files — Vitest uses esbuild and does NOT typecheck, so `tsc` catches type errors the suite won't) **and** `npm test`. Both run in CI (`.github/workflows/ci.yml`) on push/PR to `develop`, on Node 20 + 22, alongside `npm run build`. Key conventions, if you add tests:
- Tests are deterministic and **secret-free**: `vitest.config.ts` points `DOTENV_CONFIG_PATH` at the empty `test/empty.env` so `import "dotenv/config"` never loads the real `.env`, and pins `SESSION_PRICE_CENTS=3000` / `PAYMENT_MODE=mock`. Stub anything else per-test with `vi.stubEnv`; `test/setup.ts` unstubs envs/globals/mocks and calls `vi.resetModules()` after each test, and `clearMocks: true` clears call history.
- `test/recaptcha.test.ts` is the reference for the **fetch + env stubbing** pattern; `test/app.test.ts` is the reference for **Express integration** (supertest + `vi.mock` of the server modules + a chainable Supabase query-builder fake + a `vi.hoisted` mutable middleware).
- Modules with a memoized singleton (`getSupabase`, `getRatelimit`) must be re-tested via `vi.resetModules()` + a fresh `await import(...)` after setting env.
- Import project modules with the `.js` extension (Vitest resolves it to the `.ts`/`.tsx` source, same as the rest of the codebase).

To smoke-test the API by hand, run the server and:
- `GET /api/health` — expect `{status:"ok", paymentMode:"mock", supabase:"connected", ...}`. If `supabase:"error"`, the docker stack is down or grants are missing (re-run `npm run db:setup`).
- `POST /api/checkout` with `{name,email,phone:"9########",otp:"######",motive}` — mock mode approves any 6-digit OTP except `000000` (insufficient funds) and `111111` (expired code).

**Windows note:** the primary shell is PowerShell, but `clean`/`build` scripts use POSIX `rm`/paths — run those via the Bash tool (Git Bash), not PowerShell. Port 3000 is often already occupied by a stale/running dev server; use `PORT=<other>` to test a fresh build without killing it.

## Environment

`server.ts` loads `.env` via `import "dotenv/config"`. **All secrets are server-side only and must never reach the browser bundle:**

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — local values come from `npx supabase status` (API_URL + SERVICE_ROLE_KEY).
- `PAYMENT_MODE` — `mock` (default; simulated charges, no external calls) or `live` (real Mercado Pago; also requires a real access token).
- `MP_PUBLIC_KEY`, `MP_ACCESS_TOKEN` — placeholders until the real keys arrive; `MP_PUBLIC_KEY` is used only for the Yape token-generation call, `MP_ACCESS_TOKEN` (Bearer) for the payment call; the provider selector refuses to go live on a placeholder token.
- `MP_WEBHOOK_SECRET` — signing secret from the Mercado Pago dashboard, used to verify the `x-signature` HMAC on `/api/webhooks/mercadopago`.
- `CALENDLY_URL` — public scheduling page, used as fallback link.
- `CALENDLY_API_TOKEN`, `CALENDLY_EVENT_TYPE_URI` — **both filled and verified working** (true single-use `/d/…` links are minted on approved payments). The PAT lacks the `users:read` scope, so `GET /users/me` fails — that's fine (only `scheduling_links:write` is needed at runtime); if you ever need the user URI, decode `user_uuid` from the PAT's JWT payload instead.
- `SESSION_PRICE_CENTS` (3000 = S/30), `PORT`.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — REST credentials for the Upstash Redis database backing rate limiting on `POST /api/checkout`. Optional: unset means rate limiting is skipped entirely (see `server/rateLimit.ts`).
- `VITE_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` — reCAPTCHA v3 bot protection on `POST /api/checkout` (see `server/recaptcha.ts`). The site key is intentionally `VITE_`-prefixed (public by design, ships in the client bundle) — Vite only exposes `VITE_`-prefixed vars to browser code, so don't rename it without updating `src/components/BookingCalendar.tsx`. The secret key is server-only. Optional: unset means verification is skipped entirely.

Env is read **once at server startup** — after editing `.env`, restart `npm run dev` or changes (like a newly added Calendly token) silently won't apply.

**Go-live checklist (only Mercado Pago remains):** paste real `MP_PUBLIC_KEY`/`MP_ACCESS_TOKEN`/`MP_WEBHOOK_SECRET` into `.env`, set `PAYMENT_MODE=live`, and verify the live `mercadoPagoProvider` in `server/payments.ts` against Mercado Pago's current API (it was written from docs — in particular confirm the Yape flow's payment-creation call targets the flat `/v1/payments` shape and not the newer Order API). Webhook signature verification and `payments.status` reconciliation are both implemented in `/api/webhooks/mercadopago`. No frontend changes needed. Calendly single-use links are already verified end-to-end.

## Architecture

**Single process locally, split on Vercel.** The Express API routes live in `server/app.ts` (exports `app`, no `.listen()`). `server.ts` — the entry point for local dev and for non-Vercel hosts (Railway/Render/Fly) — imports that `app`, bolts on the frontend (dev: Vite middleware via `createViteServer`/`middlewareMode`; prod: static `dist/` + SPA catch-all), and calls `app.listen(PORT)`. There is no separate frontend dev server; `npm run dev` gives you both at `http://localhost:3000`.

**Vercel deployment.** `api/index.ts` exports the same `server/app.ts` Express app directly as a serverless function — no `PORT`/`.listen()` involved; Vercel invokes it per request rather than running a persistent process. `vercel.json` builds the frontend with `vite build` → static `dist/`, and rewrites `/api/(.*)` to that function so Express's own routing still resolves paths like `/api/checkout`. Because serverless functions don't persist between invocations, `server/app.ts`'s `setInterval` booking-sync loop only runs from `server.ts` (i.e. never on Vercel); on Vercel, `POST /api/bookings/sync` also has a `GET` alias so `vercel.json`'s `crons` entry (which fires `GET`) can trigger it instead — set `CRON_SECRET` in the Vercel dashboard to keep that GET from being publicly callable (Vercel's cron sends it as a Bearer token automatically). Note: Hobby-plan Vercel projects only run cron jobs once per day, so `vercel.json`'s schedule is `0 12 * * *` (daily at 12:00 UTC / 07:00 Peru time) — bump to something like `*/5 * * * *` only if the project is on a Pro plan.

**Frontend stack:** React 19 + Vite 6 + TypeScript, styled with **Tailwind CSS v4** via the `@tailwindcss/vite` plugin (v4 is CSS-first — there is no `tailwind.config.js`; utilities and the theme come from `src/index.css`). Path alias `@` → repo root (see `vite.config.ts` + `tsconfig.json`). Icons come from `lucide-react`.

**Page composition:** `src/App.tsx` renders the whole site as one vertical stack of section components (`Header`, `Hero`, `BentoStats`, `WhoIsItFor`, `WhatYouGet`, `RoadmapBuilder`, `TestimonialsGuestbook`, `BookingCalendar`, `FaqSection`, `Footer`). Each section is self-contained. Navigation is **scroll-to-anchor** by section `id` (`sobre-mi`, `como-funciona`, `probar-ia`, `precios`, `faq`, `testimonios-g`) via a shared `onScrollTo` handler; the CTA buttons scroll to the booking section via a `ref`.

**Cross-section state:** `App.tsx` holds `selectedStageOption`. Clicking an audience card in `WhoIsItFor` sets it, and `RoadmapBuilder` consumes it through the `stageOverride` prop (a `useEffect` syncs the selector and scrolls the roadmap into view). This is the only inter-section coupling.

**The roadmap generator is deterministic — no AI.** `RoadmapBuilder.tsx` produces the career roadmap entirely from curated **local data** (`ROLE_ROADMAPS` keyed by dream-role × `STAGE_LABEL`/`STAGE_FINAL_ADVICE` keyed by stage) in `buildRoadmap()`. The "Generar" button just composes that data behind a short artificial delay to keep the loading animation meaningful. To add/adjust a role or stage, extend those maps. Do not reintroduce external AI calls. (`@google/genai` remains in `package.json` as an unused legacy dep from a removed Gemini integration — ignore it.)

**Data & backend — hybrid Express + Supabase.** Express is the app server and API layer; **Supabase (Postgres)** is the datastore for transactional data. Express is the only thing that talks to Supabase (via `server/supabase.ts`, service-role key) and holds every secret — the browser never receives the service-role key or any payment secret. Schema lives in `db/schema.sql` (idempotent; applied with `npm run db:setup`): tables `payments` (every charge attempt, approved or rejected, with `raw_response` audit) and `bookings` (one per issued scheduling link, FK → payments). **RLS is enabled with zero policies** and all grants revoked from `anon`/`authenticated` — the public Supabase API cannot touch these tables; only the service role can. Note: tables created via direct psql don't inherit Supabase's default grants, hence the explicit `grant`/`revoke` statements at the bottom of the schema — keep them when altering tables.

- **Testimonials are static frontend content**, not backend data — the array is inlined in `TestimonialsGuestbook.tsx` and rendered directly (no fetch, no DB). Edit that array to change them; they are intentionally out of Supabase.

**Payments → booking (IMPLEMENTED, mock payment until real Mercado Pago keys arrive).** Core product invariant: **a user must pay before they can book.** Payment is Yape's "código de aprobación" (OTP) flow; booking stays on **Calendly** but is gated behind payment. Server modules under `server/`:

- `server/payments.ts` — `PaymentProvider` interface with two impls: `mercadopago_mock` (deterministic simulation; OTP `000000` → insufficient funds, `111111` → expired, anything else → approved) and `mercadopago` (real: Yape token via `MP_PUBLIC_KEY` → payment via `MP_ACCESS_TOKEN` Bearer auth; raw `fetch()` calls, no SDK; **written from docs, unverified against real keys**). `getPaymentProvider()` picks by `PAYMENT_MODE` + token sanity. Mercado Pago's own Yape sandbox (separate from this mock) uses fixed OTP `123456` with test phone numbers `111111111`–`111111118`, each mapping to a specific approve/reject outcome — useful for a pre-go-live smoke test against the real API with `TEST-` keys.
- `server/scheduling.ts` — `createSchedulingLink()`: with `CALENDLY_API_TOKEN`+`CALENDLY_EVENT_TYPE_URI` it mints a TRUE single-use link (`POST /scheduling_links`, `max_event_count:1`); otherwise falls back to the public `CALENDLY_URL`. On any Calendly failure it also falls back — a paid customer must never dead-end.
- `server/supabase.ts` — lazy service-role client + `checkSupabase()` health probe.
- `server/rateLimit.ts` — Upstash Redis–backed sliding-window limiter (5 requests / 10 min per IP) guarding `POST /api/checkout` against OTP/payment brute-forcing. Fails open (lets the request through) if Upstash env vars are unset or a Redis call errors — a rate-limiter outage must never block paying customers, same principle as the Calendly scheduling-link fallback. Keyed on `req.ip`, which requires `app.set("trust proxy", true)` (set in `server/app.ts`) to resolve correctly behind Vercel's proxy.
- `server/recaptcha.ts` — verifies the reCAPTCHA v3 token (`action: "checkout"`, score threshold 0.5 — Google's own default) against Google's `siteverify` endpoint. Asymmetric failure modes, deliberately: not configured → allow (mirrors `rateLimit.ts`'s "feature disabled" contract); configured but no token present → reject (otherwise a bot bypasses the check by omitting the field); configured + token but the Google request itself errors → allow, logged loudly (a third-party outage must never block a paying customer). The frontend loads the reCAPTCHA script eagerly on mount (`BookingCalendar.tsx`), not lazily at submit time, so it collects more behavioral signal before scoring.

**API surface** (`server.ts`): `GET /api/health` (reports paymentMode/schedulingMode/supabase), `POST /api/checkout` (rate-limited → validate → verify reCAPTCHA → charge → insert `payments` row → on approval mint link + insert `bookings` row → return `schedulingUrl`; 429 on rate limit, 400 on validation, 403 on failed reCAPTCHA, 402 on payment rejection), `POST /api/bookings/sync` (manual booking-sync trigger, see below), `POST /api/webhooks/mercadopago` (verifies the `x-signature` HMAC, then fetches the payment and reconciles `payments.status` by `provider_charge_id`). Request/response types are shared with the frontend via `src/types.ts` (`CheckoutRequest`/`CheckoutResponse`/`HealthResponse`).

**Booking sync** (`server/bookingSync.ts`): flips `bookings.status` `link_issued → scheduled` when the payer actually books, by **polling** Calendly (`scheduled_events` + invitees, matched on invitee email == `payer_email` AND event created after the booking row; each event consumed once). Polling — not webhooks — is deliberate: Calendly webhooks need a paid plan, a `webhooks:write` scope the PAT lacks, and a public URL. Runs every `BOOKING_SYNC_INTERVAL_MS` (default 5 min, 0 disables, only when scheduling mode is `calendly-api`) plus on demand via `POST /api/bookings/sync`. The host's user URI is derived by decoding `user_uuid` from the PAT JWT (`calendlyUserUriFromToken`). Paid-but-not-booked customers = rows still in `link_issued` (view in Supabase Studio, `localhost:54323`).

**Frontend flow** (`BookingCalendar.tsx`, 3 steps): (1) pick "motivo" → (2) payment form (name, email, Yape phone, 6-digit OTP; anonymous checkout, no login; shows an amber test-mode banner while `/api/health` reports `paymentMode:"mock"`) → (3) on approval, the Calendly inline widget initializes with the **server-returned** `schedulingUrl`, prefilling name/email/motivo (`customAnswers.a1`). Rejections show inline and clear the OTP field. Calendly's native paid-booking supports only Stripe/PayPal, which is why payment runs through Mercado Pago/Express instead of Calendly. Amount is S/30 (`SESSION_PRICE_CENTS`); Yape caps a single payment at S/500–S/2000 and soles only (both fine here).

## Conventions

- **Design language is neo-brutalist and consistent** — reuse the existing tokens: `border-2 border-black`, hard offset shadows `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`, rounded cards, the brand blue `#0054d4`, cream background `#fcf9f8`. Match the surrounding component rather than introducing new visual patterns.
- **Every interactive element has a stable `id`** (e.g. `roadmap-generate-btn`, `nav-btn-book`). Preserve/extend this pattern when adding controls.
- Keep new copy in Spanish and framed for the three in-scope audiences.
