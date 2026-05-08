"use client";

import { useEffect, useMemo, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { Card } from "@/components/Card";
import { formatPoints } from "@/utils/game";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { HiddenCostGameState, ParticipantProfile, ResearchSession } from "@/types/research";

const fictionalPlayers = [
  { name: "Player 1", score: 164 },
  { name: "Player 2", score: 82 },
  { name: "Player 3", score: 139 },
  { name: "Player 4", score: 61 },
];

export function ResultsTable() {
  const [session, setSession] = useState<ResearchSession | null>(null);

  useEffect(() => {
    const storedSession = getStoredSession("results");
    const nextSession: ResearchSession = {
      ...storedSession,
      currentStage: "results",
    };

    saveStoredSession(nextSession);
    setSession(nextSession);
  }, []);

  const game = session?.game ?? null;
  const hasPostRevealSurvey = Boolean(session?.postRevealSurvey);

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

  if (hasPostRevealSurvey) {
    return <IndividualResults game={game} participantProfile={session?.participantProfile} />;
  }

  return (
    <Card className="space-y-6">
      <p className="rounded-2xl bg-slate-50 p-5 leading-7 text-slate-700">
        At this stage, you can only see the final results. Not all rules of the game have been revealed yet. Please answer the
        following questions based only on what you have seen so far.
      </p>

      <ResultsRankingTable players={sortedPlayers} />

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <ButtonLink href="/pre-reveal-survey">Continue to questions</ButtonLink>
      </div>
    </Card>
  );
}

function IndividualResults({ game, participantProfile }: { game: HiddenCostGameState; participantProfile?: ParticipantProfile }) {
  const answeredBackgroundItems = participantProfile
    ? Object.values(participantProfile).filter((value) => value !== null && value !== "").length
    : 0;

  return (
    <Card className="space-y-6">
      <div className="rounded-2xl bg-research-50 p-5 leading-7 text-research-900">
        <h2 className="text-2xl font-semibold text-ink">Your individual results</h2>
        <p className="mt-3">Your post-reveal answers have been saved. This page now shows your final score together with the hidden profile that shaped your treatment costs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ResultCard label="Final financial points" value={formatPoints(game.financialPoints)} />
        <ResultCard label="Final health points" value={formatPoints(game.healthPoints)} />
        <ResultCard label="Hidden profile" value={game.hiddenProfile} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Assigned cost rule</p>
        <p className="mt-3 text-2xl font-semibold text-ink">
          {game.displayedProfile} = {game.hiddenProfile} = cost multiplier {game.treatmentCostMultiplier.toFixed(1)}
        </p>
      </div>

      {participantProfile ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Background context</p>
          <p className="mt-3 leading-7 text-slate-700">
            Your non-identifying background profile was saved for research export ({answeredBackgroundItems} of 8 items answered). Detailed background answers are not shown here.
          </p>
        </div>
      ) : null}

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <ButtonLink href="/export">Continue to export</ButtonLink>
      </div>
    </Card>
  );
}

function ResultsRankingTable({ players }: { players: { name: string; score: number }[] }) {
  return (
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
          {players.map((player, index) => (
            <tr key={player.name} className={player.name === "You" ? "bg-research-50/70" : undefined}>
              <td className="px-4 py-4 font-semibold text-ink">{index + 1}</td>
              <td className="px-4 py-4 font-semibold text-ink">{player.name}</td>
              <td className="px-4 py-4">{formatPoints(player.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold capitalize text-ink">{value}</p>
    </div>
  );
}
