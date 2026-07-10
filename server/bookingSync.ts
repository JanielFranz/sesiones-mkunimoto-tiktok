/**
 * Booking sync: flips bookings from 'link_issued' → 'scheduled' when the payer
 * actually books through their Calendly link.
 *
 * Uses POLLING (not webhooks) on purpose: Calendly webhooks need a paid plan,
 * a `webhooks:write` scope this PAT doesn't have, and a publicly reachable
 * URL — none of which apply to local dev. The sync runs on an interval (see
 * server.ts) and via `POST /api/bookings/sync` for manual/admin triggering.
 *
 * Matching strategy: a scheduled event counts as the booking's if
 *   (a) one of its invitees' email equals the payment's payer_email, and
 *   (b) the event was created at/after the booking row (so an older event
 *       from the same person can't satisfy a newer unpaid booking).
 * Each Calendly event is consumed by at most one booking per run.
 */

import { getSupabase } from "./supabase.js";

interface CalendlyEvent {
  uri: string;
  created_at: string;
  start_time: string;
  status: string;
}

interface PendingBooking {
  id: string;
  created_at: string;
  payments: { payer_email: string } | null;
}

export interface SyncResult {
  pending: number;
  eventsChecked: number;
  updated: { bookingId: string; email: string; startTime: string }[];
  skippedReason?: string;
}

/** The PAT's JWT payload carries user_uuid — the token itself lacks users:read,
 *  so this is the sanctioned way to derive the user URI for API filters. */
export function calendlyUserUriFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return payload.user_uuid ? `https://api.calendly.com/users/${payload.user_uuid}` : null;
  } catch {
    return null;
  }
}

async function calendlyGet(path: string): Promise<any> {
  const res = await fetch(`https://api.calendly.com${path}`, {
    headers: { Authorization: `Bearer ${process.env.CALENDLY_API_TOKEN}` }
  });
  if (!res.ok) {
    throw new Error(`Calendly GET ${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

export async function syncBookings(): Promise<SyncResult> {
  const token = process.env.CALENDLY_API_TOKEN;
  const userUri = token ? calendlyUserUriFromToken(token) : null;
  if (!token || !userUri) {
    return { pending: 0, eventsChecked: 0, updated: [], skippedReason: "no CALENDLY_API_TOKEN configured" };
  }

  const supabase = getSupabase();

  // 1) Pending bookings (joined to the payer's email). No pending → no API calls.
  const { data: pending, error } = await supabase
    .from("bookings")
    .select("id, created_at, payments(payer_email)")
    .eq("status", "link_issued")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`bookings select failed: ${error.message}`);
  const pendingBookings = (pending ?? []) as unknown as PendingBooking[];
  if (pendingBookings.length === 0) {
    return { pending: 0, eventsChecked: 0, updated: [] };
  }

  // 2) Upcoming active events for the host.
  const eventsRes = await calendlyGet(
    `/scheduled_events?user=${encodeURIComponent(userUri)}&status=active&min_start_time=${encodeURIComponent(
      new Date().toISOString()
    )}&count=100&sort=start_time:asc`
  );
  const events = (eventsRes.collection ?? []) as CalendlyEvent[];

  // Events already claimed by some booking must not be matched twice.
  const { data: claimedRows } = await supabase
    .from("bookings")
    .select("scheduled_event_uri")
    .not("scheduled_event_uri", "is", null);
  const claimed = new Set((claimedRows ?? []).map((r: any) => r.scheduled_event_uri));

  // 3) Match: oldest pending booking first; each event consumed once per run.
  const updated: SyncResult["updated"] = [];
  const inviteeCache = new Map<string, string[]>();

  for (const booking of pendingBookings) {
    const email = booking.payments?.payer_email?.toLowerCase();
    if (!email) continue;

    for (const ev of events) {
      if (claimed.has(ev.uri)) continue;
      if (new Date(ev.created_at) < new Date(booking.created_at)) continue;

      let invitees = inviteeCache.get(ev.uri);
      if (!invitees) {
        const uuid = ev.uri.split("/").pop();
        const invRes = await calendlyGet(`/scheduled_events/${uuid}/invitees?count=100`);
        invitees = ((invRes.collection ?? []) as { email: string }[]).map((i) => i.email.toLowerCase());
        inviteeCache.set(ev.uri, invitees);
      }
      if (!invitees.includes(email)) continue;

      const { error: updErr } = await supabase
        .from("bookings")
        .update({
          status: "scheduled",
          scheduled_event_uri: ev.uri,
          scheduled_start_time: ev.start_time,
          invitee_email: email
        })
        .eq("id", booking.id);
      if (updErr) {
        console.error(`booking ${booking.id} update failed:`, updErr.message);
        break;
      }
      claimed.add(ev.uri);
      updated.push({ bookingId: booking.id, email, startTime: ev.start_time });
      break;
    }
  }

  return { pending: pendingBookings.length, eventsChecked: events.length, updated };
}
