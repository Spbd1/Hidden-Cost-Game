"use client";

import { useEffect, useMemo, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { Card } from "@/components/Card";
import { formatPoints } from "@/utils/game";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { HiddenCostGameState, ResearchSession } from "@/types/research";

const fictionalPlayers = [
  { name: "Player 1", score: 164 },
  { name: "Player 2", score: 82 },
  { name: "Player 3", score: 139 },
  { name: "Player 4", score: 61 },
];

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

  const sortedPlayers = useMemo(() => {
    if (!game) {
      return [];
    }

    return [...fictionalPlayers, { name: "You", score: game.financialPoints }].sort((firstPlayer, secondPlayer) => secondPlayer.score - firstPlayer.score);
  }, [game]);

  if (!game || game.rounds.length === 0) {
    return (
      <Card className="space-y-5">
        <h2 className="text-2xl font-semibold text-ink">No completed game yet</h2>
        <p className="leading-7 text-slate-600">Play the decision game to generate your final results table.</p>
        <ButtonLink href="/game">Go to game</ButtonLink>
      </Card>
    );
  }

  return (
    <Card className="space-y-6">
      <p className="rounded-2xl bg-slate-50 p-5 leading-7 text-slate-700">
        At this stage, you can only see the final results. Not all rules of the game have been revealed yet. Please answer the
        following questions based only on what you have seen so far.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Rank</th>
              <th className="px-4 py-3 font-semibold">Player</th>
              <th className="px-4 py-3 font-semibold">Final score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
            {sortedPlayers.map((player, index) => (
              <tr key={player.name} className={player.name === "You" ? "bg-research-50/70" : undefined}>
                <td className="px-4 py-4 font-semibold text-ink">{index + 1}</td>
                <td className="px-4 py-4 font-semibold text-ink">{player.name}</td>
                <td className="px-4 py-4">{formatPoints(player.score)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <ButtonLink href="/pre-reveal-survey">Continue to questions</ButtonLink>
      </div>
    </Card>
  );
}
