"use client";

import React, { useState } from "react";
import type { BracketMatch, BracketMatchStatus, BracketRound, BracketSide, TournamentSheet } from "./multi-sheet-types";
import type { MatchMutationInput } from "@/lib/tournament/tournament-api-client";

interface BracketMatchModalProps {
  isOpen: boolean;
  busy: boolean;
  match: BracketMatch | null;
  sheets: TournamentSheet[];
  matches: BracketMatch[];
  onClose: () => void;
  onSave: (input: MatchMutationInput & { round: BracketRound; matchLabel: string }, existingMatchId?: string) => Promise<void>;
  onDelete?: (matchId: string) => Promise<void>;
}

const ROUNDS: BracketRound[] = ["POOL", "ROUND_OF_16", "QUARTERFINALS", "SEMIFINALS", "THIRD_PLACE", "CHAMPIONSHIP"];
const STATUSES: BracketMatchStatus[] = ["UPCOMING", "LIVE", "FINAL", "CANCELLED"];

interface MatchFormState {
  round: BracketRound;
  matchLabel: string;
  sheetId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeSeed: string;
  awaySeed: string;
  status: BracketMatchStatus;
  homeScore: string;
  awayScore: string;
  period: string;
  clockSeconds: string;
  winnerSide: BracketSide | "";
  nextMatchId: string;
  nextMatchSlot: BracketSide | "";
}

function initialFormState(match: BracketMatch | null): MatchFormState {
  return {
    round: match?.round ?? "QUARTERFINALS",
    matchLabel: match?.matchLabel ?? "",
    sheetId: match?.sheetId ?? "",
    homeTeamName: match?.homeTeamName ?? "",
    awayTeamName: match?.awayTeamName ?? "",
    homeSeed: match?.homeSeed != null ? String(match.homeSeed) : "",
    awaySeed: match?.awaySeed != null ? String(match.awaySeed) : "",
    status: match?.status ?? "UPCOMING",
    homeScore: match?.homeScore != null ? String(match.homeScore) : "",
    awayScore: match?.awayScore != null ? String(match.awayScore) : "",
    period: match?.period != null ? String(match.period) : "",
    clockSeconds: match?.clockSeconds != null ? String(match.clockSeconds) : "",
    winnerSide: match?.winnerSide ?? "",
    nextMatchId: match?.nextMatchId ?? "",
    nextMatchSlot: match?.nextMatchSlot ?? "",
  };
}

export function BracketMatchModal(props: BracketMatchModalProps) {
  if (!props.isOpen) return null;
  return <BracketMatchModalInner key={props.match?.matchId ?? "new"} {...props} />;
}

function BracketMatchModalInner({ busy, match, sheets, matches, onClose, onSave, onDelete }: BracketMatchModalProps) {
  const [form, setForm] = useState<MatchFormState>(() => initialFormState(match));
  const [localError, setLocalError] = useState<string | null>(null);
  const setField = <K extends keyof MatchFormState>(key: K, val: MatchFormState[K]) => setForm((p) => ({ ...p, [key]: val }));
  const toIntOrNull = (val: string) => {
    if (val.trim() === "") return null;
    const n = Number.parseInt(val, 10);
    return Number.isFinite(n) ? n : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.matchLabel.trim()) return setLocalError("Match label is required.");
    if (Boolean(form.nextMatchId) !== Boolean(form.nextMatchSlot)) {
      return setLocalError("Select both next match and target slot together.");
    }
    setLocalError(null);
    try {
      await onSave(
        {
          round: form.round,
          matchLabel: form.matchLabel.trim(),
          sheetId: form.sheetId || null,
          homeTeamName: form.homeTeamName.trim() || null,
          awayTeamName: form.awayTeamName.trim() || null,
          homeSeed: toIntOrNull(form.homeSeed),
          awaySeed: toIntOrNull(form.awaySeed),
          status: form.status,
          homeScore: toIntOrNull(form.homeScore),
          awayScore: toIntOrNull(form.awayScore),
          period: toIntOrNull(form.period),
          clockSeconds: toIntOrNull(form.clockSeconds),
          winnerSide: form.winnerSide || null,
          nextMatchId: form.nextMatchId || null,
          nextMatchSlot: form.nextMatchSlot || null,
        },
        match?.matchId,
      );
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not save bracket match.");
    }
  };

  const cls = "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white";
  const targetMatches = matches.filter((m) => m.matchId !== match?.matchId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#0B0F17] p-6 shadow-2xl space-y-4 my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white">{match ? `Edit ${match.matchLabel}` : "Add Bracket Match"}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>
        {localError && <div className="rounded-lg border border-rose-500/40 bg-rose-950/50 p-2.5 text-xs text-rose-200">{localError}</div>}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <label className="space-y-1">
            <span className="text-slate-300 font-semibold">Round *</span>
            <select value={form.round} onChange={(e) => setField("round", e.target.value as BracketRound)} className={cls}>
              {ROUNDS.map((r) => <option key={r} value={r}>{r.replaceAll("_", " ")}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-slate-300 font-semibold">Match Label *</span>
            <input type="text" required maxLength={80} value={form.matchLabel} onChange={(e) => setField("matchLabel", e.target.value)} placeholder="QF-1" className={cls} />
          </label>
          <label className="space-y-1">
            <span className="text-slate-300 font-semibold">Home Team</span>
            <input type="text" value={form.homeTeamName} onChange={(e) => setField("homeTeamName", e.target.value)} placeholder="TBD" className={cls} />
          </label>
          <label className="space-y-1">
            <span className="text-slate-300 font-semibold">Away Team</span>
            <input type="text" value={form.awayTeamName} onChange={(e) => setField("awayTeamName", e.target.value)} placeholder="TBD" className={cls} />
          </label>
          <label className="space-y-1">
            <span className="text-slate-300 font-semibold">Home Seed / Score</span>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min={1} placeholder="Seed" value={form.homeSeed} onChange={(e) => setField("homeSeed", e.target.value)} className={cls} />
              <input type="number" min={0} placeholder="Score" value={form.homeScore} onChange={(e) => setField("homeScore", e.target.value)} className={cls} />
            </div>
          </label>
          <label className="space-y-1">
            <span className="text-slate-300 font-semibold">Away Seed / Score</span>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min={1} placeholder="Seed" value={form.awaySeed} onChange={(e) => setField("awaySeed", e.target.value)} className={cls} />
              <input type="number" min={0} placeholder="Score" value={form.awayScore} onChange={(e) => setField("awayScore", e.target.value)} className={cls} />
            </div>
          </label>
          <label className="space-y-1">
            <span className="text-slate-300 font-semibold">Status</span>
            <select value={form.status} onChange={(e) => setField("status", e.target.value as BracketMatchStatus)} className={cls}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-slate-300 font-semibold">Assigned Sheet</span>
            <select value={form.sheetId} onChange={(e) => setField("sheetId", e.target.value)} className={cls}>
              <option value="">Unassigned</option>
              {sheets.map((s) => <option key={s.sheetId} value={s.sheetId}>#{s.sheetNumber} {s.rinkName}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-slate-300 font-semibold">Period / Clock (sec)</span>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min={1} placeholder="Period" value={form.period} onChange={(e) => setField("period", e.target.value)} className={cls} />
              <input type="number" min={0} placeholder="Sec" value={form.clockSeconds} onChange={(e) => setField("clockSeconds", e.target.value)} className={cls} />
            </div>
          </label>
          <label className="space-y-1">
            <span className="text-slate-300 font-semibold">Winner Side</span>
            <select value={form.winnerSide} onChange={(e) => setField("winnerSide", e.target.value as BracketSide | "")} className={cls}>
              <option value="">None</option>
              <option value="home">Home advances</option>
              <option value="away">Away advances</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-slate-300 font-semibold">Feeds Next Match</span>
            <select value={form.nextMatchId} onChange={(e) => setField("nextMatchId", e.target.value)} className={cls}>
              <option value="">None</option>
              {targetMatches.map((m) => <option key={m.matchId} value={m.matchId}>{m.matchLabel} ({m.round})</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-slate-300 font-semibold">Next Match Slot</span>
            <select value={form.nextMatchSlot} onChange={(e) => setField("nextMatchSlot", e.target.value as BracketSide | "")} className={cls}>
              <option value="">None</option>
              <option value="home">Home slot</option>
              <option value="away">Away slot</option>
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {match && onDelete ? (
            <button type="button" disabled={busy} onClick={async () => { try { await onDelete(match.matchId); onClose(); } catch (err) { setLocalError(err instanceof Error ? err.message : "Could not delete match."); } }} className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-300 hover:bg-rose-900/70 disabled:opacity-50">
              Delete Match
            </button>
          ) : <span />}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={busy} className="px-4 py-2 text-xs font-bold rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50">
              {busy ? "Saving..." : match ? "Save Match" : "Create Match"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
