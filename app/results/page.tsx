import { PageHeader } from "@/components/PageHeader";
import { ResultsTable } from "@/components/ResultsTable";
import { SiteShell } from "@/components/SiteShell";

export default function ResultsPage() {
  return (
    <SiteShell currentStage="results">
      <PageHeader title="Final results" description="Review the visible score table and, after the reveal, a neutral summary of your response pattern." />
      <ResultsTable />
    </SiteShell>
  );
}
