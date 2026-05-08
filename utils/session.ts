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

  if (stored) {
    return JSON.parse(stored) as ResearchSession;
  }

  return createInitialSession(currentStage);
}

export function saveStoredSession(session: ResearchSession): void {
  window.localStorage.setItem(STORAGE_KEY, safeJsonStringify(session));
}

export function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
