"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { PostRevealSurveyAnswers, ResearchSession } from "@/types/research";

const lowerScoreReasonOptions = [
  "They made poor decisions",
  "They did not try hard enough",
  "They took too many risks",
  "They faced different conditions",
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
        <SingleChoiceQuestion
          legend="1. Now why do you think some players ended with lower scores?"
          name="postLowerScoreReason"
          options={lowerScoreReasonOptions}
          value={answers.lowerScoreReason}
          onChange={(value) => updateAnswer("lowerScoreReason", value)}
        />

        <LikertQuestion
          name="postProtestLegitimacy"
          legend="2. Now, if low-scoring players protested the game, how legitimate would their protest be?"
          leftLabel="Not legitimate at all"
          rightLabel="Completely legitimate"
          value={answers.protestLegitimacy}
          onChange={(value) => updateAnswer("protestLegitimacy", value)}
        />

        <LikertQuestion
          name="postRuleChangeFairness"
          legend="3. Now, would changing the rules to help low-scoring players be fair?"
          leftLabel="Strongly disagree"
          rightLabel="Strongly agree"
          value={answers.ruleChangeFairness}
          onChange={(value) => updateAnswer("ruleChangeFairness", value)}
        />

        <LikertQuestion
          name="postSuccessAttribution"
          legend="4. Now, do you think success in this game was mostly due to individual choices or game conditions?"
          leftLabel="Entirely individual choices"
          rightLabel="Entirely game conditions"
          value={answers.successAttribution}
          onChange={(value) => updateAnswer("successAttribution", value)}
        />

        <LikertQuestion
          name="initialJudgmentAccuracy"
          legend="5. After the reveal, how accurate do you think your initial judgment was?"
          leftLabel="Not accurate at all"
          rightLabel="Very accurate"
          value={answers.initialJudgmentAccuracy}
          onChange={(value) => updateAnswer("initialJudgmentAccuracy", value)}
        />

        <LikertQuestion
          name="viewChange"
          legend="6. Did learning about the unequal conditions change how you view low-scoring players?"
          leftLabel="Did not change at all"
          rightLabel="Changed a lot"
          value={answers.viewChange}
          onChange={(value) => updateAnswer("viewChange", value)}
        />

        <label className="block space-y-3">
          <span className="text-base font-semibold text-ink">7. In one sentence, explain how your view changed after learning the hidden rule.</span>
          <input
            value={answers.viewChangeExplanation}
            onChange={(event) => updateAnswer("viewChangeExplanation", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-ink outline-none transition focus:border-research-500 focus:ring-4 focus:ring-research-100"
            placeholder="Write one sentence..."
          />
        </label>

        {showValidation && !isComplete ? <p className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">Please answer all questions before continuing.</p> : null}

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <button type="submit" className="rounded-full bg-research-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-research-700 focus:outline-none focus:ring-4 focus:ring-research-100">
            Continue to individual results
          </button>
        </div>
      </form>
    </Card>
  );
}

function SingleChoiceQuestion({ legend, name, options, value, onChange }: { legend: string; name: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-semibold text-ink">{legend}</legend>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 transition has-[:checked]:border-research-500 has-[:checked]:bg-research-50">
            <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} className="h-4 w-4 accent-research-600" />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function LikertQuestion({ name, legend, leftLabel, rightLabel, value, onChange }: { name: string; legend: string; leftLabel: string; rightLabel: string; value: number; onChange: (value: number) => void }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-semibold text-ink">{legend}</legend>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4">
        <div className="flex justify-between gap-4 text-xs font-medium uppercase tracking-wide text-slate-500">
          <span>1 = {leftLabel}</span>
          <span className="text-right">5 = {rightLabel}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <label key={rating} className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 transition has-[:checked]:border-research-500 has-[:checked]:bg-research-50 has-[:checked]:text-research-800">
              <input type="radio" name={name} value={rating} checked={value === rating} onChange={() => onChange(rating)} className="h-4 w-4 accent-research-600" />
              <span>{rating}</span>
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
