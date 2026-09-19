'use client';

import React, { useState } from 'react';
import {
  PortalSheetChannel,
  BroadcastCameraAngle,
  PortalReplayItem,
  INITIAL_CHANNELS,
  formatStreamTime,
} from './broadcast-cloud-switcher-types';
import { Radio, Video, RefreshCw, Play, Film, Layers } from 'lucide-react';

export function MultiSheetCloudSwitcher() {
  const [channels, setChannels] = useState<PortalSheetChannel[]>(INITIAL_CHANNELS);
  const [selectedSheetId, setSelectedSheetId] = useState<string>('sheet-1');
  const [replays, setReplays] = useState<PortalReplayItem[]>([]);
  const [lastCutMs, setLastCutMs] = useState<number>(45);

  const activeChannel = channels.find((c) => c.sheetId === selectedSheetId) || channels[0];

  const handleSelectPreview = (angle: BroadcastCameraAngle) => {
    setChannels((prev) =>
      prev.map((c) => (c.sheetId === activeChannel.sheetId ? { ...c, previewAngle: angle } : c))
    );
  };

  const handleExecuteCut = () => {
    const prevProg = activeChannel.programAngle;
    const newProg = activeChannel.previewAngle;
    setChannels((prev) =>
      prev.map((c) =>
        c.sheetId === activeChannel.sheetId
          ? { ...c, programAngle: newProg, previewAngle: prevProg }
          : c
      )
    );
    setLastCutMs(Math.floor(40 + Math.random() * 15));
  };

  const handleTriggerReplay = (sec: number, type: PortalReplayItem['eventType']) => {
    const newReplay: PortalReplayItem = {
      id: `replay-${Date.now()}`,
      sheetId: activeChannel.sheetId,
      eventType: type,
      durationSec: sec,
      timestamp: new Date().toLocaleTimeString(),
    };
    setReplays((prev) => [newReplay, ...prev.slice(0, 7)]);
  };

  const cameraAngleOptions: BroadcastCameraAngle[] = [
    'BROADCAST_HIGH',
    'LOW_CREASE',
    'OVERHEAD_TACTICAL',
    'SLOT_DEFENSE_CAM',
  ];

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-100 font-sans shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              MULTI-SHEET BROADCAST CLOUD SWITCHER
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Patent Track 16 • Sub-100ms Cloud Angle Switching & Instant Replay Assembler
          </p>
        </div>

        {/* Sheet Selector Matrix */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {channels.map((ch) => (
            <button
              key={ch.sheetId}
              onClick={() => setSelectedSheetId(ch.sheetId)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedSheetId === ch.sheetId
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {ch.sheetName}
            </button>
          ))}
        </div>
      </div>

      {/* Program & Preview Monitors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* PROGRAM Monitor (Red Tally) */}
        <div className="bg-slate-900 border-2 border-red-500/80 rounded-xl p-4 shadow-lg flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2 text-xs font-black text-red-400 tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                PROGRAM OUT (LIVE)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {activeChannel.fps} FPS • {activeChannel.bitrateKbps} kbps
              </span>
            </div>
            <div className="mt-6 text-center">
              <div className="text-2xl font-black text-white tracking-wide">
                {activeChannel.programAngle.replace(/_/g, ' ')}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Air Time: {formatStreamTime(activeChannel.streamUptimeSeconds)}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between pt-4 border-t border-slate-800">
            <span>Latency: {lastCutMs} ms</span>
            <span className="text-emerald-400 font-mono">BROADCAST SECURE</span>
          </div>
        </div>

        {/* PREVIEW Monitor (Emerald Tally) */}
        <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-xl p-4 shadow-lg flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2 text-xs font-black text-emerald-400 tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                PREVIEW STAGING
              </span>
              <span className="text-[11px] font-mono text-slate-400">STANDBY ANGLE</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {cameraAngleOptions.map((ang) => (
                <button
                  key={ang}
                  onClick={() => handleSelectPreview(ang)}
                  className={`p-2.5 rounded-lg border text-xs font-bold text-left transition-all ${
                    activeChannel.previewAngle === ang
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 mb-1 text-slate-400" />
                  {ang.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-3">
            <button
              onClick={handleExecuteCut}
              className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              EXECUTE CUT (TAKE)
            </button>
          </div>
        </div>
      </div>

      {/* Instant Replay & Clip Assembler Controller */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Film className="w-4 h-4 text-cyan-400" />
            <span>INSTANT REPLAY BUFFER & CLIP ROLLBACK</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTriggerReplay(5, 'HIGH_DANGER_SAVE')}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700"
            >
              -5s Rollback
            </button>
            <button
              onClick={() => handleTriggerReplay(10, 'GOAL')}
              className="px-3 py-1.5 rounded-md bg-amber-950/40 hover:bg-amber-900/40 text-xs font-mono text-amber-300 border border-amber-800/60"
            >
              -10s Goal Replay
            </button>
            <button
              onClick={() => handleTriggerReplay(15, 'MANUAL_DISPUTE')}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700"
            >
              -15s Dispute Buffer
            </button>
          </div>
        </div>

        {/* Replay Manifest Feed */}
        {replays.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
            {replays.map((r) => (
              <div
                key={r.id}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Play className="w-3 h-3 text-emerald-400" />
                    {r.eventType}
                  </div>
                  <div className="text-[10px] text-slate-500">{r.timestamp}</div>
                </div>
                <span className="font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                  {r.durationSec}s
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
