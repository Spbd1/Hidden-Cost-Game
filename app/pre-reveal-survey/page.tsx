import { PageHeader } from "@/components/PageHeader";
import { PlaceholderForm } from "@/components/PlaceholderForm";
import { SiteShell } from "@/components/SiteShell";
import { StageNavigation } from "@/components/StageNavigation";

export default function PreRevealSurveyPage() {
  return (
    <SiteShell currentStage="pre-reveal">
      <PageHeader title="Pre-reveal survey" description="Capture participant judgments before disclosing that the game conditions may have been unequal." />
      <PlaceholderForm title="Initial judgment measures" description="Survey controls will be added with typed response models and validation later." fields={["Responsibility rating", "Fairness rating", "Support for protest", "Open explanation"]} />
      <StageNavigation currentStage="pre-reveal" />
    </SiteShell>
  );
}
