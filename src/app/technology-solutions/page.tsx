"use client";

import React from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Server, Shield, Cpu, Activity, ArrowRight } from "lucide-react";

export default function TechnologySolutionsPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-cyan-500/35 selection:text-white flex flex-col">
      <LandingHeader />

      <main className="flex-1 flex flex-col pt-24 pb-20 justify-center items-center px-6 relative z-10 overflow-hidden">
        
        {/* Abstract Tech Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen" />
        </div>

        <div className="max-w-4xl w-full text-center relative z-20 mt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-4 py-2 text-sm font-semibold tracking-wide text-cyan-400 mb-8 backdrop-blur-md">
            <Cpu className="w-4 h-4" /> TSAI Enterprise Infrastructure
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-white mb-8 leading-tight">
            Technology <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Solutions</span>
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-16 leading-relaxed">
            The foundation of Transcendental Sports AI. We are building the most advanced, secure, and scalable infrastructure ever deployed in youth sports development.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-cyan-950/50 flex items-center justify-center mb-4 border border-cyan-500/20">
                <Server className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-serif text-white mb-2">Edge Computing</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Processing telemetry and video streams closer to the rink for zero-latency tactical feedback.</p>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-indigo-950/50 flex items-center justify-center mb-4 border border-indigo-500/20">
                <Activity className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-serif text-white mb-2">MASCE Engine</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Our proprietary Multi-Agent Sports Cognition Engine parsing every frame of the game.</p>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-950/50 flex items-center justify-center mb-4 border border-emerald-500/20">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-serif text-white mb-2">Zero-Trust Security</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Military-grade protection for minor athlete data, complying with the strictest privacy standards.</p>
            </div>
          </div>

          <div className="mt-20 inline-block bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm text-zinc-400">
            Full technology briefing coming soon in <strong className="text-white">v0.2.0</strong>
          </div>
        </div>

      </main>

      <LandingFooter />
    </div>
  );
}
