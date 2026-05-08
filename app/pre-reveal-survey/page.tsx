import { PageHeader } from "@/components/PageHeader";
import { PreRevealSurveyForm } from "@/components/PreRevealSurveyForm";
import { SiteShell } from "@/components/SiteShell";

export default function PreRevealSurveyPage() {
  return (
    <SiteShell currentStage="pre-reveal">
      <PageHeader title="Pre-reveal survey" description="Record your interpretation of the visible results before any hidden cost rule is disclosed." />
      <PreRevealSurveyForm />
    </SiteShell>
  );
}
