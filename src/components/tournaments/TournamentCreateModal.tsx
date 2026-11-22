"use client";

import React, { useState } from "react";
import type { TournamentFormat } from "./multi-sheet-types";
import type { CreateTournamentInput } from "@/lib/tournament/tournament-api-client";

interface TournamentCreateModalProps {
  isOpen: boolean;
  busy: boolean;
  onClose: () => void;
  onCreate: (input: CreateTournamentInput) => Promise<void>;
}

function TournamentCreateModalInner({
  busy,
  onClose,
  onCreate,
}: Omit<TournamentCreateModalProps, "isOpen">) {
  const [name, setName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [format, setFormat] = useState<TournamentFormat>("single_elimination");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError("Tournament name is required.");
      return;
    }
    setLocalError(null);
    try {
      await onCreate({
        name: name.trim(),
        venueName: venueName.trim() || null,
        startsOn: startsOn || null,
        endsOn: endsOn || null,
        format,
      });
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not create tournament.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0B0F17] p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white">Create Tournament</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-lg">
            ✕
          </button>
        </div>

        {localError && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-950/50 p-2.5 text-xs text-rose-200">
            {localError}
          </div>
        )}

        <div className="space-y-3 text-xs">
          <label className="block space-y-1">
            <span className="text-slate-300 font-semibold">Tournament Name *</span>
            <input
              type="text"
              required
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Regional Championship"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-slate-300 font-semibold">Venue Name</span>
            <input
              type="text"
              maxLength={200}
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Ice Complex"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-slate-300 font-semibold">Starts On</span>
              <input
                type="date"
                value={startsOn}
                onChange={(e) => setStartsOn(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-slate-300 font-semibold">Ends On</span>
              <input
                type="date"
                value={endsOn}
                onChange={(e) => setEndsOn(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-slate-300 font-semibold">Format</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as TournamentFormat)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            >
              <option value="single_elimination">Single Elimination</option>
              <option value="pool_play">Pool Play</option>
              <option value="round_robin">Round Robin</option>
              <option value="showcase">Showcase</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {busy ? "Creating..." : "Create Tournament"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function TournamentCreateModal({ isOpen, busy, onClose, onCreate }: TournamentCreateModalProps) {
  if (!isOpen) return null;
  return <TournamentCreateModalInner busy={busy} onClose={onClose} onCreate={onCreate} />;
}
