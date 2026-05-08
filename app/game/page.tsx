import { HiddenCostGame } from "@/components/HiddenCostGame";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";

export default function GamePage() {
  return (
    <SiteShell currentStage="game">
      <PageHeader title="Decision game" description="Make five healthcare-related decisions while balancing financial and health points. One cost condition is not disclosed until later." />
      <HiddenCostGame />
    </SiteShell>
  );
}
