"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { HelperNote, LikertQuestion, PrimaryButton, SingleChoiceQuestion, TextQuestion } from "@/components/FormControls";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { PreRevealSurveyAnswers, ResearchSession } from "@/types/research";

const primaryAttributionOptions = [
  "They made less effective decisions during the game",
  "They accepted too much risk",
  "Factors not shown in the score table may have influenced the results",
  "Random variation or luck may have played a role",
  "I do not have enough information to judge",
];

const initialAnswers: PreRevealSurveyAnswers = {
  primaryAttribution: "",
  individualResponsibility: 0,
  constraintSuspicion: 0,
  protestLegitimacy: 0,
  ruleCorrectionSupport: 0,
  redistributionSupport: 0,
  confidence: 0,
  informationSufficiency: 0,
  openExplanation: "",
};

export function PreRevealSurveyForm() {
  const router = useRouter();
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [answers, setAnswers] = useState<PreRevealSurveyAnswers>(initialAnswers);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const storedSession = getStoredSession("pre-reveal");

    if (!storedSession.game?.completedAt) {
      const gameSession: ResearchSession = { ...storedSession, currentStage: "game" };
      saveStoredSession(gameSession);
      router.replace("/game");
      return;
    }

    const now = new Date().toISOString();
    const nextSession: ResearchSession = {
      ...storedSession,
      currentStage: "pre-reveal",
      preRevealSurveyStartedAt: storedSession.preRevealSurveyStartedAt ?? now,
    };

    saveStoredSession(nextSession);
    setSession(nextSession);
    setAnswers(nextSession.preRevealSurvey ?? initialAnswers);
  }, [router]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const updatedSession = { ...session, preRevealSurvey: answers };
    saveStoredSession(updatedSession);
    setSession(updatedSession);
  }, [answers]);

  const openLength = answers.openExplanation.trim().length;
  const isComplete =
    answers.primaryAttribution.length > 0 &&
    answers.individualResponsibility > 0 &&
    answers.constraintSuspicion > 0 &&
    answers.protestLegitimacy > 0 &&
    answers.ruleCorrectionSupport > 0 &&
    answers.redistributionSupport > 0 &&
    answers.confidence > 0 &&
    answers.informationSufficiency > 0 &&
    openLength >= 10 &&
    openLength <= 500;

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
      preRevealSurveyCompletedAt: new Date().toISOString(),
      preRevealSurvey: {
        ...answers,
        openExplanation: answers.openExplanation.trim(),
      },
    };

    saveStoredSession(updatedSession);
    router.push("/hidden-rule-reveal");
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-8">
        <HelperNote tone="neutral">Please answer based only on the visible score table. Some information may not yet be available, and there are no right or wrong answers.</HelperNote>

        <SingleChoiceQuestion
          legend="1. Based only on the results shown so far, what do you think most likely explains why some players ended with lower scores?"
          name="primaryAttribution"
          options={primaryAttributionOptions}
          value={answers.primaryAttribution}
          onChange={(value) => updateAnswer("primaryAttribution", value)}
        />

        <LikertQuestion name="individualResponsibility" legend="2. How responsible do you think lower-scoring players were for their final scores?" leftLabel="Not responsible at all" rightLabel="Fully responsible" value={answers.individualResponsibility} onChange={(value) => updateAnswer("individualResponsibility", value)} />
        <LikertQuestion name="constraintSuspicion" legend="3. How likely do you think it is that factors not shown in the score table influenced the results?" leftLabel="Very unlikely" rightLabel="Very likely" value={answers.constraintSuspicion} onChange={(value) => updateAnswer("constraintSuspicion", value)} />
        <LikertQuestion name="protestLegitimacy" legend="4. If lower-scoring players objected to the outcome, how legitimate would their objection seem?" leftLabel="Not legitimate at all" rightLabel="Completely legitimate" value={answers.protestLegitimacy} onChange={(value) => updateAnswer("protestLegitimacy", value)} />
        <LikertQuestion name="ruleCorrectionSupport" legend="5. If later information showed that the score table did not tell the full story, would it be fair to reconsider how outcomes are interpreted?" leftLabel="Strongly disagree" rightLabel="Strongly agree" value={answers.ruleCorrectionSupport} onChange={(value) => updateAnswer("ruleCorrectionSupport", value)} />
        <LikertQuestion name="redistributionSupport" legend="6. If later information changed the interpretation of the results, would some form of score adjustment seem fair?" leftLabel="Strongly disagree" rightLabel="Strongly agree" value={answers.redistributionSupport} onChange={(value) => updateAnswer("redistributionSupport", value)} />
        <LikertQuestion name="confidence" legend="7. How confident are you in your interpretation of the score differences?" leftLabel="Not confident at all" rightLabel="Completely confident" value={answers.confidence} onChange={(value) => updateAnswer("confidence", value)} />
        <LikertQuestion name="informationSufficiency" legend="8. How much information do you feel you currently have to judge why players ended with different scores?" leftLabel="Very little information" rightLabel="Enough information" value={answers.informationSufficiency} onChange={(value) => updateAnswer("informationSufficiency", value)} />

        <TextQuestion label="9. In one or two sentences, explain why you think some players fell behind." value={answers.openExplanation} onChange={(value) => updateAnswer("openExplanation", value)} minLength={10} maxLength={500} />

        {showValidation && !isComplete ? <HelperNote tone="warning">Please answer all closed-ended items and write 10–500 characters in the explanation. Your draft has been saved in this browser.</HelperNote> : null}

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <PrimaryButton>Continue to debrief</PrimaryButton>
        </div>
      </form>
    </Card>
  );
}
