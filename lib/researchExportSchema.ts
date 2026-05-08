import { z } from "zod";

const isoDateStringSchema = z.string().datetime({ offset: true });
const likertSchema = z.number().int().min(1).max(7);
const optionalLikertSchema = z.number().int().min(1).max(7).nullable().optional();

const displayedProfileSchema = z.enum(["Profile A", "Profile B"]);
const hiddenProfileSchema = z.enum(["High coverage", "Low coverage"]);
const gameChoiceSchema = z.enum(["full-treatment", "partial-treatment", "skip-treatment"]);
const medicalRiskLevelSchema = z.enum(["low", "medium", "high"]);
const serverSubmissionStatusSchema = z.enum(["not_enabled", "not_submitted", "submitting", "submitted", "failed"]);

export const participantProfileSchema = z
  .object({
    ageGroup: z.string().min(1),
    gender: z.string().min(1),
    subjectiveEconomicStatus: z.union([z.number().int().min(1).max(10), z.literal("Prefer not to answer")]).nullable(),
    medicalCostPressure: z.string().min(1),
    healthcareCoverage: z.string().min(1),
    specialOrganizationalCoverage: z.string().min(1),
    inequalityOrientation: optionalLikertSchema,
    institutionalTrust: optionalLikertSchema,
    priorExposureToUnequalSystems: z.string().optional(),
    policyPreferenceBaseline: z.union([z.number().int().min(1).max(7), z.literal("Prefer not to answer")]).nullable().optional(),
  })
  .passthrough();

export const assignedProfileSchema = z
  .object({
    displayedProfile: displayedProfileSchema,
    hiddenProfile: hiddenProfileSchema,
    treatmentCostMultiplier: z.number().positive(),
  })
  .passthrough();

export const gameSummarySchema = z
  .object({
    actualHiddenProfile: hiddenProfileSchema,
    assignedProfile: displayedProfileSchema,
    finalFinancialScore: z.number(),
    finalHealthScore: z.number(),
    totalTreatmentCostPaid: z.number().nonnegative(),
    totalIncome: z.number().nonnegative(),
    fullTreatmentChoices: z.number().int().nonnegative(),
    partialTreatmentChoices: z.number().int().nonnegative(),
    skippedTreatmentChoices: z.number().int().nonnegative(),
  })
  .passthrough();

export const gameRoundSchema = z
  .object({
    roundNumber: z.number().int().positive(),
    eventName: z.string().min(1),
    displayedProfile: displayedProfileSchema,
    hiddenProfile: hiddenProfileSchema,
    baseFullCost: z.number().nonnegative(),
    basePartialCost: z.number().nonnegative(),
    actualFullCost: z.number().nonnegative(),
    actualPartialCost: z.number().nonnegative(),
    choice: gameChoiceSchema,
    paidCost: z.number().nonnegative(),
    scoreBefore: z.number(),
    scoreAfter: z.number(),
    healthBefore: z.number(),
    healthAfter: z.number(),
    timestamp: isoDateStringSchema,
    decisionTimeMs: z.number().int().nonnegative(),
    skipRisk: medicalRiskLevelSchema.optional(),
  })
  .passthrough();

export const preRevealSurveySchema = z
  .object({
    primaryAttribution: z.string().min(1),
    individualResponsibility: likertSchema,
    constraintSuspicion: likertSchema,
    protestLegitimacy: likertSchema,
    ruleCorrectionSupport: likertSchema,
    redistributionSupport: likertSchema,
    confidence: likertSchema,
    informationSufficiency: likertSchema,
    openExplanation: z.string().trim().min(10).max(500),
  })
  .passthrough();

export const postRevealSurveySchema = z
  .object({
    revisedPrimaryAttribution: z.string().min(1),
    revisedIndividualResponsibility: likertSchema,
    perceivedStructuralImpact: likertSchema,
    postProtestLegitimacy: likertSchema,
    postRuleCorrectionSupport: likertSchema,
    postRedistributionSupport: likertSchema,
    initialJudgmentAccuracy: likertSchema,
    perspectiveChange: likertSchema,
    openRevision: z.string().trim().min(10).max(500),
  })
  .passthrough();

export const computedMetricsSchema = z
  .object({
    responsibilityShift: z.number(),
    constraintRecognitionShift: z.number(),
    protestLegitimacyShift: z.number(),
    ruleCorrectionSupportShift: z.number(),
    redistributionSupportShift: z.number(),
    certaintyCorrection: z.number(),
    informationCaution: z.number(),
    perspectiveChange: z.number(),
    burden: z.number(),
    careAvoidance: z.number(),
    attributionCategoryShift: z
      .object({
        pre: z.string().min(1),
        post: z.string().min(1),
      })
      .passthrough(),
  })
  .passthrough();

export const researchExportCompletenessSchema = z
  .object({
    hasParticipantProfile: z.literal(true),
    completedGame: z.literal(true),
    completedGameRounds: z.number().int().positive(),
    hasPreRevealSurvey: z.literal(true),
    hasSeenReveal: z.literal(true),
    hasPostRevealSurvey: z.literal(true),
    isComplete: z.literal(true),
  })
  .passthrough();

export const researchExportSchema = z
  .object({
    schemaVersion: z.string().min(1),
    exportVersion: z.string().min(1),
    sessionId: z.string().min(1),
    consentVersion: z.string().min(1),
    serverSubmissionStatus: serverSubmissionStatusSchema,
    serverSubmissionId: z.string().min(1).optional(),
    serverSubmittedAt: isoDateStringSchema.optional(),
    createdAt: isoDateStringSchema.optional(),
    sessionCreatedAt: isoDateStringSchema.optional(),
    assignedProfile: assignedProfileSchema,
    gameSummary: gameSummarySchema,
    gameRounds: z.array(gameRoundSchema).min(1),
    preRevealSurvey: preRevealSurveySchema,
    postRevealSurvey: postRevealSurveySchema,
    computedMetrics: computedMetricsSchema,
    completeness: researchExportCompletenessSchema,
  })
  .passthrough()
  .superRefine((value, ctx) => {
    if (value.gameRounds.length !== value.completeness.completedGameRounds) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "completedGameRounds must match the number of submitted gameRounds",
        path: ["completeness", "completedGameRounds"],
      });
    }
  });

export type ValidResearchExport = z.infer<typeof researchExportSchema>;
