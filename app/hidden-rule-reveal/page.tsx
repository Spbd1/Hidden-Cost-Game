import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";
import { StageNavigation } from "@/components/StageNavigation";

export default function HiddenRuleRevealPage() {
  return (
    <SiteShell currentStage="reveal">
      <PageHeader title="Hidden rule reveal" description="This page will explain the unequal constraints that were not visible during the initial judgment task." />
      <Card className="space-y-5">
        <h2 className="text-2xl font-semibold text-ink">Research debrief placeholder</h2>
        <p className="leading-7 text-slate-600">In the complete version, this section will disclose the hidden rule, describe why it matters for interpretation, and prepare the participant for post-reveal reflection.</p>
        <blockquote className="rounded-2xl bg-research-50 p-5 text-research-900">What looked like a simple choice may have been shaped by costs that were not equally distributed.</blockquote>
        <StageNavigation currentStage="reveal" />
      </Card>
    </SiteShell>
  );
}
