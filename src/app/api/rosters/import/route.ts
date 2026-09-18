//
//  route.ts
//  tsai-portal / api / rosters / import
//
//  Author / Inventor: Jeffrey T. Lucas
//  Assignee: Transcendental Sports AI LLC
//  Patent Track: Track 16 (Claim 8) & COPPA Invariant Protection
//

import { importGameSheetRoster } from "@/lib/roster/gamesheet-roster-service";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let csvContent = "";
    let teamName: string | undefined;
    let season: string | undefined;
    let levelOfPlay: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (file && typeof file === "object" && "text" in file) {
        csvContent = await (file as Blob).text();
      }
      teamName = (formData.get("teamName") as string) || undefined;
      season = (formData.get("season") as string) || undefined;
      levelOfPlay = (formData.get("levelOfPlay") as string) || undefined;
    } else {
      const body = await req.json();
      csvContent = body.csv || "";
      teamName = body.teamName;
      season = body.season;
      levelOfPlay = body.levelOfPlay;
    }

    if (!csvContent || csvContent.trim().length === 0) {
      return Response.json(
        { error: "Roster CSV content is required." },
        { status: 400 }
      );
    }

    const result = importGameSheetRoster(csvContent, {
      teamName,
      season,
      levelOfPlay,
    });

    if (!result.success) {
      return Response.json(result, { status: 400 });
    }

    return Response.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return Response.json(
      { error: "Failed to process roster import.", details: message },
      { status: 500 }
    );
  }
}
