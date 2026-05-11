import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { adminJsonResponse, validateAdminRequest, withAdminNoStore } from "@/lib/adminAuth.server";
import { AdminSubmissionError, listAllAdminSubmissions, submissionsToCsv } from "@/lib/adminSubmissions";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = validateAdminRequest(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const items = await listAllAdminSubmissions();
    return new NextResponse(submissionsToCsv(items), withAdminNoStore({
      headers: {
        "content-disposition": "attachment; filename=\"submissions.csv\"",
        "content-type": "text/csv; charset=utf-8",
      },
    }));
  } catch (error) {
    if (error instanceof AdminSubmissionError) {
      return adminJsonResponse({ ok: false, error: error.message }, { status: error.status });
    }

    return adminJsonResponse({ ok: false, error: "Unable to retrieve submissions." }, { status: 500 });
  }
}
