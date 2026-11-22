"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchMyTeams,
  fetchTeamTournaments,
  fetchTournamentDetail,
  TournamentApiError,
} from "@/lib/tournament/tournament-api-client";
import { buildDirectorMutations } from "@/lib/tournament/director-mutations";
import type { TeamOption, TournamentDetail, TournamentSummary } from "@/components/tournaments/multi-sheet-types";

export type DirectorAuthState = "loading" | "signed-out" | "ready";

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function useTournamentDirector() {
  const [authState, setAuthState] = useState<DirectorAuthState>("loading");
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [loadedTeamId, setLoadedTeamId] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [detail, setDetail] = useState<TournamentDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedSheetId, setSelectedSheetId] = useState("");
  const [entitlementError, setEntitlementError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadSeq, setReloadSeq] = useState({ teams: 0, list: 0, detail: 0 });

  const applyDetail = useCallback((next: TournamentDetail) => {
    setDetailError(null);
    setDetail(next);
    setSelectedSheetId((prev) =>
      prev && next.sheets.some((s) => s.sheetId === prev) ? prev : next.sheets[0]?.sheetId ?? "",
    );
  }, []);

  const refreshDetail = useCallback(async (teamId = selectedTeamId, tournamentId = selectedTournamentId) => {
    if (!teamId || !tournamentId) {
      setDetail(null);
      return;
    }
    try {
      applyDetail(await fetchTournamentDetail(teamId, tournamentId));
    } catch (err) {
      if (err instanceof TournamentApiError && err.status === 401) {
        setAuthState("signed-out");
      } else {
        setDetailError(toErrorMessage(err, "Unable to load tournament detail."));
      }
    }
  }, [selectedTeamId, selectedTournamentId, applyDetail]);

  const loadTournaments = useCallback(async (teamId: string) => {
    if (!teamId) {
      setTournaments([]);
      setSelectedTournamentId("");
      setDetail(null);
      setLoadedTeamId(null);
      return;
    }
    setLoadingList(true);
    setEntitlementError(null);
    setListError(null);
    setDetailError(null);
    try {
      const list = await fetchTeamTournaments(teamId);
      setTournaments(list);
      setSelectedTournamentId((prev) => (prev && list.some((t) => t.id === prev) ? prev : list[0]?.id ?? ""));
    } catch (err) {
      setTournaments([]);
      setSelectedTournamentId("");
      setDetail(null);
      if (err instanceof TournamentApiError && err.status === 401) setAuthState("signed-out");
      else if (err instanceof TournamentApiError && err.status === 403) setEntitlementError(err.message);
      else setListError(toErrorMessage(err, "Unable to load tournaments."));
    } finally {
      setLoadedTeamId(teamId);
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchMyTeams()
      .then((list) => {
        if (cancelled) return;
        setTeamsError(null);
        setTeams(list);
        setSelectedTeamId((prev) => (prev && list.some((t) => t.id === prev) ? prev : list[0]?.id ?? ""));
        setAuthState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof TournamentApiError && err.status === 401) {
          setAuthState("signed-out");
        } else {
          setTeamsError(toErrorMessage(err, "Unable to load your teams."));
          setAuthState("ready");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadSeq.teams]);

  useEffect(() => {
    if (authState !== "ready" || !selectedTeamId) return;
    let cancelled = false;
    fetchTeamTournaments(selectedTeamId)
      .then((list) => {
        if (cancelled) return;
        setEntitlementError(null);
        setListError(null);
        setTournaments(list);
        setSelectedTournamentId((prev) => (prev && list.some((t) => t.id === prev) ? prev : list[0]?.id ?? ""));
        setLoadedTeamId(selectedTeamId);
        setLoadingList(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setTournaments([]);
        setSelectedTournamentId("");
        setDetail(null);
        setLoadedTeamId(selectedTeamId);
        setLoadingList(false);
        if (err instanceof TournamentApiError && err.status === 401) setAuthState("signed-out");
        else if (err instanceof TournamentApiError && err.status === 403) setEntitlementError(err.message);
        else setListError(toErrorMessage(err, "Unable to load tournaments."));
      });
    return () => {
      cancelled = true;
    };
  }, [authState, selectedTeamId, reloadSeq.list]);

  useEffect(() => {
    if (authState !== "ready" || !selectedTeamId || !selectedTournamentId) return;
    let cancelled = false;
    fetchTournamentDetail(selectedTeamId, selectedTournamentId)
      .then((next) => {
        if (!cancelled) applyDetail(next);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof TournamentApiError && err.status === 401) setAuthState("signed-out");
        else setDetailError(toErrorMessage(err, "Unable to load tournament detail."));
      });
    return () => {
      cancelled = true;
    };
  }, [authState, selectedTeamId, selectedTournamentId, reloadSeq.detail, applyDetail]);

  const handleSelectTeam = useCallback((teamId: string) => {
    setSelectedTeamId(teamId);
    setSelectedTournamentId("");
    setDetail(null);
    setEntitlementError(null);
    setListError(null);
    setDetailError(null);
    setLoadedTeamId(null);
  }, []);

  const handleSelectTournament = useCallback((tournamentId: string) => {
    setSelectedTournamentId(tournamentId);
    setDetailError(null);
  }, []);

  const activeDetail = detail && detail.id === selectedTournamentId ? detail : null;
  const isLoadingList =
    loadingList || (authState === "ready" && Boolean(selectedTeamId) && !entitlementError && loadedTeamId !== selectedTeamId);
  const isLoadingDetail =
    authState === "ready" &&
    Boolean(selectedTeamId) &&
    Boolean(selectedTournamentId) &&
    !entitlementError &&
    !listError &&
    !detailError &&
    activeDetail === null;

  const runMutation = useCallback(async (fn: () => Promise<void>, rethrow = false) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      if (err instanceof TournamentApiError && err.status === 401) setAuthState("signed-out");
      else setError(toErrorMessage(err, "Action failed."));
      if (rethrow) throw err;
    } finally {
      setBusy(false);
    }
  }, []);

  const mutations = buildDirectorMutations({
    selectedTeamId,
    activeDetail,
    runMutation,
    loadTournaments,
    applyDetail,
    refreshDetail,
    setSelectedTournamentId,
    setTournaments,
  });

  return {
    authState,
    teams,
    teamsError,
    selectedTeamId,
    setSelectedTeamId: handleSelectTeam,
    tournaments,
    listError,
    selectedTournamentId,
    setSelectedTournamentId: handleSelectTournament,
    detail: activeDetail,
    detailError,
    selectedSheetId,
    setSelectedSheetId,
    entitlementError,
    loadingList: isLoadingList,
    loadingDetail: isLoadingDetail,
    busy,
    error,
    clearError: () => setError(null),
    retryTeams: () => {
      setTeamsError(null);
      setAuthState("loading");
      setReloadSeq((s) => ({ ...s, teams: s.teams + 1 }));
    },
    retryList: () => {
      setListError(null);
      setLoadedTeamId(null);
      setReloadSeq((s) => ({ ...s, list: s.list + 1 }));
    },
    retryDetail: () => {
      setDetailError(null);
      setDetail(null);
      setReloadSeq((s) => ({ ...s, detail: s.detail + 1 }));
    },
    refreshDetail: () => refreshDetail(selectedTeamId, selectedTournamentId),
    ...mutations,
  };
}
