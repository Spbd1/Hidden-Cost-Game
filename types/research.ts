export type StageId =
  | "introduction"
  | "consent"
  | "background"
  | "game"
  | "visible-results"
  | "pre-reveal"
  | "reveal"
  | "post-reveal"
  | "individual-results"
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
  priorExposureToUnequalSystems?: string;
  policyPreferenceBaseline?: number | PreferNotToAnswer | null;
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

export type PreRevealSurveyAnswers = {
  primaryAttribution: string;
  individualResponsibility: number;
  constraintSuspicion: number;
  protestLegitimacy: number;
  ruleCorrectionSupport: number;
  redistributionSupport: number;
  confidence: number;
  informationSufficiency: number;
  openExplanation: string;
};

export type PostRevealSurveyAnswers = {
  rememberedPrimaryAttribution: string;
  rememberedIndividualResponsibility: number;
  rememberedConstraintSuspicion: number;
  rememberedConfidence: number;
  revisedPrimaryAttribution: string;
  revisedIndividualResponsibility: number;
  perceivedStructuralImpact: number;
  postProtestLegitimacy: number;
  postRuleCorrectionSupport: number;
  postRedistributionSupport: number;
  initialJudgmentAccuracy: number;
  perspectiveChange: number;
  openRevision: string;
};

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

export interface AttributionCategoryShift {
  pre: string;
  post: string;
}

export interface RevisionAccess {
  condition: "revision-unlocked" | "revision-locked";
  assignedAt: string;
  assignedAfterReveal: true;
  trigger: "post-reveal-back-navigation";
}

export interface PreRevealRevision {
  attempted: boolean;
  allowed: boolean;
  used: boolean;
  firstAttemptedAt?: string;
  revisedAt?: string;
  blockedAt?: string;
}

export type RevealTimingConditionName = "immediate-reveal" | "delayed-reveal";
export type ExplanationFrameConditionName = "explain-to-self" | "explain-to-other";

export interface RevealTimingCondition {
  condition: RevealTimingConditionName;
  assignedAt: string;
}

export interface PreRevealCommitment {
  standByInitialInterpretation: number;
  explanationConfidenceText?: string;
  completedAt: string;
}

export interface ExplanationFrameCondition {
  condition: ExplanationFrameConditionName;
  assignedAt: string;
}

export interface ComputedResearchMetrics {
  responsibilityShift: number;
  constraintRecognitionShift: number;
  protestLegitimacyShift: number;
  ruleCorrectionSupportShift: number;
  redistributionSupportShift: number;
  certaintyCorrection: number;
  informationCaution: number;
  perspectiveChange: number;
  burden: number;
  careAvoidance: number;
  attributionCategoryShift: AttributionCategoryShift;
  usedRevisionOpportunity?: boolean;
  revisionUnlocked?: boolean | null;
  attemptedPreRevealRevision?: boolean;
  responsibilityRevisionDelta?: number;
  constraintSuspicionRevisionDelta?: number;
  protestLegitimacyRevisionDelta?: number;
  ruleCorrectionRevisionDelta?: number;
  redistributionRevisionDelta?: number;
  confidenceRevisionDelta?: number;
  informationSufficiencyRevisionDelta?: number;
  changedPrimaryAttribution?: boolean;
  revisionMagnitude?: number;
  delayedReveal: boolean;
  standByInitialInterpretation?: number;
  rememberedResponsibilityError: number;
  rememberedConstraintSuspicionError: number;
  rememberedPrimaryAttributionMatchesOriginal: boolean;
  memoryConfidence: number;
  memoryDistortionMagnitude: number;
  explanationFrame: ExplanationFrameConditionName | null;
}

export interface ResearchExportAssignedProfile {
  displayedProfile: DisplayedProfile;
  hiddenProfile: HiddenProfileMeaning;
  treatmentCostMultiplier: number;
}

export type ServerSubmissionStatus = "not_enabled" | "not_submitted" | "submitting" | "submitted" | "failed";

export interface ResearchExport {
  exportVersion: string;
  schemaVersion: string;
  sessionId: string;
  consentVersion: string;
  serverSubmissionStatus: ServerSubmissionStatus;
  serverSubmissionId?: string;
  serverSubmittedAt?: string;
  createdAt: string;
  sessionCreatedAt: string;
  preRevealSurveyStartedAt?: string;
  preRevealSurveyCompletedAt?: string;
  revealViewedAt?: string;
  postRevealSurveyStartedAt?: string;
  postRevealSurveyCompletedAt?: string;
  participantProfile?: ParticipantProfile;
  revealTimingCondition?: RevealTimingCondition;
  preRevealCommitment?: PreRevealCommitment;
  explanationFrameCondition?: ExplanationFrameCondition;
  assignedProfile: ResearchExportAssignedProfile;
  gameSummary: GameSummary;
  gameRounds: GameRoundData[];
  preRevealSurvey: PreRevealSurveyAnswers;
  preRevealSurveyOriginal?: PreRevealSurveyAnswers;
  preRevealSurveyRevisedAfterReveal?: PreRevealSurveyAnswers;
  revisionAccess?: RevisionAccess;
  preRevealRevision?: PreRevealRevision;
  postRevealSurvey: PostRevealSurveyAnswers;
  computedMetrics: ComputedResearchMetrics;
  completeness: ResearchExportCompleteness;
}

export interface ResearchExportCompleteness {
  hasParticipantProfile: boolean;
  completedGame: boolean;
  completedGameRounds: number;
  hasPreRevealSurvey: boolean;
  hasSeenReveal: boolean;
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
  preRevealSurveyOriginal?: PreRevealSurveyAnswers;
  preRevealSurveyRevisedAfterReveal?: PreRevealSurveyAnswers;
  revisionAccess?: RevisionAccess;
  preRevealRevision?: PreRevealRevision;
  revealTimingCondition?: RevealTimingCondition;
  preRevealCommitment?: PreRevealCommitment;
  explanationFrameCondition?: ExplanationFrameCondition;
  postRevealSurvey?: PostRevealSurveyAnswers;
  preRevealSurveyStartedAt?: string;
  preRevealSurveyCompletedAt?: string;
  revealViewedAt?: string;
  postRevealSurveyStartedAt?: string;
  postRevealSurveyCompletedAt?: string;
  serverSubmissionStatus?: ServerSubmissionStatus;
  serverSubmissionId?: string;
  serverSubmittedAt?: string;
  serverSubmissionError?: string;
}
