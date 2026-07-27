"use client";

import React, { useState } from "react";
import { 
  GitMerge, 
  Database, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Check, 
  Zap, 
  Terminal,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu
} from "lucide-react";

export function DualLedgersScienceSection() {
  const [activeLedger, setActiveLedger] = useState<"chronology" | "possession">("chronology");

  return (
    <section className="px-6 py-28 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950 relative overflow-hidden text-left">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center gap-2.5 rounded-full border border-cyan-500/35 bg-black/90 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold tracking-widest backdrop-blur-xl shadow-xl shadow-cyan-500/15 mb-6 hover:border-cyan-400/60 transition-all font-mono">
            <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-cyan-400 font-bold">THE SCIENCE</span>
            <span className="text-zinc-600 font-normal">·</span>
            <span className="text-zinc-200 font-medium uppercase">HIGH RESOLUTION DUAL-LAYERED LEDGER</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            The Dual Ledgers: The Bedrock of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">
              Decision-Grade Sports Science.
            </span>
          </h2>
          <p className="mt-6 text-lg text-zinc-300 font-light leading-relaxed">
            Before AI can reason, evaluate, or coach, it must establish immutable physical truth. 
            Our architecture relies on two foundational ledgers—<strong className="text-white font-medium">Events Chronology</strong> and <strong className="text-white font-medium">Puck Possession</strong>—to convert 60fps multi-angle video into zero-drift, auditable sports intelligence.
          </p>
        </div>

        {/* LEDGER SELECTOR TABS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
          <button
            onClick={() => setActiveLedger("chronology")}
            className={`p-6 rounded-2xl border transition-all text-left flex items-start gap-4 ${
              activeLedger === "chronology"
                ? "bg-gradient-to-r from-cyan-950/60 via-zinc-900/60 to-black border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/30"
                : "bg-zinc-900/40 border-white/10 hover:border-white/20 hover:bg-zinc-900/70"
            }`}
          >
            <div className={`p-3 rounded-xl border ${activeLedger === "chronology" ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400" : "bg-zinc-950 border-white/10 text-zinc-400"}`}>
              <GitMerge className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block mb-1">FOUNDATIONAL LEDGER 01</span>
              <h3 className="text-lg font-serif font-bold text-white">Events Chronology Ledger</h3>
              <p className="text-xs text-zinc-400 font-light mt-1">High-frequency temporal ordering of every on-ice action with sub-second precision.</p>
            </div>
          </button>

          <button
            onClick={() => setActiveLedger("possession")}
            className={`p-6 rounded-2xl border transition-all text-left flex items-start gap-4 ${
              activeLedger === "possession"
                ? "bg-gradient-to-r from-indigo-950/60 via-zinc-900/60 to-black border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/30"
                : "bg-zinc-900/40 border-white/10 hover:border-white/20 hover:bg-zinc-900/70"
            }`}
          >
            <div className={`p-3 rounded-xl border ${activeLedger === "possession" ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400" : "bg-zinc-950 border-white/10 text-zinc-400"}`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase block mb-1">FOUNDATIONAL LEDGER 02</span>
              <h3 className="text-lg font-serif font-bold text-white">Puck Possession Ledger</h3>
              <p className="text-xs text-zinc-400 font-light mt-1">Spatial-temporal physics and control state tracking across every frame.</p>
            </div>
          </button>
        </div>

        {/* ACTIVE LEDGER DEEP DIVE & LIVE TERMINAL DEMO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEDGER DETAILS CARD */}
          <div className="lg:col-span-7 rounded-3xl border border-white/15 bg-zinc-900/50 p-8 md:p-10 backdrop-blur-xl flex flex-col justify-between shadow-2xl">
            <div>
              {activeLedger === "chronology" ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      TEMPORAL DETERMINISM
                    </span>
                    <span className="text-xs font-mono text-zinc-500">60 FPS Micro-Second Clock Lock</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
                    Events Chronology: Immutable Timeline of Play
                  </h3>
                  <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed mb-6">
                    The Events Chronology Ledger captures every micro-event on the ice—passes, stick checks, puck battles, zone entries/exits, turnover transitions, and line changes—with zero clock drift. Each event is bound directly to multi-camera source timestamps and bounding boxes.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Deterministic Sequence Graph</h4>
                        <p className="text-xs text-zinc-400 font-light mt-0.5">Maps exact cause-and-effect transitions (e.g. D-zone stick lift &rarr; loose puck battle &rarr; tape pass &rarr; clean exit).</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Provenance-Tagged Video Bounds</h4>
                        <p className="text-xs text-zinc-400 font-light mt-0.5">Every cataloged event points to exact camera frames and bounding boxes, providing 100% auditable proof.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">L1-to-L4 Hierarchical Rollup</h4>
                        <p className="text-xs text-zinc-400 font-light mt-0.5">Atomic nano-facts roll up deterministically into shifts (Meso) and season superpower baselines (Macro).</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                      SPATIAL-TEMPORAL VECTOR MECHANICS
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Physics Proximity Matrix</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
                    Puck Possession: Real-Time Spatial Control
                  </h3>
                  <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed mb-6">
                    The Puck Possession Ledger continuously tracks puck control state across 5 physical states: <em>Possessed</em>, <em>Disputed</em>, <em>Loose</em>, <em>Clear</em>, and <em>Sight-Occluded</em>. By evaluating skater velocity vectors and stick proximity, it measures how teams earn and maintain control under forecheck pressure.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Continuous Control State Engine</h4>
                        <p className="text-xs text-zinc-400 font-light mt-0.5">Evaluates control shifts every millisecond without relying on manual taggers or subjective estimates.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Stick-Blade &amp; Velocity Vector Proximity</h4>
                        <p className="text-xs text-zinc-400 font-light mt-0.5">Translates 2D camera pixels to 3D homography meters to verify skater-to-puck control radii.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Space-Earning &amp; Pressure Metrics</h4>
                        <p className="text-xs text-zinc-400 font-light mt-0.5">Quantifies how skaters gain high-danger ice under pressure versus forfeiting transition leverage.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Scientific Baseline: <strong className="text-white">MASCE RRM Substrate</strong></span>
                <span>Physics Audit: <strong className="text-emerald-400">14-Rule Integrity Gate</strong></span>
              </div>
            </div>
          </div>

          {/* SIMULATED HIGH-TECH LEDGER TELEMETRY TERMINAL */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="rounded-3xl border border-white/15 bg-black/90 p-6 md:p-8 shadow-2xl font-mono relative overflow-hidden flex-1 flex flex-col justify-between">
              {/* Top Bar */}
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white uppercase tracking-wider">
                      {activeLedger === "chronology" ? "Events Ledger Stream" : "Possession Ledger Stream"}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                    AUDITED TRUTH
                  </span>
                </div>

                {/* Simulated Ledger Code Block */}
                <div className="space-y-3 text-[11px] leading-relaxed">
                  {activeLedger === "chronology" ? (
                    <>
                      <div className="text-zinc-500">// CHRONOLOGY_LEDGER_RECORD_ID: 1048-A</div>
                      <div className="text-zinc-300">
                        <span className="text-cyan-400">TIMESTAMP:</span> 14:22:08.412
                      </div>
                      <div className="text-zinc-300">
                        <span className="text-cyan-400">EVENT_TYPE:</span> Stick Lift &rarr; Breakout Pass
                      </div>
                      <div className="text-zinc-300">
                        <span className="text-cyan-400">ACTOR:</span> #26 Corinne L. (Center)
                      </div>
                      <div className="text-zinc-300">
                        <span className="text-cyan-400">RECIPROCATOR:</span> #14 Skater (Right Wing)
                      </div>
                      <div className="text-zinc-300">
                        <span className="text-cyan-400">ZONE_VECTOR:</span>{" D-Zone Wall → Neutral Exit"}
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950 border border-cyan-500/20 text-zinc-400 text-[10px] space-y-1">
                        <div className="text-cyan-400 font-bold">&gt; AUDIT_PROVENANCE:</div>
                        <div>Camera 01: [x:412, y:280] · Conf: 98.6%</div>
                        <div>Camera 02: [x:819, y:312] · Conf: 99.1%</div>
                        <div>Physics Audit: Exit Speed 18.4mph · 0.00s Drift</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-zinc-500">// POSSESSION_LEDGER_RECORD_ID: 2091-P</div>
                      <div className="text-zinc-300">
                        <span className="text-indigo-400">POSSESSION_STATE:</span>{" Disputed → Controlled"}
                      </div>
                      <div className="text-zinc-300">
                        <span className="text-indigo-400">CONTROL_RADIUS:</span> 0.18m (Puck to Blade)
                      </div>
                      <div className="text-zinc-300">
                        <span className="text-indigo-400">PRIMARY_POSSESSOR:</span> #26 Corinne L.
                      </div>
                      <div className="text-zinc-300">
                        <span className="text-indigo-400">PRESSURE_INDEX:</span> Heavy Forecheck (2 Defenders)
                      </div>
                      <div className="text-zinc-300">
                        <span className="text-indigo-400">SPACE_EARNED:</span> +4.2m High-Danger Corridor
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950 border border-indigo-500/20 text-zinc-400 text-[10px] space-y-1">
                        <div className="text-indigo-400 font-bold">&gt; SPATIAL_VECTOR_DECODE:</div>
                        <div>Velocity Differential: +2.1 m/s</div>
                        <div>Homography Matrix: 2D-to-3D Meter Translation OK</div>
                        <div>Continuity State: 100% Deterministic Tracking</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Telemetry Footer */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-500">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> MASCE Substrate v2.4
                </span>
                <span className="text-cyan-400">Real-Time Ledger Sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
