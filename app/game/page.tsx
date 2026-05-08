import { HiddenCostGame } from "@/components/HiddenCostGame";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";

export default function GamePage() {
  return (
    <SiteShell currentStage="game">
      <PageHeader title="Decision task" description="Make five healthcare-related decisions while balancing financial and health points in a simplified points-based scenario." />
      <HiddenCostGame />
    </SiteShell>
  );
}
