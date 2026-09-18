//
//  gamesheet-roster-service.test.mjs
//  tsai-portal
//
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Track: Track 16 (Claim 8) & COPPA Invariant Protection
//

import assert from "node:assert/strict";
import { importGameSheetRoster, parseCSVRows } from "./gamesheet-roster-service.ts";

console.log("Starting GameSheet Automated Roster Import & COPPA Tests...");

const refDate = new Date("2026-09-18T12:00:00Z");

const sampleCSV = `Jersey,Player Name,DOB,Position,USA Hockey #,Parent Name,Parent Email
"97","Connor McDavid, Jr.","2014-05-15","C","USAH-97-ON","Wayne McDavid","wayne@example.com"
"29","Leon Draisaitl","2007-10-27","LW","USAH-29-DE","Peter Draisaitl","peter@example.com"
"19","Underage MissingParent","2015-02-10","RW","USAH-19-NA","",""
`;

// 1. CSV Tokenizer Test
const rows = parseCSVRows(sampleCSV);
assert.equal(rows.length, 4, "Must parse 4 rows (1 header + 3 athletes)");
assert.equal(rows[1][1], "Connor McDavid, Jr.", "Quoted comma in name must be preserved");
console.log("✅ CSV tokenizer correctly parses quotes and commas");

// 2. Direct Service Test
const serviceResult = importGameSheetRoster(sampleCSV, {
  teamName: "Boston Jr. Terriers",
  season: "2026-2027",
  levelOfPlay: "12U AAA",
  referenceDate: refDate,
});

assert.equal(serviceResult.success, true, "Service import must succeed");
assert.equal(serviceResult.totalAthletes, 3, "Must have 3 total athletes");
assert.equal(serviceResult.athletesUnder13, 2, "Two athletes (2014, 2015) are under 13 in Sep 2026");
assert.equal(serviceResult.consentLinksGenerated, 1, "Only minor with parent email receives VPC invitation URL");

const connor = serviceResult.athletes.find((a) => a.firstName === "Connor");
assert.ok(connor, "Connor must exist in roster");
assert.equal(connor.calculatedAge, 12, "Age must be exactly 12");
assert.equal(connor.coppaStatus, "pending_parent_consent");
assert.equal(connor.parentConsentRequired, true);
assert.ok(connor.vpcInvitationUrl.includes("/auth/parent-consent?token="), "Must contain VPC invitation link");

const leon = serviceResult.athletes.find((a) => a.firstName === "Leon");
assert.ok(leon, "Leon must exist in roster");
assert.equal(leon.calculatedAge, 18, "Age must be 18");
assert.equal(leon.coppaStatus, "consented_or_exempt");
assert.equal(leon.parentConsentRequired, false);
assert.equal(leon.vpcInvitationUrl, undefined);

const missingParent = serviceResult.athletes.find((a) => a.firstName === "Underage");
assert.ok(missingParent, "Missing parent athlete must exist");
assert.equal(missingParent.calculatedAge, 11);
assert.equal(missingParent.coppaStatus, "blocked_missing_guardian");
console.log("✅ COPPA under-13 boundary, age computation, and VPC token generation verified");

// 3. Fuzzy Headers Test
const fuzzyCSV = `# , Skater Name , Birth Date , Pos , Member ID , Guardian , Guardian Email
77,Victor Hedman,2007-12-18,LD,SWE-77,Olle Hedman,olle@example.com
88,David Pastrnak,2015-05-25,RW,CZE-88,Milan Pastrnak,milan@example.com
`;

const fuzzyResult = importGameSheetRoster(fuzzyCSV, {
  teamName: "Boston Jr. Bruins",
  referenceDate: refDate,
});
assert.equal(fuzzyResult.totalAthletes, 2);
const pasta = fuzzyResult.athletes.find((a) => a.lastName === "Pastrnak");
assert.ok(pasta);
assert.equal(pasta.jerseyNumber, "88");
assert.equal(pasta.position, "RW");
assert.equal(pasta.coppaStatus, "pending_parent_consent");
console.log("✅ Fuzzy headers resolved correctly");

// 4. Edge Cases: Empty CSV
const emptyResult = importGameSheetRoster("Jersey,Name\n", { referenceDate: refDate });
assert.equal(emptyResult.success, false);
assert.equal(emptyResult.athletes.length, 0);
console.log("✅ Edge case (empty CSV) correctly rejected");

console.log("\nAll GameSheet Automated Roster Import & COPPA Tests Passed Successfully!");
