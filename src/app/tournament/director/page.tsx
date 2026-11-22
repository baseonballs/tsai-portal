"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MultiSheetCommandCenter, type BracketMatch, type TournamentStatus } from "@/components/tournaments/MultiSheetCommandCenter";
import { LiveTournamentBracketView } from "@/components/tournaments/LiveTournamentBracketView";
import { TournamentCreateModal } from "@/components/tournaments/TournamentCreateModal";
import { SheetCreateModal } from "@/components/tournaments/SheetCreateModal";
import { BracketMatchModal } from "@/components/tournaments/BracketMatchModal";
import { useTournamentDirector } from "@/components/tournaments/useTournamentDirector";

export default function TournamentDirectorPage() {
  const director = useTournamentDirector();
  const [isCreateTournamentOpen, setIsCreateTournamentOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<BracketMatch | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  if (director.authState === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-[#0B0F17] p-8 text-center space-y-2">
          <h1 className="text-lg font-bold text-white">Tournament Director</h1>
          <p className="text-xs text-slate-400">Verifying session and team access...</p>
        </div>
      </div>
    );
  }

  if (director.authState === "signed-out") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-[#0B0F17] p-8 text-center space-y-4">
          <h1 className="text-xl font-black text-white uppercase">Tournament Director</h1>
          <p className="text-xs text-slate-400">
            Sign in with an authorized team account to manage tournaments, rink sheets, and live brackets.
          </p>
          <Link
            href="/login?next=/tournament/director"
            className="inline-flex items-center justify-center rounded-lg bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white transition-colors"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0B0F17] px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
              ← Portal Home
            </Link>
            <span className="text-slate-700">|</span>
            <h1 className="text-sm font-black uppercase tracking-wider text-white">Tournament Director</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <select
              aria-label="Select team"
              value={director.selectedTeamId}
              onChange={(e) => director.setSelectedTeamId(e.target.value)}
              disabled={director.teams.length === 0 || director.busy}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200"
            >
              {director.teams.length === 0 ? (
                <option value="">No teams linked</option>
              ) : (
                director.teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.season})
                  </option>
                ))
              )}
            </select>

            <select
              aria-label="Select tournament"
              value={director.selectedTournamentId}
              onChange={(e) => director.setSelectedTournamentId(e.target.value)}
              disabled={director.tournaments.length === 0 || director.busy}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200"
            >
              {director.tournaments.length === 0 ? (
                <option value="">No tournaments</option>
              ) : (
                director.tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>

            {director.detail && (
              <select
                aria-label="Tournament status"
                value={director.detail.status}
                disabled={director.busy}
                onChange={(e) => void director.handleUpdateTournamentStatus(e.target.value as TournamentStatus)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-200"
              >
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}

            <button
              type="button"
              disabled={!director.selectedTeamId || Boolean(director.entitlementError) || director.busy}
              onClick={() => setIsCreateTournamentOpen(true)}
              className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 font-bold text-white disabled:opacity-50"
            >
              + New Tournament
            </button>

            {director.detail && (
              <button
                type="button"
                disabled={director.busy}
                onClick={() => void director.handleDeleteTournament()}
                className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-1.5 font-semibold text-rose-300 hover:bg-rose-900/50 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {director.error && (
          <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200">
            <span>{director.error}</span>
            <button type="button" onClick={director.clearError} className="font-bold text-rose-300 hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {director.teamsError ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-8 text-center space-y-3">
            <p className="font-semibold text-white text-sm">Could not load your teams</p>
            <p className="text-xs text-rose-200">{director.teamsError}</p>
            <button
              type="button"
              onClick={director.retryTeams}
              className="rounded-lg bg-rose-500/20 border border-rose-400/40 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
            >
              Retry
            </button>
          </div>
        ) : director.teams.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0B0F17] p-8 text-center text-sm text-slate-400">
            <p className="font-semibold text-white">No teams linked to your account</p>
            <p className="mt-1 text-xs">Ask a team manager or administrator to add you to a team.</p>
          </div>
        ) : director.entitlementError ? (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-8 text-center space-y-3">
            <p className="font-semibold text-white text-sm">Teams plan entitlement required</p>
            <p className="text-xs text-amber-200">{director.entitlementError}</p>
            <Link
              href="/pricing"
              className="inline-flex rounded-lg bg-amber-500/20 border border-amber-400/40 px-4 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/30"
            >
              View Plans
            </Link>
          </div>
        ) : director.loadingList ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0B0F17] p-8 text-center text-xs text-slate-400">
            Loading tournaments...
          </div>
        ) : director.listError ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-8 text-center space-y-3">
            <p className="font-semibold text-white text-sm">Could not load tournaments</p>
            <p className="text-xs text-rose-200">{director.listError}</p>
            <button
              type="button"
              onClick={director.retryList}
              className="rounded-lg bg-rose-500/20 border border-rose-400/40 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
            >
              Retry
            </button>
          </div>
        ) : director.loadingDetail ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0B0F17] p-8 text-center text-xs text-slate-400">
            Loading tournament details...
          </div>
        ) : director.detailError ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-8 text-center space-y-3">
            <p className="font-semibold text-white text-sm">Could not load tournament details</p>
            <p className="text-xs text-rose-200">{director.detailError}</p>
            <button
              type="button"
              onClick={director.retryDetail}
              className="rounded-lg bg-rose-500/20 border border-rose-400/40 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
            >
              Retry
            </button>
          </div>
        ) : !director.detail ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0B0F17] p-8 text-center space-y-3">
            <p className="font-semibold text-white text-sm">No tournaments created for this team yet</p>
            <p className="text-xs text-slate-400">
              Create your first tournament to provision rink sheets, import iCal schedules, and manage brackets.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateTournamentOpen(true)}
              className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white"
            >
              + Create Tournament
            </button>
          </div>
        ) : (
          <>
            <MultiSheetCommandCenter
              sheets={director.detail.sheets}
              matches={director.detail.matches}
              teamId={director.selectedTeamId}
              tournamentId={director.detail.id}
              tournamentName={director.detail.name}
              venueName={director.detail.venueName}
              emergencyGlobalAudioMute={director.detail.emergencyGlobalAudioMute}
              busy={director.busy}
              selectedSheetId={director.selectedSheetId}
              onSelectSheet={director.setSelectedSheetId}
              onToggleGlobalMute={director.handleToggleGlobalMute}
              onChangeSheetAngle={director.handleChangeSheetAngle}
              onToggleSheetMute={director.handleToggleSheetMute}
              onDeleteSheet={director.handleDeleteSheet}
              onOpenCreateSheet={() => setIsCreateSheetOpen(true)}
              onSheetsApplied={director.refreshDetail}
            />
            <LiveTournamentBracketView
              matches={director.detail.matches}
              sheets={director.detail.sheets}
              tournamentId={director.detail.id}
              busy={director.busy}
              onSelectMatchSheet={director.setSelectedSheetId}
              onAddMatch={() => {
                setEditingMatch(null);
                setIsMatchModalOpen(true);
              }}
              onEditMatch={(m) => {
                setEditingMatch(m);
                setIsMatchModalOpen(true);
              }}
            />
          </>
        )}
      </div>

      <TournamentCreateModal
        isOpen={isCreateTournamentOpen}
        busy={director.busy}
        onClose={() => setIsCreateTournamentOpen(false)}
        onCreate={director.handleCreateTournament}
      />

      <SheetCreateModal
        isOpen={isCreateSheetOpen}
        busy={director.busy}
        existingSheetNumbers={director.detail?.sheets.map((s) => s.sheetNumber) ?? []}
        onClose={() => setIsCreateSheetOpen(false)}
        onCreate={director.handleCreateSheet}
      />

      <BracketMatchModal
        isOpen={isMatchModalOpen}
        busy={director.busy}
        match={editingMatch}
        sheets={director.detail?.sheets ?? []}
        matches={director.detail?.matches ?? []}
        onClose={() => setIsMatchModalOpen(false)}
        onDelete={director.handleDeleteMatch}
        onSave={async (input, existingId) => {
          if (existingId) {
            await director.handleUpdateMatch(existingId, input);
          } else {
            await director.handleCreateMatch(input);
          }
        }}
      />
    </div>
  );
}
