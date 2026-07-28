"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Zap, 
  Check, 
  ArrowRight, 
  Layers,
  Activity,
  ChevronRight
} from "lucide-react";

export function HockeyStickTrajectoryIllustration() {
  const [selectedPhase, setSelectedPhase] = useState<"history" | "magic" | "future">("magic");

  return (
    <section className="px-6 py-24 lg:px-8 border-t border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 relative overflow-hidden text-left">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest mb-6">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ATHLETE TRAJECTORY METAPHOR</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            The Hockey Stick Curve: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">
              Where Development Transcends.
            </span>
          </h2>
          <p className="mt-6 text-lg text-zinc-300 font-light leading-relaxed">
            Every athlete hits a development plateau under static video tags and unguided reps. 
            The physical curve of the hockey stick illustrates how <strong className="text-white font-medium">Transcend AI</strong> turns stagnant historical reps into an exponential vertical skyward trajectory.
          </p>
        </div>

        {/* HOCKEY STICK TRAJECTORY SVG VISUALIZATION CARD */}
        <div className="rounded-3xl border border-white/15 bg-black/80 p-6 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden mb-12">
          {/* Top Control Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-bold uppercase tracking-wider">Player Development Trajectory Model</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Curved Inflection:</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-bold uppercase">Transcend Engine Substrate</span>
            </div>
          </div>

          {/* CINEMATIC SVG CHART */}
          <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center my-4">
            <svg viewBox="0 0 900 400" className="w-full h-full overflow-visible">
              <defs>
                {/* Curve Gradient */}
                <linearGradient id="hockeyStickGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="35%" stopColor="#6366f1" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#e879f9" stopOpacity="1" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                </linearGradient>

                {/* Glow Filter */}
                <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Lines */}
              <line x1="100" y1="350" x2="850" y2="350" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <line x1="100" y1="50" x2="100" y2="350" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <line x1="380" y1="50" x2="380" y2="350" stroke="rgba(99,102,241,0.2)" strokeDasharray="2 2" />

              {/* HOCKEY STICK CURVE PATH */}
              {/* Path starts at (120, 270) -> flat blade to (340, 290) -> heel curve at (380, 295) -> shoots steep to (820, 50) */}
              <path
                d="M 120 270 Q 240 285 340 290 Q 410 295 480 230 C 580 140 700 80 820 50"
                fill="none"
                stroke="url(#hockeyStickGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#glowEffect)"
              />

              {/* INFLECTION CALLOUT BOX: "The magic happens here" */}
              <g 
                transform="translate(310, 140)" 
                className="cursor-pointer group"
                onClick={() => setSelectedPhase("magic")}
              >
                {/* Glow Box */}
                <rect 
                  x="0" y="0" width="200" height="60" rx="12" 
                  fill="rgba(15, 23, 42, 0.9)" 
                  stroke={selectedPhase === "magic" ? "#818cf8" : "rgba(255, 255, 255, 0.2)"} 
                  strokeWidth={selectedPhase === "magic" ? "2" : "1"}
                />
                <text x="100" y="26" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="serif">
                  The magic happens here
                </text>
                <text x="100" y="44" textAnchor="middle" fill="#818cf8" fontSize="10" fontFamily="monospace">
                  Transcend AI Engine
                </text>

                {/* Arrow Pointer Down to Inflection Node (Centered at X=100 -> Absolute X=410) */}
                <path d="M 100 60 L 100 120" stroke="#818cf8" strokeWidth="2" strokeDasharray="3 3" />
                <polygon points="95,118 100,128 105,118" fill="#818cf8" />
              </g>

              {/* PHASE 1 NODE: HISTORY */}
              <g 
                transform="translate(200, 280)" 
                className="cursor-pointer"
                onClick={() => setSelectedPhase("history")}
              >
                <circle r="12" fill="#090d16" stroke="#38bdf8" strokeWidth="3" />
                <circle r="5" fill="#38bdf8" />
                <text x="0" y="32" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                  HISTORY (Lesser Skills)
                </text>
              </g>

              {/* PHASE 2 NODE: TRANSCEND INFLECTION */}
              <g 
                transform="translate(410, 288)" 
                className="cursor-pointer"
                onClick={() => setSelectedPhase("magic")}
              >
                <circle r="16" fill="#0f172a" stroke="#818cf8" strokeWidth="3" className="animate-pulse" />
                <circle r="7" fill="#e879f9" />
              </g>

              {/* PHASE 3 NODE: FUTURE SKYWARD */}
              <g 
                transform="translate(740, 80)" 
                className="cursor-pointer"
                onClick={() => setSelectedPhase("future")}
              >
                <circle r="14" fill="#090d16" stroke="#34d399" strokeWidth="3" />
                <circle r="6" fill="#34d399" />
                <text x="0" y="-38" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  FUTURE (Compounding Mastery)
                </text>
              </g>

              {/* AXIS LABELS */}
              <text x="180" y="380" fill="#64748b" fontSize="12" fontFamily="monospace" fontWeight="bold">
                &larr; HISTORY (Past Reps &amp; Film)
              </text>
              <text x="600" y="380" fill="#64748b" fontSize="12" fontFamily="monospace" fontWeight="bold">
                FUTURE (Compounding Mastery) &rarr;
              </text>
            </svg>
          </div>

          {/* INTERACTIVE PHASE DETAILS ACCORDION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <button
              onClick={() => setSelectedPhase("history")}
              className={`p-5 rounded-2xl border text-left transition-all ${
                selectedPhase === "history"
                  ? "bg-cyan-950/40 border-cyan-500/50 ring-1 ring-cyan-500/30"
                  : "bg-zinc-900/30 border-white/10 hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">PHASE I · HISTORY</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-1">Plateaued Repetition</h3>
              <p className="text-xs text-zinc-400 font-light">Static 2D video clips &amp; unguided ice reps without mechanical provenance lead to lesser skills and plateaued growth.</p>
            </button>

            <button
              onClick={() => setSelectedPhase("magic")}
              className={`p-5 rounded-2xl border text-left transition-all ${
                selectedPhase === "magic"
                  ? "bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-black border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.2)]"
                  : "bg-zinc-900/30 border-white/10 hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">INFLECTION POINT</span>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-1">The Magic Happens Here</h3>
              <p className="text-xs text-zinc-300 font-light">Transcend AI Engine (<span className="text-cyan-400">Nano</span>/<span className="text-indigo-400">Micro</span>/<span className="text-fuchsia-400">Meso</span>/<span className="text-emerald-400">Macro</span>) unlocks the vertical bend.</p>
            </button>

            <button
              onClick={() => setSelectedPhase("future")}
              className={`p-5 rounded-2xl border text-left transition-all ${
                selectedPhase === "future"
                  ? "bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/30"
                  : "bg-zinc-900/30 border-white/10 hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">PHASE III · FUTURE</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-1">Compounding Mastery</h3>
              <p className="text-xs text-zinc-400 font-light">Superpower micro-loop stacking and decision-grade spatial reading. The ceiling is broken—the sky is the limit.</p>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
