import { PageHeader } from "@/components/PageHeader";
import { PreRevealReflectionForm } from "@/components/PreRevealReflectionForm";
import { SiteShell } from "@/components/SiteShell";

export default function PreRevealReflectionPage() {
  return (
    <SiteShell currentStage="pre-reveal">
      <PageHeader title="Brief reflection" description="Reflect on your interpretation of the visible results before continuing." />
      <PreRevealReflectionForm />
    </SiteShell>
  );
}
