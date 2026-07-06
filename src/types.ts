// ── Checkout (shared between frontend and Express API) ──────────────────────

export interface CheckoutRequest {
  name: string;
  email: string;
  /** Peruvian mobile, 9 digits starting with 9 (the Yape account number). */
  phone: string;
  /** 6-digit "código de aprobación" generated in the Yape app (valid ~2 min). */
  otp: string;
  /** Audience segment key from the booking motive selector. */
  motive: string;
}

export interface CheckoutApproved {
  status: "approved";
  paymentId: string;
  /** Calendly URL the payer may book with (single-use when the Calendly API is configured). */
  schedulingUrl: string;
  singleUse: boolean;
}

export interface CheckoutRejected {
  status: "rejected";
  reason: string;
}

export type CheckoutResponse = CheckoutApproved | CheckoutRejected;

export interface HealthResponse {
  status: "ok";
  environment: string;
  paymentMode: "mock" | "live";
  schedulingMode: "calendly-api" | "public-link-fallback";
  supabase: "connected" | "error";
}

// ── Landing page content ─────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
  date: string;
  isStudent?: boolean;
}

export interface RoadmapStep {
  title: string;
  duration: string;
  description: string;
  skillsToLearn: string[];
  kuniTip: string;
}

export interface RoadmapResponse {
  roleName: string;
  summary: string;
  steps: RoadmapStep[];
  kuniFinalAdvice: string;
}
