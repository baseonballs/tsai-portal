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
    const body = await req.json();
    const {
      visitor_id,
      event_type,
      event_category = "landing",
      page_path = "/",
      session_duration_sec = 0,
      event_properties = {},
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

    if (!visitor_id || !event_type) {
      return NextResponse.json(
        { error: "visitor_id and event_type are required." },
        { status: 400, headers: { "Server-Timing": timing.toHeaderValue() } },
      );
    }

    const PORTAL_ALLOWED_EVENT_TYPES = new Set([
      "page_view",
      "section_view",
      "button_click",
      "form_focus",
      "conversion_submit",
      "feature_use",
      "bounce",
    ]);
    const isAllowedEventType = PORTAL_ALLOWED_EVENT_TYPES.has(String(event_type));
    const normalizedEventType = isAllowedEventType ? String(event_type) : "feature_use";
    const normalizedEventProperties = isAllowedEventType
      ? event_properties
      : { custom_event_type: String(event_type), ...(event_properties || {}) };

    // IP Anonymization (SHA-256 hash first 16 chars)
    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(rawIp).digest("hex").substring(0, 16);
    const userAgent = req.headers.get("user-agent") || "unknown";

    const supabase = getTelemetryAdminClient();
    const nowIso = new Date().toISOString();

    const dbStartedAt = performance.now();
    // PORT-PERF-TELEM-001: Execute telemetry event insert and session journey lookup in parallel
    // instead of sequentially waiting for the insert before querying user_session_journeys.
    const [eventRes, journeyRes] = await Promise.all([
      supabase.from("user_telemetry_events").insert([
        {
          visitor_id,
          user_id,
          lead_id,
          event_type: normalizedEventType,
          event_category,
          page_path,
          session_duration_sec,
          event_properties: normalizedEventProperties,
          ip_hash: ipHash,
          user_agent: userAgent,
        },
      ]),
      supabase
        .from("user_session_journeys")
        .select("lead_id, user_id, total_duration_sec, current_lifecycle_stage")
        .eq("visitor_id", visitor_id)
        .maybeSingle(),
    ]);

    if (eventRes.error) {
      throw new Error(`telemetry event insert failed: ${eventRes.error.message}`);
    }
    if (journeyRes.error) {
      throw new Error(`session journey lookup failed: ${journeyRes.error.message}`);
    }

    // The journey row follows the LIVE schema (tsai-spotlight
    // supabase/migrations/20260725160000_create_telemetry_and_retention.sql). Phase 156 found this
    // block writing columns that do not exist (total_pageviews, total_session_sec, funnel_stage,
    // first_touch_source, first_landing_page) and stage values outside the lifecycle_stage enum;
    // every write failed and the errors were dropped, so no journey was ever recorded.
    const existingJourney = journeyRes.data;
    const durationSec = Math.max(0, Math.floor(Number(session_duration_sec) || 0));
    // Only the stages this route can actually observe. A stage set elsewhere (beta_applicant,
    // power_user, …) is never downgraded by a page view.
    const observedStage = user_id ? "activated_user" : "anonymous_visitor";

    if (existingJourney) {
      const { error: journeyUpdateError } = await supabase
        .from("user_session_journeys")
        .update({
          user_id: user_id || existingJourney.user_id,
          total_duration_sec: (existingJourney.total_duration_sec || 0) + durationSec,
          last_active_at: nowIso,
          current_lifecycle_stage:
            existingJourney.current_lifecycle_stage === "anonymous_visitor" ? observedStage : existingJourney.current_lifecycle_stage,
          updated_at: nowIso,
        })
        .eq("visitor_id", visitor_id);
      if (journeyUpdateError) {
        throw new Error(`session journey update failed: ${journeyUpdateError.message}`);
      }
    } else {
      const referrer = (normalizedEventProperties as Record<string, unknown> | null)?.referrer;
      const { error: journeyInsertError } = await supabase.from("user_session_journeys").insert([
        {
          visitor_id,
          lead_id,
          user_id,
          acquisition_source: typeof referrer === "string" && referrer ? referrer : "direct",
          total_sessions: 1,
          total_duration_sec: durationSec,
          current_lifecycle_stage: observedStage,
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

