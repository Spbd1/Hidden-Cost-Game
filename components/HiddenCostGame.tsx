"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import {
  ROUND_INCOME_POINTS,
  createHiddenCostGameState,
  createReplayGameState,
  formatPoints,
  getHealthAfterChoice,
  getPaidCost,
  getTreatmentCost,
  medicalEvents,
} from "@/utils/game";
import { isPostRevealSurveyComplete } from "@/utils/researchMetrics";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { GameChoice, HiddenCostGameState, ReplayGameState, ResearchSession } from "@/types/research";

const choiceLabels: Record<GameChoice, string> = {
  "full-treatment": "Full treatment",
  "partial-treatment": "Partial treatment",
  "skip-treatment": "Skip treatment",
};

export function HiddenCostGame({ mode = "primary" }: { mode?: "primary" | "replay" }) {
  const router = useRouter();
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [game, setGame] = useState<HiddenCostGameState | null>(null);
  const [roundStartedAt, setRoundStartedAt] = useState(() => Date.now());

  useEffect(() => {
    const storedSession = getStoredSession(mode === "replay" ? "individual-results" : "game");

    if (mode === "replay") {
      if (!storedSession.game?.completedAt || !isPostRevealSurveyComplete(storedSession.postRevealSurvey)) {
        const redirectStage = storedSession.game?.completedAt ? "post-reveal" : "game";
        saveStoredSession({ ...storedSession, currentStage: redirectStage });
        router.replace(storedSession.game?.completedAt ? "/post-reveal-survey" : "/game");
        return;
      }

      if (storedSession.replayGame?.completedAt) {
        saveStoredSession({ ...storedSession, currentStage: "individual-results" });
        router.replace("/individual-results");
        return;
      }

      const nextReplayGame = storedSession.replayGame ?? createReplayGameState(storedSession.game);
      const nextSession = {
        ...storedSession,
        currentStage: "individual-results" as const,
        replayGame: nextReplayGame,
      };

      saveStoredSession(nextSession);
      setSession(nextSession);
      setGame(nextReplayGame);
      setRoundStartedAt(Date.now());
      return;
    }

    if (!storedSession.participantProfile) {
      const backgroundSession: ResearchSession = {
        ...storedSession,
        currentStage: "background",
      };

      saveStoredSession(backgroundSession);
      router.replace("/background");
      return;
    }

    if (storedSession.game?.completedAt) {
      const completedSession: ResearchSession = {
        ...storedSession,
        currentStage: "visible-results",
      };

      saveStoredSession(completedSession);
      router.replace("/visible-results");
      return;
    }

    const nextGame = storedSession.game ?? createHiddenCostGameState();
    const nextSession = {
      ...storedSession,
      currentStage: "game" as const,
      game: nextGame,
    };

    saveStoredSession(nextSession);
    setSession(nextSession);
    setGame(nextGame);
    setRoundStartedAt(Date.now());
  }, [mode, router]);

  const currentEvent = game ? medicalEvents[game.currentRoundIndex] : undefined;
  const actualFullCost = useMemo(() => {
    if (!game || !currentEvent) {
      return 0;
    }

    return getTreatmentCost(currentEvent.baseFullCost, game.treatmentCostMultiplier);
  }, [currentEvent, game]);
  const actualPartialCost = useMemo(() => {
    if (!game || !currentEvent) {
      return 0;
    }

    return getTreatmentCost(currentEvent.basePartialCost, game.treatmentCostMultiplier);
  }, [currentEvent, game]);

  function handleChoice(choice: GameChoice) {
    if (!session || !game || !currentEvent) {
      return;
    }

    const timestamp = new Date().toISOString();
    const paidCost = getPaidCost(choice, actualFullCost, actualPartialCost);
    const scoreBefore = game.financialPoints;
    const healthBefore = game.healthPoints;
    const scoreAfter = Number((scoreBefore + ROUND_INCOME_POINTS - paidCost).toFixed(2));
    const healthAfter = getHealthAfterChoice(choice, healthBefore);
    const updatedRounds = [
      ...game.rounds,
      {
        roundNumber: currentEvent.roundNumber,
        eventName: currentEvent.eventName,
        displayedProfile: game.displayedProfile,
        hiddenProfile: game.hiddenProfile,
        baseFullCost: currentEvent.baseFullCost,
        basePartialCost: currentEvent.basePartialCost,
        actualFullCost,
        actualPartialCost,
        choice,
        paidCost,
        scoreBefore,
        scoreAfter,
        healthBefore,
        healthAfter,
        timestamp,
        decisionTimeMs: Date.now() - roundStartedAt,
      },
    ];
    const isComplete = updatedRounds.length === medicalEvents.length;
    const updatedGame: HiddenCostGameState | ReplayGameState = {
      ...game,
      financialPoints: scoreAfter,
      healthPoints: healthAfter,
      currentRoundIndex: isComplete ? game.currentRoundIndex : game.currentRoundIndex + 1,
      completedAt: isComplete ? timestamp : undefined,
      rounds: updatedRounds,
      ...("replayId" in game
        ? {
            finalFinancialScore: scoreAfter,
            finalHealthScore: healthAfter,
          }
        : {}),
    };
    const updatedSession: ResearchSession =
      mode === "replay"
        ? {
            ...session,
            currentStage: "individual-results",
            replayGame: updatedGame as ReplayGameState,
          }
        : {
            ...session,
            currentStage: isComplete ? "visible-results" : "game",
            game: updatedGame,
          };

    saveStoredSession(updatedSession);
    setSession(updatedSession);
    setGame(updatedGame);

    if (isComplete) {
      router.push(mode === "replay" ? "/individual-results" : "/visible-results");
      return;
    }

    setRoundStartedAt(Date.now());
  }

  if (!game || !currentEvent) {
    return (
      <Card>
        <p className="text-slate-600">Preparing the next medical event...</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-6">
      {mode === "replay" ? (
        <div className="rounded-2xl border border-research-100 bg-research-50 p-5 leading-7 text-research-900">
          <p className="font-semibold">This is an optional second playthrough.</p>
          <p>No additional survey questions will be asked. Your choices in this replay are saved separately from your first game.</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-research-700">
            {mode === "replay" ? "Replay round" : "Round"} {currentEvent.roundNumber} of {medicalEvents.length}
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">{currentEvent.eventName}</h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Choose how much care to receive while balancing financial and health points. The point values are part of a simplified simulation, not a judgment of real-life healthcare decisions.
          </p>
        </div>
        <div className="rounded-2xl border border-research-100 bg-research-50 px-5 py-4 text-sm font-semibold text-research-800">
          Displayed profile: {game.displayedProfile}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard label="Current financial points" value={formatPoints(game.financialPoints)} />
        <StatusCard label="Current health points" value={formatPoints(game.healthPoints)} />
        <StatusCard label="Skipping risk" value={currentEvent.skipRisk} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700">
        The task shows the information needed for this round. Additional scenario details are explained later as part of the study design.
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ChoiceButton
          title={choiceLabels["full-treatment"]}
          cost={actualFullCost}
          consequence="Health does not change."
          onClick={() => handleChoice("full-treatment")}
        />
        <ChoiceButton
          title={choiceLabels["partial-treatment"]}
          cost={actualPartialCost}
          consequence="Health decreases by 10."
          onClick={() => handleChoice("partial-treatment")}
        />
        <ChoiceButton
          title={choiceLabels["skip-treatment"]}
          cost={0}
          consequence="Health decreases by 25."
          onClick={() => handleChoice("skip-treatment")}
        />
      </div>
    </Card>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold capitalize text-ink">{value}</p>
    </div>
  );
}

function ChoiceButton({ title, cost, consequence, onClick }: { title: string; cost: number; consequence: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-research-300 hover:shadow-card focus:outline-none focus:ring-4 focus:ring-research-100"
    >
      <span className="text-lg font-semibold text-ink">{title}</span>
      <span className="mt-4 block text-3xl font-bold text-research-700">{formatPoints(cost)} pts</span>
      <span className="mt-3 block text-sm leading-6 text-slate-600">{consequence}</span>
    </button>
  );
}
