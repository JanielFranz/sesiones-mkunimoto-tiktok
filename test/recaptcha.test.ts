import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyRecaptcha } from "../server/recaptcha.js";

const SITEVERIFY = "https://www.google.com/recaptcha/api/siteverify";

/** Build a fake fetch that resolves with the given siteverify JSON payload. */
function stubFetchJson(payload: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({ json: async () => payload });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("verifyRecaptcha", () => {
  beforeEach(() => {
    // Silence the module's console.warn/error on the reject/fail-open paths.
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("allows (feature-disabled) when no secret key is configured, without calling Google", async () => {
    // No RECAPTCHA_SECRET_KEY in env.
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "");
    const fetchMock = stubFetchJson({ success: true, action: "checkout", score: 0.9 });

    const result = await verifyRecaptcha("some-token", "1.2.3.4");

    expect(result.success).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects when configured but no token is supplied (a bot could otherwise omit the field)", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "secret");
    const fetchMock = stubFetchJson({ success: true, action: "checkout", score: 0.9 });

    const result = await verifyRecaptcha(undefined, "1.2.3.4");

    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("approves a genuine token with a passing score and correct action", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "secret");
    const fetchMock = stubFetchJson({ success: true, action: "checkout", score: 0.9 });

    const result = await verifyRecaptcha("tok", "9.9.9.9");

    expect(result).toEqual({ success: true, score: 0.9 });
    // Posts token + secret (+ remoteip) to Google's siteverify endpoint.
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(SITEVERIFY);
    expect(options.method).toBe("POST");
    const body = options.body as URLSearchParams;
    expect(body.get("secret")).toBe("secret");
    expect(body.get("response")).toBe("tok");
    expect(body.get("remoteip")).toBe("9.9.9.9");
  });

  it("rejects when the score is below the 0.5 threshold", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "secret");
    stubFetchJson({ success: true, action: "checkout", score: 0.3 });

    const result = await verifyRecaptcha("tok");

    expect(result.success).toBe(false);
    expect(result.score).toBe(0.3);
  });

  it("approves at exactly the 0.5 boundary", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "secret");
    stubFetchJson({ success: true, action: "checkout", score: 0.5 });

    const result = await verifyRecaptcha("tok");

    expect(result.success).toBe(true);
  });

  it("rejects when the action does not match 'checkout' (token replayed from another form)", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "secret");
    stubFetchJson({ success: true, action: "login", score: 0.9 });

    const result = await verifyRecaptcha("tok");

    expect(result.success).toBe(false);
  });

  it("rejects when Google reports success:false regardless of score", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "secret");
    stubFetchJson({ success: false, "error-codes": ["invalid-input-response"] });

    const result = await verifyRecaptcha("tok");

    expect(result.success).toBe(false);
  });

  it("treats a missing score as 0 and rejects", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "secret");
    stubFetchJson({ success: true, action: "checkout" });

    const result = await verifyRecaptcha("tok");

    expect(result.success).toBe(false);
  });

  it("omits remoteip from the request when it is not provided", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "secret");
    const fetchMock = stubFetchJson({ success: true, action: "checkout", score: 0.9 });

    await verifyRecaptcha("tok");

    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.has("remoteip")).toBe(false);
  });

  it("fails OPEN (allows) when the siteverify request itself throws — a Google outage must not block paying customers", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "secret");
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyRecaptcha("tok");

    expect(result.success).toBe(true);
    expect(console.error).toHaveBeenCalled();
  });
});
