import path from "path";
import express from "express";
import { app } from "./server/app";
import { getPaymentProvider } from "./server/payments";
import { getSchedulingMode } from "./server/scheduling";
import { syncBookings } from "./server/bookingSync";

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === "production";

// ─────────────────────────────────────────────────────────────────────────────
// Vite dev middleware / static hosting — local process only. On Vercel, the
// frontend is built and served as static output separately (see api/index.ts
// + vercel.json); this file is never imported there.
// ─────────────────────────────────────────────────────────────────────────────
async function setupFrontend() {
  if (!isProd) {
    console.log("🛠️ Starting Vite Dev Server bridge...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`📦 Serving static compiled build from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Kuni Mentorship server listening on http://0.0.0.0:${PORT}`);
    console.log(`   payment: ${getPaymentProvider().name} · scheduling: ${getSchedulingMode()}`);
  });

  // Periodic booking sync (only meaningful with a real Calendly token).
  // BOOKING_SYNC_INTERVAL_MS: default 5 min; set 0 to disable.
  const syncInterval = Number(process.env.BOOKING_SYNC_INTERVAL_MS ?? 300_000);
  if (getSchedulingMode() === "calendly-api" && syncInterval > 0) {
    setInterval(async () => {
      try {
        const result = await syncBookings();
        if (result.updated.length > 0) {
          console.log(`📅 booking sync: ${result.updated.length} booking(s) flipped to 'scheduled'.`);
        }
      } catch (err) {
        console.error("Periodic booking sync failed:", err);
      }
    }, syncInterval).unref();
    console.log(`   booking sync: every ${Math.round(syncInterval / 1000)}s`);
  }
}

setupFrontend();
