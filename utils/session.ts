import type { CostVisibilityCondition, ExplanationFrameCondition, ResearchSession, RevealTimingCondition, RevisionAccess, StageId } from "@/types/research";

export const STORAGE_KEY = "hidden-cost-game-session";

export function createInitialSession(currentStage: StageId = "introduction"): ResearchSession {
  return {
    sessionId: `hcg-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    currentStage,
    background: {},
    responses: {},
  };
}

export function getStoredSession(currentStage: StageId): ResearchSession {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return createInitialSession(currentStage);
  }

  try {
    return normalizeStoredSession(JSON.parse(stored), currentStage);
  } catch {
    const recoveredSession = createInitialSession(currentStage);
    saveStoredSession(recoveredSession);
    return recoveredSession;
  }
}

export function saveStoredSession(session: ResearchSession): void {
  window.localStorage.setItem(STORAGE_KEY, safeJsonStringify(session));
}

export function mergeStoredSession(updates: Partial<ResearchSession>, currentStage: StageId): ResearchSession {
  const currentSession = getStoredSession(currentStage);
  const updatedSession: ResearchSession = {
    ...currentSession,
    ...updates,
    currentStage: updates.currentStage ?? currentSession.currentStage,
    background: updates.background ?? currentSession.background ?? {},
    responses: updates.responses ?? currentSession.responses ?? {},
  };

  saveStoredSession(updatedSession);
  return updatedSession;
}

export function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function normalizeStoredSession(value: unknown, currentStage: StageId): ResearchSession {
  if (!value || typeof value !== "object") {
    return createInitialSession(currentStage);
  }

  const candidate = value as Partial<ResearchSession>;

  return {
    sessionId: typeof candidate.sessionId === "string" ? candidate.sessionId : `hcg-${crypto.randomUUID()}`,
    createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : new Date().toISOString(),
    currentStage: normalizeStageId(candidate.currentStage, currentStage),
    background: isRecord(candidate.background) ? candidate.background : {},
    participantProfile: normalizeParticipantProfile(candidate.participantProfile),
    responses: isRecord(candidate.responses) ? candidate.responses : {},
    game: isRecord(candidate.game) ? (candidate.game as ResearchSession["game"]) : undefined,
    replayGame: isRecord(candidate.replayGame) ? (candidate.replayGame as ResearchSession["replayGame"]) : undefined,
    preRevealSurvey: normalizePreRevealSurvey(candidate.preRevealSurvey),
    preRevealSurveyOriginal: normalizePreRevealSurvey(candidate.preRevealSurveyOriginal) ?? (candidate.preRevealSurveyCompletedAt ? normalizePreRevealSurvey(candidate.preRevealSurvey) : undefined),
    preRevealSurveyRevisedAfterReveal: normalizePreRevealSurvey(candidate.preRevealSurveyRevisedAfterReveal),
    revisionAccess: isRecord(candidate.revisionAccess) ? (candidate.revisionAccess as ResearchSession["revisionAccess"]) : undefined,
    preRevealRevision: isRecord(candidate.preRevealRevision) ? (candidate.preRevealRevision as ResearchSession["preRevealRevision"]) : undefined,
    revealTimingCondition: isRecord(candidate.revealTimingCondition) ? (candidate.revealTimingCondition as ResearchSession["revealTimingCondition"]) : undefined,
    preRevealCommitment: isRecord(candidate.preRevealCommitment) ? (candidate.preRevealCommitment as ResearchSession["preRevealCommitment"]) : undefined,
    explanationFrameCondition: isRecord(candidate.explanationFrameCondition) ? (candidate.explanationFrameCondition as ResearchSession["explanationFrameCondition"]) : undefined,
    costVisibilityCondition: isRecord(candidate.costVisibilityCondition) ? (candidate.costVisibilityCondition as ResearchSession["costVisibilityCondition"]) : undefined,
    postRevealSurvey: normalizePostRevealSurvey(candidate.postRevealSurvey),
    preRevealSurveyStartedAt: candidate.preRevealSurveyStartedAt,
    preRevealSurveyCompletedAt: candidate.preRevealSurveyCompletedAt,
    revealViewedAt: candidate.revealViewedAt,
    postRevealSurveyStartedAt: candidate.postRevealSurveyStartedAt,
    postRevealSurveyCompletedAt: candidate.postRevealSurveyCompletedAt,
    serverSubmissionStatus: candidate.serverSubmissionStatus,
    serverSubmissionId: candidate.serverSubmissionId,
    serverSubmittedAt: candidate.serverSubmittedAt,
    serverSubmissionError: candidate.serverSubmissionError,
  };
}

function normalizeParticipantProfile(value: unknown): ResearchSession["participantProfile"] {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    ageGroup: readString(value.ageGroup),
    gender: readString(value.gender),
    subjectiveEconomicStatus: readPreferNotOrNumber(value.subjectiveEconomicStatus, 1, 10),
    medicalCostPressure: readString(value.medicalCostPressure),
    healthcareCoverage: readString(value.healthcareCoverage),
    specialOrganizationalCoverage: readString(value.specialOrganizationalCoverage),
    inequalityOrientation: readLikertNullable(value.inequalityOrientation),
    institutionalTrust: readLikertNullable(value.institutionalTrust),
    priorExposureToUnequalSystems: readString(value.priorExposureToUnequalSystems),
    policyPreferenceBaseline: readPreferNotOrNumber(value.policyPreferenceBaseline, 1, 7),
  };
}

function normalizePreRevealSurvey(value: unknown): ResearchSession["preRevealSurvey"] {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    primaryAttribution: readString(value.primaryAttribution),
    individualResponsibility: readLikertDraft(value.individualResponsibility),
    constraintSuspicion: readLikertDraft(value.constraintSuspicion),
    protestLegitimacy: readLikertDraft(value.protestLegitimacy),
    ruleCorrectionSupport: readLikertDraft(value.ruleCorrectionSupport),
    redistributionSupport: readLikertDraft(value.redistributionSupport),
    confidence: readLikertDraft(value.confidence),
    informationSufficiency: readLikertDraft(value.informationSufficiency),
    openExplanation: readString(value.openExplanation),
  };
}

function normalizePostRevealSurvey(value: unknown): ResearchSession["postRevealSurvey"] {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    rememberedPrimaryAttribution: readString(value.rememberedPrimaryAttribution),
    rememberedIndividualResponsibility: readLikertDraft(value.rememberedIndividualResponsibility),
    rememberedConstraintSuspicion: readLikertDraft(value.rememberedConstraintSuspicion),
    rememberedConfidence: readLikertDraft(value.rememberedConfidence),
    revisedPrimaryAttribution: readString(value.revisedPrimaryAttribution),
    revisedIndividualResponsibility: readLikertDraft(value.revisedIndividualResponsibility),
    perceivedStructuralImpact: readLikertDraft(value.perceivedStructuralImpact),
    postProtestLegitimacy: readLikertDraft(value.postProtestLegitimacy),
    postRuleCorrectionSupport: readLikertDraft(value.postRuleCorrectionSupport),
    postRedistributionSupport: readLikertDraft(value.postRedistributionSupport),
    initialJudgmentAccuracy: readLikertDraft(value.initialJudgmentAccuracy),
    perspectiveChange: readLikertDraft(value.perspectiveChange),
    openRevision: readString(value.openRevision),
  };
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readLikertDraft(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readLikertNullable(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readPreferNotOrNumber(value: unknown, min: number, max: number): number | "Prefer not to answer" | null {
  if (value === "Prefer not to answer") {
    return value;
  }

  if (typeof value === "number" && Number.isInteger(value) && value >= min && value <= max) {
    return value;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStageId(value: unknown, fallback: StageId): StageId {
  if (value === "results") {
    return fallback;
  }

  return typeof value === "string" ? (value as StageId) : fallback;
}

export function assignPreRevealRevisionAccess(session: ResearchSession): ResearchSession {
  if (!session.revealViewedAt || session.revisionAccess) {
    return session;
  }

  const revisionAccess: RevisionAccess = {
    condition: Math.random() < 0.5 ? "revision-unlocked" : "revision-locked",
    assignedAt: new Date().toISOString(),
    assignedAfterReveal: true,
    trigger: "post-reveal-back-navigation",
  };

  return {
    ...session,
    revisionAccess,
  };
}

export function assignRevealTimingCondition(session: ResearchSession): ResearchSession {
  if (session.revealTimingCondition) {
    return session;
  }

  const revealTimingCondition: RevealTimingCondition = {
    condition: Math.random() < 0.5 ? "immediate-reveal" : "delayed-reveal",
    assignedAt: new Date().toISOString(),
  };

  return {
    ...session,
    revealTimingCondition,
  };
}

export function assignCostVisibilityCondition(session: ResearchSession): ResearchSession {
  if (session.costVisibilityCondition) {
    return session;
  }

  const roll = Math.random();
  const costVisibilityCondition: CostVisibilityCondition = {
    condition: roll < 1 / 3 ? "no-cost-info" : roll < 2 / 3 ? "partial-cost-hint" : "full-cost-preview",
    assignedAt: new Date().toISOString(),
  };

  return {
    ...session,
    costVisibilityCondition,
  };
}

export function assignExplanationFrameCondition(session: ResearchSession): ResearchSession {
  if (session.explanationFrameCondition) {
    return session;
  }

  const explanationFrameCondition: ExplanationFrameCondition = {
    condition: Math.random() < 0.5 ? "explain-to-self" : "explain-to-other",
    assignedAt: new Date().toISOString(),
  };

  return {
    ...session,
    explanationFrameCondition,
  };
}
