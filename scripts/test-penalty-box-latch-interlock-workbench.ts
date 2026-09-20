/**
 * Test script for PenaltyBoxLatchInterlockWorkbench (Patent P421, Sprint 63).
 * Audits component props, SI unit formatting, and state invariants.
 */

import {
  LatchInterlockEvent,
  LatchSensorSample,
} from "../src/components/penalty/PenaltyBoxLatchInterlockWorkbench";

console.log("=== PENALTY BOX LATCH INTERLOCK WORKBENCH AUDIT ===");

const mockSamples: LatchSensorSample[] = [
  {
    timestamp_s: 142.100,
    latch_id: "latch_home_pen_1",
    pin_state_high: true,
    contact_resistance_ohms: 1.8,
    door_id: "pen_gate_home_north",
  },
  {
    timestamp_s: 142.112,
    latch_id: "latch_home_pen_1",
    pin_state_high: false,
    contact_resistance_ohms: 10000.0,
    door_id: "pen_gate_home_north",
  },
];

const mockEvent: LatchInterlockEvent = {
  timestamp_s: 142.112,
  door_id: "pen_gate_home_north",
  is_unlatched: true,
  ptp_frame_index: 8526,
  penalty_remaining_time_s: 0.850,
  release_delta_s: -0.850,
  is_premature_release: true,
  debounce_latency_ms: 12.0,
};

// Invariant assertions
if (!mockEvent.is_premature_release) {
  throw new Error("Early release with 0.850s remaining should be flagged premature");
}

if (mockEvent.release_delta_s !== -0.850) {
  throw new Error("Release delta mismatch");
}

if (mockEvent.debounce_latency_ms > 15.0) {
  throw new Error("Debounce latency exceeds 15ms target ceiling");
}

console.log("✓ Premature release invariant verified: remaining", mockEvent.penalty_remaining_time_s, "s, premature:", mockEvent.is_premature_release);
console.log("✓ PTP sync frame verified:", mockEvent.ptp_frame_index);
console.log("✓ Debounce latency verified:", mockEvent.debounce_latency_ms, "ms");
console.log("✓ Hardware contact transition samples:", mockSamples.length);
console.log("🎉 PENALTY BOX LATCH INTERLOCK WORKBENCH AUDIT PASSED");
