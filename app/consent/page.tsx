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
          <p>This prototype demonstrates a research flow and local data export. It does not transmit responses to a server, and all prototype data is stored locally in this browser unless you choose to copy or download it.</p>
          <p>The decision game includes incomplete information. Some details are intentionally explained only after the decision task so the study can compare judgments before and after the explanation.</p>
          <p>No direct identifiers are collected. Please do not enter names, contact details, or other identifying information in open text responses.</p>
          <p>Participation is voluntary. You can stop at any time by closing the browser tab, resetting the study session, or choosing not to share the JSON export.</p>
          <p>This is a prototype, not a validated psychological test. Questions are about interpretations of a simplified game and should not be treated as a diagnosis or judgment of character.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Responses are stored in this browser.",
            "The game uses incomplete information until the reveal.",
            "No direct identifiers are collected by the prototype.",
          ].map((item) => (
            <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700">
              {item}
            </div>
          ))}
        </div>
        <StageNavigation currentStage="consent" />
      </Card>
    </SiteShell>
  );
}
