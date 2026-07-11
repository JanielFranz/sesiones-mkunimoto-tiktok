import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPaymentProvider } from "../server/payments.js";
import type { YapeChargeInput } from "../server/payments.js";

const PAYMENTS_ENDPOINT = "https://api.mercadopago.com/v1/payments";

/** A complete, valid Yape charge input; override fields per test. */
function chargeInput(overrides: Partial<YapeChargeInput> = {}): YapeChargeInput {
  return {
    amountCents: 3000,
    currency: "PEN",
    phone: "999888777",
    otp: "123456",
    email: "sofia@example.com",
    description: "Sesión Kuni",
    ...overrides
  };
}

// ─── A) getPaymentProvider() selection ───────────────────────────────────────
// Baseline env (vitest.config.ts) pins PAYMENT_MODE=mock; test/setup.ts's
// afterEach unstubs every env between tests, so each case starts from that
// baseline and per-test stubs never leak forward.
describe("getPaymentProvider — provider selection", () => {
  it("returns the mock provider under the pinned baseline (PAYMENT_MODE=mock)", () => {
    expect(getPaymentProvider().name).toBe("mercadopago_mock");
  });

  it("stays on mock when PAYMENT_MODE=live but MP_ACCESS_TOKEN is empty/unset", () => {
    vi.stubEnv("PAYMENT_MODE", "live");
    vi.stubEnv("MP_ACCESS_TOKEN", "");
    expect(getPaymentProvider().name).toBe("mercadopago_mock");
  });

  it("stays on mock when the access token is a MOCK placeholder (guard against fake keys)", () => {
    vi.stubEnv("PAYMENT_MODE", "live");
    vi.stubEnv("MP_ACCESS_TOKEN", "TEST-MOCK-1");
    expect(getPaymentProvider().name).toBe("mercadopago_mock");
  });

  it("stays on mock when a real token is present but PAYMENT_MODE is not live (mode gates, not the token)", () => {
    // Baseline PAYMENT_MODE=mock is left intact; only a plausible token is set.
    vi.stubEnv("MP_ACCESS_TOKEN", "APP_USR-real-but-mode-is-mock");
    expect(getPaymentProvider().name).toBe("mercadopago_mock");
  });

  it("selects the live mercadopago provider with a plausible token", () => {
    vi.stubEnv("PAYMENT_MODE", "live");
    vi.stubEnv("MP_ACCESS_TOKEN", "APP_USR-123");
    expect(getPaymentProvider().name).toBe("mercadopago");
  });
});

// ─── B) mock provider createYapeCharge ───────────────────────────────────────
describe("mock provider — createYapeCharge", () => {
  // Baseline env pins PAYMENT_MODE=mock, so getPaymentProvider() is the mock.
  it("rejects OTP 000000 as insufficient funds", async () => {
    const result = await getPaymentProvider().createYapeCharge(chargeInput({ otp: "000000" }));

    expect(result.status).toBe("rejected");
    expect(result.chargeId).toBeNull();
    expect(result.rejectionReason).toContain("Fondos");
    const raw = result.raw as any;
    expect(raw.status).toBe("rejected");
    expect(raw.status_detail).toBe("cc_rejected_insufficient_amount");
  });

  it("rejects OTP 111111 as an expired approval code", async () => {
    const result = await getPaymentProvider().createYapeCharge(chargeInput({ otp: "111111" }));

    expect(result.status).toBe("rejected");
    expect(result.chargeId).toBeNull();
    expect(result.rejectionReason ?? "").toMatch(/expir/i);
    const raw = result.raw as any;
    expect(raw.status).toBe("rejected");
    expect(raw.status_detail).toBe("cc_rejected_other_reason");
  });

  it("approves any other 6-digit OTP and echoes the charge details", async () => {
    // A deliberately non-round, non-price amount: 1550 → 15.5 proves the raw
    // amount is COMPUTED from amountCents/100, not a hardcoded 30.
    const input = chargeInput({ otp: "123456", amountCents: 1550, email: "crack@kuni.pe" });
    const result = await getPaymentProvider().createYapeCharge(input);

    expect(result.status).toBe("approved");
    expect(result.chargeId).toMatch(/^mp_mock_/);
    const raw = result.raw as any;
    expect(raw.id).toBe(result.chargeId); // raw echoes the same id the caller gets
    expect(raw.status).toBe("approved");
    expect(raw.transaction_amount).toBe(15.5); // amountCents / 100, not hardcoded
    expect(raw.currency_id).toBe("PEN");
    expect(raw.payment_method_id).toBe("yape");
    expect(raw.payer.email).toBe("crack@kuni.pe");
  });
});

// ─── C) live provider createYapeCharge (fetch stubbed) ───────────────────────
describe("live mercadopago provider — createYapeCharge", () => {
  beforeEach(() => {
    vi.stubEnv("PAYMENT_MODE", "live");
    vi.stubEnv("MP_ACCESS_TOKEN", "APP_USR-x");
    vi.stubEnv("MP_PUBLIC_KEY", "APP_PUB-x");
    // Belt-and-suspenders: keep test output clean if any codepath ever logs.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("mints a Yape token then creates an approved payment, threading input through both calls", async () => {
    // Distinctive amount (1550 → 15.5) so transaction_amount can't be a hardcode.
    const input = chargeInput({ amountCents: 1550, phone: "912345678", otp: "654321", email: "pata@kuni.pe" });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "tok_1" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 123, status: "approved" }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPaymentProvider().createYapeCharge(input);

    expect(result).toMatchObject({ status: "approved", chargeId: "123" });

    // Two calls: (1) Yape token endpoint, (2) the payments endpoint.
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Call 1 hits the Yape token endpoint carrying the ACTUAL public key and the
    // payer's phone + OTP (the whole point of the token step).
    const tokenUrl = fetchMock.mock.calls[0][0] as string;
    expect(tokenUrl).toContain("/yape/");
    expect(tokenUrl).toContain("public_key=APP_PUB-x");
    const tokenBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(tokenBody.phoneNumber).toBe("912345678");
    expect(tokenBody.otp).toBe("654321");

    // Call 2 posts to /v1/payments with Bearer auth and the minted token; body
    // carries the computed amount and the caller's identity.
    const [payUrl, payOpts] = fetchMock.mock.calls[1];
    expect(payUrl).toBe(PAYMENTS_ENDPOINT);
    expect(payOpts.method).toBe("POST");
    expect(payOpts.headers.Authorization).toBe("Bearer APP_USR-x");
    const body = JSON.parse(payOpts.body as string);
    expect(body.token).toBe("tok_1");
    expect(body.payment_method_id).toBe("yape");
    expect(body.installments).toBe(1);
    expect(body.transaction_amount).toBe(15.5); // amountCents / 100, not hardcoded
    expect(body.payer.email).toBe("pata@kuni.pe");
    expect(body.description).toBe("Sesión Kuni");
  });

  it("accepts a token returned under the `token` field (not `id`) and threads it into the payment", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ token: "tok_field" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 789, status: "approved" }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPaymentProvider().createYapeCharge(chargeInput());

    expect(result).toMatchObject({ status: "approved", chargeId: "789" });
    // The `token.token` fallback value must be the source passed to the payment.
    const body = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(body.token).toBe("tok_field");
  });

  it("rejects when the Yape token call returns an HTTP error, without attempting a payment", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: "bad otp" }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPaymentProvider().createYapeCharge(chargeInput());

    expect(result.status).toBe("rejected");
    expect(result.chargeId).toBeNull();
    expect(result.rejectionReason).toBe("bad otp");
    // No second fetch: a failed token must short-circuit before charging.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects when the token endpoint returns 200 but no token id (falls back to the default reason)", async () => {
    // A real MP failure mode: HTTP 200 with an error-shaped body and no token.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ error: "invalid_otp" }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPaymentProvider().createYapeCharge(chargeInput());

    expect(result.status).toBe("rejected");
    expect(result.chargeId).toBeNull();
    expect(result.rejectionReason).toMatch(/No se pudo validar/i);
    // Missing token id must short-circuit before any payment attempt.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects (surfacing the charge id) when the payment status is not approved", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "tok_1" }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 456, status: "rejected", status_detail: "cc_rejected", message: "rechazado" })
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPaymentProvider().createYapeCharge(chargeInput());

    expect(result.status).toBe("rejected");
    expect(result.chargeId).toBe("456");
    expect(result.rejectionReason).toBe("rechazado");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects with a null charge id and a status_detail reason on an HTTP-error payment with no id/message", async () => {
    // Covers three branches at once: !paymentRes.ok, the null-chargeId path
    // (payment.id absent), and the rejectionReason fall-through to status_detail.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "tok_1" }) })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ status: "rejected", status_detail: "cc_rejected_bad_filled_other" })
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPaymentProvider().createYapeCharge(chargeInput());

    expect(result.status).toBe("rejected");
    expect(result.chargeId).toBeNull();
    expect(result.rejectionReason).toBe("cc_rejected_bad_filled_other");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
