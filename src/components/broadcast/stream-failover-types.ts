/**
 * Telemetry and failover data models for real-time live stream egress (Patent Track 16).
 * Conforms to Platform Invariant 6: purely physical network bitrates, frame drop rates, and millisecond latencies.
 * Strict Zero-Purple rule: zero purple, indigo, or violet tokens.
 */

export type StreamRouteState = 'PRIMARY_YOUTUBE' | 'FAILOVER_EDGE_MESH' | 'DUAL_EGRESS';

export type PipelineHealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'FAILOVER_ACTIVE';

export interface StreamHealthMetrics {
  streamId: string;
  timestampMs: number;
  bitrateKbps: number;
  targetBitrateKbps: number;
  frameDropRatePct: number;
  jitterMs: number;
  roundTripTimeMs: number;
  activeRoute: StreamRouteState;
  healthStatus: PipelineHealthStatus;
  failoverLatencyMs: number;
  totalBytesTransferred: number;
  edgeMeshPeerCount: number;
}

export interface FailoverThresholds {
  maxFrameDropPct: number;       // Default: 5.0%
  maxJitterMs: number;           // Default: 80 ms
  minBitrateKbps: number;        // Default: 1500 kbps
  maxFailoverLatencyBudgetMs: number; // Default: 400 ms
}

export const DEFAULT_FAILOVER_THRESHOLDS: FailoverThresholds = {
  maxFrameDropPct: 5.0,
  maxJitterMs: 80,
  minBitrateKbps: 1500,
  maxFailoverLatencyBudgetMs: 400,
};

export const DEFAULT_HEALTH_METRICS: StreamHealthMetrics = {
  streamId: 'stream-live-rink-a-main',
  timestampMs: Date.now(),
  bitrateKbps: 4500,
  targetBitrateKbps: 5000,
  frameDropRatePct: 0.12,
  jitterMs: 14.5,
  roundTripTimeMs: 38.0,
  activeRoute: 'PRIMARY_YOUTUBE',
  healthStatus: 'HEALTHY',
  failoverLatencyMs: 0,
  totalBytesTransferred: 1420500000,
  edgeMeshPeerCount: 12,
};

export function evaluatePipelineHealth(
  metrics: Pick<StreamHealthMetrics, 'frameDropRatePct' | 'jitterMs' | 'bitrateKbps'>,
  thresholds: FailoverThresholds = DEFAULT_FAILOVER_THRESHOLDS
): PipelineHealthStatus {
  if (
    metrics.frameDropRatePct >= thresholds.maxFrameDropPct ||
    metrics.jitterMs >= thresholds.maxJitterMs * 1.5 ||
    metrics.bitrateKbps < thresholds.minBitrateKbps * 0.5
  ) {
    return 'CRITICAL';
  }

  if (
    metrics.frameDropRatePct >= thresholds.maxFrameDropPct * 0.5 ||
    metrics.jitterMs >= thresholds.maxJitterMs ||
    metrics.bitrateKbps < thresholds.minBitrateKbps
  ) {
    return 'DEGRADED';
  }

  return 'HEALTHY';
}

export function determineFailoverRoute(
  currentRoute: StreamRouteState,
  health: PipelineHealthStatus
): StreamRouteState {
  if (health === 'CRITICAL' && currentRoute === 'PRIMARY_YOUTUBE') {
    return 'FAILOVER_EDGE_MESH';
  }
  if (health === 'HEALTHY' && currentRoute === 'FAILOVER_EDGE_MESH') {
    return 'PRIMARY_YOUTUBE';
  }
  return currentRoute;
}
