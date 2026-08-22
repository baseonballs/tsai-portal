import { required } from "@/utils/require-env";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: "visitor_id and event_type are required." }, { status: 400 });
    }

    // IP Anonymization (SHA-256 hash first 16 chars)
    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(rawIp).digest("hex").substring(0, 16);
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Supabase service role client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:5550";
    const serviceKey = required(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Insert Telemetry Event
    const { error: eventErr } = await supabase.from("user_telemetry_events").insert([
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
    ]);

    if (eventErr) {
      console.error("[TelemetryAPI] Error inserting event:", eventErr.message);
    }

    // 2. Upsert User Session Journey
    const nowIso = new Date().toISOString();
    const { data: existingJourney } = await supabase
      .from("user_session_journeys")
      .select("*")
      .eq("visitor_id", visitor_id)
      .single();

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

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[TelemetryAPI] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "An unexpected error occurred." }, { status: 500 });
  }
}
