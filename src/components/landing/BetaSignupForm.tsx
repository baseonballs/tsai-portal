"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BetaSignupForm() {
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [primaryRole, setPrimaryRole] = useState("parent");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = contactName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      setErrorMessage("Please enter both your name and email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/beta-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact_name: trimmedName,
          email: trimmedEmail,
          organization: organization.trim(),
          primary_role: primaryRole,
          submission_source: "portal_landing",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit beta request. Please try again.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "success") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 font-mono text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Application Queued</span>
          </div>

          <h3 className="font-serif text-2xl font-normal text-white">Application Received</h3>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Thank you, <strong className="text-white">{contactName}</strong>. Your beta application for{" "}
            <strong className="text-emerald-300 font-mono">{email}</strong> has been submitted to the Transcend team.
          </p>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs text-zinc-300">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next Steps for Activation</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11.5px]">
              Upon administrator review, you will receive an official Transcend Welcome Email containing your direct single-click <strong>Claim &amp; Activate</strong> button. You will be able to claim your spot and complete onboarding without re-entering an invitation request.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setContactName("");
              setEmail("");
              setOrganization("");
            }}
            className="text-xs text-zinc-400 hover:text-cyan-400 underline font-medium pt-2 transition"
          >
            Submit another application &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/30 p-8 shadow-2xl backdrop-blur-xl">
      {/* Background glow overlay */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 font-mono text-xs font-semibold text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Private Teams Beta Cohort</span>
        </div>

        <h3 className="mb-2 font-serif text-2xl font-normal text-white">Apply for Beta Access</h3>
        <p className="mb-6 text-sm text-zinc-400">
          Transcend Platform is accepting applications for the upcoming competitive season. Approved applicants receive immediate access to the Periodical journal and Spotlight telemetry.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <label className="mb-1.5 block font-mono text-xs tracking-wider text-zinc-400 uppercase font-semibold">
              Contact Name *
            </label>
            <Input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Coach Anderson"
              className="border-white/10 bg-zinc-950/60 text-white placeholder:text-zinc-600 focus:border-cyan-500"
            />
          </div>

          <div suppressHydrationWarning>
            <label className="mb-1.5 block font-mono text-xs tracking-wider text-zinc-400 uppercase font-semibold">
              Email Address *
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. coach@lions-hockey.org"
              className="border-white/10 bg-zinc-950/60 text-white placeholder:text-zinc-600 focus:border-cyan-500"
            />
          </div>

          <div suppressHydrationWarning>
            <label className="mb-1.5 block font-mono text-xs tracking-wider text-zinc-400 uppercase font-semibold">
              Program / Organization
            </label>
            <Input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. LA Lions 14U AAA"
              className="border-white/10 bg-zinc-950/60 text-white placeholder:text-zinc-600 focus:border-cyan-500"
            />
          </div>

          <div suppressHydrationWarning>
            <label className="mb-1.5 block font-mono text-xs tracking-wider text-zinc-400 uppercase font-semibold">
              Primary Role
            </label>
            <select
              value={primaryRole}
              onChange={(e) => setPrimaryRole(e.target.value)}
              className="h-10 w-full rounded-md border border-white/10 bg-zinc-950/80 px-3 text-sm text-zinc-200 shadow-xs outline-none focus:border-cyan-500 transition"
            >
              <option value="parent">Parent / Legal Guardian</option>
              <option value="player">Elite Prospect / Skater</option>
              <option value="coach">Head Coach / Team Analyst</option>
              <option value="scout">Professional Scout / Recruiter</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full h-11 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <span>Request Beta Access</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
