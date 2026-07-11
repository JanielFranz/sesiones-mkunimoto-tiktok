import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextFunction, Request, Response } from "express";
import { CheckoutResponse } from "../src/types.js";

let ratelimit: Ratelimit | null | undefined;

/**
 * Lazily built; returns null when Upstash isn't configured (e.g. local dev
 * without the env vars set) so callers can skip limiting instead of throwing.
 */
function getRatelimit(): Ratelimit | null {
  if (ratelimit !== undefined) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    ratelimit = null;
    return ratelimit;
  }

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "ratelimit:checkout"
  });
  return ratelimit;
}

/**
 * Guards POST /api/checkout against OTP/payment brute-forcing. Fails open on
 * missing config or a Redis error — a Redis outage must never block paying
 * customers, matching the "never dead-end a customer" rule used for the
 * Calendly scheduling-link fallback.
 */
export async function checkoutRateLimit(req: Request, res: Response, next: NextFunction) {
  const limiter = getRatelimit();
  if (!limiter) return next();

  try {
    const identifier = req.ip ?? "unknown";
    const { success, limit, remaining } = await limiter.limit(identifier);
    res.setHeader("X-RateLimit-Limit", limit.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());

    if (!success) {
      return res.status(429).json({
        status: "rejected",
        reason: "Demasiados intentos. Espera unos minutos antes de volver a intentar."
      } satisfies CheckoutResponse);
    }
    next();
  } catch (error) {
    console.error("[rateLimit] Upstash error, failing open:", error);
    next();
  }
}
