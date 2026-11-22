/**
 * Wave 6 W-S29 verification suite:
 *   - Strict live-schema enforcement against `20260725160000_create_telemetry_and_retention.sql`
 *   - M2: Unauthenticated/client telemetry (including `conversion_submit` and forged `custom_event_type`)
 *     never promotes to `beta_applicant` or stamps `converted_at`; server-linked `lead_id` / stage preserved
 *   - m2: Unknown event types normalize to `"custom"`, never `"feature_use"` (cannot inflate `power_user`)
 *   - M3: Concurrent first-visit `23505` recovery, concurrent same-session beacons, & concurrent distinct-session CAS
 *   - m5: `visitor_id` collision never overwrites an existing authenticated `journey.user_id`
 *   - Client `tracker.ts`: `session_id` (`tsai_sid`), `"custom"` coercion, & `custom_event_type` stripping
 *
 * Run: npx tsx scripts/test-portal-telemetry-journeys.ts
 */
import assert from "node:assert/strict";
import Module from "node:module";
import { NextRequest } from "next/server";

const USER_1_ID = "00000000-0000-4000-8000-000000000301";
const USER_2_ID = "00000000-0000-4000-8000-000000000302";
const LEAD_1_ID = "00000000-0000-4000-8000-000000000901";

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

type TelemetryTableName = "user_telemetry_events" | "user_session_journeys";

interface TelemetryMockDb {
  user_telemetry_events: Row[];
  user_session_journeys: Row[];
}

function toPostgrestTimestamptz(raw: string): string {
  return raw.replace(/\.(\d+)Z$/, (_match, frac: string) => {
    const trimmed = frac.replace(/0+$/, "");
    return trimmed ? `.${trimmed}+00:00` : "+00:00";
  });
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
    from(table: TelemetryTableName) {
      const filters: Array<(r: Row) => boolean> = [];
      let op: "select" | "insert" | "update" = "select";
      let payload: Row | Row[] | null = null;
      let orderCol: string | null = null;
      let orderAsc = true;
      let rowLimit: number | null = null;
      let wantSelect = false;

      const execute = async (): Promise<{ data: unknown; error: { code?: string; message: string } | null }> => {
        // Yield a microtask so Promise.all concurrent requests genuinely interleave.
        await Promise.resolve();
        const rows = state[table];
        const matched = () => {
          let list = rows.filter((r) => filters.every((fn) => fn(r)));
          if (orderCol) {
            list = [...list].sort((a, b) => {
              if (orderCol === "created_at") {
                const at = Date.parse(String(a[orderCol] ?? ""));
                const bt = Date.parse(String(b[orderCol] ?? ""));
                if (Number.isFinite(at) && Number.isFinite(bt) && at !== bt) {
                  return orderAsc ? at - bt : bt - at;
                }
              }
              const av = String(a[orderCol!] ?? "");
              const bv = String(b[orderCol!] ?? "");
              return orderAsc ? av.localeCompare(bv) : bv.localeCompare(av);
            });
          }
          if (rowLimit !== null) list = list.slice(0, rowLimit);
          return list;
        };

        if (op === "select") {
          return {
            data: matched().map((r) => ({
              ...r,
              ...(table === "user_telemetry_events" && typeof r.created_at === "string"
                ? { created_at: toPostgrestTimestamptz(r.created_at) }
                : {}),
            })),
            error: null,
          };
        }

        if (op === "insert" && payload) {
          const items = Array.isArray(payload) ? payload : [payload];
          const inserted: Row[] = [];
          for (const item of items) {
            validateRowPayload(table, item);
            if (table === "user_session_journeys") {
              if (rows.some((r) => r.visitor_id === item.visitor_id)) {
                return { data: null, error: { code: "23505", message: "duplicate key value violates unique constraint" } };
              }
            }
            const defaultCreatedAt = new Date(1795000000000 + rows.length * 1000).toISOString();
            const created = {
              id: item.id ?? `row-${rows.length + 1}`,
              created_at: item.created_at ?? defaultCreatedAt,
              ...item,
            };
            rows.push(created);
            inserted.push({
              ...created,
              ...(table === "user_telemetry_events" && typeof created.created_at === "string"
                ? { created_at: toPostgrestTimestamptz(created.created_at) }
                : {}),
            });
          }
          return { data: wantSelect ? inserted : null, error: null };
        }

        if (op === "update" && payload && !Array.isArray(payload)) {
          validateRowPayload(table, payload);
          const targets = rows.filter((r) => filters.every((fn) => fn(r)));
          for (const row of targets) Object.assign(row, payload);
          return { data: wantSelect ? targets.map((r) => ({ ...r })) : null, error: null };
        }

        return { data: [], error: null };
      };

      const q: Record<string, unknown> = {
        select: (cols: string) => {
          const parsed = cols.split(",").map((c) => c.trim()).filter(Boolean);
          assertColumns(table, parsed);
          if (op !== "select") wantSelect = true;
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

    // 1. M2: Behavioral progression & anti-forgery (conversion_submit & spoofed custom_event_type)
    mockUser = null;
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "page_view", session_id: "sid_1", session_duration_sec: 5 })).status, 200);
    let journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.total_sessions, 1);
    assert.equal(journeyA.total_duration_sec, 5);
    assert.equal(journeyA.current_lifecycle_stage, "anonymous_visitor");
    assert.equal(journeyA.converted_at, null);

    // Spoofed custom_event_type on page_view is stripped and cannot forge beta_applicant / converted_at
    assert.equal(
      (await postEvent({
        visitor_id: "vid_a",
        event_type: "page_view",
        session_id: "sid_1",
        event_properties: { custom_event_type: "beta_signup" },
      })).status,
      200,
    );
    const spoofedStored = db.user_telemetry_events[db.user_telemetry_events.length - 1];
    assert.equal((spoofedStored.event_properties as Record<string, unknown>).custom_event_type, undefined);
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.current_lifecycle_stage, "engaged_prospect");
    assert.equal(journeyA.converted_at, null);

    // Unauthenticated conversion_submit also cannot forge beta_applicant or stamp converted_at
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "conversion_submit", session_id: "sid_2" })).status, 200);
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.total_sessions, 2);
    assert.equal(journeyA.current_lifecycle_stage, "engaged_prospect");
    assert.equal(journeyA.converted_at, null);

    // Server-linked lead_id / beta_applicant stage IS respected monotonically and preserved
    journeyA.lead_id = LEAD_1_ID;
    journeyA.current_lifecycle_stage = "beta_applicant";
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "page_view", session_id: "sid_2" })).status, 200);
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.current_lifecycle_stage, "beta_applicant");
    assert.ok(journeyA.converted_at, "server-linked lead sets converted_at");

    // Verified GoTrue session advances to activated_user; new sid_3 increments total_sessions to 3
    mockUser = { id: USER_1_ID };
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "page_view", session_id: "sid_3" })).status, 200);
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.user_id, USER_1_ID);
    assert.equal(journeyA.total_sessions, 3);
    assert.equal(journeyA.current_lifecycle_stage, "activated_user");

    // m2: Unknown event types normalize to "custom" (NOT "feature_use"), so 5 custom events stay activated_user
    for (let i = 0; i < 5; i++) {
      assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "custom_scroll_ping", session_id: "sid_3" })).status, 200);
      const lastEv = db.user_telemetry_events[db.user_telemetry_events.length - 1];
      assert.equal(lastEv.event_type, "custom");
    }
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.current_lifecycle_stage, "activated_user");

    // 3 real feature_use events as authenticated owner advance to power_user
    for (let i = 0; i < 3; i++) {
      assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "feature_use", session_id: "sid_3" })).status, 200);
    }
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.total_sessions, 3);
    assert.equal(journeyA.current_lifecycle_stage, "power_user");

    // Signed-out bounce never regresses power_user
    mockUser = null;
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "bounce", session_id: "sid_3" })).status, 200);
    assert.equal(db.user_session_journeys.find((j) => j.visitor_id === "vid_a")?.current_lifecycle_stage, "power_user");
    console.log("✓ 1. M2 & m2: anti-forgery, custom coercion, server-lead preservation & monotonic progression verified");

    // 2. m5: visitor_id collision never overwrites existing journey.user_id
    mockUser = { id: USER_2_ID };
    assert.equal((await postEvent({ visitor_id: "vid_a", event_type: "feature_use", session_id: "sid_u2" })).status, 200);
    journeyA = db.user_session_journeys.find((j) => j.visitor_id === "vid_a")!;
    assert.equal(journeyA.user_id, USER_1_ID, "different authenticated user must not overwrite journey owner");

    mockUser = { id: USER_1_ID };
    assert.equal((await postEvent({ visitor_id: "vid_owner", event_type: "page_view", session_id: "sid_o1" })).status, 200);
    mockUser = { id: USER_2_ID };
    for (let i = 0; i < 4; i++) {
      assert.equal((await postEvent({ visitor_id: "vid_owner", event_type: "feature_use", session_id: "sid_o1" })).status, 200);
    }
    const ownerJourney = db.user_session_journeys.find((j) => j.visitor_id === "vid_owner")!;
    assert.equal(ownerJourney.user_id, USER_1_ID);
    assert.equal(ownerJourney.current_lifecycle_stage, "activated_user", "other user's events cannot escalate owner");
    console.log("✓ 2. m5: existing journey.user_id is protected against visitor_id collision");

    // 3. M3: Concurrent first-visit 23505 race, concurrent same-session, & concurrent distinct-session CAS
    mockUser = null;
    const firstRaceResponses = await Promise.all([
      postEvent({ visitor_id: "vid_race", event_type: "page_view", session_id: "sid_r1", session_duration_sec: 4 }),
      postEvent({ visitor_id: "vid_race", event_type: "section_view", session_id: "sid_r1", session_duration_sec: 6 }),
    ]);
    assert.ok(firstRaceResponses.every((r) => r.status === 200), "23505 insert race must recover cleanly to 200");
    let raceJourney = db.user_session_journeys.find((j) => j.visitor_id === "vid_race")!;
    assert.equal(raceJourney.total_sessions, 1, "concurrent beacons in initial session stay total_sessions=1");
    assert.equal(raceJourney.total_duration_sec, 10);
    assert.equal(raceJourney.current_lifecycle_stage, "engaged_prospect");

    const sameNewSidResponses = await Promise.all([
      postEvent({ visitor_id: "vid_race", event_type: "page_view", session_id: "sid_r2" }),
      postEvent({ visitor_id: "vid_race", event_type: "button_click", session_id: "sid_r2" }),
    ]);
    assert.ok(sameNewSidResponses.every((r) => r.status === 200));
    raceJourney = db.user_session_journeys.find((j) => j.visitor_id === "vid_race")!;
    assert.equal(raceJourney.total_sessions, 2, "concurrent same new session_id increments once to 2");

    const diffNewSidResponses = await Promise.all([
      postEvent({ visitor_id: "vid_race", event_type: "page_view", session_id: "sid_r3" }),
      postEvent({ visitor_id: "vid_race", event_type: "page_view", session_id: "sid_r4" }),
    ]);
    assert.ok(diffNewSidResponses.every((r) => r.status === 200));
    raceJourney = db.user_session_journeys.find((j) => j.visitor_id === "vid_race")!;
    assert.equal(raceJourney.total_sessions, 4, "concurrent distinct session_ids both persist via CAS retry");
    console.log("✓ 3. M3: concurrent 23505 recovery, same-session dedupe & distinct-session CAS verified");

    // 4. >200-event window check + retention-managed stage preservation
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

    // Concurrent same-session race inside windowExhausted (>200 events)
    const histRaceResponses = await Promise.all([
      postEvent({ visitor_id: "vid_hist", event_type: "page_view", session_id: "sid_hist_race" }),
      postEvent({ visitor_id: "vid_hist", event_type: "button_click", session_id: "sid_hist_race" }),
    ]);
    assert.ok(histRaceResponses.every((r) => r.status === 200));
    assert.equal(db.user_session_journeys.find((j) => j.visitor_id === "vid_hist")?.total_sessions, 4);

    // Deterministic compareEventOrder coverage for PostgREST +00:00 trimmed fractions & microseconds vs JS Z
    const { computeNextJourneyState } = await import("../src/lib/telemetry/journey-lifecycle");
    const postgrestFirstRes = computeNextJourneyState({
      existingJourney: { total_sessions: 4, total_duration_sec: 100, current_lifecycle_stage: "engaged_prospect" },
      currentEvent: {
        id: "zzz-event",
        event_type: "button_click",
        event_properties: { session_id: "sid_pg_tie" },
        session_id: "sid_pg_tie",
        duration_sec: 1,
        user_id: null,
        created_at: "2026-11-22T08:00:00.100Z",
      },
      priorEvents: [
        {
          id: "aaa-event",
          user_id: null,
          event_type: "page_view",
          event_properties: { session_id: "sid_pg_tie" },
          created_at: "2026-11-22T08:00:00.1+00:00",
        },
      ],
      windowExhausted: true,
      nowIso: "2026-11-22T08:00:00.100Z",
    });
    assert.equal(
      postgrestFirstRes.totalSessions,
      4,
      "PostgREST .1+00:00 equals JS .100Z so earlier id aaa-event wins tie-break",
    );

    const jsEarlierWholeSecRes = computeNextJourneyState({
      existingJourney: { total_sessions: 4, total_duration_sec: 100, current_lifecycle_stage: "engaged_prospect" },
      currentEvent: {
        id: "aaa-event",
        event_type: "page_view",
        event_properties: { session_id: "sid_pg_whole" },
        session_id: "sid_pg_whole",
        duration_sec: 1,
        user_id: null,
        created_at: "2026-11-22T08:00:00.000Z",
      },
      priorEvents: [
        {
          id: "zzz-event",
          user_id: null,
          event_type: "button_click",
          event_properties: { session_id: "sid_pg_whole" },
          created_at: "2026-11-22T08:00:00+00:00",
        },
      ],
      windowExhausted: true,
      nowIso: "2026-11-22T08:00:00.000Z",
    });
    assert.equal(
      jsEarlierWholeSecRes.totalSessions,
      5,
      "JS .000Z matches PostgREST whole-second +00:00 and wins tie-break by smaller id",
    );

    const subMsOrderRes = computeNextJourneyState({
      existingJourney: { total_sessions: 4, total_duration_sec: 100, current_lifecycle_stage: "engaged_prospect" },
      currentEvent: {
        id: "zzz-event",
        event_type: "page_view",
        event_properties: { session_id: "sid_pg_subms" },
        session_id: "sid_pg_subms",
        duration_sec: 1,
        user_id: null,
        created_at: "2026-11-22T08:00:00.123Z",
      },
      priorEvents: [
        {
          id: "aaa-event",
          user_id: null,
          event_type: "button_click",
          event_properties: { session_id: "sid_pg_subms" },
          created_at: "2026-11-22T08:00:00.123456+00:00",
        },
      ],
      windowExhausted: true,
      nowIso: "2026-11-22T08:00:00.123Z",
    });
    assert.equal(
      subMsOrderRes.totalSessions,
      5,
      ".123Z (.123000) sorts before .123456+00:00 even with larger UUID",
    );

    // Un-sessioned initial event + concurrent distinct new session_ids (!windowExhausted) must NOT double-count (1 -> 3, not 4)
    db.user_session_journeys.push({
      id: "journey-nosid-race",
      visitor_id: "vid_nosid_race",
      lead_id: null,
      user_id: null,
      first_seen_at: "2026-01-01T00:00:00.000Z",
      converted_at: null,
      last_active_at: "2026-01-01T00:00:00.000Z",
      total_sessions: 1,
      total_duration_sec: 10,
      acquisition_source: "direct",
      current_lifecycle_stage: "anonymous_visitor",
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    db.user_telemetry_events.push({
      id: "ev-nosid-initial",
      visitor_id: "vid_nosid_race",
      event_type: "page_view",
      event_properties: {},
      created_at: "2026-01-01T00:00:00.000Z",
    });
    const noSidDistinctRace = await Promise.all([
      postEvent({ visitor_id: "vid_nosid_race", event_type: "page_view", session_id: "sid_nr_1" }),
      postEvent({ visitor_id: "vid_nosid_race", event_type: "page_view", session_id: "sid_nr_2" }),
    ]);
    assert.ok(noSidDistinctRace.every((r) => r.status === 200));
    assert.equal(
      db.user_session_journeys.find((j) => j.visitor_id === "vid_nosid_race")?.total_sessions,
      3,
      "initial un-sessioned event + 2 concurrent distinct sessions must equal 3 without CAS double-count",
    );

    // Pre-Wave-6 legacy journey (total_sessions > seenSessions.size, un-sessioned prior event) still increments cleanly
    db.user_session_journeys.push({
      id: "journey-legacy",
      visitor_id: "vid_legacy",
      lead_id: null,
      user_id: null,
      first_seen_at: "2026-01-01T00:00:00.000Z",
      converted_at: null,
      last_active_at: "2026-01-01T00:00:00.000Z",
      total_sessions: 5,
      total_duration_sec: 120,
      acquisition_source: "direct",
      current_lifecycle_stage: "engaged_prospect",
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    db.user_telemetry_events.push({
      id: "ev-legacy-nosid",
      visitor_id: "vid_legacy",
      event_type: "page_view",
      event_properties: {},
      created_at: "2026-01-01T00:00:00.000Z",
    });
    const legacyRace = await Promise.all([
      postEvent({ visitor_id: "vid_legacy", event_type: "page_view", session_id: "sid_leg_1" }),
      postEvent({ visitor_id: "vid_legacy", event_type: "button_click", session_id: "sid_leg_1" }),
    ]);
    assert.ok(legacyRace.every((r) => r.status === 200));
    assert.equal(db.user_session_journeys.find((j) => j.visitor_id === "vid_legacy")?.total_sessions, 6);
    assert.equal((await postEvent({ visitor_id: "vid_legacy", event_type: "page_view", session_id: "sid_leg_2" })).status, 200);
    assert.equal(db.user_session_journeys.find((j) => j.visitor_id === "vid_legacy")?.total_sessions, 7);

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
    console.log("✓ 4. >200-event window check and at_risk preservation verified");

    // 5. Client tracker generates tsai_sid, normalizes unknown -> "custom", & strips custom_event_type spoof
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
      assert.ok(sid1.startsWith("sid_"));
      await tracker.trackEvent({
        event_type: "button_click",
        session_id: "   ",
        event_properties: { custom_event_type: "beta_signup" },
      });
      await tracker.trackEvent({ event_type: "video_hover" });
      await new Promise((r) => setTimeout(r, 10));
      assert.equal(beacons.length, 2);
      const b0 = JSON.parse(beacons[0]) as { event_type?: string; session_id?: string; event_properties?: Record<string, unknown> };
      assert.equal(b0.event_type, "button_click");
      assert.equal(b0.session_id, sid1);
      assert.equal(b0.event_properties?.custom_event_type, undefined);
      const b1 = JSON.parse(beacons[1]) as { event_type?: string; event_properties?: Record<string, unknown> };
      assert.equal(b1.event_type, "custom");
      assert.equal(b1.event_properties?.custom_event_type, "video_hover");
    } finally {
      delete (globalThis as Record<string, unknown>).window;
      delete (globalThis as Record<string, unknown>).document;
      if (origNavDescriptor) Object.defineProperty(globalThis, "navigator", origNavDescriptor);
      else delete (globalThis as Record<string, unknown>).navigator;
    }
    console.log("✓ 5. Client tracker tsai_sid, custom normalization & anti-spoof verified");

    console.log("\n🎉 ALL PORTAL TELEMETRY SESSION & LIFECYCLE TESTS PASSED!\n");
  } finally {
    MI._load = origLoad;
  }
}

run().catch((err) => {
  console.error("\n❌ PORTAL TELEMETRY JOURNEYS TEST FAILED:", err);
  process.exit(1);
});
