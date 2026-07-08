/**
 * Payment providers for the Yape "código de aprobación" (OTP) flow.
 *
 * Two implementations behind one interface:
 *  - mock        — deterministic simulation, no external calls (PAYMENT_MODE=mock).
 *  - mercadopago — the real thing: a Yape token (public key) then a payment
 *                  (access token). Activates when PAYMENT_MODE=live and a real
 *                  access token is present. NOTE: written per Mercado Pago's
 *                  documented API but not yet exercised against real keys —
 *                  verify when keys arrive.
 *
 * Swapping mock → live is a .env change only; no code changes elsewhere.
 */

export interface YapeChargeInput {
  amountCents: number;
  currency: "PEN";
  /** 9-digit Peruvian mobile tied to the payer's Yape account. */
  phone: string;
  /** 6-digit approval code from the Yape app. */
  otp: string;
  email: string;
  description: string;
}

export interface YapeChargeResult {
  status: "approved" | "rejected";
  chargeId: string | null;
  rejectionReason?: string;
  /** Full provider response, persisted to payments.raw_response for audit. */
  raw: unknown;
}

export interface PaymentProvider {
  /** Persisted into payments.provider. */
  name: string;
  createYapeCharge(input: YapeChargeInput): Promise<YapeChargeResult>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock provider — simulates Mercado Pago's approve/reject responses locally.
//
// Test recipes (any 9-digit phone starting with 9):
//   OTP 000000 → rejected (insufficient funds)
//   OTP 111111 → rejected (expired approval code)
//   any other 6-digit OTP → approved
// ─────────────────────────────────────────────────────────────────────────────
const mockProvider: PaymentProvider = {
  name: "mercadopago_mock",
  async createYapeCharge(input) {
    // Simulate network + processing latency so the UI's loading state is honest.
    await new Promise((r) => setTimeout(r, 600));

    const reject = (reason: string, code: string): YapeChargeResult => ({
      status: "rejected",
      chargeId: null,
      rejectionReason: reason,
      raw: { status: "rejected", mock: true, status_detail: code, message: reason }
    });

    if (input.otp === "000000") {
      return reject("Fondos insuficientes en la cuenta Yape.", "cc_rejected_insufficient_amount");
    }
    if (input.otp === "111111") {
      return reject("El código de aprobación expiró. Genera uno nuevo en Yape.", "cc_rejected_other_reason");
    }

    const chargeId = `mp_mock_${Math.random().toString(36).slice(2, 12)}`;
    return {
      status: "approved",
      chargeId,
      raw: {
        mock: true,
        id: chargeId,
        status: "approved",
        transaction_amount: input.amountCents / 100,
        currency_id: input.currency,
        payer: { email: input.email },
        payment_method_id: "yape"
      }
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Live Mercado Pago provider — Yape token (public key) then payment (access
// token). Raw fetch(), no SDK — mirrors the previous Culqi implementation's
// style and sidesteps the Node SDK's in-flux Order-API-vs-legacy-Payment-API
// docs (see server/payments.ts history / CLAUDE.md).
// ─────────────────────────────────────────────────────────────────────────────
const mercadoPagoProvider: PaymentProvider = {
  name: "mercadopago",
  async createYapeCharge(input) {
    const publicKey = process.env.MP_PUBLIC_KEY!;
    const accessToken = process.env.MP_ACCESS_TOKEN!;

    // 1) Yape token — phone + OTP against the Yape token endpoint (public key).
    const tokenRes = await fetch(
      `https://api.mercadopago.com/platforms/pci/yape/v1/payment?public_key=${encodeURIComponent(publicKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: input.phone,
          otp: input.otp,
          requestId: `kuni_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
        })
      }
    );
    const token = (await tokenRes.json()) as { id?: string; token?: string; message?: string; error?: string };
    const tokenId = token.id || token.token;
    if (!tokenRes.ok || !tokenId) {
      return {
        status: "rejected",
        chargeId: null,
        rejectionReason: token.message || "No se pudo validar el código de Yape.",
        raw: token
      };
    }

    // 2) Payment — token as source, access token (Bearer) auth. Yape is modeled
    //    as a debit-card-like method: installments must be 1.
    const paymentRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Idempotency-Key": `kuni_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      },
      body: JSON.stringify({
        transaction_amount: input.amountCents / 100,
        token: tokenId,
        description: input.description,
        installments: 1,
        payment_method_id: "yape",
        payer: { email: input.email }
      })
    });
    const payment = (await paymentRes.json()) as {
      id?: number | string;
      status?: string;
      status_detail?: string;
      message?: string;
    };
    if (!paymentRes.ok || !payment.id || payment.status !== "approved") {
      return {
        status: "rejected",
        chargeId: payment.id ? String(payment.id) : null,
        rejectionReason: payment.message || payment.status_detail || "El pago fue rechazado.",
        raw: payment
      };
    }

    return { status: "approved", chargeId: String(payment.id), raw: payment };
  }
};

/** Mock unless PAYMENT_MODE=live with plausible (non-placeholder) keys. */
export function getPaymentProvider(): PaymentProvider {
  const mode = (process.env.PAYMENT_MODE || "mock").toLowerCase();
  const accessToken = process.env.MP_ACCESS_TOKEN || "";
  const isLive = mode === "live" && accessToken.length > 0 && !accessToken.includes("MOCK");
  return isLive ? mercadoPagoProvider : mockProvider;
}
