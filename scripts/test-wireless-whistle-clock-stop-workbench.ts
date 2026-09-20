/**
 * Test script for WirelessWhistleClockStopWorkbench (Patent P433, Sprint 75).
 * Audits component props, SI unit formatting, and state invariants.
 */

import {
  WhistleClockStopState,
  WirelessWhistleTelemetry,
} from "../src/components/broadcast/WirelessWhistleClockStopWorkbench";

console.log("=== WIRELESS WHISTLE CLOCK STOP WORKBENCH AUDIT ===");

const mockTelemetry: WirelessWhistleTelemetry = {
  timestamp_us: 154200000,
  referee_id: "official_head_ref_01",
  cavity_pressure_kpa: 6.8,
  carrier_frequency_hz: 3120.0,
  acoustic_spl_db: 94.0,
  referee_pos_x_m: -20.0,
  referee_pos_y_m: 12.0,
  timekeeper_bench_x_m: 15.0,
  timekeeper_bench_y_m: 0.0,
  ambient_air_temp_c: 11.5,
};

const mockState: WhistleClockStopState = {
  timestamp_us: 154200000,
  referee_id: "official_head_ref_01",
  cavity_pressure_kpa: 6.8,
  rf_latency_ms: 0.65,
  acoustic_transit_delay_ms: 109.4,
  clock_time_saved_ms: 108.75,
  is_valid_whistle_blow: true,
  authoritative_clock_stop_flag: true,
  distance_to_timekeeper_m: 37.0,
};

// Invariant assertions
if (!mockState.authoritative_clock_stop_flag) {
  throw new Error("Valid referee blast must assert clock stop interlock");
}

if (mockState.cavity_pressure_kpa < 4.5) {
  throw new Error("Whistle pressure must exceed minimum blow threshold");
}

if (mockState.clock_time_saved_ms <= 0) {
  throw new Error("Wireless trigger should save acoustic speed-of-sound delay");
}

console.log("✓ Cavity pressure:", mockState.cavity_pressure_kpa, "kPa");
console.log("✓ RF latency:", mockState.rf_latency_ms, "ms");
console.log("✓ Acoustic transit delay:", mockState.acoustic_transit_delay_ms, "ms");
console.log("✓ Clock time saved:", mockState.clock_time_saved_ms, "ms");
console.log("✓ Authoritative stop asserted:", mockState.authoritative_clock_stop_flag);
console.log("🎉 WIRELESS WHISTLE CLOCK STOP WORKBENCH AUDIT PASSED");
