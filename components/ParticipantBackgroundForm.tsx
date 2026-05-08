"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { HelperNote, LikertQuestion, PrimaryButton, SingleChoiceQuestion } from "@/components/FormControls";
import { getStoredSession, saveStoredSession } from "@/utils/session";
import type { ParticipantProfile, PreferNotToAnswer, ResearchSession } from "@/types/research";

const preferNotToAnswer: PreferNotToAnswer = "Prefer not to answer";

const ageGroupOptions = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+", preferNotToAnswer];
const genderOptions = ["Woman", "Man", "Non-binary / another description", preferNotToAnswer];
const medicalCostPressureOptions = ["Yes, several times", "Yes, once or twice", "No", "Not sure", preferNotToAnswer];
const healthcareCoverageOptions = ["Public or general insurance", "Private or supplementary insurance", "Special organizational coverage", "No insurance", "I don’t know", preferNotToAnswer];
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

  useEffect(() => {
    if (!session) {
      return;
    }

    const updatedSession = { ...session, participantProfile: profile };
    saveStoredSession(updatedSession);
    setSession(updatedSession);
  }, [profile]);

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
        <HelperNote>
          These questions provide broad context for interpreting prototype results. They are not intended to identify you, and your draft is saved only in this browser.
        </HelperNote>

        <SingleChoiceQuestion legend="1. Age group" name="ageGroup" options={ageGroupOptions} value={profile.ageGroup} onChange={(value) => updateProfile("ageGroup", value)} />

        <SingleChoiceQuestion legend="2. Gender" name="gender" options={genderOptions} value={profile.gender} onChange={(value) => updateProfile("gender", value)} />

        <LikertWithPreferNot
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
          legend="6. Do you or your immediate family use special organizational healthcare coverage?"
          name="specialOrganizationalCoverage"
          options={specialOrganizationalCoverageOptions}
          value={profile.specialOrganizationalCoverage}
          onChange={(value) => updateProfile("specialOrganizationalCoverage", value)}
        />

        <LikertQuestion
          name="inequalityOrientation"
          legend="7. When someone falls behind in a system, what do you usually see as the main cause?"
          leftLabel="Individual choices and effort"
          rightLabel="System conditions and rules"
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

        {showValidation && !isComplete ? <HelperNote tone="warning">Please answer each background question before continuing. Use “Prefer not to answer” where available if you would rather not answer.</HelperNote> : null}

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <PrimaryButton>Continue to game</PrimaryButton>
        </div>
      </form>
    </Card>
  );
}

function LikertWithPreferNot({ name, legend, leftLabel, rightLabel, value, onChange }: { name: string; legend: string; leftLabel: string; rightLabel: string; value: number | PreferNotToAnswer | null; onChange: (value: number | PreferNotToAnswer) => void }) {
  return (
    <div className="space-y-3">
      <LikertQuestion name={name} legend={legend} leftLabel={leftLabel} rightLabel={rightLabel} value={typeof value === "number" ? value : null} onChange={onChange} />
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 transition hover:border-research-200 hover:bg-slate-50 has-[:checked]:border-research-500 has-[:checked]:bg-research-50">
        <input type="radio" name={name} value={preferNotToAnswer} checked={value === preferNotToAnswer} onChange={() => onChange(preferNotToAnswer)} className="h-4 w-4 accent-research-600" />
        <span>{preferNotToAnswer}</span>
      </label>
    </div>
  );
}
