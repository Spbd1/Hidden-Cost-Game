import { PageHeader } from "@/components/PageHeader";
import { ParticipantBackgroundForm } from "@/components/ParticipantBackgroundForm";
import { SiteShell } from "@/components/SiteShell";

export default function BackgroundPage() {
  return (
    <SiteShell currentStage="background">
      <PageHeader title="Participant background" description="Share broad, non-identifying context so prototype responses can be interpreted cautiously." />
      <ParticipantBackgroundForm />
    </SiteShell>
  );
}
