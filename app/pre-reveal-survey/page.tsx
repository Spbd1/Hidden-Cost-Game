import { PageHeader } from "@/components/PageHeader";
import { PreRevealSurveyForm } from "@/components/PreRevealSurveyForm";
import { SiteShell } from "@/components/SiteShell";

export default function PreRevealSurveyPage() {
  return (
    <SiteShell currentStage="pre-reveal">
      <PageHeader title="Interpretation questions" description="Record your interpretation of the score table based only on the information currently available." />
      <PreRevealSurveyForm />
    </SiteShell>
  );
}
