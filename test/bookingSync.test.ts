import { describe, it, expect, vi, beforeEach } from "vitest";

// bookingSync.ts imports getSupabase from "./supabase.js"; mocking
// "../server/supabase.js" resolves to the same module id, so the module under
// test receives this mock. getSupabase is called at request time, so it's set
// per-test via vi.mocked(getSupabase).mockReturnValue(...).
vi.mock("../server/supabase.js", () => ({ getSupabase: vi.fn() }));

import { calendlyUserUriFromToken, syncBookings } from "../server/bookingSync.js";
import { getSupabase } from "../server/supabase.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a JWT-shaped "header.payload.sig" token whose base64url payload is the
 *  given object — mirrors how the real Calendly PAT carries user_uuid. */
function makeToken(payloadObj: Record<string, unknown>): string {
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");
  return "h." + payload + ".sig";
}

const VALID_TOKEN = makeToken({ user_uuid: "abc-123" });
const EV1_URI = "https://api.calendly.com/scheduled_events/EV1";

/** Flexible Supabase fake. from("bookings") serves THREE call shapes:
 *   pending select:  .select().eq().order()  → pendingResult
 *   claimed select:  .select().not()         → claimedResult
 *   update:          .update().eq()          → updateResult
 */
function makeSb(cfg: { pending?: any; claimed?: any; update?: any } = {}) {
  const pendingResult = cfg.pending || { data: [], error: null };
  const claimedResult = cfg.claimed || { data: [], error: null };
  const updateResult = cfg.update || { error: null };
  const updateEq = vi.fn(() => Promise.resolve(updateResult));
  const update = vi.fn((_patch: any) => ({ eq: updateEq }));
  const from = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve(pendingResult)) })),
      not: vi.fn(() => Promise.resolve(claimedResult))
    })),
    update
  }));
  return { client: { from } as any, from, update, updateEq };
}

/** Route the Calendly fetch by URL: the invitees endpoint carries "/invitees";
 *  the events-list endpoint carries "/scheduled_events?". Any other URL is
 *  treated as an unexpected call and 404s (so calendlyGet would throw loudly). */
function stubCalendlyFetch(opts: { events?: any[]; invitees?: any[] } = {}) {
  const events = opts.events ?? [];
  const invitees = opts.invitees ?? [];
  const fetchMock = vi.fn().mockImplementation((url: any) => {
    const u = String(url);
    if (u.includes("/invitees")) {
      return Promise.resolve({ ok: true, json: async () => ({ collection: invitees }) });
    }
    if (u.includes("/scheduled_events?")) {
      return Promise.resolve({ ok: true, json: async () => ({ collection: events }) });
    }
    return Promise.resolve({ ok: false, status: 404, text: async () => "unrouted" });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const inviteesCalled = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.some((c) => String(c[0]).includes("/invitees"));

const inviteesCallCount = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.filter((c) => String(c[0]).includes("/invitees")).length;

const eventsFetchUrl = (fetchMock: ReturnType<typeof vi.fn>) =>
  String(fetchMock.mock.calls.find((c) => String(c[0]).includes("/scheduled_events?"))?.[0]);

beforeEach(() => {
  // The module logs console.error only on an update failure; silence defensively.
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// ─── calendlyUserUriFromToken ────────────────────────────────────────────────

describe("calendlyUserUriFromToken", () => {
  it("decodes user_uuid from the JWT payload into the users URI", () => {
    expect(calendlyUserUriFromToken(VALID_TOKEN)).toBe("https://api.calendly.com/users/abc-123");
  });

  it("returns null when the payload has no user_uuid", () => {
    const token = makeToken({ sub: "someone", scope: "scheduling_links:write" });
    expect(calendlyUserUriFromToken(token)).toBeNull();
  });

  it("returns null (without throwing) on a malformed token", () => {
    expect(() => calendlyUserUriFromToken("garbage")).not.toThrow();
    expect(calendlyUserUriFromToken("garbage")).toBeNull();
  });
});

// ─── syncBookings ────────────────────────────────────────────────────────────

describe("syncBookings", () => {
  it("skips entirely when CALENDLY_API_TOKEN is unset — no Supabase, no fetch", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", "");
    const fetchMock = stubCalendlyFetch();

    const result = await syncBookings();

    expect(result).toEqual({
      pending: 0,
      eventsChecked: 0,
      updated: [],
      skippedReason: "no CALENDLY_API_TOKEN configured"
    });
    expect(getSupabase).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("skips (same 'not configured' reason) when the token is present but undecodable — userUri is null", async () => {
    // Distinct branch from the empty-token case: `!token || !userUri`. A garbage
    // token is truthy, so only the `!userUri` half fires. Must NOT touch Supabase
    // or Calendly, and must NOT throw despite the malformed JWT.
    vi.stubEnv("CALENDLY_API_TOKEN", "garbage");
    const fetchMock = stubCalendlyFetch();

    const result = await syncBookings();

    expect(result).toEqual({
      pending: 0,
      eventsChecked: 0,
      updated: [],
      skippedReason: "no CALENDLY_API_TOKEN configured"
    });
    expect(getSupabase).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns an empty result and makes no Calendly calls when there are no pending bookings", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", VALID_TOKEN);
    const sb = makeSb({ pending: { data: [], error: null } });
    vi.mocked(getSupabase).mockReturnValue(sb.client);
    const fetchMock = stubCalendlyFetch();

    const result = await syncBookings();

    expect(result).toEqual({ pending: 0, eventsChecked: 0, updated: [] });
    expect(getSupabase).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("matches a pending booking to its event by invitee email and marks it scheduled", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", VALID_TOKEN);
    const sb = makeSb({
      pending: {
        data: [{ id: "b1", created_at: "2020-01-01T00:00:00Z", payments: { payer_email: "a@b.com" } }],
        error: null
      },
      claimed: { data: [], error: null }
    });
    vi.mocked(getSupabase).mockReturnValue(sb.client);
    const fetchMock = stubCalendlyFetch({
      events: [
        { uri: EV1_URI, created_at: "2020-02-01T00:00:00Z", start_time: "2020-03-01T10:00:00Z", status: "active" }
      ],
      invitees: [{ email: "a@b.com" }]
    });

    const result = await syncBookings();

    expect(result.pending).toBe(1);
    expect(result.eventsChecked).toBe(1);
    expect(result.updated).toEqual([{ bookingId: "b1", email: "a@b.com", startTime: "2020-03-01T10:00:00Z" }]);

    // The bookings row was updated to scheduled with the matched event, its
    // start time, and the invitee — all four fields, so a wrong start_time or a
    // missing field can't slip through.
    expect(sb.update).toHaveBeenCalledTimes(1);
    expect(sb.update.mock.calls[0][0]).toMatchObject({
      status: "scheduled",
      scheduled_event_uri: EV1_URI,
      scheduled_start_time: "2020-03-01T10:00:00Z",
      invitee_email: "a@b.com"
    });
    // Update was keyed to the correct booking id.
    expect(sb.updateEq).toHaveBeenCalledWith("id", "b1");
    // Invitees endpoint was consulted for the candidate event.
    expect(inviteesCalled(fetchMock)).toBe(true);
    // The events query is filtered by the URI decoded from the token's user_uuid
    // (ties calendlyUserUriFromToken → the actual Calendly request).
    expect(eventsFetchUrl(fetchMock)).toContain(
      encodeURIComponent("https://api.calendly.com/users/abc-123")
    );
  });

  it("matches case-insensitively — payer and invitee emails differing only in case still match", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", VALID_TOKEN);
    const sb = makeSb({
      pending: {
        // Mixed-case payer email…
        data: [{ id: "b1", created_at: "2020-01-01T00:00:00Z", payments: { payer_email: "Payer@Example.COM" } }],
        error: null
      },
      claimed: { data: [], error: null }
    });
    vi.mocked(getSupabase).mockReturnValue(sb.client);
    stubCalendlyFetch({
      events: [
        { uri: EV1_URI, created_at: "2020-02-01T00:00:00Z", start_time: "2020-03-01T10:00:00Z", status: "active" }
      ],
      // …vs a differently-cased invitee email. Only matches if BOTH sides are
      // lowercased; drop either `.toLowerCase()` and this test fails.
      invitees: [{ email: "payer@example.com" }]
    });

    const result = await syncBookings();

    expect(result.updated).toEqual([{ bookingId: "b1", email: "payer@example.com", startTime: "2020-03-01T10:00:00Z" }]);
    expect(sb.update).toHaveBeenCalledTimes(1);
    expect(sb.update.mock.calls[0][0]).toMatchObject({ status: "scheduled", invitee_email: "payer@example.com" });
  });

  it("skips a pending booking with no linked payment (null join) without fetching invitees", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", VALID_TOKEN);
    const sb = makeSb({
      pending: {
        data: [{ id: "b1", created_at: "2020-01-01T00:00:00Z", payments: null }],
        error: null
      }
    });
    vi.mocked(getSupabase).mockReturnValue(sb.client);
    const fetchMock = stubCalendlyFetch({
      events: [
        { uri: EV1_URI, created_at: "2020-02-01T00:00:00Z", start_time: "2020-03-01T10:00:00Z", status: "active" }
      ],
      invitees: [{ email: "a@b.com" }]
    });

    const result = await syncBookings();

    // No payer email → the booking is skipped before the event loop, so the
    // invitees endpoint is never hit (drop the `if (!email) continue` guard and
    // this booking would fetch invitees / risk matching an empty email).
    expect(result.updated).toEqual([]);
    expect(result.pending).toBe(1);
    expect(sb.update).not.toHaveBeenCalled();
    expect(inviteesCalled(fetchMock)).toBe(false);
  });

  it("consumes each event at most once per run — two bookings, one event → oldest wins, invitees fetched once", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", VALID_TOKEN);
    const sb = makeSb({
      pending: {
        // Ordered oldest-first (as the .order() query returns them); both share
        // the payer email and both precede the single event.
        data: [
          { id: "b1", created_at: "2020-01-01T00:00:00Z", payments: { payer_email: "a@b.com" } },
          { id: "b2", created_at: "2020-01-15T00:00:00Z", payments: { payer_email: "a@b.com" } }
        ],
        error: null
      },
      claimed: { data: [], error: null }
    });
    vi.mocked(getSupabase).mockReturnValue(sb.client);
    const fetchMock = stubCalendlyFetch({
      events: [
        { uri: EV1_URI, created_at: "2020-02-01T00:00:00Z", start_time: "2020-03-01T10:00:00Z", status: "active" }
      ],
      invitees: [{ email: "a@b.com" }]
    });

    const result = await syncBookings();

    // The oldest booking claims the only event; the newer one gets nothing.
    expect(result.pending).toBe(2);
    expect(result.updated).toEqual([{ bookingId: "b1", email: "a@b.com", startTime: "2020-03-01T10:00:00Z" }]);
    expect(sb.update).toHaveBeenCalledTimes(1);
    expect(sb.updateEq).toHaveBeenCalledWith("id", "b1");
    // Invitees fetched exactly once — the claim + cache short-circuit b2.
    expect(inviteesCallCount(fetchMock)).toBe(1);
  });

  it("does not mark the booking scheduled when the bookings UPDATE fails", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", VALID_TOKEN);
    const sb = makeSb({
      pending: {
        data: [{ id: "b1", created_at: "2020-01-01T00:00:00Z", payments: { payer_email: "a@b.com" } }],
        error: null
      },
      claimed: { data: [], error: null },
      update: { error: { message: "db write failed" } }
    });
    vi.mocked(getSupabase).mockReturnValue(sb.client);
    stubCalendlyFetch({
      events: [
        { uri: EV1_URI, created_at: "2020-02-01T00:00:00Z", start_time: "2020-03-01T10:00:00Z", status: "active" }
      ],
      invitees: [{ email: "a@b.com" }]
    });

    const result = await syncBookings();

    // The update was attempted but reported an error → not counted as updated,
    // and the failure is logged.
    expect(sb.update).toHaveBeenCalledTimes(1);
    expect(result.updated).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it("does not update when the event's invitee email differs from the payer", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", VALID_TOKEN);
    const sb = makeSb({
      pending: {
        data: [{ id: "b1", created_at: "2020-01-01T00:00:00Z", payments: { payer_email: "a@b.com" } }],
        error: null
      }
    });
    vi.mocked(getSupabase).mockReturnValue(sb.client);
    const fetchMock = stubCalendlyFetch({
      events: [
        { uri: EV1_URI, created_at: "2020-02-01T00:00:00Z", start_time: "2020-03-01T10:00:00Z", status: "active" }
      ],
      invitees: [{ email: "someone-else@x.com" }]
    });

    const result = await syncBookings();

    expect(result.updated).toEqual([]);
    expect(result.pending).toBe(1);
    expect(result.eventsChecked).toBe(1);
    expect(sb.update).not.toHaveBeenCalled();
    // The rejection came from an email mismatch (invitees WERE fetched), not from
    // short-circuiting on the time/claimed guards — distinguishing it from those.
    expect(inviteesCalled(fetchMock)).toBe(true);
  });

  it("skips an event created before the booking, without fetching its invitees", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", VALID_TOKEN);
    const sb = makeSb({
      pending: {
        data: [{ id: "b1", created_at: "2020-01-01T00:00:00Z", payments: { payer_email: "a@b.com" } }],
        error: null
      }
    });
    vi.mocked(getSupabase).mockReturnValue(sb.client);
    const fetchMock = stubCalendlyFetch({
      events: [
        { uri: EV1_URI, created_at: "2019-01-01T00:00:00Z", start_time: "2019-03-01T10:00:00Z", status: "active" }
      ],
      // invitees would match by email, but the time guard should short-circuit first
      invitees: [{ email: "a@b.com" }]
    });

    const result = await syncBookings();

    expect(result.updated).toEqual([]);
    expect(sb.update).not.toHaveBeenCalled();
    expect(inviteesCalled(fetchMock)).toBe(false);
  });

  it("skips an event already claimed by another booking, without fetching its invitees", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", VALID_TOKEN);
    const sb = makeSb({
      pending: {
        data: [{ id: "b1", created_at: "2020-01-01T00:00:00Z", payments: { payer_email: "a@b.com" } }],
        error: null
      },
      claimed: { data: [{ scheduled_event_uri: EV1_URI }], error: null }
    });
    vi.mocked(getSupabase).mockReturnValue(sb.client);
    const fetchMock = stubCalendlyFetch({
      events: [
        { uri: EV1_URI, created_at: "2020-02-01T00:00:00Z", start_time: "2020-03-01T10:00:00Z", status: "active" }
      ],
      invitees: [{ email: "a@b.com" }]
    });

    const result = await syncBookings();

    expect(result.updated).toEqual([]);
    expect(result.eventsChecked).toBe(1);
    expect(sb.update).not.toHaveBeenCalled();
    expect(inviteesCalled(fetchMock)).toBe(false);
  });
});
