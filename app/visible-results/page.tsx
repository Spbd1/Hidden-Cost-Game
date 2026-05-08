import { PageHeader } from "@/components/PageHeader";
import { ResultsTable } from "@/components/ResultsTable";
import { SiteShell } from "@/components/SiteShell";

export default function VisibleResultsPage() {
  return (
    <SiteShell currentStage="visible-results">
      <PageHeader title="Visible results" description="Review only the score table before the hidden cost rule is disclosed, then continue to the pre-reveal survey." />
      <ResultsTable mode="visible" />
    </SiteShell>
  );
}
