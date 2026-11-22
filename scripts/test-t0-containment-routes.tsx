/**
 * GA-030 T0.4 / Wave 5 portal verification — remaining containment & retired/rebuilt surfaces
 * (O-01 rebuilt, O-02/O-03 retired under OD-17, O-08, O-09, O-10).
 *
 * Rendered with react-dom/server, so this checks what a visitor actually receives, not only source.
 * It FAILS if any built-in club, score, clock, stream key, payout, calibration reading, retired
 * telemetry widget, or random counter comes back, or if the owner-only real-name list cannot be loaded.
 *
 * Run: npx tsx scripts/test-t0-containment-routes.tsx
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NameMatcher, loadRealNameList } from "./lib/real-names";

import ClubRevSharePage from "../src/app/club-revshare/page";
import TournamentDirectorPage from "../src/app/tournament/director/page";
import BYODSetupPage from "../src/app/byod-setup/page";
import { ICalProvisioningModal } from "../src/components/tournaments/ICalProvisioningModal";
import { LiveTournamentBracketView } from "../src/components/tournaments/LiveTournamentBracketView";
import { TranscendEngineSubstrate } from "../src/components/landing/TranscendEngineSubstrate";
import { ClubRevenueShareConsole } from "../src/components/commercial/ClubRevenueShareConsole";
import { ClubStripeConnectOnboarding } from "../src/components/commercial/ClubStripeConnectOnboarding";
import { ArenaEdgeKioskFleetDashboard } from "../src/components/kiosk/ArenaEdgeKioskFleetDashboard";
import { TournamentTiebreakerArbiter } from "../src/components/tournaments/TournamentTiebreakerArbiter";
import { TournamentWarRoomWorkbench } from "../src/components/review/TournamentWarRoomWorkbench";
import { LiveBracketHighlightSlicer } from "../src/components/tournaments/LiveBracketHighlightSlicer";
import { PublicTournamentEmbedWidget } from "../src/components/tournaments/PublicTournamentEmbedWidget";
import { MultiSheetCloudSwitcher } from "../src/components/broadcast/MultiSheetCloudSwitcher";
import { StreamHealthFailoverMonitor } from "../src/components/broadcast/StreamHealthFailoverMonitor";
import { CrossRinkAcousticShieldWorkbench } from "../src/components/broadcast/CrossRinkAcousticShieldWorkbench";
import { ArenaRigPairingWizard } from "../src/components/onboarding/ArenaRigPairingWizard";
import { CrossbarElevationTriangulationCanvas } from "../src/components/review/CrossbarElevationTriangulationCanvas";
import { GoalLineOrthogonalReviewCanvas } from "../src/components/review/GoalLineOrthogonalReviewCanvas";
import { GoalieRVHJointLoadReviewCanvas } from "../src/components/review/GoalieRVHJointLoadReviewCanvas";
import { VoronoiPassingLaneWorkbench } from "../src/components/tactics/VoronoiPassingLaneWorkbench";
import { LiveBroadcastStreamPlayer } from "../src/components/broadcast/LiveBroadcastStreamPlayer";
import { ArenaScoreboardBanner } from "../src/components/broadcast/ArenaScoreboardBanner";
import { PowerplayUmbrellaCanvas } from "../src/components/tactics/PowerplayUmbrellaCanvas";
import { IceFrictionChatterWorkbench } from "../src/components/analytics/IceFrictionChatterWorkbench";
import { BenchDoorSubstitutionWorkbench } from "../src/components/bench/BenchDoorSubstitutionWorkbench";
import { PenaltyBoxMagneticGateWorkbench } from "../src/components/penalty/PenaltyBoxMagneticGateWorkbench";
import { BenchReplayWhistleSyncWorkbench } from "../src/components/replay/BenchReplayWhistleSyncWorkbench";
import { NetPocketStrainDissipationWorkbench } from "../src/components/broadcast/NetPocketStrainDissipationWorkbench";
import { MultiRinkBroadcastDirectorWorkbench } from "../src/components/broadcast/MultiRinkBroadcastDirectorWorkbench";
import { MultiSheetCommandCenter } from "../src/components/tournaments/MultiSheetCommandCenter";

const ROOT = process.cwd();
let passed = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}\n    ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}
const render = (el: React.ReactElement) => renderToStaticMarkup(el);
const src = (p: string) => readFileSync(join(ROOT, p), "utf8");
/** Source with comments removed, so a containment note that quotes the old claim does not count. */
const code = (p: string) => src(p).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

const listVerdict = loadRealNameList();
if (listVerdict.verdict !== "ok") {
  console.error(`test-t0-containment: FAILED — real-name check cannot run: ${listVerdict.reason}`);
  process.exit(1);
}
const matcher = new NameMatcher(listVerdict.data);
const realNameHits = (text: string) => matcher.hits(text).length;
function textOfTestId(html: string, id: string): string {
  const start = html.indexOf(`data-testid="${id}"`);
  assert.ok(start >= 0, `marker ${id} missing`);
  const open = html.lastIndexOf("<", start);
  const tag = html.slice(open + 1).match(/^[a-z0-9]+/)![0];
  let depth = 0;
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g");
  re.lastIndex = open;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(open, m.index + m[0].length).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  throw new Error(`unterminated ${id}`);
}

console.log("\n=== Portal containment & Wave 5 cleanup verification ===\n");

console.log("O-08 / O-06 /club-revshare");
check("partner block says not yet available and names no club", () => {
  const html = render(<ClubRevSharePage />);
  assert.match(html, /data-testid="club-partner-unavailable"/);
  assert.match(html, /Club partner payouts: not yet available/);
  assert.doesNotMatch(html, /acct_/, "no invented Stripe Connect account");
  assert.doesNotMatch(html, /Next Payout|Active Direct Deposit|Stripe Connect Account/i, "no invented payout schedule");
  assert.doesNotMatch(html, /Direct deposit to team bank account/i);
  assert.equal(
    textOfTestId(html, "club-partner-unavailable"),
    "Club partner payouts: not yet available No club is connected and no payouts are made today. The figures above are a calculator, not account data.",
    "the partner block names no partner",
  );
  assert.equal(realNameHits(html), 0, "no listed real name on /club-revshare");
});

console.log("O-01 /tournament/director (live B8 wiring)");
check("director shell renders no fake sheets, stream keys, or unavailable markers", () => {
  const html = render(<TournamentDirectorPage />);
  assert.doesNotMatch(html, /tournament-director-unavailable|tournament-bracket-unavailable|ical-provisioning-unavailable/);
  assert.doesNotMatch(html, /live_tsai|rtmps:\/\/|youtube\.com\/watch/i, "no invented stream key or URL");
  assert.doesNotMatch(html, /LIVE P\d|WATCH (LIVE|YOUTUBE)/, "no invented live state");
  assert.doesNotMatch(html, /\b\d+ - \d+\b/, "no invented score");
  assert.match(html, /Tournament Director/);
  assert.equal(realNameHits(html), 0, "no listed real name on /tournament/director");
});
check("a sheet without telemetry renders pending state and omits stream keys, RTMPS, and xG", () => {
  const sheet = {
    sheetId: "fixture-sheet",
    sheetNumber: 1,
    rinkName: "Fixture Rink",
    streamState: "UNINITIALIZED" as const,
    youtubeBroadcastId: null,
    playbackUrl: null,
    bitrateKbps: null,
    fps: null,
    activeAngle: "TACTICAL_PRIMARY" as const,
    isPublicShowcase: false,
    matchInfo: {
      matchId: "m",
      homeTeam: null,
      awayTeam: null,
      period: null,
      gameClockSeconds: null,
      scoreHome: null,
      scoreAway: null,
      isOvertime: false,
    },
    hardwareHealth: null,
    acousticShieldMuted: false,
  };
  const html = render(<MultiSheetCommandCenter sheets={[sheet]} />);
  assert.match(html, /Telemetry pending/);
  assert.match(html, /Hardware telemetry not connected/);
  assert.doesNotMatch(html, /xG|RTMPS:/i);
  assert.doesNotMatch(code("src/components/tournaments/MultiSheetCommandCenter.tsx"), /youtubeStreamKey|rtmpsIngestUrl|\?\? 1\.5/);
  assert.doesNotMatch(code("src/components/tournaments/SheetGridCard.tsx"), /homeXg|awayXg|whistleDuckingActive|recentWhistleTimestamp/);
  assert.doesNotMatch(code("src/components/tournaments/multi-sheet-types.ts"), /youtubeStreamKey|rtmpsIngestUrl|homeXg|awayXg|whistleDuckingActive|recentWhistleTimestamp/);
});
check("director page and BFF routes use live /api/tournaments* without built-in sheets or service-role bypass", () => {
  const s = code("src/app/tournament/director/page.tsx");
  assert.doesNotMatch(s, /INITIAL_SHEETS|youtubeStreamKey|rtmps/);
  assert.doesNotMatch(code("src/components/tournaments/LiveTournamentBracketView.tsx"), /DEFAULT_MATCHES|homeTeam: \{ name: "/);
  const hockeyApi = code("src/lib/hockey-api.ts");
  assert.match(hockeyApi, /HOCKEY_API_URL/);
  assert.match(hockeyApi, /API_GATEWAY_URL/);
  assert.doesNotMatch(hockeyApi, /TSAI_DGX_ORIGIN/);
  assert.doesNotMatch(hockeyApi, /SUPABASE_SERVICE_ROLE_KEY/);
  for (const routeFile of [
    "src/app/api/tournaments/teams/route.ts",
    "src/app/api/tournaments/route.ts",
    "src/app/api/tournaments/[tournamentId]/route.ts",
    "src/app/api/tournaments/[tournamentId]/sheets/route.ts",
    "src/app/api/tournaments/[tournamentId]/sheets/[sheetId]/route.ts",
    "src/app/api/tournaments/[tournamentId]/matches/route.ts",
    "src/app/api/tournaments/[tournamentId]/matches/[matchId]/route.ts",
  ]) {
    const r = code(routeFile);
    assert.match(r, /auth\.getUser\(\)/, `${routeFile} must verify supabase.auth.getUser()`);
    assert.doesNotMatch(r, /SUPABASE_SERVICE_ROLE_KEY/, `${routeFile} must never use service-role key`);
  }
});
check("bracket view supports all 6 B8 rounds, CANCELLED, and nullable fields without unavailable markers", () => {
  const matches = (["POOL", "ROUND_OF_16", "QUARTERFINALS", "SEMIFINALS", "THIRD_PLACE", "CHAMPIONSHIP"] as const).map(
    (round, i) => ({
      matchId: `m-${i}`,
      round,
      matchLabel: `M-${i + 1}`,
      sortOrder: i,
      sheetId: null,
      homeTeamName: null,
      awayTeamName: null,
      homeSeed: null,
      awaySeed: null,
      homeScore: null,
      awayScore: null,
      status: i === 5 ? ("CANCELLED" as const) : ("UPCOMING" as const),
      period: null,
      clockSeconds: null,
      isOvertime: false,
      winnerSide: null,
      nextMatchId: null,
      nextMatchSlot: null,
      startsAt: null,
    }),
  );
  const html = render(<LiveTournamentBracketView matches={matches} />);
  assert.doesNotMatch(html, /tournament-bracket-unavailable/);
  assert.match(html, /Pool Play/);
  assert.match(html, /Round of 16/);
  assert.match(html, /Quarterfinals/);
  assert.match(html, /Semifinals/);
  assert.match(html, /Third Place/);
  assert.match(html, /Championship Final/);
  assert.match(html, /CANCELLED/);
  assert.match(html, /TBD/);
});
check("iCal modal applies to BFF without sample calendar, stream keys, or unavailable marker", () => {
  const html = render(<ICalProvisioningModal isOpen onClose={() => {}} />);
  assert.doesNotMatch(html, /data-testid="ical-provisioning-unavailable"/);
  assert.doesNotMatch(html, /Load .*Sample/i);
  assert.doesNotMatch(src("src/lib/tournament/ical-tournament-provisioner.ts"), /generateSampleTournamentICal|live_tsai_|rtmps:\/\/a\.rtmps|youtubeStreamKey|rtmpsIngestUrl/);
  assert.match(code("src/components/tournaments/ICalProvisioningModal.tsx"), /createTournamentSheet/);
});

console.log("O-09 /byod-setup");
check("wizard claims no pairing or calibration", () => {
  const html = render(<BYODSetupPage />);
  assert.ok(html.includes("Device check: not yet available"), "step 1 says the device check is not yet available");
  assert.ok(html.includes("Optical sensor check:"), "step 1 sensor check is present");
  assert.equal(realNameHits(html), 0);
  assert.doesNotMatch(html, /A18 Pro \/ M4 Ready|acceleration verified/);
  const s = code("src/components/vision/BYODSetupWizard.tsx");
  for (const claim of [
    "BenchHub iPad Paired",
    "fully calibrated",
    "LOCKED",
    "(Passed)",
    "NOMINAL",
    "CONNECTED (",
    "28.4 dB",
    "99.4% Precision",
    "Zero YouTube Strikes",
    "Online &amp; Armed",
    "live_yt_",
  ]) {
    assert.ok(!s.includes(claim), `BYODSetupWizard must not claim "${claim}"`);
  }
  assert.match(s, /Nothing was paired, measured or calibrated/);
  assert.ok((s.match(/data-testid="byod-not-measured"/g) ?? []).length >= 10, "each reading is marked not yet available");
});

console.log("O-02 retired RinkTelemetryChart (OD-17)");
check("RinkTelemetryChart.tsx is deleted and unimported across landing & technology-solutions", () => {
  assert.equal(existsSync(join(ROOT, "src/data/players-telemetry.ts")), false, "built-in player list must stay deleted");
  assert.equal(existsSync(join(ROOT, "src/components/landing/RinkTelemetryChart.tsx")), false, "RinkTelemetryChart must be deleted");
  assert.doesNotMatch(src("src/components/landing/DesktopLanding.tsx"), /RinkTelemetryChart/);
  assert.doesNotMatch(src("src/app/technology-solutions/page.tsx"), /RinkTelemetryChart/);
});

console.log("O-03 retired telemetry badges on TranscendEngineSubstrate (OD-17)");
check("no retired telemetry badges, fake counters, or live status claims", () => {
  const html = render(<TranscendEngineSubstrate />);
  assert.doesNotMatch(html, /data-testid="engine-throughput-unavailable"/);
  assert.doesNotMatch(html, /data-testid="platform-status-unavailable"/);
  assert.doesNotMatch(html, /Live sync: not yet available/);
  assert.doesNotMatch(html, /events\/sec/);
  assert.doesNotMatch(html, /\bONLINE\b|SYNC OK|Sync: Realtime/, "no live-status claim");
  assert.doesNotMatch(code("src/components/landing/TranscendEngineSubstrate.tsx"), /Math\.random|setInterval|pulseCount/);
});

console.log("O-10 unmounted tournament and club components");
const EMPTY: Array<[string, React.ReactElement]> = [
  ["ClubRevenueShareConsole", <ClubRevenueShareConsole key="a" />],
  ["ClubStripeConnectOnboarding", <ClubStripeConnectOnboarding key="b" />],
  ["ArenaEdgeKioskFleetDashboard", <ArenaEdgeKioskFleetDashboard key="c" />],
  ["TournamentTiebreakerArbiter", <TournamentTiebreakerArbiter key="d" />],
  ["TournamentWarRoomWorkbench", <TournamentWarRoomWorkbench key="e" />],
  ["LiveBracketHighlightSlicer", <LiveBracketHighlightSlicer key="f" />],
  ["PublicTournamentEmbedWidget", <PublicTournamentEmbedWidget key="g" />],
  ["MultiSheetCloudSwitcher", <MultiSheetCloudSwitcher key="h" />],
  ["StreamHealthFailoverMonitor", <StreamHealthFailoverMonitor key="i" />],
  ["CrossRinkAcousticShieldWorkbench", <CrossRinkAcousticShieldWorkbench key="j" />],
  ["ArenaRigPairingWizard", <ArenaRigPairingWizard key="k" />],
  ["CrossbarElevationTriangulationCanvas", <CrossbarElevationTriangulationCanvas key="l" />],
  ["GoalLineOrthogonalReviewCanvas", <GoalLineOrthogonalReviewCanvas key="m" />],
  ["GoalieRVHJointLoadReviewCanvas", <GoalieRVHJointLoadReviewCanvas key="n" />],
  ["VoronoiPassingLaneWorkbench", <VoronoiPassingLaneWorkbench key="o" />],
  ["LiveBroadcastStreamPlayer", <LiveBroadcastStreamPlayer key="p" />],
  ["ArenaScoreboardBanner", <ArenaScoreboardBanner key="q" />],
  ["PowerplayUmbrellaCanvas", <PowerplayUmbrellaCanvas key="r" />],
  ["IceFrictionChatterWorkbench", <IceFrictionChatterWorkbench key="s" />],
  ["BenchDoorSubstitutionWorkbench", <BenchDoorSubstitutionWorkbench key="t" />],
  ["PenaltyBoxMagneticGateWorkbench", <PenaltyBoxMagneticGateWorkbench key="u" />],
  ["BenchReplayWhistleSyncWorkbench", <BenchReplayWhistleSyncWorkbench key="v" />],
  ["NetPocketStrainDissipationWorkbench", <NetPocketStrainDissipationWorkbench key="w" />],
  ["MultiRinkBroadcastDirectorWorkbench", <MultiRinkBroadcastDirectorWorkbench key="x" />],
];
for (const [name, el] of EMPTY) {
  check(`${name} with no data renders only "not yet available"`, () => {
    const html = render(el);
    assert.match(html, /data-testid="not-yet-available"/);
    const text = html.replace(/<[^>]*>/g, " ");
    assert.doesNotMatch(text, /\d/, "the empty state carries no number");
  });
}
check("no component invents data when its data prop is missing", () => {
  const offenders: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(join(ROOT, d), { withFileTypes: true })) {
      const rel = join(d, e.name);
      if (e.isDirectory()) walk(rel);
      else if (/\.tsx?$/.test(e.name)) {
        const t = code(rel);
        if (/function generate(Default|Sample|Mock|Fake|Demo)\w*\(/.test(t)) offenders.push(`${rel}: generator`);
        if (/\binitial(State|Data)\s*(\|\||\?\?)\s*\{/.test(t) || /^\s+initial(State|Data|Sequence)\s*=\s*\{/m.test(t)) offenders.push(`${rel}: fallback literal`);
        if (/^\s+activeSequence\s*=\s*\{/m.test(t)) offenders.push(`${rel}: fallback literal`);
      }
    }
  };
  walk("src/components");
  assert.deepEqual(offenders, [], offenders.join("\n"));
});
check("no built-in data constants remain in the component and type trees", () => {
  const dirs = ["src/components", "src/types", "src/app", "src/lib/tournament"];
  const offenders: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(join(ROOT, d), { withFileTypes: true })) {
      const rel = join(d, e.name);
      if (e.isDirectory()) walk(rel);
      else if (/\.(ts|tsx)$/.test(e.name)) {
        const text = src(rel);
        const m = text.match(/^(export\s+)?const\s+(DEFAULT|INITIAL|SAMPLE)_(?!FAILOVER_THRESHOLDS\b)[A-Z0-9_]+\b/gm);
        if (m) offenders.push(`${rel}: ${m.join(", ")}`);
      }
    }
  };
  for (const d of dirs) walk(d);
  // Any exception must be listed here with its register row, so a NEW constant fails the suite.
  const allowed: string[] = [];
  const unexpected = offenders.filter((o) => !allowed.some((a) => o.startsWith(a)));
  assert.deepEqual(unexpected, [], `built-in data constants found:\n${unexpected.join("\n")}`);
});

console.log("Real names (owner-only list)");
check("no listed real name in any rendered T0.4 surface", () => {
  for (const [name, el] of EMPTY) assert.equal(realNameHits(render(el)), 0, `${name}: listed real name rendered`);
  assert.equal(realNameHits(render(<TranscendEngineSubstrate />)), 0);
});

console.log(`\n=== Portal containment & Wave 5 checks: ${passed} checks passed ===\n`);
