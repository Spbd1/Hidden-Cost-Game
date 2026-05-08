import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/adminAuth.server";
import { AdminSubmissionError, adminSubmissionPageJson, listAdminSubmissions } from "@/lib/adminSubmissions";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = validateAdminRequest(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const page = await listAdminSubmissions(request.nextUrl.searchParams);
    return NextResponse.json(adminSubmissionPageJson(page));
  } catch (error) {
    if (error instanceof AdminSubmissionError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    return NextResponse.json({ ok: false, error: "Unable to retrieve submissions." }, { status: 500 });
  }
}
