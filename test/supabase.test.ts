import { describe, it, expect, vi, beforeEach } from "vitest";

// The Supabase SDK is mocked so createClient returns a fake client we control.
// A hoisted holder lets each test swap in whatever fake client it needs before
// triggering the (memoized) getSupabase().
const h = vi.hoisted(() => ({ client: null as any }));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => h.client) }));

import { createClient } from "@supabase/supabase-js";

// getSupabase() caches its client in a module-level variable, so every test
// resets the module registry and re-imports to start from a clean slate.
async function freshImport() {
  vi.resetModules();
  return import("../server/supabase.js");
}

beforeEach(() => {
  h.client = null;
});

describe("getSupabase", () => {
  it("throws when SUPABASE_URL is missing", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    const { getSupabase } = await freshImport();

    expect(() => getSupabase()).toThrow(/SUPABASE_URL/);
    expect(vi.mocked(createClient)).not.toHaveBeenCalled();
  });

  it("throws when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
    vi.stubEnv("SUPABASE_URL", "http://localhost");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const { getSupabase } = await freshImport();

    expect(() => getSupabase()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(vi.mocked(createClient)).not.toHaveBeenCalled();
  });

  it("builds and returns the client with service-role, session-less auth options", async () => {
    vi.stubEnv("SUPABASE_URL", "http://localhost");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    h.client = { id: "fake-client" };
    const { getSupabase } = await freshImport();

    const result = getSupabase();

    expect(result).toBe(h.client);
    expect(vi.mocked(createClient)).toHaveBeenCalledWith("http://localhost", "svc", {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  });

  it("memoizes: repeated calls return the same instance and only construct once", async () => {
    vi.stubEnv("SUPABASE_URL", "http://localhost");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    h.client = { id: "fake-client" };
    const { getSupabase } = await freshImport();

    const first = getSupabase();
    const second = getSupabase();

    expect(first).toBe(second);
    expect(vi.mocked(createClient)).toHaveBeenCalledTimes(1);
  });
});

describe("checkSupabase", () => {
  // Install a fake client whose terminal .from().select() yields `outcome`
  // (a value to resolve with, or a factory returning a promise, so a test can
  // make it reject). Returns the spies so a test can assert the probe SHAPE —
  // otherwise a probe against the wrong table or without `head:true` (a full
  // table scan instead of a cheap count) would still pass unnoticed.
  function stubProbe(outcome: { error: unknown } | (() => Promise<unknown>)) {
    const select = vi.fn(() =>
      typeof outcome === "function" ? outcome() : Promise.resolve(outcome)
    );
    const from = vi.fn((_t: string) => ({ select }));
    h.client = { from };
    return { from, select };
  }

  it("probes payments with a head-only count and returns 'connected' when the query has no error", async () => {
    vi.stubEnv("SUPABASE_URL", "http://localhost");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    const { from, select } = stubProbe({ error: null });
    const { checkSupabase } = await freshImport();

    await expect(checkSupabase()).resolves.toBe("connected");
    // The health probe must stay cheap and hit the right table: a head-only
    // exact-count select of a single column on `payments`.
    expect(from).toHaveBeenCalledWith("payments");
    expect(select).toHaveBeenCalledWith("id", { count: "exact", head: true });
  });

  it("returns 'error' when the probe query resolves with a Supabase error", async () => {
    vi.stubEnv("SUPABASE_URL", "http://localhost");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    stubProbe({ error: { message: "relation \"payments\" does not exist" } });
    const { checkSupabase } = await freshImport();

    await expect(checkSupabase()).resolves.toBe("error");
  });

  it("returns 'error' when the probe query itself rejects (network/connection failure)", async () => {
    // Distinct from the resolve-with-error path: the awaited query throws, so
    // the try/catch — not the `error ? ...` ternary — produces "error".
    vi.stubEnv("SUPABASE_URL", "http://localhost");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    stubProbe(() => Promise.reject(new Error("ECONNREFUSED")));
    const { checkSupabase } = await freshImport();

    await expect(checkSupabase()).resolves.toBe("error");
  });

  it("returns 'error' when getSupabase throws (missing env) — caught, never propagated", async () => {
    // No SUPABASE_URL / SERVICE_ROLE_KEY: getSupabase() throws inside the try.
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const { checkSupabase } = await freshImport();

    await expect(checkSupabase()).resolves.toBe("error");
  });
});
