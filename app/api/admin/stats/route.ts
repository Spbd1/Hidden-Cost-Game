import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/adminAuth.server";
import { AdminSubmissionError, adminStatsJson, getAdminStats } from "@/lib/adminSubmissions";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = validateAdminRequest(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const stats = await getAdminStats();
    return NextResponse.json(adminStatsJson(stats));
  } catch (error) {
    if (error instanceof AdminSubmissionError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    return NextResponse.json({ ok: false, error: "Unable to retrieve admin stats." }, { status: 500 });
  }
}
