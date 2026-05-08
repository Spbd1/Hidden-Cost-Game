export type StageId =
  | "introduction"
  | "consent"
  | "background"
  | "game"
  | "pre-reveal"
  | "reveal"
  | "post-reveal"
  | "results"
  | "export";

export interface StudyStage {
  id: StageId;
  title: string;
  shortTitle: string;
  href: string;
  summary: string;
}

export interface ParticipantBackground {
  ageRange?: string;
  education?: string;
  country?: string;
}

export interface ResearchSession {
  sessionId: string;
  createdAt: string;
  currentStage: StageId;
  background: ParticipantBackground;
  responses: Record<string, unknown>;
}
