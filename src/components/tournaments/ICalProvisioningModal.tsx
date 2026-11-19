"use client";

import React, { useState } from "react";
import {
  parseICalFeed,
  provisionTournamentSheetsFromICal,
  type ProvisioningReport,
} from "@/lib/tournament/ical-tournament-provisioner";
import { type TournamentSheet } from "./multi-sheet-types";

interface ICalProvisioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProvisioning: (sheets: TournamentSheet[]) => void;
}

export const ICalProvisioningModal: React.FC<ICalProvisioningModalProps> = ({
  isOpen,
  onClose,
  onApplyProvisioning,
}) => {
  const [icalText, setIcalText] = useState("");
  const [provisionReport, setProvisionReport] = useState<ProvisioningReport | null>(null);

  if (!isOpen) return null;

  const handleParseIcalInput = (text: string) => {
    setIcalText(text);
    if (!text.trim()) {
      setProvisionReport(null);
      return;
    }
    const events = parseICalFeed(text);
    const report = provisionTournamentSheetsFromICal(events);
    setProvisionReport(report);
  };

  // GA-030 O-01 (T0.4): stream provisioning is not yet available (no streaming backend), so the
  // parsed schedule is only checked for sheet conflicts and is never applied. The built-in sample
  // calendar (real club names) was deleted. onApplyProvisioning stays in the props for T6.1.
  void onApplyProvisioning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0B0F17] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white">iCal Automated Tournament Provisioner</h3>
            <p className="text-xs text-slate-400">
              Check an RFC 5545 .ics calendar for sheet conflicts. Stream provisioning is not yet available.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">iCalendar Feed (.ics text)</span>
          </div>
          <div
            data-testid="ical-provisioning-unavailable"
            className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-[11px] text-slate-400"
          >
            Stream provisioning: not yet available. Nothing is created or applied from this calendar.
          </div>

          <textarea
            rows={7}
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
                <span className="text-slate-400">Events off the 8 sheets:</span>
                <span className="text-cyan-400 font-bold">{provisionReport.unmappedEventsCount}</span>
              </div>
              {provisionReport.conflictsDetected.length > 0 ? (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 text-[11px]">
                  ⚠️ {provisionReport.conflictsDetected.length} sheet scheduling conflict(s) detected!
                </div>
              ) : (
                <div className="text-emerald-400 text-[11px] font-semibold">
                  ✓ Zero scheduling conflicts detected across 8 sheets.
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
            disabled
            title="Not yet available"
            className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 text-slate-500 cursor-not-allowed"
          >
            Apply (not yet available)
          </button>
        </div>
      </div>
    </div>
  );
};
