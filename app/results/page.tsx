import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";
import { StageNavigation } from "@/components/StageNavigation";

export default function ResultsPage() {
  return (
    <SiteShell currentStage="results">
      <PageHeader title="Individual results" description="A participant-facing summary will eventually compare judgments before and after the reveal." />
      <Card className="space-y-5">
        <h2 className="text-2xl font-semibold text-ink">Results placeholder</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Stages completed", "0 / 9"],
            ["Judgment shift", "Pending"],
            ["Export status", "Local only"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>
        <StageNavigation currentStage="results" />
      </Card>
    </SiteShell>
  );
}
