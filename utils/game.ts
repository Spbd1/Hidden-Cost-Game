import type { GameChoice, HiddenCostGameState, HiddenCostProfile, MedicalEvent } from "@/types/research";

export const STARTING_FINANCIAL_POINTS = 100;
export const STARTING_HEALTH_POINTS = 100;
export const ROUND_INCOME_POINTS = 20;
export const PARTIAL_TREATMENT_HEALTH_LOSS = 10;
export const SKIP_TREATMENT_HEALTH_LOSS = 25;

export const hiddenCostProfiles: HiddenCostProfile[] = [
  {
    displayedProfile: "Profile A",
    hiddenProfile: "High coverage",
    treatmentCostMultiplier: 0.3,
  },
  {
    displayedProfile: "Profile B",
    hiddenProfile: "Low coverage",
    treatmentCostMultiplier: 1.0,
  },
];

export const medicalEvents: MedicalEvent[] = [
  {
    roundNumber: 1,
    eventName: "Doctor visit",
    baseFullCost: 20,
    basePartialCost: 10,
    skipRisk: "low",
  },
  {
    roundNumber: 2,
    eventName: "Monthly medication",
    baseFullCost: 30,
    basePartialCost: 15,
    skipRisk: "medium",
  },
  {
    roundNumber: 3,
    eventName: "Diagnostic test",
    baseFullCost: 40,
    basePartialCost: 20,
    skipRisk: "medium",
  },
  {
    roundNumber: 4,
    eventName: "Dental care",
    baseFullCost: 50,
    basePartialCost: 25,
    skipRisk: "high",
  },
  {
    roundNumber: 5,
    eventName: "Follow-up care",
    baseFullCost: 35,
    basePartialCost: 15,
    skipRisk: "medium",
  },
];

export function createHiddenCostGameState(): HiddenCostGameState {
  const profile = hiddenCostProfiles[Math.floor(Math.random() * hiddenCostProfiles.length)];

  return {
    displayedProfile: profile.displayedProfile,
    hiddenProfile: profile.hiddenProfile,
    treatmentCostMultiplier: profile.treatmentCostMultiplier,
    financialPoints: STARTING_FINANCIAL_POINTS,
    healthPoints: STARTING_HEALTH_POINTS,
    currentRoundIndex: 0,
    startedAt: new Date().toISOString(),
    rounds: [],
  };
}

export function getTreatmentCost(baseCost: number, multiplier: number): number {
  return Number((baseCost * multiplier).toFixed(2));
}

export function getPaidCost(choice: GameChoice, fullCost: number, partialCost: number): number {
  if (choice === "full-treatment") {
    return fullCost;
  }

  if (choice === "partial-treatment") {
    return partialCost;
  }

  return 0;
}

export function getHealthAfterChoice(choice: GameChoice, healthBefore: number): number {
  if (choice === "partial-treatment") {
    return Math.max(0, healthBefore - PARTIAL_TREATMENT_HEALTH_LOSS);
  }

  if (choice === "skip-treatment") {
    return Math.max(0, healthBefore - SKIP_TREATMENT_HEALTH_LOSS);
  }

  return healthBefore;
}

export function formatPoints(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}
