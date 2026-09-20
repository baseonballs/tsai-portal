import React, { useState } from 'react';
import {
  SheetAcousticChannel,
  INITIAL_SHEET_CHANNELS,
} from '../../types/acoustic-shield-portal-types';

export const CrossRinkAcousticShieldWorkbench: React.FC = () => {
  const [channels, setChannels] = useState<SheetAcousticChannel[]>(INITIAL_SHEET_CHANNELS);
  const [selectedSheetId, setSelectedSheetId] = useState<string>('sheet_rink_1');
  const [globalMasterShield, setGlobalMasterShield] = useState<boolean>(true);

  const activeChannel = channels.find((c) => c.sheetId === selectedSheetId) || channels[0];

  const togglePhaseCancellation = (sheetId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.sheetId === sheetId
          ? {
              ...ch,
              isPhaseCancellationActive: !ch.isPhaseCancellationActive,
              attenuationDb: !ch.isPhaseCancellationActive ? -30.0 : 0.0,
              shieldedRmsPa: !ch.isPhaseCancellationActive
                ? ch.localRmsPa * 0.0316
                : ch.localRmsPa,
            }
          : ch
      )
    );
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 font-sans shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Cross-Rink Acoustic Phase-Cancellation Shield
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            TDOA Multilateration & Adaptive Anti-Phase Bleed Neutralizer (TSAI-PAT-P402)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">MASTER SHIELD:</span>
          <button
            onClick={() => setGlobalMasterShield(!globalMasterShield)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              globalMasterShield
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {globalMasterShield ? 'SHIELD ENGAGED' : 'BYPASSED'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left: Sheet Selection list */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Arena Sheet Channels ({channels.length})
          </h3>
          <div className="space-y-2">
            {channels.map((ch) => {
              const isSelected = ch.sheetId === selectedSheetId;
              return (
                <div
                  key={ch.sheetId}
                  onClick={() => setSelectedSheetId(ch.sheetId)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">{ch.sheetName}</span>
                    {ch.bleedDetected && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        BLEED DETECTED
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Attenuation:</span>
                    <span
                      className={`font-mono font-bold ${
                        ch.attenuationDb < -20 ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {ch.attenuationDb.toFixed(1)} dB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right: Focused Channel Monitor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">{activeChannel.sheetName}</h4>
                <p className="text-xs text-slate-400">
                  Target Sheet Real-Time Acoustic Multilateration Node
                </p>
              </div>
              <button
                onClick={() => togglePhaseCancellation(activeChannel.sheetId)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${
                  activeChannel.isPhaseCancellationActive
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                }`}
              >
                {activeChannel.isPhaseCancellationActive
                  ? 'Anti-Phase Active'
                  : 'Inversion Disabled'}
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  Raw Ingestion
                </span>
                <p className="text-lg font-mono font-bold text-white mt-1">
                  {activeChannel.localRmsPa.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-400">Pa</span>
                </p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  Post-Cancellation
                </span>
                <p className="text-lg font-mono font-bold text-emerald-400 mt-1">
                  {activeChannel.shieldedRmsPa.toFixed(3)}{' '}
                  <span className="text-xs font-normal text-slate-400">Pa</span>
                </p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  Attenuation
                </span>
                <p className="text-lg font-mono font-bold text-cyan-400 mt-1">
                  {activeChannel.attenuationDb.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-400">dB</span>
                </p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  Peak Frequency
                </span>
                <p className="text-lg font-mono font-bold text-amber-300 mt-1">
                  {activeChannel.peakFrequencyHz}{' '}
                  <span className="text-xs font-normal text-slate-400">Hz</span>
                </p>
              </div>
            </div>

            {/* Bleed Source Analysis Banner */}
            {activeChannel.bleedDetected && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-amber-200">
                    Interference source localized to{' '}
                    <strong>{activeChannel.bleedSourceSheetName}</strong>
                  </span>
                </div>
                {activeChannel.sourceDistanceMeters && (
                  <span className="text-amber-300 font-mono font-semibold">
                    ~{activeChannel.sourceDistanceMeters.toFixed(1)} m distance
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Audio Waveform / Cancellation Indicator */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 flex items-center justify-between text-xs text-slate-400">
            <span>Adaptive Cancellation Mode: 64-Tap FIR Inversion</span>
            <span className="font-mono text-emerald-400 font-semibold">
              Signal-to-Bleed Isolation: +32.4 dB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
