import Link from "next/link";
import { studyStages } from "@/data/stages";
import type { StageId } from "@/types/research";

interface ProgressIndicatorProps {
  currentStage: StageId;
}

export function ProgressIndicator({ currentStage }: ProgressIndicatorProps) {
  const currentIndex = studyStages.findIndex((stage) => stage.id === currentStage);

  return (
    <nav aria-label="Study progress" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <ol className="grid gap-3 md:grid-cols-3 lg:grid-cols-9">
        {studyStages.map((stage, index) => {
          const isCurrent = stage.id === currentStage;
          const isComplete = index < currentIndex;

          return (
            <li key={stage.id}>
              <Link
                href={stage.href}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex min-h-20 flex-col rounded-2xl border px-3 py-3 text-xs transition ${
                  isCurrent
                    ? "border-research-600 bg-research-50 text-research-900"
                    : isComplete
                      ? "border-slate-200 bg-slate-50 text-slate-600 hover:border-research-100"
                      : "border-slate-200 bg-white text-slate-500 hover:border-research-100"
                }`}
              >
                <span className="font-semibold">{String(index + 1).padStart(2, "0")}</span>
                <span className="mt-1 font-medium">{stage.shortTitle}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
