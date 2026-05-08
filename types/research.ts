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

export type PreferNotToAnswer = "Prefer not to answer";

export interface ParticipantProfile {
  ageGroup: string;
  gender: string;
  subjectiveEconomicStatus: number | PreferNotToAnswer | null;
  medicalCostPressure: string;
  healthcareCoverage: string;
  specialOrganizationalCoverage: string;
  inequalityOrientation: number | null;
  institutionalTrust: number | null;
}

export interface ParticipantBackground {
  ageRange?: string;
  education?: string;
  country?: string;
}

export type HiddenProfileMeaning = "High coverage" | "Low coverage";
export type DisplayedProfile = "Profile A" | "Profile B";
export type GameChoice = "full-treatment" | "partial-treatment" | "skip-treatment";
export type MedicalRiskLevel = "low" | "medium" | "high";

export interface HiddenCostProfile {
  displayedProfile: DisplayedProfile;
  hiddenProfile: HiddenProfileMeaning;
  treatmentCostMultiplier: number;
}

export interface MedicalEvent {
  roundNumber: number;
  eventName: string;
  baseFullCost: number;
  basePartialCost: number;
  skipRisk: MedicalRiskLevel;
}

export interface GameRoundData {
  roundNumber: number;
  eventName: string;
  displayedProfile: DisplayedProfile;
  hiddenProfile: HiddenProfileMeaning;
  baseFullCost: number;
  basePartialCost: number;
  actualFullCost: number;
  actualPartialCost: number;
  choice: GameChoice;
  paidCost: number;
  scoreBefore: number;
  scoreAfter: number;
  healthBefore: number;
  healthAfter: number;
  timestamp: string;
  decisionTimeMs: number;
}

export interface HiddenCostGameState {
  displayedProfile: DisplayedProfile;
  hiddenProfile: HiddenProfileMeaning;
  treatmentCostMultiplier: number;
  financialPoints: number;
  healthPoints: number;
  currentRoundIndex: number;
  startedAt: string;
  completedAt?: string;
  rounds: GameRoundData[];
}

export interface PreRevealSurveyAnswers {
  lowerScoreReason: string;
  protestLegitimacy: number;
  ruleChangeFairness: number;
  successAttribution: number;
  judgmentConfidence: number;
  fellBehindExplanation: string;
}

export interface PostRevealSurveyAnswers {
  lowerScoreReason: string;
  protestLegitimacy: number;
  ruleChangeFairness: number;
  successAttribution: number;
  initialJudgmentAccuracy: number;
  viewChange: number;
  viewChangeExplanation: string;
}


export interface TreatmentChoiceCounts {
  fullTreatmentChoices: number;
  partialTreatmentChoices: number;
  skippedTreatmentChoices: number;
}

export interface GameSummary extends TreatmentChoiceCounts {
  actualHiddenProfile: HiddenProfileMeaning;
  assignedProfile: DisplayedProfile;
  finalFinancialScore: number;
  finalHealthScore: number;
  totalTreatmentCostPaid: number;
  totalIncome: number;
}

export interface ComputedResearchMetrics {
  individualAttributionPre: number;
  individualAttributionPost: number;
  systemicAttributionPre: number;
  systemicAttributionPost: number;
  protestShift: number;
  fairnessShift: number;
  empathyShift: number;
  certaintyCorrection: number;
  burden: number;
  careAvoidance: number;
}

export interface ResearchExportAssignedProfile {
  displayedProfile: DisplayedProfile;
  hiddenProfile: HiddenProfileMeaning;
  treatmentCostMultiplier: number;
}

export interface ResearchExport {
  exportVersion: string;
  sessionId: string;
  createdAt: string;
  sessionCreatedAt: string;
  participantProfile?: ParticipantProfile;
  assignedProfile: ResearchExportAssignedProfile;
  gameSummary: GameSummary;
  gameRounds: GameRoundData[];
  preRevealSurvey: PreRevealSurveyAnswers;
  postRevealSurvey: PostRevealSurveyAnswers;
  computedMetrics: ComputedResearchMetrics;
  completeness: ResearchExportCompleteness;
}

export interface ResearchExportCompleteness {
  hasParticipantProfile: boolean;
  completedGameRounds: number;
  hasPreRevealSurvey: boolean;
  hasPostRevealSurvey: boolean;
  isComplete: boolean;
}

export interface ResearchSession {
  sessionId: string;
  createdAt: string;
  currentStage: StageId;
  background: ParticipantBackground;
  participantProfile?: ParticipantProfile;
  responses: Record<string, unknown>;
  game?: HiddenCostGameState;
  preRevealSurvey?: PreRevealSurveyAnswers;
  postRevealSurvey?: PostRevealSurveyAnswers;
}
