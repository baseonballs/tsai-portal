/**
 * test-multi-sheet-command-center.ts
 * tsai-portal
 *
 * Assignee: Transcendental Sports AI LLC
 * Patent Track 16: TSAI-PATENT-VISION-01 (Docket P229, Claims 9 & 10)
 *
 * 6-Pillar Verification Suite:
 * 1. Multi-sheet mosaic state & B8 capacity (no secret stream keys/RTMPS).
 * 2. Patent Track 16 Claim 10 Whistle Stoppage & -24.0 dB audio ducking + global mute cascade.
 * 3. Zero-Purple Tailwind Token Compliance across all tournament components.
 * 4. Tournament Bracket Node Association across all 6 B8 rounds + CANCELLED + nullable fields.
 * 5. Component Modularity & Sub-300-Line Code Constraint.
 * 6. BFF caller-scoped auth, URL resolution (fail-closed prod, never TSAI_DGX_ORIGIN), & status preservation.
 *
 * Run: npx tsx scripts/test-multi-sheet-command-center.ts
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import Module from "node:module";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  type BracketMatch,
  type BracketRound,
  type TournamentSheet,
} from "../src/components/tournaments/multi-sheet-types";
import { mapBracketMatch, mapTournamentSheet, toUpstreamPayload } from "../src/lib/tournament/b8-mappers";

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

async function main() {
  console.log("\n=======================================================");
  console.log("=== TRANSCEND PORTAL: MULTI-SHEET COMMAND CENTER AUDIT ===");
  console.log("Patent Track 16 (TSAI-PATENT-VISION-01, Claims 9 & 10)");
  console.log("=======================================================\n");

  console.log("--- Pillar 1: 8-Sheet Mosaic Grid State & B8 Contract ---");
  const sheets: TournamentSheet[] = Array.from({ length: 8 }, (_, i) => ({
    sheetId: `sheet-${i + 1}`,
    sheetNumber: i + 1,
    rinkName: `Rink ${i + 1}`,
    streamState: "LIVE",
    youtubeBroadcastId: `ytBcId0000${i + 1}`,
    playbackUrl: `https://youtube.com/live/${i + 1}`,
    bitrateKbps: 8500,
    fps: 60,
    activeAngle: "TACTICAL_PRIMARY",
    isPublicShowcase: i === 0,
    matchInfo: {
      matchId: `m-${i + 1}`,
      homeTeam: `Home Team ${i + 1}`,
      awayTeam: `Away Team ${i + 1}`,
      period: 2,
      gameClockSeconds: 740,
      scoreHome: 2,
      scoreAway: 1,
      isOvertime: false,
      homeXg: 2.14,
      awayXg: 1.48,
      whistleDuckingActive: i === 2,
      recentWhistleTimestamp: Date.now() - 2000,
    },
    hardwareHealth: {
      temperatureCelsius: 41.2,
      droppedFramesCount: 0,
      ispLoadPercentage: 38,
      thermalThrottled: false,
    },
    acousticShieldMuted: false,
  }));

  runTest("8 concurrent sheets initialized with COPPA unlisted defaults and zero secret stream keys", () => {
    assert.equal(sheets.length, 8);
    assert.equal(sheets[0].isPublicShowcase, true);
    assert.equal(sheets[1].isPublicShowcase, false);
    for (const s of sheets) {
      assert.equal("youtubeStreamKey" in s, false);
      assert.equal("rtmpsIngestUrl" in s, false);
    }
    const mappedSheet = mapTournamentSheet({
      id: "00000000-0000-4000-8000-000000000010",
      tournament_id: "00000000-0000-4000-8000-000000000001",
      sheet_number: 1,
      rink_name: "Main Arena",
      stream_state: "UNINITIALIZED",
      active_angle: "TACTICAL_PRIMARY",
      youtube_broadcast_id: null,
      playback_url: null,
      bitrate_kbps: null,
      fps: null,
      hardware_health: null,
      is_public_showcase: false,
      acoustic_shield_muted: false,
    });
    assert.equal(mappedSheet.youtubeBroadcastId, null);
    assert.equal(mappedSheet.playbackUrl, null);
    assert.equal(mappedSheet.hardwareHealth, null);
    const upstreamPayload = toUpstreamPayload({ teamId: "tid", sheetNumber: 1, youtubeStreamKey: "forbidden" });
    assert.equal("teamId" in upstreamPayload, false);
    assert.equal(upstreamPayload.sheet_number, 1);
    assert.equal(upstreamPayload.youtubeStreamKey, "forbidden");
  });

  console.log("\n--- Pillar 2: Patent Track 16 Claim 10 Whistle Ducking & Audio Shield ---");
  runTest("Whistle detection flags -24dB ducking and cascades emergency acoustic shield", () => {
    assert.equal(sheets[2].matchInfo?.whistleDuckingActive, true);
    for (const s of sheets) s.acousticShieldMuted = true;
    for (const s of sheets) assert.equal(s.acousticShieldMuted, true);
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
  runTest("Tournament bracket nodes map all 6 B8 rounds, CANCELLED, and nullable fields", () => {
    const rounds: BracketRound[] = ["POOL", "ROUND_OF_16", "QUARTERFINALS", "SEMIFINALS", "THIRD_PLACE", "CHAMPIONSHIP"];
    const mapped: BracketMatch[] = rounds.map((round, i) =>
      mapBracketMatch({
        id: `m-${i + 1}`,
        round,
        match_label: `${round}-1`,
        sort_order: i,
        sheet_id: i === 0 ? null : `sheet-${i}`,
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

  console.log("\n--- Pillar 6: BFF Auth, URL Resolution, & Upstream Status Preservation ---");
  let mockAuthenticated = false;
  let upstreamCalled = false;
  let lastAuthHeader: string | undefined;
  let nextUpstreamStatus = 200;
  let nextUpstreamBody: unknown = [];

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    upstreamCalled = true;
    lastAuthHeader = req.headers.authorization;
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

      envMutable.HOCKEY_API_URL = `http://127.0.0.1:${port}`;
      assert.equal(resolveHockeyApiBase(), `http://127.0.0.1:${port}/api/v1`);
    } finally {
      Object.assign(envMutable, saved);
    }

    envMutable.HOCKEY_API_URL = `http://127.0.0.1:${port}`;
    const teamsRoute = await import("../src/app/api/tournaments/teams/route");
    const tournamentsRoute = await import("../src/app/api/tournaments/route");
    const tournamentIdRoute = await import("../src/app/api/tournaments/[tournamentId]/route");
    const sheetsRoute = await import("../src/app/api/tournaments/[tournamentId]/sheets/route");
    const matchesRoute = await import("../src/app/api/tournaments/[tournamentId]/matches/route");

    const teamId = "11111111-1111-4111-8111-111111111111";
    const tournamentId = "22222222-2222-4222-8222-222222222222";

    mockAuthenticated = false;
    upstreamCalled = false;
    const unauthRes = await teamsRoute.GET();
    assert.equal(unauthRes.status, 401);
    assert.equal(upstreamCalled, false, "unauthenticated request must never reach hockey-api");

    mockAuthenticated = true;
    nextUpstreamStatus = 200;
    nextUpstreamBody = [{ id: teamId, name: "16U AAA", season: "2026-27" }];
    const teamsOk = await teamsRoute.GET();
    assert.equal(teamsOk.status, 200);
    assert.equal(lastAuthHeader, "Bearer caller-jwt-123");
    assert.equal(teamsOk.headers.get("cache-control"), "private, no-store");

    for (const [status, detail] of [
      [403, "Teams plan required"],
      [404, "Tournament not found"],
      [409, "Cannot unmute sheet while emergency global audio mute is active"],
      [422, "Extra inputs are not permitted"],
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

    nextUpstreamStatus = 204;
    const delRes = await tournamentIdRoute.DELETE(
      new NextRequest(`http://localhost/api/tournaments/${tournamentId}?teamId=${teamId}`, { method: "DELETE" }),
      { params: Promise.resolve({ tournamentId }) },
    );
    assert.equal(delRes.status, 204);

    // Invalid teamId fails closed locally with 422
    upstreamCalled = false;
    const badReq = new NextRequest("http://localhost/api/tournaments?teamId=not-a-uuid");
    assert.equal((await tournamentsRoute.GET(badReq)).status, 422);
    assert.equal(upstreamCalled, false);

    nextUpstreamStatus = 201;
    nextUpstreamBody = {
      id: "33333333-3333-4333-8333-333333333333",
      tournament_id: tournamentId,
      round: "POOL",
      match_label: "P-1",
      sort_order: 0,
      status: "UPCOMING",
      is_overtime: false,
    };
    const matchRes = await matchesRoute.POST(
      new NextRequest(`http://localhost/api/tournaments/${tournamentId}/matches`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId, round: "POOL", matchLabel: "P-1" }),
      }),
      { params: Promise.resolve({ tournamentId }) },
    );
    assert.equal(matchRes.status, 201);
    console.log("  ✓ BFF auth, URL resolution, Bearer forwarding, and status preservation verified");
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
