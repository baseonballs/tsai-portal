/**
 * dispute-intercom-portal-types.ts
 * Transcend Portal — Multi-Venue Dispute Intercom Workbench Types
 *
 * Patent Candidate P390 (TSAI-PAT-P390)
 * Rule: Strictly Zero-Purple (slate/zinc/cyan/emerald/amber/rose only)
 */

export type IntercomRole =
  | "REFEREE_TABLET"
  | "HOME_BENCH"
  | "AWAY_BENCH"
  | "TOURNAMENT_ARBITER"
  | "BROADCAST_DIRECTOR";

export type DisputeType =
  | "GOAL_LINE_CROSSING"
  | "BLUE_LINE_OFFSIDE"
  | "PUCK_OVER_GLASS"
  | "HIGH_STICK"
  | "CLOCK_SYNCHRONIZATION";

export interface DisputeParticipantUI {
  id: string;
  role: IntercomRole;
  name: string;
  isMuted: boolean;
  isSpeaking: boolean;
  latencyMs: number;
}

export interface DisputeIntercomState {
  channelId: string;
  venueName: string;
  rinkNumber: number;
  gameTitle: string;
  disputeType: DisputeType;
  currentScrubTimestampSec: number;
  freezeFrameTimestampSec: number;
  playbackSpeed: number; // -1.0, -0.5, 0.0 (paused), 0.5, 1.0
  participants: DisputeParticipantUI[];
  verdictStatus: "PENDING_DELIBERATION" | "CONFIRMED" | "OVERTURNED" | "INCONCLUSIVE";
  activeRulingNotes: string;
}

export interface MultiVenueDisputeIntercomWorkbenchProps {
  initialState?: Partial<DisputeIntercomState>;
  onScrub?: (timestampSec: number) => void;
  onRulingSubmit?: (verdict: DisputeIntercomState["verdictStatus"], notes: string) => void;
  className?: string;
}
