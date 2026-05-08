import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";
import { StageNavigation } from "@/components/StageNavigation";

const isServerSubmissionEnabled = process.env.NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION === "true";

export default function ConsentPage() {
  return (
    <SiteShell currentStage="consent">
      <PageHeader title="Informed consent" description="Please review the prototype study conditions before continuing." />
      <Card className="space-y-6">
        <div className="space-y-4 leading-7 text-slate-600">
          <p>This prototype demonstrates a research flow and local data export. No direct identifiers are requested, and you should not enter names, contact details, or other identifying information in open text responses.</p>
          {isServerSubmissionEnabled ? (
            <p>Data remains local in this browser unless you explicitly submit the completed anonymous session. If you submit, the submitted data is stored on the research server. You can stop before submission; once submitted, deletion is not self-service in this prototype unless the researcher implements a deletion process.</p>
          ) : (
            <p>Server submission is disabled in this build. Data remains in this browser only, you can copy or download the JSON export, and no data reaches the researcher automatically.</p>
          )}
          <p>The decision task includes incomplete information. Some scenario details are explained later so the study can compare interpretations made at different points in the experience.</p>
          <p>A debrief occurs before any optional server submission, so you can review the fuller scenario explanation before deciding whether to share the completed anonymous session.</p>
          <p>Participation is voluntary. You can stop at any time by closing the browser tab, resetting the study session, choosing not to share the JSON export, or choosing not to submit to the server when that feature is available.</p>
          <p>This is a prototype, not a validated psychological test. Questions are about interpretations of a simplified game and should not be treated as a diagnosis or judgment of character.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            isServerSubmissionEnabled ? "Responses remain local unless you explicitly submit." : "Responses are stored in this browser only.",
            "The task uses incomplete information until the debrief.",
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
