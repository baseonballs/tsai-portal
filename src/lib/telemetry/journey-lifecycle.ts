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
  "feature_use",
]);

const BETA_APPLICANT_CUSTOM_TYPES = new Set(["beta_signup", "lead_submit"]);

export interface TelemetryEventSummary {
  id?: string | null;
  user_id?: string | null;
  event_type?: string | null;
  event_properties?: unknown;
}

export interface ExistingJourneyRecord {
  lead_id?: string | null;
  user_id?: string | null;
  total_sessions?: number | null;
  total_duration_sec?: number | null;
  current_lifecycle_stage?: string | null;
  converted_at?: string | null;
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

function isBetaApplicationEvent(event: TelemetryEventSummary): boolean {
  if (event.event_type === "conversion_submit") return true;
  if (event.event_properties && typeof event.event_properties === "object" && !Array.isArray(event.event_properties)) {
    const custom = (event.event_properties as { custom_event_type?: unknown }).custom_event_type;
    if (typeof custom === "string" && BETA_APPLICANT_CUSTOM_TYPES.has(custom)) {
      return true;
    }
  }
  return false;
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
  };
  priorEvents: TelemetryEventSummary[];
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
  const { existingJourney, currentEvent, priorEvents, hasOlderMatchingSession = false, nowIso } = opts;

  const effectiveUserId = currentEvent.user_id || existingJourney?.user_id || null;
  const effectiveLeadId = existingJourney?.lead_id || null;

  const filteredPrior = priorEvents.filter((ev) => !ev.id || ev.id !== currentEvent.id);
  const seenSessions = new Set<string>();
  for (const ev of filteredPrior) {
    const sid = extractSessionIdFromProperties(ev.event_properties);
    if (sid) seenSessions.add(sid);
  }

  let totalSessions = 1;
  let shouldWriteTotalSessions = true;

  if (existingJourney) {
    const rawExistingSessions = existingJourney.total_sessions;
    const baseSessions =
      typeof rawExistingSessions === "number" && Number.isFinite(rawExistingSessions) && rawExistingSessions >= 1
        ? Math.floor(rawExistingSessions)
        : 1;
    const isNewDistinctSession =
      Boolean(currentEvent.session_id) &&
      !seenSessions.has(currentEvent.session_id as string) &&
      !hasOlderMatchingSession;

    totalSessions = isNewDistinctSession ? baseSessions + 1 : baseSessions;
    shouldWriteTotalSessions =
      isNewDistinctSession ||
      typeof rawExistingSessions !== "number" ||
      !Number.isFinite(rawExistingSessions) ||
      rawExistingSessions < 1;
  }

  const totalDurationSec =
    Math.max(0, Number(existingJourney?.total_duration_sec) || 0) + Math.max(0, currentEvent.duration_sec);

  const allEvents: TelemetryEventSummary[] = [
    ...filteredPrior,
    {
      id: currentEvent.id,
      user_id: currentEvent.user_id,
      event_type: currentEvent.event_type,
      event_properties: currentEvent.event_properties,
    },
  ];

  let nonBounceCount = 0;
  let authenticatedNonBounceCount = 0;
  let authenticatedFeatureUseCount = 0;
  const authenticatedSessionIds = new Set<string>();
  let hasEngagedEvent = false;
  let hasBetaApplication = Boolean(effectiveLeadId);

  for (const ev of allEvents) {
    const type = typeof ev.event_type === "string" ? ev.event_type : "";
    const isAuthenticatedEv = Boolean(ev.user_id);
    if (type && type !== "bounce") {
      nonBounceCount += 1;
      if (isAuthenticatedEv) authenticatedNonBounceCount += 1;
    }
    if (type === "feature_use" && isAuthenticatedEv) {
      authenticatedFeatureUseCount += 1;
    }
    if (isAuthenticatedEv) {
      const sid = extractSessionIdFromProperties(ev.event_properties);
      if (sid) authenticatedSessionIds.add(sid);
    }
    if (ENGAGEMENT_EVENT_TYPES.has(type)) hasEngagedEvent = true;
    if (isBetaApplicationEvent(ev)) hasBetaApplication = true;
  }

  let observedStage: ForwardLifecycleStage = "anonymous_visitor";
  if (hasEngagedEvent || nonBounceCount >= 2 || totalSessions >= 2 || totalDurationSec >= 30) {
    observedStage = "engaged_prospect";
  }
  if (hasBetaApplication) {
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

  const convertedStage =
    lifecycleStage === "beta_applicant" ||
    lifecycleStage === "activated_user" ||
    lifecycleStage === "power_user";
  const convertedAt = existingJourney?.converted_at ?? (convertedStage ? nowIso : null);

  return {
    userId: effectiveUserId,
    totalSessions,
    shouldWriteTotalSessions,
    totalDurationSec,
    lifecycleStage,
    convertedAt,
  };
}
