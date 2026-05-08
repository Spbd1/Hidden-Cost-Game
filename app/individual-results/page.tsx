import { PageHeader } from "@/components/PageHeader";
import { ResultsTable } from "@/components/ResultsTable";
import { SiteShell } from "@/components/SiteShell";

export default function IndividualResultsPage() {
  return (
    <SiteShell currentStage="individual-results">
      <PageHeader title="Individual results" description="Review your game summary, judgment changes, computed metrics, participant-facing interpretation, and JSON export." />
      <ResultsTable mode="individual" />
    </SiteShell>
  );
}
