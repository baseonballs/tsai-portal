"use client";

import React from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BYODSetupWizard } from "@/components/vision/BYODSetupWizard";

export default function BYODSetupPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-cyan-500/35 selection:text-white">
      <LandingHeader />

      <main className="flex flex-col pt-28 pb-20 px-6 lg:px-8">
        <BYODSetupWizard />
      </main>

      <LandingFooter />
    </div>
  );
}
