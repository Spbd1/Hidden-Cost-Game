import { PageHeader } from "@/components/PageHeader";
import { PlaceholderForm } from "@/components/PlaceholderForm";
import { SiteShell } from "@/components/SiteShell";
import { StageNavigation } from "@/components/StageNavigation";

export default function PostRevealSurveyPage() {
  return (
    <SiteShell currentStage="post-reveal">
      <PageHeader title="Post-reveal survey" description="Measure whether judgments shift after hidden unequal conditions are disclosed." />
      <PlaceholderForm title="Reflection measures" description="These disabled fields reserve space for post-reveal ratings and open-ended responses." fields={["Updated responsibility rating", "Updated fairness rating", "Empathy rating", "Reflection note"]} />
      <StageNavigation currentStage="post-reveal" />
    </SiteShell>
  );
}
