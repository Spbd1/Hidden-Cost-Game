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

export const RESEARCH_EXPORT_VERSION = "prototype-1.1";
export const RESEARCH_SCHEMA_VERSION = "hidden-cost-game-research-schema-2";

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
    survey?.revisedPrimaryAttribution &&
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
}: {
  game: HiddenCostGameState;
  preRevealSurvey: PreRevealSurveyAnswers;
  postRevealSurvey: PostRevealSurveyAnswers;
}): ComputedResearchMetrics {
  const summary = calculateGameSummary(game);

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
    attributionCategoryShift: {
      pre: preRevealSurvey.primaryAttribution,
      post: postRevealSurvey.revisedPrimaryAttribution,
    },
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
  });

  return {
    exportVersion: RESEARCH_EXPORT_VERSION,
    schemaVersion: RESEARCH_SCHEMA_VERSION,
    sessionId: session.sessionId,
    createdAt,
    sessionCreatedAt: session.createdAt,
    preRevealSurveyStartedAt: session.preRevealSurveyStartedAt,
    preRevealSurveyCompletedAt: session.preRevealSurveyCompletedAt,
    revealViewedAt: session.revealViewedAt,
    postRevealSurveyStartedAt: session.postRevealSurveyStartedAt,
    postRevealSurveyCompletedAt: session.postRevealSurveyCompletedAt,
    participantProfile: session.participantProfile,
    assignedProfile: {
      displayedProfile: session.game.displayedProfile,
      hiddenProfile: session.game.hiddenProfile,
      treatmentCostMultiplier: session.game.treatmentCostMultiplier,
    },
    gameSummary,
    gameRounds: session.game.rounds,
    preRevealSurvey: session.preRevealSurvey,
    postRevealSurvey: session.postRevealSurvey,
    computedMetrics,
    completeness: getResearchExportCompleteness(session),
  };
}

export function roundMetric(value: number): number {
  return Number(value.toFixed(4));
}
