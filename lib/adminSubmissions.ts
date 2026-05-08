import type { Prisma } from "@prisma/client";
import { getPrismaClient } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/serverConfig";

export type AdminSubmissionItem = {
  id: string;
  sessionId: string;
  submittedAt: string;
  schemaVersion: string;
  exportVersion: string;
  consentVersion: string | null;
  assignedDisplayedProfile: string | null;
  assignedHiddenProfile: string | null;
  completedGameRounds: number;
  payload: Prisma.JsonValue;
};

export type AdminSubmissionPage = {
  items: AdminSubmissionItem[];
  nextCursor?: string;
};

type CursorPayload = {
  submittedAt: string;
  id: string;
};

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export class AdminSubmissionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AdminSubmissionError";
  }
}

export async function listAdminSubmissions(searchParams: URLSearchParams): Promise<AdminSubmissionPage> {
  assertDatabaseConfigured();

  const limit = parseLimit(searchParams.get("limit"));
  const cursor = parseCursor(searchParams.get("cursor"));
  const prisma = getPrismaClient();
  const where: Prisma.ResearchSubmissionWhereInput | undefined = cursor
    ? {
        OR: [
          { submittedAt: { lt: cursor.submittedAt } },
          { submittedAt: { equals: cursor.submittedAt }, id: { lt: cursor.id } },
        ],
      }
    : undefined;

  const rows = await prisma.researchSubmission.findMany({
    where,
    orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select: submissionSelect,
  });

  const pageRows = rows.slice(0, limit);
  const nextCursor = rows.length > limit ? encodeCursor(pageRows[pageRows.length - 1]) : undefined;

  return {
    items: normalizeRows(pageRows),
    nextCursor,
  };
}

export async function listAllAdminSubmissions(): Promise<AdminSubmissionItem[]> {
  assertDatabaseConfigured();

  const prisma = getPrismaClient();
  const rows = await prisma.researchSubmission.findMany({
    orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
    select: submissionSelect,
  });

  return normalizeRows(rows);
}

function assertDatabaseConfigured() {
  if (!isDatabaseConfigured()) {
    throw new AdminSubmissionError("Database is not configured.", 500);
  }
}

export function adminSubmissionPageJson(page: AdminSubmissionPage) {
  return {
    ok: true,
    items: page.items,
    nextCursor: page.nextCursor,
  };
}

export function submissionsToCsv(items: AdminSubmissionItem[]): string {
  const lines = [CSV_COLUMNS.map((column) => csvEscape(column.header)).join(",")];

  for (const item of items) {
    lines.push(CSV_COLUMNS.map((column) => csvEscape(column.read(item))).join(","));
  }

  return `${lines.join("\n")}\n`;
}

function parseLimit(rawLimit: string | null): number {
  if (!rawLimit) {
    return DEFAULT_LIMIT;
  }

  const parsed = Number.parseInt(rawLimit, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new AdminSubmissionError("limit must be a positive integer.", 400);
  }

  return Math.min(parsed, MAX_LIMIT);
}

function parseCursor(rawCursor: string | null): { submittedAt: Date; id: string } | undefined {
  if (!rawCursor) {
    return undefined;
  }

  try {
    const decoded = JSON.parse(Buffer.from(rawCursor, "base64url").toString("utf8")) as Partial<CursorPayload>;
    if (!decoded.submittedAt || !decoded.id) {
      throw new Error("Incomplete cursor.");
    }

    const submittedAt = new Date(decoded.submittedAt);
    if (Number.isNaN(submittedAt.getTime())) {
      throw new Error("Invalid cursor date.");
    }

    return { submittedAt, id: decoded.id };
  } catch {
    throw new AdminSubmissionError("cursor is invalid.", 400);
  }
}

function encodeCursor(row: { submittedAt: string | Date; id: string } | undefined): string | undefined {
  if (!row) {
    return undefined;
  }

  const submittedAt = row.submittedAt instanceof Date ? row.submittedAt.toISOString() : row.submittedAt;
  return Buffer.from(JSON.stringify({ submittedAt, id: row.id }), "utf8").toString("base64url");
}

const submissionSelect = {
  id: true,
  sessionId: true,
  submittedAt: true,
  schemaVersion: true,
  exportVersion: true,
  consentVersion: true,
  assignedDisplayedProfile: true,
  assignedHiddenProfile: true,
  completedGameRounds: true,
  payload: true,
} satisfies Prisma.ResearchSubmissionSelect;

type AdminSubmissionRow = {
  id: string;
  sessionId: string;
  submittedAt: Date;
  schemaVersion: string;
  exportVersion: string;
  consentVersion: string | null;
  assignedDisplayedProfile: string | null;
  assignedHiddenProfile: string | null;
  completedGameRounds: number;
  payload: Prisma.JsonValue;
};

function normalizeRows(rows: AdminSubmissionRow[]): AdminSubmissionItem[] {
  return rows.map((row) => ({
    ...row,
    submittedAt: row.submittedAt.toISOString(),
  }));
}

type CsvColumn = {
  header: string;
  read: (item: AdminSubmissionItem) => unknown;
};

const CSV_COLUMNS: CsvColumn[] = [
  dbColumn("submission_id", "id"),
  dbColumn("session_id", "sessionId"),
  dbColumn("submitted_at", "submittedAt"),
  dbColumn("schema_version", "schemaVersion"),
  dbColumn("export_version", "exportVersion"),
  dbColumn("consent_version", "consentVersion"),
  dbColumn("assigned_displayed_profile", "assignedDisplayedProfile"),
  dbColumn("assigned_hidden_profile", "assignedHiddenProfile"),
  dbColumn("completed_game_rounds", "completedGameRounds"),
  payloadColumn("final_financial_score", ["gameSummary", "finalFinancialScore"]),
  payloadColumn("final_health_score", ["gameSummary", "finalHealthScore"]),
  payloadColumn("total_treatment_cost_paid", ["gameSummary", "totalTreatmentCostPaid"]),
  payloadColumn("total_income", ["gameSummary", "totalIncome"]),
  payloadColumn("full_treatment_choices", ["gameSummary", "fullTreatmentChoices"]),
  payloadColumn("partial_treatment_choices", ["gameSummary", "partialTreatmentChoices"]),
  payloadColumn("skipped_treatment_choices", ["gameSummary", "skippedTreatmentChoices"]),
  payloadColumn("burden", ["computedMetrics", "burden"]),
  payloadColumn("care_avoidance", ["computedMetrics", "careAvoidance"]),
  payloadColumn("responsibility_shift", ["computedMetrics", "responsibilityShift"]),
  payloadColumn("constraint_recognition_shift", ["computedMetrics", "constraintRecognitionShift"]),
  payloadColumn("protest_legitimacy_shift", ["computedMetrics", "protestLegitimacyShift"]),
  payloadColumn("rule_correction_support_shift", ["computedMetrics", "ruleCorrectionSupportShift"]),
  payloadColumn("redistribution_support_shift", ["computedMetrics", "redistributionSupportShift"]),
  payloadColumn("certainty_correction", ["computedMetrics", "certaintyCorrection"]),
  payloadColumn("information_caution", ["computedMetrics", "informationCaution"]),
  payloadColumn("perspective_change", ["computedMetrics", "perspectiveChange"]),
  payloadColumn("pre_primary_attribution", ["preRevealSurvey", "primaryAttribution"]),
  payloadColumn("post_revised_primary_attribution", ["postRevealSurvey", "revisedPrimaryAttribution"]),
  payloadColumn("pre_individual_responsibility", ["preRevealSurvey", "individualResponsibility"]),
  payloadColumn("post_revised_individual_responsibility", ["postRevealSurvey", "revisedIndividualResponsibility"]),
  payloadColumn("pre_constraint_suspicion", ["preRevealSurvey", "constraintSuspicion"]),
  payloadColumn("post_perceived_structural_impact", ["postRevealSurvey", "perceivedStructuralImpact"]),
  payloadColumn("pre_protest_legitimacy", ["preRevealSurvey", "protestLegitimacy"]),
  payloadColumn("post_protest_legitimacy", ["postRevealSurvey", "postProtestLegitimacy"]),
  payloadColumn("pre_rule_correction_support", ["preRevealSurvey", "ruleCorrectionSupport"]),
  payloadColumn("post_rule_correction_support", ["postRevealSurvey", "postRuleCorrectionSupport"]),
  payloadColumn("pre_redistribution_support", ["preRevealSurvey", "redistributionSupport"]),
  payloadColumn("post_redistribution_support", ["postRevealSurvey", "postRedistributionSupport"]),
  payloadColumn("pre_confidence", ["preRevealSurvey", "confidence"]),
  payloadColumn("post_initial_judgment_accuracy", ["postRevealSurvey", "initialJudgmentAccuracy"]),
  payloadColumn("pre_information_sufficiency", ["preRevealSurvey", "informationSufficiency"]),
  payloadColumn("post_perspective_change", ["postRevealSurvey", "perspectiveChange"]),
  payloadColumn("pre_open_explanation", ["preRevealSurvey", "openExplanation"]),
  payloadColumn("post_open_revision", ["postRevealSurvey", "openRevision"]),
  payloadColumn("background_age_group", ["participantProfile", "ageGroup"]),
  payloadColumn("background_gender", ["participantProfile", "gender"]),
  payloadColumn("background_subjective_economic_status", ["participantProfile", "subjectiveEconomicStatus"]),
  payloadColumn("background_medical_cost_pressure", ["participantProfile", "medicalCostPressure"]),
  payloadColumn("background_healthcare_coverage", ["participantProfile", "healthcareCoverage"]),
  payloadColumn("background_special_organizational_coverage", ["participantProfile", "specialOrganizationalCoverage"]),
  payloadColumn("background_prior_exposure_to_unequal_systems", ["participantProfile", "priorExposureToUnequalSystems"]),
  payloadColumn("background_policy_preference_baseline", ["participantProfile", "policyPreferenceBaseline"]),
  payloadColumn("background_inequality_orientation", ["participantProfile", "inequalityOrientation"]),
  payloadColumn("background_institutional_trust", ["participantProfile", "institutionalTrust"]),
];

function dbColumn(header: string, key: keyof AdminSubmissionItem): CsvColumn {
  return {
    header,
    read: (item) => item[key],
  };
}

function payloadColumn(header: string, path: string[]): CsvColumn {
  return {
    header,
    read: (item) => getPath(item.payload, path),
  };
}

function getPath(value: Prisma.JsonValue, path: string[]): unknown {
  let current: unknown = value;

  for (const segment of path) {
    if (!isJsonObject(current) || !(segment in current)) {
      return "";
    }

    current = current[segment];
  }

  return current ?? "";
}

function isJsonObject(value: unknown): value is Record<string, Prisma.JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (!/[",\n\r]/.test(stringValue)) {
    return stringValue;
  }

  return `"${stringValue.replaceAll('"', '""')}"`;
}
