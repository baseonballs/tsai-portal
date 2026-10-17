/**
 * Client-side Telemetry Tracker for tsai-portal & tsai-spotlight.
 * Manages anonymous visitor ID (`tsai_vid`) cookie, tracks pageviews, scroll depth, and sends events.
 *
 * PORT-PERF-TELEM-006:
 * - Memoizes `tsai_vid` in memory (`cachedVisitorId`) so `document.cookie` is not split on every event.
 * - Coalesces duplicate `page_view` / `section_view` beacons within `RECENT_BEACON_DEDUP_MS` (2,000ms).
 * - Normalizes any non-standard `event_type` onto `"feature_use"` (`custom_event_type` in `event_properties`).
 * - Applies `AbortSignal.timeout(5_000)` on fallback `fetch` so stalled telemetry endpoints never tie up browser sockets.
 */

const VISITOR_COOKIE_NAME = "tsai_vid";
export const RECENT_BEACON_DEDUP_MS = 2_000;
const MAX_RECENT_BEACON_SIGNATURES = 64;

export const PORTAL_ALLOWED_EVENT_TYPES: ReadonlySet<string> = new Set([
  "page_view",
  "section_view",
  "button_click",
  "form_focus",
  "conversion_submit",
  "feature_use",
  "bounce",
]);

let cachedVisitorId: string | null = null;
const recentBeaconBySignature = new Map<string, number>();

export function resetPortalTelemetryCacheForTests(): void {
  cachedVisitorId = null;
  recentBeaconBySignature.clear();
}

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  if (cachedVisitorId) return cachedVisitorId;

  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, val] = cookie.split("=");
    if (name === VISITOR_COOKIE_NAME && val) {
      cachedVisitorId = val;
      return val;
    }
  }

  // Generate new visitor ID
  const newVid = "vid_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${VISITOR_COOKIE_NAME}=${newVid}; path=/; expires=${expires}; SameSite=Lax`;
  cachedVisitorId = newVid;
  return newVid;
}

export type TelemetryPayload = {
  event_type:
    | "page_view"
    | "section_view"
    | "button_click"
    | "form_focus"
    | "conversion_submit"
    | "feature_use"
    | "bounce"
    | (string & {});
  event_category?: "landing" | "solutions" | "pricing" | "onboarding" | "workbench" | "analytics";
  page_path?: string;
  session_duration_sec?: number;
  event_properties?: Record<string, unknown>;
  lead_id?: string;
  user_id?: string;
};

export async function trackEvent(payload: TelemetryPayload): Promise<void> {
  if (typeof window === "undefined") return;

  const visitorId = getOrCreateVisitorId();
  const pagePath = payload.page_path || window.location.pathname;
  const isKnownType = PORTAL_ALLOWED_EVENT_TYPES.has(payload.event_type);
  const normalizedEventType = isKnownType ? payload.event_type : "feature_use";

  // Coalesce identical rapid page_view / section_view beacons within 2s (e.g., StrictMode double-mount)
  if (normalizedEventType === "page_view" || normalizedEventType === "section_view") {
    const signature = `${normalizedEventType}:${ payload.event_category || "landing" }:${pagePath}`;
    const now = Date.now();
    const lastSentAt = recentBeaconBySignature.get(signature);
    if (lastSentAt !== undefined && now - lastSentAt < RECENT_BEACON_DEDUP_MS) {
      return;
    }
    if (recentBeaconBySignature.size >= MAX_RECENT_BEACON_SIGNATURES) {
      const oldestKey = recentBeaconBySignature.keys().next().value;
      if (oldestKey) recentBeaconBySignature.delete(oldestKey);
    }
    recentBeaconBySignature.set(signature, now);
  }

  const eventData = {
    visitor_id: visitorId,
    page_path: pagePath,
    ...payload,
    event_type: normalizedEventType,
    event_properties: {
      ...(isKnownType ? {} : { custom_event_type: payload.event_type }),
      ...payload.event_properties,
      referrer: document.referrer || null,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
    },
  };

  try {
    // Send telemetry event asynchronously using sendBeacon if available, else fetch with 5s timeout
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
        signal: AbortSignal.timeout(5_000),
      }).catch(() => {});
    }
  } catch (err) {
    // Silent fail for telemetry
    console.debug("[Telemetry] Failed to transmit event:", err);
  }
}
