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
import type { GameChoice, GameRoundData, HiddenCostGameState, MedicalEvent, ReplayGameState, ResearchSession } from "@/types/research";

const choiceLabels: Record<GameChoice, string> = {
  "full-treatment": "Full treatment",
  "partial-treatment": "Partial treatment",
  "skip-treatment": "Skip treatment",
};

const choiceDescriptions: Record<GameChoice, string> = {
  "full-treatment": "Most care now, highest cost.",
  "partial-treatment": "Some care now, moderate cost.",
  "skip-treatment": "No care cost now, larger health loss.",
};

const choiceIcon: Record<GameChoice, string> = {
  "full-treatment": "❤️",
  "partial-treatment": "💊",
  "skip-treatment": "👛",
};

type RoundResult = {
  round: GameRoundData;
  isComplete: boolean;
};

type ChoicePreview = {
  choice: GameChoice;
  paidCost: number;
  scoreAfter: number;
  healthAfter: number;
};

export function HiddenCostGame({ mode = "primary" }: { mode?: "primary" | "replay" }) {
  const router = useRouter();
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [game, setGame] = useState<HiddenCostGameState | ReplayGameState | null>(null);
  const [roundStartedAt, setRoundStartedAt] = useState(() => Date.now());
  const [pendingRoundResult, setPendingRoundResult] = useState<RoundResult | null>(null);

  useEffect(() => {
    const storedSession = getStoredSession(mode === "replay" ? "individual-results" : "game");
    setPendingRoundResult(null);

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

  const choicePreviews = useMemo<ChoicePreview[]>(() => {
    if (!game) {
      return [];
    }

    return (["full-treatment", "partial-treatment", "skip-treatment"] as GameChoice[]).map((choice) => {
      const paidCost = getPaidCost(choice, actualFullCost, actualPartialCost);

      return {
        choice,
        paidCost,
        scoreAfter: Number((game.financialPoints + ROUND_INCOME_POINTS - paidCost).toFixed(2)),
        healthAfter: getHealthAfterChoice(choice, game.healthPoints),
      };
    });
  }, [actualFullCost, actualPartialCost, game]);

  function handleChoice(choice: GameChoice) {
    if (!session || !game || !currentEvent || pendingRoundResult) {
      return;
    }

    const timestamp = new Date().toISOString();
    const paidCost = getPaidCost(choice, actualFullCost, actualPartialCost);
    const scoreBefore = game.financialPoints;
    const healthBefore = game.healthPoints;
    const scoreAfter = Number((scoreBefore + ROUND_INCOME_POINTS - paidCost).toFixed(2));
    const healthAfter = getHealthAfterChoice(choice, healthBefore);
    const roundData: GameRoundData = {
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
    };
    const updatedRounds = [...game.rounds, roundData];
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
    setPendingRoundResult({ round: roundData, isComplete });
  }

  function handleContinue() {
    if (!pendingRoundResult) {
      return;
    }

    if (pendingRoundResult.isComplete) {
      router.push(mode === "replay" ? "/individual-results" : "/visible-results");
      return;
    }

    setPendingRoundResult(null);
    setRoundStartedAt(Date.now());
  }

  if (!game || !currentEvent) {
    return (
      <Card>
        <p className="text-slate-600">Preparing the next medical event...</p>
      </Card>
    );
  }

  const displayEvent = pendingRoundResult ? medicalEvents[pendingRoundResult.round.roundNumber - 1] ?? currentEvent : currentEvent;
  const displayFinancialPoints = pendingRoundResult ? pendingRoundResult.round.scoreAfter : game.financialPoints;
  const displayHealthPoints = pendingRoundResult ? pendingRoundResult.round.healthAfter : game.healthPoints;

  return (
    <Card className="space-y-6">
      {mode === "replay" ? <ReplayNote /> : null}

      <RoundHeader game={game} event={displayEvent} mode={mode} />

      <EventPanel event={displayEvent} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.8fr]">
        <StatusBar label="Financial points" value={displayFinancialPoints} max={100} icon="💰" />
        <StatusBar label="Health points" value={displayHealthPoints} max={100} icon="❤️" />
        <ProgressStatus current={displayEvent.roundNumber} total={medicalEvents.length} />
      </div>

      {pendingRoundResult ? (
        <ResultPanel result={pendingRoundResult} mode={mode} onContinue={handleContinue} />
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700">
            The task shows the information needed for this round. Additional scenario details are explained later as part of the study design.
          </div>

          <div className="grid gap-4 lg:grid-cols-3" aria-label="Treatment choices with estimated point outcomes">
            {choicePreviews.map((preview) => (
              <ChoiceButton
                key={preview.choice}
                preview={preview}
                financialBefore={game.financialPoints}
                healthBefore={game.healthPoints}
                disabled={Boolean(pendingRoundResult)}
                onClick={() => handleChoice(preview.choice)}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
            What this means: Higher care usually protects health but costs more points. Lower care saves points now but may reduce health points.
          </div>
        </>
      )}
    </Card>
  );
}

function ReplayNote() {
  return (
    <div className="rounded-3xl border border-research-100 bg-gradient-to-r from-research-50 to-white p-5 leading-7 text-research-950 shadow-sm">
      <div className="flex gap-3">
        <span className="text-2xl" aria-hidden="true">
          🔁
        </span>
        <p className="font-medium">
          This is an optional second playthrough. No additional survey questions will be asked. Your choices here are saved separately from your first game.
        </p>
      </div>
    </div>
  );
}

function RoundHeader({ game, event, mode }: { game: HiddenCostGameState | ReplayGameState; event: MedicalEvent; mode: "primary" | "replay" }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-research-700">
          {mode === "replay" ? "Replay round" : "Round"} {event.roundNumber} of {medicalEvents.length}
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">{event.eventName}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Choose how much care to receive while balancing financial and health points. The point values are part of a simplified simulation, not a judgment of real-life healthcare decisions.
        </p>
      </div>
      <div className="rounded-2xl border border-research-100 bg-research-50 px-5 py-4 text-sm font-semibold text-research-800">
        Displayed profile: {game.displayedProfile}
      </div>
    </div>
  );
}

function EventPanel({ event }: { event: MedicalEvent }) {
  const icon = getEventIcon(event.eventName);

  return (
    <section
      aria-label={`Medical event: ${event.eventName}`}
      className="overflow-hidden rounded-[2rem] border border-research-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5 shadow-sm md:p-6"
    >
      <div className="grid gap-5 md:grid-cols-[0.9fr_1.4fr] md:items-center">
        <div className="relative min-h-44 rounded-[1.75rem] bg-gradient-to-br from-research-100 to-white p-5 shadow-inner">
          <div className="absolute left-5 top-5 rounded-2xl bg-white/80 px-3 py-2 text-sm font-bold text-research-800 shadow-sm">Round {event.roundNumber}</div>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
            <div className="rounded-[1.5rem] bg-white p-4 text-center shadow-card" aria-hidden="true">
              <div className="text-6xl leading-none">{icon}</div>
            </div>
            <div className="flex flex-col items-end gap-2 text-3xl" aria-hidden="true">
              <span className="rounded-full bg-white/90 p-3 shadow-sm">🧾</span>
              <span className="rounded-full bg-white/90 p-3 shadow-sm">💰</span>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-research-700">Medical event card</p>
          <h3 className="mt-2 text-2xl font-bold text-ink">{event.eventName}</h3>
          <p className="mt-3 leading-7 text-slate-700">
            A care decision is needed this round. Compare the point cost, the income added this round, and the health outcome before choosing.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full bg-white px-4 py-2 text-slate-700 shadow-sm">Income this round: +{formatPoints(ROUND_INCOME_POINTS)} pts</span>
            <span className="rounded-full bg-white px-4 py-2 capitalize text-slate-700 shadow-sm">Skipping risk: {event.skipRisk}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusBar({ label, value, max, icon }: { label: string; value: number; max: number; icon: string }) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const fillClass = label.toLowerCase().includes("health") ? "bg-rose-500" : "bg-research-600";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-ink">
          <span aria-hidden="true">{icon}</span> {label}
        </p>
        <p className="text-lg font-bold text-ink">{formatPoints(value)} pts</p>
      </div>
      <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200" role="img" aria-label={`${label}: ${formatPoints(value)} points`}>
        <div className={`h-full rounded-full ${fillClass}`} style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-2 text-xs font-medium text-slate-600">Bar shows up to {formatPoints(max)} points; exact value is shown in text.</p>
    </div>
  );
}

function ProgressStatus({ current, total }: { current: number; total: number }) {
  const percentage = Math.max(0, Math.min(100, (current / total) * 100));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-ink">Round progress</p>
        <p className="text-lg font-bold text-ink">
          Round {current}/{total}
        </p>
      </div>
      <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200" role="img" aria-label={`Round ${current} of ${total}`}>
        <div className="h-full rounded-full bg-amber-500" style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-2 text-xs font-medium text-slate-600">You will make {total} healthcare decisions total.</p>
    </div>
  );
}

function ChoiceButton({
  preview,
  financialBefore,
  healthBefore,
  disabled,
  onClick,
}: {
  preview: ChoicePreview;
  financialBefore: number;
  healthBefore: number;
  disabled: boolean;
  onClick: () => void;
}) {
  const healthDelta = preview.healthAfter - healthBefore;
  const financialDelta = preview.scoreAfter - financialBefore;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${choiceLabels[preview.choice]}. Cost ${formatPoints(preview.paidCost)} points. Estimated financial points after choice ${formatPoints(preview.scoreAfter)}. Health points after choice ${formatPoints(preview.healthAfter)}.`}
      className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-research-300 hover:shadow-card focus:outline-none focus:ring-4 focus:ring-research-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-lg font-semibold text-ink">{choiceLabels[preview.choice]}</span>
          <span className="mt-1 block text-sm leading-6 text-slate-600">{choiceDescriptions[preview.choice]}</span>
        </span>
        <span className="rounded-2xl bg-slate-50 p-3 text-3xl" aria-hidden="true">
          {choiceIcon[preview.choice]}
        </span>
      </span>

      <span className="mt-5 grid gap-3 text-sm text-slate-700">
        <span className="flex justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <span className="font-medium">Cost</span>
          <span className="font-bold text-rose-700">-{formatPoints(preview.paidCost)} pts</span>
        </span>
        <span className="flex justify-between gap-3 rounded-2xl bg-emerald-50 px-4 py-3">
          <span className="font-medium">Income this round</span>
          <span className="font-bold text-emerald-800">+{formatPoints(ROUND_INCOME_POINTS)} pts</span>
        </span>
        <span className="rounded-2xl border border-research-100 bg-research-50 px-4 py-3">
          <span className="block font-semibold text-research-900">After this choice</span>
          <span className="mt-2 flex justify-between gap-3">
            <span>Financial points</span>
            <span className="font-bold text-research-900">
              {formatPoints(preview.scoreAfter)} pts ({formatSignedPoints(financialDelta)})
            </span>
          </span>
          <span className="mt-1 flex justify-between gap-3">
            <span>Health points</span>
            <span className="font-bold text-research-900">
              {formatPoints(preview.healthAfter)} pts ({formatSignedPoints(healthDelta)})
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}

function ResultPanel({ result, mode, onContinue }: { result: RoundResult; mode: "primary" | "replay"; onContinue: () => void }) {
  const continueLabel = result.isComplete ? (mode === "replay" ? "Return to results" : "Continue to visible results") : "Continue to next round";

  return (
    <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm md:p-6" aria-live="polite">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">Round result</p>
          <h3 className="mt-2 text-2xl font-bold text-ink">You chose: {choiceLabels[result.round.choice]}</h3>
          <p className="mt-2 leading-7 text-slate-700">Here is what happened to your points before the next screen.</p>
        </div>
        <div className="rounded-3xl bg-white p-4 text-5xl shadow-sm" aria-hidden="true">
          {choiceIcon[result.round.choice]}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <ResultChange label="Financial points" before={result.round.scoreBefore} after={result.round.scoreAfter} icon="💰" />
        <ResultChange label="Health points" before={result.round.healthBefore} after={result.round.healthAfter} icon="❤️" />
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-6 w-full rounded-2xl bg-research-700 px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-research-800 focus:outline-none focus:ring-4 focus:ring-research-100 md:w-auto"
      >
        {continueLabel}
      </button>
    </section>
  );
}

function ResultChange({ label, before, after, icon }: { label: string; before: number; after: number; icon: string }) {
  const delta = after - before;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="font-semibold text-ink">
        <span aria-hidden="true">{icon}</span> {label}
      </p>
      <p className="mt-3 text-2xl font-bold text-ink">
        {formatPoints(before)} → {formatPoints(after)} pts
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-700">Change from choice and round income: {formatSignedPoints(delta)}</p>
    </div>
  );
}

function getEventIcon(eventName: string): string {
  if (eventName.toLowerCase().includes("medication")) {
    return "💊";
  }

  if (eventName.toLowerCase().includes("dental")) {
    return "🦷";
  }

  if (eventName.toLowerCase().includes("diagnostic")) {
    return "🧪";
  }

  if (eventName.toLowerCase().includes("follow")) {
    return "❤️";
  }

  return "🏥";
}

function formatSignedPoints(value: number): string {
  if (value > 0) {
    return `+${formatPoints(value)} pts`;
  }

  if (value < 0) {
    return `${formatPoints(value)} pts`;
  }

  return "0 pts";
}
