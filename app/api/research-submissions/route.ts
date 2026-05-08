import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { researchExportSchema } from "@/lib/researchExportSchema";
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

export async function POST(request: NextRequest) {
  if (!isServerSubmissionEnabled()) {
    return NextResponse.json({ ok: false, error: "Server submission is disabled." }, { status: 503 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is required when server submission is enabled." }, { status: 500 });
  }

  const rateLimitResponse = checkRateLimit(getClientKey(request));
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const bodyText = await request.text();
  if (Buffer.byteLength(bodyText, "utf8") > getMaxSubmissionBodyBytes()) {
    return NextResponse.json({ ok: false, error: "Submission body is too large." }, { status: 413 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ ok: false, error: "Submission body must be valid JSON." }, { status: 400 });
  }

  const validation = researchExportSchema.safeParse(parsedJson);
  if (!validation.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Submission did not match the complete research export schema.",
        issues: validation.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const prisma = getPrismaClient();
    const submission = await prisma.researchSubmission.create({
      data: {
        sessionId: validation.data.sessionId,
        schemaVersion: validation.data.schemaVersion,
        exportVersion: validation.data.exportVersion,
        consentVersion: validation.data.consentVersion ?? process.env.CONSENT_VERSION,
        assignedDisplayedProfile: validation.data.assignedProfile.displayedProfile,
        assignedHiddenProfile: validation.data.assignedProfile.hiddenProfile,
        completedGameRounds: validation.data.completeness.completedGameRounds,
        payload: validation.data as Prisma.InputJsonValue,
        appVersion: process.env.npm_package_version,
        userAgentHash: hashUserAgent(request.headers.get("user-agent")),
      },
      select: {
        id: true,
        submittedAt: true,
      },
    });

    return NextResponse.json({ ok: true, submission }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";
    return NextResponse.json({ ok: false, error: "Unable to store submission.", detail: message }, { status: 500 });
  }
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
    return NextResponse.json({ ok: false, error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  return null;
}

function hashUserAgent(userAgent: string | null): string | undefined {
  if (!userAgent) {
    return undefined;
  }

  return createHash("sha256").update(userAgent).digest("hex");
}
