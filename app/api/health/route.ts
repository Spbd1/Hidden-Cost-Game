import { NextResponse } from "next/server";
import { isDatabaseConfigured, isServerSubmissionEnabled } from "@/lib/serverConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "hidden-cost-game",
      timestamp: new Date().toISOString(),
      serverSubmissionEnabled: isServerSubmissionEnabled(),
      databaseConfigured: isDatabaseConfigured(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
