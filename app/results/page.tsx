import { PageHeader } from "@/components/PageHeader";
import { ResultsTable } from "@/components/ResultsTable";
import { SiteShell } from "@/components/SiteShell";

export default function ResultsPage() {
  return (
    <SiteShell currentStage="results">
      <PageHeader title="Final results" description="Review the participant results for the current stage of the study." />
      <ResultsTable />
    </SiteShell>
  );
}
