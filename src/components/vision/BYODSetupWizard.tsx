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

const STEPS: StepConfig[] = [
  { id: 1, title: "Hardware Device & Sensor Audit", shortTitle: "Device", icon: Camera },
  { id: 2, title: "Glass Mount & Vibration Diagnostic", shortTitle: "Mounting", icon: Shield },
  { id: 3, title: "Active Thermal & Qi2 Rigging", shortTitle: "Thermal", icon: Thermometer },
  { id: 4, title: "Acoustic Shield & Whistle Filter", shortTitle: "Acoustics", icon: Mic },
  { id: 5, title: "Stream Key & Arena Mesh Pairing", shortTitle: "Broadcast", icon: Radio },
];

export function BYODSetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [deviceModel, setDeviceModel] = useState("iphone-16-pro");
  const [glassType, setGlassType] = useState<"tempered" | "acrylic">("tempered");
  const [isPerpendicular, setIsPerpendicular] = useState(true);
  const [peltierConnected, setPeltierConnected] = useState(true);
  const [temperatureCelsius, setTemperatureCelsius] = useState(24.8);
  const [acousticShieldCalibrated, setAcousticShieldCalibrated] = useState(true);
  const [streamKey, setStreamKey] = useState("live_yt_8849204_tsai_broadcast");
  const [meshConnected, setMeshConnected] = useState(true);
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
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                A18 Pro / M4 Ready
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

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-300">
                <span className="font-semibold text-white">Optical Sensor Pass:</span> All required VisionEdge™ CoreML models (ByteTrack, jersey OCR, ballistic Kalman puck tracker) are pre-compiled and acceleration verified.
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
                    ? "Optimal high-transparency tempered glass. Anti-glare polarizing filter active."
                    : "Flexible acrylic boards. Applying IMU vibration damping filter (350ms decay ceiling)."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5">
                <label className="text-xs font-mono font-semibold uppercase text-zinc-400 block mb-2">Optical Perpendicularity</label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono font-bold text-cyan-400">0.24°</span>
                    <span className="text-xs text-zinc-400">(Target: ≤ 0.50°)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                    LOCKED
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[94%]" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4">
              <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase mb-2">Suction Force Diagnostic</h4>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Dual-Vacuum Pump Engagement</span>
                <span className="text-emerald-400 font-mono font-bold">65.2 lbs / 65.0 lbs target (Passed)</span>
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
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    NOMINAL
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-bold text-white">{temperatureCelsius.toFixed(1)}°C</span>
                  <span className="text-xs text-zinc-400">Max threshold: 32.0°C</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[45%]" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase text-zinc-400">MagSafe Qi2 15W Cold Plate</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">ACTIVE</span>
                </div>
                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Peltier State:</span>
                    <span className="text-white font-mono">Thermoelectric Chilled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Power Delivery:</span>
                    <span className="text-white font-mono">15W Qi2 Inductive</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Cable Rating:</span>
                    <span className="text-emerald-400 font-mono">-40°C Cold-Resistant</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-4 text-xs text-zinc-300">
              💡 <strong className="text-cyan-400">Thermal Guard Active:</strong> Transcend Vision will never throttle down to 30 FPS or dim the display. Continuous 4K60 HDR capture is guaranteed indefinitely.
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
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  28.4 dB Attenuation
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">PA System Copyright Music Shield:</span>
                  <span className="text-emerald-400 font-mono font-bold">Active (Zero YouTube Strikes)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Whistle Recognition Passband (2.8 - 3.8 kHz):</span>
                  <span className="text-cyan-400 font-mono font-bold">Armed (99.4% Precision)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Scorebug Clock Auto-Pause Sync:</span>
                  <span className="text-white font-mono">Bound to BenchHub &lt; 50ms</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Simulate Referee Whistle Test</span>
              <button
                onClick={() => setAcousticShieldCalibrated(true)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white font-mono cursor-pointer"
              >
                Trigger 3.2 kHz Tone
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
                  <button className="px-4 py-2 rounded-xl bg-cyan-500 text-zinc-950 font-bold text-xs hover:bg-cyan-400 transition-all cursor-pointer">
                    Verify
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
                  <span className="text-xs font-mono font-bold text-emerald-400">CONNECTED (14.2ms)</span>
                  <p className="text-[11px] text-zinc-500">BenchHub iPad Paired</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPLETION BANNER */}
        {isComplete && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif text-white">Transcend Vision Pod Online &amp; Armed</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Capture pod is fully calibrated. 4K60 video will broadcast to YouTube, while local mesh feeds BenchHub with sub-180ms latency.
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
              {currentStep === STEPS.length ? "Complete Setup" : "Next Step"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
