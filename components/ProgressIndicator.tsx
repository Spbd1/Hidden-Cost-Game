import Link from "next/link";
import { studyStages } from "@/data/stages";
import type { StageId } from "@/types/research";

interface ProgressIndicatorProps {
  currentStage: StageId;
}

export function ProgressIndicator({ currentStage }: ProgressIndicatorProps) {
  const currentIndex = studyStages.findIndex((stage) => stage.id === currentStage);

  return (
    <nav aria-label="Study progress" className="rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm">
      <ol className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]" role="list">
        {studyStages.map((stage, index) => {
          const isCurrent = stage.id === currentStage;
          const isComplete = index < currentIndex;

          return (
            <li key={stage.id} className="shrink-0">
              <Link
                href={stage.href}
                aria-current={isCurrent ? "step" : undefined}
                title={`${stage.shortTitle}: ${stage.summary}`}
                className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold leading-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-research-600 sm:text-xs ${
                  isCurrent
                    ? "border-research-500 bg-research-50 text-research-800"
                    : isComplete
                      ? "border-slate-200 bg-slate-50 text-slate-600 hover:border-research-200 hover:text-research-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-research-200 hover:text-slate-700"
                }`}
              >
                {stage.shortTitle}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
