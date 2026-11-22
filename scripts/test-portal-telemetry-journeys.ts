/**
 * Wave 6 W-S29 verification suite:
 *   - Strict live-schema enforcement against `20260725160000_create_telemetry_and_retention.sql`
 *     (`user_telemetry_events`, `user_session_journeys`, `public.lifecycle_stage` enum)
 *   - `total_sessions` truthful `+ 1` increments on distinct new `session_id` (and no double-count on repeat / >200 event history)
 *   - Monotonic `current_lifecycle_stage` progression (`anonymous_visitor` -> `engaged_prospect` -> `beta_applicant` -> `activated_user` -> `power_user`)
 *   - Verified GoTrue session gate (anonymous events never promote past `beta_applicant`; higher stages never regress)
 *   - Client `tracker.ts` `session_id` generation & beacon payload
 *
 * Run: npx tsx scripts/test-portal-telemetry-journeys.ts
 */
import assert from "node:assert/strict";
import Module from "node:module";
import { NextRequest } from "next/server";

const USER_1_ID = "00000000-0000-4000-8000-000000000301";

const REAL_EVENT_COLS = new Set([
  "id",
  "visitor_id",
  "user_id",
  "lead_id",
  "event_type",
  "event_category",
  "page_path",
  "session_duration_sec",
  "event_properties",
  "ip_hash",
  "user_agent",
  "created_at",
]);

const REAL_JOURNEY_COLS = new Set([
  "id",
  "visitor_id",
  "lead_id",
  "user_id",
  "first_seen_at",
  "converted_at",
  "last_active_at",
  "total_sessions",
  "total_duration_sec",
  "acquisition_source",
  "current_lifecycle_stage",
  "updated_at",
]);

const VALID_LIFECYCLE_STAGES = new Set([
  "anonymous_visitor",
  "engaged_prospect",
  "beta_applicant",
  "activated_user",
  "power_user",
  "at_risk",
  "churned_exit",
]);

type Row = Record<string, unknown>;

interface TelemetryMockDb {
  user_telemetry_events: Row[];
  user_session_journeys: Row[];
}

function assertColumns(table: string, cols: string[]) {
  const allowed = table === "user_telemetry_events" ? REAL_EVENT_COLS : REAL_JOURNEY_COLS;
  for (const col of cols) {
    if (!allowed.has(col)) {
      throw new Error(`column ${table}.${col} does not exist in live schema`);
    }
  }
}

function validateRowPayload(table: string, payload: Row) {
  assertColumns(table, Object.keys(payload));
  if (table === "user_session_journeys" && "current_lifecycle_stage" in payload) {
    const stage = String(payload.current_lifecycle_stage ?? "");
    if (!VALID_LIFECYCLE_STAGES.has(stage)) {
      throw new Error(`invalid input value for enum public.lifecycle_stage: "${stage}"`);
    }
  }
}

function createFakeTelemetryDbClient(state: TelemetryMockDb) {
  return {
    from(table: keyof TelemetryMockDb & string) {
      const filters: Array<(r: Row) => boolean> = [];
      let op: "select" | "insert" | "update" = "select";
      let payload: Row | Row[] | null = null;
      let orderCol: string | null = null;
      let orderAsc = true;
      let rowLimit: number | null = null;

      const execute = async (): Promise<{ data: unknown; error: { message: string } | null }> => {
        const rows = state[table];
        const matched = () => {
          let list = rows.filter((r) => filters.every((fn) => fn(r)));
          if (orderCol) {
            list = [...list].sort((a, b) => {
              const av = String(a[orderCol!] ?? "");
              const bv = String(b[orderCol!] ?? "");
              return orderAsc ? av.localeCompare(bv) : bv.localeCompare(av);
            });
          }
          if (rowLimit !== null) list = list.slice(0, rowLimit);
          return list;
        };

        if (op === "select") {
          return { data: matched().map((r) => ({ ...r })), error: null };
        }

        if (op === "insert" && payload) {
          const items = Array.isArray(payload) ? payload : [payload];
          for (const item of items) {
            validateRowPayload(table, item);
            if (table === "user_session_journeys") {
              if (rows.some((r) => r.visitor_id === item.visitor_id)) {
                return { data: null, error: { message: "duplicate visitor_id" } };
              }
            }
            const created = {
              id: item.id ?? `row-${rows.length + 1}`,
              created_at: item.created_at ?? new Date(1795000000000 + rows.length * 1000).toISOString(),
              ...item,
            };
            rows.push(created);
          }
          return { data: null, error: null };
        }

        if (op === "update" && payload && !Array.isArray(payload)) {
          validateRowPayload(table, payload);
          const targets = rows.filter((r) => filters.every((fn) => fn(r)));
          for (const row of targets) Object.assign(row, payload);
          return { data: null, error: null };
        }

        return { data: [], error: null };
      };

      const q: Record<string, unknown> = {
        select: (cols: string) => {
          const parsed = cols.split(",").map((c) => c.trim()).filter(Boolean);
          assertColumns(table, parsed);
          return q;
        },
        insert: (p: Row | Row[]) => {
          op = "insert";
          payload = p;
          return q;
        },
        update: (p: Row) => {
          op = "update";
          payload = p;
          return q;
        },
        eq: (col: string, val: unknown) => {
          assertColumns(table, [col]);
          filters.push((r) => r[col] === val);
          return q;
        },
        neq: (col: string, val: unknown) => {
          assertColumns(table, [col]);
          filters.push((r) => r[col] !== val);
          return q;
        },
        contains: (col: string, val: Record<string, unknown>) => {
          assertColumns(table, [col]);
          filters.push((r) => {
            const obj = r[col] as Record<string, unknown> | undefined;
            if (!obj || typeof obj !== "object") return false;
            return Object.entries(val).every(([k, v]) => obj[k] === v);
          });
          return q;
        },
        order: (col: string, opts?: { ascending?: boolean }) => {
          assertColumns(table, [col]);
          orderCol = col;
          orderAsc = opts?.ascending !== false;
          return q;
        },
        limit: (n: number) => {
          rowLimit = n;
          return q;
        },
        maybeSingle: async () => {
          const res = await execute();
          if (res.error) return { data: null, error: res.error };
          const list = Array.isArray(res.data) ? res.data : [];
          return { data: list[0] ?? null, error: null };
        },
        then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
          execute().then(resolve, reject),
      };
      return q;
    },
  };
}

async function run() {
  console.log("=== Wave 6 W-S29 Telemetry Session & Lifecycle Journeys Suite ===\n");

  const db: TelemetryMockDb = {
    user_telemetry_events: [],
    user_session_journeys: [],
  };
  let mockUser: { id: string } | null = null;

  const MI = Module as unknown as { _load: (r: string, p: unknown, m: boolean) => unknown };
  const origLoad = MI._load;
  MI._load = function (r: string, p: unknown, m: boolean) {
    if (r === "server-only") return {};
    if (r === "@supabase/supabase-js") {
      return {
        createClient: () => createFakeTelemetryDbClient(db),
      };
    }
    if (r === "@/utils/supabase/server") {
      return {
        createClient: async () => ({
          auth: {
            getUser: async () => ({ data: { user: mockUser }, error: null }),
          },
        }),
      };
    }
    return origLoad.call(this, r, p, m);
  };

  process.env.SUPABASE_SERVICE_ROLE_KEY = "unit-test-service-role-key";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:5550";

  try {
    const telemetryRoute = await import("../src/app/api/telemetry/event/route");
    const postEvent = (body: unknown) =>
      telemetryRoute.POST(
        new NextRequest("https://hub.transcendental-sports.ai/api/telemetry/event", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
      );

    // 1. Visitor A full monotonic lifecycle + truthful total_sessions increments
    mockUser = null;
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "page_view", session_id: "sid_1", session_duration_sec: 5 })).status, 200);
    let journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.total_sessions, 1);
    assert.equal(journeyA.total_duration_sec, 5);
    assert.equal(journeyA.current_lifecycle_stage, "anonymous_visitor");
    assert.equal(journeyA.converted_at, null);

    // Same session_id does NOT increment total_sessions; section_view promotes to engaged_prospect
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "section_view", session_id: "sid_1", session_duration_sec: 10 })).status, 200);
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.total_sessions, 1);
    assert.equal(journeyA.total_duration_sec, 15);
    assert.equal(journeyA.current_lifecycle_stage, "engaged_prospect");

    // Page view never regresses engaged_prospect; omitting session_id keeps total_sessions unchanged
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "page_view" })).status, 200);
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.total_sessions, 1);
    assert.equal(journeyA.current_lifecycle_stage, "engaged_prospect");

    // Distinct new session_id increments total_sessions + 1; conversion_submit advances to beta_applicant
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "conversion_submit", session_id: "sid_2" })).status, 200);
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.total_sessions, 2);
    assert.equal(journeyA.current_lifecycle_stage, "beta_applicant");
    assert.ok(journeyA.converted_at, "beta_applicant sets converted_at");

    // Repeat event with sid_2 keeps total_sessions at 2; lower event never regresses beta_applicant
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "button_click", session_id: "sid_2" })).status, 200);
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.total_sessions, 2);
    assert.equal(journeyA.current_lifecycle_stage, "beta_applicant");

    // Verified GoTrue session advances to activated_user; new sid_3 increments total_sessions to 3
    mockUser = { id: USER_1_ID };
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "page_view", session_id: "sid_3" })).status, 200);
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.user_id, USER_1_ID);
    assert.equal(journeyA.total_sessions, 3);
    assert.equal(journeyA.current_lifecycle_stage, "activated_user");

    // 3 feature_use events as authenticated user advance to power_user
    for (let i = 0; i < 3; i++) {
      assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "feature_use", session_id: "sid_3" })).status, 200);
    }
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.total_sessions, 3);
    assert.equal(journeyA.current_lifecycle_stage, "power_user");

    // Signed-out bounce / page_view NEVER regresses power_user
    mockUser = null;
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "bounce", session_id: "sid_3" })).status, 200);
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.current_lifecycle_stage, "power_user");
    console.log("✓ 1. Monotonic 5-stage lifecycle progression & truthful total_sessions verified");

    // 2. Anonymous visitor cannot reach activated_user/power_user even with many feature_use events or spoofed body user_id
    for (let i = 0; i < 5; i++) {
      assert.equal(
        (await postEvent({
          visitor_id: "vid_anon",
          user_id: USER_1_ID,
          lead_id: "00000000-0000-4000-8000-000000000999",
          event_type: "feature_use",
          session_id: "sid_anon_1",
        })).status,
        200,
      );
    }
    const journeyAnon = db.user_session_journeys.find((j) => j.visitor_id === "vid_anon")!;
    assert.equal(journeyAnon.user_id, null);
    assert.equal(journeyAnon.lead_id, null);
    assert.equal(journeyAnon.current_lifecycle_stage, "engaged_prospect");
    console.log("✓ 2. Anonymous callers stay capped at engaged_prospect/beta_applicant and cannot spoof identity");

    // 3. Multi-session > 200 event window check: older seen session_id is NOT double-counted
    db.user_session_journeys.push({
      id: "journey-hist",
      visitor_id: "vid_hist",
      lead_id: null,
      user_id: null,
      first_seen_at: "2026-01-01T00:00:00.000Z",
      converted_at: null,
      last_active_at: "2026-01-01T00:00:00.000Z",
      total_sessions: 2,
      total_duration_sec: 100,
      acquisition_source: "direct",
      current_lifecycle_stage: "engaged_prospect",
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    db.user_telemetry_events.push({
      id: "ev-old-sid",
      visitor_id: "vid_hist",
      event_type: "page_view",
      event_properties: { session_id: "sid_old" },
      created_at: new Date(1790000000000).toISOString(),
    });
    for (let i = 0; i < 205; i++) {
      db.user_telemetry_events.push({
        id: `ev-pad-${i}`,
        visitor_id: "vid_hist",
        event_type: "page_view",
        event_properties: { session_id: "sid_recent" },
        created_at: new Date(1791000000000 + i * 1000).toISOString(),
      });
    }
    assert.equal((await postEvent({ visitor_id: "vid_hist", event_type: "page_view", session_id: "sid_old" })).status, 200);
    assert.equal(db.user_session_journeys.find((j) => j.visitor_id === "vid_hist")?.total_sessions, 2);
    assert.equal((await postEvent({ visitor_id: "vid_hist", event_type: "page_view", session_id: "sid_brand_new" })).status, 200);
    assert.equal(db.user_session_journeys.find((j) => j.visitor_id === "vid_hist")?.total_sessions, 3);
    console.log("✓ 3. >200-event fallback check avoids double-counting older session_id while counting brand-new sessions");

    // 4. Retention-managed stages (at_risk / churned_exit) are preserved without regression
    db.user_session_journeys.push({
      id: "journey-risk",
      visitor_id: "vid_risk",
      lead_id: null,
      user_id: USER_1_ID,
      first_seen_at: "2026-01-01T00:00:00.000Z",
      converted_at: "2026-01-01T00:00:00.000Z",
      last_active_at: "2026-01-01T00:00:00.000Z",
      total_sessions: 4,
      total_duration_sec: 400,
      acquisition_source: "direct",
      current_lifecycle_stage: "at_risk",
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    assert.equal((await postEvent({ visitor_id: "vid_risk", event_type: "page_view", session_id: "sid_r1" })).status, 200);
    assert.equal(db.user_session_journeys.find((j) => j.visitor_id === "vid_risk")?.current_lifecycle_stage, "at_risk");
    console.log("✓ 4. Externally managed at_risk/churned_exit stages are preserved cleanly");

    // 4b. Multi-session authenticated usage (2+ sessions & 5+ non-bounce events) also advances to power_user
    mockUser = { id: USER_1_ID };
    for (let i = 0; i < 3; i++) {
      assert.equal((await postEvent({ visitor_id: "vid_multi", event_type: "page_view", session_id: "sid_m1" })).status, 200);
    }
    assert.equal(db.user_session_journeys.find((j) => j.visitor_id === "vid_multi")?.current_lifecycle_stage, "activated_user");
    assert.equal((await postEvent({ visitor_id: "vid_multi", event_type: "page_view", session_id: "sid_m2" })).status, 200);
    assert.equal(db.user_session_journeys.find((j) => j.visitor_id === "vid_multi")?.current_lifecycle_stage, "activated_user");
    assert.equal((await postEvent({ visitor_id: "vid_multi", event_type: "section_view", session_id: "sid_m2" })).status, 200);
    assert.equal(db.user_session_journeys.find((j) => j.visitor_id === "vid_multi")?.current_lifecycle_stage, "power_user");
    assert.equal(db.user_session_journeys.find((j) => j.visitor_id === "vid_multi")?.total_sessions, 2);

    // 5. Client tracker generates & attaches session_id
    const tracker = await import("../src/lib/telemetry/tracker");
    const store = new Map<string, string>();
    const beacons: string[] = [];
    const origNavDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { pathname: "/pricing" },
        innerWidth: 1280,
        innerHeight: 720,
        sessionStorage: {
          getItem: (k: string) => store.get(k) ?? null,
          setItem: (k: string, v: string) => {
            store.set(k, v);
          },
        },
      },
      configurable: true,
    });
    Object.defineProperty(globalThis, "document", {
      value: { cookie: "", referrer: "" },
      configurable: true,
    });
    Object.defineProperty(globalThis, "navigator", {
      value: {
        sendBeacon: (_url: string, blob: Blob) => {
          void blob.text().then((txt) => beacons.push(txt));
          return true;
        },
      },
      configurable: true,
    });
    try {
      tracker.resetPortalTelemetryCacheForTests();
      const sid1 = tracker.getOrCreateSessionId();
      const sid2 = tracker.getOrCreateSessionId();
      assert.ok(sid1.startsWith("sid_"));
      assert.equal(sid1, sid2, "session ID is stable within a tab session");
      await tracker.trackEvent({ event_type: "button_click", event_category: "pricing" });
      await new Promise((r) => setTimeout(r, 10));
      assert.equal(beacons.length, 1);
      const sent = JSON.parse(beacons[0]) as { session_id?: string; event_properties?: { session_id?: string } };
      assert.equal(sent.session_id, sid1);
      assert.equal(sent.event_properties?.session_id, sid1);
    } finally {
      delete (globalThis as Record<string, unknown>).window;
      delete (globalThis as Record<string, unknown>).document;
      if (origNavDescriptor) Object.defineProperty(globalThis, "navigator", origNavDescriptor);
      else delete (globalThis as Record<string, unknown>).navigator;
    }
    console.log("✓ 5. Client tracker memoizes tsai_sid and transmits session_id");

    console.log("\n🎉 ALL PORTAL TELEMETRY SESSION & LIFECYCLE TESTS PASSED!\n");
  } finally {
    MI._load = origLoad;
  }
}

run().catch((err) => {
  console.error("\n❌ PORTAL TELEMETRY JOURNEYS TEST FAILED:", err);
  process.exit(1);
});
