"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { StageNavigation } from "@/components/StageNavigation";
import { formatPoints } from "@/utils/game";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { HiddenCostGameState, ResearchSession } from "@/types/research";

const choiceText: Record<string, string> = {
  "full-treatment": "Full treatment",
  "partial-treatment": "Partial treatment",
  "skip-treatment": "Skipped treatment",
};

export function ResultsTable() {
  const [game, setGame] = useState<HiddenCostGameState | null>(null);

  useEffect(() => {
    const storedSession = getStoredSession("results");
    const nextSession: ResearchSession = {
      ...storedSession,
      currentStage: "results",
    };

    saveStoredSession(nextSession);
    setGame(nextSession.game ?? null);
  }, []);

  if (!game || game.rounds.length === 0) {
    return (
      <Card className="space-y-5">
        <h2 className="text-2xl font-semibold text-ink">No completed game rounds yet</h2>
        <p className="leading-7 text-slate-600">Play the decision game to generate your round-by-round results table.</p>
        <StageNavigation currentStage="results" />
      </Card>
    );
  }

  return (
    <Card className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Final financial points" value={formatPoints(game.financialPoints)} />
        <SummaryCard label="Final health points" value={formatPoints(game.healthPoints)} />
        <SummaryCard label="Displayed profile" value={game.displayedProfile} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Round</th>
              <th className="px-4 py-3 font-semibold">Event</th>
              <th className="px-4 py-3 font-semibold">Choice</th>
              <th className="px-4 py-3 font-semibold">Paid</th>
              <th className="px-4 py-3 font-semibold">Financial before → after</th>
              <th className="px-4 py-3 font-semibold">Health before → after</th>
              <th className="px-4 py-3 font-semibold">Decision time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
            {game.rounds.map((round) => (
              <tr key={round.roundNumber}>
                <td className="px-4 py-4 font-semibold text-ink">{round.roundNumber}</td>
                <td className="px-4 py-4">{round.eventName}</td>
                <td className="px-4 py-4">{choiceText[round.choice]}</td>
                <td className="px-4 py-4">{formatPoints(round.paidCost)} pts</td>
                <td className="px-4 py-4">
                  {formatPoints(round.scoreBefore)} → {formatPoints(round.scoreAfter)}
                </td>
                <td className="px-4 py-4">
                  {formatPoints(round.healthBefore)} → {formatPoints(round.healthAfter)}
                </td>
                <td className="px-4 py-4">{(round.decisionTimeMs / 1000).toFixed(1)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        Your results table uses the profile label shown during play. The underlying profile meaning is reserved for the reveal stage.
      </p>
      <StageNavigation currentStage="results" />
    </Card>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
