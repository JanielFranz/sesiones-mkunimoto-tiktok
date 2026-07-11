import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSchedulingMode, createSchedulingLink } from "../server/scheduling.js";

const SCHEDULING_LINKS = "https://api.calendly.com/scheduling_links";

const input = { name: "Sofía Rojas", email: "sofia@example.com", motive: "universidad_inicial" };

/** Build a fake fetch that resolves with a successful single-use link payload. */
function stubFetchOk(bookingUrl = "https://calendly.com/d/xyz") {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ resource: { booking_url: bookingUrl } }) });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("getSchedulingMode", () => {
  it("returns 'calendly-api' when both CALENDLY_API_TOKEN and CALENDLY_EVENT_TYPE_URI are set", () => {
    vi.stubEnv("CALENDLY_API_TOKEN", "tok");
    vi.stubEnv("CALENDLY_EVENT_TYPE_URI", "https://api.calendly.com/event_types/ET1");
    expect(getSchedulingMode()).toBe("calendly-api");
  });

  it("returns 'public-link-fallback' when the token is missing", () => {
    vi.stubEnv("CALENDLY_API_TOKEN", "");
    vi.stubEnv("CALENDLY_EVENT_TYPE_URI", "https://api.calendly.com/event_types/ET1");
    expect(getSchedulingMode()).toBe("public-link-fallback");
  });

  it("returns 'public-link-fallback' when the event-type URI is missing", () => {
    vi.stubEnv("CALENDLY_API_TOKEN", "tok");
    vi.stubEnv("CALENDLY_EVENT_TYPE_URI", "");
    expect(getSchedulingMode()).toBe("public-link-fallback");
  });

  it("returns 'public-link-fallback' when both are missing", () => {
    vi.stubEnv("CALENDLY_API_TOKEN", "");
    vi.stubEnv("CALENDLY_EVENT_TYPE_URI", "");
    expect(getSchedulingMode()).toBe("public-link-fallback");
  });
});

describe("createSchedulingLink — public-link-fallback mode", () => {
  beforeEach(() => {
    // Ensure API mode is OFF for these tests.
    vi.stubEnv("CALENDLY_API_TOKEN", "");
    vi.stubEnv("CALENDLY_EVENT_TYPE_URI", "");
  });

  it("returns the public CALENDLY_URL (not single-use) without calling fetch", async () => {
    vi.stubEnv("CALENDLY_URL", "https://calendly.com/kuni/mentoria");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await createSchedulingLink(input);

    expect(result).toEqual({
      url: "https://calendly.com/kuni/mentoria",
      singleUse: false,
      provider: "calendly"
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws when CALENDLY_URL is unset (no fallback target)", async () => {
    vi.stubEnv("CALENDLY_URL", "");
    await expect(createSchedulingLink(input)).rejects.toThrow(/CALENDLY_URL/);
  });
});

describe("createSchedulingLink — calendly-api mode", () => {
  const token = "cal_tok_123";
  const eventTypeUri = "https://api.calendly.com/event_types/ET1";

  beforeEach(() => {
    vi.stubEnv("CALENDLY_API_TOKEN", token);
    vi.stubEnv("CALENDLY_EVENT_TYPE_URI", eventTypeUri);
    // A public URL is present so any fallback path has a target to return.
    vi.stubEnv("CALENDLY_URL", "https://calendly.com/kuni/mentoria");
    // Silence the module's console.error on the fallback branches.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("mints a TRUE single-use link and POSTs the correct request to Calendly", async () => {
    const fetchMock = stubFetchOk("https://calendly.com/d/xyz");

    const result = await createSchedulingLink(input);

    expect(result).toEqual({
      url: "https://calendly.com/d/xyz",
      singleUse: true,
      provider: "calendly"
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(SCHEDULING_LINKS);
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe(`Bearer ${token}`);
    expect(options.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(options.body);
    expect(body.max_event_count).toBe(1);
    expect(body.owner).toBe(eventTypeUri);
    expect(body.owner_type).toBe("EventType");
  });

  it("falls back to the public link on a non-ok response — ignoring any body it might carry", async () => {
    // The non-ok response ALSO carries a valid-looking booking_url. A correct
    // impl must key off res.ok and never read this json; if the `!res.ok` guard
    // were removed, the code would parse this and return a (wrong) single-use
    // link, so this asserts the guard is actually exercised — not the catch path.
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "boom",
      json: async () => ({ resource: { booking_url: "https://calendly.com/d/MUST-NOT-USE" } })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await createSchedulingLink(input);

    expect(fetchMock).toHaveBeenCalledTimes(1); // the API was actually attempted, then fell back
    expect(result).toEqual({
      url: "https://calendly.com/kuni/mentoria",
      singleUse: false,
      provider: "calendly"
    });
    expect(console.error).toHaveBeenCalled();
  });

  it("falls back to the public link when the response is ok but missing booking_url", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ resource: {} }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await createSchedulingLink(input);

    expect(fetchMock).toHaveBeenCalledTimes(1); // proves it went through API mode, not fallback mode
    expect(result).toEqual({
      url: "https://calendly.com/kuni/mentoria",
      singleUse: false,
      provider: "calendly"
    });
  });

  it("falls back when booking_url is present but empty (falsy, not just undefined)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ resource: { booking_url: "" } }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await createSchedulingLink(input);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      url: "https://calendly.com/kuni/mentoria",
      singleUse: false,
      provider: "calendly"
    });
  });

  it("falls back to the public link when the fetch call itself throws", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createSchedulingLink(input);

    expect(fetchMock).toHaveBeenCalledTimes(1); // the API was attempted before falling back
    expect(result).toEqual({
      url: "https://calendly.com/kuni/mentoria",
      singleUse: false,
      provider: "calendly"
    });
    expect(console.error).toHaveBeenCalled();
  });
});
