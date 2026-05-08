import { PageHeader } from "@/components/PageHeader";
import { PreRevealSurveyForm } from "@/components/PreRevealSurveyForm";
import { SiteShell } from "@/components/SiteShell";

export default function PreRevealSurveyPage() {
  return (
    <SiteShell currentStage="pre-reveal">
      <PageHeader title="Pre-reveal survey" description="Answer these questions before any hidden rules are disclosed." />
      <PreRevealSurveyForm />
    </SiteShell>
  );
}
