import { afterEach, vi } from "vitest";

// Global isolation barrier: after every test, undo any global fetch stub, env
// stub, spy, or mock, and drop the module registry so memoized singletons
// (e.g. getSupabase / getRatelimit) are rebuilt fresh on the next dynamic
// import. Tests that need a clean module MUST use `await import(...)` after
// setting env, not a static top-of-file import.
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});
