/**
 * Client-side Telemetry Tracker for tsai-portal & tsai-spotlight.
 * Manages anonymous visitor ID (`tsai_vid`) cookie, session ID (`tsai_sid`),
 * tracks pageviews, scroll depth, and sends events.
 *
 * PORT-PERF-TELEM-006:
 * - Memoizes `tsai_vid` in memory (`cachedVisitorId`) so `document.cookie` is not split on every event.
 * - Coalesces duplicate `page_view` / `section_view` beacons within `RECENT_BEACON_DEDUP_MS` (2,000ms).
 * - Normalizes any non-standard `event_type` onto `"custom"` (`custom_event_type` in `event_properties`).
 * - Applies `AbortSignal.timeout(5_000)` on fallback `fetch` so stalled telemetry endpoints never tie up browser sockets.
 */

const VISITOR_COOKIE_NAME = "tsai_vid";
const SESSION_STORAGE_KEY = "tsai_sid";
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
let cachedSessionId: string | null = null;
const recentBeaconBySignature = new Map<string, number>();

export function resetPortalTelemetryCacheForTests(): void {
  cachedVisitorId = null;
  cachedSessionId = null;
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

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  if (cachedSessionId) return cachedSessionId;

  try {
    const existing = window.sessionStorage?.getItem(SESSION_STORAGE_KEY)?.trim();
    if (existing) {
      cachedSessionId = existing;
      return existing;
    }
  } catch {
    // sessionStorage unavailable in restricted contexts; fall back to in-memory session ID
  }

  const newSid = "sid_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
  try {
    window.sessionStorage?.setItem(SESSION_STORAGE_KEY, newSid);
  } catch {
    // Ignore storage write errors
  }
  cachedSessionId = newSid;
  return newSid;
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
  session_id?: string;
  session_duration_sec?: number;
  event_properties?: Record<string, unknown>;
  // No user_id / lead_id: the server derives the user from the verified session (Phase 156).
};

export async function trackEvent(payload: TelemetryPayload): Promise<void> {
  if (typeof window === "undefined") return;

  const visitorId = getOrCreateVisitorId();
  const sessionId = payload.session_id?.trim() || getOrCreateSessionId();
  const pagePath = payload.page_path || window.location.pathname;
  const isKnownType = PORTAL_ALLOWED_EVENT_TYPES.has(payload.event_type);
  const normalizedEventType = isKnownType ? payload.event_type : "custom";

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

  const { custom_event_type: _ignoredCustomType, ...cleanProps } = payload.event_properties ?? {};
  void _ignoredCustomType;

  const eventData = {
    ...payload,
    visitor_id: visitorId,
    session_id: sessionId,
    page_path: pagePath,
    event_type: normalizedEventType,
    event_properties: {
      ...cleanProps,
      ...(isKnownType ? {} : { custom_event_type: payload.event_type }),
      session_id: sessionId,
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
