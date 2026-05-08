import { ButtonLink } from "@/components/ButtonLink";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";
import { studyStages } from "@/data/stages";

export default function HomePage() {
  return (
    <SiteShell currentStage="introduction">
      <PageHeader
        title="A short study about judgment when hidden conditions differ."
        description="Hidden Cost Game is a minimal research prototype for studying how people interpret failure, protest, and choice before and after learning that participants faced unequal rules."
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="space-y-6">
          <h2 className="text-2xl font-semibold text-ink">Version-one research flow</h2>
          <p className="leading-7 text-slate-600">
            This skeleton establishes the full route structure, shared layout, and base UI components. Game mechanics, survey scoring, and persistence integrations will be added in a later iteration.
          </p>
          <ButtonLink href="/consent">Begin study</ButtonLink>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-ink">Study stages</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {studyStages.map((stage) => (
              <li key={stage.id} className="rounded-2xl bg-slate-50 p-3">
                <span className="font-semibold text-slate-800">{stage.shortTitle}:</span> {stage.summary}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </SiteShell>
  );
}
