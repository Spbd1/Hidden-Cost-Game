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

export function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
