import { HiddenCostGame } from "@/components/HiddenCostGame";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";

export default function GamePage() {
  return (
    <SiteShell currentStage="game">
      <PageHeader title="Decision game" description="Play five medical decision rounds while managing financial and health points under a hidden profile." />
      <HiddenCostGame />
    </SiteShell>
  );
}
