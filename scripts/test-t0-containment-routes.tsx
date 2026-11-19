/**
 * GA-030 T0.4 containment — Portal public false claims (rows O-01, O-02, O-03, O-08, O-09, O-10).
 *
 * Each surface STAYS and renders an honest "not yet available" marker instead of invented data.
 * Rendered with react-dom/server, so this checks what a visitor actually receives, not only source.
 * It FAILS if any built-in club, score, clock, stream key, payout, calibration reading or random
 * counter comes back, or if the owner-only real-name list cannot be loaded.
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
import { RinkTelemetryChart } from "../src/components/landing/RinkTelemetryChart";
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

// Real names come only from the OWNER-ONLY list (scripts/lib/real-names.ts, TSAI_REAL_NAME_LIST); this public
// repo never carries a name, a hash of one, or a pattern for one. If the list cannot be loaded the suite FAILS:
// a missing list must never turn into a silent pass.
const listVerdict = loadRealNameList();
if (listVerdict.verdict !== "ok") {
  console.error(`test-t0-containment: FAILED — real-name check cannot run: ${listVerdict.reason}`);
  process.exit(1);
}
const matcher = new NameMatcher(listVerdict.data);
const realNameHits = (text: string) => matcher.hits(text).length;
/** Visible text of the element carrying data-testid=`id` (static markup, no nested element of the same tag). */
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

console.log("\n=== T0.4 containment: Portal public false claims ===\n");

console.log("O-08 /club-revshare");
check("partner block says not yet available and names no club", () => {
  const html = render(<ClubRevSharePage />);
  assert.match(html, /data-testid="club-partner-unavailable"/);
  assert.match(html, /Club partner payouts: not yet available/);
  assert.doesNotMatch(html, /acct_/, "no invented Stripe Connect account");
  assert.doesNotMatch(html, /Next Payout|Active Direct Deposit|Stripe Connect Account/i, "no invented payout schedule");
  assert.doesNotMatch(html, /Direct deposit to team bank account/i);
  // Structural (needs no name): the partner block holds ONLY the not-yet-available marker — no partner of any name.
  assert.equal(
    textOfTestId(html, "club-partner-unavailable"),
    "Club partner payouts: not yet available No club is connected and no payouts are made today. The figures above are a calculator, not account data.",
    "the partner block names no partner",
  );
  assert.equal(realNameHits(html), 0, "no listed real name on /club-revshare");
});

console.log("O-01 /tournament/director");
check("sheets and bracket show not yet available; no invented stream, score or clock", () => {
  const html = render(<TournamentDirectorPage />);
  assert.match(html, /data-testid="tournament-director-unavailable"/);
  assert.match(html, /data-testid="tournament-bracket-unavailable"/);
  assert.doesNotMatch(html, /live_tsai|rtmps:\/\/|youtube\.com\/watch/i, "no invented stream key or URL");
  assert.doesNotMatch(html, /LIVE P\d|WATCH (LIVE|YOUTUBE)/, "no invented live state");
  assert.doesNotMatch(html, /\b\d+ - \d+\b/, "no invented score");
  assert.match(html, /Tournament Director/, "a neutral heading, no built-in tournament name");
  assert.match(html, /No tournament connected/);
  assert.equal(realNameHits(html), 0, "no listed real name on /tournament/director");
});
check("a sheet without xG shows it as missing, never an even split", () => {
  const sheet = {
    sheetId: "fixture-sheet", sheetNumber: 1, rinkName: "Fixture Rink", streamState: "UNINITIALIZED" as const,
    youtubeBroadcastId: "", youtubeStreamKey: "", rtmpsIngestUrl: "", playbackUrl: "", bitrateKbps: 0, fps: 0,
    activeAngle: "TACTICAL_PRIMARY" as const, isPublicShowcase: false,
    matchInfo: { matchId: "m", homeTeam: "", awayTeam: "", period: 0, gameClockSeconds: 0, scoreHome: 0, scoreAway: 0, isOvertime: false },
    hardwareHealth: { temperatureCelsius: 0, droppedFramesCount: 0, ispLoadPercentage: 0, thermalThrottled: false },
    acousticShieldMuted: false,
  };
  const html = render(<MultiSheetCommandCenter initialSheets={[sheet]} />);
  assert.match(html, /xG not available/);
  assert.doesNotMatch(html, /xG 1\.50/);
  assert.doesNotMatch(code("src/components/tournaments/MultiSheetCommandCenter.tsx"), /\?\? 1\.5/);
});
check("director page source carries no built-in sheets", () => {
  const s = code("src/app/tournament/director/page.tsx");
  assert.doesNotMatch(s, /INITIAL_SHEETS|youtubeStreamKey|rtmps/);
  assert.doesNotMatch(code("src/components/tournaments/LiveTournamentBracketView.tsx"), /DEFAULT_MATCHES|homeTeam: \{ name: "/);
});
check("iCal modal: provisioning not yet available, no sample calendar, apply disabled", () => {
  const html = render(<ICalProvisioningModal isOpen onClose={() => {}} onApplyProvisioning={() => {}} />);
  assert.match(html, /data-testid="ical-provisioning-unavailable"/);
  assert.doesNotMatch(html, /Load .*Sample/i);
  assert.match(html, /<button[^>]*disabled=""[^>]*>Apply \(not yet available\)/);
  assert.doesNotMatch(src("src/lib/tournament/ical-tournament-provisioner.ts"), /generateSampleTournamentICal|live_tsai_|rtmps:\/\/a\.rtmps/);
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

console.log("O-02 landing RinkTelemetryChart");
check("no named players, chart stays mounted with an empty state", () => {
  assert.equal(existsSync(join(ROOT, "src/data/players-telemetry.ts")), false, "built-in player list must stay deleted");
  const html = render(<RinkTelemetryChart />);
  assert.match(html, /data-testid="rink-telemetry-unavailable"/);
  assert.doesNotMatch(html, /km\/h|bpm|#\d+ [A-Z]/);
  assert.doesNotMatch(code("src/components/landing/RinkTelemetryChart.tsx"), /PLAYERS_DATA|@\/data\/players-telemetry/);
  assert.match(src("src/components/landing/DesktopLanding.tsx"), /<RinkTelemetryChart \/>/, "the chart stays mounted on /");
  assert.match(src("src/app/technology-solutions/page.tsx"), /<RinkTelemetryChart \/>/, "and on /technology-solutions");
});

console.log("O-03 TranscendEngineSubstrate");
check("no random events/sec counter", () => {
  const html = render(<TranscendEngineSubstrate />);
  assert.match(html, /data-testid="engine-throughput-unavailable"/);
  assert.doesNotMatch(html, /events\/sec/);
  assert.match(html, /data-testid="platform-status-unavailable"/);
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
        // Thresholds are configuration, not data; DEFAULT_FAILOVER_THRESHOLDS stays.
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
  assert.equal(realNameHits(render(<RinkTelemetryChart />)), 0);
  assert.equal(realNameHits(render(<TranscendEngineSubstrate />)), 0);
  // The tree-wide scan against the same list is scripts/test-no-real-names.ts (also in pnpm test).
});

console.log(`\n=== T0.4 containment: ${passed} checks passed ===\n`);
