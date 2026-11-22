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

const VALID_TOURNAMENT_FORMATS = new Set<TournamentFormat>([
  "single_elimination",
  "pool_play",
  "round_robin",
  "showcase",
]);
const VALID_TOURNAMENT_STATUSES = new Set<TournamentStatus>(["scheduled", "live", "completed", "cancelled"]);
const VALID_STREAM_STATES = new Set<SheetStreamState>([
  "UNINITIALIZED",
  "TESTING",
  "LIVE",
  "PAUSED_INTERMISSION",
  "COMPLETED",
  "ERROR",
]);
const VALID_BROADCAST_ANGLES = new Set<BroadcastAngle>([
  "TACTICAL_PRIMARY",
  "HIGH_ENDZONE_HOME",
  "HIGH_ENDZONE_AWAY",
  "OVERHEAD_TACTICAL",
]);
const VALID_BRACKET_ROUNDS = new Set<BracketRound>([
  "POOL",
  "ROUND_OF_16",
  "QUARTERFINALS",
  "SEMIFINALS",
  "THIRD_PLACE",
  "CHAMPIONSHIP",
]);
const VALID_BRACKET_STATUSES = new Set<BracketMatchStatus>(["UPCOMING", "LIVE", "FINAL", "CANCELLED"]);
const VALID_BRACKET_SIDES = new Set<BracketSide>(["home", "away"]);

function requireObj(v: unknown, context: string): JsonObj {
  if (!v || typeof v !== "object" || Array.isArray(v)) {
    throw new Error(`Invalid ${context}: expected object.`);
  }
  return v as JsonObj;
}

function requireNonEmptyString(v: unknown, field: string): string {
  if (typeof v !== "string" || !v.trim()) {
    throw new Error(`Missing or invalid required string field "${field}".`);
  }
  return v.trim();
}

function requireNumber(v: unknown, field: string): number {
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new Error(`Missing or invalid required number field "${field}".`);
  }
  return v;
}

function requireBoolean(v: unknown, field: string): boolean {
  if (typeof v !== "boolean") {
    throw new Error(`Missing or invalid required boolean field "${field}".`);
  }
  return v;
}

function requireEnum<T extends string>(v: unknown, allowed: Set<T>, field: string): T {
  if (typeof v !== "string" || !allowed.has(v as T)) {
    throw new Error(`Missing or invalid enum value for "${field}": ${String(v)}.`);
  }
  return v as T;
}

function optionalString(v: unknown, field: string): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") {
    throw new Error(`Invalid optional string field "${field}".`);
  }
  return v.trim() || null;
}

function optionalNumber(v: unknown, field: string): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new Error(`Invalid optional number field "${field}".`);
  }
  return v;
}

function optionalBoolean(v: unknown, field: string): boolean | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "boolean") {
    throw new Error(`Invalid optional boolean field "${field}".`);
  }
  return v;
}

function optionalEnum<T extends string>(v: unknown, allowed: Set<T>, field: string): T | null {
  if (v === null || v === undefined) return null;
  return requireEnum(v, allowed, field);
}

export function mapTeamOption(raw: unknown): TeamOption {
  const o = requireObj(raw, "team");
  const org = o.organization === null || o.organization === undefined ? null : requireObj(o.organization, "team.organization");
  return {
    id: requireNonEmptyString(o.id, "team.id"),
    name: requireNonEmptyString(o.name, "team.name"),
    season: requireNonEmptyString(o.season, "team.season"),
    levelOfPlay: optionalString(o.level_of_play ?? o.levelOfPlay, "team.level_of_play"),
    tier: optionalString(o.tier, "team.tier"),
    gender: optionalString(o.gender, "team.gender"),
    organizationName: org ? optionalString(org.name, "team.organization.name") : null,
  };
}

export function mapHardwareHealth(raw: unknown): SheetHardwareHealth | null {
  if (raw === null || raw === undefined) return null;
  const o = requireObj(raw, "hardware_health");
  return {
    temperatureCelsius: optionalNumber(o.temperature_celsius ?? o.temperatureCelsius, "hardware_health.temperature_celsius"),
    droppedFramesCount: optionalNumber(o.dropped_frames_count ?? o.droppedFramesCount, "hardware_health.dropped_frames_count"),
    ispLoadPercentage: optionalNumber(o.isp_load_percentage ?? o.ispLoadPercentage, "hardware_health.isp_load_percentage"),
    thermalThrottled: optionalBoolean(o.thermal_throttled ?? o.thermalThrottled, "hardware_health.thermal_throttled"),
  };
}

export function mapTournamentSheet(raw: unknown): TournamentSheet {
  const o = requireObj(raw, "tournament_sheet");
  const tournamentId = optionalString(o.tournament_id ?? o.tournamentId, "sheet.tournament_id");
  return {
    sheetId: requireNonEmptyString(o.id ?? o.sheetId, "sheet.id"),
    ...(tournamentId ? { tournamentId } : {}),
    sheetNumber: requireNumber(o.sheet_number ?? o.sheetNumber, "sheet.sheet_number"),
    rinkName: requireNonEmptyString(o.rink_name ?? o.rinkName, "sheet.rink_name"),
    streamState: requireEnum(o.stream_state ?? o.streamState, VALID_STREAM_STATES, "sheet.stream_state"),
    activeAngle: requireEnum(o.active_angle ?? o.activeAngle, VALID_BROADCAST_ANGLES, "sheet.active_angle"),
    youtubeBroadcastId: optionalString(o.youtube_broadcast_id ?? o.youtubeBroadcastId, "sheet.youtube_broadcast_id"),
    playbackUrl: optionalString(o.playback_url ?? o.playbackUrl, "sheet.playback_url"),
    bitrateKbps: optionalNumber(o.bitrate_kbps ?? o.bitrateKbps, "sheet.bitrate_kbps"),
    fps: optionalNumber(o.fps, "sheet.fps"),
    hardwareHealth: mapHardwareHealth(o.hardware_health ?? o.hardwareHealth),
    isPublicShowcase: requireBoolean(o.is_public_showcase ?? o.isPublicShowcase, "sheet.is_public_showcase"),
    acousticShieldMuted: requireBoolean(o.acoustic_shield_muted ?? o.acousticShieldMuted, "sheet.acoustic_shield_muted"),
  };
}

export function mapBracketMatch(raw: unknown): BracketMatch {
  const o = requireObj(raw, "bracket_match");
  const tournamentId = optionalString(o.tournament_id ?? o.tournamentId, "match.tournament_id");
  return {
    matchId: requireNonEmptyString(o.id ?? o.matchId, "match.id"),
    ...(tournamentId ? { tournamentId } : {}),
    round: requireEnum(o.round, VALID_BRACKET_ROUNDS, "match.round"),
    matchLabel: requireNonEmptyString(o.match_label ?? o.matchLabel, "match.match_label"),
    sortOrder: requireNumber(o.sort_order ?? o.sortOrder, "match.sort_order"),
    sheetId: optionalString(o.sheet_id ?? o.sheetId, "match.sheet_id"),
    gameId: optionalString(o.game_id ?? o.gameId, "match.game_id"),
    homeTeamName: optionalString(o.home_team_name ?? o.homeTeamName, "match.home_team_name"),
    awayTeamName: optionalString(o.away_team_name ?? o.awayTeamName, "match.away_team_name"),
    homeSeed: optionalNumber(o.home_seed ?? o.homeSeed, "match.home_seed"),
    awaySeed: optionalNumber(o.away_seed ?? o.awaySeed, "match.away_seed"),
    homeScore: optionalNumber(o.home_score ?? o.homeScore, "match.home_score"),
    awayScore: optionalNumber(o.away_score ?? o.awayScore, "match.away_score"),
    status: requireEnum(o.status, VALID_BRACKET_STATUSES, "match.status"),
    period: optionalNumber(o.period, "match.period"),
    clockSeconds: optionalNumber(o.clock_seconds ?? o.clockSeconds, "match.clock_seconds"),
    isOvertime: requireBoolean(o.is_overtime ?? o.isOvertime, "match.is_overtime"),
    winnerSide: optionalEnum(o.winner_side ?? o.winnerSide, VALID_BRACKET_SIDES, "match.winner_side"),
    nextMatchId: optionalString(o.next_match_id ?? o.nextMatchId, "match.next_match_id"),
    nextMatchSlot: optionalEnum(o.next_match_slot ?? o.nextMatchSlot, VALID_BRACKET_SIDES, "match.next_match_slot"),
    startsAt: optionalString(o.starts_at ?? o.startsAt, "match.starts_at"),
  };
}

function mapTournamentCore(o: JsonObj) {
  return {
    id: requireNonEmptyString(o.id, "tournament.id"),
    teamId: requireNonEmptyString(o.team_id ?? o.teamId, "tournament.team_id"),
    seasonId: optionalString(o.season_id ?? o.seasonId, "tournament.season_id"),
    name: requireNonEmptyString(o.name, "tournament.name"),
    venueName: optionalString(o.venue_name ?? o.venueName, "tournament.venue_name"),
    startsOn: optionalString(o.starts_on ?? o.startsOn, "tournament.starts_on"),
    endsOn: optionalString(o.ends_on ?? o.endsOn, "tournament.ends_on"),
    format: requireEnum(o.format, VALID_TOURNAMENT_FORMATS, "tournament.format"),
    status: requireEnum(o.status, VALID_TOURNAMENT_STATUSES, "tournament.status"),
    emergencyGlobalAudioMute: requireBoolean(
      o.emergency_global_audio_mute ?? o.emergencyGlobalAudioMute,
      "tournament.emergency_global_audio_mute",
    ),
    createdAt: requireNonEmptyString(o.created_at ?? o.createdAt, "tournament.created_at"),
    updatedAt: optionalString(o.updated_at ?? o.updatedAt, "tournament.updated_at"),
  };
}

export function mapTournamentSummary(raw: unknown): TournamentSummary {
  const o = requireObj(raw, "tournament_summary");
  return {
    ...mapTournamentCore(o),
    sheetCount: requireNumber(o.sheet_count ?? o.sheetCount, "tournament.sheet_count"),
    matchCount: requireNumber(o.match_count ?? o.matchCount, "tournament.match_count"),
  };
}

export function mapTournamentDetail(raw: unknown): TournamentDetail {
  const o = requireObj(raw, "tournament_detail");
  if (!Array.isArray(o.sheets)) {
    throw new Error('Missing or invalid array field "tournament.sheets".');
  }
  if (!Array.isArray(o.matches)) {
    throw new Error('Missing or invalid array field "tournament.matches".');
  }
  return {
    ...mapTournamentCore(o),
    sheets: o.sheets.map(mapTournamentSheet),
    matches: o.matches.map(mapBracketMatch),
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
