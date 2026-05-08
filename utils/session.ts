import type { ResearchSession, StageId } from "@/types/research";

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
    background: candidate.background ?? {},
    participantProfile: candidate.participantProfile,
    responses: candidate.responses ?? {},
    game: candidate.game,
    preRevealSurvey: candidate.preRevealSurvey,
    postRevealSurvey: candidate.postRevealSurvey,
    preRevealSurveyStartedAt: candidate.preRevealSurveyStartedAt,
    preRevealSurveyCompletedAt: candidate.preRevealSurveyCompletedAt,
    revealViewedAt: candidate.revealViewedAt,
    postRevealSurveyStartedAt: candidate.postRevealSurveyStartedAt,
    postRevealSurveyCompletedAt: candidate.postRevealSurveyCompletedAt,
  };
}

function normalizeStageId(value: unknown, fallback: StageId): StageId {
  if (value === "results") {
    return fallback;
  }

  return typeof value === "string" ? (value as StageId) : fallback;
}
