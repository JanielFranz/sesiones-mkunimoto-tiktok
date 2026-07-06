import "dotenv/config";
import express from "express";
import path from "path";
import { getSupabase, checkSupabase } from "./server/supabase";
import { getPaymentProvider } from "./server/payments";
import { createSchedulingLink, getSchedulingMode } from "./server/scheduling";
import { syncBookings } from "./server/bookingSync";
import { CheckoutRequest, CheckoutResponse, HealthResponse } from "./src/types";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SESSION_PRICE_CENTS = Number(process.env.SESSION_PRICE_CENTS) || 3000;

app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// 1. Health — reports which payment/scheduling modes are active plus DB reach.
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  const body: HealthResponse = {
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    paymentMode: getPaymentProvider().name === "culqi" ? "live" : "mock",
    schedulingMode: getSchedulingMode(),
    supabase: await checkSupabase()
  };
  res.json(body);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Checkout — THE core invariant lives here: pay first, book after.
//    Yape charge (Culqi or mock) → record payment in Supabase →
//    on approval, mint a Calendly scheduling link and record the booking.
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/checkout", async (req, res) => {
  try {
    const { name, email, phone, otp, motive } = (req.body ?? {}) as Partial<CheckoutRequest>;

    // Validation — Peruvian mobile (9 digits, starts with 9) + 6-digit Yape OTP.
    const errors: string[] = [];
    if (!name?.trim()) errors.push("Ingresa tu nombre completo.");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Ingresa un correo válido.");
    if (!phone || !/^9\d{8}$/.test(phone)) errors.push("El celular debe tener 9 dígitos y empezar con 9.");
    if (!otp || !/^\d{6}$/.test(otp)) errors.push("El código de aprobación de Yape tiene 6 dígitos.");
    if (errors.length > 0) {
      return res.status(400).json({ status: "rejected", reason: errors.join(" ") } satisfies CheckoutResponse);
    }

    const provider = getPaymentProvider();
    const charge = await provider.createYapeCharge({
      amountCents: SESSION_PRICE_CENTS,
      currency: "PEN",
      phone: phone!,
      otp: otp!,
      email: email!,
      description: `Sesión de mentoría 1:1 con Kuni (${motive || "general"})`
    });

    // Record the attempt (approved OR rejected) — the audit trail is the point.
    const supabase = getSupabase();
    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .insert({
        provider: provider.name,
        provider_charge_id: charge.chargeId,
        amount_cents: SESSION_PRICE_CENTS,
        currency: "PEN",
        status: charge.status,
        rejection_reason: charge.rejectionReason ?? null,
        payer_name: name!.trim(),
        payer_email: email!.toLowerCase(),
        payer_phone: phone,
        motive: motive || null,
        raw_response: charge.raw
      })
      .select("id")
      .single();
    if (payErr) throw new Error(`Supabase payments insert failed: ${payErr.message}`);

    if (charge.status === "rejected") {
      return res.status(402).json({
        status: "rejected",
        reason: charge.rejectionReason || "El pago fue rechazado. Inténtalo nuevamente."
      } satisfies CheckoutResponse);
    }

    // Approved → mint the scheduling link (single-use when Calendly API is configured).
    const link = await createSchedulingLink({ name: name!, email: email!, motive: motive || "" });
    const { error: bookErr } = await supabase.from("bookings").insert({
      payment_id: payment.id,
      scheduling_url: link.url,
      scheduling_provider: link.provider,
      single_use: link.singleUse,
      status: "link_issued"
    });
    if (bookErr) {
      // Payment is approved and recorded — never dead-end the customer over a
      // bookkeeping failure. Log it and still hand over the link.
      console.error("Supabase bookings insert failed:", bookErr.message);
    }

    return res.json({
      status: "approved",
      paymentId: payment.id,
      schedulingUrl: link.url,
      singleUse: link.singleUse
    } satisfies CheckoutResponse);
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({
      status: "rejected",
      reason: "Error interno procesando el pago. Inténtalo de nuevo en unos minutos."
    } satisfies CheckoutResponse);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Culqi webhook — server-side charge status confirmations.
//    Stub while CULQI_MODE=mock; with live keys, verify the event and update
//    payments.status by provider_charge_id.
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/webhooks/culqi", async (req, res) => {
  console.log("[culqi webhook] received:", JSON.stringify(req.body).slice(0, 500));
  // TODO(live): validate the event's authenticity, then reconcile:
  //   update payments set status=<event status> where provider_charge_id=<event charge id>
  res.status(200).json({ received: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Booking sync — flips link_issued → scheduled by polling Calendly.
//    Runs on an interval (below) and on demand via this endpoint.
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/bookings/sync", async (req, res) => {
  try {
    const result = await syncBookings();
    res.json(result);
  } catch (error: any) {
    console.error("Booking sync error:", error);
    res.status(500).json({ error: error?.message || "sync failed" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Vite dev middleware / static hosting
// ─────────────────────────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === "production";

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
