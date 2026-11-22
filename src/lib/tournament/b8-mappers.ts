import type {
  BracketMatch,
  BracketMatchStatus,
  BracketRound,
  BracketSide,
  BroadcastAngle,
  SheetHardwareHealth,
  SheetStreamState,
  TeamOption,
  TournamentDetail,
  TournamentFormat,
  TournamentSheet,
  TournamentStatus,
  TournamentSummary,
} from "@/components/tournaments/multi-sheet-types";

type JsonObj = Record<string, unknown>;

function asObj(v: unknown): JsonObj {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as JsonObj) : {};
}

function strOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function numOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function numOrZero(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function mapTeamOption(raw: unknown): TeamOption {
  const o = asObj(raw);
  const org = o.organization ? asObj(o.organization) : null;
  return {
    id: String(o.id ?? ""),
    name: String(o.name ?? ""),
    season: String(o.season ?? ""),
    levelOfPlay: strOrNull(o.level_of_play ?? o.levelOfPlay),
    tier: strOrNull(o.tier),
    gender: strOrNull(o.gender),
    organizationName: org ? strOrNull(org.name) : null,
  };
}

export function mapHardwareHealth(raw: unknown): SheetHardwareHealth | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = asObj(raw);
  return {
    temperatureCelsius: numOrNull(o.temperature_celsius ?? o.temperatureCelsius),
    droppedFramesCount: numOrNull(o.dropped_frames_count ?? o.droppedFramesCount),
    ispLoadPercentage: numOrNull(o.isp_load_percentage ?? o.ispLoadPercentage),
    thermalThrottled:
      typeof (o.thermal_throttled ?? o.thermalThrottled) === "boolean"
        ? Boolean(o.thermal_throttled ?? o.thermalThrottled)
        : null,
  };
}

export function mapTournamentSheet(raw: unknown): TournamentSheet {
  const o = asObj(raw);
  return {
    sheetId: String(o.id ?? o.sheetId ?? ""),
    tournamentId: strOrNull(o.tournament_id ?? o.tournamentId) ?? undefined,
    sheetNumber: numOrZero(o.sheet_number ?? o.sheetNumber),
    rinkName: String(o.rink_name ?? o.rinkName ?? ""),
    streamState: (o.stream_state ?? o.streamState ?? "UNINITIALIZED") as SheetStreamState,
    activeAngle: (o.active_angle ?? o.activeAngle ?? "TACTICAL_PRIMARY") as BroadcastAngle,
    youtubeBroadcastId: strOrNull(o.youtube_broadcast_id ?? o.youtubeBroadcastId),
    playbackUrl: strOrNull(o.playback_url ?? o.playbackUrl),
    bitrateKbps: numOrNull(o.bitrate_kbps ?? o.bitrateKbps),
    fps: numOrNull(o.fps),
    hardwareHealth: mapHardwareHealth(o.hardware_health ?? o.hardwareHealth),
    isPublicShowcase: Boolean(o.is_public_showcase ?? o.isPublicShowcase),
    acousticShieldMuted: Boolean(o.acoustic_shield_muted ?? o.acousticShieldMuted),
  };
}

export function mapBracketMatch(raw: unknown): BracketMatch {
  const o = asObj(raw);
  const rawWinner = o.winner_side ?? o.winnerSide;
  const rawNextSlot = o.next_match_slot ?? o.nextMatchSlot;
  return {
    matchId: String(o.id ?? o.matchId ?? ""),
    tournamentId: strOrNull(o.tournament_id ?? o.tournamentId) ?? undefined,
    round: (o.round ?? "POOL") as BracketRound,
    matchLabel: String(o.match_label ?? o.matchLabel ?? ""),
    sortOrder: numOrZero(o.sort_order ?? o.sortOrder),
    sheetId: strOrNull(o.sheet_id ?? o.sheetId),
    gameId: strOrNull(o.game_id ?? o.gameId),
    homeTeamName: strOrNull(o.home_team_name ?? o.homeTeamName),
    awayTeamName: strOrNull(o.away_team_name ?? o.awayTeamName),
    homeSeed: numOrNull(o.home_seed ?? o.homeSeed),
    awaySeed: numOrNull(o.away_seed ?? o.awaySeed),
    homeScore: numOrNull(o.home_score ?? o.homeScore),
    awayScore: numOrNull(o.away_score ?? o.awayScore),
    status: (o.status ?? "UPCOMING") as BracketMatchStatus,
    period: numOrNull(o.period),
    clockSeconds: numOrNull(o.clock_seconds ?? o.clockSeconds),
    isOvertime: Boolean(o.is_overtime ?? o.isOvertime),
    winnerSide: rawWinner === "home" || rawWinner === "away" ? (rawWinner as BracketSide) : null,
    nextMatchId: strOrNull(o.next_match_id ?? o.nextMatchId),
    nextMatchSlot: rawNextSlot === "home" || rawNextSlot === "away" ? (rawNextSlot as BracketSide) : null,
    startsAt: strOrNull(o.starts_at ?? o.startsAt),
  };
}

export function mapTournamentSummary(raw: unknown): TournamentSummary {
  const o = asObj(raw);
  return {
    id: String(o.id ?? ""),
    teamId: String(o.team_id ?? o.teamId ?? ""),
    seasonId: strOrNull(o.season_id ?? o.seasonId),
    name: String(o.name ?? ""),
    venueName: strOrNull(o.venue_name ?? o.venueName),
    startsOn: strOrNull(o.starts_on ?? o.startsOn),
    endsOn: strOrNull(o.ends_on ?? o.endsOn),
    format: (o.format ?? "single_elimination") as TournamentFormat,
    status: (o.status ?? "scheduled") as TournamentStatus,
    emergencyGlobalAudioMute: Boolean(o.emergency_global_audio_mute ?? o.emergencyGlobalAudioMute),
    sheetCount: numOrZero(o.sheet_count ?? o.sheetCount),
    matchCount: numOrZero(o.match_count ?? o.matchCount),
    createdAt: String(o.created_at ?? o.createdAt ?? ""),
    updatedAt: strOrNull(o.updated_at ?? o.updatedAt),
  };
}

export function mapTournamentDetail(raw: unknown): TournamentDetail {
  const o = asObj(raw);
  const summary = mapTournamentSummary(o);
  return {
    id: summary.id,
    teamId: summary.teamId,
    seasonId: summary.seasonId,
    name: summary.name,
    venueName: summary.venueName,
    startsOn: summary.startsOn,
    endsOn: summary.endsOn,
    format: summary.format,
    status: summary.status,
    emergencyGlobalAudioMute: summary.emergencyGlobalAudioMute,
    sheets: Array.isArray(o.sheets) ? o.sheets.map(mapTournamentSheet) : [],
    matches: Array.isArray(o.matches) ? o.matches.map(mapBracketMatch) : [],
    createdAt: summary.createdAt,
    updatedAt: summary.updatedAt,
  };
}

const KEY_TO_SNAKE: Record<string, string> = {
  seasonId: "season_id",
  venueName: "venue_name",
  startsOn: "starts_on",
  endsOn: "ends_on",
  emergencyGlobalAudioMute: "emergency_global_audio_mute",
  cascadeAudioMute: "cascade_audio_mute",
  sheetNumber: "sheet_number",
  rinkName: "rink_name",
  streamState: "stream_state",
  activeAngle: "active_angle",
  youtubeBroadcastId: "youtube_broadcast_id",
  playbackUrl: "playback_url",
  bitrateKbps: "bitrate_kbps",
  hardwareHealth: "hardware_health",
  isPublicShowcase: "is_public_showcase",
  acousticShieldMuted: "acoustic_shield_muted",
  temperatureCelsius: "temperature_celsius",
  droppedFramesCount: "dropped_frames_count",
  ispLoadPercentage: "isp_load_percentage",
  thermalThrottled: "thermal_throttled",
  sheetId: "sheet_id",
  gameId: "game_id",
  matchLabel: "match_label",
  sortOrder: "sort_order",
  homeTeamName: "home_team_name",
  awayTeamName: "away_team_name",
  homeSeed: "home_seed",
  awaySeed: "away_seed",
  homeScore: "home_score",
  awayScore: "away_score",
  clockSeconds: "clock_seconds",
  isOvertime: "is_overtime",
  winnerSide: "winner_side",
  nextMatchId: "next_match_id",
  nextMatchSlot: "next_match_slot",
  startsAt: "starts_at",
};

const ROUTING_KEYS = new Set(["teamId", "team_id"]);

/**
 * Translate known camelCase request keys into snake_case for B8 endpoints.
 * Any unmapped keys (such as forbidden stream-key fields) are preserved so upstream
 * Pydantic `extra="forbid"` rejects them with HTTP 422 rather than silently dropping them.
 */
export function toUpstreamPayload(rawBody: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawBody)) {
    if (ROUTING_KEYS.has(key)) continue;
    const mappedKey = KEY_TO_SNAKE[key] ?? key;
    if (mappedKey === "hardware_health" && value && typeof value === "object" && !Array.isArray(value)) {
      out[mappedKey] = toUpstreamPayload(value as Record<string, unknown>);
    } else {
      out[mappedKey] = value;
    }
  }
  return out;
}
