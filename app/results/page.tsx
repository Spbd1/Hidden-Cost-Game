import { PageHeader } from "@/components/PageHeader";
import { ResultsTable } from "@/components/ResultsTable";
import { SiteShell } from "@/components/SiteShell";

export default function ResultsPage() {
  return (
    <SiteShell currentStage="results">
      <PageHeader title="Final results" description="Compare final scores before any remaining game rules are revealed." />
      <ResultsTable />
    </SiteShell>
  );
}
