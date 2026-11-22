export const FORWARD_LIFECYCLE_STAGES = [
  "anonymous_visitor",
  "engaged_prospect",
  "beta_applicant",
  "activated_user",
  "power_user",
] as const;

export type ForwardLifecycleStage = (typeof FORWARD_LIFECYCLE_STAGES)[number];
export type LifecycleStage = ForwardLifecycleStage | "at_risk" | "churned_exit";

const FORWARD_STAGE_RANK: Readonly<Record<ForwardLifecycleStage, number>> = {
  anonymous_visitor: 0,
  engaged_prospect: 1,
  beta_applicant: 2,
  activated_user: 3,
  power_user: 4,
};

const ENGAGEMENT_EVENT_TYPES = new Set([
  "section_view",
  "button_click",
  "form_focus",
  "conversion_submit",
  "feature_use",
]);

export interface TelemetryEventSummary {
  id?: string | null;
  user_id?: string | null;
  event_type?: string | null;
  event_properties?: unknown;
  created_at?: string | null;
}

export interface ExistingJourneyRecord {
  lead_id?: string | null;
  user_id?: string | null;
  total_sessions?: number | null;
  total_duration_sec?: number | null;
  current_lifecycle_stage?: string | null;
  converted_at?: string | null;
  updated_at?: string | null;
}

export function normalizeSessionId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 128) return null;
  return trimmed;
}

export function extractSessionIdFromProperties(props: unknown): string | null {
  if (!props || typeof props !== "object" || Array.isArray(props)) return null;
  return normalizeSessionId((props as { session_id?: unknown }).session_id);
}

export function resolveSessionIdFromEvent(bodySessionId: unknown, eventProps: unknown): string | null {
  return normalizeSessionId(bodySessionId) ?? extractSessionIdFromProperties(eventProps);
}

function isForwardStage(stage: string): stage is ForwardLifecycleStage {
  return Object.prototype.hasOwnProperty.call(FORWARD_STAGE_RANK, stage);
}

function parseIsoTimestampParts(raw: string | null | undefined): { ms: number; subMs: number } {
  if (!raw) return { ms: 0, subMs: 0 };
  const ms = Date.parse(raw);
  if (!Number.isFinite(ms)) return { ms: 0, subMs: 0 };
  const fracMatch = raw.match(/\.(\d+)/);
  const padded = fracMatch ? fracMatch[1].padEnd(6, "0") : "000000";
  const subMs = Number(padded.slice(3, 6)) || 0;
  return { ms, subMs };
}

function compareEventOrder(a: TelemetryEventSummary, b: TelemetryEventSummary): number {
  const pa = parseIsoTimestampParts(a.created_at);
  const pb = parseIsoTimestampParts(b.created_at);
  if (pa.ms !== pb.ms) return pa.ms - pb.ms;
  if (pa.subMs !== pb.subMs) return pa.subMs - pb.subMs;
  return String(a.id ?? "").localeCompare(String(b.id ?? ""));
}

let lastEventMicros = 0;

/** Generate a process-monotonic microsecond ISO timestamp so sub-ms beacons preserve order. */
export function nextMonotonicEventCreatedAt(nowMs = Date.now()): string {
  const baseMicros = Math.floor(nowMs) * 1000;
  lastEventMicros = baseMicros > lastEventMicros ? baseMicros : lastEventMicros + 1;
  const epochMs = Math.floor(lastEventMicros / 1000);
  const subMs = lastEventMicros % 1000;
  const iso = new Date(epochMs).toISOString();
  return subMs === 0 ? iso : `${iso.slice(0, -1)}${String(subMs).padStart(3, "0")}Z`;
}

export function computeNextJourneyState(opts: {
  existingJourney: ExistingJourneyRecord | null;
  currentEvent: {
    id: string;
    event_type: string;
    event_properties: Record<string, unknown>;
    session_id: string | null;
    duration_sec: number;
    user_id: string | null;
    created_at?: string;
  };
  priorEvents: TelemetryEventSummary[];
  windowExhausted?: boolean;
  hasOlderMatchingSession?: boolean;
  nowIso: string;
}): {
  userId: string | null;
  totalSessions: number;
  shouldWriteTotalSessions: boolean;
  totalDurationSec: number;
  lifecycleStage: LifecycleStage;
  convertedAt: string | null;
} {
  const {
    existingJourney,
    currentEvent,
    priorEvents,
    windowExhausted = false,
    hasOlderMatchingSession = false,
    nowIso,
  } = opts;

  // m5: never overwrite an existing authenticated journey owner on visitor_id collision.
  const existingUserId = existingJourney?.user_id || null;
  const effectiveUserId = existingUserId ?? currentEvent.user_id ?? null;
  const effectiveLeadId = existingJourney?.lead_id || null;

  const filteredPrior = priorEvents.filter((ev) => !ev.id || ev.id !== currentEvent.id);
  const allEvents: TelemetryEventSummary[] = [
    ...filteredPrior,
    {
      id: currentEvent.id,
      user_id: currentEvent.user_id,
      event_type: currentEvent.event_type,
      event_properties: currentEvent.event_properties,
      created_at: currentEvent.created_at ?? nowIso,
    },
  ];
  const sortedEvents = [...allEvents].sort(compareEventOrder);

  const seenSessions = new Set<string>();
  const firstEventBySession = new Map<string, string>();
  for (const ev of sortedEvents) {
    const sid = extractSessionIdFromProperties(ev.event_properties);
    if (sid) {
      seenSessions.add(sid);
      if (!firstEventBySession.has(sid) && ev.id) {
        firstEventBySession.set(sid, ev.id);
      }
    }
  }

  let totalSessions = 1;
  let shouldWriteTotalSessions = true;

  if (existingJourney) {
    const rawExistingSessions = existingJourney.total_sessions;
    const baseSessions =
      typeof rawExistingSessions === "number" && Number.isFinite(rawExistingSessions) && rawExistingSessions >= 1
        ? Math.floor(rawExistingSessions)
        : 1;

    const currentSid = currentEvent.session_id;
    const isCanonicalFirst =
      Boolean(currentSid) &&
      firstEventBySession.get(currentSid as string) === currentEvent.id &&
      !hasOlderMatchingSession;

    if (!windowExhausted) {
      const earliestEvent = sortedEvents[0];
      const earliestHadNoSession = Boolean(
        earliestEvent && !extractSessionIdFromProperties(earliestEvent.event_properties),
      );
      const observedCount = seenSessions.size + (earliestHadNoSession ? 1 : 0);
      if (baseSessions > observedCount && isCanonicalFirst) {
        totalSessions = baseSessions + 1;
      } else {
        totalSessions = Math.max(baseSessions, observedCount);
      }
      shouldWriteTotalSessions =
        totalSessions > baseSessions ||
        typeof rawExistingSessions !== "number" ||
        !Number.isFinite(rawExistingSessions) ||
        rawExistingSessions < 1;
    } else {
      totalSessions = isCanonicalFirst ? baseSessions + 1 : baseSessions;
      shouldWriteTotalSessions =
        isCanonicalFirst ||
        typeof rawExistingSessions !== "number" ||
        !Number.isFinite(rawExistingSessions) ||
        rawExistingSessions < 1;
    }
  } else {
    totalSessions = Math.max(1, seenSessions.size);
  }

  const totalDurationSec =
    Math.max(0, Number(existingJourney?.total_duration_sec) || 0) + Math.max(0, currentEvent.duration_sec);

  let nonBounceCount = 0;
  let authenticatedNonBounceCount = 0;
  let authenticatedFeatureUseCount = 0;
  const authenticatedSessionIds = new Set<string>();
  let hasEngagedEvent = false;

  for (const ev of allEvents) {
    const type = typeof ev.event_type === "string" ? ev.event_type : "";
    const isOwnerEvent = Boolean(effectiveUserId && ev.user_id === effectiveUserId);
    if (type && type !== "bounce") {
      nonBounceCount += 1;
      if (isOwnerEvent) authenticatedNonBounceCount += 1;
    }
    if (type === "feature_use" && isOwnerEvent) {
      authenticatedFeatureUseCount += 1;
    }
    if (isOwnerEvent) {
      const sid = extractSessionIdFromProperties(ev.event_properties);
      if (sid) authenticatedSessionIds.add(sid);
    }
    if (ENGAGEMENT_EVENT_TYPES.has(type)) hasEngagedEvent = true;
  }

  // M2: Unauthenticated/client telemetry only drives behavioral engagement (anonymous_visitor ->
  // engaged_prospect). beta_applicant requires server-trusted lead linkage or existing server stage.
  let observedStage: ForwardLifecycleStage = "anonymous_visitor";
  if (hasEngagedEvent || nonBounceCount >= 2 || totalSessions >= 2 || totalDurationSec >= 30) {
    observedStage = "engaged_prospect";
  }
  if (effectiveLeadId) {
    observedStage = "beta_applicant";
  }
  if (effectiveUserId) {
    observedStage = "activated_user";
    if (
      authenticatedFeatureUseCount >= 3 ||
      (authenticatedSessionIds.size >= 2 && authenticatedNonBounceCount >= 5)
    ) {
      observedStage = "power_user";
    }
  }

  const existingStageRaw = (existingJourney?.current_lifecycle_stage ?? "anonymous_visitor").trim();
  let lifecycleStage: LifecycleStage = observedStage;
  if (existingStageRaw === "at_risk" || existingStageRaw === "churned_exit") {
    lifecycleStage = existingStageRaw;
  } else if (isForwardStage(existingStageRaw)) {
    lifecycleStage =
      FORWARD_STAGE_RANK[observedStage] > FORWARD_STAGE_RANK[existingStageRaw]
        ? observedStage
        : existingStageRaw;
  }

  // M2: converted_at is only stamped from server-verified user_id or server-linked lead_id.
  const hasServerVerifiedConversion = Boolean(effectiveUserId || effectiveLeadId);
  const convertedAt = existingJourney?.converted_at ?? (hasServerVerifiedConversion ? nowIso : null);

  return {
    userId: effectiveUserId,
    totalSessions,
    shouldWriteTotalSessions,
    totalDurationSec,
    lifecycleStage,
    convertedAt,
  };
}
