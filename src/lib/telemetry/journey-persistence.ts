import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  computeNextJourneyState,
  extractSessionIdFromProperties,
  type ExistingJourneyRecord,
  type TelemetryEventSummary,
} from "@/lib/telemetry/journey-lifecycle";

const JOURNEY_SELECT_COLS =
  "lead_id, user_id, total_sessions, total_duration_sec, current_lifecycle_stage, converted_at, updated_at";
const PRIOR_EVENT_WINDOW = 200;
const MAX_CONFLICT_RETRIES = 4;

function nextMonotonicUpdatedAt(nowIso: string, previousIso?: string | null): string {
  const nowMs = Date.parse(nowIso);
  const prevMs = previousIso ? Date.parse(previousIso) : Number.NaN;
  if (Number.isFinite(prevMs) && (!Number.isFinite(nowMs) || nowMs <= prevMs)) {
    return new Date(prevMs + 1).toISOString();
  }
  return nowIso;
}

async function fetchPriorVisitorEvents(opts: {
  supabase: SupabaseClient;
  visitorId: string;
  currentEventId: string;
  sessionId: string | null;
}): Promise<{
  priorEvents: TelemetryEventSummary[];
  windowExhausted: boolean;
  hasOlderMatchingSession: boolean;
}> {
  const { supabase, visitorId, currentEventId, sessionId } = opts;
  const { data: priorRows, error: priorErr } = await supabase
    .from("user_telemetry_events")
    .select("id, user_id, event_type, event_properties, created_at")
    .eq("visitor_id", visitorId)
    .order("created_at", { ascending: false })
    .limit(PRIOR_EVENT_WINDOW);
  if (priorErr) {
    throw new Error(`prior telemetry events lookup failed: ${priorErr.message}`);
  }

  const priorEvents = (priorRows ?? []) as TelemetryEventSummary[];
  const windowExhausted = priorEvents.length >= PRIOR_EVENT_WINDOW;
  let hasOlderMatchingSession = false;

  if (
    windowExhausted &&
    sessionId &&
    !priorEvents.some(
      (row) => row.id !== currentEventId && extractSessionIdFromProperties(row.event_properties) === sessionId,
    )
  ) {
    const { data: olderMatch, error: olderErr } = await supabase
      .from("user_telemetry_events")
      .select("id")
      .eq("visitor_id", visitorId)
      .contains("event_properties", { session_id: sessionId })
      .neq("id", currentEventId)
      .limit(1);
    if (olderErr) {
      throw new Error(`prior session lookup failed: ${olderErr.message}`);
    }
    hasOlderMatchingSession = Array.isArray(olderMatch) && olderMatch.length > 0;
  }

  return { priorEvents, windowExhausted, hasOlderMatchingSession };
}

export async function persistSessionJourneyWithRetry(opts: {
  supabase: SupabaseClient;
  visitorId: string;
  initialJourney: ExistingJourneyRecord | null;
  currentEvent: {
    id: string;
    event_type: string;
    event_properties: Record<string, unknown>;
    session_id: string | null;
    duration_sec: number;
    user_id: string | null;
    created_at: string;
  };
  leadId: string | null;
  nowIso: string;
}): Promise<void> {
  const { supabase, visitorId, initialJourney, currentEvent, leadId, nowIso } = opts;

  let existingJourney = initialJourney;
  let cachedPrior: {
    priorEvents: TelemetryEventSummary[];
    windowExhausted: boolean;
    hasOlderMatchingSession: boolean;
  } | null = null;

  for (let attempt = 0; attempt < MAX_CONFLICT_RETRIES; attempt++) {
    if (attempt > 0) {
      const { data: reloaded, error: reloadErr } = await supabase
        .from("user_session_journeys")
        .select(JOURNEY_SELECT_COLS)
        .eq("visitor_id", visitorId)
        .maybeSingle();
      if (reloadErr) {
        throw new Error(`session journey reload failed: ${reloadErr.message}`);
      }
      existingJourney = reloaded as ExistingJourneyRecord | null;
    }

    if (!existingJourney) {
      const firstJourney = computeNextJourneyState({
        existingJourney: null,
        currentEvent,
        priorEvents: [],
        nowIso,
      });
      const referrer = currentEvent.event_properties.referrer;
      const { error: journeyInsertError } = await supabase.from("user_session_journeys").insert([
        {
          visitor_id: visitorId,
          lead_id: leadId,
          user_id: firstJourney.userId,
          acquisition_source: typeof referrer === "string" && referrer ? referrer : "direct",
          total_sessions: firstJourney.totalSessions,
          total_duration_sec: firstJourney.totalDurationSec,
          current_lifecycle_stage: firstJourney.lifecycleStage,
          converted_at: firstJourney.convertedAt,
          first_seen_at: nowIso,
          last_active_at: nowIso,
          updated_at: nowIso,
        },
      ]);
      if (!journeyInsertError) return;
      if (journeyInsertError.code === "23505" && attempt + 1 < MAX_CONFLICT_RETRIES) {
        continue;
      }
      throw new Error(`session journey insert failed: ${journeyInsertError.message}`);
    }

    if (!cachedPrior) {
      cachedPrior = await fetchPriorVisitorEvents({
        supabase,
        visitorId,
        currentEventId: currentEvent.id,
        sessionId: currentEvent.session_id,
      });
    }

    const nextJourney = computeNextJourneyState({
      existingJourney,
      currentEvent,
      priorEvents: cachedPrior.priorEvents,
      windowExhausted: cachedPrior.windowExhausted,
      hasOlderMatchingSession: cachedPrior.hasOlderMatchingSession,
      nowIso,
    });

    const writeUpdatedAt = nextMonotonicUpdatedAt(nowIso, existingJourney.updated_at);
    const updatePayload: Record<string, unknown> = {
      user_id: nextJourney.userId,
      total_duration_sec: nextJourney.totalDurationSec,
      last_active_at: nowIso,
      current_lifecycle_stage: nextJourney.lifecycleStage,
      updated_at: writeUpdatedAt,
    };
    if (nextJourney.shouldWriteTotalSessions) {
      updatePayload.total_sessions = nextJourney.totalSessions;
    }
    if (nextJourney.convertedAt && !existingJourney.converted_at) {
      updatePayload.converted_at = nextJourney.convertedAt;
    }

    let updateQuery = supabase
      .from("user_session_journeys")
      .update(updatePayload)
      .eq("visitor_id", visitorId);
    if (existingJourney.updated_at) {
      updateQuery = updateQuery.eq("updated_at", existingJourney.updated_at);
    }

    const { data: updatedRows, error: journeyUpdateError } = await updateQuery.select("id");
    if (journeyUpdateError) {
      throw new Error(`session journey update failed: ${journeyUpdateError.message}`);
    }
    if (Array.isArray(updatedRows) && updatedRows.length > 0) {
      return;
    }
    // 0 rows matched CAS on updated_at; refresh prior events + journey on next attempt.
    cachedPrior = null;
  }

  throw new Error("session journey update conflicted concurrently after retries");
}
