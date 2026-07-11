import { defineConfig } from "vitest/config";

// Standalone from vite.config.ts on purpose: the React + Tailwind plugins are
// irrelevant to these tests (all logic under test is plain TS / Express), and
// loading them would only slow the run and pull a DOM toolchain we don't need.
export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.ts"],
    // Clear mock call history before every test so counts (toHaveBeenCalled…)
    // never leak between tests. Only clears history, not implementations —
    // per-test beforeEach still sets return values.
    clearMocks: true,
    // Deterministic, secret-free env for every test. DOTENV_CONFIG_PATH points
    // `import "dotenv/config"` at an empty file so the real .env never loads;
    // these pins are then the entire baseline (each test stubs what it needs).
    env: {
      DOTENV_CONFIG_PATH: "test/empty.env",
      NODE_ENV: "test",
      SESSION_PRICE_CENTS: "3000",
      PAYMENT_MODE: "mock"
    },
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      // Coverage is a server-quality metric here; the front end has one pure
      // logic module (roadmap) which is tested but not part of the % target.
      include: ["server/**/*.ts"],
      exclude: ["**/*.d.ts"]
    }
  }
});
