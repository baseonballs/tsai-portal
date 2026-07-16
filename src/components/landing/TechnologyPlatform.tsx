import React from "react";
import { Camera, Network, Server, ArrowRight, Activity, Cpu } from "lucide-react";
import { landingPageCopy } from "@/data/landingPageCopy";

export function TechnologyPlatform() {
  const { technology } = landingPageCopy;

  const iconMap: Record<string, React.ReactNode> = {
    Camera: <Camera className="h-6 w-6 text-cyan-400" />,
    Network: <Network className="h-6 w-6 text-emerald-400" />,
    Server: <Server className="h-6 w-6 text-indigo-400" />,
  };

  return (
    <section id="technology" className="relative z-10 border-b border-white/5 bg-zinc-950 py-24 sm:py-32 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            <Cpu className="h-3.5 w-3.5" />
            {technology.eyebrow}
          </span>
          <h2 className="mt-6 font-serif text-3xl font-normal tracking-tight text-white sm:text-5xl">
            {technology.title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">
            {technology.subtitle}
          </p>
        </div>

        {/* Pipeline / Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {technology.modules.map((mod, idx) => (
            <div
              key={mod.id}
              className="group relative rounded-3xl border border-white/10 bg-zinc-900/30 p-8 backdrop-blur-md transition-all duration-500 hover:border-cyan-500/30 hover:bg-zinc-900/50 hover:shadow-2xl hover:shadow-cyan-900/20"
            >
              {/* Connector Line (visible on desktop) */}
              {idx < technology.modules.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-8 w-8 h-px bg-gradient-to-r from-cyan-500/50 to-transparent z-0" />
              )}
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-950/50 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {iconMap[mod.icon]}
                </div>
                
                <h3 className="mt-8 font-serif text-xl font-medium text-white group-hover:text-cyan-400 transition-colors duration-300">
                  {mod.title}
                </h3>
                <span className="mt-1 font-mono text-[10px] tracking-widest text-cyan-500/70 uppercase block mb-6">
                  {mod.subtitle}
                </span>

                <ul className="space-y-4 flex-grow">
                  {mod.features.map((feat, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-zinc-400">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600 group-hover:text-cyan-500 transition-colors duration-300" />
                      <span className="leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Tactical Pipeline Visualization Mockup */}
        <div className="mt-16 sm:mt-24 rounded-3xl border border-white/10 bg-zinc-900/20 p-2 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-indigo-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          <div className="rounded-2xl border border-white/5 bg-zinc-950 p-6 md:p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
            {/* Animated Grid Background */}
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-4xl justify-center">
              {/* Node 1: Video */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full border border-cyan-500/30 bg-cyan-950/30 flex items-center justify-center animate-pulse">
                  <Camera className="text-cyan-400 w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] tracking-widest text-zinc-500">RAW FOOTAGE</span>
              </div>

              {/* Data Stream */}
              <div className="hidden md:flex flex-1 h-px bg-zinc-800 relative">
                <div className="absolute top-1/2 left-0 w-2 h-2 -translate-y-1/2 bg-cyan-400 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              </div>

              {/* Node 2: Inference */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-xl border border-indigo-500/30 bg-indigo-950/30 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-xl border border-indigo-500/50 animate-[spin_4s_linear_infinite]" style={{ borderStyle: 'dashed' }} />
                  <Network className="text-indigo-400 w-8 h-8" />
                </div>
                <span className="font-mono text-[10px] tracking-widest text-zinc-500 text-center">MASCE ENGINE<br/>L1-L4 CHRONOLOGY</span>
              </div>

              {/* Data Stream */}
              <div className="hidden md:flex flex-1 h-px bg-zinc-800 relative">
                 <div className="absolute top-1/2 left-0 w-2 h-2 -translate-y-1/2 bg-emerald-400 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
              </div>

              {/* Node 3: Output */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full border border-emerald-500/30 bg-emerald-950/30 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                  <Activity className="text-emerald-400 w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] tracking-widest text-zinc-500">AUDITABLE LEDGER</span>
              </div>
            </div>
            
            <div className="relative z-10 mt-12 text-center">
               <p className="text-xs text-zinc-400 font-mono">
                 Deterministic Provenance-Tagged Event Ledger • 14-Point Integrity Audit
               </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
