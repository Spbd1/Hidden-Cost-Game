import { ButtonLink } from "@/components/ButtonLink";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";
import { studyStages } from "@/data/stages";

export default function HomePage() {
  return (
    <SiteShell currentStage="introduction">
      <PageHeader
        title="A short study about decisions and outcome interpretation"
        description="Hidden Cost Game is a research prototype in which participants make a series of simple healthcare-related decisions, review a results table, and answer short interpretation questions."
      />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <Card className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-ink">What you will do</h2>
            <p className="leading-7 text-slate-600">
              You will make several choices in a points-based scenario, review visible outcomes, and answer brief questions about how you interpret those outcomes. Some details about the scenario are explained later as part of the study design.
            </p>
            <p className="leading-7 text-slate-600">
              The study is about how people make and interpret decisions when not all contextual information is available at the beginning. It is not a test of personal knowledge, values, or ability.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {['Local storage only', 'No right answers', 'Short debrief included'].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">{item}</div>
            ))}
          </div>
          <ButtonLink href="/consent" className="w-full sm:w-auto">Begin study</ButtonLink>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-ink">Study stages</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {studyStages.map((stage) => (
              <li key={stage.id} className="rounded-2xl bg-slate-50 p-3 leading-6">
                <span className="font-semibold text-slate-800">{stage.shortTitle}:</span> {stage.summary}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </SiteShell>
  );
}
