import { Card } from "@/components/Card";
import { ExportPanel } from "@/components/ExportPanel";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";

export default function ExportPage() {
  return (
    <SiteShell currentStage="export">
      <PageHeader title="Research data export" description="Version one supports local JSON review, copying, and download before a backend is introduced." />
      <Card>
        <ExportPanel />
      </Card>
    </SiteShell>
  );
}
