-- Kuni Mentorship — database schema (Supabase Postgres).
-- Idempotent: safe to re-run. Apply with `npm run db:setup` (pipes this file
-- into the local Supabase DB container).

-- ─────────────────────────────────────────────────────────────────────────────
-- payments: one row per Culqi (Yape) charge attempt, approved or rejected.
-- Written exclusively by the Express server using the service-role key.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id                 uuid primary key default gen_random_uuid(),
  provider           text not null default 'culqi_mock',
  provider_charge_id text,
  amount_cents       integer not null check (amount_cents > 0),
  currency           text not null default 'PEN',
  status             text not null check (status in ('approved', 'rejected', 'pending')),
  rejection_reason   text,
  payer_name         text not null,
  payer_email        text not null,
  payer_phone        text,
  motive             text,
  raw_response       jsonb,
  created_at         timestamptz not null default now()
);

create index if not exists payments_payer_email_idx on public.payments (payer_email);
create index if not exists payments_created_at_idx on public.payments (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- bookings: one row per scheduling link issued after an approved payment.
-- The single-use Calendly link is minted server-side; `status` tracks whether
-- the invitee actually scheduled (updated later via Calendly webhook if wired).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  payment_id          uuid not null references public.payments (id) on delete cascade,
  scheduling_url      text not null,
  scheduling_provider text not null default 'calendly',
  single_use          boolean not null default true,
  status              text not null default 'link_issued'
                      check (status in ('link_issued', 'scheduled', 'completed', 'canceled')),
  created_at          timestamptz not null default now()
);

-- Booking-sync columns (added when the Calendly polling sync was introduced):
-- filled in when the payer actually books through their link.
alter table public.bookings add column if not exists scheduled_event_uri  text;
alter table public.bookings add column if not exists scheduled_start_time timestamptz;
alter table public.bookings add column if not exists invitee_email        text;

create unique index if not exists bookings_payment_id_idx on public.bookings (payment_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security: enabled with NO policies. The anon/public API therefore
-- cannot read or write these tables at all; the Express server bypasses RLS
-- via the service-role key. Do not add permissive policies without thought.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.payments enable row level security;
alter table public.bookings enable row level security;

-- Grants: tables created via direct psql do not inherit Supabase's default
-- privileges, so grant the service role explicitly (the Express server) and
-- strip everything from the public-facing roles.
grant all on public.payments, public.bookings to service_role;
revoke all on public.payments, public.bookings from anon, authenticated;
