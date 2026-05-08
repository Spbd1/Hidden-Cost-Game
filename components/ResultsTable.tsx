"use client";

import { useEffect, useMemo, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { Card } from "@/components/Card";
import { ExportPanel } from "@/components/ExportPanel";
import { formatPoints } from "@/utils/game";
import {
  buildParticipantInterpretation,
  calculateComputedResearchMetrics,
  calculateGameSummary,
} from "@/utils/researchMetrics";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { ComputedResearchMetrics, GameSummary, HiddenCostGameState, PostRevealSurveyAnswers, PreRevealSurveyAnswers, ResearchSession } from "@/types/research";

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

  if (hasPostRevealSurvey && session?.preRevealSurvey && session.postRevealSurvey) {
    return <IndividualResults session={session} game={game} preRevealSurvey={session.preRevealSurvey} postRevealSurvey={session.postRevealSurvey} />;
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

function IndividualResults({
  session,
  game,
  preRevealSurvey,
  postRevealSurvey,
}: {
  session: ResearchSession;
  game: HiddenCostGameState;
  preRevealSurvey: PreRevealSurveyAnswers;
  postRevealSurvey: PostRevealSurveyAnswers;
}) {
  const gameSummary = calculateGameSummary(game);
  const computedMetrics = calculateComputedResearchMetrics({ game, preRevealSurvey, postRevealSurvey });
  const interpretations = buildParticipantInterpretation(computedMetrics);

  return (
    <div className="space-y-8">
      <Card className="space-y-6">
        <div className="rounded-2xl bg-research-50 p-5 leading-7 text-research-900">
          <h2 className="text-2xl font-semibold text-ink">Your individual results</h2>
          <p className="mt-3">
            Your post-reveal answers have been saved. This page summarizes your game outcomes, compares your pre- and post-reveal judgments, and prepares a structured research export.
          </p>
        </div>

        <GameSummarySection summary={gameSummary} />
      </Card>

      <Card className="space-y-6">
        <SectionHeading title="Judgment change" description="These rows compare the answers you gave before and after the hidden rule was revealed." />
        <JudgmentChangeTable preRevealSurvey={preRevealSurvey} postRevealSurvey={postRevealSurvey} />
      </Card>

      <Card className="space-y-6">
        <SectionHeading title="Computed research metrics" description="These derived values make the response pattern easier to analyze across prototype sessions." />
        <MetricsGrid metrics={computedMetrics} />
      </Card>

      <Card className="space-y-6">
        <SectionHeading title="Participant-facing interpretation" description="This interpretation is neutral, non-blaming, and based only on changes in your ratings." />
        <ul className="space-y-3">
          {interpretations.map((interpretation) => (
            <li key={interpretation} className="rounded-2xl bg-slate-50 p-4 leading-7 text-slate-700">
              {interpretation}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-6">
        <ExportPanel session={session} title="Research Export" />
        <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          This is an experimental prototype. In this version, data is stored only in your browser unless a research version with informed consent and secure storage is implemented.
        </p>
      </Card>
    </div>
  );
}

function GameSummarySection({ summary }: { summary: GameSummary }) {
  return (
    <div className="space-y-5">
      <SectionHeading title="Game summary" description="A plain-language summary of the hidden profile and treatment choices from this run." />
      <div className="grid gap-4 md:grid-cols-3">
        <ResultCard label="Actual hidden profile" value={summary.actualHiddenProfile} />
        <ResultCard label="Final financial score" value={formatPoints(summary.finalFinancialScore)} />
        <ResultCard label="Final health score" value={formatPoints(summary.finalHealthScore)} />
        <ResultCard label="Full treatment choices" value={summary.fullTreatmentChoices.toString()} />
        <ResultCard label="Partial treatment choices" value={summary.partialTreatmentChoices.toString()} />
        <ResultCard label="Skipped treatment choices" value={summary.skippedTreatmentChoices.toString()} />
        <ResultCard label="Total treatment cost paid" value={`${formatPoints(summary.totalTreatmentCostPaid)} pts`} />
        <ResultCard label="Total available income" value={`${formatPoints(summary.totalIncome)} pts`} />
        <ResultCard label="Assigned profile label" value={summary.assignedProfile} />
      </div>
    </div>
  );
}

function JudgmentChangeTable({ preRevealSurvey, postRevealSurvey }: { preRevealSurvey: PreRevealSurveyAnswers; postRevealSurvey: PostRevealSurveyAnswers }) {
  const rows = [
    {
      label: "Explanation for why some players fell behind",
      before: preRevealSurvey.fellBehindExplanation,
      after: postRevealSurvey.viewChangeExplanation,
    },
    {
      label: "Explanation after reveal",
      before: preRevealSurvey.lowerScoreReason,
      after: postRevealSurvey.lowerScoreReason,
    },
    {
      label: "Protest legitimacy",
      before: rating(preRevealSurvey.protestLegitimacy),
      after: rating(postRevealSurvey.protestLegitimacy),
    },
    {
      label: "Support for rule correction",
      before: rating(preRevealSurvey.ruleChangeFairness),
      after: rating(postRevealSurvey.ruleChangeFairness),
    },
    {
      label: "Individual-vs-system attribution",
      before: rating(preRevealSurvey.successAttribution, "1 = individual choices, 5 = game conditions"),
      after: rating(postRevealSurvey.successAttribution, "1 = individual choices, 5 = game conditions"),
    },
    {
      label: "Confidence in judgment / later accuracy rating",
      before: rating(preRevealSurvey.judgmentConfidence, "confidence before reveal"),
      after: rating(postRevealSurvey.initialJudgmentAccuracy, "post-reveal rating of initial accuracy"),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Measure</th>
            <th className="px-4 py-3 font-semibold">Before reveal</th>
            <th className="px-4 py-3 font-semibold">After reveal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="px-4 py-4 font-semibold text-ink">{row.label}</td>
              <td className="px-4 py-4 leading-6">{row.before}</td>
              <td className="px-4 py-4 leading-6">{row.after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricsGrid({ metrics }: { metrics: ComputedResearchMetrics }) {
  const rows = [
    ["Individual Attribution Score (pre)", metrics.individualAttributionPre],
    ["Individual Attribution Score (post)", metrics.individualAttributionPost],
    ["Systemic Attribution Score (pre)", metrics.systemicAttributionPre],
    ["Systemic Attribution Score (post)", metrics.systemicAttributionPost],
    ["Protest Legitimacy Shift", metrics.protestShift],
    ["Fairness Support Shift", metrics.fairnessShift],
    ["Empathy / Perspective Shift", metrics.empathyShift],
    ["Certainty Correction", metrics.certaintyCorrection],
    ["Burden Experienced", metrics.burden],
    ["Care Avoidance", metrics.careAvoidance],
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{formatMetric(value)}</p>
        </div>
      ))}
    </div>
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

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 leading-7 text-slate-600">{description}</p>
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

function rating(value: number, context?: string): string {
  return context ? `${value} (${context})` : `${value} / 5`;
}

function formatMetric(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}
