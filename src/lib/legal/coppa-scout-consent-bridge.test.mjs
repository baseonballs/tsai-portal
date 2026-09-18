//
//  coppa-scout-consent-bridge.test.mjs
//  tsai-portal
//
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Track: Track 16 / Track 15 (Watson Legal Compliance & Digital Signature Verification)
//

import assert from "node:assert/strict";
import {
  calculateAthleteAge,
  evaluateScoutExportGate,
  exportAthleteScoutingCard,
} from "./coppa-scout-consent-bridge.ts";

console.log("Starting COPPA Scout Consent Bridge Tests...");

const refDate = new Date("2026-09-18T12:00:00Z");

const verifiedScout = {
  scoutId: "scout-ushl-01",
  scoutName: "Dan Sullivan",
  organization: "USHL Scouting Bureau",
  hasSignedNda: true,
  digitalSignatureVerified: true,
};

const unverifiedScout = {
  scoutId: "scout-unknown-02",
  scoutName: "Bob Anonymous",
  organization: "Unknown Agency",
  hasSignedNda: false,
  digitalSignatureVerified: false,
};

// 1. Age calculation
assert.equal(calculateAthleteAge("2014-05-15", refDate), 12, "Child born May 2014 should be 12 on Sep 2026");
assert.equal(calculateAthleteAge("2010-02-10", refDate), 16, "Teen born Feb 2010 should be 16 on Sep 2026");
assert.equal(calculateAthleteAge("2007-08-01", refDate), 19, "Adult born Aug 2007 should be 19 on Sep 2026");
console.log("✅ calculateAthleteAge tests passed");

// 2. Unverified scout gate (must block unconditionally)
const minorChildUnder13 = {
  athleteId: "ath-minor-12",
  fullName: "Corinne Lucas",
  birthDate: "2014-05-15", // Age 12
  jerseyNumber: 26,
  teamName: "Bay State Breakers 12U",
  position: "Forward",
  personalEmail: "minor@example.com",
  personalPhone: "555-0100",
  homeAddress: "123 Rink Way",
  schoolName: "Breakers Academy",
  gpa: 3.9,
  metrics: {
    burstSpeedMph: 19.4,
    releaseLatencyMs: 95,
    kneeFlexionDeg: 62.5,
    hockeyIqRating: 94,
  },
  filmReelIds: ["reel-01", "reel-02"],
  vpcStatus: {
    vpcAcceptedAt: null,
    vpcParentName: null,
    vpcParentEmail: null,
  },
};

const unverifiedResult = evaluateScoutExportGate(minorChildUnder13, unverifiedScout, refDate);
assert.equal(unverifiedResult.allowed, false);
assert.equal(unverifiedResult.redactionLevel, "blocked");
assert.match(unverifiedResult.reason, /verified cryptographic digital signature/i);
console.log("✅ Gate 1: Unverified scout blocked unconditionally");

// 3. Minor under 13 without VPC (must block unconditionally)
const minorNoVpcResult = evaluateScoutExportGate(minorChildUnder13, verifiedScout, refDate);
assert.equal(minorNoVpcResult.allowed, false);
assert.equal(minorNoVpcResult.requiresVpc, true);
assert.equal(minorNoVpcResult.vpcVerified, false);
assert.equal(minorNoVpcResult.redactionLevel, "blocked");
assert.match(minorNoVpcResult.reason, /COPPA Invariant/i);
console.log("✅ Gate 2: Minor under 13 without VPC blocked under COPPA");

// 4. Minor under 13 with verified VPC (allowed with parent contact, direct contact redacted)
const minorChildWithVpc = {
  ...minorChildUnder13,
  vpcStatus: {
    vpcAcceptedAt: "2026-09-01T10:00:00Z",
    vpcParentName: "Jeffrey Lucas",
    vpcParentEmail: "parent@example.com",
    vpcVersion: "1.0",
  },
};

const minorWithVpcResult = evaluateScoutExportGate(minorChildWithVpc, verifiedScout, refDate);
assert.equal(minorWithVpcResult.allowed, true);
assert.equal(minorWithVpcResult.requiresVpc, true);
assert.equal(minorWithVpcResult.vpcVerified, true);
assert.equal(minorWithVpcResult.redactionLevel, "redacted_metrics_only");

const exportedCard = exportAthleteScoutingCard(minorChildWithVpc, verifiedScout, refDate);
assert.equal(exportedCard.personalContactIncluded, false);
assert.equal(exportedCard.parentContact?.parentEmail, "parent@example.com");
assert.equal(exportedCard.parentContact?.parentName, "Jeffrey Lucas");
assert.equal(exportedCard.filmAccessAllowed, true);
assert.deepEqual(exportedCard.authorizedFilmReels, ["reel-01", "reel-02"]);
console.log("✅ Gate 3: Minor under 13 with VPC allows verified metrics & parent contact");

// 5. Protected Teen (13-17) without VPC (allowed only with anonymized metrics, film & contact redacted)
const teenNoVpc = {
  athleteId: "ath-teen-16",
  fullName: "Alex Mercer",
  birthDate: "2010-03-20", // Age 16
  jerseyNumber: 17,
  teamName: "Boston Jr Eagles 16U AAA",
  position: "Defense",
  personalEmail: "alex@example.com",
  metrics: {
    burstSpeedMph: 21.1,
    releaseLatencyMs: 110,
    kneeFlexionDeg: 59.0,
    hockeyIqRating: 91,
  },
  filmReelIds: ["reel-teen-01"],
  vpcStatus: {
    vpcAcceptedAt: null,
    vpcParentName: null,
  },
};

const teenGateResult = evaluateScoutExportGate(teenNoVpc, verifiedScout, refDate);
assert.equal(teenGateResult.allowed, true);
assert.equal(teenGateResult.ageCategory, "protected_teen_13_17");
assert.equal(teenGateResult.vpcVerified, false);
assert.equal(teenGateResult.redactionLevel, "redacted_metrics_only");

const exportedTeenCard = exportAthleteScoutingCard(teenNoVpc, verifiedScout, refDate);
assert.equal(exportedTeenCard.personalContactIncluded, false);
assert.equal(exportedTeenCard.filmAccessAllowed, false);
assert.equal(exportedTeenCard.authorizedFilmReels.length, 0);
assert.match(exportedTeenCard.athleteDisplayName, /Protected Youth Athlete/i);
console.log("✅ Gate 4: Teen without VPC anonymized and private film access blocked");

// 6. Adult (18+) athlete export
const adultAthlete = {
  athleteId: "ath-adult-19",
  fullName: "Marcus Vance",
  birthDate: "2007-04-10", // Age 19
  jerseyNumber: 9,
  teamName: "NCAA Division 1 Pioneers",
  position: "Forward",
  personalEmail: "marcus@college.edu",
  metrics: {
    burstSpeedMph: 23.4,
    releaseLatencyMs: 82,
    kneeFlexionDeg: 68.0,
    hockeyIqRating: 97,
  },
  filmReelIds: ["reel-ncaa-01"],
  vpcStatus: {},
};

const adultGate = evaluateScoutExportGate(adultAthlete, verifiedScout, refDate);
assert.equal(adultGate.allowed, true);
assert.equal(adultGate.ageCategory, "adult_18_plus");
assert.equal(adultGate.redactionLevel, "full_export");

const adultExport = exportAthleteScoutingCard(adultAthlete, verifiedScout, refDate);
assert.equal(adultExport.personalContactIncluded, true);
assert.equal(adultExport.athleteDisplayName, "Marcus Vance");
assert.equal(adultExport.filmAccessAllowed, true);
console.log("✅ Gate 5: Adult athlete full verified export authorized");

console.log("\nAll COPPA Scout Consent Bridge Tests Passed Successfully!");
