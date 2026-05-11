import type { NextRequest } from "next/server";
import packageJson from "@/package.json";
import {
  adminJsonResponse,
  DEFAULT_ADMIN_EXPORT_TOKEN,
  validateAdminRequest,
} from "@/lib/adminAuth.server";
import { getPrismaClient } from "@/lib/prisma";
import {
  getMaxSubmissionBodyBytes,
  getSubmissionRateLimitMax,
  getSubmissionRateLimitWindowMs,
  isDatabaseConfigured,
  isServerSubmissionEnabled,
} from "@/lib/serverConfig";

export const runtime = "nodejs";

type DiagnosticsPayload = {
  ok: true;
  nodeEnv: string;
  appVersion: string;
  serverTime: string;
  databaseConfigured: boolean;
  databaseReachable: boolean;
  serverSubmissionEnabled: boolean;
  googleSheetsWebhookConfigured: boolean;
  googleSheetsSecretConfigured: boolean;
  adminTokenConfigured: boolean;
  adminTokenUsesDefaultValue: boolean;
  maxSubmissionBodyBytes: number;
  submissionRateLimitWindowMs: number;
  submissionRateLimitMax: number;
  latestSubmissionAt: string | null;
  totalSubmissions: number;
};

export async function GET(request: NextRequest) {
  const auth = validateAdminRequest(request);
  if (!auth.ok) {
    return auth.response;
  }

  const databaseConfigured = isDatabaseConfigured();
  const diagnostics: DiagnosticsPayload = {
    ok: true,
    nodeEnv: process.env.NODE_ENV || "unknown",
    appVersion: process.env.npm_package_version || packageJson.version,
    serverTime: new Date().toISOString(),
    databaseConfigured,
    databaseReachable: false,
    serverSubmissionEnabled: isServerSubmissionEnabled(),
    googleSheetsWebhookConfigured: Boolean(
      process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim(),
    ),
    googleSheetsSecretConfigured: Boolean(
      process.env.GOOGLE_SHEETS_WEBHOOK_SECRET?.trim(),
    ),
    adminTokenConfigured: Boolean(process.env.ADMIN_EXPORT_TOKEN?.trim()),
    adminTokenUsesDefaultValue:
      process.env.ADMIN_EXPORT_TOKEN?.trim() === DEFAULT_ADMIN_EXPORT_TOKEN,
    maxSubmissionBodyBytes: getMaxSubmissionBodyBytes(),
    submissionRateLimitWindowMs: getSubmissionRateLimitWindowMs(),
    submissionRateLimitMax: getSubmissionRateLimitMax(),
    latestSubmissionAt: null,
    totalSubmissions: 0,
  };

  if (!databaseConfigured) {
    return adminJsonResponse(diagnostics);
  }

  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;

    const [totalSubmissions, latestSubmission] = await Promise.all([
      prisma.researchSubmission.count(),
      prisma.researchSubmission.findFirst({
        orderBy: { submittedAt: "desc" },
        select: { submittedAt: true },
      }),
    ]);

    diagnostics.databaseReachable = true;
    diagnostics.totalSubmissions = totalSubmissions;
    diagnostics.latestSubmissionAt =
      latestSubmission?.submittedAt.toISOString() ?? null;

    return adminJsonResponse(diagnostics);
  } catch {
    return adminJsonResponse(
      {
        ...diagnostics,
        ok: false,
        error: "Database is configured but unreachable.",
      },
      { status: 503 },
    );
  }
}
