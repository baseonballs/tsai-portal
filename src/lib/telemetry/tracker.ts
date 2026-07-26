/**
 * Client-side Telemetry Tracker for tsai-portal & tsai-spotlight.
 * Manages anonymous visitor ID (`tsai_vid`) cookie, tracks pageviews, scroll depth, and sends events.
 */

const VISITOR_COOKIE_NAME = "tsai_vid";

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";

  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, val] = cookie.split("=");
    if (name === VISITOR_COOKIE_NAME && val) {
      return val;
    }
  }

  // Generate new visitor ID
  const newVid = "vid_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${VISITOR_COOKIE_NAME}=${newVid}; path=/; expires=${expires}; SameSite=Lax`;
  return newVid;
}

export type TelemetryPayload = {
  event_type: "page_view" | "section_view" | "button_click" | "form_focus" | "conversion_submit" | "feature_use" | "bounce";
  event_category?: "landing" | "solutions" | "pricing" | "onboarding" | "workbench" | "analytics";
  page_path?: string;
  session_duration_sec?: number;
  event_properties?: Record<string, any>;
  lead_id?: string;
  user_id?: string;
};

export async function trackEvent(payload: TelemetryPayload): Promise<void> {
  if (typeof window === "undefined") return;

  const visitorId = getOrCreateVisitorId();
  const pagePath = payload.page_path || window.location.pathname;

  const eventData = {
    visitor_id: visitorId,
    page_path: pagePath,
    ...payload,
    event_properties: {
      ...payload.event_properties,
      referrer: document.referrer || null,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
    },
  };

  try {
    // Send telemetry event asynchronously using sendBeacon if available, else fetch
    const bodyStr = JSON.stringify(eventData);
    if (navigator.sendBeacon) {
      const blob = new Blob([bodyStr], { type: "application/json" });
      navigator.sendBeacon("/api/telemetry/event", blob);
    } else {
      fetch("/api/telemetry/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (err) {
    // Silent fail for telemetry
    console.debug("[Telemetry] Failed to transmit event:", err);
  }
}
