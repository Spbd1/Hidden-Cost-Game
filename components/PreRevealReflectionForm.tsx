"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { HelperNote, LikertQuestion, PrimaryButton, TextQuestion } from "@/components/FormControls";
import { isPreRevealSurveyComplete } from "@/utils/researchMetrics";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { ResearchSession } from "@/types/research";

export function PreRevealReflectionForm() {
  const router = useRouter();
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [standByInitialInterpretation, setStandByInitialInterpretation] = useState(0);
  const [explanationConfidenceText, setExplanationConfidenceText] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const storedSession = getStoredSession("pre-reveal");

    if (!storedSession.game?.completedAt || !isPreRevealSurveyComplete(storedSession.preRevealSurvey)) {
      const fallbackSession: ResearchSession = {
        ...storedSession,
        currentStage: storedSession.game?.completedAt ? "pre-reveal" : "game",
      };
      saveStoredSession(fallbackSession);
      router.replace(storedSession.game?.completedAt ? "/pre-reveal-survey" : "/game");
      return;
    }

    if (storedSession.revealViewedAt || storedSession.revealTimingCondition?.condition !== "delayed-reveal") {
      saveStoredSession({ ...storedSession, currentStage: "reveal" });
      router.replace("/hidden-rule-reveal");
      return;
    }

    const nextSession: ResearchSession = {
      ...storedSession,
      currentStage: "pre-reveal",
    };

    saveStoredSession(nextSession);
    setSession(nextSession);
    setStandByInitialInterpretation(nextSession.preRevealCommitment?.standByInitialInterpretation ?? 0);
    setExplanationConfidenceText(nextSession.preRevealCommitment?.explanationConfidenceText ?? "");
  }, [router]);

  const trimmedText = explanationConfidenceText.trim();
  const isComplete = standByInitialInterpretation > 0 && trimmedText.length <= 500;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowValidation(true);

    if (!session || !isComplete) {
      return;
    }

    const updatedSession: ResearchSession = {
      ...session,
      currentStage: "reveal",
      preRevealCommitment: {
        standByInitialInterpretation,
        ...(trimmedText ? { explanationConfidenceText: trimmedText } : {}),
        completedAt: new Date().toISOString(),
      },
    };

    saveStoredSession(updatedSession);
    router.push("/hidden-rule-reveal");
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-8">
        <HelperNote tone="neutral">Before the next part, please briefly reflect on your interpretation of the visible results.</HelperNote>

        <LikertQuestion
          name="standByInitialInterpretation"
          legend="How willing are you to stand by your current interpretation of why some players ended with lower scores?"
          leftLabel="Not willing at all"
          rightLabel="Completely willing"
          value={standByInitialInterpretation}
          onChange={setStandByInitialInterpretation}
        />

        <TextQuestion
          label="If you want, briefly explain what makes you more or less confident in your interpretation."
          value={explanationConfidenceText}
          onChange={setExplanationConfidenceText}
          placeholder="Optional"
          maxLength={500}
        />

        {showValidation && !isComplete ? <HelperNote tone="warning">Please select a response from 1–7 before continuing.</HelperNote> : null}

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <PrimaryButton>Continue</PrimaryButton>
        </div>
      </form>
    </Card>
  );
}
