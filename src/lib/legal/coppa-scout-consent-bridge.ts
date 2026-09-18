//
//  coppa-scout-consent-bridge.ts
//  tsai-portal
//
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Track: Track 16 / Track 15 (Watson Legal Compliance & Digital Signature Verification)
//

export type AgeCategory = "minor_under_13" | "protected_teen_13_17" | "adult_18_plus";
export type RedactionLevel = "full_export" | "redacted_metrics_only" | "blocked";

export interface AthleteScoutingProfile {
  athleteId: string;
  fullName: string;
  birthDate: string; // ISO format: YYYY-MM-DD
  jerseyNumber: number;
  teamName: string;
  position: string;
  personalEmail?: string | null;
  personalPhone?: string | null;
  homeAddress?: string | null;
  schoolName?: string | null;
  gpa?: number | null;
  metrics: {
    burstSpeedMph: number;
    releaseLatencyMs: number;
    kneeFlexionDeg: number;
    hockeyIqRating: number;
  };
  filmReelIds: string[];
  vpcStatus: {
    vpcAcceptedAt?: string | null;
    vpcParentName?: string | null;
    vpcParentEmail?: string | null;
    vpcVersion?: string | null;
  };
}

export interface RequestingScoutInfo {
  scoutId: string;
  scoutName: string;
  organization: string;
  hasSignedNda: boolean;
  digitalSignatureVerified: boolean;
}

export interface ScoutExportGateResult {
  allowed: boolean;
  athleteAge: number;
  ageCategory: AgeCategory;
  requiresVpc: boolean;
  vpcVerified: boolean;
  redactionLevel: RedactionLevel;
  reason?: string;
}

export interface SanitizedScoutExport {
  athleteId: string;
  exportTimestamp: string;
  redactionLevel: RedactionLevel;
  athleteDisplayName: string;
  jerseyNumber: number;
  teamName: string;
  position: string;
  metrics: {
    burstSpeedMph: number;
    releaseLatencyMs: number;
    kneeFlexionDeg: number;
    hockeyIqRating: number;
  };
  personalContactIncluded: boolean;
  parentContact?: {
    parentName: string;
    parentEmail: string;
  };
  filmAccessAllowed: boolean;
  authorizedFilmReels: string[];
}

/**
 * Calculates exact chronological age from a YYYY-MM-DD birth date string.
 */
export function calculateAthleteAge(birthDateStr: string, referenceDate: Date = new Date()): number {
  const parts = birthDateStr.split("-").map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return 0;
  }
  const birthYear = parts[0];
  const birthMonth = parts[1] - 1; // 0-indexed month
  const birthDay = parts[2];

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();

  let age = refYear - birthYear;
  if (refMonth < birthMonth || (refMonth === birthMonth && refDay < birthDay)) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Evaluates COPPA legal compliance and Verified Parental Consent (VPC) invariants before exporting athlete profiles to scouts.
 */
export function evaluateScoutExportGate(
  athlete: AthleteScoutingProfile,
  scout: RequestingScoutInfo,
  referenceDate: Date = new Date()
): ScoutExportGateResult {
  // Gate 1: Scout must have verified digital signature on Scout NDA
  if (!scout.hasSignedNda || !scout.digitalSignatureVerified) {
    return {
      allowed: false,
      athleteAge: calculateAthleteAge(athlete.birthDate, referenceDate),
      ageCategory: "minor_under_13",
      requiresVpc: true,
      vpcVerified: false,
      redactionLevel: "blocked",
      reason: "Requesting scout does not have a verified cryptographic digital signature on an active Scout NDA",
    };
  }

  const age = calculateAthleteAge(athlete.birthDate, referenceDate);
  const isUnder13 = age < 13;
  const isProtectedTeen = age >= 13 && age < 18;
  const isAdult = age >= 18;

  const ageCategory: AgeCategory = isUnder13
    ? "minor_under_13"
    : isProtectedTeen
    ? "protected_teen_13_17"
    : "adult_18_plus";

  const vpcAccepted = Boolean(athlete.vpcStatus.vpcAcceptedAt && athlete.vpcStatus.vpcParentName);

  // Gate 2: Children Under 13 (Strict COPPA Gating)
  if (isUnder13) {
    if (!vpcAccepted) {
      return {
        allowed: false,
        athleteAge: age,
        ageCategory,
        requiresVpc: true,
        vpcVerified: false,
        redactionLevel: "blocked",
        reason: "COPPA Invariant: Minor athletes under 13 require active Verified Parental Consent (VPC) before any scouting export.",
      };
    }

    // With VPC, allowed with parental contact (no direct minor contact)
    return {
      allowed: true,
      athleteAge: age,
      ageCategory,
      requiresVpc: true,
      vpcVerified: true,
      redactionLevel: "redacted_metrics_only",
      reason: "Verified Parental Consent active. Direct minor contact redacted; parent contact and certified metrics authorized.",
    };
  }

  // Gate 3: Protected Teens (13-17)
  if (isProtectedTeen) {
    if (vpcAccepted) {
      return {
        allowed: true,
        athleteAge: age,
        ageCategory,
        requiresVpc: false,
        vpcVerified: true,
        redactionLevel: "full_export",
        reason: "Verified Parental Consent active for teen athlete. Full certified scouting card authorized.",
      };
    } else {
      // Without VPC, allowed only with redacted anonymous metrics (no personal contact, no unlisted private film)
      return {
        allowed: true,
        athleteAge: age,
        ageCategory,
        requiresVpc: false,
        vpcVerified: false,
        redactionLevel: "redacted_metrics_only",
        reason: "Teen athlete without active VPC. Anonymized athletic metrics authorized; personal contact and private film redacted.",
      };
    }
  }

  // Gate 4: Adults (18+)
  return {
    allowed: true,
    athleteAge: age,
    ageCategory,
    requiresVpc: false,
    vpcVerified: false,
    redactionLevel: "full_export",
    reason: "Adult athlete; full verified scouting card export authorized.",
  };
}

/**
 * Sanitizes and exports an athlete's scouting profile according to the evaluated gate result.
 */
export function exportAthleteScoutingCard(
  athlete: AthleteScoutingProfile,
  scout: RequestingScoutInfo,
  referenceDate: Date = new Date()
): SanitizedScoutExport {
  const gate = evaluateScoutExportGate(athlete, scout, referenceDate);
  if (!gate.allowed) {
    throw new Error(`Scout export blocked: ${gate.reason}`);
  }

  const exportTimestamp = new Date().toISOString();

  if (gate.redactionLevel === "blocked") {
    throw new Error("Cannot serialize blocked scouting export");
  }

  if (gate.redactionLevel === "redacted_metrics_only") {
    // Redact direct contact, home address, school, and film if no VPC
    const initials = athlete.fullName
      .split(" ")
      .map((part) => part[0])
      .join(". ");

    const displayName = gate.vpcVerified ? athlete.fullName : `${initials}. (Protected Youth Athlete)`;

    return {
      athleteId: athlete.athleteId,
      exportTimestamp,
      redactionLevel: "redacted_metrics_only",
      athleteDisplayName: displayName,
      jerseyNumber: athlete.jerseyNumber,
      teamName: athlete.teamName,
      position: athlete.position,
      metrics: athlete.metrics,
      personalContactIncluded: false,
      parentContact: gate.vpcVerified && athlete.vpcStatus.vpcParentName && athlete.vpcStatus.vpcParentEmail
        ? {
            parentName: athlete.vpcStatus.vpcParentName,
            parentEmail: athlete.vpcStatus.vpcParentEmail,
          }
        : undefined,
      filmAccessAllowed: gate.vpcVerified,
      authorizedFilmReels: gate.vpcVerified ? athlete.filmReelIds : [],
    };
  }

  // Full Export (VPC verified or Adult)
  return {
    athleteId: athlete.athleteId,
    exportTimestamp,
    redactionLevel: "full_export",
    athleteDisplayName: athlete.fullName,
    jerseyNumber: athlete.jerseyNumber,
    teamName: athlete.teamName,
    position: athlete.position,
    metrics: athlete.metrics,
    personalContactIncluded: gate.ageCategory === "adult_18_plus",
    parentContact: athlete.vpcStatus.vpcParentName && athlete.vpcStatus.vpcParentEmail
      ? {
          parentName: athlete.vpcStatus.vpcParentName,
          parentEmail: athlete.vpcStatus.vpcParentEmail,
        }
      : undefined,
    filmAccessAllowed: true,
    authorizedFilmReels: athlete.filmReelIds,
  };
}
