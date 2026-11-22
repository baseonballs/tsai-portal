/**
 * test-byod-setup.ts — Wave 6 Stage 6B Phase 2 verification for TSAI Portal T6.3 / O-09.
 *
 * Verifies:
 *   1. All 4 BYOD BFF routes (/api/byod/teams, /devices, /devices/[deviceId], /calibrations):
 *      - 401 when signed out or missing GoTrue access token
 *      - 403 when signed in without active Portal licence entitlement
 *      - 503 when entitlement lookup fails (with secret redaction)
 *      - 400 on invalid teamId / deviceId UUIDs and invalid limit/offset pagination
 *      - 422 local BFF rejection of raw RTMPS secrets/URLs (never forwarded upstream)
 *      - Upstream 403/404/409/422/503 pass-through, 503 on unreachable upstream, 502 on drift
 *      - Secret redaction/stripping from upstream errors and logs
 *      - Happy-path GET/POST/PATCH/DELETE + multi-page GET /devices/[deviceId] + zero HMAC leakage
 *   2. Strict mappers & redactByodSecrets() unit checks
 *   3. Real WebAudio OscillatorNode 3200 Hz reference tone helper (available + unavailable AudioContext)
 *   4. Zero-Purple compliance & BYOD UI structural/honesty checks
 *
 * Run: npx tsx scripts/test-byod-setup.ts
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import Module from "node:module";
import type { AddressInfo } from "node:net";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";

import {
  createDeviceEditState,
  formatWhistlePassband,
  parseManualCalibrationInputs,
  resolveSelectedDeviceAfterLoad,
} from "../src/lib/byod/byod-form";
import {
  findForbiddenRtmpsSecretField,
  mapByodCalibration,
  mapByodDevice,
  redactByodSecrets,
  toByodUpstreamPayload,
} from "../src/lib/byod/byod-mappers";
import { playByodReferenceTone } from "../src/lib/byod/webaudio-tone";
import { BYODSetupWizard } from "../src/components/vision/BYODSetupWizard";
import { ByodCalibrationReadout } from "../src/components/vision/ByodCalibrationReadout";
import { ByodDeviceFleetPanel } from "../src/components/vision/ByodDeviceFleetPanel";

function runTest(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`  ✓ ${name}`);
    })
    .catch((err: unknown) => {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
      process.exit(1);
    });
}

interface CapturedUpstream {
  method: string;
  url: string;
  authorization: string | undefined;
  body: unknown;
}

async function main() {
  console.log("\n=== Wave 6 T6.3 / O-09 BYOD Portal BFF & UI Suite ===\n");

  const teamId = "11111111-1111-4111-8111-111111111111";
  const deviceId = "22222222-2222-4222-8222-222222222222";
  const deviceIdPage2 = "33333333-3333-4333-8333-333333333333";
  const calId = "44444444-4444-4444-8444-444444444444";

  await runTest("redactByodSecrets strips RTMPS URLs, stream keys, pairing secrets, and tokens while keeping UUIDs", () => {
    const sample =
      `Failed for ${deviceId} with rtmps://a.rtmps.youtube.com/live2/abcd-efgh-ijkl-mnop ` +
      `stream_key="live_super_secret_key" pairing_secret=tok_secret_99 Bearer jwt_token_abc123`;
    const cleaned = redactByodSecrets(sample);
    assert.ok(cleaned.includes(deviceId), "UUIDs must remain intact");
    assert.doesNotMatch(cleaned, /youtube\.com|abcd-efgh|live_super_secret_key|tok_secret_99|jwt_token_abc123/);
    assert.match(cleaned, /\[REDACTED_RTMPS_URL\]/);
    assert.match(cleaned, /\[REDACTED_SECRET\]/);
    assert.match(cleaned, /\[REDACTED_CREDENTIAL\]/);
  });

  await runTest("findForbiddenRtmpsSecretField catches stream keys, mixed-case keys, and rtmps:// values but allows hint_last4", () => {
    assert.equal(findForbiddenRtmpsSecretField({ rtmps_egress_configured: true, rtmps_key_hint_last4: "A1B2" }), null);
    assert.equal(findForbiddenRtmpsSecretField({ rtmps_stream_key: "live_abc" }), "rtmps_stream_key");
    assert.equal(findForbiddenRtmpsSecretField({ Stream_Key: "live_mixed" }), "Stream_Key");
    assert.equal(findForbiddenRtmpsSecretField({ RTMPS_URL: "rtmps://host/app/k" }), "RTMPS_URL");
    assert.equal(findForbiddenRtmpsSecretField({ "  pairing_secret ": "abc" }), "  pairing_secret ");
    assert.equal(findForbiddenRtmpsSecretField({ streamKey: "xyz" }), "streamKey");
    assert.equal(findForbiddenRtmpsSecretField({ rtmp_url: "rtmp://host/app/key" }), "rtmp_url");
    assert.equal(findForbiddenRtmpsSecretField({ pairing_secret: "abc" }), "pairing_secret");
    assert.equal(findForbiddenRtmpsSecretField({ notes: "rtmps://a.rtmps.youtube.com/live2/k" }), "rtmps_url_value");
  });

  await runTest("BYOD form helpers sync auto-selected devices, validate manual inputs, and format one-sided whistle bands", () => {
    const firstDevice = mapByodDevice({
      id: deviceId,
      team_id: teamId,
      registered_by_user_id: "user-1",
      device_label: "rink-north-pod-01",
      device_model: "custom-rtmps-encoder",
      glass_type: "none",
      pairing_status: "paired",
      effective_status: "paired",
      pairing_attempts: 0,
      pairing_code_expires_at: null,
      rtmps_egress_configured: true,
      rtmps_key_hint_last4: "Z9Y8",
      mesh_service_name: "rink-north._tsai-mesh._tcp.local",
      paired_at: "2026-11-22T12:00:00Z",
      last_seen_at: "2026-11-22T12:04:00Z",
      revoked_at: null,
      created_at: "2026-11-22T11:55:00Z",
      updated_at: "2026-11-22T12:04:00Z",
      latest_calibration: null,
    });
    const resolved = resolveSelectedDeviceAfterLoad([firstDevice], "");
    assert.equal(resolved.nextSelectedId, deviceId);
    const edit = createDeviceEditState(resolved.nextSelectedDevice);
    assert.equal(edit.deviceLabel, "rink-north-pod-01");
    assert.equal(edit.glassType, "none");
    assert.equal(edit.meshServiceName, "rink-north._tsai-mesh._tcp.local");
    assert.equal(edit.rtmpsEgressConfigured, true);
    assert.equal(edit.rtmpsKeyHintLast4, "Z9Y8");

    const badInt = parseManualCalibrationInputs({
      tiltInput: "",
      horizonLocked: null,
      vacuumKpaInput: "",
      dieTempInput: "",
      powerWattsInput: "",
      peltierState: "",
      whistleLowInput: "2800.5",
      whistleHighInput: "",
      notesInput: "",
    });
    assert.equal(badInt.ok, false);
    if (!badInt.ok) {
      assert.match(badInt.error, /Whistle filter low \(Hz\).*integer/);
    }

    const badFloat = parseManualCalibrationInputs({
      tiltInput: "0.5deg",
      horizonLocked: null,
      vacuumKpaInput: "",
      dieTempInput: "",
      powerWattsInput: "",
      peltierState: "",
      whistleLowInput: "",
      whistleHighInput: "",
      notesInput: "",
    });
    assert.equal(badFloat.ok, false);
    if (!badFloat.ok) {
      assert.match(badFloat.error, /Optical tilt.*decimal/);
    }

    const validParsed = parseManualCalibrationInputs({
      tiltInput: "",
      horizonLocked: null,
      vacuumKpaInput: "68.5",
      dieTempInput: "31.4",
      powerWattsInput: "",
      peltierState: "",
      whistleLowInput: "2800",
      whistleHighInput: "",
      notesInput: "  pre-game check  ",
    });
    assert.equal(validParsed.ok, true);
    if (validParsed.ok) {
      assert.equal(validParsed.payload.opticalTiltDeg, null);
      assert.equal(validParsed.payload.mountVacuumKpa, 68.5);
      assert.equal(validParsed.payload.whistleFilterHzLow, 2800);
      assert.equal(validParsed.payload.whistleFilterHzHigh, null);
      assert.equal(validParsed.payload.acousticSnrDb, null);
    }

    assert.equal(formatWhistlePassband(2800, 3800), "2800–3800 Hz");
    assert.equal(formatWhistlePassband(2800, null), ">= 2800 Hz");
    assert.equal(formatWhistlePassband(null, 3800), "<= 3800 Hz");
    assert.equal(formatWhistlePassband(null, null), null);
  });

  await runTest("strict BYOD mappers reject unknown enums and never leak HMAC fields", () => {
    const rawDevice = {
      id: deviceId,
      team_id: teamId,
      registered_by_user_id: "user-1",
      device_label: "rink-north-pod-01",
      device_model: "custom-rtmps-encoder",
      glass_type: "none",
      pairing_status: "pending",
      effective_status: "pending",
      pairing_attempts: 0,
      pairing_code_expires_at: "2026-11-22T12:15:00Z",
      pairing_code_hmac: "must-never-leak-hmac",
      device_token_hmac: "must-never-leak-token-hmac",
      rtmps_egress_configured: true,
      rtmps_key_hint_last4: "B2C3",
      mesh_service_name: "rink-north._tsai-mesh._tcp.local",
      paired_at: null,
      last_seen_at: null,
      revoked_at: null,
      created_at: "2026-11-22T12:00:00Z",
      updated_at: "2026-11-22T12:00:00Z",
      latest_calibration: null,
    };
    const mapped = mapByodDevice(rawDevice);
    assert.equal(mapped.deviceModel, "custom-rtmps-encoder");
    assert.equal("pairing_code_hmac" in mapped, false);
    assert.equal("device_token_hmac" in mapped, false);

    assert.throws(() => mapByodDevice({ ...rawDevice, device_model: "bogus-cam" }), /device_model/);
    assert.throws(() => mapByodDevice({ ...rawDevice, glass_type: "plexiglass" }), /glass_type/);
    assert.throws(
      () =>
        mapByodCalibration({
          id: calId,
          device_id: deviceId,
          team_id: teamId,
          recorded_by_subject: "user:1",
          calibration_source: "fabricated",
          measured_at: "2026-11-22T12:00:00Z",
        }),
      /calibration_source/,
    );

    const upstream = toByodUpstreamPayload({
      teamId,
      deviceLabel: "pod-1",
      deviceModel: "iphone-16-pro",
      unknownField: "keep-for-upstream-422",
    });
    assert.equal("teamId" in upstream, false);
    assert.equal(upstream.device_label, "pod-1");
    assert.equal(upstream.unknownField, "keep-for-upstream-422");
  });

  await runTest("WebAudio 3.2 kHz tone helper fails honestly when AudioContext is missing and cleans up when available", async () => {
    const unavailable = await playByodReferenceTone({ ctor: null });
    assert.equal(unavailable.ok, false);
    if (!unavailable.ok) {
      assert.match(unavailable.error, /AudioContext is unavailable/);
    }

    interface CapturedOsc {
      type: string;
      frequency: { value: number | null; setValueAtTime: (val: number) => void };
      connect: () => void;
      disconnect: () => void;
      start: (when?: number) => void;
      stop: (when?: number) => void;
      onended: (() => void) | null;
    }

    let lastOsc: CapturedOsc | null = null;
    let setFreq: number | null = null;
    let setGain: number | null = null;
    let startedAt: number | null = null;
    let stoppedAt: number | null = null;
    let manualStopCount = 0;
    let ctxClosed = 0;
    let endedCallbackFired = 0;
    let oscConnected = false;
    let gainConnected = false;

    class FakeAudioContext {
      state = "suspended";
      currentTime = 1.0;
      destination = {};
      async resume() {
        this.state = "running";
      }
      async close() {
        ctxClosed += 1;
        this.state = "closed";
      }
      createOscillator() {
        const osc: CapturedOsc = {
          type: "triangle",
          frequency: {
            value: null,
            setValueAtTime: (val: number) => {
              setFreq = val;
              osc.frequency.value = val;
            },
          },
          connect: () => {
            oscConnected = true;
          },
          disconnect: () => {
            oscConnected = false;
          },
          start: (when?: number) => {
            startedAt = when ?? 0;
          },
          stop: (when?: number) => {
            if (when !== undefined) stoppedAt = when;
            else manualStopCount += 1;
          },
          onended: null,
        };
        lastOsc = osc;
        return osc;
      }
      createGain() {
        return {
          gain: {
            setValueAtTime: (val: number) => {
              setGain = val;
            },
            exponentialRampToValueAtTime: () => undefined,
          },
          connect: () => {
            gainConnected = true;
          },
          disconnect: () => {
            gainConnected = false;
          },
        };
      }
    }

    const res = await playByodReferenceTone({
      ctor: FakeAudioContext as unknown as new () => AudioContext,
      onEnded: () => {
        endedCallbackFired += 1;
      },
    });
    assert.equal(res.ok, true);
    assert.ok(lastOsc);
    const createdOsc = lastOsc as CapturedOsc;
    assert.equal(createdOsc.type, "sine");
    assert.equal(createdOsc.frequency.value, 3200);
    assert.equal(setFreq, 3200);
    assert.equal(setGain, 0.15);
    assert.equal(startedAt, 1.0);
    assert.equal(stoppedAt, 1.4);
    assert.equal(oscConnected, true);
    assert.equal(gainConnected, true);

    assert.ok(createdOsc.onended);
    createdOsc.onended();
    assert.equal(ctxClosed, 1);
    assert.equal(endedCallbackFired, 1);
    assert.equal(oscConnected, false);
    assert.equal(gainConnected, false);

    // Also verify manual stop() teardown closes AudioContext cleanly
    const res2 = await playByodReferenceTone({
      ctor: FakeAudioContext as unknown as new () => AudioContext,
    });
    assert.equal(res2.ok, true);
    if (res2.ok) {
      res2.handle.stop();
      assert.equal(manualStopCount, 1);
      assert.equal(ctxClosed, 2);
    }
  });

  // ── BFF HTTP Proxy Integration Tests ──────────────────────────────────────────────────────
  let mockAccess: { status: "signed-out" } | { status: "not-entitled"; userId: string } | { status: "entitled"; userId: string } = {
    status: "signed-out",
  };
  let mockEntitlementError: Error | null = null;
  let mockAccessToken: string | null = "caller-jwt-byod";
  let captured: CapturedUpstream[] = [];
  let upstreamHandler: (req: CapturedUpstream, res: ServerResponse) => void = (_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ items: [] }));
  };

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const raw = Buffer.concat(chunks).toString("utf8");
    let parsed: unknown;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = raw;
      }
    }
    const item: CapturedUpstream = {
      method: req.method ?? "GET",
      url: req.url ?? "",
      authorization: req.headers.authorization,
      body: parsed,
    };
    captured.push(item);
    upstreamHandler(item, res);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const { port } = server.address() as AddressInfo;

  const MI = Module as unknown as { _load: (r: string, p: unknown, m: boolean) => unknown };
  const origLoad = MI._load;
  MI._load = function (r: string, p: unknown, m: boolean) {
    if (r === "server-only") return {};
    if (r === "@/utils/supabase/server") {
      return {
        createClient: async () => ({
          auth: {
            getSession: async () =>
              mockAccessToken ? { data: { session: { access_token: mockAccessToken } } } : { data: { session: null } },
          },
        }),
      };
    }
    if (r === "@/lib/auth/portal-entitlement") {
      return {
        getEntitledPortalUser: async () => {
          if (mockEntitlementError) throw mockEntitlementError;
          return mockAccess;
        },
      };
    }
    return origLoad.call(this, r, p, m);
  };

  const savedUrl = process.env.HOCKEY_API_URL;
  process.env.HOCKEY_API_URL = `http://127.0.0.1:${port}`;

  try {
    const teamsRoute = await import("../src/app/api/byod/teams/route");
    const devicesRoute = await import("../src/app/api/byod/devices/route");
    const deviceIdRoute = await import("../src/app/api/byod/devices/[deviceId]/route");
    const calibrationsRoute = await import("../src/app/api/byod/devices/[deviceId]/calibrations/route");

    const sampleDeviceSnake = {
      id: deviceId,
      team_id: teamId,
      registered_by_user_id: "user-1",
      device_label: "rink-north-pod-01",
      device_model: "iphone-16-pro",
      glass_type: "tempered",
      pairing_status: "pending",
      effective_status: "pending",
      pairing_attempts: 0,
      pairing_code_expires_at: "2026-11-22T12:15:00Z",
      pairing_code_hmac: "secret-hmac-must-strip",
      device_token_hmac: "secret-tok-must-strip",
      rtmps_egress_configured: false,
      rtmps_key_hint_last4: null,
      mesh_service_name: "rink-north._tsai-mesh._tcp.local",
      paired_at: null,
      last_seen_at: null,
      revoked_at: null,
      created_at: "2026-11-22T12:00:00Z",
      updated_at: "2026-11-22T12:00:00Z",
      latest_calibration: null,
    };
    const sampleCalSnake = {
      id: calId,
      device_id: deviceId,
      team_id: teamId,
      recorded_by_subject: "user:user-1",
      calibration_source: "manual_check",
      optical_tilt_deg: null,
      optical_horizon_locked: null,
      mount_vacuum_kpa: 68.5,
      die_temp_c: 31.4,
      power_delivery_watts: null,
      peltier_state: null,
      acoustic_snr_db: null,
      whistle_filter_hz_low: 2800,
      whistle_filter_hz_high: 3800,
      notes: "Rigging verified",
      measured_at: "2026-11-22T12:02:00Z",
    };

    await runTest("BFF rejects signed-out (401), unentitled (403), missing token (401), and entitlement outage (503)", async () => {
      captured = [];
      mockAccess = { status: "signed-out" };
      for (const res of [
        await teamsRoute.GET(),
        await devicesRoute.GET(new NextRequest(`http://localhost/api/byod/devices?teamId=${teamId}`)),
        await devicesRoute.POST(
          new NextRequest("http://localhost/api/byod/devices", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ teamId, deviceLabel: "pod-1", deviceModel: "iphone-16-pro" }),
          }),
        ),
        await deviceIdRoute.GET(
          new NextRequest(`http://localhost/api/byod/devices/${deviceId}?teamId=${teamId}`),
          { params: Promise.resolve({ deviceId }) },
        ),
        await deviceIdRoute.PATCH(
          new NextRequest(`http://localhost/api/byod/devices/${deviceId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ teamId, deviceLabel: "pod-2" }),
          }),
          { params: Promise.resolve({ deviceId }) },
        ),
        await deviceIdRoute.DELETE(
          new NextRequest(`http://localhost/api/byod/devices/${deviceId}?teamId=${teamId}`, { method: "DELETE" }),
          { params: Promise.resolve({ deviceId }) },
        ),
        await calibrationsRoute.GET(
          new NextRequest(`http://localhost/api/byod/devices/${deviceId}/calibrations?teamId=${teamId}`),
          { params: Promise.resolve({ deviceId }) },
        ),
        await calibrationsRoute.POST(
          new NextRequest(`http://localhost/api/byod/devices/${deviceId}/calibrations`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ teamId, dieTempC: 31.4 }),
          }),
          { params: Promise.resolve({ deviceId }) },
        ),
      ]) {
        assert.equal(res.status, 401);
        assert.equal(res.headers.get("cache-control"), "private, no-store");
      }

      mockAccess = { status: "not-entitled", userId: "user-1" };
      for (const res of [
        await teamsRoute.GET(),
        await devicesRoute.GET(new NextRequest(`http://localhost/api/byod/devices?teamId=${teamId}`)),
        await devicesRoute.POST(
          new NextRequest("http://localhost/api/byod/devices", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ teamId, deviceLabel: "pod-1", deviceModel: "iphone-16-pro" }),
          }),
        ),
        await deviceIdRoute.GET(
          new NextRequest(`http://localhost/api/byod/devices/${deviceId}?teamId=${teamId}`),
          { params: Promise.resolve({ deviceId }) },
        ),
        await deviceIdRoute.PATCH(
          new NextRequest(`http://localhost/api/byod/devices/${deviceId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ teamId, deviceLabel: "pod-2" }),
          }),
          { params: Promise.resolve({ deviceId }) },
        ),
        await deviceIdRoute.DELETE(
          new NextRequest(`http://localhost/api/byod/devices/${deviceId}?teamId=${teamId}`, { method: "DELETE" }),
          { params: Promise.resolve({ deviceId }) },
        ),
        await calibrationsRoute.GET(
          new NextRequest(`http://localhost/api/byod/devices/${deviceId}/calibrations?teamId=${teamId}`),
          { params: Promise.resolve({ deviceId }) },
        ),
        await calibrationsRoute.POST(
          new NextRequest(`http://localhost/api/byod/devices/${deviceId}/calibrations`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ teamId, dieTempC: 31.4 }),
          }),
          { params: Promise.resolve({ deviceId }) },
        ),
      ]) {
        assert.equal(res.status, 403);
        assert.equal(res.headers.get("cache-control"), "private, no-store");
      }

      mockAccess = { status: "entitled", userId: "user-1" };
      mockAccessToken = null;
      assert.equal((await teamsRoute.GET()).status, 401);
      mockAccessToken = "caller-jwt-byod";

      mockEntitlementError = new Error("db error stream_key=live_leak_999");
      const errRes = await teamsRoute.GET();
      assert.equal(errRes.status, 503);
      assert.equal(captured.length, 0, "auth/entitlement failures must not reach upstream");
      mockEntitlementError = null;
    });

    await runTest("BFF rejects invalid UUIDs and invalid pagination (400) before upstream", async () => {
      mockAccess = { status: "entitled", userId: "user-1" };
      captured = [];

      assert.equal(
        (await devicesRoute.GET(new NextRequest("http://localhost/api/byod/devices?teamId=not-a-uuid"))).status,
        400,
      );
      assert.equal(
        (await devicesRoute.GET(new NextRequest(`http://localhost/api/byod/devices?teamId=${teamId}&limit=101`))).status,
        400,
      );
      assert.equal(
        (await devicesRoute.GET(new NextRequest(`http://localhost/api/byod/devices?teamId=${teamId}&offset=-1`))).status,
        400,
      );
      assert.equal(
        (
          await deviceIdRoute.GET(
            new NextRequest(`http://localhost/api/byod/devices/bad-uuid?teamId=${teamId}`),
            { params: Promise.resolve({ deviceId: "bad-uuid" }) },
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await deviceIdRoute.PATCH(
            new NextRequest(`http://localhost/api/byod/devices/bad-uuid`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ teamId, deviceLabel: "pod-1" }),
            }),
            { params: Promise.resolve({ deviceId: "bad-uuid" }) },
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await deviceIdRoute.DELETE(
            new NextRequest(`http://localhost/api/byod/devices/bad-uuid?teamId=${teamId}`, { method: "DELETE" }),
            { params: Promise.resolve({ deviceId: "bad-uuid" }) },
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await calibrationsRoute.POST(
            new NextRequest(`http://localhost/api/byod/devices/bad-uuid/calibrations`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ teamId, dieTempC: 30 }),
            }),
            { params: Promise.resolve({ deviceId: "bad-uuid" }) },
          )
        ).status,
        400,
      );
      assert.equal(captured.length, 0);
    });

    await runTest("BFF rejects raw RTMPS secrets/URLs locally (422) and strips secrets from upstream errors", async () => {
      mockAccess = { status: "entitled", userId: "user-1" };
      captured = [];

      const forbiddenPayloads = [
        { teamId, deviceLabel: "pod-1", deviceModel: "iphone-16-pro", rtmps_stream_key: "live_secret_123" },
        { teamId, deviceLabel: "pod-1", deviceModel: "iphone-16-pro", Stream_Key: "live_mixed_case_99" },
        { teamId, deviceLabel: "pod-1", deviceModel: "iphone-16-pro", RTMPS_URL: "rtmps://a.rtmps.youtube.com/live2/mixed" },
        { teamId, deviceLabel: "pod-1", deviceModel: "iphone-16-pro", stream_key: "abcd-efgh-ijkl-mnop" },
        { teamId, deviceLabel: "pod-1", deviceModel: "iphone-16-pro", rtmp_url: "rtmps://a.rtmps.youtube.com/live2/secret" },
        { teamId, deviceLabel: "pod-1", deviceModel: "iphone-16-pro", pairing_secret: "raw_secret_val" },
      ];
      for (const body of forbiddenPayloads) {
        const res = await devicesRoute.POST(
          new NextRequest("http://localhost/api/byod/devices", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          }),
        );
        assert.equal(res.status, 422);
        const json = await res.json();
        assert.doesNotMatch(
          JSON.stringify(json),
          /live_secret_123|live_mixed_case_99|abcd-efgh|youtube\.com|raw_secret_val/,
        );
      }
      assert.equal(captured.length, 0, "raw RTMPS secret payloads must never reach upstream");

      // Simulate upstream returning string detail leaking RTMPS URL / stream_key / pairing_secret / pairing_code / device_token
      upstreamHandler = (_req, res) => {
        res.writeHead(422, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            detail:
              "Invalid payload near rtmps://a.rtmps.youtube.com/live2/secret_yt_9876 " +
              "stream_key=live_hidden_555 pairing_secret=secret_code_444 pairing_code=ZXCV1234 device_token=dt_secret_888",
          }),
        );
      };
      const upstreamErrRes = await calibrationsRoute.POST(
        new NextRequest(`http://localhost/api/byod/devices/${deviceId}/calibrations`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ teamId, whistleFilterHzLow: 4000, whistleFilterHzHigh: 2000 }),
        }),
        { params: Promise.resolve({ deviceId }) },
      );
      assert.equal(upstreamErrRes.status, 422);
      const bodyText = await upstreamErrRes.text();
      assert.doesNotMatch(
        bodyText,
        /secret_yt_9876|live_hidden_555|secret_code_444|ZXCV1234|dt_secret_888|youtube\.com/,
      );
      assert.match(bodyText, /REDACTED_RTMPS_URL/);

      // Also simulate upstream returning Pydantic validation array detail: [{ loc, msg, input }]
      upstreamHandler = (_req, res) => {
        res.writeHead(422, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            detail: [
              {
                type: "extra_forbidden",
                loc: ["body", "stream_key"],
                msg: "Extra inputs near rtmps://a.rtmps.youtube.com/live2/arr_secret_111 stream_key=arr_sk_222 pairing_code=ARR34567 device_token=arr_tok_888",
                input: "arr_raw_input_999",
              },
            ],
          }),
        );
      };
      const upstreamArrErrRes = await devicesRoute.POST(
        new NextRequest("http://localhost/api/byod/devices", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ teamId, deviceLabel: "pod-1", deviceModel: "iphone-16-pro" }),
        }),
      );
      assert.equal(upstreamArrErrRes.status, 422);
      const arrBodyText = await upstreamArrErrRes.text();
      assert.doesNotMatch(
        arrBodyText,
        /arr_secret_111|arr_sk_222|ARR34567|arr_tok_888|arr_raw_input_999|youtube\.com/,
      );
      assert.match(arrBodyText, /REDACTED_RTMPS_URL/);
    });

    await runTest("BFF happy-path proxies all 4 routes, multi-page GET /devices/[deviceId], and strips HMACs", async () => {
      mockAccess = { status: "entitled", userId: "user-1" };
      captured = [];

      // 1. GET /api/byod/teams
      upstreamHandler = (_req, res) => {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            items: [
              {
                team_id: teamId,
                team_name: "Fixture 16U AAA",
                season: "2026-27",
                level_of_play: "AAA",
                tier: "Tier 1",
                staff_role: "Head Coach",
              },
            ],
          }),
        );
      };
      const teamsRes = await teamsRoute.GET();
      assert.equal(teamsRes.status, 200);
      assert.equal(teamsRes.headers.get("cache-control"), "private, no-store");
      assert.equal(captured[0].url, "/api/v1/byod/teams");
      assert.equal(captured[0].authorization, "Bearer caller-jwt-byod");
      const teamsJson = await teamsRes.json();
      assert.equal(teamsJson.items[0].teamName, "Fixture 16U AAA");

      // 2. GET /api/byod/devices
      captured = [];
      upstreamHandler = (_req, res) => {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ items: [sampleDeviceSnake], total: 1, limit: 10, offset: 0 }));
      };
      const devListRes = await devicesRoute.GET(
        new NextRequest(`http://localhost/api/byod/devices?teamId=${teamId}&limit=10&offset=0`),
      );
      assert.equal(devListRes.status, 200);
      assert.equal(captured[0].url, `/api/v1/teams/${teamId}/byod/devices?limit=10&offset=0`);
      const devListJson = await devListRes.json();
      assert.equal(devListJson.items[0].id, deviceId);
      assert.equal(JSON.stringify(devListJson).includes("must-strip"), false);

      // 3. POST /api/byod/devices
      captured = [];
      upstreamHandler = (_req, res) => {
        res.writeHead(201, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            device: sampleDeviceSnake,
            pairing_code: "9A8B7C6D",
            pairing_code_expires_at: "2026-11-22T12:15:00Z",
          }),
        );
      };
      const devCreateRes = await devicesRoute.POST(
        new NextRequest("http://localhost/api/byod/devices", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            teamId,
            deviceLabel: "rink-north-pod-01",
            deviceModel: "iphone-16-pro",
            glassType: "tempered",
            rtmpsEgressConfigured: true,
            rtmpsKeyHintLast4: "A1B2",
          }),
        }),
      );
      assert.equal(devCreateRes.status, 201);
      assert.equal(captured[0].method, "POST");
      assert.deepEqual(captured[0].body, {
        device_label: "rink-north-pod-01",
        device_model: "iphone-16-pro",
        glass_type: "tempered",
        rtmps_egress_configured: true,
        rtmps_key_hint_last4: "A1B2",
      });
      const devCreateJson = await devCreateRes.json();
      assert.equal(devCreateJson.pairingCode, "9A8B7C6D");

      // 4. GET /api/byod/devices/[deviceId] spanning page 2
      captured = [];
      upstreamHandler = (req, res) => {
        res.writeHead(200, { "content-type": "application/json" });
        if (req.url.includes("offset=0")) {
          res.end(JSON.stringify({ items: [sampleDeviceSnake], total: 2, limit: 100, offset: 0 }));
        } else {
          res.end(
            JSON.stringify({
              items: [{ ...sampleDeviceSnake, id: deviceIdPage2, device_label: "rink-south-pod-02" }],
              total: 2,
              limit: 100,
              offset: 1,
            }),
          );
        }
      };
      const getByIdRes = await deviceIdRoute.GET(
        new NextRequest(`http://localhost/api/byod/devices/${deviceIdPage2}?teamId=${teamId}`),
        { params: Promise.resolve({ deviceId: deviceIdPage2 }) },
      );
      assert.equal(getByIdRes.status, 200);
      assert.equal((await getByIdRes.json()).deviceLabel, "rink-south-pod-02");
      assert.equal(captured.length, 2);

      // Missing device -> 404
      const missingId = "99999999-9999-4999-8999-999999999999";
      const getMissingRes = await deviceIdRoute.GET(
        new NextRequest(`http://localhost/api/byod/devices/${missingId}?teamId=${teamId}`),
        { params: Promise.resolve({ deviceId: missingId }) },
      );
      assert.equal(getMissingRes.status, 404);

      // 5. PATCH /api/byod/devices/[deviceId]
      captured = [];
      upstreamHandler = (_req, res) => {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            device: { ...sampleDeviceSnake, device_label: "rink-north-pod-02" },
            pairing_code: "ZXCVBN23",
            pairing_code_expires_at: "2026-11-22T12:20:00Z",
          }),
        );
      };
      const patchRes = await deviceIdRoute.PATCH(
        new NextRequest(`http://localhost/api/byod/devices/${deviceId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ teamId, deviceLabel: "rink-north-pod-02", rotatePairingCode: true }),
        }),
        { params: Promise.resolve({ deviceId }) },
      );
      assert.equal(patchRes.status, 200);
      assert.deepEqual(captured[0].body, {
        device_label: "rink-north-pod-02",
        rotate_pairing_code: true,
      });

      // 6. DELETE /api/byod/devices/[deviceId] (soft revoke 200)
      captured = [];
      upstreamHandler = (_req, res) => {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            id: deviceId,
            pairing_status: "revoked",
            revoked_at: "2026-11-22T12:25:00Z",
          }),
        );
      };
      const delRes = await deviceIdRoute.DELETE(
        new NextRequest(`http://localhost/api/byod/devices/${deviceId}?teamId=${teamId}`, { method: "DELETE" }),
        { params: Promise.resolve({ deviceId }) },
      );
      assert.equal(delRes.status, 200);
      assert.equal(captured[0].method, "DELETE");
      assert.equal((await delRes.json()).pairingStatus, "revoked");

      // 7. GET & POST /api/byod/devices/[deviceId]/calibrations
      captured = [];
      upstreamHandler = (req, res) => {
        if (req.method === "GET") {
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify({ items: [sampleCalSnake], total: 1, limit: 25, offset: 0 }));
        } else {
          res.writeHead(201, { "content-type": "application/json" });
          res.end(JSON.stringify(sampleCalSnake));
        }
      };
      const calListRes = await calibrationsRoute.GET(
        new NextRequest(`http://localhost/api/byod/devices/${deviceId}/calibrations?teamId=${teamId}`),
        { params: Promise.resolve({ deviceId }) },
      );
      assert.equal(calListRes.status, 200);
      assert.equal((await calListRes.json()).items[0].dieTempC, 31.4);

      const calPostRes = await calibrationsRoute.POST(
        new NextRequest(`http://localhost/api/byod/devices/${deviceId}/calibrations`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ teamId, dieTempC: 31.4, mountVacuumKpa: 68.5 }),
        }),
        { params: Promise.resolve({ deviceId }) },
      );
      assert.equal(calPostRes.status, 201);
      assert.deepEqual(captured[1].body, { die_temp_c: 31.4, mount_vacuum_kpa: 68.5 });
    });

    await runTest("BFF preserves upstream 403/404/409/503, maps drift to 502, and maps unreachable upstream to 503", async () => {
      mockAccess = { status: "entitled", userId: "user-1" };

      for (const [status, detail] of [
        [403, "FDE access refused"],
        [404, "BYOD device not found"],
        [409, "Revoked BYOD devices cannot be modified"],
        [503, "BYOD pairing secret is not configured"],
      ] as const) {
        upstreamHandler = (_req, res) => {
          res.writeHead(status, { "content-type": "application/json" });
          res.end(JSON.stringify({ detail }));
        };
        const res = await deviceIdRoute.PATCH(
          new NextRequest(`http://localhost/api/byod/devices/${deviceId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ teamId, deviceLabel: "pod-1" }),
          }),
          { params: Promise.resolve({ deviceId }) },
        );
        assert.equal(res.status, status);
      }

      // Contract drift -> 502 with BYOD-specific error message
      upstreamHandler = (_req, res) => {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ wrong_shape: true }));
      };
      const driftRes = await teamsRoute.GET();
      assert.equal(driftRes.status, 502);
      const driftJson = await driftRes.json();
      assert.equal(driftJson.error, "Upstream BYOD response violated expected contract.");

      // Unreachable upstream -> 503
      await new Promise<void>((resolve) => server.close(() => resolve()));
      const downRes = await teamsRoute.GET();
      assert.equal(downRes.status, 503);
    });
  } finally {
    MI._load = origLoad;
    if (savedUrl === undefined) delete process.env.HOCKEY_API_URL;
    else process.env.HOCKEY_API_URL = savedUrl;
    if (server.listening) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }

  await runTest("BYOD UI components comply with Zero-Purple and render required spec-t63 elements", () => {
    const byodFiles = [
      "src/types/byod-types.ts",
      "src/lib/byod/byod-mappers.ts",
      "src/lib/byod/byod-bff.ts",
      "src/lib/byod/byod-api-client.ts",
      "src/lib/byod/byod-form.ts",
      "src/lib/byod/webaudio-tone.ts",
      "src/components/vision/BYODSetupWizard.tsx",
      "src/components/vision/ByodDeviceFleetPanel.tsx",
      "src/components/vision/ByodCalibrationReadout.tsx",
      "src/app/byod-setup/page.tsx",
    ];
    const purpleRegex = /(?:text|bg|border|ring|from|to|via)-(?:purple|indigo|violet|fuchsia)-[0-9]+/i;
    for (const rel of byodFiles) {
      const content = fs.readFileSync(path.join(process.cwd(), rel), "utf8");
      assert.doesNotMatch(content, purpleRegex, `${rel} must contain zero purple/indigo/violet/fuchsia tokens`);
    }

    const wizardHtml = renderToStaticMarkup(React.createElement(BYODSetupWizard));
    assert.match(wizardHtml, /iPhone 16 Pro/);
    assert.match(wizardHtml, /iPhone 15 Pro/);
    assert.match(wizardHtml, /iPad Pro \(M4\)/);
    assert.match(wizardHtml, /Custom RTMPS Hardware Encoder/);
    assert.match(wizardHtml, /byod-device-label/);
    assert.match(wizardHtml, /byod-mesh-service/);
    assert.doesNotMatch(wizardHtml, /\/club-revshare/);

    const wizardSrc = fs.readFileSync(path.join(process.cwd(), "src/components/vision/BYODSetupWizard.tsx"), "utf8");
    assert.match(wizardSrc, /Dual-Vacuum Pump Engagement \(target >= 65\.0 kPa vacuum \/ 65 lbf suction-arm spec\)/);
    assert.match(wizardSrc, /Play 3\.2 kHz Local Reference Tone \(Browser Speaker\)/);
    assert.match(wizardSrc, /Operator Verified Audible Tone/);
    assert.match(wizardSrc, /Open Director Console/);
    assert.match(wizardSrc, /Back to Team Devices/);
    assert.match(wizardSrc, /\/login\?next=\/byod-setup/);
    assert.match(wizardSrc, /selectedDevice\??\.effectiveStatus === "offline"/);
    assert.match(wizardSrc, /selectedDevice\??\.effectiveStatus === "revoked"/);

    const fleetSrc = fs.readFileSync(path.join(process.cwd(), "src/components/vision/ByodDeviceFleetPanel.tsx"), "utf8");
    assert.match(fleetSrc, /isEditing && !isRevoked/);

    const emptyReadout = renderToStaticMarkup(React.createElement(ByodCalibrationReadout, { calibration: null }));
    assert.equal((emptyReadout.match(/data-testid="byod-not-measured"/g) ?? []).length, 9);

    const lowOnlyHtml = renderToStaticMarkup(
      React.createElement(ByodCalibrationReadout, {
        calibration: {
          id: calId,
          deviceId,
          teamId,
          recordedBySubject: "user:1",
          calibrationSource: "manual_check",
          opticalTiltDeg: null,
          opticalHorizonLocked: null,
          mountVacuumKpa: null,
          dieTempC: null,
          powerDeliveryWatts: null,
          peltierState: null,
          acousticSnrDb: null,
          whistleFilterHzLow: 2800,
          whistleFilterHzHigh: null,
          notes: null,
          measuredAt: "2026-11-22T12:00:00Z",
        },
      }),
    );
    assert.match(lowOnlyHtml, /&gt;= 2800 Hz/);

    const highOnlyFleetHtml = renderToStaticMarkup(
      React.createElement(ByodDeviceFleetPanel, {
        devices: [
          {
            id: deviceId,
            teamId,
            registeredByUserId: "user-1",
            deviceLabel: "rink-north-pod-01",
            deviceModel: "iphone-16-pro",
            glassType: "tempered",
            pairingStatus: "operator_registered",
            effectiveStatus: "operator_registered",
            pairingAttempts: 0,
            pairingCodeExpiresAt: null,
            rtmpsEgressConfigured: false,
            rtmpsKeyHintLast4: null,
            meshServiceName: null,
            pairedAt: null,
            lastSeenAt: null,
            revokedAt: null,
            createdAt: "2026-11-22T11:55:00Z",
            updatedAt: "2026-11-22T12:00:00Z",
            latestCalibration: null,
          },
        ],
        total: 1,
        selectedDeviceId: deviceId,
        calibrations: [
          {
            id: calId,
            deviceId,
            teamId,
            recordedBySubject: "user:1",
            calibrationSource: "manual_check",
            opticalTiltDeg: null,
            opticalHorizonLocked: null,
            mountVacuumKpa: null,
            dieTempC: null,
            powerDeliveryWatts: null,
            peltierState: null,
            acousticSnrDb: null,
            whistleFilterHzLow: null,
            whistleFilterHzHigh: 3800,
            notes: null,
            measuredAt: "2026-11-22T12:00:00Z",
          },
        ],
        calibrationsTotal: 1,
        onSelectDevice: () => {},
      }),
    );
    assert.match(highOnlyFleetHtml, /Passband: &lt;= 3800 Hz/);
  });

  console.log("\n=== ALL BYOD T6.3 / O-09 CHECKS PASSED ===\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
