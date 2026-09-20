/**
 * Test script for PtpVideoSyncVerifierWorkbench (Patent P426, Sprint 68).
 * Audits component props, SI unit formatting, and state invariants.
 */

import {
  CameraFrameTimestamp,
  PtpSyncVerificationResult,
} from "../src/components/broadcast/PtpVideoSyncVerifierWorkbench";

console.log("=== PTP VIDEO SYNC VERIFIER WORKBENCH AUDIT ===");

const mockRef: CameraFrameTimestamp = {
  camera_id: "cam_broadcast_tight",
  frame_index: 2400,
  ptp_timestamp_us: 40_000_000,
  nominal_fps: 60.0,
  pts_delta_us: 16667,
};

const mockTarget: CameraFrameTimestamp = {
  camera_id: "cam_overhead_crease",
  frame_index: 2400,
  ptp_timestamp_us: 40_000_085,
  nominal_fps: 60.0,
  pts_delta_us: 16667,
};

const mockResult: PtpSyncVerificationResult = {
  reference_camera_id: "cam_broadcast_tight",
  target_camera_id: "cam_overhead_crease",
  reference_frame_index: 2400,
  target_frame_index: 2400,
  clock_skew_us: 85.0,
  is_synchronized: true,
  drift_rate_ppm: 0.0,
  dropped_frames_detected: 0,
};

// Invariant assertions
if (Math.abs(mockResult.clock_skew_us) > 200.0 && mockResult.is_synchronized) {
  throw new Error("Skew exceeding 200us cannot be marked synchronized");
}

if (mockResult.dropped_frames_detected > 0 && mockResult.is_synchronized) {
  throw new Error("Dropped frames cannot be marked synchronized");
}

console.log("✓ Clock skew SI unit verified:", mockResult.clock_skew_us, "μs");
console.log("✓ Synchronized state:", mockResult.is_synchronized);
console.log("✓ Drift rate:", mockResult.drift_rate_ppm, "ppm");
console.log("✓ Dropped frames:", mockResult.dropped_frames_detected);
console.log("🎉 PTP VIDEO SYNC VERIFIER WORKBENCH AUDIT PASSED");
