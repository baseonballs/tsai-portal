"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createTournament,
  createTournamentMatch,
  createTournamentSheet,
  deleteTournament,
  deleteTournamentMatch,
  deleteTournamentSheet,
  fetchMyTeams,
  fetchTeamTournaments,
  fetchTournamentDetail,
  TournamentApiError,
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
  TeamOption,
  TournamentDetail,
  TournamentStatus,
  TournamentSummary,
} from "@/components/tournaments/multi-sheet-types";

export type DirectorAuthState = "loading" | "signed-out" | "ready";

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function useTournamentDirector() {
  const [authState, setAuthState] = useState<DirectorAuthState>("loading");
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [detail, setDetail] = useState<TournamentDetail | null>(null);
  const [selectedSheetId, setSelectedSheetId] = useState("");
  const [entitlementError, setEntitlementError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyApiError = useCallback((err: unknown, fallback: string, handleForbidden = false) => {
    if (err instanceof TournamentApiError && err.status === 401) {
      setAuthState("signed-out");
    } else if (handleForbidden && err instanceof TournamentApiError && err.status === 403) {
      setEntitlementError(err.message);
    } else {
      setError(toErrorMessage(err, fallback));
    }
  }, []);

  const applyDetail = useCallback((next: TournamentDetail) => {
    setDetail(next);
    setSelectedSheetId((prev) =>
      prev && next.sheets.some((s) => s.sheetId === prev) ? prev : next.sheets[0]?.sheetId ?? "",
    );
  }, []);

  const loadTournaments = useCallback(async (teamId: string) => {
    if (!teamId) {
      setTournaments([]);
      setSelectedTournamentId("");
      setDetail(null);
      return;
    }
    setLoadingList(true);
    setEntitlementError(null);
    setError(null);
    try {
      const list = await fetchTeamTournaments(teamId);
      setTournaments(list);
      setSelectedTournamentId((prev) => (prev && list.some((t) => t.id === prev) ? prev : list[0]?.id ?? ""));
    } catch (err) {
      setTournaments([]);
      setSelectedTournamentId("");
      setDetail(null);
      applyApiError(err, "Unable to load tournaments.", true);
    } finally {
      setLoadingList(false);
    }
  }, [applyApiError]);

  const refreshDetail = useCallback(async (teamId = selectedTeamId, tournamentId = selectedTournamentId) => {
    if (!teamId || !tournamentId) {
      setDetail(null);
      return;
    }
    try {
      applyDetail(await fetchTournamentDetail(teamId, tournamentId));
    } catch (err) {
      applyApiError(err, "Unable to load tournament detail.");
    }
  }, [selectedTeamId, selectedTournamentId, applyDetail, applyApiError]);

  useEffect(() => {
    let cancelled = false;
    fetchMyTeams()
      .then((list) => {
        if (cancelled) return;
        setTeams(list);
        setSelectedTeamId((prev) => (prev && list.some((t) => t.id === prev) ? prev : list[0]?.id ?? ""));
        setAuthState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof TournamentApiError && err.status === 401) {
          setAuthState("signed-out");
        } else {
          setAuthState("ready");
          setError(toErrorMessage(err, "Unable to load your teams."));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authState !== "ready" || !selectedTeamId) return;
    let cancelled = false;
    fetchTeamTournaments(selectedTeamId)
      .then((list) => {
        if (cancelled) return;
        setEntitlementError(null);
        setError(null);
        setTournaments(list);
        setSelectedTournamentId((prev) => (prev && list.some((t) => t.id === prev) ? prev : list[0]?.id ?? ""));
        setLoadingList(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setTournaments([]);
        setSelectedTournamentId("");
        setDetail(null);
        setLoadingList(false);
        applyApiError(err, "Unable to load tournaments.", true);
      });
    return () => {
      cancelled = true;
    };
  }, [authState, selectedTeamId, applyApiError]);

  useEffect(() => {
    if (authState !== "ready" || !selectedTeamId || !selectedTournamentId) return;
    let cancelled = false;
    fetchTournamentDetail(selectedTeamId, selectedTournamentId)
      .then((next) => {
        if (!cancelled) applyDetail(next);
      })
      .catch((err) => {
        if (!cancelled) applyApiError(err, "Unable to load tournament detail.");
      });
    return () => {
      cancelled = true;
    };
  }, [authState, selectedTeamId, selectedTournamentId, applyDetail, applyApiError]);

  const handleSelectTeam = useCallback((teamId: string) => {
    setSelectedTeamId(teamId);
    setSelectedTournamentId("");
    setDetail(null);
    setEntitlementError(null);
    setLoadingList(Boolean(teamId));
  }, []);

  const activeDetail = detail && detail.id === selectedTournamentId ? detail : null;

  const runMutation = useCallback(async (fn: () => Promise<void>, rethrow = false) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      applyApiError(err, "Action failed.");
      if (rethrow) throw err;
    } finally {
      setBusy(false);
    }
  }, [applyApiError]);

  const withActiveDetail = useCallback(
    (fn: (teamId: string, d: TournamentDetail) => Promise<void>, rethrow = false) => {
      if (!selectedTeamId || !activeDetail) return Promise.resolve();
      return runMutation(() => fn(selectedTeamId, activeDetail), rethrow);
    },
    [selectedTeamId, activeDetail, runMutation],
  );

  const handleCreateTournament = useCallback(
    (input: CreateTournamentInput) =>
      selectedTeamId
        ? runMutation(async () => {
            const created = await createTournament(selectedTeamId, input);
            await loadTournaments(selectedTeamId);
            setSelectedTournamentId(created.id);
            applyDetail(created);
          }, true)
        : Promise.resolve(),
    [selectedTeamId, runMutation, loadTournaments, applyDetail],
  );

  return {
    authState,
    teams,
    selectedTeamId,
    setSelectedTeamId: handleSelectTeam,
    tournaments,
    selectedTournamentId,
    setSelectedTournamentId,
    detail: activeDetail,
    selectedSheetId,
    setSelectedSheetId,
    entitlementError,
    loadingList,
    busy,
    error,
    clearError: () => setError(null),
    refreshDetail: () => refreshDetail(selectedTeamId, selectedTournamentId),
    handleCreateTournament,
    handleUpdateTournamentStatus: (status: TournamentStatus) =>
      withActiveDetail(async (tid, d) => {
        const updated = await updateTournament(tid, d.id, { status });
        applyDetail(updated);
        setTournaments((prev) => prev.map((t) => (t.id === updated.id ? { ...t, status: updated.status } : t)));
      }),
    handleDeleteTournament: () =>
      withActiveDetail(async (tid, d) => {
        await deleteTournament(tid, d.id);
        await loadTournaments(tid);
      }),
    handleToggleGlobalMute: () =>
      withActiveDetail(async (tid, d) => {
        applyDetail(
          await updateTournament(tid, d.id, {
            emergencyGlobalAudioMute: !d.emergencyGlobalAudioMute,
            cascadeAudioMute: true,
          }),
        );
      }),
    handleCreateSheet: (input: CreateSheetInput) =>
      withActiveDetail(async (tid, d) => {
        await createTournamentSheet(tid, d.id, {
          ...input,
          acousticShieldMuted: d.emergencyGlobalAudioMute ? true : input.acousticShieldMuted ?? false,
        });
        await refreshDetail(tid, d.id);
      }, true),
    handleChangeSheetAngle: (sheetId: string, activeAngle: BroadcastAngle) =>
      withActiveDetail(async (tid, d) => {
        await updateTournamentSheet(tid, d.id, sheetId, { activeAngle });
        await refreshDetail(tid, d.id);
      }),
    handleToggleSheetMute: (sheetId: string, acousticShieldMuted: boolean) =>
      withActiveDetail(async (tid, d) => {
        await updateTournamentSheet(tid, d.id, sheetId, { acousticShieldMuted });
        await refreshDetail(tid, d.id);
      }),
    handleDeleteSheet: (sheetId: string) =>
      withActiveDetail(async (tid, d) => {
        await deleteTournamentSheet(tid, d.id, sheetId);
        await refreshDetail(tid, d.id);
      }),
    handleCreateMatch: (input: MatchMutationInput & { round: BracketRound; matchLabel: string }) =>
      withActiveDetail(async (tid, d) => {
        await createTournamentMatch(tid, d.id, input);
        await refreshDetail(tid, d.id);
      }, true),
    handleUpdateMatch: (matchId: string, input: MatchMutationInput) =>
      withActiveDetail(async (tid, d) => {
        await updateTournamentMatch(tid, d.id, matchId, input);
        await refreshDetail(tid, d.id);
      }, true),
    handleDeleteMatch: (matchId: string) =>
      withActiveDetail(async (tid, d) => {
        await deleteTournamentMatch(tid, d.id, matchId);
        await refreshDetail(tid, d.id);
      }, true),
  };
}
