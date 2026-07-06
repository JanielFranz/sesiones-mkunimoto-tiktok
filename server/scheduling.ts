/**
 * Scheduling-link minting. Called ONLY after an approved payment.
 *
 * Two modes, chosen by env:
 *  - calendly-api           — with CALENDLY_API_TOKEN + CALENDLY_EVENT_TYPE_URI,
 *                             mints a TRUE single-use scheduling link
 *                             (POST /scheduling_links, max_event_count=1).
 *  - public-link-fallback   — no token yet: returns the public CALENDLY_URL.
 *                             Not single-use, but the flow still gates the UI
 *                             behind payment. Upgrade by filling the two vars.
 */

export interface SchedulingLinkInput {
  name: string;
  email: string;
  motive: string;
}

export interface SchedulingLinkResult {
  url: string;
  singleUse: boolean;
  provider: "calendly";
}

export function getSchedulingMode(): "calendly-api" | "public-link-fallback" {
  return process.env.CALENDLY_API_TOKEN && process.env.CALENDLY_EVENT_TYPE_URI
    ? "calendly-api"
    : "public-link-fallback";
}

function publicLinkFallback(): SchedulingLinkResult {
  const url = process.env.CALENDLY_URL;
  if (!url) {
    throw new Error("CALENDLY_URL is not set — required as the scheduling fallback.");
  }
  return { url, singleUse: false, provider: "calendly" };
}

export async function createSchedulingLink(
  input: SchedulingLinkInput
): Promise<SchedulingLinkResult> {
  if (getSchedulingMode() === "public-link-fallback") {
    return publicLinkFallback();
  }

  try {
    const res = await fetch("https://api.calendly.com/scheduling_links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CALENDLY_API_TOKEN}`
      },
      body: JSON.stringify({
        max_event_count: 1,
        owner: process.env.CALENDLY_EVENT_TYPE_URI,
        owner_type: "EventType"
      })
    });
    if (!res.ok) {
      console.error("Calendly scheduling_links failed:", res.status, await res.text());
      return publicLinkFallback(); // the customer already paid — never dead-end them
    }
    const data = (await res.json()) as { resource?: { booking_url?: string } };
    const bookingUrl = data.resource?.booking_url;
    if (!bookingUrl) return publicLinkFallback();
    return { url: bookingUrl, singleUse: true, provider: "calendly" };
  } catch (err) {
    console.error("Calendly scheduling_links error:", err);
    return publicLinkFallback();
  }
}
