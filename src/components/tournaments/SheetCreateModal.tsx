"use client";

import React, { useState } from "react";
import type { BroadcastAngle } from "./multi-sheet-types";
import type { CreateSheetInput } from "@/lib/tournament/tournament-api-client";

interface SheetCreateModalProps {
  isOpen: boolean;
  busy: boolean;
  existingSheetNumbers: number[];
  onClose: () => void;
  onCreate: (input: CreateSheetInput) => Promise<void>;
}

export function SheetCreateModal(props: SheetCreateModalProps) {
  if (!props.isOpen) return null;
  const nextNumber = [1, 2, 3, 4, 5, 6, 7, 8].find((n) => !props.existingSheetNumbers.includes(n)) ?? 1;
  return <SheetCreateModalInner key={nextNumber} defaultSheetNumber={nextNumber} {...props} />;
}

function SheetCreateModalInner({
  busy,
  defaultSheetNumber,
  onClose,
  onCreate,
}: SheetCreateModalProps & { defaultSheetNumber: number }) {
  const [sheetNumber, setSheetNumber] = useState<number>(defaultSheetNumber);
  const [rinkName, setRinkName] = useState("");
  const [activeAngle, setActiveAngle] = useState<BroadcastAngle>("TACTICAL_PRIMARY");
  const [youtubeBroadcastId, setYoutubeBroadcastId] = useState("");
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [isPublicShowcase, setIsPublicShowcase] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rinkName.trim()) {
      setLocalError("Rink name is required.");
      return;
    }
    setLocalError(null);
    try {
      await onCreate({
        sheetNumber,
        rinkName: rinkName.trim(),
        streamState: "UNINITIALIZED",
        activeAngle,
        youtubeBroadcastId: youtubeBroadcastId.trim() || null,
        playbackUrl: playbackUrl.trim() || null,
        isPublicShowcase,
      });
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not add rink sheet.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0B0F17] p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white">Add Rink Sheet</h3>
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
          <div className="grid grid-cols-3 gap-3">
            <label className="block space-y-1">
              <span className="text-slate-300 font-semibold">Sheet # *</span>
              <input
                type="number"
                min={1}
                max={16}
                required
                value={sheetNumber}
                onChange={(e) => setSheetNumber(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </label>
            <label className="col-span-2 block space-y-1">
              <span className="text-slate-300 font-semibold">Rink Name *</span>
              <input
                type="text"
                required
                maxLength={150}
                value={rinkName}
                onChange={(e) => setRinkName(e.target.value)}
                placeholder="Sheet 1 - Main Rink"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-slate-300 font-semibold">Default Angle</span>
            <select
              value={activeAngle}
              onChange={(e) => setActiveAngle(e.target.value as BroadcastAngle)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            >
              <option value="TACTICAL_PRIMARY">Tactical Center</option>
              <option value="HIGH_ENDZONE_HOME">Endzone Home</option>
              <option value="HIGH_ENDZONE_AWAY">Endzone Away</option>
              <option value="OVERHEAD_TACTICAL">Overhead</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-slate-300 font-semibold">YouTube Broadcast ID (optional, 11 chars)</span>
            <input
              type="text"
              maxLength={11}
              value={youtubeBroadcastId}
              onChange={(e) => setYoutubeBroadcastId(e.target.value)}
              placeholder="dQw4w9WgXcQ"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-slate-300 font-semibold">HTTPS Playback URL (optional)</span>
            <input
              type="url"
              maxLength={512}
              value={playbackUrl}
              onChange={(e) => setPlaybackUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-white"
            />
          </label>
          <label className="flex items-center gap-2 text-slate-300 pt-1">
            <input
              type="checkbox"
              checked={isPublicShowcase}
              onChange={(e) => setIsPublicShowcase(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900"
            />
            <span>Designate as public showcase sheet</span>
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
            {busy ? "Adding..." : "Add Sheet"}
          </button>
        </div>
      </form>
    </div>
  );
}
