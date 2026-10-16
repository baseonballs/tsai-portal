import { required } from "@/utils/require-env";
import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { errorMessage } from "@/lib/errors";
import { createServerTimingRecorder } from "@/lib/perf/server-timing";
import { resolveServerAuthUrl } from "@/utils/supabase/resolve-server-auth-url";

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
      lead_id = null,
      user_id = null,
    } = body;

    if (!visitor_id || !event_type) {
      return NextResponse.json(
        { error: "visitor_id and event_type are required." },
        { status: 400, headers: { "Server-Timing": timing.toHeaderValue() } },
      );
    }

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
          event_type,
          event_category,
          page_path,
          session_duration_sec,
          event_properties,
          ip_hash: ipHash,
          user_agent: userAgent,
        },
      ]),
      supabase
        .from("user_session_journeys")
        .select("lead_id, user_id, total_pageviews, total_session_sec")
        .eq("visitor_id", visitor_id)
        .maybeSingle(),
    ]);

    if (eventRes.error) {
      console.error("[TelemetryAPI] Error inserting event:", eventRes.error.message);
    }

    const existingJourney = journeyRes.data;

    if (existingJourney) {
      await supabase
        .from("user_session_journeys")
        .update({
          lead_id: lead_id || existingJourney.lead_id,
          user_id: user_id || existingJourney.user_id,
          total_pageviews: (existingJourney.total_pageviews || 0) + 1,
          total_session_sec: (existingJourney.total_session_sec || 0) + session_duration_sec,
          last_active_at: nowIso,
          funnel_stage: user_id ? "active_user" : lead_id ? "lead_captured" : "anonymous_visitor",
          updated_at: nowIso,
        })
        .eq("visitor_id", visitor_id);
    } else {
      await supabase.from("user_session_journeys").insert([
        {
          visitor_id,
          lead_id,
          user_id,
          first_touch_source: event_properties?.referrer || "direct",
          first_landing_page: page_path,
          total_pageviews: 1,
          total_session_sec: session_duration_sec,
          funnel_stage: user_id ? "active_user" : lead_id ? "lead_captured" : "anonymous_visitor",
          first_seen_at: nowIso,
          last_active_at: nowIso,
        },
      ]);
    }
    timing.record("db", performance.now() - dbStartedAt, "Telemetry persistence");

    return NextResponse.json(
      { success: true },
      { headers: { "Server-Timing": timing.toHeaderValue() } },
    );
  } catch (err) {
    console.error("[TelemetryAPI] Unexpected error:", err);
    return NextResponse.json(
      { error: errorMessage(err) || "An unexpected error occurred." },
      { status: 500, headers: { "Server-Timing": timing.toHeaderValue() } },
    );
  }
}

