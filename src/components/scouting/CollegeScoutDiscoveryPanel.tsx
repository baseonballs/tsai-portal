"use client";

import React, { useState, useMemo } from "react";
import type {
  VerifiedProspectPassport,
  ScoutDiscoveryFilter,
  SafeSportInquiryRecord,
} from "./college-scout-types";
import { SafeSportInquiryModal } from "./SafeSportInquiryModal";

interface CollegeScoutDiscoveryPanelProps {
  prospects: VerifiedProspectPassport[];
  onDispatchInquiry?: (inquiry: SafeSportInquiryRecord) => Promise<boolean>;
}

export const CollegeScoutDiscoveryPanel: React.FC<CollegeScoutDiscoveryPanelProps> = ({
  prospects,
  onDispatchInquiry,
}) => {
  const [filters, setFilters] = useState<ScoutDiscoveryFilter>({
    position: "ALL",
    graduationYear: "ALL",
    minVo2Max: 0,
    maxSprint30m: 10,
    maxBilateralImbalance: 25,
    minGpa: 0,
  });

  const [activeProspect, setActiveProspect] = useState<VerifiedProspectPassport | null>(null);

  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      if (filters.position !== "ALL" && p.position !== filters.position) return false;
      if (filters.graduationYear !== "ALL" && p.graduationYear !== filters.graduationYear) return false;
      if (p.verifiedCombine.vo2MaxMlKgMin < filters.minVo2Max) return false;
      if (p.verifiedCombine.sprint30mMetersSec > filters.maxSprint30m) return false;
      if (p.verifiedCombine.bilateralPowerImbalancePercent > filters.maxBilateralImbalance) return false;
      if (p.gpa < filters.minGpa) return false;
      return true;
    });
  }, [prospects, filters]);

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-500/20 px-2.5 py-0.5 text-xs font-semibold text-sky-400">
              Collegiate Scouting Console
            </span>
            <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              SafeSport Guardian-Mediated
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Verified Prospect Discovery
          </h2>
          <p className="text-sm text-slate-400">
            Filtering by objective physical combine biometrics and cryptographically attested clips.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-medium text-slate-400">Matching Prospects:</span>
          <p className="text-xl font-bold text-white">{filteredProspects.length}</p>
        </div>
      </div>

      {/* Combine Threshold Filters */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs">
        <div>
          <label className="block text-slate-400 font-medium">Position</label>
          <select
            value={filters.position}
            onChange={(e) => setFilters({ ...filters, position: e.target.value as ScoutDiscoveryFilter["position"] })}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-1.5 text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Positions</option>
            <option value="Forward">Forward</option>
            <option value="Defense">Defense</option>
            <option value="Goaltender">Goaltender</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-medium">Min VO2 Max</label>
          <input
            type="number"
            value={filters.minVo2Max || ""}
            placeholder="e.g. 55"
            onChange={(e) => setFilters({ ...filters, minVo2Max: Number(e.target.value) || 0 })}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium">Max 30m Sprint (s)</label>
          <input
            type="number"
            step="0.05"
            value={filters.maxSprint30m || ""}
            placeholder="e.g. 4.00"
            onChange={(e) => setFilters({ ...filters, maxSprint30m: Number(e.target.value) || 10 })}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium">Max Bilateral Imbalance (%)</label>
          <input
            type="number"
            step="0.5"
            value={filters.maxBilateralImbalance || ""}
            placeholder="e.g. 10.0"
            onChange={(e) => setFilters({ ...filters, maxBilateralImbalance: Number(e.target.value) || 25 })}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium">Min GPA</label>
          <input
            type="number"
            step="0.1"
            value={filters.minGpa || ""}
            placeholder="e.g. 3.0"
            onChange={(e) => setFilters({ ...filters, minGpa: Number(e.target.value) || 0 })}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-1.5 text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Prospect Cards Grid */}
      <div className="mt-6 space-y-4">
        {filteredProspects.map((prospect) => (
          <div
            key={prospect.id}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 transition"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-white">{prospect.athleteName}</span>
                  <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-400">
                    #{prospect.jerseyNumber} · {prospect.position}
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                    Class of {prospect.graduationYear} · GPA {prospect.gpa.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {prospect.currentClub} · {prospect.league} · {Math.floor(prospect.heightInches / 12)}&apos;{prospect.heightInches % 12}&quot; · {prospect.weightLbs} lbs
                </p>
              </div>

              <button
                onClick={() => setActiveProspect(prospect)}
                className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 focus:outline-none transition"
              >
                SafeSport Inquiry
              </button>
            </div>

            {/* Combine Telemetry Banner */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="rounded bg-slate-800/60 p-2 text-center">
                <span className="text-slate-400">VO2 Max</span>
                <p className="font-bold text-cyan-400 mt-0.5">{prospect.verifiedCombine.vo2MaxMlKgMin} ml/kg</p>
              </div>
              <div className="rounded bg-slate-800/60 p-2 text-center">
                <span className="text-slate-400">30m Sprint</span>
                <p className="font-bold text-amber-400 mt-0.5">{prospect.verifiedCombine.sprint30mMetersSec}s</p>
              </div>
              <div className="rounded bg-slate-800/60 p-2 text-center">
                <span className="text-slate-400">Vertical Jump</span>
                <p className="font-bold text-slate-200 mt-0.5">{prospect.verifiedCombine.verticalJumpInches}&quot;</p>
              </div>
              <div className="rounded bg-slate-800/60 p-2 text-center">
                <span className="text-slate-400">Bilateral Imbalance</span>
                <p className={`font-bold mt-0.5 ${prospect.verifiedCombine.bilateralPowerImbalancePercent <= 10.0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {prospect.verifiedCombine.bilateralPowerImbalancePercent.toFixed(1)}%
                </p>
              </div>
              <div className="rounded bg-slate-800/60 p-2 text-center">
                <span className="text-slate-400">Certified Clips</span>
                <p className="font-bold text-emerald-400 mt-0.5">
                  {prospect.certifiedClips.length} (P-256 Sealed)
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SafeSport Guardian Outreach Modal */}
      {activeProspect && (
        <SafeSportInquiryModal
          prospect={activeProspect}
          onClose={() => setActiveProspect(null)}
          onDispatchInquiry={onDispatchInquiry}
        />
      )}
    </div>
  );
};
