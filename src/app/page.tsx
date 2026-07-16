"use client";

import React, { useState } from "react";

import Link from "next/link";

import { Activity, BookOpen, Layers, Play, TrendingUp, Zap, ArrowRight, Send, Sparkles } from "lucide-react";

import { BetaSignupForm } from "@/components/landing/BetaSignupForm";
import { CinematicBackgroundSlideshow } from "@/components/landing/CinematicBackgroundSlideshow";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { RinkTelemetryChart } from "@/components/landing/RinkTelemetryChart";
import { TechnologyPlatform } from "@/components/landing/TechnologyPlatform";
import { landingPageCopy } from "@/data/landingPageCopy";
import { PlayerTelemetry } from "@/data/players-telemetry";

export default function LandingPage() {
  const { hero, ecosystem, pricing, docs } = landingPageCopy;
  const [activeTier, setActiveTier] = useState("encore");
  const [hoveredPlayer, setHoveredPlayer] = useState<PlayerTelemetry | null>(null);

  // Helper icons for the 4 tiers
  const tierIcons: Record<string, React.ReactNode> = {
    encore: <Play className="h-5 w-5 text-cyan-400" />,
    tempest: <Zap className="h-5 w-5 text-amber-500" />,
    edgeiq: <TrendingUp className="h-5 w-5 text-emerald-400" />,
    stratus: <Layers className="h-5 w-5 text-purple-400" />,
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-cyan-500/35 selection:text-white">
      {/* Immersive Ken Burns background slideshow */}
      <CinematicBackgroundSlideshow />

      {/* 1. HEADER / NAVIGATION */}
      <LandingHeader />

      {/* 2. HERO SECTION */}
      <LandingHero hero={hero} />

      {/* 3. ECOSYSTEM: THE 4 TIERS & D3.JS TELEMETRY CHART */}
      <section id="ecosystem" className="relative z-10 border-b border-white/5 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 max-w-3xl">
            <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">{ecosystem.eyebrow}</span>
            <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight text-white sm:text-4xl">
              {ecosystem.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">{ecosystem.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            {/* Left Column: Interactive Application Tiers list */}
            <div className="space-y-4 lg:col-span-5">
              {ecosystem.tiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setActiveTier(tier.id)}
                  className={`w-full rounded-xl border p-5 text-left transition-all duration-300 ${
                    activeTier === tier.id
                      ? "border-cyan-500/30 bg-cyan-950/10 shadow-lg shadow-cyan-950/5"
                      : "border-white/5 bg-zinc-900/10 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/5 bg-zinc-950/50">
                        {tierIcons[tier.id]}
                      </div>
                      <span className="font-serif text-lg font-medium text-white">{tier.name}</span>
                    </div>
                    <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                      {tier.tagline}
                    </span>
                  </div>

                  {activeTier === tier.id && (
                    <div className="animate-in fade-in mt-4 space-y-3 duration-300">
                      <p className="text-xs leading-relaxed text-zinc-400">{tier.description}</p>
                      <ul className="space-y-2 border-t border-white/5 pt-2">
                        {tier.keyFeatures.map((feat, index) => (
                          <li key={index} className="flex items-start gap-2 text-[11px] text-zinc-400">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Right Column: D3 Hockey Rink Telemetry Visualizer */}
            <div className="flex flex-col gap-6 lg:col-span-7">
              <RinkTelemetryChart onHoverPlayer={setHoveredPlayer} />

              {/* Telemetry Details Panel */}
              <div className="relative h-36 overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/20 p-6 backdrop-blur-md">
                <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-5">
                  <Activity className="h-28 w-28 text-cyan-400" />
                </div>

                {hoveredPlayer ? (
                  <div className="relative z-10 grid grid-cols-3 items-center gap-4">
                    <div>
                      <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">Skater Name</span>
                      <h4 className="mt-1 truncate font-serif text-lg font-medium text-white">{hoveredPlayer.name}</h4>
                      <span className="mt-2 inline-block rounded border border-white/5 bg-zinc-950/50 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                        {hoveredPlayer.role}
                      </span>
                    </div>

                    <div className="border-l border-white/5 pl-4">
                      <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
                        Physiological Load
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-mono text-2xl font-extrabold text-emerald-400">
                          {hoveredPlayer.heartRate}
                        </span>
                        <span className="text-[10px] text-zinc-500">bpm</span>
                      </div>
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-950/50">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                          style={{ width: `${(hoveredPlayer.heartRate / 200) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="border-l border-white/5 pl-4">
                      <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
                        Skater Velocity
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-mono text-2xl font-extrabold text-cyan-400">{hoveredPlayer.speed}</span>
                        <span className="text-[10px] text-zinc-500">km/h</span>
                      </div>
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-950/50">
                        <div
                          className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                          style={{ width: `${(hoveredPlayer.speed / 45) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
                    <Sparkles className="mb-2 h-5 w-5 animate-bounce text-cyan-400/60" />
                    <p className="max-w-sm text-xs text-zinc-400">
                      Interactive Rink Map connected to MASCE. Hover skater nodes to intercept biomechanics feed in this
                      telemetry console.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Periodical Sub-section (Personalized distribution journals) */}
          <div className="relative mx-auto mt-28 max-w-5xl overflow-hidden rounded-3xl border border-cyan-500/20 bg-cyan-950/10 p-8 sm:p-12">
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">
                  <Send className="h-3.5 w-3.5" />
                  {ecosystem.periodical.eyebrow}
                </span>
                <h3 className="mt-3 font-serif text-2xl leading-snug font-normal tracking-tight text-white sm:text-3xl">
                  {ecosystem.periodical.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-400">{ecosystem.periodical.description}</p>
              </div>
              <div className="flex justify-start lg:col-span-4 lg:justify-end">
                <a
                  href="#beta-access"
                  className="rounded bg-cyan-600 px-5 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-lg shadow-cyan-950/20 transition-all hover:bg-cyan-500"
                >
                  Join Beta Program
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5. TECHNOLOGY PLATFORM */}
      <TechnologyPlatform />

      {/* 4. PRICING & BETA ACCESS */}
      <section id="pricing" className="relative z-10 border-b border-white/5 bg-zinc-950/20 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">{pricing.eyebrow}</span>
            <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight text-white sm:text-4xl">
              {pricing.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">{pricing.subtitle}</p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {pricing.plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col justify-between rounded-xl border p-5 transition-all duration-300 ${
                  plan.popular
                    ? "border-cyan-500/40 bg-zinc-900/60 shadow-xl shadow-cyan-950/15"
                    : "border-white/5 bg-zinc-900/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-x-2">
                    <h3 className={`text-sm font-semibold ${plan.popular ? "text-cyan-400" : "text-white"}`}>
                      {plan.name}
                    </h3>
                    {plan.popular && (
                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[9px] leading-4 font-medium text-cyan-400">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="mt-4 flex items-baseline gap-x-0.5">
                    <span className="font-serif text-2xl font-normal tracking-tight text-white">{plan.price}</span>
                    <span className="text-[10px] font-semibold text-zinc-500">/{plan.billing}</span>
                  </p>
                  <p className="mt-2 text-[10px] leading-normal text-zinc-400 italic">{plan.tagline}</p>

                  <ul className="mt-6 space-y-2.5 border-t border-white/5 pt-4 text-[11px] leading-6 text-zinc-400">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex gap-x-2">
                        <span className="text-cyan-400" aria-hidden="true">
                          ✓
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <a
                    href="#beta-access"
                    className={`block w-full rounded py-2 text-center text-xs font-semibold shadow-sm transition-colors ${
                      plan.popular
                        ? "bg-cyan-600 text-white hover:bg-cyan-500"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {plan.ctaText}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Form placement anchors (Beta Registration) */}
          <div id="beta-access" className="mx-auto mt-24 max-w-3xl scroll-mt-28">
            <BetaSignupForm />
          </div>
        </div>
      </section>

      {/* 5. DOCUMENTATION hub index summary */}
      <section id="docs" className="relative z-10 bg-zinc-950/10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 max-w-3xl">
            <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">{docs.eyebrow}</span>
            <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight text-white sm:text-4xl">{docs.title}</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">{docs.subtitle}</p>
          </div>

          {/* Doc Categories Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {docs.categories.map((category) => (
              <div
                key={category.title}
                className="group flex flex-col justify-between rounded-xl border border-white/5 bg-zinc-900/10 p-5 transition-all hover:border-white/10 hover:bg-zinc-900/20"
              >
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-cyan-500/70 transition-colors group-hover:text-cyan-400" />
                    <h3 className="font-serif text-base font-medium text-white transition-colors group-hover:text-cyan-400">
                      {category.title}
                    </h3>
                  </div>

                  <p className="mb-4 text-[11px] leading-relaxed text-zinc-500">{category.description}</p>

                  <ul className="space-y-2 border-t border-white/5 pt-3">
                    {category.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-x-2 text-[10px] leading-normal text-zinc-400">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-white/5 pt-3">
                  <Link
                    href={category.link}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-500 transition-colors hover:text-cyan-400"
                  >
                    View Reference Documents <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
}
