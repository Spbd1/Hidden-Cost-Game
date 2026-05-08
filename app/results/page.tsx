import { PageHeader } from "@/components/PageHeader";
import { ResultsTable } from "@/components/ResultsTable";
import { SiteShell } from "@/components/SiteShell";

export default function ResultsPage() {
  return (
    <SiteShell currentStage="results">
      <PageHeader title="Individual results" description="Review your round-by-round decisions, visible costs, and point changes from the Hidden Cost Game." />
      <ResultsTable />
    </SiteShell>
  );
}
