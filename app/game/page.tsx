import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";
import { StageNavigation } from "@/components/StageNavigation";

export default function GamePage() {
  return (
    <SiteShell currentStage="game">
      <PageHeader title="Decision game" description="The future game will show short scenarios where judgments are made before hidden costs and unequal constraints are revealed." />
      <Card className="space-y-4">
        <h2 className="text-2xl font-semibold text-ink">Scenario placeholder</h2>
        <p className="leading-7 text-slate-600">Game logic is intentionally deferred. This card reserves space for scenario text, choices, timers, and response capture.</p>
        <div className="grid gap-3 md:grid-cols-3">
          {["Observed outcome", "Participant judgment", "Confidence rating"].map((label) => (
            <div key={label} className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm font-medium text-slate-500">{label}</div>
          ))}
        </div>
        <StageNavigation currentStage="game" />
      </Card>
    </SiteShell>
  );
}
