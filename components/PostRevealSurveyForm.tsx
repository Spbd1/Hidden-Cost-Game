"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { HelperNote, LikertQuestion, PrimaryButton, SingleChoiceQuestion, TextQuestion } from "@/components/FormControls";
import { assignExplanationFrameCondition, getStoredSession, saveStoredSession } from "@/utils/session";
import type { PostRevealSurveyAnswers, ResearchSession } from "@/types/research";

const rememberedPrimaryAttributionOptions = [
  "They made less effective decisions during the game",
  "They accepted too much risk",
  "Factors not shown in the score table may have influenced the results",
  "Random variation or luck may have played a role",
  "I did not have enough information to judge",
  "I am not sure what I initially thought",
];

const revisedPrimaryAttributionOptions = [
  "Their decisions still seem to be the main explanation",
  "Hidden cost conditions seem to be the main explanation",
  "Both decisions and hidden cost conditions mattered",
  "Random variation or luck may also have mattered",
  "I am still unsure",
];

const explanationFrameQuestionText = {
  "explain-to-self": "In one or two sentences, explain to yourself how the hidden cost rule changed, confirmed, or complicated your interpretation.",
  "explain-to-other": "Imagine explaining this result to another participant who only saw the score table. In one or two sentences, explain how the hidden cost rule changes, confirms, or complicates the interpretation.",
} satisfies Record<NonNullable<ResearchSession["explanationFrameCondition"]>["condition"], string>;

const initialAnswers: PostRevealSurveyAnswers = {
  rememberedPrimaryAttribution: "",
  rememberedIndividualResponsibility: 0,
  rememberedConstraintSuspicion: 0,
  rememberedConfidence: 0,
  revisedPrimaryAttribution: "",
  revisedIndividualResponsibility: 0,
  perceivedStructuralImpact: 0,
  postProtestLegitimacy: 0,
  postRuleCorrectionSupport: 0,
  postRedistributionSupport: 0,
  initialJudgmentAccuracy: 0,
  perspectiveChange: 0,
  openRevision: "",
};

export function PostRevealSurveyForm() {
  const router = useRouter();
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [answers, setAnswers] = useState<PostRevealSurveyAnswers>(initialAnswers);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const storedSession = getStoredSession("post-reveal");

    if (!storedSession.revealViewedAt) {
      const redirectSession: ResearchSession = {
        ...storedSession,
        currentStage: storedSession.preRevealSurveyCompletedAt ? "reveal" : "pre-reveal",
      };
      saveStoredSession(redirectSession);
      router.replace(storedSession.preRevealSurveyCompletedAt ? "/hidden-rule-reveal" : "/pre-reveal-survey");
      return;
    }

    const now = new Date().toISOString();
    const assignedSession = assignExplanationFrameCondition(storedSession);
    const nextSession: ResearchSession = {
      ...assignedSession,
      currentStage: "post-reveal",
      postRevealSurveyStartedAt: assignedSession.postRevealSurveyStartedAt ?? now,
    };

    saveStoredSession(nextSession);
    setSession(nextSession);
    setAnswers({ ...initialAnswers, ...nextSession.postRevealSurvey });
  }, [router]);

  useEffect(() => {
    setSession((currentSession) => {
      if (!currentSession) {
        return currentSession;
      }

      const updatedSession = { ...currentSession, postRevealSurvey: answers };
      saveStoredSession(updatedSession);
      return updatedSession;
    });
  }, [answers]);

  const explanationFrame = session?.explanationFrameCondition?.condition ?? "explain-to-self";
  const openRevisionQuestion = explanationFrameQuestionText[explanationFrame];
  const openLength = answers.openRevision.trim().length;
  const isComplete =
    answers.rememberedPrimaryAttribution.length > 0 &&
    answers.rememberedIndividualResponsibility > 0 &&
    answers.rememberedConstraintSuspicion > 0 &&
    answers.rememberedConfidence > 0 &&
    answers.revisedPrimaryAttribution.length > 0 &&
    answers.revisedIndividualResponsibility > 0 &&
    answers.perceivedStructuralImpact > 0 &&
    answers.postProtestLegitimacy > 0 &&
    answers.postRuleCorrectionSupport > 0 &&
    answers.postRedistributionSupport > 0 &&
    answers.initialJudgmentAccuracy > 0 &&
    answers.perspectiveChange > 0 &&
    openLength >= 10 &&
    openLength <= 500;

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
      currentStage: "individual-results",
      postRevealSurveyCompletedAt: new Date().toISOString(),
      postRevealSurvey: {
        ...answers,
        openRevision: answers.openRevision.trim(),
      },
    };

    saveStoredSession(updatedSession);
    router.push("/individual-results");
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-8">
        <HelperNote tone="neutral">Please answer after considering the cost rule that was just disclosed. These responses describe interpretations, not personal worth, fairness, or character.</HelperNote>

        <SingleChoiceQuestion
          legend="1. Before the hidden rule was revealed, what do you remember thinking was the main reason some players ended with lower scores?"
          name="rememberedPrimaryAttribution"
          options={rememberedPrimaryAttributionOptions}
          value={answers.rememberedPrimaryAttribution}
          onChange={(value) => updateAnswer("rememberedPrimaryAttribution", value)}
        />

        <LikertQuestion name="rememberedIndividualResponsibility" legend="2. Before the reveal, how responsible do you remember thinking lower-scoring players were for their final scores?" leftLabel="Not responsible at all" rightLabel="Fully responsible" value={answers.rememberedIndividualResponsibility} onChange={(value) => updateAnswer("rememberedIndividualResponsibility", value)} />
        <LikertQuestion name="rememberedConstraintSuspicion" legend="3. Before the reveal, how likely do you remember thinking it was that hidden or unshown factors influenced the results?" leftLabel="Very unlikely" rightLabel="Very likely" value={answers.rememberedConstraintSuspicion} onChange={(value) => updateAnswer("rememberedConstraintSuspicion", value)} />
        <LikertQuestion name="rememberedConfidence" legend="4. How confident are you in your memory of your initial interpretation?" leftLabel="Not confident at all" rightLabel="Completely confident" value={answers.rememberedConfidence} onChange={(value) => updateAnswer("rememberedConfidence", value)} />

        <SingleChoiceQuestion
          legend="5. After learning that players faced different cost conditions, what do you now think best explains why some players ended with lower scores?"
          name="revisedPrimaryAttribution"
          options={revisedPrimaryAttributionOptions}
          value={answers.revisedPrimaryAttribution}
          onChange={(value) => updateAnswer("revisedPrimaryAttribution", value)}
        />

        <LikertQuestion name="revisedIndividualResponsibility" legend="6. After the reveal, how responsible do you think lower-scoring players were for their final scores?" leftLabel="Not responsible at all" rightLabel="Fully responsible" value={answers.revisedIndividualResponsibility} onChange={(value) => updateAnswer("revisedIndividualResponsibility", value)} />
        <LikertQuestion name="perceivedStructuralImpact" legend="7. How much do you think the hidden cost difference affected the final scores?" leftLabel="Not at all" rightLabel="A great deal" value={answers.perceivedStructuralImpact} onChange={(value) => updateAnswer("perceivedStructuralImpact", value)} />
        <LikertQuestion name="postProtestLegitimacy" legend="8. After the reveal, if lower-scoring players objected to the outcome, how legitimate would their objection seem?" leftLabel="Not legitimate at all" rightLabel="Completely legitimate" value={answers.postProtestLegitimacy} onChange={(value) => updateAnswer("postProtestLegitimacy", value)} />
        <LikertQuestion name="postRuleCorrectionSupport" legend="9. After the reveal, would it be fair to adjust the rules or scoring system to account for the hidden cost difference?" leftLabel="Strongly disagree" rightLabel="Strongly agree" value={answers.postRuleCorrectionSupport} onChange={(value) => updateAnswer("postRuleCorrectionSupport", value)} />
        <LikertQuestion name="postRedistributionSupport" legend="10. After the reveal, would it be fair to transfer some points from higher-scoring players to lower-scoring players?" leftLabel="Strongly disagree" rightLabel="Strongly agree" value={answers.postRedistributionSupport} onChange={(value) => updateAnswer("postRedistributionSupport", value)} />
        <LikertQuestion name="initialJudgmentAccuracy" legend="11. Looking back, how accurate does your initial interpretation seem now?" leftLabel="Not accurate at all" rightLabel="Very accurate" value={answers.initialJudgmentAccuracy} onChange={(value) => updateAnswer("initialJudgmentAccuracy", value)} />
        <LikertQuestion name="perspectiveChange" legend="12. How much did the reveal change how you view the lower-scoring players?" leftLabel="Did not change at all" rightLabel="Changed a lot" value={answers.perspectiveChange} onChange={(value) => updateAnswer("perspectiveChange", value)} />

        <TextQuestion label={`13. ${openRevisionQuestion}`} value={answers.openRevision} onChange={(value) => updateAnswer("openRevision", value)} minLength={10} maxLength={500} />

        {showValidation && !isComplete ? <HelperNote tone="warning">Please answer all closed-ended items and write 10–500 characters in the revision. Your draft has been saved in this browser.</HelperNote> : null}

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <PrimaryButton>Continue to individual results</PrimaryButton>
        </div>
      </form>
    </Card>
  );
}
