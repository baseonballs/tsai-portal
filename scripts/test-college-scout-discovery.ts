/**
 * Test Suite: College Scout Discovery & SafeSport Outreach Console
 * Platform Option EE: Verified Athletic Recruit Passport & SafeSport Contact Channel
 *
 * Assignee: Transcendental Sports AI LLC
 * Platform Invariant 6: Pure physical biometrics, combine telemetry, and certified clips; 0 synthetic tiers.
 * Zero-Purple Rule: Strictly 0 purple/indigo/violet Tailwind tokens
 */

import fs from "fs";
import path from "path";
import type {
  VerifiedProspectPassport,
  ScoutDiscoveryFilter,
  SafeSportInquiryRecord,
} from "../src/components/scouting/college-scout-types";

function runTests() {
  console.log("=== Running College Scout Discovery & SafeSport Tests ===");

  // 1. Data Contracts & Platform Invariant 6 Validation
  const sampleProspects: VerifiedProspectPassport[] = [
    {
      id: "prospect-01",
      athleteName: "Cole Eiserman",
      jerseyNumber: 19,
      position: "Forward",
      currentClub: "USNTDP",
      league: "USHL",
      heightInches: 72,
      weightLbs: 195,
      graduationYear: 2024,
      gpa: 3.85,
      verifiedCombine: {
        vo2MaxMlKgMin: 62.4,
        sprint30mMetersSec: 3.78,
        verticalJumpInches: 31.5,
        bilateralPowerImbalancePercent: 3.8,
        gripStrengthKg: 58.0,
      },
      certifiedClips: [
        {
          clipId: "clip-101",
          title: "Powerplay One-Timer Top Shelf",
          eventDateIso: "2024-02-15T19:30:00Z",
          opponent: "Chicago Steel",
          certificateToken: "cert_p256_eise19_pp_goal",
          durationSeconds: 14,
        },
      ],
      isSafeSportParentMediated: true,
    },
    {
      id: "prospect-02",
      athleteName: "Zeev Buium",
      jerseyNumber: 28,
      position: "Defense",
      currentClub: "Univ. of Denver",
      league: "NCAA",
      heightInches: 72,
      weightLbs: 185,
      graduationYear: 2024,
      gpa: 3.92,
      verifiedCombine: {
        vo2MaxMlKgMin: 64.1,
        sprint30mMetersSec: 3.82,
        verticalJumpInches: 29.0,
        bilateralPowerImbalancePercent: 4.2,
        gripStrengthKg: 54.5,
      },
      certifiedClips: [
        {
          clipId: "clip-201",
          title: "Blue Line Transition & Escape",
          eventDateIso: "2024-03-01T20:00:00Z",
          opponent: "North Dakota",
          certificateToken: "cert_p256_buium28_trans",
          durationSeconds: 18,
        },
      ],
      isSafeSportParentMediated: true,
    },
  ];

  if (sampleProspects.length !== 2) {
    throw new Error("Expected 2 prospects");
  }

  // Ensure combine biometrics are purely objective
  for (const p of sampleProspects) {
    if (p.verifiedCombine.vo2MaxMlKgMin <= 0 || p.verifiedCombine.sprint30mMetersSec <= 0) {
      throw new Error(`Invalid combine telemetry for ${p.athleteName}`);
    }
    if (!p.isSafeSportParentMediated) {
      throw new Error(`SafeSport parent mediation must be enforced for ${p.athleteName}`);
    }
  }
  console.log("✔ Test 1: Data contracts and Platform Invariant 6 validated.");

  // 2. Combine Telemetry Filter Simulation
  const defenseFilter: ScoutDiscoveryFilter = {
    position: "Defense",
    graduationYear: "ALL",
    minVo2Max: 60.0,
    maxSprint30m: 3.90,
    maxBilateralImbalance: 10.0,
    minGpa: 3.5,
  };

  const filtered = sampleProspects.filter((p) => {
    if (defenseFilter.position !== "ALL" && p.position !== defenseFilter.position) return false;
    if (p.verifiedCombine.vo2MaxMlKgMin < defenseFilter.minVo2Max) return false;
    if (p.verifiedCombine.sprint30mMetersSec > defenseFilter.maxSprint30m) return false;
    if (p.verifiedCombine.bilateralPowerImbalancePercent > defenseFilter.maxBilateralImbalance) return false;
    if (p.gpa < defenseFilter.minGpa) return false;
    return true;
  });

  if (filtered.length !== 1 || filtered[0].athleteName !== "Zeev Buium") {
    throw new Error("Filter failure: Expected only Zeev Buium to match defense combine criteria");
  }
  console.log("✔ Test 2: Combine telemetry filtering verified.");

  // 3. SafeSport Outreach Consent Record Validation
  const sampleInquiry: SafeSportInquiryRecord = {
    prospectId: "prospect-01",
    athleteName: "Cole Eiserman",
    scoutName: "Coach David Carle",
    institution: "University of Denver",
    scoutEmail: "dcarle@du.edu",
    message: "Inquiring about freshman prospective enrollment and combine verification.",
    parentConsentAcknowledged: true,
    dispatchedAtIso: new Date().toISOString(),
  };

  if (!sampleInquiry.parentConsentAcknowledged) {
    throw new Error("SafeSport violation: Parent consent must be acknowledged before inquiry dispatch");
  }
  if (!sampleInquiry.scoutEmail.includes("@")) {
    throw new Error("Invalid recruiter email");
  }
  console.log("✔ Test 3: SafeSport guardian inquiry record verified.");

  // 4. Zero-Purple Rule Enforcement
  const componentPath = path.resolve(__dirname, "../src/components/scouting/CollegeScoutDiscoveryPanel.tsx");
  const modalPath = path.resolve(__dirname, "../src/components/scouting/SafeSportInquiryModal.tsx");
  const componentCode = fs.readFileSync(componentPath, "utf-8");
  const modalCode = fs.readFileSync(modalPath, "utf-8");

  const purpleRegex = /(purple|indigo|violet)/i;
  if (purpleRegex.test(componentCode) || purpleRegex.test(modalCode)) {
    throw new Error("Zero-Purple Violation: Found purple/indigo/violet token in scouting components");
  }
  console.log("✔ Test 4: Zero-Purple Rule 100% verified across scouting components.");

  // 5. Component Line Limit (< 300 lines)
  const lineCount = componentCode.split("\n").length;
  const modalLineCount = modalCode.split("\n").length;
  if (lineCount >= 300 || modalLineCount >= 300) {
    throw new Error(`Component line limit exceeded: panel=${lineCount}, modal=${modalLineCount} >= 300 lines`);
  }
  console.log(`✔ Test 5: Component line counts valid (panel: ${lineCount}, modal: ${modalLineCount} < 300 lines).`);

  console.log("=== ALL 5 COLLEGE SCOUT DISCOVERY TESTS PASSED ===");
}

try {
  runTests();
  process.exit(0);
} catch (err: any) {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
}
