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
const PLACEHOLDER_ADMIN_TOKEN = "change-me-before-production";

export function validateAdminRequest(request: NextRequest): AdminAuthResult {
  const configuredToken = process.env.ADMIN_EXPORT_TOKEN?.trim();

  if (!configuredToken) {
    return {
      ok: false,
      response: adminJsonError("Admin export is not configured.", 500),
    };
  }

  if (isUnsafeProductionAdminToken(configuredToken)) {
    return {
      ok: false,
      response: adminJsonError("Admin export token must be changed before production use.", 500),
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

export function adminJsonResponse(body: unknown, init: ResponseInit = {}): NextResponse {
  return NextResponse.json(body, withAdminNoStore(init));
}

export function withAdminNoStore(init: ResponseInit = {}): ResponseInit {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");

  return {
    ...init,
    headers,
  };
}

function isUnsafeProductionAdminToken(token: string): boolean {
  return process.env.NODE_ENV === "production" && token === PLACEHOLDER_ADMIN_TOKEN;
}

function constantTimeTokenEquals(a: string, b: string): boolean {
  const aHash = createHash("sha256").update(a).digest();
  const bHash = createHash("sha256").update(b).digest();

  return timingSafeEqual(aHash, bHash);
}

function adminJsonError(error: string, status: number): NextResponse {
  return adminJsonResponse({ ok: false, error }, { status });
}
