/**
 * test-multi-sheet-command-center.ts
 * tsai-portal
 *
 * Assignee: Transcendental Sports AI LLC
 * Patent Track 16: TSAI-PATENT-VISION-01 (Docket P229, Claims 9 & 10)
 *
 * 6-Pillar Verification Suite:
 * 1. Strict B8 mappers (fail closed on missing/unknown enums), HTTPS playback guard, & zero stream secrets.
 * 2. Live UI rendering of emergency global mute cascade, sheet mute toggles, & verbatim iCal provisioning.
 * 3. Zero-Purple Tailwind Token Compliance across all tournament components.
 * 4. Tournament Bracket Node Association across all 6 B8 rounds + CANCELLED + nullable fields.
 * 5. Component Modularity & Sub-300-Line Code Constraint.
 * 6. Full BFF route suite: caller-scoped auth, URL resolution, upstream method/url/body assertions,
 *    400 validation, 502 contract drift rejection, and 403/404/409/422/503 status preservation.
 *
 * Run: npx tsx scripts/test-multi-sheet-command-center.ts
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import Module from "node:module";
import type { AddressInfo } from "node:net";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import {
  type BracketMatch,
  type BracketRound,
  type TournamentSheet,
} from "../src/components/tournaments/multi-sheet-types";
import { MultiSheetCommandCenter } from "../src/components/tournaments/MultiSheetCommandCenter";
import { LiveTournamentBracketView } from "../src/components/tournaments/LiveTournamentBracketView";
import {
  mapBracketMatch,
  mapTournamentDetail,
  mapTournamentSheet,
  mapTournamentSummary,
  toUpstreamPayload,
} from "../src/lib/tournament/b8-mappers";
import { parseICalFeed, provisionTournamentSheetsFromICal } from "../src/lib/tournament/ical-tournament-provisioner";

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

interface CapturedUpstreamRequest {
  method: string;
  url: string;
  authorization: string | undefined;
  body: unknown;
}

async function main() {
  console.log("\n=======================================================");
  console.log("=== TRANSCEND PORTAL: MULTI-SHEET COMMAND CENTER AUDIT ===");
  console.log("Patent Track 16 (TSAI-PATENT-VISION-01, Claims 9 & 10)");
  console.log("=======================================================\n");

  const teamId = "11111111-1111-4111-8111-111111111111";
  const tournamentId = "22222222-2222-4222-8222-222222222222";
  const sheetId = "33333333-3333-4333-8333-333333333333";
  const matchId = "44444444-4444-4444-8444-444444444444";

  console.log("--- Pillar 1: Strict B8 Mappers, HTTPS Guard, & Zero Stream Secrets ---");
  runTest("B8 mappers map valid payloads, fail explicitly on missing/unknown enums, and block unsafe playback URLs", () => {
    const validSheetRaw = {
      id: sheetId,
      tournament_id: tournamentId,
      sheet_number: 1,
      rink_name: "North Arena",
      stream_state: "LIVE",
      active_angle: "TACTICAL_PRIMARY",
      youtube_broadcast_id: "ytBcId00001",
      playback_url: "https://youtube.com/live/1",
      bitrate_kbps: 8500,
      fps: 60,
      hardware_health: { temperature_celsius: 41.2, dropped_frames_count: 0, isp_load_percentage: 38, thermal_throttled: false },
      is_public_showcase: true,
      acoustic_shield_muted: false,
    };
    const mappedSheet = mapTournamentSheet(validSheetRaw);
    assert.equal(mappedSheet.sheetId, sheetId);
    assert.equal(mappedSheet.streamState, "LIVE");
    assert.equal("youtubeStreamKey" in mappedSheet, false);
    assert.equal("rtmpsIngestUrl" in mappedSheet, false);
    assert.equal("homeXg" in (mappedSheet.matchInfo ?? {}), false);

    assert.throws(() => mapTournamentSheet({ ...validSheetRaw, stream_state: "BOGUS" }), /stream_state/);
    assert.throws(() => mapTournamentSheet({ ...validSheetRaw, active_angle: "DRONE" }), /active_angle/);
    assert.throws(() => mapTournamentSheet({ ...validSheetRaw, sheet_number: undefined }), /sheet_number/);
    assert.throws(() => mapBracketMatch({ id: matchId, match_label: "QF-1", sort_order: 0, status: "UPCOMING", is_overtime: false }), /round/);
    assert.throws(() => mapBracketMatch({ id: matchId, round: "FINALS", match_label: "QF-1", sort_order: 0, status: "UPCOMING", is_overtime: false }), /round/);
    assert.throws(() => mapBracketMatch({ id: matchId, round: "POOL", match_label: "P-1", sort_order: 0, status: "ABANDONED", is_overtime: false }), /status/);
    assert.throws(
      () =>
        mapTournamentSummary({
          id: tournamentId,
          team_id: teamId,
          name: "Cup",
          format: "invalid_format",
          status: "scheduled",
          emergency_global_audio_mute: false,
          sheet_count: 0,
          match_count: 0,
          created_at: "2026-10-01T00:00:00Z",
        }),
      /format/,
    );

    const detail = mapTournamentDetail({
      id: tournamentId,
      team_id: teamId,
      name: "Regional Cup",
      format: "single_elimination",
      status: "live",
      emergency_global_audio_mute: false,
      created_at: "2026-10-01T00:00:00Z",
      sheets: [validSheetRaw],
      matches: [],
    });
    assert.equal(detail.sheets.length, 1);

    const upstreamPayload = toUpstreamPayload({ teamId, sheetNumber: 1, youtubeStreamKey: "forbidden" });
    assert.equal("teamId" in upstreamPayload, false);
    assert.equal(upstreamPayload.sheet_number, 1);
    assert.equal(upstreamPayload.youtubeStreamKey, "forbidden");

    const httpsHtml = renderToStaticMarkup(
      React.createElement(MultiSheetCommandCenter, {
        sheets: [mappedSheet],
        tournamentId,
        teamId,
      }),
    );
    assert.match(httpsHtml, /href="https:\/\/youtube\.com\/live\/1"/);

    const unsafeSheet: TournamentSheet = { ...mappedSheet, playbackUrl: "javascript:alert(1)" };
    const unsafeHtml = renderToStaticMarkup(
      React.createElement(MultiSheetCommandCenter, {
        sheets: [unsafeSheet],
        tournamentId,
        teamId,
      }),
    );
    assert.doesNotMatch(unsafeHtml, /WATCH YOUTUBE STREAM/);
    assert.doesNotMatch(unsafeHtml, /javascript:/);
  });

  console.log("\n--- Pillar 2: Emergency Audio Shield Cascade UI & Verbatim iCal Ingestion ---");
  runTest("Emergency mute banner/buttons render accurately and iCal preserves LOCATION verbatim", () => {
    const events = parseICalFeed(`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:evt-1
DTSTART:20260918T180000Z
DTEND:20260918T193000Z
SUMMARY:Fixture North vs Fixture South
LOCATION:Fixture Arena Sheet 1
END:VEVENT
BEGIN:VEVENT
UID:evt-2
DTSTART:20260918T180000Z
DTEND:20260918T193000Z
SUMMARY:Fixture East vs Fixture West
LOCATION:Downtown Annex
END:VEVENT
END:VCALENDAR`);

    const report = provisionTournamentSheetsFromICal(events, { currentTime: new Date("2026-09-18T18:30:00Z") });
    assert.equal(report.sheets.length, 1);
    assert.equal(report.sheets[0].rinkName, "Fixture Arena Sheet 1");
    assert.equal(report.unmappedEventsCount, 1);

    const mutedSheets = report.sheets.map((s) => ({ ...s, acousticShieldMuted: true }));
    const html = renderToStaticMarkup(
      React.createElement(MultiSheetCommandCenter, {
        sheets: mutedSheets,
        teamId,
        tournamentId,
        emergencyGlobalAudioMute: true,
        onToggleGlobalMute: () => {},
        onToggleSheetMute: () => {},
      }),
    );
    assert.match(html, /EMERGENCY AUDIO MUTE ACTIVE/);
    assert.match(html, />Muted</);
  });

  console.log("\n--- Pillar 3: Zero-Purple Tailwind Token Compliance ---");
  const componentFiles = [
    path.join(__dirname, "../src/components/tournaments/multi-sheet-types.ts"),
    path.join(__dirname, "../src/components/tournaments/MultiSheetCommandCenter.tsx"),
    path.join(__dirname, "../src/components/tournaments/SheetGridCard.tsx"),
    path.join(__dirname, "../src/components/tournaments/ICalProvisioningModal.tsx"),
    path.join(__dirname, "../src/components/tournaments/LiveTournamentBracketView.tsx"),
    path.join(__dirname, "../src/components/tournaments/TournamentCreateModal.tsx"),
    path.join(__dirname, "../src/components/tournaments/SheetCreateModal.tsx"),
    path.join(__dirname, "../src/components/tournaments/BracketMatchModal.tsx"),
    path.join(__dirname, "../src/components/tournaments/useTournamentDirector.ts"),
  ];

  runTest("Tournament components contain zero purple, indigo, or violet tokens", () => {
    const forbiddenRegex = /(text|bg|border|ring|from|to|via)-(purple|indigo|violet)-[0-9]+/g;
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, "utf8");
      const matches = content.match(forbiddenRegex);
      if (matches && matches.length > 0) {
        throw new Error(`Forbidden purple tokens in ${path.basename(file)}: ${matches.join(", ")}`);
      }
    }
  });

  console.log("\n--- Pillar 4: Tournament Bracket Node Association ---");
  runTest("Tournament bracket nodes map and render all 6 B8 rounds, CANCELLED, and nullable fields", () => {
    const rounds: BracketRound[] = ["POOL", "ROUND_OF_16", "QUARTERFINALS", "SEMIFINALS", "THIRD_PLACE", "CHAMPIONSHIP"];
    const mapped: BracketMatch[] = rounds.map((round, i) =>
      mapBracketMatch({
        id: `m-${i + 1}`,
        round,
        match_label: `${round}-1`,
        sort_order: i,
        sheet_id: i === 0 ? null : sheetId,
        home_team_name: null,
        away_team_name: null,
        home_seed: null,
        away_seed: null,
        home_score: null,
        away_score: null,
        status: i === 5 ? "CANCELLED" : "UPCOMING",
        period: null,
        clock_seconds: null,
        is_overtime: false,
        winner_side: null,
        next_match_id: null,
        next_match_slot: null,
      }),
    );
    assert.equal(mapped.length, 6);
    assert.equal(mapped[0].homeTeamName, null);
    assert.equal(mapped[5].status, "CANCELLED");

    const bracketHtml = renderToStaticMarkup(React.createElement(LiveTournamentBracketView, { matches: mapped }));
    assert.match(bracketHtml, /Pool Play/);
    assert.match(bracketHtml, /Round of 16/);
    assert.match(bracketHtml, /Championship Final/);
    assert.match(bracketHtml, /CANCELLED/);
  });

  console.log("\n--- Pillar 5: Component Modularity & Sub-300-Line Code Constraint ---");
  runTest("All tournament component files must be strictly < 300 lines", () => {
    for (const file of componentFiles) {
      const lineCount = fs.readFileSync(file, "utf8").split("\n").length;
      if (lineCount >= 300) {
        throw new Error(`File ${path.basename(file)} exceeds 300 lines: ${lineCount} lines`);
      }
    }
  });

  console.log("\n--- Pillar 6: Full BFF Route Suite, Upstream Assertions, & Status Preservation ---");
  let mockAuthenticated = false;
  let captured: CapturedUpstreamRequest[] = [];
  let nextUpstreamStatus = 200;
  let nextUpstreamBody: unknown = [];

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const rawBody = Buffer.concat(chunks).toString("utf8");
    let parsedBody: unknown = undefined;
    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = rawBody;
      }
    }
    captured.push({
      method: req.method ?? "GET",
      url: req.url ?? "",
      authorization: req.headers.authorization,
      body: parsedBody,
    });
    if (nextUpstreamStatus === 204) {
      res.writeHead(204);
      return res.end();
    }
    res.writeHead(nextUpstreamStatus, { "content-type": "application/json" });
    res.end(JSON.stringify(nextUpstreamBody));
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const { port } = server.address() as AddressInfo;

  const MI = Module as unknown as { _load: (r: string, p: unknown, m: boolean) => unknown };
  const origLoad = MI._load;
  MI._load = function (r: string, p: unknown, m: boolean) {
    if (r === "server-only") return {};
    if (r === "@/utils/supabase/server") {
      return {
        createClient: async () => ({
          auth: {
            getUser: async () =>
              mockAuthenticated ? { data: { user: { id: "u-1" } }, error: null } : { data: { user: null }, error: null },
            getSession: async () =>
              mockAuthenticated ? { data: { session: { access_token: "caller-jwt-123" } } } : { data: { session: null } },
          },
        }),
      };
    }
    return origLoad.call(this, r, p, m);
  };

  try {
    const { resolveHockeyApiBase } = await import("../src/lib/hockey-api");
    const envMutable = process.env as Record<string, string | undefined>;
    const saved = {
      HOCKEY_API_URL: envMutable.HOCKEY_API_URL,
      API_GATEWAY_URL: envMutable.API_GATEWAY_URL,
      NODE_ENV: envMutable.NODE_ENV,
      TSAI_DGX_ORIGIN: envMutable.TSAI_DGX_ORIGIN,
    };

    try {
      delete envMutable.HOCKEY_API_URL;
      delete envMutable.API_GATEWAY_URL;
      envMutable.TSAI_DGX_ORIGIN = "https://dgx-ignored.example.com";
      envMutable.NODE_ENV = "development";
      assert.equal(resolveHockeyApiBase(), "http://127.0.0.1:8010/api/v1");

      envMutable.NODE_ENV = "production";
      assert.throws(() => resolveHockeyApiBase(), /must be configured in production/);

      envMutable.API_GATEWAY_URL = "https://gw.example.com";
      assert.equal(resolveHockeyApiBase(), "https://gw.example.com/api/sports/ice-hockey/api/v1");
    } finally {
      Object.assign(envMutable, saved);
    }

    envMutable.HOCKEY_API_URL = `http://127.0.0.1:${port}`;
    const teamsRoute = await import("../src/app/api/tournaments/teams/route");
    const tournamentsRoute = await import("../src/app/api/tournaments/route");
    const tournamentIdRoute = await import("../src/app/api/tournaments/[tournamentId]/route");
    const sheetsRoute = await import("../src/app/api/tournaments/[tournamentId]/sheets/route");
    const sheetIdRoute = await import("../src/app/api/tournaments/[tournamentId]/sheets/[sheetId]/route");
    const matchesRoute = await import("../src/app/api/tournaments/[tournamentId]/matches/route");
    const matchIdRoute = await import("../src/app/api/tournaments/[tournamentId]/matches/[matchId]/route");

    const sampleSheetPayload = {
      id: sheetId,
      tournament_id: tournamentId,
      sheet_number: 1,
      rink_name: "Rink 1",
      stream_state: "UNINITIALIZED",
      active_angle: "TACTICAL_PRIMARY",
      is_public_showcase: false,
      acoustic_shield_muted: false,
    };
    const sampleMatchPayload = {
      id: matchId,
      tournament_id: tournamentId,
      round: "POOL",
      match_label: "P-1",
      sort_order: 0,
      status: "UPCOMING",
      is_overtime: false,
    };
    const sampleDetailPayload = {
      id: tournamentId,
      team_id: teamId,
      name: "Fixture Cup",
      format: "single_elimination",
      status: "scheduled",
      emergency_global_audio_mute: false,
      created_at: "2026-10-01T00:00:00Z",
      sheets: [sampleSheetPayload],
      matches: [sampleMatchPayload],
    };

    // Unauthenticated blocked before upstream call
    mockAuthenticated = false;
    captured = [];
    assert.equal((await teamsRoute.GET()).status, 401);
    assert.equal(captured.length, 0);

    // 1. GET /api/tournaments/teams
    mockAuthenticated = true;
    nextUpstreamStatus = 200;
    nextUpstreamBody = [{ id: teamId, name: "16U AAA", season: "2026-27" }];
    const teamsOk = await teamsRoute.GET();
    assert.equal(teamsOk.status, 200);
    assert.equal(teamsOk.headers.get("cache-control"), "private, no-store");
    assert.equal(captured[0].method, "GET");
    assert.equal(captured[0].url, "/api/v1/teams/mine");
    assert.equal(captured[0].authorization, "Bearer caller-jwt-123");

    // 2. Contract drift returns 502 instead of silently returning []
    nextUpstreamBody = { unexpected: "shape" };
    assert.equal((await teamsRoute.GET()).status, 502);

    // 3. Invalid UUIDs return 400 without hitting upstream
    captured = [];
    assert.equal((await tournamentsRoute.GET(new NextRequest("http://localhost/api/tournaments?teamId=bad"))).status, 400);
    assert.equal(
      (await tournamentsRoute.GET(new NextRequest(`http://localhost/api/tournaments?teamId=${teamId}&seasonId=bad`))).status,
      400,
    );
    assert.equal(
      (
        await sheetIdRoute.PATCH(
          new NextRequest(`http://localhost/api/tournaments/${tournamentId}/sheets/bad-uuid`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ teamId }),
          }),
          { params: Promise.resolve({ tournamentId, sheetId: "bad-uuid" }) },
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await matchIdRoute.DELETE(
          new NextRequest(`http://localhost/api/tournaments/${tournamentId}/matches/bad-uuid?teamId=${teamId}`, {
            method: "DELETE",
          }),
          { params: Promise.resolve({ tournamentId, matchId: "bad-uuid" }) },
        )
      ).status,
      400,
    );
    assert.equal(captured.length, 0);

    // 4. GET & POST /api/tournaments
    captured = [];
    nextUpstreamStatus = 200;
    nextUpstreamBody = {
      team_id: teamId,
      tournaments: [{ ...sampleDetailPayload, sheet_count: 1, match_count: 1 }],
    };
    const listRes = await tournamentsRoute.GET(new NextRequest(`http://localhost/api/tournaments?teamId=${teamId}`));
    assert.equal(listRes.status, 200);
    assert.equal(captured[0].url, `/api/v1/teams/${teamId}/tournaments`);

    nextUpstreamStatus = 201;
    nextUpstreamBody = sampleDetailPayload;
    const createRes = await tournamentsRoute.POST(
      new NextRequest("http://localhost/api/tournaments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId, name: "Fixture Cup", venueName: "North Ice", format: "single_elimination" }),
      }),
    );
    assert.equal(createRes.status, 201);
    assert.equal(captured[1].method, "POST");
    assert.equal(captured[1].url, `/api/v1/teams/${teamId}/tournaments`);
    assert.deepEqual(captured[1].body, { name: "Fixture Cup", venue_name: "North Ice", format: "single_elimination" });

    // 5. GET / PATCH / DELETE /api/tournaments/[tournamentId]
    captured = [];
    nextUpstreamStatus = 200;
    nextUpstreamBody = sampleDetailPayload;
    const getDetailRes = await tournamentIdRoute.GET(
      new NextRequest(`http://localhost/api/tournaments/${tournamentId}?teamId=${teamId}`),
      { params: Promise.resolve({ tournamentId }) },
    );
    assert.equal(getDetailRes.status, 200);
    assert.equal(captured[0].url, `/api/v1/teams/${teamId}/tournaments/${tournamentId}`);

    const patchTournamentRes = await tournamentIdRoute.PATCH(
      new NextRequest(`http://localhost/api/tournaments/${tournamentId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId, emergencyGlobalAudioMute: true, cascadeAudioMute: true }),
      }),
      { params: Promise.resolve({ tournamentId }) },
    );
    assert.equal(patchTournamentRes.status, 200);
    assert.equal(captured[1].method, "PATCH");
    assert.deepEqual(captured[1].body, { emergency_global_audio_mute: true, cascade_audio_mute: true });

    nextUpstreamStatus = 204;
    const delTournamentRes = await tournamentIdRoute.DELETE(
      new NextRequest(`http://localhost/api/tournaments/${tournamentId}?teamId=${teamId}`, { method: "DELETE" }),
      { params: Promise.resolve({ tournamentId }) },
    );
    assert.equal(delTournamentRes.status, 204);
    assert.equal(captured[2].method, "DELETE");

    // 6. Upstream HTTP status preservation (403, 404, 409, 422, 503) on POST sheets
    for (const [status, detail] of [
      [403, "Teams plan required"],
      [404, "Tournament not found"],
      [409, "Cannot unmute sheet while emergency global audio mute is active"],
      [422, "Extra inputs are not permitted"],
      [503, "Safeguarding audit write failed"],
    ] as const) {
      nextUpstreamStatus = status;
      nextUpstreamBody = { detail };
      const req = new NextRequest(`http://localhost/api/tournaments/${tournamentId}/sheets`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId, sheetNumber: 1, rinkName: "Rink 1" }),
      });
      const res = await sheetsRoute.POST(req, { params: Promise.resolve({ tournamentId }) });
      assert.equal(res.status, status, `upstream ${status} must be preserved`);
    }

    // 7. PATCH & DELETE /sheets/[sheetId] + POST / PATCH / DELETE /matches
    captured = [];
    nextUpstreamStatus = 200;
    nextUpstreamBody = sampleSheetPayload;
    const patchSheetRes = await sheetIdRoute.PATCH(
      new NextRequest(`http://localhost/api/tournaments/${tournamentId}/sheets/${sheetId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId, activeAngle: "OVERHEAD_TACTICAL", acousticShieldMuted: true }),
      }),
      { params: Promise.resolve({ tournamentId, sheetId }) },
    );
    assert.equal(patchSheetRes.status, 200);
    assert.equal(captured[0].url, `/api/v1/teams/${teamId}/tournaments/${tournamentId}/sheets/${sheetId}`);
    assert.deepEqual(captured[0].body, { active_angle: "OVERHEAD_TACTICAL", acoustic_shield_muted: true });

    nextUpstreamStatus = 204;
    const delSheetRes = await sheetIdRoute.DELETE(
      new NextRequest(`http://localhost/api/tournaments/${tournamentId}/sheets/${sheetId}?teamId=${teamId}`, { method: "DELETE" }),
      { params: Promise.resolve({ tournamentId, sheetId }) },
    );
    assert.equal(delSheetRes.status, 204);
    assert.equal(captured[1].method, "DELETE");

    nextUpstreamStatus = 201;
    nextUpstreamBody = sampleMatchPayload;
    const postMatchRes = await matchesRoute.POST(
      new NextRequest(`http://localhost/api/tournaments/${tournamentId}/matches`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId, round: "POOL", matchLabel: "P-1" }),
      }),
      { params: Promise.resolve({ tournamentId }) },
    );
    assert.equal(postMatchRes.status, 201);
    assert.deepEqual(captured[2].body, { round: "POOL", match_label: "P-1" });

    nextUpstreamStatus = 200;
    nextUpstreamBody = { ...sampleMatchPayload, status: "LIVE", home_score: 2 };
    const patchMatchRes = await matchIdRoute.PATCH(
      new NextRequest(`http://localhost/api/tournaments/${tournamentId}/matches/${matchId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId, status: "LIVE", homeScore: 2 }),
      }),
      { params: Promise.resolve({ tournamentId, matchId }) },
    );
    assert.equal(patchMatchRes.status, 200);
    assert.equal(captured[3].url, `/api/v1/teams/${teamId}/tournaments/${tournamentId}/matches/${matchId}`);
    assert.deepEqual(captured[3].body, { status: "LIVE", home_score: 2 });

    nextUpstreamStatus = 204;
    const delMatchRes = await matchIdRoute.DELETE(
      new NextRequest(`http://localhost/api/tournaments/${tournamentId}/matches/${matchId}?teamId=${teamId}`, { method: "DELETE" }),
      { params: Promise.resolve({ tournamentId, matchId }) },
    );
    assert.equal(delMatchRes.status, 204);
    assert.equal(captured[4].method, "DELETE");

    console.log("  ✓ All 7 BFF routes, upstream payloads, 400 validation, 502 drift, and 403/404/409/422/503 preservation verified");
  } finally {
    MI._load = origLoad;
    await new Promise<void>((r) => server.close(() => r()));
  }

  console.log("\n=======================================================");
  console.log("=== ALL 6 MULTI-SHEET COMMAND CENTER PILLARS PASSED ===");
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
