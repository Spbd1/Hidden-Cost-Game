import {
  ROUND_INCOME_POINTS,
  STARTING_FINANCIAL_POINTS,
} from "@/utils/game";
import type {
  ComputedResearchMetrics,
  GameChoice,
  GameSummary,
  HiddenCostGameState,
  PostRevealSurveyAnswers,
  PreRevealSurveyAnswers,
  ResearchExport,
  ResearchSession,
  TreatmentChoiceCounts,
} from "@/types/research";

const choiceCountKeys: Record<GameChoice, keyof TreatmentChoiceCounts> = {
  "full-treatment": "fullTreatmentChoices",
  "partial-treatment": "partialTreatmentChoices",
  "skip-treatment": "skippedTreatmentChoices",
};

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
    individualAttributionPre: 6 - preRevealSurvey.successAttribution,
    individualAttributionPost: 6 - postRevealSurvey.successAttribution,
    systemicAttributionPre: preRevealSurvey.successAttribution,
    systemicAttributionPost: postRevealSurvey.successAttribution,
    protestShift: postRevealSurvey.protestLegitimacy - preRevealSurvey.protestLegitimacy,
    fairnessShift: postRevealSurvey.ruleChangeFairness - preRevealSurvey.ruleChangeFairness,
    empathyShift: postRevealSurvey.viewChange,
    certaintyCorrection: preRevealSurvey.judgmentConfidence - postRevealSurvey.initialJudgmentAccuracy,
    burden: roundMetric(summary.totalTreatmentCostPaid / summary.totalIncome),
    careAvoidance: summary.skippedTreatmentChoices + 0.5 * summary.partialTreatmentChoices,
  };
}

export function buildParticipantInterpretation(metrics: ComputedResearchMetrics): string[] {
  const interpretations: string[] = [];

  if (metrics.protestShift > 0) {
    interpretations.push("After learning about the unequal conditions, you rated low-scoring players’ protest as more legitimate.");
  } else if (metrics.protestShift < 0) {
    interpretations.push("After learning about the unequal conditions, you rated low-scoring players’ protest as less legitimate.");
  } else {
    interpretations.push("Your rating of low-scoring players’ protest legitimacy stayed the same after the reveal.");
  }

  if (metrics.fairnessShift > 0) {
    interpretations.push("After the reveal, your support for correcting the rules increased.");
  } else if (metrics.fairnessShift < 0) {
    interpretations.push("After the reveal, your support for correcting the rules decreased.");
  } else {
    interpretations.push("Your support for correcting the rules stayed the same after the reveal.");
  }

  if (metrics.individualAttributionPost < metrics.individualAttributionPre) {
    interpretations.push("After the reveal, you placed more weight on system conditions than before.");
  } else if (metrics.individualAttributionPost > metrics.individualAttributionPre) {
    interpretations.push("After the reveal, you placed more weight on individual choices than before.");
  } else {
    interpretations.push("Your balance between individual-choice and system-condition explanations stayed the same after the reveal.");
  }

  if (metrics.certaintyCorrection > 0) {
    interpretations.push("Your confidence before the reveal was higher than your later rating of your initial judgment’s accuracy.");
  } else if (metrics.certaintyCorrection < 0) {
    interpretations.push("Your later rating of your initial judgment’s accuracy was higher than your confidence before the reveal.");
  } else {
    interpretations.push("Your pre-reveal confidence matched your later rating of your initial judgment’s accuracy.");
  }

  return interpretations;
}

export function buildResearchExport(session: ResearchSession, createdAt = new Date().toISOString()): ResearchExport | null {
  if (!session.game || !session.preRevealSurvey || !session.postRevealSurvey) {
    return null;
  }

  const gameSummary = calculateGameSummary(session.game);
  const computedMetrics = calculateComputedResearchMetrics({
    game: session.game,
    preRevealSurvey: session.preRevealSurvey,
    postRevealSurvey: session.postRevealSurvey,
  });

  return {
    sessionId: session.sessionId,
    createdAt,
    participantProfile: session.game.hiddenProfile,
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
  };
}

export function roundMetric(value: number): number {
  return Number(value.toFixed(4));
}
