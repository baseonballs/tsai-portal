import { NextRequest } from "next/server";

import { getEntitledPortalUser } from "@/lib/auth/portal-entitlement";
import {
  forwardByodHockeyApi,
  mapByodResponse,
  rejectForbiddenByodSecrets,
  resolveByodCaller,
} from "@/lib/byod/byod-bff";
import {
  mapByodDeviceCreateResult,
  mapByodDevicePage,
  mapByodDeviceRevokeResult,
  toByodUpstreamPayload,
} from "@/lib/byod/byod-mappers";
import {
  extractValidatedTeamId,
  isValidUuid,
  jsonNoStore,
  readJsonObject,
} from "@/lib/hockey-api";

type Params = { params: Promise<{ deviceId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const caller = await resolveByodCaller(() => getEntitledPortalUser());
  if (!caller.ok) return caller.response;

  const { deviceId } = await params;
  if (!isValidUuid(deviceId)) return jsonNoStore({ error: "Invalid deviceId." }, 400);

  const teamCheck = extractValidatedTeamId(req);
  if (!teamCheck.ok) return teamCheck.response;

  const targetId = deviceId.trim().toLowerCase();
  const pageLimit = 100;
  let offset = 0;

  for (let page = 0; page < 50; page += 1) {
    const query = new URLSearchParams({ limit: String(pageLimit), offset: String(offset) });
    const res = await forwardByodHockeyApi({
      path: `/teams/${encodeURIComponent(teamCheck.teamId)}/byod/devices`,
      query,
      accessToken: caller.accessToken,
    });
    if (!res.ok) return res.response;

    const mapped = mapByodResponse(() => mapByodDevicePage(res.data));
    if (!mapped.ok) return mapped.response;

    const hit = mapped.data.items.find((d) => d.id.toLowerCase() === targetId);
    if (hit) return jsonNoStore(hit);

    offset += mapped.data.items.length;
    if (mapped.data.items.length === 0 || offset >= mapped.data.total) break;
  }

  return jsonNoStore({ error: "BYOD device not found." }, 404);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const caller = await resolveByodCaller(() => getEntitledPortalUser());
  if (!caller.ok) return caller.response;

  const { deviceId } = await params;
  if (!isValidUuid(deviceId)) return jsonNoStore({ error: "Invalid deviceId." }, 400);

  const parsed = await readJsonObject(req);
  if (!parsed.ok) return parsed.response;

  const teamCheck = extractValidatedTeamId(req, parsed.data);
  if (!teamCheck.ok) return teamCheck.response;

  const secretRejection = rejectForbiddenByodSecrets(parsed.data);
  if (secretRejection) return secretRejection;

  const res = await forwardByodHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/byod/devices/${encodeURIComponent(deviceId.trim())}`,
    method: "PATCH",
    body: toByodUpstreamPayload(parsed.data),
    accessToken: caller.accessToken,
  });
  if (!res.ok) return res.response;

  const mapped = mapByodResponse(() => mapByodDeviceCreateResult(res.data));
  if (!mapped.ok) return mapped.response;

  return jsonNoStore(mapped.data);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const caller = await resolveByodCaller(() => getEntitledPortalUser());
  if (!caller.ok) return caller.response;

  const { deviceId } = await params;
  if (!isValidUuid(deviceId)) return jsonNoStore({ error: "Invalid deviceId." }, 400);

  const teamCheck = extractValidatedTeamId(req);
  if (!teamCheck.ok) return teamCheck.response;

  const res = await forwardByodHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/byod/devices/${encodeURIComponent(deviceId.trim())}`,
    method: "DELETE",
    accessToken: caller.accessToken,
  });
  if (!res.ok) return res.response;

  const mapped = mapByodResponse(() => mapByodDeviceRevokeResult(res.data));
  if (!mapped.ok) return mapped.response;

  return jsonNoStore(mapped.data);
}
