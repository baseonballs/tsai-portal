/**
 * multi-venue-intercom-types.ts
 *
 * Types for TSAI-PAT-P398: Multi-Venue Synchronized Time-Shifted Broadcast Distribution & Dispute Intercom Workbench
 *
 * Platform Invariant 6: Pure physical timestamps, SI units, and sensor telemetry. Zero subjective scoring.
 */

export type IntercomRole =
  | 'REFEREE_TABLET'
  | 'HOME_BENCH'
  | 'AWAY_BENCH'
  | 'TOURNAMENT_ARBITER'
  | 'BROADCAST_DIRECTOR';

export interface IntercomPeer {
  id: string;
  role: IntercomRole;
  label: string;
  isMuted: boolean;
  isSpeaking: boolean;
  audioLatencyMs: number;
  ptpOffsetMs: number;
}

export interface DisputeReviewState {
  disputeId: string;
  venueId: string;
  rinkSheetId: string;
  gameClockSec: number;
  ptpMasterTimestampSec: number;
  currentPlaybackSpeed: number; // -1.0 to 1.0
  activeFrameIndex: number;
  isFrozen: boolean;
  selectedDecision: 'PENDING' | 'CALL_CONFIRMED' | 'CALL_OVERTURNED' | 'INCONCLUSIVE';
}

export interface MultiVenueIntercomViewModel {
  dispute: DisputeReviewState;
  peers: IntercomPeer[];
  broadcastEgressActive: boolean;
  scoreboardMulticastActive: boolean;
}
