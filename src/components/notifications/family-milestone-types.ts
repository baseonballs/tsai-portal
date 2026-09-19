//
//  family-milestone-types.ts
//  tsai-portal
//
//  Author: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Track: Track 16 (Docket P229, Claim 10)
//  Rule: Strictly Zero-Purple
//  Invariant: Platform Invariant 6 (Physical Kinematics)
//

export type MilestoneCategory =
  | "goal"
  | "assist"
  | "high_danger_chance"
  | "certified_rvh_save";

export interface FamilyMilestoneItem {
  id: string;
  athleteId: string;
  athleteName: string;
  jerseyNumber: number;
  gameId: string;
  gameClock: string;
  seekOffsetSeconds: number;
  category: MilestoneCategory;
  headline: string;
  description: string;
  deepLinkUrl: string;
  metricLabel?: string;
  metricValue?: string;
  timestamp: string;
}

export interface MilestoneNotificationToastProps {
  milestone: FamilyMilestoneItem;
  onInstantSeek?: (seekSeconds: number, gameId: string) => void;
  onDismiss?: (id: string) => void;
  autoDismissMs?: number;
  className?: string;
}
