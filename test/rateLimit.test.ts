import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Upstash mocks ───────────────────────────────────────────────────────────
// rateLimit.ts imports `Ratelimit` from "@upstash/ratelimit" and `Redis` from
// "@upstash/redis". These module mocks are hoisted above the imports and, unlike
// env/module-registry state, SURVIVE vi.resetModules() — so re-importing the
// module under test per test still gets the fake Ratelimit whose .limit() we
// steer through a hoisted mutable holder.
const h = vi.hoisted(() => ({ limitImpl: vi.fn() }));

vi.mock("@upstash/redis", () => ({ Redis: class {} }));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow() {
      return {};
    }
    limit(...a: unknown[]) {
      return h.limitImpl(...a);
    }
  }
}));

/**
 * getRatelimit() memoizes its Ratelimit|null decision in a module-level var on
 * first use, reading UPSTASH_* from env exactly once. To exercise a different
 * env state we must stub the vars, drop the module registry, and re-import so a
 * fresh module (with a fresh memo cell) is evaluated.
 */
async function loadMiddleware(url: string, token: string) {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", url);
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", token);
  vi.resetModules();
  const mod = await import("../server/rateLimit.js");
  return mod.checkoutRateLimit;
}

function makeRes() {
  return {
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  } as any;
}

function makeCtx() {
  const req = { ip: "1.2.3.4" } as any;
  const res = makeRes();
  const next = vi.fn();
  return { req, res, next };
}

describe("checkoutRateLimit", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("fails OPEN (allows) with limiting disabled when UPSTASH env vars are unset", async () => {
    const checkoutRateLimit = await loadMiddleware("", "");
    const { req, res, next } = makeCtx();

    await checkoutRateLimit(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    // Feature disabled: returns early — never touches Redis, never short-circuits
    // the request, and never emits rate-limit headers.
    expect(h.limitImpl).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  it("allows and sets the rate-limit headers when configured and under the limit", async () => {
    h.limitImpl.mockResolvedValue({ success: true, limit: 5, remaining: 4 });
    const checkoutRateLimit = await loadMiddleware("https://x.upstash.io", "t");
    const { req, res, next } = makeCtx();

    await checkoutRateLimit(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", "5");
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", "4");
    expect(res.status).not.toHaveBeenCalled();
    // Keyed on the caller's IP so limiting is per-client, and consulted exactly once.
    expect(h.limitImpl).toHaveBeenCalledTimes(1);
    expect(h.limitImpl).toHaveBeenCalledWith("1.2.3.4");
  });

  it("keys the limiter on 'unknown' when req.ip is undefined (missing IP must still be limited, not crash)", async () => {
    h.limitImpl.mockResolvedValue({ success: true, limit: 5, remaining: 4 });
    const checkoutRateLimit = await loadMiddleware("https://x.upstash.io", "t");
    // Build the request WITHOUT going through makeCtx: a default parameter would
    // fire on `undefined` and silently substitute an IP, hiding this branch.
    const req = {} as any; // no `ip` property at all → req.ip is undefined
    const res = makeRes();
    const next = vi.fn();

    await checkoutRateLimit(req, res, next);

    // The `req.ip ?? "unknown"` fallback: a request with no IP is still scored.
    expect(h.limitImpl).toHaveBeenCalledWith("unknown");
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rejects with 429 and a rejected body when over the limit, without calling next", async () => {
    h.limitImpl.mockResolvedValue({ success: false, limit: 5, remaining: 0 });
    const checkoutRateLimit = await loadMiddleware("https://x.upstash.io", "t");
    const { req, res, next } = makeCtx();

    await checkoutRateLimit(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "rejected" })
    );
    // Headers are emitted BEFORE the success check, so a throttled caller still
    // learns their limit/remaining — assert both are set with the stringified
    // values from the limiter response (not the allowed-path values).
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", "5");
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", "0");
    // A human-facing reason must accompany the rejection.
    const body = res.json.mock.calls[0][0];
    expect(typeof body.reason).toBe("string");
    expect(body.reason.length).toBeGreaterThan(0);
    expect(next).not.toHaveBeenCalled();
  });

  it("fails OPEN (allows) and logs when the Redis call errors — an outage must not block paying customers", async () => {
    h.limitImpl.mockRejectedValue(new Error("redis down"));
    const checkoutRateLimit = await loadMiddleware("https://x.upstash.io", "t");
    const { req, res, next } = makeCtx();

    await checkoutRateLimit(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
