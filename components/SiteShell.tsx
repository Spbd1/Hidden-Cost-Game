import { ProgressIndicator } from "@/components/ProgressIndicator";
import { ResearchContact } from "@/components/ResearchContact";
import type { StageId } from "@/types/research";

interface SiteShellProps {
  currentStage: StageId;
  children: React.ReactNode;
}

export function SiteShell({ currentStage, children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eff6ff,transparent_34rem)]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <ProgressIndicator currentStage={currentStage} />
        {children}
        <ResearchContact />
      </main>
    </div>
  );
}
