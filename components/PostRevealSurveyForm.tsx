"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { HelperNote, LikertQuestion, PrimaryButton, SingleChoiceQuestion, TextQuestion } from "@/components/FormControls";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { PostRevealSurveyAnswers, ResearchSession } from "@/types/research";

const lowerScoreReasonOptions = [
  "Their choices during the game",
  "Differences in effort or strategy",
  "Differences in risk exposure",
  "Different cost conditions",
  "I don’t know",
];

const initialAnswers: PostRevealSurveyAnswers = {
  lowerScoreReason: "",
  protestLegitimacy: 0,
  ruleChangeFairness: 0,
  successAttribution: 0,
  initialJudgmentAccuracy: 0,
  viewChange: 0,
  viewChangeExplanation: "",
};

export function PostRevealSurveyForm() {
  const router = useRouter();
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [answers, setAnswers] = useState<PostRevealSurveyAnswers>(initialAnswers);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const storedSession = getStoredSession("post-reveal");
    const nextSession: ResearchSession = {
      ...storedSession,
      currentStage: "post-reveal",
    };

    saveStoredSession(nextSession);
    setSession(nextSession);
    setAnswers(nextSession.postRevealSurvey ?? initialAnswers);
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const updatedSession = { ...session, postRevealSurvey: answers };
    saveStoredSession(updatedSession);
    setSession(updatedSession);
  }, [answers]);

  const isComplete =
    answers.lowerScoreReason.length > 0 &&
    answers.protestLegitimacy > 0 &&
    answers.ruleChangeFairness > 0 &&
    answers.successAttribution > 0 &&
    answers.initialJudgmentAccuracy > 0 &&
    answers.viewChange > 0 &&
    answers.viewChangeExplanation.trim().length > 0;

  function updateAnswer<Key extends keyof PostRevealSurveyAnswers>(key: Key, value: PostRevealSurveyAnswers[Key]) {
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
      currentStage: "results",
      postRevealSurvey: {
        ...answers,
        viewChangeExplanation: answers.viewChangeExplanation.trim(),
      },
    };

    saveStoredSession(updatedSession);
    router.push("/results");
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-8">
        <HelperNote tone="neutral">Please answer after considering the cost rule that was just disclosed. These responses describe interpretations, not personal worth or ability.</HelperNote>

        <SingleChoiceQuestion
          legend="1. After the reveal, what seems most likely to explain why some players ended with lower scores?"
          name="postLowerScoreReason"
          options={lowerScoreReasonOptions}
          value={answers.lowerScoreReason}
          onChange={(value) => updateAnswer("lowerScoreReason", value)}
        />

        <LikertQuestion
          name="postProtestLegitimacy"
          legend="2. After the reveal, if lower-scoring players objected to the game results, how legitimate would that objection seem?"
          leftLabel="Not legitimate at all"
          rightLabel="Completely legitimate"
          value={answers.protestLegitimacy}
          onChange={(value) => updateAnswer("protestLegitimacy", value)}
        />

        <LikertQuestion
          name="postRuleChangeFairness"
          legend="3. After the reveal, would it seem fair to adjust the rules to support lower-scoring players?"
          leftLabel="Strongly disagree"
          rightLabel="Strongly agree"
          value={answers.ruleChangeFairness}
          onChange={(value) => updateAnswer("ruleChangeFairness", value)}
        />

        <LikertQuestion
          name="postSuccessAttribution"
          legend="4. After the reveal, was success mostly due to individual choices or game conditions?"
          leftLabel="Entirely individual choices"
          rightLabel="Entirely game conditions"
          value={answers.successAttribution}
          onChange={(value) => updateAnswer("successAttribution", value)}
        />

        <LikertQuestion
          name="initialJudgmentAccuracy"
          legend="5. How accurate does your initial interpretation now seem?"
          leftLabel="Not accurate at all"
          rightLabel="Very accurate"
          value={answers.initialJudgmentAccuracy}
          onChange={(value) => updateAnswer("initialJudgmentAccuracy", value)}
        />

        <LikertQuestion
          name="viewChange"
          legend="6. How much did learning about unequal cost conditions change your view of lower-scoring players?"
          leftLabel="Did not change at all"
          rightLabel="Changed a lot"
          value={answers.viewChange}
          onChange={(value) => updateAnswer("viewChange", value)}
        />

        <TextQuestion label="7. In one sentence, describe how the reveal affected your interpretation." value={answers.viewChangeExplanation} onChange={(value) => updateAnswer("viewChangeExplanation", value)} />

        {showValidation && !isComplete ? <HelperNote tone="warning">Please answer all questions before continuing. Your draft has been saved in this browser.</HelperNote> : null}

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <PrimaryButton>Continue to individual results</PrimaryButton>
        </div>
      </form>
    </Card>
  );
}
