/**
 * test-ical-tournament-provisioner.ts
 * TsaiPortal / Verification Script
 *
 * Assignee: Transcendental Sports AI LLC
 * Patent Track 16: TSAI-PATENT-VISION-01 (Docket P229, Claims 9 & 10)
 *
 * Validates RFC 5545 iCalendar tournament parsing, explicit location-to-sheet reconciliation
 * with verbatim rink names (zero keyword heuristics or invented rinks), unmapped event tracking,
 * conflict detection, and zero unbacked stream/telemetry fields.
 *
 * Run: npx tsx scripts/test-ical-tournament-provisioner.ts
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  parseICalFeed,
  mapLocationToSheetNumber,
  parseTeamsFromSummary,
  detectSheetScheduleConflicts,
  provisionTournamentSheetsFromICal,
  type ICalEvent,
} from "../src/lib/tournament/ical-tournament-provisioner";

// Neutral in-test fixture (no real clubs, venues or people). GA-030 O-01: the app no longer ships
// a sample calendar, so the fixture lives here and only here.
const SHEET_LOCATIONS = [
  "Fixture Arena Sheet 1",
  "Fixture Facility (Sheet 2)",
  "Fixture Rink 3",
  "Fixture Rink 4",
  "Sheet 5 - North Hall",
  "Sheet 6 - South Hall",
  "Rink No. 7",
  "Sheet #8",
];
const STARTS = ["180000", "181500", "180000", "183000", "180000", "181500", "183000", "180000"];
const ENDS = ["193000", "194500", "193000", "200000", "193000", "194500", "200000", "193000"];

function neutralTournamentICal(): string {
  const events = SHEET_LOCATIONS.map(
    (loc, i) => `BEGIN:VEVENT
UID:fixture-game-${i + 1}
DTSTART:20260918T${STARTS[i]}Z
DTEND:20260918T${ENDS[i]}Z
SUMMARY:Fixture Home ${i + 1} vs Fixture Away ${i + 1} (16U AAA Quarterfinal ${i + 1})
LOCATION:${loc}
END:VEVENT`,
  );
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//fixture//EN
${events.join("\n")}
END:VCALENDAR`;
}

async function runICalProvisionerTests() {
  console.log("─────────────────────────────────────────────────────────────────");
  console.log("🏒 [Portal Test] iCal Automated Tournament Provisioner");
  console.log("─────────────────────────────────────────────────────────────────\n");

  // Guardrail: provisioner source must never re-introduce defaultRinkNames or heuristic arena names
  const sourcePath = path.resolve(process.cwd(), "src/lib/tournament/ical-tournament-provisioner.ts");
  const provisionerSource = fs.readFileSync(sourcePath, "utf8");
  for (const forbidden of [
    "defaultRinkNames",
    "Main Center Arena",
    "Olympic South Sheet",
    "North Rink 3",
    "Studio Pond",
    "Away Team",
    "Home Team",
  ]) {
    assert.equal(provisionerSource.includes(forbidden), false, `Forbidden fallback literal found: ${forbidden}`);
  }

  // TEST PILLAR 1: RFC 5545 Parsing & Summary Extraction
  console.log("1. Testing RFC 5545 iCalendar Parsing & Summary Extraction...");
  const sampleIcs = neutralTournamentICal();
  const events = parseICalFeed(sampleIcs);

  assert.equal(events.length, 8, "Expected exactly 8 tournament games parsed from fixture");

  const qf1 = events[0];
  assert.equal(qf1.uid, "fixture-game-1");
  assert.equal(qf1.homeTeam, "Fixture Home 1");
  assert.equal(qf1.awayTeam, "Fixture Away 1");
  assert.equal(qf1.division, "16U AAA Quarterfinal 1");
  assert.equal(qf1.sheetNumber, 1);
  assert.equal(qf1.rinkName, "Fixture Arena Sheet 1", "rinkName must preserve LOCATION verbatim");
  assert.ok(qf1.dtStart instanceof Date, "dtStart must be a Date instance");
  assert.ok(qf1.dtEnd instanceof Date, "dtEnd must be a Date instance");
  assert.equal(qf1.dtStart.toISOString(), "2026-09-18T18:00:00.000Z");

  const parsedAt = parseTeamsFromSummary("Fixture Club A @ Fixture Club B - Semifinal");
  assert.equal(parsedAt.homeTeam, "Fixture Club A");
  assert.equal(parsedAt.awayTeam, "Fixture Club B");
  assert.equal(parsedAt.round, "Semifinal");

  const singleSummary = parseTeamsFromSummary("Open Ice Practice");
  assert.equal(singleSummary.homeTeam, "Open Ice Practice");
  assert.equal(singleSummary.awayTeam, null, "Must never invent a placeholder Away Team");

  console.log("   ✅ PASS: RFC 5545 VEVENT parsing and composite summary extraction verified.");

  // TEST PILLAR 2: Explicit Location-to-Sheet Mapping (Zero Heuristic Guesswork)
  console.log("\n2. Testing Verbatim Location & Explicit Sheet Reconciliation...");
  assert.deepEqual(mapLocationToSheetNumber("Fixture Arena Sheet 1"), {
    sheetNumber: 1,
    rinkName: "Fixture Arena Sheet 1",
  });
  assert.deepEqual(mapLocationToSheetNumber("Fixture Facility (Sheet 2)"), {
    sheetNumber: 2,
    rinkName: "Fixture Facility (Sheet 2)",
  });
  assert.deepEqual(mapLocationToSheetNumber("Fixture Rink 4"), {
    sheetNumber: 4,
    rinkName: "Fixture Rink 4",
  });
  assert.deepEqual(mapLocationToSheetNumber("Rink 3 (Sheet 3)"), {
    sheetNumber: 3,
    rinkName: "Rink 3 (Sheet 3)",
  });
  assert.deepEqual(mapLocationToSheetNumber("Sheet 12 - Overflow Arena"), {
    sheetNumber: 12,
    rinkName: "Sheet 12 - Overflow Arena",
  });

  // Unrecognized / heuristic-trap / ambiguous / empty locations MUST remain unmapped (null)
  assert.deepEqual(mapLocationToSheetNumber("Center Arena Main Ice"), {
    sheetNumber: null,
    rinkName: "Center Arena Main Ice",
  });
  assert.deepEqual(mapLocationToSheetNumber("Olympic Ice Facility"), {
    sheetNumber: null,
    rinkName: "Olympic Ice Facility",
  });
  assert.deepEqual(mapLocationToSheetNumber("North East Arena"), {
    sheetNumber: null,
    rinkName: "North East Arena",
  });
  assert.deepEqual(mapLocationToSheetNumber("Sheet 1 / Sheet 2"), {
    sheetNumber: null,
    rinkName: "Sheet 1 / Sheet 2",
  });
  assert.deepEqual(mapLocationToSheetNumber("Sheet 99"), {
    sheetNumber: null,
    rinkName: "Sheet 99",
  });
  assert.deepEqual(mapLocationToSheetNumber("   "), {
    sheetNumber: null,
    rinkName: null,
  });

  console.log("   ✅ PASS: Verbatim LOCATION preserved; missing/ambiguous sheet numbers stay unmapped.");

  // TEST PILLAR 3: Sheet Schedule Conflict Detection (ignores unmapped events)
  console.log("\n3. Testing Sheet Schedule Conflict Detection...");
  const zeroConflicts = detectSheetScheduleConflicts(events);
  assert.equal(zeroConflicts.length, 0, "Fixture sample must have zero schedule conflicts");

  const unmappedPair: ICalEvent[] = [
    {
      uid: "unmapped-a",
      summary: "Fixture U1 vs Fixture U2",
      location: "Main Arena",
      dtStart: new Date("2026-09-18T18:30:00.000Z"),
      dtEnd: new Date("2026-09-18T20:00:00.000Z"),
      homeTeam: "Fixture U1",
      awayTeam: "Fixture U2",
      sheetNumber: null,
      rinkName: "Main Arena",
    },
    {
      uid: "unmapped-b",
      summary: "Fixture U3 vs Fixture U4",
      location: "Olympic Arena",
      dtStart: new Date("2026-09-18T18:30:00.000Z"),
      dtEnd: new Date("2026-09-18T20:00:00.000Z"),
      homeTeam: "Fixture U3",
      awayTeam: "Fixture U4",
      sheetNumber: null,
      rinkName: "Olympic Arena",
    },
  ];
  assert.equal(detectSheetScheduleConflicts(unmappedPair).length, 0, "Unmapped events must not collide");

  const conflictingEvents: ICalEvent[] = [
    ...events,
    {
      uid: "conflict-match-sheet2",
      summary: "Fixture Club C vs Fixture Club D",
      location: "Sheet 2 - Overflow",
      dtStart: new Date("2026-09-18T18:30:00.000Z"),
      dtEnd: new Date("2026-09-18T20:00:00.000Z"),
      homeTeam: "Fixture Club C",
      awayTeam: "Fixture Club D",
      sheetNumber: 2,
      rinkName: "Sheet 2 - Overflow",
    },
  ];

  const detectedConflicts = detectSheetScheduleConflicts(conflictingEvents);
  assert.equal(detectedConflicts.length, 1, "Must detect exactly 1 conflict on Sheet 2");
  assert.equal(detectedConflicts[0].sheetNumber, 2);
  assert.equal(detectedConflicts[0].conflictOverlapSeconds, 4500);
  console.log("   ✅ PASS: Conflict auditor correctly detects mapped overlaps and skips unmapped events.");

  // TEST PILLAR 4: Provisioning from calendar preserves LOCATION verbatim and invents nothing
  console.log("\n4. Testing Provisioning Report Integrity & Unmapped Handling...");
  const simulatedCurrentTime = new Date("2026-09-18T18:30:00.000Z");
  const report = provisionTournamentSheetsFromICal(events, {
    currentTime: simulatedCurrentTime,
  });

  assert.equal(report.totalEventsParsed, 8);
  assert.equal(report.sheetsProvisionedCount, 8);
  assert.equal(report.unmappedEventsCount, 0);
  assert.equal(report.unmappedEvents.length, 0);
  assert.equal(report.conflictsDetected.length, 0);
  assert.equal(report.sheets.length, 8);

  for (let i = 0; i < report.sheets.length; i++) {
    const sheet = report.sheets[i];
    assert.equal(sheet.rinkName, SHEET_LOCATIONS[i], `Sheet ${sheet.sheetNumber} must keep verbatim LOCATION`);
    assert.equal(sheet.streamState, "UNINITIALIZED");
    assert.equal("youtubeStreamKey" in sheet, false);
    assert.equal("rtmpsIngestUrl" in sheet, false);
    assert.equal(sheet.youtubeBroadcastId, null);
    assert.equal(sheet.playbackUrl, null);
    assert.equal(sheet.isPublicShowcase, false);
    assert.equal(sheet.matchInfo?.scoreHome, null);
    assert.equal(sheet.matchInfo?.scoreAway, null);
    assert.equal(sheet.matchInfo?.gameClockSeconds, null);
    assert.equal(sheet.hardwareHealth, null);
  }

  // Empty feed returns zero sheets (no fabricated 1..8 idle sheets)
  const emptyReport = provisionTournamentSheetsFromICal([], { currentTime: simulatedCurrentTime });
  assert.equal(emptyReport.sheets.length, 0);
  assert.equal(emptyReport.sheetsProvisionedCount, 0);
  assert.equal(emptyReport.unmappedEventsCount, 0);

  // Mixed mapped + unmapped feed only outputs mapped sheet numbers and tracks unmappedEvents
  const mixedEvents = parseICalFeed(`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:mapped-s3
DTSTART:20260918T180000Z
DTEND:20260918T193000Z
SUMMARY:Fixture Alpha vs Fixture Beta
LOCATION:Community Pavilion Rink 3
END:VEVENT
BEGIN:VEVENT
UID:unmapped-main
DTSTART:20260918T180000Z
DTEND:20260918T193000Z
SUMMARY:Fixture Gamma vs Fixture Delta
LOCATION:Center Arena Main Ice
END:VEVENT
END:VCALENDAR`);

  const mixedReport = provisionTournamentSheetsFromICal(mixedEvents, { currentTime: simulatedCurrentTime });
  assert.equal(mixedReport.totalEventsParsed, 2);
  assert.equal(mixedReport.sheetsProvisionedCount, 1);
  assert.deepEqual(mixedReport.activeSheetNumbers, [3]);
  assert.equal(mixedReport.sheets[0].rinkName, "Community Pavilion Rink 3");
  assert.equal(mixedReport.unmappedEventsCount, 1);
  assert.equal(mixedReport.unmappedEvents[0].uid, "unmapped-main");
  assert.equal(mixedReport.unmappedEvents[0].sheetNumber, null);

  console.log("   ✅ PASS: Provisioner handles verbatim LOCATION, empty inputs, and unmapped events.");

  console.log("\n─────────────────────────────────────────────────────────────────");
  console.log("🎉 ALL 4 PILLARS PASSED: iCal Tournament Provisioner");
  console.log("─────────────────────────────────────────────────────────────────\n");
}

runICalProvisionerTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
