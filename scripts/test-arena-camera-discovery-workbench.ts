import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArenaCameraDiscoveryWorkbench } from "../src/components/onboarding/ArenaCameraDiscoveryWorkbench";
import { DiscoveredCameraFeed } from "../src/types/camera-discovery-types";

function runCameraDiscoveryWorkbenchAudit() {
  console.log("=== TRANSCEND PORTAL: CAMERA DISCOVERY WORKBENCH AUDIT ===");

  const sampleFeeds: DiscoveredCameraFeed[] = [
    {
      ipAddress: "192.168.10.101",
      macAddress: "00:04:4B:88:12:34",
      manufacturer: "Sony",
      modelName: "FR7 PTZ Cinema",
      rtspUrl: "rtsp://192.168.10.101:554/live/4k",
      width: 3840,
      height: 2160,
      fps: 59.94,
      latencyMs: 18.2,
      clockDriftMs: 1.8,
      isCompliant4k60: true,
      status: "READY",
    },
    {
      ipAddress: "192.168.10.102",
      macAddress: "00:04:4B:88:12:35",
      manufacturer: "Axis",
      modelName: "P1448-LE",
      rtspUrl: "rtsp://192.168.10.102:554/live",
      width: 1920,
      height: 1080,
      fps: 60.0,
      latencyMs: 22.0,
      clockDriftMs: 2.5,
      isCompliant4k60: false,
      status: "UNSUPPORTED",
    },
  ];

  const html = renderToStaticMarkup(
    React.createElement(ArenaCameraDiscoveryWorkbench, { cameras: sampleFeeds })
  );

  console.log("1. Verifying HTML generation...");
  if (!html || html.length < 100) {
    throw new Error("Failed to render ArenaCameraDiscoveryWorkbench HTML markup");
  }

  console.log("2. Auditing Zero-Purple Palette Invariant (INV-4)...");
  const purpleTokens = ["purple", "violet", "fuchsia", "indigo"];
  for (const token of purpleTokens) {
    if (html.toLowerCase().includes(token)) {
      throw new Error(`Purple palette leakage detected in ArenaCameraDiscoveryWorkbench: ${token}`);
    }
  }

  console.log("3. Verifying Camera Discovery Elements...");
  if (!html.includes("Sony FR7 PTZ Cinema") || !html.includes("4K60 CERTIFIED") || !html.includes("192.168.10.101")) {
    throw new Error("Missing critical camera feed information in rendered discovery markup");
  }

  console.log("🎉 ALL CAMERA DISCOVERY WORKBENCH INVARIANTS SATISFIED (0 REGRESSIONS)");
}

runCameraDiscoveryWorkbenchAudit();
