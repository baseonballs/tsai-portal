"use client";

//
//  IceFrictionChatterWorkbench.tsx
//  tsai-portal
//
//  Transcend Platform - Patent P389
//  Continuous Surface Ice Friction Micro-Variability & Blade Chatter Acoustics Model
//

import React, { useState, useMemo } from "react";
import {
  IceCellData,
  IceFrictionChatterWorkbenchProps,
} from "../../types/ice-friction-chatter-types";

function generateDefaultGrid(floodMin: number, tempC: number): IceCellData[] {
  const cells: IceCellData[] = [];
  const cols = 6;
  const rows = 3;
  const lengthM = 60.96;
  const widthM = 25.908;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `cell_${r}_${c}`;
      const cx = (c + 0.5) * (lengthM / cols);
      const cy = (r + 0.5) * (widthM / rows) - widthM / 2.0;

      // Slot/crease cells have higher trench density and acoustic chatter
      const isCreaseArea = (c === 0 || c === 5) && r === 1;
      const trench = isCreaseArea ? 16.0 : (c === 2 || c === 3) ? 12.0 : 4.5;
      const chatter = isCreaseArea ? 22.5 : 8.0;

      const timeFactor = 0.012 * (floodMin / 60.0);
      const tempFactor = 0.002 * Math.max(0.0, tempC - -5.0);
      const incisionFactor = 0.0008 * trench;
      const chatterBoost = chatter > 18.0 ? Math.min(0.015, (chatter - 18.0) * 0.001) : 0.0;

      const rawMuk = 0.005 + timeFactor + tempFactor + incisionFactor + chatterBoost;
      const muk = Math.max(0.003, Math.min(0.045, rawMuk));

      cells.push({
        id,
        col: c,
        row: r,
        centerX: parseFloat(cx.toFixed(1)),
        centerY: parseFloat(cy.toFixed(1)),
        elapsedFloodMin: floodMin,
        surfaceTempC: tempC,
        trenchDensityMPerSqM: trench,
        acousticChatterDb: chatter,
        dynamicFrictionMuk: parseFloat(muk.toFixed(4)),
        rutAlert: chatter > 18.0,
      });
    }
  }
  return cells;
}

export function IceFrictionChatterWorkbench({
  initialFloodMin = 35.0,
  initialTempC = -4.5,
  initialCells,
  onCellSelect,
  className = "",
}: IceFrictionChatterWorkbenchProps) {
  const [floodMin, setFloodMin] = useState<number>(initialFloodMin);
  const [tempC, setTempC] = useState<number>(initialTempC);
  const [selectedCellId, setSelectedCellId] = useState<string>("cell_1_0");

  const cells = useMemo(() => {
    if (initialCells && initialCells.length > 0) return initialCells;
    return generateDefaultGrid(floodMin, tempC);
  }, [initialCells, floodMin, tempC]);

  const selectedCell = useMemo(
    () => cells.find((c) => c.id === selectedCellId) || cells[0],
    [cells, selectedCellId]
  );

  const meanMuk = useMemo(() => {
    const total = cells.reduce((sum, c) => sum + c.dynamicFrictionMuk, 0);
    return parseFloat((total / cells.length).toFixed(4));
  }, [cells]);

  const alertCount = useMemo(() => cells.filter((c) => c.rutAlert).length, [cells]);

  const handleSelect = (cell: IceCellData) => {
    setSelectedCellId(cell.id);
    onCellSelect?.(cell);
  };

  return (
    <div
      data-testid="ice-friction-chatter-workbench"
      className={`bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md text-slate-100 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold tracking-tight text-white">
              CONTINUOUS ICE FRICTION & ACOUSTIC CHATTER WORKBENCH
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            TSAI-PAT-P389 · 2D VORONOI SURFACE MESH & 1.2–3.8 kHz ACOUSTIC RESONANCE
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="bg-slate-950/80 px-3 py-1.5 rounded-md border border-slate-800">
            <span className="text-slate-400 block text-[10px]">SHEET MEAN μk</span>
            <span className="font-mono font-bold text-cyan-400">{meanMuk}</span>
          </div>
          <div className="bg-slate-950/80 px-3 py-1.5 rounded-md border border-slate-800">
            <span className="text-slate-400 block text-[10px]">RUT ALERTS</span>
            <span className={`font-mono font-bold ${alertCount > 0 ? "text-rose-400" : "text-teal-400"}`}>
              {alertCount} CELLS
            </span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 mb-4 text-xs">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-400">FLOOD ELAPSED TIME:</span>
            <span className="font-mono font-bold text-white">{floodMin.toFixed(0)} min</span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            value={floodMin}
            onChange={(e) => setFloodMin(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-400">SURFACE TEMPERATURE:</span>
            <span className="font-mono font-bold text-white">{tempC.toFixed(1)} °C</span>
          </div>
          <input
            type="range"
            min="-7.0"
            max="-2.0"
            step="0.1"
            value={tempC}
            onChange={(e) => setTempC(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>

      {/* Rink 2D Heatmap */}
      <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800 mb-4">
        <div className="text-[10px] text-slate-500 mb-2 flex justify-between font-mono">
          <span>DEFENDING ZONE</span>
          <span>NEUTRAL ZONE</span>
          <span>ATTACKING ZONE</span>
        </div>

        <div className="grid grid-cols-6 gap-1.5 h-36">
          {cells.map((cell) => {
            const isSelected = cell.id === selectedCellId;
            // Map friction to visual intensity
            const intensity = Math.min(1.0, (cell.dynamicFrictionMuk - 0.005) / 0.025);
            const bgColor = cell.rutAlert
              ? "bg-rose-950/60 border-rose-500/80 text-rose-200"
              : intensity > 0.6
              ? "bg-amber-950/50 border-amber-500/70 text-amber-200"
              : "bg-cyan-950/40 border-cyan-500/50 text-cyan-200";

            return (
              <button
                key={cell.id}
                onClick={() => handleSelect(cell)}
                className={`relative rounded border p-1 text-left flex flex-col justify-between transition-all ${bgColor} ${
                  isSelected ? "ring-2 ring-cyan-400" : "hover:border-slate-400"
                }`}
              >
                <div className="flex justify-between items-center text-[9px] w-full">
                  <span className="font-mono opacity-80">{cell.id.replace("cell_", "")}</span>
                  {cell.rutAlert && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />}
                </div>
                <div className="text-center font-mono font-bold text-xs">{cell.dynamicFrictionMuk}</div>
                <div className="text-[8px] opacity-70 text-right font-mono">{cell.trenchDensityMPerSqM}m²</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Cell Telemetry Inspector */}
      {selectedCell && (
        <div className="bg-slate-950/70 rounded-lg p-3 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white tracking-wide">
              CELL INSPECTOR: <span className="text-cyan-400 font-mono">{selectedCell.id}</span> (X:{" "}
              {selectedCell.centerX}m, Y: {selectedCell.centerY}m)
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                selectedCell.rutAlert
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-teal-500/20 text-teal-300 border-teal-500/40"
              }`}
            >
              {selectedCell.rutAlert ? "ACOUSTIC RUT ALERT" : "OPTIMAL GLIDE"}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">DYNAMIC FRICTION</span>
              <span className="font-mono font-bold text-cyan-400">{selectedCell.dynamicFrictionMuk} μk</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">TRENCH DENSITY</span>
              <span className="font-mono font-bold text-white">{selectedCell.trenchDensityMPerSqM} m/m²</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">BLADE CHATTER (1.2–3.8k)</span>
              <span className={`font-mono font-bold ${selectedCell.acousticChatterDb > 18 ? "text-rose-400" : "text-white"}`}>
                {selectedCell.acousticChatterDb} dB
              </span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">LOCAL ICE TEMP</span>
              <span className="font-mono font-bold text-white">{selectedCell.surfaceTempC} °C</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
