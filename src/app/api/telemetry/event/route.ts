import { required } from "@/utils/require-env";
import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { errorMessage } from "@/lib/errors";
import {
  computeWeakETag,
  createServerTimingRecorder,
  matchesIfNoneMatch,
} from "@/lib/perf/server-timing";
import {
  computeNextJourneyState,
  resolveSessionIdFromEvent,
  type ExistingJourneyRecord,
  type TelemetryEventSummary,
} from "@/lib/telemetry/journey-lifecycle";
import { resolveServerAuthUrl } from "@/utils/supabase/resolve-server-auth-url";
import { createClient as createSessionClient } from "@/utils/supabase/server";

let cachedTelemetryAdminClient: SupabaseClient | null = null;

function getTelemetryAdminClient(): SupabaseClient {
  if (cachedTelemetryAdminClient) {
    return cachedTelemetryAdminClient;
  }
  const supabaseUrl = resolveServerAuthUrl();
  const serviceKey = required(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
  cachedTelemetryAdminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cachedTelemetryAdminClient;
}

export async function GET(req: NextRequest) {
  const timing = createServerTimingRecorder();
  const payload = {
    ok: true,
    service: "tsai-portal",
    telemetryReady: true,
  };
  const etag = computeWeakETag(payload);
  const headers = {
    ETag: etag,
    "Cache-Control": "private, max-age=15, stale-while-revalidate=60",
    "Server-Timing": timing.toHeaderValue(),
  };
  if (matchesIfNoneMatch(req.headers.get("if-none-match"), etag)) {
    return new NextResponse(null, { status: 304, headers });
  }
  return NextResponse.json(payload, { headers });
}

export async function POST(req: NextRequest) {
  const timing = createServerTimingRecorder();
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400, headers: { "Server-Timing": timing.toHeaderValue() } },
      );
    }

    const {
      visitor_id,
      event_type,
      event_category = "landing",
      page_path = "/",
      session_duration_sec = 0,
      event_properties = {},
      session_id,
    } = body;

    // Phase 156: `user_id` and `lead_id` used to be taken from the request body, so any
    // anonymous caller could attach events and a visitor journey to any account or lead. The
    // user is now the VERIFIED session's user (or none), and a lead is never client-supplied —
    // nothing in the Portal hands a lead id to the browser.
    const {
      data: { user: sessionUser },
    } = await (await createSessionClient()).auth.getUser();
    const user_id: string | null = sessionUser?.id ?? null;
    const lead_id: string | null = null;

    if (typeof visitor_id !== "string" || !visitor_id.trim() || typeof event_type !== "string" || !event_type.trim()) {
      return NextResponse.json(
        { error: "visitor_id and event_type are required." },
        { status: 400, headers: { "Server-Timing": timing.toHeaderValue() } },
      );
    }

    const normalizedVisitorId = visitor_id.trim();
    const PORTAL_ALLOWED_EVENT_TYPES = new Set([
      "page_view",
      "section_view",
      "button_click",
      "form_focus",
      "conversion_submit",
      "feature_use",
      "bounce",
    ]);
    const rawEventType = event_type.trim();
    const isAllowedEventType = PORTAL_ALLOWED_EVENT_TYPES.has(rawEventType);
    const normalizedEventType = isAllowedEventType ? rawEventType : "feature_use";
    const safeProps =
      event_properties && typeof event_properties === "object" && !Array.isArray(event_properties)
        ? (event_properties as Record<string, unknown>)
        : {};
    const resolvedSessionId = resolveSessionIdFromEvent(session_id, safeProps);
    const normalizedEventProperties: Record<string, unknown> = {
      ...safeProps,
      ...(isAllowedEventType ? {} : { custom_event_type: rawEventType }),
      ...(resolvedSessionId ? { session_id: resolvedSessionId } : {}),
    };

    // IP Anonymization (SHA-256 hash first 16 chars)
    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(rawIp).digest("hex").substring(0, 16);
    const userAgent = req.headers.get("user-agent") || "unknown";

    const supabase = getTelemetryAdminClient();
    const nowIso = new Date().toISOString();
    const eventId = crypto.randomUUID();
    const durationSec = Math.max(0, Math.floor(Number(session_duration_sec) || 0));

    const dbStartedAt = performance.now();
    // PORT-PERF-TELEM-001: Execute telemetry event insert and session journey lookup in parallel
    // instead of sequentially waiting for the insert before querying user_session_journeys.
    const [eventRes, journeyRes] = await Promise.all([
      supabase.from("user_telemetry_events").insert([
        {
          id: eventId,
          visitor_id: normalizedVisitorId,
          user_id,
          lead_id,
          event_type: normalizedEventType,
          event_category: typeof event_category === "string" && event_category.trim() ? event_category.trim() : "landing",
          page_path: typeof page_path === "string" && page_path.trim() ? page_path.trim() : "/",
          session_duration_sec: durationSec,
          event_properties: normalizedEventProperties,
          ip_hash: ipHash,
          user_agent: userAgent,
        },
      ]),
      supabase
        .from("user_session_journeys")
        .select("lead_id, user_id, total_sessions, total_duration_sec, current_lifecycle_stage, converted_at")
        .eq("visitor_id", normalizedVisitorId)
        .maybeSingle(),
    ]);

    if (eventRes.error) {
      throw new Error(`telemetry event insert failed: ${eventRes.error.message}`);
    }
    if (journeyRes.error) {
      throw new Error(`session journey lookup failed: ${journeyRes.error.message}`);
    }

    // All user_session_journeys reads/writes use only live columns from
    // tsai-spotlight/supabase/migrations/20260725160000_create_telemetry_and_retention.sql.
    const existingJourney = journeyRes.data as ExistingJourneyRecord | null;
    let priorEvents: TelemetryEventSummary[] = [];
    let hasOlderMatchingSession = false;

    if (existingJourney) {
      const { data: priorRows, error: priorErr } = await supabase
        .from("user_telemetry_events")
        .select("id, user_id, event_type, event_properties")
        .eq("visitor_id", normalizedVisitorId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (priorErr) {
        throw new Error(`prior telemetry events lookup failed: ${priorErr.message}`);
      }
      priorEvents = (priorRows ?? []) as TelemetryEventSummary[];

      if (
        resolvedSessionId &&
        priorEvents.length >= 200 &&
        !priorEvents.some(
          (row) =>
            row.id !== eventId &&
            row.event_properties &&
            typeof row.event_properties === "object" &&
            !Array.isArray(row.event_properties) &&
            (row.event_properties as { session_id?: unknown }).session_id === resolvedSessionId,
        )
      ) {
        const { data: olderMatch, error: olderErr } = await supabase
          .from("user_telemetry_events")
          .select("id")
          .eq("visitor_id", normalizedVisitorId)
          .contains("event_properties", { session_id: resolvedSessionId })
          .neq("id", eventId)
          .limit(1);
        if (olderErr) {
          throw new Error(`prior session lookup failed: ${olderErr.message}`);
        }
        hasOlderMatchingSession = Array.isArray(olderMatch) && olderMatch.length > 0;
      }
    }

    const nextJourney = computeNextJourneyState({
      existingJourney,
      currentEvent: {
        id: eventId,
        event_type: normalizedEventType,
        event_properties: normalizedEventProperties,
        session_id: resolvedSessionId,
        duration_sec: durationSec,
        user_id,
      },
      priorEvents,
      hasOlderMatchingSession,
      nowIso,
    });

    if (existingJourney) {
      const updatePayload: Record<string, unknown> = {
        user_id: nextJourney.userId,
        total_duration_sec: nextJourney.totalDurationSec,
        last_active_at: nowIso,
        current_lifecycle_stage: nextJourney.lifecycleStage,
        updated_at: nowIso,
      };
      if (nextJourney.shouldWriteTotalSessions) {
        updatePayload.total_sessions = nextJourney.totalSessions;
      }
      if (nextJourney.convertedAt && !existingJourney.converted_at) {
        updatePayload.converted_at = nextJourney.convertedAt;
      }
      const { error: journeyUpdateError } = await supabase
        .from("user_session_journeys")
        .update(updatePayload)
        .eq("visitor_id", normalizedVisitorId);
      if (journeyUpdateError) {
        throw new Error(`session journey update failed: ${journeyUpdateError.message}`);
      }
    } else {
      const referrer = normalizedEventProperties.referrer;
      const { error: journeyInsertError } = await supabase.from("user_session_journeys").insert([
        {
          visitor_id: normalizedVisitorId,
          lead_id,
          user_id: nextJourney.userId,
          acquisition_source: typeof referrer === "string" && referrer ? referrer : "direct",
          total_sessions: nextJourney.totalSessions,
          total_duration_sec: nextJourney.totalDurationSec,
          current_lifecycle_stage: nextJourney.lifecycleStage,
          converted_at: nextJourney.convertedAt,
          first_seen_at: nowIso,
          last_active_at: nowIso,
        },
      ]);
      if (journeyInsertError) {
        throw new Error(`session journey insert failed: ${journeyInsertError.message}`);
      }
    }
    timing.record("db", performance.now() - dbStartedAt, "Telemetry persistence");

    return NextResponse.json(
      { success: true },
      { headers: { "Server-Timing": timing.toHeaderValue() } },
    );
  } catch (err) {
    console.warn("[TelemetryAPI] Failed:", errorMessage(err));
    return NextResponse.json(
      { error: "Telemetry could not be recorded." },
      { status: 500, headers: { "Server-Timing": timing.toHeaderValue() } },
    );
  }
}
