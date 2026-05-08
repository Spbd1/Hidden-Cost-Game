import { PageHeader } from "@/components/PageHeader";
import { PlaceholderForm } from "@/components/PlaceholderForm";
import { SiteShell } from "@/components/SiteShell";
import { StageNavigation } from "@/components/StageNavigation";

export default function BackgroundPage() {
  return (
    <SiteShell currentStage="background">
      <PageHeader title="Participant background" description="Collect basic, optional participant context with a structure that can later connect to typed validation and an API." />
      <PlaceholderForm title="Background fields" description="Inputs are disabled in the skeleton and will be wired to state in the next implementation step." fields={["Age range", "Education", "Country or region", "Prior research participation"]} />
      <StageNavigation currentStage="background" />
    </SiteShell>
  );
}
