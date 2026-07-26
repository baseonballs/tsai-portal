"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, FileText, Lock, ArrowLeft, ChevronRight } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function TermsOfServicePage() {
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
              <span>Legal &amp; Governance</span>
            </div>

            <h1 className="text-4xl font-serif font-normal tracking-tight text-white sm:text-6xl mb-6">
              Terms of Service
            </h1>

            <p className="text-sm text-zinc-400 font-mono leading-relaxed max-w-2xl mx-auto mb-6">
              Version 1.0 · Effective Date: July 15, 2026 · Transcendental Sports AI LLC
            </p>

            <div className="inline-flex items-center gap-2 text-xs text-zinc-500 border border-white/10 rounded-full px-4 py-1.5 bg-zinc-900/50">
              <span>Document ID: <strong className="text-zinc-300 font-mono">TSAI-SPOTLIGHT-TOS-1.0</strong></span>
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
                href="/legal/privacy"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View Privacy Policy <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* DOCUMENT CARD */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-8 sm:p-12 backdrop-blur-xl shadow-2xl space-y-12 text-zinc-300 text-sm leading-relaxed">

              {/* SUMMARY BOX */}
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-6 backdrop-blur-md">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Summary for Account Holders
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  Spotlight helps teams review and analyze video you choose to upload. You must have the rights and permissions to upload and process that video, including any rink, league, or subscription service rules that applied when you obtained it. TSAI processes video at your direction and relies on your representations. If a rights issue arises, you are responsible for resolving it with the relevant third parties and for indemnifying TSAI.
                </p>
              </div>

              {/* 1. AGREEMENT TO TERMS */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  1. Agreement to Terms
                </h2>
                <p>
                  These Terms of Service (“<strong>Terms</strong>”) govern your access to and use of Spotlight, including our websites, applications, APIs, and related services. By creating an account, clicking “I agree,” completing onboarding, or otherwise using the Service, you agree to these Terms and our Privacy Policy (collectively, the “<strong>Agreement</strong>”).
                </p>
                <p>
                  If you use the Service on behalf of an organization (a club, team, league, school, or other entity), you represent that you have authority to bind that organization, and “<strong>you</strong>” includes that organization.
                </p>
                <p className="text-amber-400/90 font-medium text-xs">
                  If you do not agree, do not use the Service.
                </p>
              </section>

              {/* 2. DEFINITIONS */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  2. Definitions
                </h2>
                <ul className="space-y-2.5 list-disc list-inside text-zinc-300">
                  <li><strong>“Account”</strong> — your registered Spotlight user profile and credentials.</li>
                  <li><strong>“Authorized Users”</strong> — individuals you invite or who are provisioned under your Account or Organization, as permitted by your subscription tier.</li>
                  <li><strong>“Organization”</strong> — a club, team, league, or other entity on whose behalf an administrator manages Accounts and content.</li>
                  <li><strong>“User Content”</strong> — any video, audio, image, text, data, metadata, or other material you or your Authorized Users upload, import, link, or otherwise provide to the Service, including game footage, clips, rosters, annotations, and derived outputs.</li>
                  <li><strong>“Processing”</strong> — any operation we perform on User Content at your direction, including storage, transcoding, stitching, trimming, computer-vision analysis, indexing, search, display, notification, export, and sharing.</li>
                  <li><strong>“Third-Party Video Source”</strong> — any external origin from which User Content was obtained, including facility camera systems, subscription broadcast services, league platforms, personal recordings, or social platforms.</li>
                </ul>
              </section>

              {/* 3. THE SERVICE */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  3. The Service
                </h2>
                <p>
                  Spotlight is a cloud workspace for sports organizations to ingest, organize, process, review, and collaborate on video and related analytics. Features vary by plan and may include automated pipelines, review tools, notifications, and integrations.
                </p>
                <p>
                  We may modify, suspend, or discontinue features with reasonable notice where practicable. The Service is provided on an “as is” and “as available” basis.
                </p>
              </section>

              {/* 4. ACCOUNTS, ELIGIBILITY & SECURITY */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  4. Accounts, Eligibility, and Security
                </h2>
                <h3 className="text-sm font-semibold text-zinc-200 mt-2">4.1 Eligibility</h3>
                <p>
                  You must be at least 18 years old to create an Account. If you are under 18, you may use the Service only with involvement of a parent, guardian, or authorized coach or organization administrator who accepts these Terms on your behalf.
                </p>
                <h3 className="text-sm font-semibold text-zinc-200 mt-2">4.2 Registration &amp; Security</h3>
                <p>
                  You agree to provide accurate information and keep it current. You are responsible for safeguarding credentials and for all activity under your Account. Notify us promptly of unauthorized access.
                </p>
                <h3 className="text-sm font-semibold text-zinc-200 mt-2">4.3 Organizational Accounts</h3>
                <p>
                  Organization administrators are responsible for provisioning Authorized Users, configuring access controls, and ensuring that all Authorized Users comply with this Agreement.
                </p>
              </section>

              {/* 5. USER CONTENT — OWNERSHIP & LICENSE */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  5. User Content — Ownership and License to TSAI
                </h2>
                <p>
                  <strong>5.1 Your Ownership:</strong> As between you and TSAI, you retain ownership of User Content. We do not claim ownership of your raw footage or uploaded materials.
                </p>
                <p>
                  <strong>5.2 License You Grant:</strong> You grant TSAI a non-exclusive, worldwide, royalty-free license to host, reproduce, adapt, transcode, analyze, display, and otherwise Process User Content solely to operate, maintain, secure, and improve the Service, deliver requested AI analysis tools, and comply with law.
                </p>
                <p>
                  <strong>5.3 Sharing You Enable:</strong> If you use sharing, export, or notification features, you direct us to make User Content or derivatives available to recipients you specify. You are responsible for those choices.
                </p>
              </section>

              {/* 6. THIRD-PARTY VIDEO SOURCES */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  6. Third-Party Video Sources &amp; Compliance
                </h2>
                <p>
                  Many users obtain game video from Third-Party Video Sources governed by separate terms, subscriptions, league rules, or facility policies. <strong>You are solely responsible</strong> for determining whether you may upload, store, and authorize Processing of User Content.
                </p>
                <p>
                  TSAI is not affiliated with, sponsored by, or endorsed by any Third-Party Video Source unless expressly stated in writing. Automated Processing is performed strictly at your request.
                </p>
              </section>

              {/* 7. REPRESENTATIONS & WARRANTIES */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  7. Representations and Warranties
                </h2>
                <p>You represent and warrant that:</p>
                <ul className="space-y-2 list-disc list-inside text-zinc-300">
                  <li>You own User Content or have obtained all necessary rights, licenses, and permissions.</li>
                  <li>You have complied with all restrictions imposed by Third-Party Video Sources and governing bodies.</li>
                  <li>User Content does not violate any third party’s intellectual property, privacy, or contractual rights.</li>
                  <li>Where User Content depicts minors, you have obtained appropriate organizational or parental consent.</li>
                </ul>
              </section>

              {/* 8. ACCEPTABLE USE */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  8. Acceptable Use and Prohibited Conduct
                </h2>
                <p>You agree not to:</p>
                <ul className="space-y-2 list-disc list-inside text-zinc-300">
                  <li>Upload or Process content without proper rights or authorization.</li>
                  <li>Circumvent access controls or digital rights management of any Third-Party Video Source.</li>
                  <li>Use the Service for unlawful, harmful, or fraudulent purposes.</li>
                  <li>Reverse engineer, decompile, or disrupt the Service infrastructure.</li>
                </ul>
              </section>

              {/* 9. INTELLECTUAL PROPERTY */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  9. Intellectual Property — TSAI Materials
                </h2>
                <p>
                  The Service, including software, models, pipelines, interface, and trademarks, is owned by TSAI. DMCA copyright infringement notices may be submitted to <strong className="text-cyan-400">legal@tsai-spotlight.com</strong>.
                </p>
              </section>

              {/* 10. PRIVACY */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  10. Privacy
                </h2>
                <p>
                  Our collection and use of personal information is described in our <Link href="/legal/privacy" className="text-cyan-400 underline hover:text-cyan-300">Privacy Policy</Link>, incorporated herein by reference.
                </p>
              </section>

              {/* 11. INDEMNIFICATION */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  11. Indemnification
                </h2>
                <p>
                  You agree to defend, indemnify, and hold harmless TSAI, its affiliates, officers, and agents from any claims, damages, liabilities, or expenses arising from User Content, breach of this Agreement, or violation of third-party video source terms.
                </p>
              </section>

              {/* 12 & 13. DISCLAIMERS & LIMITATION OF LIABILITY */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  12 &amp; 13. Disclaimers and Limitation of Liability
                </h2>
                <p className="uppercase text-xs font-mono tracking-wider text-zinc-400">
                  THE SERVICE AND ALL OUTPUTS ARE PROVIDED “AS IS” WITHOUT WARRANTIES OF ANY KIND. TSAI’S TOTAL LIABILITY WILL NOT EXCEED THE GREATER OF US $100 OR AMOUNTS PAID IN THE PRIOR 12 MONTHS.
                </p>
              </section>

              {/* 14. DISPUTE RESOLUTION */}
              <section className="space-y-3">
                <h2 className="text-xl font-serif font-semibold text-white border-b border-white/10 pb-2">
                  14. Dispute Resolution &amp; Governing Law
                </h2>
                <p>
                  Any dispute will be resolved through 30-day informal resolution or binding arbitration in Minnesota, USA, under AAA Commercial Arbitration Rules. Governing law: State of Minnesota, USA.
                </p>
              </section>

              {/* 15 & 16. SUSPENSION & GENERAL */}
              <section className="space-y-3 border-t border-white/10 pt-6">
                <h2 className="text-xl font-serif font-semibold text-white">
                  15 &amp; 16. Suspension, Termination, and Contact
                </h2>
                <p>
                  We may suspend or terminate access immediately for breach or legal compliance.
                </p>
                <div className="pt-4 font-mono text-xs text-zinc-400">
                  Transcendental Sports AI LLC · Legal Department <br />
                  Email: <a href="mailto:legal@tsai-spotlight.com" className="text-cyan-400 underline hover:text-cyan-300">legal@tsai-spotlight.com</a>
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
