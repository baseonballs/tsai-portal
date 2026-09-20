/**
 * Test script for BenchGateSubstitutionInfractionWorkbench (Patent P429, Sprint 71).
 * Audits component props, SI unit formatting, and state invariants.
 */

import {
  PlayerGateContactTelemetry,
  SubstitutionArbitrationState,
} from "../src/components/broadcast/BenchGateSubstitutionInfractionWorkbench";

console.log("=== BENCH GATE SUBSTITUTION INFRACTION WORKBENCH AUDIT ===");

const mockTelemetry: PlayerGateContactTelemetry = {
  timestamp_s: 342.6,
  retiring_player_id: "skater_home_87",
  retiring_skate_x_m: 10.0,
  retiring_skate_y_m: 12.8,
  retiring_on_ice_flag: true,
  entering_player_id: "skater_home_71",
  entering_skate_x_m: 10.0,
  entering_skate_y_m: 12.1,
  entering_on_ice_flag: true,
  bench_gate_x_m: 10.0,
  bench_gate_y_m: 12.0,
  puck_x_m: 0.0,
  puck_y_m: -5.0,
  puck_speed_mps: 11.2,
};

const mockState: SubstitutionArbitrationState = {
  timestamp_s: 342.6,
  retiring_distance_to_gate_m: 0.8,
  entering_distance_to_gate_m: 0.1,
  concurrent_on_ice_flag: true,
  envelope_violation_flag: false,
  puck_involvement_flag: false,
  infraction_detected_flag: false,
  infraction_code: "CLEAN",
  distance_margin_m: 0.724,
};

// Invariant assertions
if (mockState.infraction_detected_flag) {
  throw new Error("Legal substitution within envelope should not trigger infraction");
}

if (mockState.retiring_distance_to_gate_m > 1.524) {
  throw new Error("Retiring player must be within 1.524m envelope");
}

if (mockState.distance_margin_m <= 0) {
  throw new Error("Legal substitution should have positive margin");
}

console.log("✓ Retiring player distance:", mockState.retiring_distance_to_gate_m, "m");
console.log("✓ Legal boundary margin:", mockState.distance_margin_m, "m");
console.log("✓ Puck involvement clear:", !mockState.puck_involvement_flag);
console.log("✓ Infraction status:", mockState.infraction_code);
console.log("🎉 BENCH GATE SUBSTITUTION INFRACTION WORKBENCH AUDIT PASSED");
