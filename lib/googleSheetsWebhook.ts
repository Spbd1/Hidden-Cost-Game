import type { ValidResearchExport } from "@/lib/researchExportSchema";

const WEBHOOK_TIMEOUT_MS = 5_000;
const MAX_PAYLOAD_JSON_BYTES = 100_000;

type SubmissionWebhookMetadata = {
  serverSubmissionId: string;
  submittedAt: Date | string;
};

type GoogleSheetsSubmissionRow = {
  secret?: string;
  type: "hidden-cost-game-submission";
  serverSubmissionId: string;
  submittedAt: string;
  sessionId: string;
  schemaVersion: string;
  exportVersion: string;
  assignedDisplayedProfile: string;
  assignedHiddenProfile: string;
  finalFinancialScore: number;
  finalHealthScore: number;
  fullTreatmentChoices: number;
  partialTreatmentChoices: number;
  skippedTreatmentChoices: number;
  responsibilityShift: number;
  constraintRecognitionShift: number;
  protestLegitimacyShift: number;
  ruleCorrectionSupportShift: number;
  redistributionSupportShift: number;
  revisionCondition: string | null;
  attemptedPreRevealRevision: boolean | null;
  usedRevisionOpportunity: boolean | null;
  revealTimingCondition: string | null;
  costVisibilityCondition: string | null;
  explanationFrameCondition: string | null;
  replayCompleted: boolean;
  replayAssignmentCondition: string | null;
  payloadJson?: string;
};

export async function sendSubmissionToGoogleSheets(
  payload: ValidResearchExport,
  metadata: SubmissionWebhookMetadata,
): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const row = buildSubmissionRow(payload, metadata);
    const headers = new Headers({
      "content-type": "application/json",
    });

    const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET?.trim();
    if (secret) {
      headers.set("authorization", `Bearer ${secret}`);
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(row),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(
        `[google-sheets-webhook] Submission mirror failed for ${metadata.serverSubmissionId}: ${response.status} ${response.statusText}`,
      );
      return;
    }

    console.info(`[google-sheets-webhook] Mirrored submission ${metadata.serverSubmissionId}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook error";
    console.warn(`[google-sheets-webhook] Submission mirror failed for ${metadata.serverSubmissionId}: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

function buildSubmissionRow(
  payload: ValidResearchExport,
  metadata: SubmissionWebhookMetadata,
): GoogleSheetsSubmissionRow {
  const row: GoogleSheetsSubmissionRow = {
    secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET?.trim() || undefined,
    type: "hidden-cost-game-submission",
    serverSubmissionId: metadata.serverSubmissionId,
    submittedAt: metadata.submittedAt instanceof Date ? metadata.submittedAt.toISOString() : metadata.submittedAt,
    sessionId: payload.sessionId,
    schemaVersion: payload.schemaVersion,
    exportVersion: payload.exportVersion,
    assignedDisplayedProfile: payload.assignedProfile.displayedProfile,
    assignedHiddenProfile: payload.assignedProfile.hiddenProfile,
    finalFinancialScore: payload.gameSummary.finalFinancialScore,
    finalHealthScore: payload.gameSummary.finalHealthScore,
    fullTreatmentChoices: payload.gameSummary.fullTreatmentChoices,
    partialTreatmentChoices: payload.gameSummary.partialTreatmentChoices,
    skippedTreatmentChoices: payload.gameSummary.skippedTreatmentChoices,
    responsibilityShift: payload.computedMetrics.responsibilityShift,
    constraintRecognitionShift: payload.computedMetrics.constraintRecognitionShift,
    protestLegitimacyShift: payload.computedMetrics.protestLegitimacyShift,
    ruleCorrectionSupportShift: payload.computedMetrics.ruleCorrectionSupportShift,
    redistributionSupportShift: payload.computedMetrics.redistributionSupportShift,
    revisionCondition: payload.revisionAccess?.condition ?? null,
    attemptedPreRevealRevision:
      payload.computedMetrics.attemptedPreRevealRevision ?? payload.preRevealRevision?.attempted ?? null,
    usedRevisionOpportunity: payload.computedMetrics.usedRevisionOpportunity ?? payload.preRevealRevision?.used ?? null,
    revealTimingCondition: payload.revealTimingCondition?.condition ?? null,
    costVisibilityCondition: payload.costVisibilityCondition?.condition ?? null,
    explanationFrameCondition: payload.explanationFrameCondition?.condition ?? null,
    replayCompleted: payload.computedMetrics.replayCompleted,
    replayAssignmentCondition: payload.computedMetrics.replayAssignmentCondition ?? payload.replayGame?.assignmentCondition ?? null,
  };

  const payloadJson = JSON.stringify(payload);
  if (Buffer.byteLength(payloadJson, "utf8") <= MAX_PAYLOAD_JSON_BYTES) {
    row.payloadJson = payloadJson;
  }

  return row;
}
