"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Camera,
  Shield,
  Zap,
  Thermometer,
  Mic,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  Tv,
  RefreshCw,
  Sparkles,
  Sliders,
  Check,
  Radio,
} from "lucide-react";

interface StepConfig {
  id: number;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
}

/**
 * GA-030 O-09 (T0.4): no device has been paired, mounted, measured or calibrated — there is no
 * device-pairing or calibration backend yet (rebuilt in T6.3). Every reading on this wizard used to
 * be hard-coded as passed ("LOCKED", "Passed", "NOMINAL", "CONNECTED", "BenchHub iPad Paired",
 * "Capture pod is fully calibrated"). The steps stay as a setup checklist; each reading now says
 * "Not yet available" and finishing the checklist claims nothing.
 */
const STEPS: StepConfig[] = [
  { id: 1, title: "Hardware Device & Sensor Audit", shortTitle: "Device", icon: Camera },
  { id: 2, title: "Glass Mount & Vibration Diagnostic", shortTitle: "Mounting", icon: Shield },
  { id: 3, title: "Active Thermal & Qi2 Rigging", shortTitle: "Thermal", icon: Thermometer },
  { id: 4, title: "Acoustic Shield & Whistle Filter", shortTitle: "Acoustics", icon: Mic },
  { id: 5, title: "Stream Key & Arena Mesh Pairing", shortTitle: "Broadcast", icon: Radio },
];

const NOT_YET = "Not yet available";

export function BYODSetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [deviceModel, setDeviceModel] = useState("iphone-16-pro");
  const [glassType, setGlassType] = useState<"tempered" | "acrylic">("tempered");
  const [streamKey, setStreamKey] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-white/10 bg-zinc-900/60 p-6 md:p-10 backdrop-blur-xl shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> BYOD Zero-Capex Rinkside Rig
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-white font-medium">
            Transcend Vision Pod Setup Wizard
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Turn your iPhone or iPad into an autonomous 4K arena broadcast and tracking pod.
          </p>
        </div>

        {/* STEP PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isPassed = s.id < currentStep;
            const isCurrent = s.id === currentStep;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                  isCurrent
                    ? "bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20"
                    : isPassed
                    ? "bg-white/10 text-cyan-300 hover:bg-white/15"
                    : "bg-white/5 text-zinc-500 hover:bg-white/10"
                }`}
              >
                {isPassed ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
                <span>{s.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENT */}
      <div className="min-h-[380px] flex flex-col justify-between">
        {/* STEP 1: DEVICE & SENSOR AUDIT */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">Step 1: Optical Hardware &amp; Sensor Calibration</h3>
                <p className="text-sm text-zinc-400">Verifying Apple Silicon Neural Engine &amp; LiDAR dToF scanner capabilities.</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-800/60 text-zinc-400 border border-white/10">
                Device check: not yet available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setDeviceModel("iphone-16-pro")}
                className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                  deviceModel === "iphone-16-pro"
                    ? "border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-950/40"
                    : "border-white/10 bg-zinc-950/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-cyan-400">RECOMMENDED</span>
                  {deviceModel === "iphone-16-pro" && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <h4 className="font-semibold text-white">iPhone 16 Pro / Max</h4>
                <p className="text-xs text-zinc-400 mt-1">A18 Pro · 4K60 ProRes ISP · 940nm dToF LiDAR</p>
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-zinc-500">
                  ⚡ 35 TOPS NPU · Sub-180ms Latency
                </div>
              </div>

              <div
                onClick={() => setDeviceModel("iphone-15-pro")}
                className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                  deviceModel === "iphone-15-pro"
                    ? "border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-950/40"
                    : "border-white/10 bg-zinc-950/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-zinc-400">COMPATIBLE</span>
                  {deviceModel === "iphone-15-pro" && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <h4 className="font-semibold text-white">iPhone 15 Pro / Max</h4>
                <p className="text-xs text-zinc-400 mt-1">A17 Pro · 4K60 HDR · dToF LiDAR</p>
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-zinc-500">
                  ⚡ 35 TOPS NPU · Sub-180ms Latency
                </div>
              </div>

              <div
                onClick={() => setDeviceModel("ipad-pro-m4")}
                className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                  deviceModel === "ipad-pro-m4"
                    ? "border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-950/40"
                    : "border-white/10 bg-zinc-950/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-zinc-400">BENCH HUB</span>
                  {deviceModel === "ipad-pro-m4" && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <h4 className="font-semibold text-white">iPad Pro (M4)</h4>
                <p className="text-xs text-zinc-400 mt-1">M4 Silicon · Dual Studio Display Capture</p>
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-zinc-500">
                  ⚡ 38 TOPS NPU · Large Bench Display
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-300">
                <span className="font-semibold text-white">Optical sensor check:</span> {NOT_YET}. No device has been checked.
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MOUNTING & VIBRATION */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white">Step 2: Arena Glass Mounting &amp; Vibration Diagnostic</h3>
              <p className="text-sm text-zinc-400">Locking the industrial suction arm and aligning perpendicular optical axes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5">
                <label className="text-xs font-mono font-semibold uppercase text-zinc-400 block mb-2">Arena Glass Substrate</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGlassType("tempered")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      glassType === "tempered"
                        ? "bg-cyan-500 text-zinc-950 border-cyan-400 font-bold"
                        : "border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    12.7mm Tempered Glass
                  </button>
                  <button
                    onClick={() => setGlassType("acrylic")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      glassType === "acrylic"
                        ? "bg-cyan-500 text-zinc-950 border-cyan-400 font-bold"
                        : "border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    15.8mm Acrylic Polycarb
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 mt-2">
                  {glassType === "tempered"
                    ? "Optimal high-transparency tempered glass. Use an anti-glare polarizing filter."
                    : "Flexible acrylic boards need vibration damping (350ms decay ceiling)."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5">
                <label className="text-xs font-mono font-semibold uppercase text-zinc-400 block mb-2">Optical Perpendicularity</label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span data-testid="byod-not-measured" className="text-zinc-500 font-mono">Not yet available</span>
                    <span className="text-xs text-zinc-400">(Target: ≤ 0.50°)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4">
              <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase mb-2">Suction Force Diagnostic</h4>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Dual-Vacuum Pump Engagement</span>
                <span className="font-mono"><span data-testid="byod-not-measured" className="text-zinc-500 font-mono">Not yet available</span> (target 65.0 lbs)</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: THERMAL & POWER */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white">Step 3: Active Peltier Cooling &amp; Qi2 Rigging</h3>
              <p className="text-sm text-zinc-400">Preventing thermal ISP throttling during 2.5-hour tournament double-headers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase text-zinc-400">Internal Die Temp</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span data-testid="byod-not-measured" className="text-zinc-500 font-mono">Not yet available</span>
                  <span className="text-xs text-zinc-400">Max threshold: 32.0°C</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase text-zinc-400">MagSafe Qi2 15W Cold Plate</span>
                </div>
                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Peltier State:</span>
                    <span data-testid="byod-not-measured" className="text-zinc-500 font-mono">Not yet available</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Power Delivery:</span>
                    <span data-testid="byod-not-measured" className="text-zinc-500 font-mono">Not yet available</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-4 text-xs text-zinc-300">
              <strong className="text-cyan-400">Thermal guard:</strong> {NOT_YET}. No device temperature is being read.
            </div>
          </div>
        )}

        {/* STEP 4: ACOUSTICS & WHISTLE */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white">Step 4: Content-ID Acoustic Shield &amp; Whistle Sync</h3>
              <p className="text-sm text-zinc-400">Filtering arena copyright music while preserving whistle detection for automated clock control.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">Acoustic Shield Frequency Filtering</h4>
                  <p className="text-xs text-zinc-400">Dual cardioid mic array beamforming tuned to rink ice surface.</p>
                </div>
                <span data-testid="byod-not-measured" className="text-zinc-500 font-mono">Not yet available</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">PA System Copyright Music Shield:</span>
                  <span data-testid="byod-not-measured" className="text-zinc-500 font-mono">Not yet available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Whistle Recognition Passband (2.8 - 3.8 kHz):</span>
                  <span data-testid="byod-not-measured" className="text-zinc-500 font-mono">Not yet available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Scorebug Clock Auto-Pause Sync:</span>
                  <span data-testid="byod-not-measured" className="text-zinc-500 font-mono">Not yet available</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Referee whistle test</span>
              <button
                type="button"
                disabled
                title="Not yet available"
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-semibold text-zinc-500 font-mono cursor-not-allowed"
              >
                Trigger 3.2 kHz Tone (not yet available)
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: BROADCAST & MESH */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white">Step 5: Tri-Egress Broadcast &amp; Arena Mesh Pairing</h3>
              <p className="text-sm text-zinc-400">Pairing your YouTube Live DVR channel and local coach WebRTC mesh.</p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 space-y-3">
                <label className="text-xs font-mono font-semibold uppercase text-zinc-400 block">
                  YouTube Live Stream Key (RTMPS Egress)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={streamKey}
                    onChange={(e) => setStreamKey(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter YouTube Stream Key..."
                  />
                  <button
                    type="button"
                    disabled
                    title="Not yet available"
                    className="px-4 py-2 rounded-xl bg-white/5 text-zinc-500 font-bold text-xs cursor-not-allowed"
                  >
                    Verify (not yet available)
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Streams 4K unlisted/public video directly to YouTube CDN for free zero-cost parent viewing.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">Arena Local WebRTC Mesh</h4>
                  <p className="text-xs text-zinc-400">Bonjour service: <code className="text-cyan-400">_tsai-mesh._tcp</code></p>
                </div>
                <div className="text-right">
                  <span data-testid="byod-not-measured" className="text-zinc-500 font-mono">Not yet available</span>
                  <p className="text-[11px] text-zinc-500">No device is paired</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPLETION BANNER */}
        {isComplete && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800/60 border border-white/10 text-zinc-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif text-white" data-testid="byod-pairing-unavailable">Setup checklist reviewed</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Device pairing and calibration are not yet available. Nothing was paired, measured or calibrated.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                href="/club-revshare"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-all"
              >
                View Club 50% Revenue Share Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION */}
        {!isComplete && (
          <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                currentStep === 1
                  ? "opacity-30 cursor-not-allowed text-zinc-500"
                  : "text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 hover:opacity-95 transition-all cursor-pointer"
            >
              {currentStep === STEPS.length ? "Finish Checklist" : "Next Step"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
