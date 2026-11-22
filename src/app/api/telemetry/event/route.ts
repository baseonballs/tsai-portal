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
  resolveSessionIdFromEvent,
  type ExistingJourneyRecord,
} from "@/lib/telemetry/journey-lifecycle";
import { persistSessionJourneyWithRetry } from "@/lib/telemetry/journey-persistence";
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
    const normalizedEventType = isAllowedEventType ? rawEventType : "custom";
    const safeProps =
      event_properties && typeof event_properties === "object" && !Array.isArray(event_properties)
        ? (event_properties as Record<string, unknown>)
        : {};
    // Strip caller-supplied custom_event_type so standard events cannot spoof custom types.
    const { custom_event_type: _ignoredCustomType, ...sanitizedProps } = safeProps;
    void _ignoredCustomType;
    const resolvedSessionId = resolveSessionIdFromEvent(session_id, sanitizedProps);
    const normalizedEventProperties: Record<string, unknown> = {
      ...sanitizedProps,
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
          created_at: nowIso,
        },
      ]),
      supabase
        .from("user_session_journeys")
        .select("lead_id, user_id, total_sessions, total_duration_sec, current_lifecycle_stage, converted_at, updated_at")
        .eq("visitor_id", normalizedVisitorId)
        .maybeSingle(),
    ]);

    if (eventRes.error) {
      throw new Error(`telemetry event insert failed: ${eventRes.error.message}`);
    }
    if (journeyRes.error) {
      throw new Error(`session journey lookup failed: ${journeyRes.error.message}`);
    }

    await persistSessionJourneyWithRetry({
      supabase,
      visitorId: normalizedVisitorId,
      initialJourney: journeyRes.data as ExistingJourneyRecord | null,
      currentEvent: {
        id: eventId,
        event_type: normalizedEventType,
        event_properties: normalizedEventProperties,
        session_id: resolvedSessionId,
        duration_sec: durationSec,
        user_id,
        created_at: nowIso,
      },
      leadId: lead_id,
      nowIso,
    });
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
