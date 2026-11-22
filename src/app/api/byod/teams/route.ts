import { getEntitledPortalUser } from "@/lib/auth/portal-entitlement";
import { forwardByodHockeyApi, mapByodResponse, resolveByodCaller } from "@/lib/byod/byod-bff";
import { mapByodTeamList } from "@/lib/byod/byod-mappers";
import { jsonNoStore } from "@/lib/hockey-api";

export async function GET() {
  const caller = await resolveByodCaller(() => getEntitledPortalUser());
  if (!caller.ok) return caller.response;

  const res = await forwardByodHockeyApi({
    path: "/byod/teams",
    accessToken: caller.accessToken,
  });
  if (!res.ok) return res.response;

  const mapped = mapByodResponse(() => mapByodTeamList(res.data));
  if (!mapped.ok) return mapped.response;

  return jsonNoStore({ items: mapped.data });
}
