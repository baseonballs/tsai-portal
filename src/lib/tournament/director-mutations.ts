import {
  createTournament,
  createTournamentMatch,
  createTournamentSheet,
  deleteTournament,
  deleteTournamentMatch,
  deleteTournamentSheet,
  updateTournament,
  updateTournamentMatch,
  updateTournamentSheet,
  type CreateSheetInput,
  type CreateTournamentInput,
  type MatchMutationInput,
} from "@/lib/tournament/tournament-api-client";
import type {
  BracketRound,
  BroadcastAngle,
  TournamentDetail,
  TournamentStatus,
  TournamentSummary,
} from "@/components/tournaments/multi-sheet-types";

interface MutationDeps {
  selectedTeamId: string;
  activeDetail: TournamentDetail | null;
  runMutation: (fn: () => Promise<void>, rethrow?: boolean) => Promise<void>;
  loadTournaments: (teamId: string) => Promise<void>;
  applyDetail: (next: TournamentDetail) => void;
  refreshDetail: (teamId?: string, tournamentId?: string) => Promise<void>;
  setSelectedTournamentId: (id: string) => void;
  setTournaments: React.Dispatch<React.SetStateAction<TournamentSummary[]>>;
}

export function buildDirectorMutations({
  selectedTeamId,
  activeDetail,
  runMutation,
  loadTournaments,
  applyDetail,
  refreshDetail,
  setSelectedTournamentId,
  setTournaments,
}: MutationDeps) {
  const withActive = (fn: (teamId: string, d: TournamentDetail) => Promise<void>, rethrow = false) =>
    selectedTeamId && activeDetail ? runMutation(() => fn(selectedTeamId, activeDetail), rethrow) : Promise.resolve();

  return {
    handleCreateTournament: (input: CreateTournamentInput) =>
      selectedTeamId
        ? runMutation(async () => {
            const created = await createTournament(selectedTeamId, input);
            await loadTournaments(selectedTeamId);
            setSelectedTournamentId(created.id);
            applyDetail(created);
          }, true)
        : Promise.resolve(),
    handleUpdateTournamentStatus: (status: TournamentStatus) =>
      withActive(async (tid, d) => {
        const updated = await updateTournament(tid, d.id, { status });
        applyDetail(updated);
        setTournaments((prev) => prev.map((t) => (t.id === updated.id ? { ...t, status: updated.status } : t)));
      }),
    handleDeleteTournament: () =>
      withActive(async (tid, d) => {
        await deleteTournament(tid, d.id);
        await loadTournaments(tid);
      }),
    handleToggleGlobalMute: () =>
      withActive(async (tid, d) => {
        applyDetail(
          await updateTournament(tid, d.id, {
            emergencyGlobalAudioMute: !d.emergencyGlobalAudioMute,
            cascadeAudioMute: true,
          }),
        );
      }),
    handleCreateSheet: (input: CreateSheetInput) =>
      withActive(async (tid, d) => {
        await createTournamentSheet(tid, d.id, {
          ...input,
          acousticShieldMuted: d.emergencyGlobalAudioMute ? true : input.acousticShieldMuted ?? false,
        });
        await refreshDetail(tid, d.id);
      }, true),
    handleChangeSheetAngle: (sheetId: string, activeAngle: BroadcastAngle) =>
      withActive(async (tid, d) => {
        await updateTournamentSheet(tid, d.id, sheetId, { activeAngle });
        await refreshDetail(tid, d.id);
      }),
    handleToggleSheetMute: (sheetId: string, acousticShieldMuted: boolean) =>
      withActive(async (tid, d) => {
        await updateTournamentSheet(tid, d.id, sheetId, { acousticShieldMuted });
        await refreshDetail(tid, d.id);
      }),
    handleDeleteSheet: (sheetId: string) =>
      withActive(async (tid, d) => {
        await deleteTournamentSheet(tid, d.id, sheetId);
        await refreshDetail(tid, d.id);
      }),
    handleCreateMatch: (input: MatchMutationInput & { round: BracketRound; matchLabel: string }) =>
      withActive(async (tid, d) => {
        await createTournamentMatch(tid, d.id, input);
        await refreshDetail(tid, d.id);
      }, true),
    handleUpdateMatch: (matchId: string, input: MatchMutationInput) =>
      withActive(async (tid, d) => {
        await updateTournamentMatch(tid, d.id, matchId, input);
        await refreshDetail(tid, d.id);
      }, true),
    handleDeleteMatch: (matchId: string) =>
      withActive(async (tid, d) => {
        await deleteTournamentMatch(tid, d.id, matchId);
        await refreshDetail(tid, d.id);
      }, true),
  };
}
