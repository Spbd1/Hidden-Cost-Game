import { ExportPanel } from "@/components/ExportPanel";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";

export default function SubmissionExportPage() {
  return (
    <SiteShell currentStage="export">
      <PageHeader title="Submission export" description="Review, download, or submit the completed anonymous research export for this browser session." />
      <ExportPanel title="Research submission export" />
    </SiteShell>
  );
}
