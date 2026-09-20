import React from "react";

export interface CameraFrameTimestamp {
  camera_id: string;
  frame_index: number;
  ptp_timestamp_us: number;
  nominal_fps: number;
  pts_delta_us: number;
}

export interface PtpSyncVerificationResult {
  reference_camera_id: string;
  target_camera_id: string;
  reference_frame_index: number;
  target_frame_index: number;
  clock_skew_us: number;
  is_synchronized: boolean;
  drift_rate_ppm: number;
  dropped_frames_detected: number;
}

interface PtpVideoSyncVerifierWorkbenchProps {
  result: PtpSyncVerificationResult;
  refFrame: CameraFrameTimestamp;
  targetFrame: CameraFrameTimestamp;
}

export const PtpVideoSyncVerifierWorkbench: React.FC<PtpVideoSyncVerifierWorkbenchProps> = ({
  result,
  refFrame,
  targetFrame,
}) => {
  const getSyncBadge = () => {
    if (result.dropped_frames_detected > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-400 border border-red-800">
          FRAME DROP DETECTED ({result.dropped_frames_detected} dropped)
        </span>
      );
    }
    if (!result.is_synchronized) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800">
          PTP CLOCK SKEW EXCEEDED ({Math.abs(result.clock_skew_us).toFixed(1)} μs)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
        SUB-FRAME PTP PHASE LOCKED ({Math.abs(result.clock_skew_us).toFixed(1)} μs)
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Patent P426 • Sprint 68
          </div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100">
            Multi-Camera PTP Video Replay Sync & Timecode Drift Verifier
          </h2>
        </div>
        <div>{getSyncBadge()}</div>
      </div>

      {/* Primary Synchronization Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Inter-Camera Clock Skew</span>
          <p className={`mt-1 text-2xl font-mono font-bold ${Math.abs(result.clock_skew_us) > 200 ? "text-amber-400" : "text-zinc-100"}`}>
            {result.clock_skew_us > 0 ? `+${result.clock_skew_us.toFixed(1)}` : result.clock_skew_us.toFixed(1)}{" "}
            <span className="text-xs font-sans font-normal text-zinc-400">μs</span>
          </p>
        </div>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Drift Rate</span>
          <p className="mt-1 text-2xl font-mono font-bold text-sky-400">
            {result.drift_rate_ppm.toFixed(2)}{" "}
            <span className="text-xs font-sans font-normal text-zinc-400">ppm</span>
          </p>
        </div>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Frame Drops</span>
          <p className={`mt-1 text-2xl font-mono font-bold ${result.dropped_frames_detected > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {result.dropped_frames_detected}
          </p>
        </div>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">Timecode Alignment</span>
          <p className="mt-1 text-2xl font-mono font-bold text-emerald-400">
            {result.is_synchronized ? "LOCKED" : "UNALIGNED"}
          </p>
        </div>
      </div>

      {/* Frame Comparison Detail Box */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">
          Hardware Frame Presentation Timestamps (PTS)
        </h3>
        <div className="grid grid-cols-1 gap-4 text-xs font-mono sm:grid-cols-2">
          <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800">
            <span className="text-zinc-500 block">Reference Camera: {refFrame.camera_id}</span>
            <div className="mt-2 space-y-1 text-zinc-300">
              <div>Frame Index: #{refFrame.frame_index}</div>
              <div>PTP Timestamp: {refFrame.ptp_timestamp_us.toLocaleString()} μs</div>
              <div>Nominal FPS: {refFrame.nominal_fps.toFixed(1)} fps</div>
            </div>
          </div>
          <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800">
            <span className="text-zinc-500 block">Target Camera: {targetFrame.camera_id}</span>
            <div className="mt-2 space-y-1 text-zinc-300">
              <div>Frame Index: #{targetFrame.frame_index}</div>
              <div>PTP Timestamp: {targetFrame.ptp_timestamp_us.toLocaleString()} μs</div>
              <div>Inter-Frame Delta: {targetFrame.pts_delta_us.toLocaleString()} μs</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span>IEEE 1588 PTP Grandmaster Reference</span>
        <span>Target Sync Margin: ≤ 200.0 μs Maximum Skew</span>
      </div>
    </div>
  );
};
