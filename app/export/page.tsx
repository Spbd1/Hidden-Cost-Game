import { Card } from "@/components/Card";
import { ExportPanel } from "@/components/ExportPanel";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";

export default function ExportPage() {
  return (
    <SiteShell currentStage="export">
      <PageHeader title="Research data export" description="Review, copy, or download the local JSON record for this completed prototype session." />
      <Card>
        <ExportPanel />
      </Card>
    </SiteShell>
  );
}
