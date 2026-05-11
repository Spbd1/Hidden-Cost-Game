import { ROUND_INCOME_POINTS, STARTING_FINANCIAL_POINTS } from "@/utils/game";
import type {
  ComputedResearchMetrics,
  GameChoice,
  GameSummary,
  HiddenCostGameState,
  PostRevealSurveyAnswers,
  PreRevealSurveyAnswers,
  ResearchExport,
  ResearchExportCompleteness,
  ResearchSession,
  TreatmentChoiceCounts,
} from "@/types/research";

export const RESEARCH_EXPORT_VERSION = "prototype-1.2";
export const RESEARCH_SCHEMA_VERSION = "hidden-cost-game-research-schema-3";
export const RESEARCH_CONSENT_VERSION = "pilot-consent-v1";

const choiceCountKeys: Record<GameChoice, keyof TreatmentChoiceCounts> = {
  "full-treatment": "fullTreatmentChoices",
  "partial-treatment": "partialTreatmentChoices",
  "skip-treatment": "skippedTreatmentChoices",
};

export function isPreRevealSurveyComplete(survey: PreRevealSurveyAnswers | undefined): survey is PreRevealSurveyAnswers {
  const openLength = survey?.openExplanation.trim().length ?? 0;

  return Boolean(
    survey?.primaryAttribution &&
      survey.individualResponsibility > 0 &&
      survey.constraintSuspicion > 0 &&
      survey.protestLegitimacy > 0 &&
      survey.ruleCorrectionSupport > 0 &&
      survey.redistributionSupport > 0 &&
      survey.confidence > 0 &&
      survey.informationSufficiency > 0 &&
      openLength >= 10 &&
      openLength <= 500,
  );
}

export function isPostRevealSurveyComplete(survey: PostRevealSurveyAnswers | undefined): survey is PostRevealSurveyAnswers {
  const openLength = survey?.openRevision.trim().length ?? 0;

  return Boolean(
    survey?.rememberedPrimaryAttribution &&
      survey.rememberedIndividualResponsibility > 0 &&
      survey.rememberedConstraintSuspicion > 0 &&
      survey.rememberedConfidence > 0 &&
      survey.revisedPrimaryAttribution &&
      survey.revisedIndividualResponsibility > 0 &&
      survey.perceivedStructuralImpact > 0 &&
      survey.postProtestLegitimacy > 0 &&
      survey.postRuleCorrectionSupport > 0 &&
      survey.postRedistributionSupport > 0 &&
      survey.initialJudgmentAccuracy > 0 &&
      survey.perspectiveChange > 0 &&
      openLength >= 10 &&
      openLength <= 500,
  );
}

export function calculateTreatmentChoiceCounts(game: HiddenCostGameState): TreatmentChoiceCounts {
  return game.rounds.reduce<TreatmentChoiceCounts>(
    (counts, round) => ({
      ...counts,
      [choiceCountKeys[round.choice]]: counts[choiceCountKeys[round.choice]] + 1,
    }),
    {
      fullTreatmentChoices: 0,
      partialTreatmentChoices: 0,
      skippedTreatmentChoices: 0,
    },
  );
}

export function calculateTotalTreatmentCostPaid(game: HiddenCostGameState): number {
  return roundMetric(game.rounds.reduce((total, round) => total + round.paidCost, 0));
}

export function calculateTotalIncome(numberOfRounds: number): number {
  return STARTING_FINANCIAL_POINTS + ROUND_INCOME_POINTS * numberOfRounds;
}

export function calculateGameSummary(game: HiddenCostGameState): GameSummary {
  const choiceCounts = calculateTreatmentChoiceCounts(game);

  return {
    actualHiddenProfile: game.hiddenProfile,
    assignedProfile: game.displayedProfile,
    finalFinancialScore: game.financialPoints,
    finalHealthScore: game.healthPoints,
    ...choiceCounts,
    totalTreatmentCostPaid: calculateTotalTreatmentCostPaid(game),
    totalIncome: calculateTotalIncome(game.rounds.length),
  };
}

export function calculateComputedResearchMetrics({
  game,
  preRevealSurvey,
  postRevealSurvey,
  preRevealSurveyOriginal,
  preRevealSurveyRevisedAfterReveal,
  revisionAccess,
  preRevealRevision,
  revealTimingCondition,
  preRevealCommitment,
}: {
  game: HiddenCostGameState;
  preRevealSurvey: PreRevealSurveyAnswers;
  postRevealSurvey: PostRevealSurveyAnswers;
  preRevealSurveyOriginal?: PreRevealSurveyAnswers;
  preRevealSurveyRevisedAfterReveal?: PreRevealSurveyAnswers;
  revisionAccess?: ResearchSession["revisionAccess"];
  preRevealRevision?: ResearchSession["preRevealRevision"];
  revealTimingCondition?: ResearchSession["revealTimingCondition"];
  preRevealCommitment?: ResearchSession["preRevealCommitment"];
}): ComputedResearchMetrics {
  const summary = calculateGameSummary(game);
  const originalPreRevealSurvey = preRevealSurveyOriginal ?? preRevealSurvey;
  const rememberedResponsibilityError = postRevealSurvey.rememberedIndividualResponsibility - originalPreRevealSurvey.individualResponsibility;
  const rememberedConstraintSuspicionError = postRevealSurvey.rememberedConstraintSuspicion - originalPreRevealSurvey.constraintSuspicion;
  const memoryDistortionMagnitude = Math.abs(rememberedResponsibilityError) + Math.abs(rememberedConstraintSuspicionError);
  const responsibilityRevisionDelta = preRevealSurveyRevisedAfterReveal && preRevealSurveyOriginal ? preRevealSurveyRevisedAfterReveal.individualResponsibility - preRevealSurveyOriginal.individualResponsibility : undefined;
  const constraintSuspicionRevisionDelta = preRevealSurveyRevisedAfterReveal && preRevealSurveyOriginal ? preRevealSurveyRevisedAfterReveal.constraintSuspicion - preRevealSurveyOriginal.constraintSuspicion : undefined;
  const protestLegitimacyRevisionDelta = preRevealSurveyRevisedAfterReveal && preRevealSurveyOriginal ? preRevealSurveyRevisedAfterReveal.protestLegitimacy - preRevealSurveyOriginal.protestLegitimacy : undefined;
  const ruleCorrectionRevisionDelta = preRevealSurveyRevisedAfterReveal && preRevealSurveyOriginal ? preRevealSurveyRevisedAfterReveal.ruleCorrectionSupport - preRevealSurveyOriginal.ruleCorrectionSupport : undefined;
  const redistributionRevisionDelta = preRevealSurveyRevisedAfterReveal && preRevealSurveyOriginal ? preRevealSurveyRevisedAfterReveal.redistributionSupport - preRevealSurveyOriginal.redistributionSupport : undefined;
  const confidenceRevisionDelta = preRevealSurveyRevisedAfterReveal && preRevealSurveyOriginal ? preRevealSurveyRevisedAfterReveal.confidence - preRevealSurveyOriginal.confidence : undefined;
  const informationSufficiencyRevisionDelta = preRevealSurveyRevisedAfterReveal && preRevealSurveyOriginal ? preRevealSurveyRevisedAfterReveal.informationSufficiency - preRevealSurveyOriginal.informationSufficiency : undefined;
  const revisionDeltas = [
    responsibilityRevisionDelta,
    constraintSuspicionRevisionDelta,
    protestLegitimacyRevisionDelta,
    ruleCorrectionRevisionDelta,
    redistributionRevisionDelta,
    confidenceRevisionDelta,
    informationSufficiencyRevisionDelta,
  ];
  const hasRevisionComparison = revisionDeltas.every((delta): delta is number => typeof delta === "number");

  return {
    responsibilityShift: postRevealSurvey.revisedIndividualResponsibility - preRevealSurvey.individualResponsibility,
    constraintRecognitionShift: postRevealSurvey.perceivedStructuralImpact - preRevealSurvey.constraintSuspicion,
    protestLegitimacyShift: postRevealSurvey.postProtestLegitimacy - preRevealSurvey.protestLegitimacy,
    ruleCorrectionSupportShift: postRevealSurvey.postRuleCorrectionSupport - preRevealSurvey.ruleCorrectionSupport,
    redistributionSupportShift: postRevealSurvey.postRedistributionSupport - preRevealSurvey.redistributionSupport,
    certaintyCorrection: preRevealSurvey.confidence - postRevealSurvey.initialJudgmentAccuracy,
    informationCaution: 8 - preRevealSurvey.informationSufficiency,
    perspectiveChange: postRevealSurvey.perspectiveChange,
    burden: roundMetric(summary.totalTreatmentCostPaid / Math.max(summary.totalIncome, 1)),
    careAvoidance: summary.skippedTreatmentChoices + 0.5 * summary.partialTreatmentChoices,
    delayedReveal: revealTimingCondition?.condition === "delayed-reveal",
    ...(preRevealCommitment ? { standByInitialInterpretation: preRevealCommitment.standByInitialInterpretation } : {}),
    rememberedResponsibilityError,
    rememberedConstraintSuspicionError,
    rememberedPrimaryAttributionMatchesOriginal: postRevealSurvey.rememberedPrimaryAttribution === originalPreRevealSurvey.primaryAttribution,
    memoryConfidence: postRevealSurvey.rememberedConfidence,
    memoryDistortionMagnitude: roundMetric(memoryDistortionMagnitude),
    attributionCategoryShift: {
      pre: preRevealSurvey.primaryAttribution,
      post: postRevealSurvey.revisedPrimaryAttribution,
    },
    ...(hasRevisionComparison
      ? {
          usedRevisionOpportunity: Boolean(preRevealRevision?.used),
          revisionUnlocked: revisionAccess ? revisionAccess.condition === "revision-unlocked" : null,
          attemptedPreRevealRevision: Boolean(preRevealRevision?.attempted),
          responsibilityRevisionDelta,
          constraintSuspicionRevisionDelta,
          protestLegitimacyRevisionDelta,
          ruleCorrectionRevisionDelta,
          redistributionRevisionDelta,
          confidenceRevisionDelta,
          informationSufficiencyRevisionDelta,
          changedPrimaryAttribution: preRevealSurveyRevisedAfterReveal?.primaryAttribution !== preRevealSurveyOriginal?.primaryAttribution,
          revisionMagnitude: roundMetric(revisionDeltas.reduce((total, delta) => total + Math.abs(delta), 0)),
        }
      : {}),
  };
}

export function buildParticipantInterpretation(metrics: ComputedResearchMetrics): string[] {
  const interpretations: string[] = [];

  if (metrics.responsibilityShift < 0) {
    interpretations.push("After the reveal, your ratings placed less responsibility on lower-scoring players.");
  } else if (metrics.responsibilityShift > 0) {
    interpretations.push("After the reveal, your ratings placed more responsibility on lower-scoring players.");
  } else {
    interpretations.push("Your responsibility rating for lower-scoring players stayed the same after the reveal.");
  }

  if (metrics.protestLegitimacyShift > 0) {
    interpretations.push("After learning about unequal cost conditions, you rated objections from lower-scoring players as more legitimate.");
  } else if (metrics.protestLegitimacyShift < 0) {
    interpretations.push("After learning about unequal cost conditions, you rated objections from lower-scoring players as less legitimate.");
  } else {
    interpretations.push("Your rating of objection legitimacy stayed the same after the reveal.");
  }

  if (metrics.ruleCorrectionSupportShift > 0) {
    interpretations.push("After the reveal, your support for rule correction increased.");
  } else if (metrics.ruleCorrectionSupportShift < 0) {
    interpretations.push("After the reveal, your support for rule correction decreased.");
  }

  if (metrics.redistributionSupportShift > 0) {
    interpretations.push("After the reveal, your support for point redistribution increased.");
  } else if (metrics.redistributionSupportShift < 0) {
    interpretations.push("After the reveal, your support for point redistribution decreased.");
  }

  if (metrics.certaintyCorrection > 0) {
    interpretations.push("Your confidence before the reveal was higher than your later rating of that initial judgment’s accuracy.");
  } else if (metrics.certaintyCorrection < 0) {
    interpretations.push("Your later accuracy rating was higher than your confidence before the reveal.");
  }

  interpretations.push("These summaries describe changes in survey responses. They are not a psychological diagnosis or a judgment of character.");

  return interpretations;
}

export function getResearchExportCompleteness(session: ResearchSession): ResearchExportCompleteness {
  const hasPreRevealSurvey = isPreRevealSurveyComplete(session.preRevealSurvey);
  const hasPostRevealSurvey = isPostRevealSurveyComplete(session.postRevealSurvey);
  const completedGame = Boolean(session.game?.completedAt);

  return {
    hasParticipantProfile: Boolean(session.participantProfile),
    completedGame,
    completedGameRounds: session.game?.rounds.length ?? 0,
    hasPreRevealSurvey,
    hasSeenReveal: Boolean(session.revealViewedAt),
    hasPostRevealSurvey,
    isComplete: Boolean(session.participantProfile && completedGame && hasPreRevealSurvey && session.revealViewedAt && hasPostRevealSurvey),
  };
}

export function buildResearchExport(session: ResearchSession, createdAt = new Date().toISOString()): ResearchExport | null {
  if (!session.game || !isPreRevealSurveyComplete(session.preRevealSurvey) || !isPostRevealSurveyComplete(session.postRevealSurvey)) {
    return null;
  }

  const gameSummary = calculateGameSummary(session.game);
  const computedMetrics = calculateComputedResearchMetrics({
    game: session.game,
    preRevealSurvey: session.preRevealSurvey,
    postRevealSurvey: session.postRevealSurvey,
    preRevealSurveyOriginal: session.preRevealSurveyOriginal,
    preRevealSurveyRevisedAfterReveal: session.preRevealSurveyRevisedAfterReveal,
    revisionAccess: session.revisionAccess,
    preRevealRevision: session.preRevealRevision,
    revealTimingCondition: session.revealTimingCondition,
    preRevealCommitment: session.preRevealCommitment,
  });

  return {
    exportVersion: RESEARCH_EXPORT_VERSION,
    schemaVersion: RESEARCH_SCHEMA_VERSION,
    sessionId: session.sessionId,
    consentVersion: RESEARCH_CONSENT_VERSION,
    serverSubmissionStatus: session.serverSubmissionStatus ?? "not_submitted",
    ...(session.serverSubmissionId ? { serverSubmissionId: session.serverSubmissionId } : {}),
    ...(session.serverSubmittedAt ? { serverSubmittedAt: session.serverSubmittedAt } : {}),
    createdAt,
    sessionCreatedAt: session.createdAt,
    preRevealSurveyStartedAt: session.preRevealSurveyStartedAt,
    preRevealSurveyCompletedAt: session.preRevealSurveyCompletedAt,
    revealViewedAt: session.revealViewedAt,
    postRevealSurveyStartedAt: session.postRevealSurveyStartedAt,
    postRevealSurveyCompletedAt: session.postRevealSurveyCompletedAt,
    participantProfile: session.participantProfile,
    ...(session.revealTimingCondition ? { revealTimingCondition: session.revealTimingCondition } : {}),
    ...(session.preRevealCommitment ? { preRevealCommitment: session.preRevealCommitment } : {}),
    assignedProfile: {
      displayedProfile: session.game.displayedProfile,
      hiddenProfile: session.game.hiddenProfile,
      treatmentCostMultiplier: session.game.treatmentCostMultiplier,
    },
    gameSummary,
    gameRounds: session.game.rounds,
    preRevealSurvey: session.preRevealSurvey,
    ...(session.preRevealSurveyOriginal ? { preRevealSurveyOriginal: session.preRevealSurveyOriginal } : {}),
    ...(session.preRevealSurveyRevisedAfterReveal ? { preRevealSurveyRevisedAfterReveal: session.preRevealSurveyRevisedAfterReveal } : {}),
    ...(session.revisionAccess ? { revisionAccess: session.revisionAccess } : {}),
    ...(session.preRevealRevision ? { preRevealRevision: session.preRevealRevision } : {}),
    postRevealSurvey: session.postRevealSurvey,
    computedMetrics,
    completeness: getResearchExportCompleteness(session),
  };
}

export function roundMetric(value: number): number {
  return Number(value.toFixed(4));
}
