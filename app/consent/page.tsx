import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";
import { StageNavigation } from "@/components/StageNavigation";

export default function ConsentPage() {
  return (
    <SiteShell currentStage="consent">
      <PageHeader title="Informed consent" description="This page will present participant rights, study purpose, estimated duration, risks, benefits, and contact details before participation begins." />
      <Card className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Participation is voluntary.",
            "Responses can be stored locally in this prototype.",
            "You may stop at any time before export."
          ].map((item) => (
            <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-700">{item}</div>
          ))}
        </div>
        <StageNavigation currentStage="consent" />
      </Card>
    </SiteShell>
  );
}
