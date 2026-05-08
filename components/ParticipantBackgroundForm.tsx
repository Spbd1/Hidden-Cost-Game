"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { ParticipantProfile, ResearchSession } from "@/types/research";

const preferNotToAnswer = "Prefer not to answer";

const ageGroupOptions = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+", preferNotToAnswer];
const genderOptions = ["Woman", "Man", "Non-binary / other", preferNotToAnswer];
const medicalCostPressureOptions = ["Yes, several times", "Yes, once or twice", "No", "Not sure", preferNotToAnswer];
const healthcareCoverageOptions = ["Public / general insurance", "Private / supplementary insurance", "Special organizational coverage", "No insurance", "I don’t know", preferNotToAnswer];
const specialOrganizationalCoverageOptions = ["Yes", "No", "I don’t know", preferNotToAnswer];

const initialProfile: ParticipantProfile = {
  ageGroup: "",
  gender: "",
  subjectiveEconomicStatus: null,
  medicalCostPressure: "",
  healthcareCoverage: "",
  specialOrganizationalCoverage: "",
  inequalityOrientation: null,
  institutionalTrust: null,
};

export function ParticipantBackgroundForm() {
  const router = useRouter();
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [profile, setProfile] = useState<ParticipantProfile>(initialProfile);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const storedSession = getStoredSession("background");
    const nextSession: ResearchSession = {
      ...storedSession,
      currentStage: "background",
    };

    saveStoredSession(nextSession);
    setSession(nextSession);
    setProfile(nextSession.participantProfile ?? initialProfile);
  }, []);

  const isComplete =
    profile.ageGroup.length > 0 &&
    profile.gender.length > 0 &&
    profile.subjectiveEconomicStatus !== null &&
    profile.medicalCostPressure.length > 0 &&
    profile.healthcareCoverage.length > 0 &&
    profile.specialOrganizationalCoverage.length > 0 &&
    profile.inequalityOrientation !== null &&
    profile.institutionalTrust !== null;

  function updateProfile<Key extends keyof ParticipantProfile>(key: Key, value: ParticipantProfile[Key]) {
    setProfile((currentProfile) => ({
      ...currentProfile,
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
      currentStage: "game",
      participantProfile: profile,
    };

    saveStoredSession(updatedSession);
    router.push("/game");
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-2xl bg-research-50 p-5 leading-7 text-research-900">
          These questions help us interpret the results more carefully. They are not intended to identify you. You may choose ‘Prefer not to answer’ where available.
        </div>

        <SingleChoiceQuestion legend="1. Age group" name="ageGroup" options={ageGroupOptions} value={profile.ageGroup} onChange={(value) => updateProfile("ageGroup", value)} />

        <SingleChoiceQuestion legend="2. Gender" name="gender" options={genderOptions} value={profile.gender} onChange={(value) => updateProfile("gender", value)} />

        <LikertQuestionWithPreferNot
          name="subjectiveEconomicStatus"
          legend="3. Compared with people around you, how would you describe your economic situation?"
          leftLabel="Much lower"
          rightLabel="Much higher"
          value={profile.subjectiveEconomicStatus}
          onChange={(value) => updateProfile("subjectiveEconomicStatus", value)}
        />

        <SingleChoiceQuestion
          legend="4. Have medical costs ever caused you to delay, avoid, or reduce treatment?"
          name="medicalCostPressure"
          options={medicalCostPressureOptions}
          value={profile.medicalCostPressure}
          onChange={(value) => updateProfile("medicalCostPressure", value)}
        />

        <SingleChoiceQuestion
          legend="5. Type of healthcare coverage, broadly defined"
          name="healthcareCoverage"
          options={healthcareCoverageOptions}
          value={profile.healthcareCoverage}
          onChange={(value) => updateProfile("healthcareCoverage", value)}
        />

        <SingleChoiceQuestion
          legend="6. Do you or your immediate family use any special organizational healthcare coverage?"
          name="specialOrganizationalCoverage"
          options={specialOrganizationalCoverageOptions}
          value={profile.specialOrganizationalCoverage}
          onChange={(value) => updateProfile("specialOrganizationalCoverage", value)}
        />

        <LikertQuestion
          name="inequalityOrientation"
          legend="7. When someone falls behind in a system, what do you usually think is the main cause?"
          leftLabel="Their individual choices and effort"
          rightLabel="The system’s conditions and rules"
          value={profile.inequalityOrientation}
          onChange={(value) => updateProfile("inequalityOrientation", value)}
        />

        <LikertQuestion
          name="institutionalTrust"
          legend="8. How much do you trust public institutions to apply rules fairly?"
          leftLabel="Do not trust at all"
          rightLabel="Trust completely"
          value={profile.institutionalTrust}
          onChange={(value) => updateProfile("institutionalTrust", value)}
        />

        {showValidation && !isComplete ? <p className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">Please answer each background question before continuing. Use “Prefer not to answer” where available if you would rather skip a question.</p> : null}

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <button type="submit" className="rounded-full bg-research-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-research-700 focus:outline-none focus:ring-4 focus:ring-research-100">
            Continue to game
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

function LikertQuestion({ name, legend, leftLabel, rightLabel, value, onChange }: { name: string; legend: string; leftLabel: string; rightLabel: string; value: number | null; onChange: (value: number) => void }) {
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

function LikertQuestionWithPreferNot({ name, legend, leftLabel, rightLabel, value, onChange }: { name: string; legend: string; leftLabel: string; rightLabel: string; value: number | typeof preferNotToAnswer | null; onChange: (value: number | typeof preferNotToAnswer) => void }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-semibold text-ink">{legend}</legend>
      <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
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
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 transition has-[:checked]:border-research-500 has-[:checked]:bg-research-50">
          <input type="radio" name={name} value={preferNotToAnswer} checked={value === preferNotToAnswer} onChange={() => onChange(preferNotToAnswer)} className="h-4 w-4 accent-research-600" />
          <span>{preferNotToAnswer}</span>
        </label>
      </div>
    </fieldset>
  );
}
