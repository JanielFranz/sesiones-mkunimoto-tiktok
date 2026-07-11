import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";
import request from "supertest";

// ─── Mocks ───────────────────────────────────────────────────────────────────
// app.ts imports these siblings with "./x.js"; mocking "../server/x.js" hits the
// same resolved module id, so the app under test receives the mock. Everything
// except the rate-limit middleware is called at REQUEST time, so it can be
// reconfigured per-test via vi.mocked(...). The middleware is captured at
// route-definition time, so it goes through a hoisted mutable container.
const hoisted = vi.hoisted(() => ({
  rateLimit: {
    fn: (_req: any, _res: any, next: any) => next() as void
  }
}));

vi.mock("../server/payments.js", () => ({ getPaymentProvider: vi.fn() }));
vi.mock("../server/scheduling.js", () => ({
  createSchedulingLink: vi.fn(),
  getSchedulingMode: vi.fn()
}));
vi.mock("../server/supabase.js", () => ({ getSupabase: vi.fn(), checkSupabase: vi.fn() }));
vi.mock("../server/recaptcha.js", () => ({ verifyRecaptcha: vi.fn() }));
vi.mock("../server/bookingSync.js", () => ({ syncBookings: vi.fn() }));
vi.mock("../server/rateLimit.js", () => ({
  checkoutRateLimit: (req: any, res: any, next: any) => hoisted.rateLimit.fn(req, res, next)
}));

import { app } from "../server/app.js";
import { getPaymentProvider } from "../server/payments.js";
import { createSchedulingLink, getSchedulingMode } from "../server/scheduling.js";
import { getSupabase, checkSupabase } from "../server/supabase.js";
import { verifyRecaptcha } from "../server/recaptcha.js";
import { syncBookings } from "../server/bookingSync.js";

// ─── Supabase query-builder fake ─────────────────────────────────────────────
// Reproduces exactly the chains app.ts uses:
//   payments: .from("payments").insert().select("id").single()  → {data,error}
//   bookings: .from("bookings").insert()               (awaited) → {error}
//   webhook:  .from("payments").update().eq()          (awaited) → {error}
function makeSupabase(cfg: {
  paymentInsert?: { data: any; error: any };
  bookingInsert?: { error: any };
  paymentUpdate?: { error: any };
} = {}) {
  const paymentInsert = cfg.paymentInsert ?? { data: { id: "pay_1" }, error: null };
  const bookingInsert = cfg.bookingInsert ?? { error: null };
  const paymentUpdate = cfg.paymentUpdate ?? { error: null };

  const single = vi.fn(() => Promise.resolve(paymentInsert));
  const insertPayments = vi.fn((_row: any) => ({ select: vi.fn(() => ({ single })) }));
  const eq = vi.fn((_col: any, _val?: any) => Promise.resolve(paymentUpdate));
  const updatePayments = vi.fn((_patch: any) => ({ eq }));
  const insertBookings = vi.fn((_row: any) => Promise.resolve(bookingInsert));

  const from = vi.fn((table: string) => {
    if (table === "payments") return { insert: insertPayments, update: updatePayments };
    if (table === "bookings") return { insert: insertBookings };
    return {};
  });
  return { client: { from } as any, from, insertPayments, insertBookings, updatePayments, eq };
}

const validCheckout = {
  name: "  Sofía Rojas ",
  email: "SOFIA@Example.com",
  phone: "999888777",
  otp: "123456",
  motive: "universitario",
  recaptchaToken: "tok"
};

let sb: ReturnType<typeof makeSupabase>;
let createYapeCharge: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});

  hoisted.rateLimit.fn = (_req, _res, next) => next();

  createYapeCharge = vi.fn().mockResolvedValue({ status: "approved", chargeId: "ch_1", raw: { ok: true } });
  vi.mocked(getPaymentProvider).mockReturnValue({ name: "mercadopago_mock", createYapeCharge } as any);
  vi.mocked(createSchedulingLink).mockResolvedValue({
    url: "https://calendly.com/d/abc",
    singleUse: true,
    provider: "calendly"
  });
  vi.mocked(getSchedulingMode).mockReturnValue("calendly-api");
  vi.mocked(checkSupabase).mockResolvedValue("connected");
  vi.mocked(verifyRecaptcha).mockResolvedValue({ success: true });
  vi.mocked(syncBookings).mockResolvedValue({ pending: 0, eventsChecked: 0, updated: [] });

  sb = makeSupabase();
  vi.mocked(getSupabase).mockReturnValue(sb.client);
});

describe("GET /api/health", () => {
  it("reports mode + connectivity", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok",
      paymentMode: "mock",
      schedulingMode: "calendly-api",
      supabase: "connected"
    });
  });

  it("reports paymentMode 'live' only when the provider is the real mercadopago", async () => {
    vi.mocked(getPaymentProvider).mockReturnValue({ name: "mercadopago", createYapeCharge } as any);
    const res = await request(app).get("/api/health");
    expect(res.body.paymentMode).toBe("live");
  });
});

describe("POST /api/checkout — happy path", () => {
  it("approves, persists the payment, mints a link, records the booking", async () => {
    const res = await request(app).post("/api/checkout").send(validCheckout);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "approved",
      paymentId: "pay_1",
      schedulingUrl: "https://calendly.com/d/abc",
      singleUse: true
    });

    // Charged the pinned S/30 (3000 cents) with the caller's OTP/phone/email.
    expect(createYapeCharge).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 3000, currency: "PEN", phone: "999888777", otp: "123456" })
    );
    // Payment row: trimmed name, lowercased email, approved status.
    const payRow = sb.insertPayments.mock.calls[0][0];
    expect(payRow).toMatchObject({ status: "approved", payer_name: "Sofía Rojas", payer_email: "sofia@example.com" });
    // Booking row: issued link, link_issued status.
    const bookRow = sb.insertBookings.mock.calls[0][0];
    expect(bookRow).toMatchObject({
      payment_id: "pay_1",
      scheduling_url: "https://calendly.com/d/abc",
      single_use: true,
      status: "link_issued"
    });
  });
});

describe("POST /api/checkout — guards run in the right order", () => {
  it("400s on validation errors before charging or scoring", async () => {
    const res = await request(app).post("/api/checkout").send({ ...validCheckout, name: " ", email: "nope", otp: "12" });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("rejected");
    expect(createYapeCharge).not.toHaveBeenCalled();
    // Validation precedes reCAPTCHA.
    expect(verifyRecaptcha).not.toHaveBeenCalled();
  });

  it("403s when reCAPTCHA fails, before charging", async () => {
    vi.mocked(verifyRecaptcha).mockResolvedValue({ success: false });
    const res = await request(app).post("/api/checkout").send(validCheckout);
    expect(res.status).toBe(403);
    expect(res.body.status).toBe("rejected");
    expect(createYapeCharge).not.toHaveBeenCalled();
  });

  it("429s from the rate-limit middleware before validation/reCAPTCHA/charge", async () => {
    hoisted.rateLimit.fn = (_req, res) => res.status(429).json({ status: "rejected", reason: "slow down" });
    const res = await request(app).post("/api/checkout").send(validCheckout);
    expect(res.status).toBe(429);
    expect(verifyRecaptcha).not.toHaveBeenCalled();
    expect(createYapeCharge).not.toHaveBeenCalled();
  });
});

describe("POST /api/checkout — payment + persistence outcomes", () => {
  it("402s on a rejected charge, still records the attempt, does NOT issue a booking", async () => {
    createYapeCharge.mockResolvedValue({
      status: "rejected",
      chargeId: null,
      rejectionReason: "Fondos insuficientes en la cuenta Yape.",
      raw: {}
    });
    const res = await request(app).post("/api/checkout").send(validCheckout);

    expect(res.status).toBe(402);
    expect(res.body.reason).toContain("Fondos");
    // Audit trail: the rejected attempt is still inserted…
    expect(sb.insertPayments).toHaveBeenCalledTimes(1);
    expect(sb.insertPayments.mock.calls[0][0]).toMatchObject({ status: "rejected" });
    // …but no scheduling link and no booking row.
    expect(createSchedulingLink).not.toHaveBeenCalled();
    expect(sb.insertBookings).not.toHaveBeenCalled();
  });

  it("500s when the payments insert fails (payment cannot be recorded)", async () => {
    sb = makeSupabase({ paymentInsert: { data: null, error: { message: "db down" } } });
    vi.mocked(getSupabase).mockReturnValue(sb.client);
    const res = await request(app).post("/api/checkout").send(validCheckout);
    expect(res.status).toBe(500);
    expect(res.body.status).toBe("rejected");
  });

  it("still returns approved when only the bookings insert fails (never dead-end a paid customer)", async () => {
    sb = makeSupabase({ bookingInsert: { error: { message: "bookings down" } } });
    vi.mocked(getSupabase).mockReturnValue(sb.client);
    const res = await request(app).post("/api/checkout").send(validCheckout);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
    expect(res.body.schedulingUrl).toBe("https://calendly.com/d/abc");
    expect(console.error).toHaveBeenCalled();
  });
});

describe("POST /api/webhooks/mercadopago", () => {
  const secret = "whsec_test";
  const reqId = "req-123";
  const dataId = "999";

  function signedHeaders(id = dataId) {
    const ts = "1700000000";
    const manifest = `id:${id};request-id:${reqId};ts:${ts};`;
    const v1 = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
    return { "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": reqId };
  }

  it("always acks 200 and does NOT reconcile on a missing/invalid signature", async () => {
    vi.stubEnv("MP_WEBHOOK_SECRET", secret);
    const res = await request(app)
      .post("/api/webhooks/mercadopago")
      .send({ type: "payment", data: { id: dataId } });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(sb.updatePayments).not.toHaveBeenCalled();
  });

  it("verifies a good signature, fetches the payment, and reconciles payments.status", async () => {
    vi.stubEnv("MP_WEBHOOK_SECRET", secret);
    vi.stubEnv("MP_ACCESS_TOKEN", "AT");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 999, status: "approved" }) });
    vi.stubGlobal("fetch", fetchMock);

    const res = await request(app)
      .post("/api/webhooks/mercadopago")
      .set(signedHeaders())
      .send({ type: "payment", data: { id: dataId } });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.mercadopago.com/v1/payments/999",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer AT" }) })
    );
    expect(sb.updatePayments).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved" })
    );
    expect(sb.eq).toHaveBeenCalledWith("provider_charge_id", "999");
  });
});

describe("bookings/sync endpoints", () => {
  it("POST triggers a sync and returns its result", async () => {
    vi.mocked(syncBookings).mockResolvedValue({ pending: 2, eventsChecked: 5, updated: [] });
    const res = await request(app).post("/api/bookings/sync");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ pending: 2, eventsChecked: 5 });
  });

  it("GET runs the sync when no CRON_SECRET is configured", async () => {
    const res = await request(app).get("/api/bookings/sync");
    expect(res.status).toBe(200);
    expect(syncBookings).toHaveBeenCalled();
  });

  it("GET rejects with 401 when CRON_SECRET is set but the Bearer token is missing/wrong", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    const res = await request(app).get("/api/bookings/sync").set("authorization", "Bearer nope");
    expect(res.status).toBe(401);
    expect(syncBookings).not.toHaveBeenCalled();
  });

  it("GET runs the sync when CRON_SECRET matches the Bearer token", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    const res = await request(app).get("/api/bookings/sync").set("authorization", "Bearer s3cret");
    expect(res.status).toBe(200);
    expect(syncBookings).toHaveBeenCalled();
  });

  it("500s when the sync throws", async () => {
    vi.mocked(syncBookings).mockRejectedValue(new Error("calendly exploded"));
    const res = await request(app).post("/api/bookings/sync");
    expect(res.status).toBe(500);
    expect(res.body.error).toContain("calendly");
  });
});
