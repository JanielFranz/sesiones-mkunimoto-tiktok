/**
 * Payment providers for the Yape "código de aprobación" (OTP) flow.
 *
 * Two implementations behind one interface:
 *  - mock  — deterministic simulation, no external calls (CULQI_MODE=mock).
 *  - culqi — the real thing: Yape token with the PUBLIC key, then a charge
 *            with the SECRET key. Activates when CULQI_MODE=live and real
 *            keys are present. NOTE: written per Culqi's documented API but
 *            not yet exercised against real keys — verify when keys arrive.
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
// Mock provider — simulates Culqi's approve/reject responses locally.
//
// Test recipes (any 9-digit phone starting with 9):
//   OTP 000000 → rejected (insufficient funds)
//   OTP 111111 → rejected (expired approval code)
//   any other 6-digit OTP → approved
// ─────────────────────────────────────────────────────────────────────────────
const mockProvider: PaymentProvider = {
  name: "culqi_mock",
  async createYapeCharge(input) {
    // Simulate network + processing latency so the UI's loading state is honest.
    await new Promise((r) => setTimeout(r, 600));

    const reject = (reason: string, code: string): YapeChargeResult => ({
      status: "rejected",
      chargeId: null,
      rejectionReason: reason,
      raw: { object: "error", mock: true, merchant_message: reason, code }
    });

    if (input.otp === "000000") {
      return reject("Fondos insuficientes en la cuenta Yape.", "insufficient_funds");
    }
    if (input.otp === "111111") {
      return reject("El código de aprobación expiró. Genera uno nuevo en Yape.", "expired_otp");
    }

    const chargeId = `chr_mock_${Math.random().toString(36).slice(2, 12)}`;
    return {
      status: "approved",
      chargeId,
      raw: {
        object: "charge",
        mock: true,
        id: chargeId,
        amount: input.amountCents,
        currency_code: input.currency,
        email: input.email,
        outcome: { type: "venta_exitosa" }
      }
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Live Culqi provider — token (public key) then charge (secret key).
// ─────────────────────────────────────────────────────────────────────────────
const culqiProvider: PaymentProvider = {
  name: "culqi",
  async createYapeCharge(input) {
    const publicKey = process.env.CULQI_PUBLIC_KEY!;
    const secretKey = process.env.CULQI_SECRET_KEY!;

    // 1) Yape token — phone + OTP + amount against the tokens endpoint.
    const tokenRes = await fetch("https://secure.culqi.com/v2/tokens/yape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicKey}`
      },
      body: JSON.stringify({
        otp: input.otp,
        number_phone: input.phone,
        amount: input.amountCents
      })
    });
    const token = (await tokenRes.json()) as { id?: string; user_message?: string; merchant_message?: string };
    if (!tokenRes.ok || !token.id) {
      return {
        status: "rejected",
        chargeId: null,
        rejectionReason: token.user_message || token.merchant_message || "No se pudo validar el código de Yape.",
        raw: token
      };
    }

    // 2) Charge — token as source, secret key auth.
    const chargeRes = await fetch("https://api.culqi.com/v2/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        amount: input.amountCents,
        currency_code: input.currency,
        email: input.email,
        source_id: token.id,
        description: input.description
      })
    });
    const charge = (await chargeRes.json()) as {
      id?: string;
      user_message?: string;
      merchant_message?: string;
    };
    if (!chargeRes.ok || !charge.id) {
      return {
        status: "rejected",
        chargeId: null,
        rejectionReason: charge.user_message || charge.merchant_message || "El pago fue rechazado.",
        raw: charge
      };
    }

    return { status: "approved", chargeId: charge.id, raw: charge };
  }
};

/** Mock unless CULQI_MODE=live with plausible (non-placeholder) keys. */
export function getPaymentProvider(): PaymentProvider {
  const mode = (process.env.CULQI_MODE || "mock").toLowerCase();
  const secret = process.env.CULQI_SECRET_KEY || "";
  const isLive = mode === "live" && secret.startsWith("sk_") && !secret.includes("MOCK");
  return isLive ? culqiProvider : mockProvider;
}
