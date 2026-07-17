"use client";

import React, { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BetaSignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    org: "",
    role: "coach",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Please fill in your name and email address.");
      return;
    }

    setSubmitting(true);
    // Simulate API registration
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Beta request submitted! Your account is queued for administrator approval.");
      setFormData({
        name: "",
        email: "",
        org: "",
        role: "coach",
      });
    }, 1500);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/30 p-8 shadow-2xl backdrop-blur-xl">
      {/* Background glow overlay */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10">
        <h3 className="mb-2 font-serif text-2xl font-normal text-white">Apply for Beta Access</h3>
        <p className="mb-6 text-sm text-zinc-400">
          TSAI Spotlight is currently in private beta. Submit your details below to request a workspace licensing seat.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <label className="mb-1.5 block font-mono text-xs tracking-wider text-zinc-500 uppercase">
              Contact Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Coach Anderson"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border-white/10 bg-zinc-950/40 focus-visible:ring-cyan-500/50"
              required
            />
          </div>

          <div suppressHydrationWarning>
            <label className="mb-1.5 block font-mono text-xs tracking-wider text-zinc-500 uppercase">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="e.g. coach@lions-hockey.org"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border-white/10 bg-zinc-950/40 focus-visible:ring-cyan-500/50"
              required
            />
          </div>

          <div suppressHydrationWarning>
            <label className="mb-1.5 block font-mono text-xs tracking-wider text-zinc-500 uppercase">
              Program / Organization
            </label>
            <Input
              type="text"
              placeholder="e.g. LA Lions 14U AAA"
              value={formData.org}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, org: e.target.value })
              }
              className="border-white/10 bg-zinc-950/40 focus-visible:ring-cyan-500/50"
            />
          </div>

          <div suppressHydrationWarning>
            <label className="mb-1.5 block font-mono text-xs tracking-wider text-zinc-500 uppercase">
              Primary Role
            </label>
            <select
              value={formData.role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="h-9 w-full rounded-md border border-white/10 bg-zinc-950/40 px-3 text-sm text-zinc-300 shadow-xs outline-none focus-visible:border-cyan-500 focus-visible:ring-[3px] focus-visible:ring-cyan-500/50"
            >
              <option value="coach">Head Coach / Team Analyst</option>
              <option value="player">Elite Prospect / Skater</option>
              <option value="parent">Invested Parent</option>
              <option value="scout">Professional Scout / Recruiter</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full bg-cyan-600 font-medium text-white shadow-lg shadow-cyan-950/20 transition-transform hover:bg-cyan-500 active:scale-98"
          >
            {submitting ? "Submitting Request..." : "Request Workspace Access"}
          </Button>
        </form>
      </div>
    </div>
  );
}
