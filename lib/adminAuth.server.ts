import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type AdminAuthResult =
  | { ok: true }
  | {
      ok: false;
      response: NextResponse;
    };

const BEARER_PREFIX = "Bearer ";

export function validateAdminRequest(request: NextRequest): AdminAuthResult {
  const configuredToken = process.env.ADMIN_EXPORT_TOKEN;

  if (!configuredToken) {
    return {
      ok: false,
      response: adminJsonError("Admin export is not configured.", 500),
    };
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith(BEARER_PREFIX)) {
    return {
      ok: false,
      response: adminJsonError("Unauthorized.", 401),
    };
  }

  const suppliedToken = authorization.slice(BEARER_PREFIX.length);
  if (!suppliedToken || !constantTimeTokenEquals(suppliedToken, configuredToken)) {
    return {
      ok: false,
      response: adminJsonError("Unauthorized.", 401),
    };
  }

  return { ok: true };
}

function constantTimeTokenEquals(a: string, b: string): boolean {
  const aHash = createHash("sha256").update(a).digest();
  const bHash = createHash("sha256").update(b).digest();

  return timingSafeEqual(aHash, bHash);
}

function adminJsonError(error: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, error }, { status });
}
