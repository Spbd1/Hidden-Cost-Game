import { HiddenRuleReveal } from "@/components/HiddenRuleReveal";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";

export default function HiddenRuleRevealPage() {
  return (
    <SiteShell currentStage="reveal">
      <PageHeader title="Hidden rule reveal" description="The cost rule that shaped treatment decisions is now visible." />
      <HiddenRuleReveal />
    </SiteShell>
  );
}
