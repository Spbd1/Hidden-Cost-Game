import { PageHeader } from "@/components/PageHeader";
import { PostRevealSurveyForm } from "@/components/PostRevealSurveyForm";
import { SiteShell } from "@/components/SiteShell";

export default function PostRevealSurveyPage() {
  return (
    <SiteShell currentStage="post-reveal">
      <PageHeader title="Post-reveal survey" description="Answer the same core questions again now that the hidden cost rule has been disclosed." />
      <PostRevealSurveyForm />
    </SiteShell>
  );
}
