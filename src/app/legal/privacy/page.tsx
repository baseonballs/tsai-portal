"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, FileText, ArrowLeft, ChevronRight, UserCheck, Check } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500 selection:text-zinc-950">
      {/* HEADER */}
      <LandingHeader />

      <main className="relative overflow-hidden">
        {/* HERO HEADER */}
        <section className="relative px-6 pt-20 pb-16 lg:px-8 border-b border-white/10 bg-gradient-to-b from-zinc-900/60 via-zinc-950 to-zinc-950">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-fuchsia-500/10 blur-[120px] pointer-events-none" />

          <div className="mx-auto max-w-4xl text-center relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-cyan-400 uppercase font-mono mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy &amp; COPPA Compliance</span>
            </div>

            <h1 className="text-4xl font-serif font-normal tracking-tight text-white sm:text-6xl mb-6">
              Privacy Policy
            </h1>

            <p className="text-sm text-zinc-400 font-mono leading-relaxed max-w-2xl mx-auto mb-6">
              Version 1.0 · Effective Date: July 15, 2026 · Transcendental Sports AI LLC
            </p>

            <div className="inline-flex items-center gap-2 text-xs text-zinc-500 border border-white/10 rounded-full px-4 py-1.5 bg-zinc-900/50">
              <span>Document ID: <strong className="text-zinc-300 font-mono">TSAI-SPOTLIGHT-PRIVACY-1.0</strong></span>
            </div>
          </div>
        </section>

        {/* CONTENT SECTION */}
        <section className="px-6 py-16 lg:px-8 bg-zinc-950">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>
              <Link
                href="/legal/terms"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View Terms of Service <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* DOCUMENT CARD */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-8 sm:p-12 backdrop-blur-xl shadow-2xl space-y-12 text-zinc-300 text-sm leading-relaxed">

              {/* 1. SCOPE */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  1. Scope &amp; Purpose
                </h2>
                <p>
                  This Privacy Policy describes how Transcendental Sports AI LLC (“<strong>TSAI</strong>,” “<strong>we</strong>,” “<strong>us</strong>,” or “<strong>our</strong>”) collects, uses, stores, and shares personal information in connection with TSAI Spotlight, Periodical, Watson admin control plane, and related sports intelligence services (the “<strong>Services</strong>”).
                </p>
                <p>
                  We are committed to maintaining strict data privacy standards, particularly regarding youth athlete information, video telemetry, and parental controls.
                </p>
              </section>

              {/* 2. AGE FRAMEWORK & COPPA */}
              <section className="space-y-4">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  2. Age Framework &amp; COPPA Compliance
                </h2>
                <p>
                  We enforce date-of-birth gating at onboarding to apply strict age-appropriate security frameworks:
                </p>

                <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-950/60 p-4">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 font-mono">
                        <th className="pb-3 pt-1 px-3">Age Group</th>
                        <th className="pb-3 pt-1 px-3">Framework</th>
                        <th className="pb-3 pt-1 px-3">Consent &amp; Safeguards</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                      <tr>
                        <td className="py-3 px-3 font-semibold text-amber-400">Under 13</td>
                        <td className="py-3 px-3 font-mono">COPPA</td>
                        <td className="py-3 px-3">Verifiable Parental Consent (VPC) required prior to collecting personal information. Children's Privacy Addendum applies.</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-semibold text-cyan-400">13–17</td>
                        <td className="py-3 px-3 font-mono">ToS §4.1</td>
                        <td className="py-3 px-3">Supervised use by parent, guardian, or team staff; teen acknowledgment at onboarding.</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-semibold text-zinc-200">18+</td>
                        <td className="py-3 px-3 font-mono">Standard ToS</td>
                        <td className="py-3 px-3">Full account holder authority; may administer linked athlete profiles.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 3. CATEGORIES OF PERSONAL INFORMATION */}
              <section className="space-y-4">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  3. Categories of Personal Information Collected
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/5 bg-zinc-950/40 p-4">
                    <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase mb-1">Account Identifiers</h3>
                    <p className="text-xs text-zinc-400">Email address, display name, user avatar, profile credentials (Supabase Auth).</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-zinc-950/40 p-4">
                    <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase mb-1">Contact &amp; Consent</h3>
                    <p className="text-xs text-zinc-400">Parent/guardian email address, parental consent verifications, contact details.</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-zinc-950/40 p-4">
                    <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase mb-1">Athlete Roster Profile</h3>
                    <p className="text-xs text-zinc-400">Team affiliation, jersey number, position, skill benchmarks, coach assignments.</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-zinc-950/40 p-4">
                    <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase mb-1">User Content &amp; Media</h3>
                    <p className="text-xs text-zinc-400">Uploaded game/training video, Periodical journal reflections, voice note cuts, annotations.</p>
                  </div>
                </div>
              </section>

              {/* 4. PURPOSES OF PROCESSING */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  4. Purposes of Data Processing
                </h2>
                <ul className="space-y-2 list-disc list-inside text-zinc-300">
                  <li>Provide secure authentication, account onboarding, and organization management.</li>
                  <li>Deliver video intelligence features (Cut Room Workbench, shift parsing, micro-loop feeds).</li>
                  <li>Enforce COPPA parental verification and minor safety controls.</li>
                  <li>Perform spatial tracking and computer-vision telemetry analysis at your direction.</li>
                  <li>Maintain platform security, prevent abuse, and administer customer support.</li>
                </ul>
              </section>

              {/* 5. SUBPROCESSORS & INFRASTRUCTURE */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  5. Subprocessors &amp; Cloud Infrastructure
                </h2>
                <p>
                  We utilize enterprise cloud service providers to maintain platform resilience and security:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-white/5 bg-zinc-950/60 font-mono"><strong className="text-white">Supabase:</strong> Authentication &amp; Database</div>
                  <div className="p-3 rounded-lg border border-white/5 bg-zinc-950/60 font-mono"><strong className="text-white">Google Cloud (GCP):</strong> Secure Hosting &amp; Ingress</div>
                  <div className="p-3 rounded-lg border border-white/5 bg-zinc-950/60 font-mono"><strong className="text-white">Temporal:</strong> Fault-Tolerant Workflow Processing</div>
                  <div className="p-3 rounded-lg border border-white/5 bg-zinc-950/60 font-mono"><strong className="text-white">Google Gemini:</strong> AI Insight Processing</div>
                </div>
              </section>

              {/* 6. CHILDREN'S PRIVACY ADDENDUM (COPPA) */}
              <section className="space-y-4 rounded-2xl border border-amber-500/30 bg-amber-950/10 p-6 backdrop-blur-md">
                <h2 className="text-lg font-serif font-semibold text-amber-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Children's Privacy Addendum (COPPA — Under 13)
                </h2>
                <p className="text-xs text-zinc-300">
                  This Addendum applies when TSAI collects personal information online from a child under 13 under the U.S. Children's Online Privacy Protection Act (COPPA).
                </p>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Parental Consent:</strong> Verifiable Parental Consent (VPC) must be granted by a parent/guardian prior to account activation for any user under 13.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Parental Rights:</strong> Parents may review, request deletion of, or refuse further collection of their child’s personal information at any time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Data Isolation:</strong> Under-13 athlete profiles are isolated with restricted sharing rules, accessible strictly to linked parents and authorized team coaches.</span>
                  </li>
                </ul>
              </section>

              {/* 7. RETENTION & USER RIGHTS */}
              <section className="space-y-3 border-t border-white/10 pt-6">
                <h2 className="text-xl font-serif font-semibold text-white">
                  7. Retention, Deletion &amp; Contact Information
                </h2>
                <p>
                  Parents and adult users may exercise data privacy rights, request account deletion, or contact our privacy operations team directly:
                </p>
                <div className="pt-2 font-mono text-xs text-zinc-400 space-y-1">
                  <div>Transcendental Sports AI LLC · Data Privacy Operations</div>
                  <div>Email: <a href="mailto:privacy@transcendentalsports.ai" className="text-cyan-400 underline hover:text-cyan-300">privacy@transcendentalsports.ai</a></div>
                  <div>Legal inquiries: <a href="mailto:legal@tsai-spotlight.com" className="text-cyan-400 underline hover:text-cyan-300">legal@tsai-spotlight.com</a></div>
                </div>
              </section>

            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
}
