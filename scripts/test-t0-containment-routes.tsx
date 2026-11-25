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

import TournamentDirectorPage from "../src/app/tournament/director/page";
import BYODSetupPage from "../src/app/byod-setup/page";
import { ByodCalibrationReadout } from "../src/components/vision/ByodCalibrationReadout";
import { ByodDeviceFleetPanel } from "../src/components/vision/ByodDeviceFleetPanel";
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

console.log("\n=== Portal containment & Wave 5 cleanup verification ===\n");

console.log("O-06 retired /club-revshare & ClubRevShareDashboard (OD-21)");
check("O-06 route, dashboard, calculators, and pricing rev-share claims are deleted", () => {
  for (const retiredPath of [
    "src/app/club-revshare/page.tsx",
    "src/components/billing/ClubRevShareDashboard.tsx",
    "src/lib/billing/club-rev-share.ts",
    "src/lib/commercial/club-revenue-calculator.ts",
  ]) {
    assert.equal(existsSync(join(ROOT, retiredPath)), false, `${retiredPath} must be deleted`);
  }
  const pricingCode = code("src/app/pricing/page.tsx");
  assert.doesNotMatch(pricingCode, /\/club-revshare|ClubRevShareDashboard/);
  assert.doesNotMatch(pricingCode, /Rev-Share|fundraising wallet|Net Revenue Share/i);
  assert.equal(realNameHits(src("src/app/pricing/page.tsx")), 0, "no listed real name on /pricing");
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

console.log("O-09 /byod-setup (live T6.3 wiring)");
check("SSR setup guide renders honest empty state, 4th encoder profile, and zero fake telemetry", () => {
  const html = render(<BYODSetupPage />);
  assert.doesNotMatch(html, /byod-pairing-unavailable/, "O-09 unavailable pin must be removed");
  assert.doesNotMatch(html, /\/club-revshare/, "dead /club-revshare CTA must be removed");
  assert.ok(html.includes("Custom RTMPS Hardware Encoder"), "4th hardware profile card must render");
  assert.ok(html.includes("Optical sensor check:"), "step 1 sensor check is present");
  assert.match(html, /data-testid="byod-not-measured"/, "unmeasured sensor defaults to byod-not-measured");
  assert.equal(realNameHits(html), 0);
  assert.doesNotMatch(html, /A18 Pro \/ M4 Ready|acceleration verified|Sub-180ms Latency/);
  for (const file of [
    "src/components/vision/BYODSetupWizard.tsx",
    "src/components/vision/ByodDeviceFleetPanel.tsx",
    "src/components/vision/ByodCalibrationReadout.tsx",
  ]) {
    const s = code(file);
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
      "/club-revshare",
    ]) {
      assert.ok(!s.includes(claim), `${file} must not contain "${claim}"`);
    }
  }
});
check("paired and manual BYOD states render measured values while keeping null fields unmeasured", () => {
  const deviceId = "55555555-5555-4555-8555-555555555555";
  const teamId = "66666666-6666-4666-8666-666666666666";
  const manualCal = {
    id: "77777777-7777-4777-8777-777777777777",
    deviceId,
    teamId,
    recordedBySubject: "user:coach-1",
    calibrationSource: "manual_check" as const,
    opticalTiltDeg: null,
    opticalHorizonLocked: null,
    mountVacuumKpa: 68.5,
    dieTempC: 31.4,
    powerDeliveryWatts: null,
    peltierState: null,
    acousticSnrDb: null,
    whistleFilterHzLow: 2800,
    whistleFilterHzHigh: 3800,
    notes: "Pre-skate rigging check",
    measuredAt: "2026-11-22T12:00:00Z",
  };
  const manualHtml = render(<ByodCalibrationReadout calibration={manualCal} />);
  assert.match(manualHtml, /Operator Check — Handshake Pending/);
  assert.match(manualHtml, /31\.4°C/);
  assert.match(manualHtml, /68\.5 kPa/);
  assert.match(manualHtml, /2800–3800 Hz/);
  assert.equal(
    (manualHtml.match(/data-testid="byod-not-measured"/g) ?? []).length,
    5,
    "all 5 null metrics stay marked byod-not-measured",
  );

  const pairedHtml = render(
    <ByodDeviceFleetPanel
      devices={[
        {
          id: deviceId,
          teamId,
          registeredByUserId: "coach-1",
          deviceLabel: "rink-north-pod-01",
          deviceModel: "custom-rtmps-encoder",
          glassType: "none",
          pairingStatus: "paired",
          effectiveStatus: "paired",
          pairingAttempts: 0,
          pairingCodeExpiresAt: null,
          rtmpsEgressConfigured: true,
          rtmpsKeyHintLast4: "A1B2",
          meshServiceName: "rink-north._tsai-mesh._tcp.local",
          pairedAt: "2026-11-22T12:01:00Z",
          lastSeenAt: "2026-11-22T12:05:00Z",
          revokedAt: null,
          createdAt: "2026-11-22T11:55:00Z",
          updatedAt: "2026-11-22T12:05:00Z",
          latestCalibration: {
            ...manualCal,
            calibrationSource: "device_telemetry",
            opticalTiltDeg: 0.25,
            opticalHorizonLocked: true,
            acousticSnrDb: 22.5,
          },
        },
      ]}
      total={1}
      selectedDeviceId={deviceId}
      calibrations={[]}
      calibrationsTotal={0}
      onSelectDevice={() => {}}
    />,
  );
  assert.match(pairedHtml, /Paired \(Hardware Handshake Verified\)/);
  assert.match(pairedHtml, /Device Telemetry/);
  assert.match(pairedHtml, /0\.25°/);
  assert.match(pairedHtml, /Horizon Locked/);
  assert.match(pairedHtml, /22\.5 dB/);
  assert.match(pairedHtml, /data-testid="byod-not-measured"/, "still-null power/peltier keep byod-not-measured");
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
