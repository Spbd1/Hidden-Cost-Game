import { randomUUID, createHash } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { sendSubmissionToGoogleSheets } from "@/lib/googleSheetsWebhook";
import { researchExportSchema, type ValidResearchExport } from "@/lib/researchExportSchema";
import {
  getMaxSubmissionBodyBytes,
  getSubmissionRateLimitMax,
  getSubmissionRateLimitWindowMs,
  isDatabaseConfigured,
  isServerSubmissionEnabled,
} from "@/lib/serverConfig";

export const runtime = "nodejs";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitEntry>();

type ResearchSubmissionCreateData = Parameters<PrismaClient["researchSubmission"]["create"]>[0]["data"];
type ResearchSubmissionPayloadInput = ResearchSubmissionCreateData["payload"];

type ResearchSubmissionPayload = ValidResearchExport & {
  serverSubmissionId: string;
  submittedAt: string;
};

export async function POST(request: NextRequest) {
  if (!isServerSubmissionEnabled()) {
    return jsonError("Server submission is disabled for this deployment.", 403);
  }

  if (!isDatabaseConfigured()) {
    return jsonError("Server submission is enabled, but the database is not configured.", 500);
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number.parseInt(contentLength, 10) > getMaxSubmissionBodyBytes()) {
    return jsonError("Submission body is too large.", 413);
  }

  const rateLimitResponse = checkRateLimit(getClientKey(request));
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const bodyText = await request.text();
  if (Buffer.byteLength(bodyText, "utf8") > getMaxSubmissionBodyBytes()) {
    return jsonError("Submission body is too large.", 413);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(bodyText);
  } catch {
    return jsonError("Submission body must be valid JSON.", 400);
  }

  const validation = researchExportSchema.safeParse(parsedJson);
  if (!validation.success) {
    return submissionJsonResponse(
      {
        ok: false,
        error: "Submission must be a complete research export JSON object.",
        issues: validation.error.flatten(),
      },
      { status: 422 },
    );
  }

  const serverSubmissionId = randomUUID();
  const submittedAt = new Date();
  const payload: ResearchSubmissionPayload = {
    ...validation.data,
    serverSubmissionId,
    submittedAt: submittedAt.toISOString(),
  };

  try {
    const prisma = getPrismaClient();
    await prisma.researchSubmission.create({
      data: {
        id: serverSubmissionId,
        sessionId: validation.data.sessionId,
        schemaVersion: validation.data.schemaVersion,
        exportVersion: validation.data.exportVersion,
        consentVersion: validation.data.consentVersion ?? process.env.CONSENT_VERSION,
        assignedDisplayedProfile: validation.data.assignedProfile.displayedProfile,
        assignedHiddenProfile: validation.data.assignedProfile.hiddenProfile,
        completedGameRounds: validation.data.completeness.completedGameRounds,
        submittedAt,
        payload: payload as ResearchSubmissionPayloadInput,
        appVersion: process.env.npm_package_version,
        userAgentHash: hashUserAgent(request.headers.get("user-agent")),
      },
      select: {
        id: true,
      },
    });

    await sendSubmissionToGoogleSheets(payload, {
      serverSubmissionId,
      submittedAt,
    });

    return submissionJsonResponse(
      {
        ok: true,
        serverSubmissionId,
        submittedAt: submittedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch {
    return jsonError("Unable to store submission. Please try again later.", 500);
  }
}

function jsonError(error: string, status: number): NextResponse {
  return submissionJsonResponse({ ok: false, error }, { status });
}

function submissionJsonResponse(body: unknown, init: ResponseInit = {}): NextResponse {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

function getClientKey(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor || realIp || "unknown-client";
}

function checkRateLimit(clientKey: string): NextResponse | null {
  const now = Date.now();
  const windowMs = getSubmissionRateLimitWindowMs();
  const maxRequests = getSubmissionRateLimitMax();
  const current = rateLimitBuckets.get(clientKey);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(clientKey, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count > maxRequests) {
    return jsonError("Too many submissions. Please try again later.", 429);
  }

  return null;
}

function hashUserAgent(userAgent: string | null): string | undefined {
  if (!userAgent) {
    return undefined;
  }

  return createHash("sha256").update(userAgent).digest("hex");
}
