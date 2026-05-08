"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { HelperNote, LikertQuestion, PrimaryButton, SingleChoiceQuestion, TextQuestion } from "@/components/FormControls";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { PreRevealSurveyAnswers, ResearchSession } from "@/types/research";

const lowerScoreReasonOptions = [
  "Their choices during the game",
  "Differences in effort or strategy",
  "Differences in risk exposure",
  "Different conditions that may not be visible",
  "I don’t know",
];

const initialAnswers: PreRevealSurveyAnswers = {
  lowerScoreReason: "",
  protestLegitimacy: 0,
  ruleChangeFairness: 0,
  successAttribution: 0,
  judgmentConfidence: 0,
  fellBehindExplanation: "",
};

export function PreRevealSurveyForm() {
  const router = useRouter();
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [answers, setAnswers] = useState<PreRevealSurveyAnswers>(initialAnswers);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const storedSession = getStoredSession("pre-reveal");
    const nextSession: ResearchSession = {
      ...storedSession,
      currentStage: "pre-reveal",
    };

    saveStoredSession(nextSession);
    setSession(nextSession);
    setAnswers(nextSession.preRevealSurvey ?? initialAnswers);
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const updatedSession = { ...session, preRevealSurvey: answers };
    saveStoredSession(updatedSession);
    setSession(updatedSession);
  }, [answers]);

  const isComplete =
    answers.lowerScoreReason.length > 0 &&
    answers.protestLegitimacy > 0 &&
    answers.ruleChangeFairness > 0 &&
    answers.successAttribution > 0 &&
    answers.judgmentConfidence > 0 &&
    answers.fellBehindExplanation.trim().length > 0;

  function updateAnswer<Key extends keyof PreRevealSurveyAnswers>(key: Key, value: PreRevealSurveyAnswers[Key]) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [key]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowValidation(true);

    if (!session || !isComplete) {
      return;
    }

    const updatedSession: ResearchSession = {
      ...session,
      currentStage: "reveal",
      preRevealSurvey: {
        ...answers,
        fellBehindExplanation: answers.fellBehindExplanation.trim(),
      },
    };

    saveStoredSession(updatedSession);
    router.push("/hidden-rule-reveal");
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-8">
        <HelperNote tone="neutral">Please answer based only on the information visible so far. There are no right or wrong answers.</HelperNote>

        <SingleChoiceQuestion
          legend="1. What seems most likely to explain why some players ended with lower scores?"
          name="lowerScoreReason"
          options={lowerScoreReasonOptions}
          value={answers.lowerScoreReason}
          onChange={(value) => updateAnswer("lowerScoreReason", value)}
        />

        <LikertQuestion
          name="protestLegitimacy"
          legend="2. If lower-scoring players objected to the game results, how legitimate would that objection seem?"
          leftLabel="Not legitimate at all"
          rightLabel="Completely legitimate"
          value={answers.protestLegitimacy}
          onChange={(value) => updateAnswer("protestLegitimacy", value)}
        />

        <LikertQuestion
          name="ruleChangeFairness"
          legend="3. Would it seem fair to adjust the rules to support lower-scoring players?"
          leftLabel="Strongly disagree"
          rightLabel="Strongly agree"
          value={answers.ruleChangeFairness}
          onChange={(value) => updateAnswer("ruleChangeFairness", value)}
        />

        <LikertQuestion
          name="successAttribution"
          legend="4. In this game, was success mostly due to individual choices or game conditions?"
          leftLabel="Entirely individual choices"
          rightLabel="Entirely game conditions"
          value={answers.successAttribution}
          onChange={(value) => updateAnswer("successAttribution", value)}
        />

        <LikertQuestion
          name="judgmentConfidence"
          legend="5. How confident are you in your interpretation of the score differences?"
          leftLabel="Not confident at all"
          rightLabel="Completely confident"
          value={answers.judgmentConfidence}
          onChange={(value) => updateAnswer("judgmentConfidence", value)}
        />

        <TextQuestion label="6. In one sentence, describe why some players may have fallen behind." value={answers.fellBehindExplanation} onChange={(value) => updateAnswer("fellBehindExplanation", value)} />

        {showValidation && !isComplete ? <HelperNote tone="warning">Please answer all questions before continuing. Your draft has been saved in this browser.</HelperNote> : null}

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <PrimaryButton>Continue to reveal</PrimaryButton>
        </div>
      </form>
    </Card>
  );
}
