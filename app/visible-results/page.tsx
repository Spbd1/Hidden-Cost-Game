import { PageHeader } from "@/components/PageHeader";
import { ResultsTable } from "@/components/ResultsTable";
import { SiteShell } from "@/components/SiteShell";

export default function VisibleResultsPage() {
  return (
    <SiteShell currentStage="visible-results">
      <PageHeader title="Score table" description="At this stage, you can see the score table. Please answer based only on the information currently available." />
      <ResultsTable mode="visible" />
    </SiteShell>
  );
}
