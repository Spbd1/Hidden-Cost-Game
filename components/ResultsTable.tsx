"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { Card } from "@/components/Card";
import { ExportPanel } from "@/components/ExportPanel";
import { formatPoints } from "@/utils/game";
import {
  buildParticipantInterpretation,
  calculateComputedResearchMetrics,
  calculateGameSummary,
  isPostRevealSurveyComplete,
  isPreRevealSurveyComplete,
} from "@/utils/researchMetrics";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { ComputedResearchMetrics, GameSummary, HiddenCostGameState, PostRevealSurveyAnswers, PreRevealSurveyAnswers, ResearchSession } from "@/types/research";

const fictionalPlayers = [
  { name: "Player 1", score: 164 },
  { name: "Player 2", score: 82 },
  { name: "Player 3", score: 139 },
  { name: "Player 4", score: 61 },
];

type ResultsMode = "visible" | "individual" | "legacy";

export function ResultsTable({ mode = "visible" }: { mode?: ResultsMode }) {
  const router = useRouter();
  const [session, setSession] = useState<ResearchSession | null>(null);

  useEffect(() => {
    const targetStage = mode === "individual" ? "individual-results" : "visible-results";
    const storedSession = getStoredSession(targetStage);
    const postComplete = isPostRevealSurveyComplete(storedSession.postRevealSurvey);

    if (mode === "legacy") {
      router.replace(postComplete ? "/individual-results" : "/visible-results");
      return;
    }

    if (mode === "individual" && !postComplete) {
      const redirectHref = storedSession.revealViewedAt ? "/post-reveal-survey" : storedSession.preRevealSurveyCompletedAt ? "/hidden-rule-reveal" : "/visible-results";
      saveStoredSession({ ...storedSession, currentStage: storedSession.revealViewedAt ? "post-reveal" : storedSession.preRevealSurveyCompletedAt ? "reveal" : "visible-results" });
      router.replace(redirectHref);
      return;
    }

    if (mode === "visible" && !storedSession.game?.completedAt) {
      saveStoredSession({ ...storedSession, currentStage: "game" });
      router.replace("/game");
      return;
    }

    const nextSession: ResearchSession = {
      ...storedSession,
      currentStage: targetStage,
    };

    saveStoredSession(nextSession);
    setSession(nextSession);
  }, [mode, router]);

  const game = session?.game ?? null;
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

  if (mode === "individual" && session && isPreRevealSurveyComplete(session.preRevealSurvey) && isPostRevealSurveyComplete(session.postRevealSurvey)) {
    return <IndividualResults session={session} game={game} preRevealSurvey={session.preRevealSurvey} postRevealSurvey={session.postRevealSurvey} />;
  }

  return (
    <Card className="space-y-6">
      <p className="rounded-2xl bg-slate-50 p-5 leading-7 text-slate-700">
        At this stage, you can see only the visible score table. Hidden profiles, metrics, and post-reveal interpretation are intentionally not shown yet. Please continue to the pre-reveal survey and answer based only on what you have seen so far.
      </p>

      <ResultsRankingTable players={sortedPlayers} />

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <ButtonLink href="/pre-reveal-survey">Continue to pre-reveal survey</ButtonLink>
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
          <p className="mt-3">Your post-reveal answers have been saved. This page summarizes your game outcomes, compares pre- and post-reveal ratings, and prepares a structured JSON export.</p>
        </div>
        <GameSummarySection summary={gameSummary} />
      </Card>

      <Card className="space-y-6">
        <SectionHeading title="Judgment change" description="These rows compare the answers you gave before and after the hidden rule was revealed." />
        <JudgmentChangeTable preRevealSurvey={preRevealSurvey} postRevealSurvey={postRevealSurvey} />
      </Card>

      <Card className="space-y-6">
        <SectionHeading title="Computed research metrics" description="These derived values summarize response patterns for prototype analysis. They should be interpreted cautiously and alongside the full context." />
        <MetricsGrid metrics={computedMetrics} />
      </Card>

      <Card className="space-y-6">
        <SectionHeading title="Participant-facing interpretation" description="This neutral interpretation is based only on changes in your ratings. It does not evaluate whether any response is right or wrong." />
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
        <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">This is an experimental prototype. Data is stored only in this browser unless you choose to copy or download it. A production research version would need formal consent materials and secure storage.</p>
      </Card>
    </div>
  );
}

function GameSummarySection({ summary }: { summary: GameSummary }) {
  return (
    <div className="space-y-5">
      <SectionHeading title="Game summary" description="A plain-language summary of the hidden cost profile and treatment choices from this run." />
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
    { label: "Open explanation / revision", before: preRevealSurvey.openExplanation, after: postRevealSurvey.openRevision },
    { label: "Primary attribution category", before: preRevealSurvey.primaryAttribution, after: postRevealSurvey.revisedPrimaryAttribution },
    { label: "Individual responsibility", before: rating(preRevealSurvey.individualResponsibility), after: rating(postRevealSurvey.revisedIndividualResponsibility) },
    { label: "Constraint suspicion / structural impact", before: rating(preRevealSurvey.constraintSuspicion), after: rating(postRevealSurvey.perceivedStructuralImpact) },
    { label: "Protest legitimacy", before: rating(preRevealSurvey.protestLegitimacy), after: rating(postRevealSurvey.postProtestLegitimacy) },
    { label: "Support for rule correction", before: rating(preRevealSurvey.ruleCorrectionSupport), after: rating(postRevealSurvey.postRuleCorrectionSupport) },
    { label: "Support for point redistribution", before: rating(preRevealSurvey.redistributionSupport), after: rating(postRevealSurvey.postRedistributionSupport) },
    { label: "Confidence / initial judgment accuracy", before: rating(preRevealSurvey.confidence, "confidence before reveal"), after: rating(postRevealSurvey.initialJudgmentAccuracy, "post-reveal rating of initial accuracy") },
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
    ["Responsibility Shift", metrics.responsibilityShift],
    ["Constraint Recognition Shift", metrics.constraintRecognitionShift],
    ["Protest Legitimacy Shift", metrics.protestLegitimacyShift],
    ["Rule Correction Support Shift", metrics.ruleCorrectionSupportShift],
    ["Redistribution Support Shift", metrics.redistributionSupportShift],
    ["Certainty Correction", metrics.certaintyCorrection],
    ["Information Caution", metrics.informationCaution],
    ["Perspective Change", metrics.perspectiveChange],
    ["Cost burden ratio", metrics.burden],
    ["Care avoidance index", metrics.careAvoidance],
    ["Attribution category shift", `${metrics.attributionCategoryShift.pre} → ${metrics.attributionCategoryShift.post}`],
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-semibold text-ink">{typeof value === "number" ? formatMetric(value) : value}</p>
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
  return context ? `${value} / 7 (${context})` : `${value} / 7`;
}

function formatMetric(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}
