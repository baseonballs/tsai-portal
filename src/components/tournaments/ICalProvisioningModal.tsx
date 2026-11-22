"use client";

import React, { useState } from "react";
import {
  parseICalFeed,
  provisionTournamentSheetsFromICal,
  type ProvisioningReport,
} from "@/lib/tournament/ical-tournament-provisioner";
import { createTournamentSheet } from "@/lib/tournament/tournament-api-client";
import { type TournamentSheet } from "./multi-sheet-types";

interface ICalProvisioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string | null;
  tournamentId?: string | null;
  existingSheetNumbers?: number[];
  emergencyGlobalAudioMute?: boolean;
  onApplyProvisioning?: (sheets: TournamentSheet[]) => void;
  onSheetsApplied?: () => void | Promise<void>;
}

function ICalProvisioningModalInner({
  onClose,
  teamId = null,
  tournamentId = null,
  existingSheetNumbers = [],
  emergencyGlobalAudioMute = false,
  onApplyProvisioning,
  onSheetsApplied,
}: Omit<ICalProvisioningModalProps, "isOpen">) {
  const [icalText, setIcalText] = useState("");
  const [provisionReport, setProvisionReport] = useState<ProvisioningReport | null>(null);
  const [rinkNameOverrides, setRinkNameOverrides] = useState<Record<number, string>>({});
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const handleParseIcalInput = (text: string) => {
    setIcalText(text);
    setApplyError(null);
    setRinkNameOverrides({});
    if (!text.trim()) {
      setProvisionReport(null);
      return;
    }
    const events = parseICalFeed(text);
    setProvisionReport(provisionTournamentSheetsFromICal(events));
  };

  const existingSet = new Set(existingSheetNumbers);
  const candidateSheets = provisionReport
    ? provisionReport.sheets.filter(
        (s) => Number.isInteger(s.sheetNumber) && !existingSet.has(s.sheetNumber),
      )
    : [];

  const effectiveRinkName = (sheet: TournamentSheet): string =>
    (rinkNameOverrides[sheet.sheetNumber] ?? sheet.rinkName).trim();

  const readySheets = candidateSheets.filter((sheet) => effectiveRinkName(sheet).length > 0);
  const canApply = Boolean(teamId && tournamentId && readySheets.length > 0 && !applying);

  const handleApply = async () => {
    if (!teamId || !tournamentId || readySheets.length === 0) return;
    setApplying(true);
    setApplyError(null);
    const created: TournamentSheet[] = [];
    try {
      for (const sheet of readySheets) {
        const saved = await createTournamentSheet(teamId, tournamentId, {
          sheetNumber: sheet.sheetNumber,
          rinkName: effectiveRinkName(sheet),
          streamState: "UNINITIALIZED",
          activeAngle: "TACTICAL_PRIMARY",
          isPublicShowcase: false,
          acousticShieldMuted: Boolean(emergencyGlobalAudioMute),
        });
        created.push(saved);
      }
      await onSheetsApplied?.();
      onApplyProvisioning?.(created);
      onClose();
    } catch (err) {
      if (created.length > 0) {
        await onSheetsApplied?.();
      }
      setApplyError(err instanceof Error ? err.message : "Could not provision sheets from iCal.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0B0F17] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white">iCal Tournament Sheet Provisioner</h3>
            <p className="text-xs text-slate-400">
              Parse an RFC 5545 .ics schedule to detect conflicts and create missing tournament rink sheets.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        </div>

        {applyError && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-950/50 p-2.5 text-xs text-rose-200">
            {applyError}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">iCalendar Feed (.ics text)</span>
            {!tournamentId && (
              <span className="text-[11px] text-amber-400">Select or create a tournament before applying.</span>
            )}
          </div>

          <textarea
            rows={6}
            value={icalText}
            onChange={(e) => handleParseIcalInput(e.target.value)}
            placeholder="Paste VCALENDAR / VEVENT data here..."
            className="w-full rounded-xl border border-slate-800 bg-[#121824] p-3 text-xs font-mono text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
          />

          {provisionReport && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Events Parsed:</span>
                <span className="text-white font-bold">{provisionReport.totalEventsParsed}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">New Mapped Sheets Ready:</span>
                <span className="text-cyan-400 font-bold">{readySheets.length}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Unmapped Events (no explicit sheet #):</span>
                <span className={provisionReport.unmappedEventsCount > 0 ? "text-amber-300 font-bold" : "text-slate-300 font-bold"}>
                  {provisionReport.unmappedEventsCount}
                </span>
              </div>

              {candidateSheets.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-300">
                    New Sheets to Create (LOCATION preserved verbatim — edit if needed):
                  </div>
                  {candidateSheets.map((sheet) => (
                    <div key={sheet.sheetNumber} className="flex items-center gap-2">
                      <span className="w-16 shrink-0 font-mono text-[11px] text-cyan-400">Sheet #{sheet.sheetNumber}</span>
                      <input
                        type="text"
                        value={rinkNameOverrides[sheet.sheetNumber] ?? sheet.rinkName}
                        onChange={(e) =>
                          setRinkNameOverrides((prev) => ({
                            ...prev,
                            [sheet.sheetNumber]: e.target.value,
                          }))
                        }
                        placeholder="Enter rink name (required)"
                        className="flex-1 rounded-lg border border-slate-700 bg-[#0B0F17] px-2.5 py-1 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {provisionReport.unmappedEventsCount > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-2 text-amber-200 text-[11px] space-y-1">
                  <div className="font-semibold">
                    {provisionReport.unmappedEventsCount} event(s) have no explicit sheet/rink number (1–16) and will not be provisioned:
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-amber-300/90">
                    {provisionReport.unmappedEvents.slice(0, 5).map((ev) => (
                      <li key={ev.uid} className="truncate">
                        {ev.summary} {ev.location ? `(${ev.location})` : "(no LOCATION)"}
                      </li>
                    ))}
                    {provisionReport.unmappedEvents.length > 5 && (
                      <li>…and {provisionReport.unmappedEvents.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}

              {provisionReport.conflictsDetected.length > 0 ? (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 text-[11px]">
                  ⚠️ {provisionReport.conflictsDetected.length} sheet scheduling conflict(s) detected!
                </div>
              ) : (
                <div className="text-emerald-400 text-[11px] font-semibold">
                  ✓ Zero scheduling conflicts detected across mapped sheets.
                </div>
              )}

              {provisionReport.totalEventsParsed > 0 &&
                provisionReport.sheetsProvisionedCount > 0 &&
                candidateSheets.length === 0 && (
                  <div className="text-amber-300 text-[11px]">
                    All mapped sheet numbers from this calendar already exist on the selected tournament.
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canApply}
            onClick={handleApply}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            {applying ? "Applying Sheets..." : `Apply ${readySheets.length || ""} Sheet(s)`.trim()}
          </button>
        </div>
      </div>
    </div>
  );
}

export const ICalProvisioningModal: React.FC<ICalProvisioningModalProps> = (props) => {
  if (!props.isOpen) return null;
  return (
    <ICalProvisioningModalInner
      onClose={props.onClose}
      teamId={props.teamId}
      tournamentId={props.tournamentId}
      existingSheetNumbers={props.existingSheetNumbers}
      emergencyGlobalAudioMute={props.emergencyGlobalAudioMute}
      onApplyProvisioning={props.onApplyProvisioning}
      onSheetsApplied={props.onSheetsApplied}
    />
  );
};
