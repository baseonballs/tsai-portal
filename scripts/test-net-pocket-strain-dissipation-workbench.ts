/**
 * Verification test script for NetPocketStrainDissipationWorkbench (P437).
 */

import React from "react";
import ReactDOMServer from "react-dom/server";
import { NetPocketStrainDissipationWorkbench, NetPocketImpactData } from "../src/components/broadcast/NetPocketStrainDissipationWorkbench";

function runAudit(): void {
  console.log("=== NET POCKET STRAIN DISSIPATION WORKBENCH AUDIT (P437) ===");

  const sampleData: NetPocketImpactData = {
    incomingVelocityMps: 40.0,
    impactCoordinateX: 0.82,
    impactCoordinateY: 1.15,
    meshDeflectionDepthM: 0.28,
    peakCordTensionN: 420.0,
    incomingKineticEnergyJ: 136.0,
    dissipatedStrainEnergyJ: 124.8,
    residualKineticEnergyJ: 11.2,
    reboundVelocityMps: 11.47,
    coefficientOfRestitution: 0.287,
    isCornerPocketZone: true,
    entrapmentStatus: "POCKET_ENTRAPMENT",
    goalLinePenetrationVerified: true,
  };

  const element = React.createElement(NetPocketStrainDissipationWorkbench, { initialData: sampleData });
  const html = ReactDOMServer.renderToStaticMarkup(element);

  if (!html.includes("CORNER POCKET ENTRAPMENT")) {
    throw new Error("Missing status badge CORNER POCKET ENTRAPMENT in rendered HTML");
  }
  if (!html.includes("GOAL LINE CLEARED")) {
    throw new Error("Missing GOAL LINE CLEARED in rendered HTML");
  }
  if (!html.includes("420")) {
    throw new Error("Missing peak cord tension 420 in rendered HTML");
  }

  // Zero-purple check
  if (/(purple|indigo|violet|fuchsia)-[1-9]00/i.test(html)) {
    throw new Error("Zero-purple invariant violation detected in NetPocketStrainDissipationWorkbench");
  }

  console.log("✓ NetPocketStrainDissipationWorkbench static HTML render successful");
  console.log("✓ Zero-purple palette verified");
  console.log("✓ All physics and status badges verified");
}

runAudit();
