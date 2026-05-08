import { PageHeader } from "@/components/PageHeader";
import { PostRevealSurveyForm } from "@/components/PostRevealSurveyForm";
import { SiteShell } from "@/components/SiteShell";

export default function PostRevealSurveyPage() {
  return (
    <SiteShell currentStage="post-reveal">
      <PageHeader title="Post-reveal survey" description="Answer the core interpretation questions again after seeing the hidden cost rule." />
      <PostRevealSurveyForm />
    </SiteShell>
  );
}
