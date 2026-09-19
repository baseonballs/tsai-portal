/**
 * college-scout-types.ts
 * Type definitions for College Scout Discovery & SafeSport Guardian-Mediated Outreach.
 *
 * Assignee: Transcendental Sports AI LLC
 * Platform Invariant 6: Pure physical biometrics, combine data, and certified clips; 0 synthetic tiers.
 */

export type RecruitPosition = "Forward" | "Defense" | "Goaltender";

export interface VerifiedCombineMetrics {
  vo2MaxMlKgMin: number;
  sprint30mMetersSec: number;
  verticalJumpInches: number;
  bilateralPowerImbalancePercent: number;
  gripStrengthKg: number;
}

export interface CertifiedFilmClip {
  clipId: string;
  title: string;
  eventDateIso: string;
  opponent: string;
  certificateToken: string;
  durationSeconds: number;
}

export interface VerifiedProspectPassport {
  id: string;
  athleteName: string;
  jerseyNumber: number;
  position: RecruitPosition;
  currentClub: string;
  league: string;
  heightInches: number;
  weightLbs: number;
  graduationYear: number;
  gpa: number;
  verifiedCombine: VerifiedCombineMetrics;
  certifiedClips: CertifiedFilmClip[];
  isSafeSportParentMediated: boolean;
}

export interface ScoutDiscoveryFilter {
  position: RecruitPosition | "ALL";
  graduationYear: number | "ALL";
  minVo2Max: number;
  maxSprint30m: number;
  maxBilateralImbalance: number;
  minGpa: number;
}

export interface SafeSportInquiryRecord {
  prospectId: string;
  athleteName: string;
  scoutName: string;
  institution: string;
  scoutEmail: string;
  message: string;
  parentConsentAcknowledged: boolean;
  dispatchedAtIso: string;
}
