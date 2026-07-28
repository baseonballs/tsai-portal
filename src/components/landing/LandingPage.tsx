"use client";

import React, { useState, useEffect } from "react";
import { DesktopLanding } from "@/components/landing/DesktopLanding";
import { MobileLanding } from "@/components/landing/MobileLanding";

export function LandingPage() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return <MobileLanding />;
  }

  return <DesktopLanding />;
}
