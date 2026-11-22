import type {
  BracketMatch,
  BracketMatchStatus,
  BracketRound,
  BracketSide,
  BroadcastAngle,
  SheetStreamState,
  TeamOption,
  TournamentDetail,
  TournamentFormat,
  TournamentSheet,
  TournamentStatus,
  TournamentSummary,
} from "@/components/tournaments/multi-sheet-types";

export class TournamentApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "TournamentApiError";
    this.status = status;
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store" });
  if (res.status === 204) {
    return undefined as T;
  }
  const parsed = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      parsed && typeof parsed === "object" && "error" in parsed && typeof parsed.error === "string"
        ? parsed.error
        : `Request failed (${res.status})`;
    throw new TournamentApiError(res.status, message);
  }
  return parsed as T;
}

export async function fetchMyTeams(): Promise<TeamOption[]> {
  const data = await requestJson<{ teams: TeamOption[] }>("/api/tournaments/teams");
  return Array.isArray(data.teams) ? data.teams : [];
}

export async function fetchTeamTournaments(teamId: string): Promise<TournamentSummary[]> {
  const qs = new URLSearchParams({ teamId });
  const data = await requestJson<{ tournaments: TournamentSummary[] }>(`/api/tournaments?${qs.toString()}`);
  return Array.isArray(data.tournaments) ? data.tournaments : [];
}

export interface CreateTournamentInput {
  name: string;
  venueName?: string | null;
  startsOn?: string | null;
  endsOn?: string | null;
  format?: TournamentFormat;
  status?: TournamentStatus;
}

export async function createTournament(teamId: string, input: CreateTournamentInput): Promise<TournamentDetail> {
  return requestJson<TournamentDetail>("/api/tournaments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId, ...input }),
  });
}

export async function fetchTournamentDetail(teamId: string, tournamentId: string): Promise<TournamentDetail> {
  const qs = new URLSearchParams({ teamId });
  return requestJson<TournamentDetail>(`/api/tournaments/${encodeURIComponent(tournamentId)}?${qs.toString()}`);
}

export interface UpdateTournamentInput {
  name?: string;
  venueName?: string | null;
  startsOn?: string | null;
  endsOn?: string | null;
  format?: TournamentFormat;
  status?: TournamentStatus;
  emergencyGlobalAudioMute?: boolean;
  cascadeAudioMute?: boolean;
}

export async function updateTournament(
  teamId: string,
  tournamentId: string,
  input: UpdateTournamentInput,
): Promise<TournamentDetail> {
  return requestJson<TournamentDetail>(`/api/tournaments/${encodeURIComponent(tournamentId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId, ...input }),
  });
}

export async function deleteTournament(teamId: string, tournamentId: string): Promise<void> {
  const qs = new URLSearchParams({ teamId });
  await requestJson<void>(`/api/tournaments/${encodeURIComponent(tournamentId)}?${qs.toString()}`, {
    method: "DELETE",
  });
}

export interface CreateSheetInput {
  sheetNumber: number;
  rinkName: string;
  streamState?: SheetStreamState;
  activeAngle?: BroadcastAngle;
  youtubeBroadcastId?: string | null;
  playbackUrl?: string | null;
  isPublicShowcase?: boolean;
  acousticShieldMuted?: boolean;
}

export async function createTournamentSheet(
  teamId: string,
  tournamentId: string,
  input: CreateSheetInput,
): Promise<TournamentSheet> {
  return requestJson<TournamentSheet>(`/api/tournaments/${encodeURIComponent(tournamentId)}/sheets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId, ...input }),
  });
}

export interface UpdateSheetInput {
  sheetNumber?: number;
  rinkName?: string;
  streamState?: SheetStreamState;
  activeAngle?: BroadcastAngle;
  youtubeBroadcastId?: string | null;
  playbackUrl?: string | null;
  isPublicShowcase?: boolean;
  acousticShieldMuted?: boolean;
}

export async function updateTournamentSheet(
  teamId: string,
  tournamentId: string,
  sheetId: string,
  input: UpdateSheetInput,
): Promise<TournamentSheet> {
  return requestJson<TournamentSheet>(
    `/api/tournaments/${encodeURIComponent(tournamentId)}/sheets/${encodeURIComponent(sheetId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, ...input }),
    },
  );
}

export async function deleteTournamentSheet(teamId: string, tournamentId: string, sheetId: string): Promise<void> {
  const qs = new URLSearchParams({ teamId });
  await requestJson<void>(
    `/api/tournaments/${encodeURIComponent(tournamentId)}/sheets/${encodeURIComponent(sheetId)}?${qs.toString()}`,
    { method: "DELETE" },
  );
}

export interface MatchMutationInput {
  sheetId?: string | null;
  round?: BracketRound;
  matchLabel?: string;
  sortOrder?: number;
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  homeSeed?: number | null;
  awaySeed?: number | null;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: BracketMatchStatus;
  period?: number | null;
  clockSeconds?: number | null;
  isOvertime?: boolean;
  winnerSide?: BracketSide | null;
  nextMatchId?: string | null;
  nextMatchSlot?: BracketSide | null;
  startsAt?: string | null;
}

export async function createTournamentMatch(
  teamId: string,
  tournamentId: string,
  input: MatchMutationInput & { round: BracketRound; matchLabel: string },
): Promise<BracketMatch> {
  return requestJson<BracketMatch>(`/api/tournaments/${encodeURIComponent(tournamentId)}/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId, ...input }),
  });
}

export async function updateTournamentMatch(
  teamId: string,
  tournamentId: string,
  matchId: string,
  input: MatchMutationInput,
): Promise<BracketMatch> {
  return requestJson<BracketMatch>(
    `/api/tournaments/${encodeURIComponent(tournamentId)}/matches/${encodeURIComponent(matchId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, ...input }),
    },
  );
}

export async function deleteTournamentMatch(teamId: string, tournamentId: string, matchId: string): Promise<void> {
  const qs = new URLSearchParams({ teamId });
  await requestJson<void>(
    `/api/tournaments/${encodeURIComponent(tournamentId)}/matches/${encodeURIComponent(matchId)}?${qs.toString()}`,
    { method: "DELETE" },
  );
}
