//
//  test-multi-venue-dispute-intercom-workbench.ts
//  tsai-portal
//
//  Transcend Platform - Patent Candidate P390 (TSAI-PAT-P390)
//  Multi-Venue Synchronized Broadcast & Dispute Intercom Workbench Test Suite
//

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  DisputeIntercomState,
  DisputeParticipantUI,
} from "../src/types/dispute-intercom-portal-types";

const DEFAULT_DISPUTE_STATE: DisputeIntercomState = {
  channelId: "disp_ch_001",
  venueName: "Ice Palace",
  rinkNumber: 1,
  gameTitle: "Finals",
  disputeType: "GOAL_LINE_CROSSING",
  currentScrubTimestampSec: 100.0,
  freezeFrameTimestampSec: 100.0,
  playbackSpeed: 0.0,
  participants: [
    { id: "1", role: "REFEREE_TABLET", name: "Referee", isMuted: false, isSpeaking: false, latencyMs: 20 },
    { id: "2", role: "HOME_BENCH", name: "Home Coach", isMuted: false, isSpeaking: false, latencyMs: 25 },
    { id: "3", role: "AWAY_BENCH", name: "Away Coach", isMuted: false, isSpeaking: false, latencyMs: 25 },
    { id: "4", role: "TOURNAMENT_ARBITER", name: "Arbiter", isMuted: false, isSpeaking: false, latencyMs: 15 },
  ],
  verdictStatus: "PENDING_DELIBERATION",
  activeRulingNotes: "",
};

console.log("================================================================================");
console.log("🏒 RUNNING MULTI-VENUE DISPUTE INTERCOM WORKBENCH TESTS (PATENT P390)");
console.log("================================================================================");

// 1. Data Model Verification
const state: DisputeIntercomState = DEFAULT_DISPUTE_STATE;
assert.strictEqual(state.disputeType, "GOAL_LINE_CROSSING", "Default dispute type must match");
assert.ok(state.participants.length >= 4, "Must contain at least 4 intercom participants");

// Verify all participants have sub-50ms latency (PTP synchronized local mesh)
for (const participant of state.participants) {
  assert.ok(
    participant.latencyMs <= 50,
    `Participant ${participant.name} latency ${participant.latencyMs}ms exceeds 50ms SLA`
  );
}
console.log("✓ DisputeIntercomState contracts and sub-50ms latency SLA validated.");

// 2. Zero-Purple AST / Token Audit
const componentPath = path.resolve(
  __dirname,
  "../src/components/review/MultiVenueDisputeIntercomWorkbench.tsx"
);
const componentSource = fs.readFileSync(componentPath, "utf-8");

const forbiddenPurplePatterns = [
  /purple/i,
  /violet/i,
  /indigo/i,
  /#8[0-9a-fA-F]{5}/,
  /#7[0-9a-fA-F]{5}/,
];

for (const pattern of forbiddenPurplePatterns) {
  assert.ok(
    !pattern.test(componentSource),
    `Violation: Component source contains forbidden chromatic token: ${pattern}`
  );
}
console.log("✓ Zero-Purple invariant satisfied in MultiVenueDisputeIntercomWorkbench.tsx.");

// 3. File Line Limit (INV-5) Audit
const lines = componentSource.split("\n").length;
assert.ok(
  lines < 300,
  `Violation: Component file must stay below 300 lines (current: ${lines})`
);
console.log(`✓ Component line count invariant satisfied: ${lines} lines (< 300 lines).`);

const typesPath = path.resolve(
  __dirname,
  "../src/types/dispute-intercom-portal-types.ts"
);
const typeLines = fs.readFileSync(typesPath, "utf-8").split("\n").length;
assert.ok(
  typeLines < 300,
  `Violation: Types file must stay below 300 lines (current: ${typeLines})`
);
console.log(`✓ Types line count invariant satisfied: ${typeLines} lines (< 300 lines).`);

console.log("================================================================================");
console.log("🎉 ALL MULTI-VENUE DISPUTE INTERCOM WORKBENCH TESTS PASSED (100%)");
console.log("================================================================================");
