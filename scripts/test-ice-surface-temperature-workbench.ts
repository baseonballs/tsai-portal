import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { IceSurfaceTemperatureWorkbench } from "../src/components/operations/IceSurfaceTemperatureWorkbench";
import { SheetThermalData } from "../src/types/ice-surface-portal-types";

function runIceSurfaceWorkbenchAudit() {
  console.log("=== TRANSCEND PORTAL: ICE SURFACE WORKBENCH AUDIT ===");

  const sampleSheets: SheetThermalData[] = [
    {
      sheetId: "sheet-a",
      sheetName: "Rink A (NHL Stadium)",
      iceSurfaceTemperatureCelsius: -5.2,
      subFloorBrineTemperatureCelsius: -9.8,
      ambientAirTemperatureCelsius: 9.0,
      ambientRelativeHumidityPct: 28.0,
      estimatedKineticFriction: 0.038,
      condensationRisk: false,
      status: "OPTIMAL_FAST",
      minutesRemainingUntilDegraded: 75,
      recommendedCutDepthMm: 1.0,
      recommendedWaterTempC: 58.0,
    },
    {
      sheetId: "sheet-b",
      sheetName: "Rink B (Olympic)",
      iceSurfaceTemperatureCelsius: -2.8,
      subFloorBrineTemperatureCelsius: -6.5,
      ambientAirTemperatureCelsius: 16.0,
      ambientRelativeHumidityPct: 55.0,
      estimatedKineticFriction: 0.062,
      condensationRisk: true,
      status: "DEGRADED_SLOW",
      minutesRemainingUntilDegraded: 15,
      recommendedCutDepthMm: 1.8,
      recommendedWaterTempC: 60.0,
    },
  ];

  const html = renderToStaticMarkup(
    React.createElement(IceSurfaceTemperatureWorkbench, { sheets: sampleSheets })
  );

  console.log("1. Verifying HTML generation...");
  if (!html || html.length < 100) {
    throw new Error("Failed to render IceSurfaceTemperatureWorkbench HTML markup");
  }

  console.log("2. Auditing Zero-Purple Palette Invariant (INV-4)...");
  const purpleTokens = ["purple", "violet", "fuchsia", "indigo"];
  for (const token of purpleTokens) {
    if (html.toLowerCase().includes(token)) {
      throw new Error(`Purple palette leakage detected in IceSurfaceTemperatureWorkbench: ${token}`);
    }
  }

  console.log("3. Verifying Key Structural Elements...");
  if (!html.includes("PAT-P406") || !html.includes("Rink A (NHL Stadium)") || !html.includes("-5.2°C")) {
    throw new Error("Missing critical operational indicators in rendered workbench markup");
  }

  console.log("🎉 ALL ICE SURFACE WORKBENCH INVARIANTS SATISFIED (0 REGRESSIONS)");
}

runIceSurfaceWorkbenchAudit();
