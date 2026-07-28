"use client";

import React from "react";
import { DesktopLanding } from "@/components/landing/DesktopLanding";
import { MobileLanding } from "@/components/landing/MobileLanding";

export function LandingPage() {
  return (
    <div suppressHydrationWarning>
      {/* Desktop viewports (md and up) */}
      <div className="hidden md:block" suppressHydrationWarning>
        <DesktopLanding />
      </div>

      {/* Mobile viewports (below md) */}
      <div className="block md:hidden" suppressHydrationWarning>
        <MobileLanding />
      </div>
    </div>
  );
}
