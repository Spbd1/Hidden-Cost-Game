import { ProgressIndicator } from "@/components/ProgressIndicator";
import type { StageId } from "@/types/research";

interface SiteShellProps {
  currentStage: StageId;
  children: React.ReactNode;
}

export function SiteShell({ currentStage, children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eff6ff,transparent_34rem)]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <ProgressIndicator currentStage={currentStage} />
        {children}
      </main>
    </div>
  );
}
