const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const EXPECTED_ACTION = "checkout";

// Google's own admin console uses 0.5 as the default alerting threshold:
// 1.0 = very likely human, 0.0 = very likely a bot.
const SCORE_THRESHOLD = 0.5;

interface RecaptchaVerifyResult {
  success: boolean;
  score?: number;
}

interface SiteverifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

/**
 * Verifies a reCAPTCHA v3 token against Google's siteverify endpoint.
 *
 * Deliberately asymmetric failure modes:
 * - Not configured (no secret key) → allow. Same "feature disabled" contract
 *   as server/rateLimit.ts, so local dev works without a key.
 * - Configured but no token supplied → reject. Otherwise a bot could bypass
 *   the whole check by simply omitting the field.
 * - Configured + token, but the Google request itself fails (network/outage)
 *   → allow, logged loudly. A third-party outage must never block a paying
 *   customer — same principle as the Calendly scheduling-link fallback.
 */
export async function verifyRecaptcha(token: string | undefined, remoteIp?: string): Promise<RecaptchaVerifyResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { success: true };
  if (!token) return { success: false };

  try {
    const params = new URLSearchParams({ secret, response: token });
    if (remoteIp) params.set("remoteip", remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });
    const data = (await res.json()) as SiteverifyResponse;

    const passed = data.success && data.action === EXPECTED_ACTION && (data.score ?? 0) >= SCORE_THRESHOLD;
    if (!passed) {
      console.warn("[recaptcha] rejected:", {
        score: data.score,
        action: data.action,
        errors: data["error-codes"]
      });
    }
    return { success: passed, score: data.score };
  } catch (error) {
    console.error("[recaptcha] siteverify request failed, failing open:", error);
    return { success: true };
  }
}
