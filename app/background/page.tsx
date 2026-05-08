import { PageHeader } from "@/components/PageHeader";
import { ParticipantBackgroundForm } from "@/components/ParticipantBackgroundForm";
import { SiteShell } from "@/components/SiteShell";

export default function BackgroundPage() {
  return (
    <SiteShell currentStage="background">
      <PageHeader title="Participant background" description="Share a small amount of non-identifying context before the decision game begins." />
      <ParticipantBackgroundForm />
    </SiteShell>
  );
}
