"use client";

import React, { useState } from "react";
import {
  ArenaCameraDiscoveryWorkbenchProps,
  CameraStreamStatus,
  DiscoveredCameraFeed,
} from "../../types/camera-discovery-types";

export const ArenaCameraDiscoveryWorkbench: React.FC<ArenaCameraDiscoveryWorkbenchProps> = ({
  cameras,
  onTriggerRescan,
  onPairCameraToRig,
}) => {
  const [selectedIp, setSelectedIp] = useState<string>(cameras[0]?.ipAddress || "");
  const [pairedCameras, setPairedCameras] = useState<Record<string, boolean>>({});

  const activeCamera = cameras.find((c) => c.ipAddress === selectedIp) || cameras[0];

  const getStatusBadge = (status: CameraStreamStatus) => {
    switch (status) {
      case "READY":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          text: "text-emerald-400",
          label: "4K60 CERTIFIED",
        };
      case "HIGH_LATENCY":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
          label: "HIGH LATENCY",
        };
      case "FRAME_DROP":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
          label: "CLOCK DRIFT",
        };
      case "UNSUPPORTED":
      default:
        return {
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          text: "text-rose-400",
          label: "UNSUPPORTED",
        };
    }
  };

  const handlePair = (camera: DiscoveredCameraFeed) => {
    setPairedCameras((prev) => ({ ...prev, [camera.ipAddress]: true }));
    onPairCameraToRig?.(camera.ipAddress);
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400">ARENA-RIG-DISCOVERY</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Hardware Field Kit
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Arena RTSP / ONVIF Optical Camera Auto-Discovery
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onTriggerRescan}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors"
          >
            Rescan Subnet
          </button>
        </div>
      </div>

      {/* Discovered Cameras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {cameras.map((camera) => {
          const badge = getStatusBadge(camera.status);
          const isSelected = camera.ipAddress === selectedIp;
          const isPaired = pairedCameras[camera.ipAddress];
          return (
            <div
              key={camera.ipAddress}
              onClick={() => setSelectedIp(camera.ipAddress)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "border-cyan-500/70 bg-zinc-900/90 shadow-md"
                  : "border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">
                  {camera.manufacturer} {camera.modelName}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${badge.bg} ${badge.border} ${badge.text}`}>
                  {badge.label}
                </span>
              </div>
              <div className="text-xs font-mono text-zinc-400">{camera.ipAddress}</div>
              <div className="text-xs text-zinc-300 mt-2">
                {camera.width}x{camera.height} @ {camera.fps.toFixed(1)} FPS
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-3 pt-2 border-t border-zinc-800/60">
                <span>Latency: {camera.latencyMs.toFixed(1)} ms</span>
                <span className={camera.clockDriftMs > 10 ? "text-amber-400" : "text-emerald-400"}>
                  Drift: {camera.clockDriftMs.toFixed(1)} ms
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Camera Inspection Detail */}
      {activeCamera && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Stream Inspector: {activeCamera.ipAddress}</h2>
              <p className="text-xs font-mono text-zinc-400 break-all mt-0.5">{activeCamera.rtspUrl}</p>
            </div>
            <button
              onClick={() => handlePair(activeCamera)}
              disabled={!activeCamera.isCompliant4k60 || pairedCameras[activeCamera.ipAddress]}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                pairedCameras[activeCamera.ipAddress]
                  ? "bg-zinc-800 text-emerald-400 cursor-not-allowed"
                  : !activeCamera.isCompliant4k60
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/40"
              }`}
            >
              {pairedCameras[activeCamera.ipAddress]
                ? "Camera Paired & Sealed"
                : !activeCamera.isCompliant4k60
                ? "Non-Compliant Feed"
                : "Pair Camera to Arena Rig"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
              <span className="text-zinc-500">MAC Address</span>
              <div className="font-mono text-white font-semibold mt-1">{activeCamera.macAddress}</div>
            </div>
            <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
              <span className="text-zinc-500">Encoding Format</span>
              <div className="font-mono text-white font-semibold mt-1">H.265 Main 10 / RTP</div>
            </div>
            <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
              <span className="text-zinc-500">PTP Clock Sync</span>
              <div className="font-mono text-emerald-400 font-semibold mt-1">IEEE 1588 Synchronized</div>
            </div>
            <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
              <span className="text-zinc-500">Optical Homography</span>
              <div className="font-mono text-cyan-400 font-semibold mt-1">Survey Calibration Ready</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
