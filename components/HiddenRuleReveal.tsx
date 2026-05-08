"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { Card } from "@/components/Card";
import { hiddenCostProfiles } from "@/utils/game";
import { isPreRevealSurveyComplete } from "@/utils/researchMetrics";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { HiddenCostGameState, ResearchSession } from "@/types/research";

export function HiddenRuleReveal() {
  const router = useRouter();
  const [game, setGame] = useState<HiddenCostGameState | null>(null);

  useEffect(() => {
    const storedSession = getStoredSession("reveal");

    if (!isPreRevealSurveyComplete(storedSession.preRevealSurvey)) {
      saveStoredSession({ ...storedSession, currentStage: storedSession.game?.completedAt ? "pre-reveal" : "game" });
      router.replace(storedSession.game?.completedAt ? "/pre-reveal-survey" : "/game");
      return;
    }

    const nextSession: ResearchSession = {
      ...storedSession,
      currentStage: "reveal",
      revealViewedAt: storedSession.revealViewedAt ?? new Date().toISOString(),
    };

    saveStoredSession(nextSession);
    setGame(nextSession.game ?? null);
  }, [router]);

  if (!game) {
    return (
      <Card className="space-y-5">
        <h2 className="text-2xl font-semibold text-ink">No assigned profile yet</h2>
        <p className="leading-7 text-slate-600">Play the decision game first so this page can reveal the hidden profile assigned for your run.</p>
        <ButtonLink href="/game">Go to game</ButtonLink>
      </Card>
    );
  }

  return (
    <Card className="space-y-8">
      <div className="space-y-5 rounded-3xl bg-slate-50 p-6 text-lg leading-8 text-slate-700">
        <p>The hidden rule was used to study judgment under incomplete information. Until now, the visible results did not show whether all players faced the same cost conditions.</p>
        <p>
          Players assigned to high coverage paid about <strong className="font-semibold text-ink">30% of treatment costs</strong>.
          <br />
          Players assigned to low coverage paid the <strong className="font-semibold text-ink">full cost of treatment</strong>.
        </p>
        <p>This means two players could choose care for the same medical event while facing different financial pressure. The aim is not to evaluate whether any participant is fair, unfair, good, or bad; responses should be interpreted cautiously.</p>
        <p>If you later choose to submit this anonymous session, the submitted data should be treated as exploratory prototype data rather than as a definitive measurement of you or anyone else.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {hiddenCostProfiles.map((profile) => {
          const isAssignedProfile = profile.displayedProfile === game.displayedProfile;

          return (
            <div key={profile.displayedProfile} className={`rounded-3xl border p-5 ${isAssignedProfile ? "border-research-500 bg-research-50 shadow-card" : "border-slate-200 bg-white"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{profile.displayedProfile}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">{profile.hiddenProfile}</h2>
                </div>
                {isAssignedProfile ? <span className="rounded-full bg-research-600 px-3 py-1 text-xs font-semibold text-white">Your profile</span> : null}
              </div>
              <p className="mt-5 text-sm font-medium text-slate-600">Treatment cost multiplier</p>
              <p className="mt-1 text-4xl font-bold text-research-700">{profile.treatmentCostMultiplier.toFixed(1)}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Assigned hidden profile in this run</p>
        <p className="mt-3 text-2xl font-semibold text-ink">
          {game.displayedProfile} = {game.hiddenProfile} = cost multiplier {game.treatmentCostMultiplier.toFixed(1)}
        </p>
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <ButtonLink href="/post-reveal-survey">Continue to post-reveal survey</ButtonLink>
      </div>
    </Card>
  );
}
