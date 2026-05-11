/**
 * Google Apps Script receiver for the Hidden Cost Game Google Sheets mirror.
 *
 * Setup:
 * 1. Create a Google Sheet.
 * 2. Open Extensions -> Apps Script.
 * 3. Paste this file into Code.gs.
 * 4. In Project Settings -> Script properties, add WEBHOOK_SECRET with the
 *    same value as GOOGLE_SHEETS_WEBHOOK_SECRET in your app deployment.
 * 5. Deploy as a web app that can receive POST requests.
 */
const SHEET_NAME = "Submissions";

const HEADERS = [
  "receivedAt",
  "serverSubmissionId",
  "submittedAt",
  "sessionId",
  "schemaVersion",
  "exportVersion",
  "assignedDisplayedProfile",
  "assignedHiddenProfile",
  "finalFinancialScore",
  "finalHealthScore",
  "fullTreatmentChoices",
  "partialTreatmentChoices",
  "skippedTreatmentChoices",
  "responsibilityShift",
  "constraintRecognitionShift",
  "protestLegitimacyShift",
  "ruleCorrectionSupportShift",
  "redistributionSupportShift",
  "revisionCondition",
  "attemptedPreRevealRevision",
  "usedRevisionOpportunity",
  "revealTimingCondition",
  "costVisibilityCondition",
  "explanationFrameCondition",
  "replayCompleted",
  "replayAssignmentCondition",
  "memoryDistortionMagnitude",
  "rememberedPrimaryAttributionMatchesOriginal",
];

function doPost(e) {
  try {
    const data = parseJsonBody_(e);
    const expectedSecret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");

    if (!expectedSecret) {
      return jsonResponse_({ ok: false, error: "WEBHOOK_SECRET script property is not configured" });
    }

    if (!data || data.secret !== expectedSecret) {
      return jsonResponse_({ ok: false, error: "unauthorized" });
    }

    const sheet = getOrCreateSheet_();
    ensureHeaders_(sheet);

    const row = HEADERS.map((header) => normalizeCellValue_(header === "receivedAt" ? data[header] || new Date().toISOString() : data[header]));
    sheet.appendRow(row);

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error && error.message ? error.message : "unknown error" });
  }
}

function parseJsonBody_(e) {
  const contents = e && e.postData && typeof e.postData.contents === "string" ? e.postData.contents : "";
  if (!contents) {
    throw new Error("empty request body");
  }

  try {
    const parsed = JSON.parse(contents);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("JSON body must be an object");
    }
    return parsed;
  } catch (error) {
    throw new Error("invalid JSON body");
  }
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("no active spreadsheet found");
  }

  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
  const firstRowValues = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const isHeaderRowEmpty = firstRowValues.every((value) => value === "");

  if (isHeaderRowEmpty) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function normalizeCellValue_(value) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return value;
}

function jsonResponse_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
