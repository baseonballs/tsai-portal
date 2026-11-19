/**
 * GA-030 T0.4 containment — Portal public false claims (rows O-01, O-02, O-03, O-08, O-09, O-10).
 *
 * Each surface STAYS and renders an honest "not yet available" marker instead of invented data.
 * Rendered with react-dom/server, so this checks what a visitor actually receives, not only source.
 * It FAILS if any built-in club, score, clock, stream key, payout, calibration reading or random
 * counter comes back.
 *
 * Run: npx tsx scripts/test-t0-containment-routes.tsx
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

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

// The real youth club that /club-revshare named, kept as hashes of normalised word pairs so this
// public repo never spells it. A pair is two adjacent lowercase alphanumeric words.
const CLUB_PAIR_HASHES = new Set(["9e75e53b0bbb0228", "00487bde74a01251", "7a0e035eded779fa", "2ed78e36067638e6"]);
const pairHash = (a: string, b: string) => createHash("sha256").update(`${a} ${b}`).digest("hex").slice(0, 16);
function namesTheClub(text: string): boolean {
  const words = text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ");
  for (let i = 0; i + 1 < words.length; i++) if (CLUB_PAIR_HASHES.has(pairHash(words[i], words[i + 1]))) return true;
  return false;
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
  assert.equal(namesTheClub(html), false, "the real club must not be named");
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
  assert.equal(namesTheClub(html), false);
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
];
for (const [name, el] of EMPTY) {
  check(`${name} with no data renders only "not yet available"`, () => {
    const html = render(el);
    assert.match(html, /data-testid="not-yet-available"/);
    const text = html.replace(/<[^>]*>/g, " ");
    assert.doesNotMatch(text, /\d/, "the empty state carries no number");
  });
}
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
        const m = text.match(/^(export )?const (DEFAULT|INITIAL|SAMPLE)_(?!FAILOVER_THRESHOLDS\b)[A-Z_]+\s*:/gm);
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

console.log("Club name, tree-wide");
check("the real club named on /club-revshare appears nowhere in the repository", () => {
  const skip = new Set(["node_modules", ".next", ".git", "graphify-out", "coverage", "dist", "out"]);
  const binary = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".woff", ".woff2", ".ttf", ".mp4", ".mov", ".webm", ".zip"]);
  const hits: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (skip.has(e.name) || e.name.startsWith(".env")) continue;
      const full = join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && !binary.has(extname(e.name).toLowerCase()) && statSync(full).size < 5_000_000) {
        if (namesTheClub(readFileSync(full, "utf8"))) hits.push(relative(ROOT, full));
      }
    }
  };
  walk(ROOT);
  assert.deepEqual(hits, [], `files that name the club: ${hits.join(", ")}`);
});

console.log(`\n=== T0.4 containment: ${passed} checks passed ===\n`);
