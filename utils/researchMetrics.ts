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

export const RESEARCH_EXPORT_VERSION = "prototype-1.0";

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
    burden: roundMetric(summary.totalTreatmentCostPaid / Math.max(summary.totalIncome, 1)),
    careAvoidance: summary.skippedTreatmentChoices + 0.5 * summary.partialTreatmentChoices,
  };
}

export function buildParticipantInterpretation(metrics: ComputedResearchMetrics): string[] {
  const interpretations: string[] = [];

  if (metrics.protestShift > 0) {
    interpretations.push("After learning about the unequal conditions, your protest-legitimacy rating increased.");
  } else if (metrics.protestShift < 0) {
    interpretations.push("After learning about the unequal conditions, your protest-legitimacy rating decreased.");
  } else {
    interpretations.push("Your protest-legitimacy rating stayed the same after the reveal.");
  }

  if (metrics.fairnessShift > 0) {
    interpretations.push("After the reveal, your support for adjusting the rules increased.");
  } else if (metrics.fairnessShift < 0) {
    interpretations.push("After the reveal, your support for adjusting the rules decreased.");
  } else {
    interpretations.push("Your support for adjusting the rules stayed the same after the reveal.");
  }

  if (metrics.individualAttributionPost < metrics.individualAttributionPre) {
    interpretations.push("After the reveal, your ratings placed relatively more weight on game conditions than before.");
  } else if (metrics.individualAttributionPost > metrics.individualAttributionPre) {
    interpretations.push("After the reveal, your ratings placed relatively more weight on individual choices than before.");
  } else {
    interpretations.push("Your balance between individual-choice and game-condition explanations stayed the same after the reveal.");
  }

  if (metrics.certaintyCorrection > 0) {
    interpretations.push("Your pre-reveal confidence was higher than your later rating of that initial judgment’s accuracy.");
  } else if (metrics.certaintyCorrection < 0) {
    interpretations.push("Your later accuracy rating was higher than your pre-reveal confidence.");
  } else {
    interpretations.push("Your pre-reveal confidence matched your later rating of that initial judgment’s accuracy.");
  }

  return interpretations;
}

export function getResearchExportCompleteness(session: ResearchSession): ResearchExportCompleteness {
  return {
    hasParticipantProfile: Boolean(session.participantProfile),
    completedGameRounds: session.game?.rounds.length ?? 0,
    hasPreRevealSurvey: Boolean(session.preRevealSurvey),
    hasPostRevealSurvey: Boolean(session.postRevealSurvey),
    isComplete: Boolean(session.participantProfile && session.game && session.preRevealSurvey && session.postRevealSurvey),
  };
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
    exportVersion: RESEARCH_EXPORT_VERSION,
    sessionId: session.sessionId,
    createdAt,
    sessionCreatedAt: session.createdAt,
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
