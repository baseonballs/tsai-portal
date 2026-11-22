import { NextRequest } from "next/server";

import { getEntitledPortalUser } from "@/lib/auth/portal-entitlement";
import {
  forwardByodHockeyApi,
  mapByodResponse,
  parseByodPagination,
  rejectForbiddenByodSecrets,
  resolveByodCaller,
} from "@/lib/byod/byod-bff";
import {
  mapByodDeviceCreateResult,
  mapByodDevicePage,
  toByodUpstreamPayload,
} from "@/lib/byod/byod-mappers";
import {
  extractValidatedTeamId,
  jsonNoStore,
  readJsonObject,
} from "@/lib/hockey-api";

export async function GET(req: NextRequest) {
  const caller = await resolveByodCaller(() => getEntitledPortalUser());
  if (!caller.ok) return caller.response;

  const teamCheck = extractValidatedTeamId(req);
  if (!teamCheck.ok) return teamCheck.response;

  const pageCheck = parseByodPagination(req);
  if (!pageCheck.ok) return pageCheck.response;

  const res = await forwardByodHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/byod/devices`,
    query: pageCheck.query,
    accessToken: caller.accessToken,
  });
  if (!res.ok) return res.response;

  const mapped = mapByodResponse(() => mapByodDevicePage(res.data));
  if (!mapped.ok) return mapped.response;

  return jsonNoStore(mapped.data);
}

export async function POST(req: NextRequest) {
  const caller = await resolveByodCaller(() => getEntitledPortalUser());
  if (!caller.ok) return caller.response;

  const parsed = await readJsonObject(req);
  if (!parsed.ok) return parsed.response;

  const teamCheck = extractValidatedTeamId(req, parsed.data);
  if (!teamCheck.ok) return teamCheck.response;

  const secretRejection = rejectForbiddenByodSecrets(parsed.data);
  if (secretRejection) return secretRejection;

  const res = await forwardByodHockeyApi({
    path: `/teams/${encodeURIComponent(teamCheck.teamId)}/byod/devices`,
    method: "POST",
    body: toByodUpstreamPayload(parsed.data),
    accessToken: caller.accessToken,
  });
  if (!res.ok) return res.response;

  const mapped = mapByodResponse(() => mapByodDeviceCreateResult(res.data));
  if (!mapped.ok) return mapped.response;

  return jsonNoStore(mapped.data, res.status === 201 ? 201 : 200);
}
