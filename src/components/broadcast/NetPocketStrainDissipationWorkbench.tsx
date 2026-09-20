import React, { useState } from "react";

export interface NetPocketImpactData {
  incomingVelocityMps: number;
  impactCoordinateX: number; // -0.914m to +0.914m
  impactCoordinateY: number; // 0.0m to 1.219m
  meshDeflectionDepthM: number;
  peakCordTensionN: number;
  incomingKineticEnergyJ: number;
  dissipatedStrainEnergyJ: number;
  residualKineticEnergyJ: number;
  reboundVelocityMps: number;
  coefficientOfRestitution: number;
  isCornerPocketZone: boolean;
  entrapmentStatus: "POCKET_ENTRAPMENT" | "DAMPED_SETTLE" | "ACTIVE_REBOUND";
  goalLinePenetrationVerified: boolean;
}

interface NetPocketStrainDissipationWorkbenchProps {
  initialData?: NetPocketImpactData;
}

export const NetPocketStrainDissipationWorkbench: React.FC<NetPocketStrainDissipationWorkbenchProps> = ({
  initialData = {
    incomingVelocityMps: 40.0,
    impactCoordinateX: 0.82,
    impactCoordinateY: 1.15,
    meshDeflectionDepthM: 0.28,
    peakCordTensionN: 420.0,
    incomingKineticEnergyJ: 136.0,
    dissipatedStrainEnergyJ: 124.8,
    residualKineticEnergyJ: 11.2,
    reboundVelocityMps: 11.47,
    coefficientOfRestitution: 0.287,
    isCornerPocketZone: true,
    entrapmentStatus: "POCKET_ENTRAPMENT",
    goalLinePenetrationVerified: true,
  },
}) => {
  const [data] = useState<NetPocketImpactData>(initialData);

  const getStatusBadge = () => {
    switch (data.entrapmentStatus) {
      case "POCKET_ENTRAPMENT":
        return {
          bg: "bg-emerald-950/50 border-emerald-500/60 text-emerald-400",
          label: "CORNER POCKET ENTRAPMENT",
        };
      case "DAMPED_SETTLE":
        return {
          bg: "bg-sky-950/50 border-sky-500/60 text-sky-400",
          label: "DAMPED VERTICAL DROP",
        };
      case "ACTIVE_REBOUND":
      default:
        return {
          bg: "bg-amber-950/50 border-amber-500/60 text-amber-400",
          label: "ACTIVE CREASE REBOUND",
        };
    }
  };

  const status = getStatusBadge();
  const dissipationPct = Math.round((data.dissipatedStrainEnergyJ / Math.max(1, data.incomingKineticEnergyJ)) * 100);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <h2 className="text-base font-bold tracking-tight text-zinc-100 uppercase">
              Goal Net Corner Pocket Strain &amp; Velocity Dissipation Arbiter
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            P437 · High-Speed Twine Tension &amp; 3D Goal-Line Inelastic Absorption Workbench
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`rounded-lg border px-3 py-1 text-xs font-mono font-semibold tracking-wide ${status.bg}`}>
            {status.label}
          </div>
          <div
            className={`rounded-lg border px-3 py-1 text-xs font-mono font-semibold tracking-wide ${
              data.goalLinePenetrationVerified
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/40 border-red-500/40 text-red-300"
            }`}
          >
            {data.goalLinePenetrationVerified ? "GOAL LINE CLEARED" : "NO PENETRATION"}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Impact Velocity</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-zinc-100">{data.incomingVelocityMps.toFixed(1)}</span>
            <span className="text-xs text-zinc-400">m/s</span>
          </div>
          <span className="text-[10px] text-zinc-500">{(data.incomingVelocityMps * 3.6).toFixed(1)} km/h</span>
        </div>

        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Peak Cord Tension</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-amber-400">{data.peakCordTensionN.toFixed(0)}</span>
            <span className="text-xs text-zinc-400">N</span>
          </div>
          <span className="text-[10px] text-zinc-500">Depth: {(data.meshDeflectionDepthM * 100).toFixed(1)} cm</span>
        </div>

        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Energy Dissipation</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-emerald-400">{dissipationPct}</span>
            <span className="text-xs text-zinc-400">%</span>
          </div>
          <span className="text-[10px] text-zinc-500">{data.dissipatedStrainEnergyJ.toFixed(1)} / {data.incomingKineticEnergyJ.toFixed(1)} J</span>
        </div>

        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Restitution Coeff (COR)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-sky-400">{data.coefficientOfRestitution.toFixed(3)}</span>
          </div>
          <span className="text-[10px] text-zinc-500">Rebound: {data.reboundVelocityMps.toFixed(1)} m/s</span>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-300">Goal Net Twine Strain Absorption Profile</span>
          <span className="font-mono text-zinc-400">
            Coords: ({data.impactCoordinateX > 0 ? `+${data.impactCoordinateX.toFixed(2)}` : data.impactCoordinateX.toFixed(2)}m, {data.impactCoordinateY.toFixed(2)}m)
          </span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${Math.min(100, dissipationPct)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-zinc-500 font-mono">
          <span>0 J (Elastic Rebound)</span>
          <span>Target &gt; 80% Dissipation (Pocket Catch)</span>
          <span>{data.incomingKineticEnergyJ.toFixed(1)} J (Full Inelasticity)</span>
        </div>
      </div>
    </div>
  );
};
