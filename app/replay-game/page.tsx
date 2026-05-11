import { HiddenCostGame } from "@/components/HiddenCostGame";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";

export default function ReplayGamePage() {
  return (
    <SiteShell currentStage="individual-results">
      <PageHeader title="Optional replay" description="Play one more decision-only round sequence. No background or survey questions are repeated." />
      <HiddenCostGame mode="replay" />
    </SiteShell>
  );
}
