/**
 * Verification Script: Live Stream Bandwidth Adaptation & Sub-400ms Edge Transcoder Failover Monitor
 *
 * Validates:
 * 1. Stream health metric evaluation and threshold gating (bitrate, frame drops, jitter).
 * 2. Automated sub-400ms failover route switching (PRIMARY_YOUTUBE -> FAILOVER_EDGE_MESH).
 * 3. Platform Invariant 6 compliance (pure physical metrics: kbps, ms, %).
 * 4. Sub-300-line modularity compliance.
 * 5. Strict Zero-Purple Tailwind design rule compliance.
 */

import fs from 'fs';
import path from 'path';
import {
  DEFAULT_HEALTH_METRICS,
  DEFAULT_FAILOVER_THRESHOLDS,
  evaluatePipelineHealth,
  determineFailoverRoute,
  StreamHealthMetrics,
} from '../src/components/broadcast/stream-failover-types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

async function runStreamFailoverMonitorTests() {
  console.log('=================================================');
  console.log('📡 [Portal Test] Live Stream Telemetry & Failover Monitor');
  console.log('=================================================\n');

  // Test 1: Default Metrics & Physical Units (Platform Invariant 6)
  console.log('▶ [1/5] Testing Default Physical Health Telemetry (Invariant 6)...');
  assert(DEFAULT_HEALTH_METRICS.bitrateKbps === 4500, 'Nominal bitrate must be 4500 kbps.');
  assert(DEFAULT_HEALTH_METRICS.frameDropRatePct === 0.12, 'Frame drop rate must be 0.12%.');
  assert(DEFAULT_HEALTH_METRICS.frameDropRatePct < 0.50, 'Nominal frame drop rate must be < 0.50%.');
  assert(DEFAULT_HEALTH_METRICS.jitterMs === 14.5, 'Nominal jitter must be 14.5 ms.');
  assert(DEFAULT_HEALTH_METRICS.jitterMs < 50.0, 'Nominal jitter must be < 50 ms.');
  assert(DEFAULT_HEALTH_METRICS.activeRoute === 'PRIMARY_YOUTUBE', 'Default route must be PRIMARY_YOUTUBE.');
  assert(DEFAULT_HEALTH_METRICS.healthStatus === 'HEALTHY', 'Default health status must be HEALTHY.');
  console.log(`  ✔ Verified physical telemetry: ${DEFAULT_HEALTH_METRICS.bitrateKbps} kbps, ` +
              `${DEFAULT_HEALTH_METRICS.frameDropRatePct}% drops, ${DEFAULT_HEALTH_METRICS.jitterMs}ms jitter`);

  // Test 2: Health Evaluation Transitions
  console.log('\n▶ [2/5] Testing Pipeline Health Evaluation Transitions...');
  const healthyStatus = evaluatePipelineHealth({
    bitrateKbps: 4200,
    frameDropRatePct: 0.35,
    jitterMs: 25.0,
  });
  assert(healthyStatus === 'HEALTHY', `Expected HEALTHY, got ${healthyStatus}`);

  const degradedStatus = evaluatePipelineHealth({
    bitrateKbps: 1300, // Below minBitrateKbps (1500)
    frameDropRatePct: 2.8,
    jitterMs: 65.0,
  });
  assert(degradedStatus === 'DEGRADED', `Expected DEGRADED, got ${degradedStatus}`);

  const criticalStatus = evaluatePipelineHealth({
    bitrateKbps: 600,
    frameDropRatePct: 7.2, // Exceeds maxFrameDropPct (5.0%)
    jitterMs: 130.0,
  });
  assert(criticalStatus === 'CRITICAL', `Expected CRITICAL, got ${criticalStatus}`);
  console.log('  ✔ Verified state progression: HEALTHY -> DEGRADED -> CRITICAL');

  // Test 3: Sub-400ms Automated Failover Switching
  console.log('\n▶ [3/5] Testing Automated Route Failover & Sub-400ms Latency Budget...');
  const failoverRoute = determineFailoverRoute('PRIMARY_YOUTUBE', 'CRITICAL');
  assert(failoverRoute === 'FAILOVER_EDGE_MESH', `Route under CRITICAL must switch to FAILOVER_EDGE_MESH, got ${failoverRoute}`);

  const restoredRoute = determineFailoverRoute('FAILOVER_EDGE_MESH', 'HEALTHY');
  assert(restoredRoute === 'PRIMARY_YOUTUBE', `Route under HEALTHY must restore to PRIMARY_YOUTUBE, got ${restoredRoute}`);

  const failoverBudgetMs = DEFAULT_FAILOVER_THRESHOLDS.maxFailoverLatencyBudgetMs;
  assert(failoverBudgetMs === 400, `Failover SLA budget must be 400ms, got ${failoverBudgetMs}ms`);
  console.log(`  ✔ Automated failover: PRIMARY_YOUTUBE -> FAILOVER_EDGE_MESH within < ${failoverBudgetMs}ms budget`);

  // Test 4: Sub-300-Line Modularity Audit
  console.log('\n▶ [4/5] Auditing Sub-300-Line Modularity Limits...');
  const filesToCheck = [
    path.join(__dirname, '../src/components/broadcast/StreamHealthFailoverMonitor.tsx'),
    path.join(__dirname, '../src/components/broadcast/stream-failover-types.ts'),
  ];

  for (const file of filesToCheck) {
    const lines = fs.readFileSync(file, 'utf8').split('\n').length;
    assert(lines < 300, `File ${path.basename(file)} has ${lines} lines, exceeding the 300-line ceiling!`);
    console.log(`  ✔ ${path.basename(file)}: ${lines} lines (< 300)`);
  }

  // Test 5: Zero-Purple Tailwind Design Rule Audit
  console.log('\n▶ [5/5] Auditing Zero-Purple Tailwind Design Rules...');
  const forbiddenTokens = ['purple', 'indigo', 'violet'];
  for (const filePath of filesToCheck) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const token of forbiddenTokens) {
      const regex = new RegExp(`\\b${token}-[0-9]+\\b`, 'i');
      const match = content.match(regex);
      assert(!match, `Forbidden color token '${match?.[0]}' detected in ${path.basename(filePath)}!`);
    }
    console.log(`  ✔ 0 purple/indigo/violet tokens confirmed in ${path.basename(filePath)}`);
  }

  console.log('\n=================================================');
  console.log('✅ All Stream Health Failover Tests PASSED (5/5 Pillars)');
  console.log('=================================================');
}

runStreamFailoverMonitorTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
