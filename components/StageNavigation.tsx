import { ButtonLink } from "@/components/ButtonLink";
import { studyStages } from "@/data/stages";
import type { StageId } from "@/types/research";

interface StageNavigationProps {
  currentStage: StageId;
}

export function StageNavigation({ currentStage }: StageNavigationProps) {
  const currentIndex = studyStages.findIndex((stage) => stage.id === currentStage);
  const previous = studyStages[currentIndex - 1];
  const next = studyStages[currentIndex + 1];

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
      {previous ? (
        <ButtonLink href={previous.href} variant="secondary">
          Back to {previous.shortTitle}
        </ButtonLink>
      ) : (
        <span />
      )}
      {next ? <ButtonLink href={next.href}>Continue to {next.shortTitle}</ButtonLink> : null}
    </div>
  );
}
