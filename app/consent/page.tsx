import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";
import { StageNavigation } from "@/components/StageNavigation";

export default function ConsentPage() {
  return (
    <SiteShell currentStage="consent">
      <PageHeader title="Informed consent" description="Please review the prototype study conditions before continuing." />
      <Card className="space-y-6">
        <div className="space-y-4 leading-7 text-slate-600">
          <p>This prototype demonstrates a research flow and local data export. It does not transmit responses to a server.</p>
          <p>Participation is voluntary. You may stop at any point before sharing or downloading the JSON export.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {["Responses are stored in this browser.", "Questions are about interpretations, not personal worth.", "The hidden rule will be explained before the final survey."].map((item) => (
            <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700">{item}</div>
          ))}
        </div>
        <StageNavigation currentStage="consent" />
      </Card>
    </SiteShell>
  );
}
