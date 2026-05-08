import type { StudyStage } from "@/types/research";

export const studyStages: StudyStage[] = [
  {
    id: "introduction",
    title: "Landing / Introduction",
    shortTitle: "Intro",
    href: "/",
    summary: "A brief overview of the Hidden Cost Game research experience.",
  },
  {
    id: "consent",
    title: "Informed Consent",
    shortTitle: "Consent",
    href: "/consent",
    summary: "Participant rights, voluntary participation, and study expectations.",
  },
  {
    id: "background",
    title: "Participant Background",
    shortTitle: "Background",
    href: "/background",
    summary: "Light demographic context that can later support research analysis.",
  },
  {
    id: "game",
    title: "Decision Game",
    shortTitle: "Game",
    href: "/game",
    summary: "A placeholder for unequal-condition decision scenarios.",
  },
  {
    id: "pre-reveal",
    title: "Pre-reveal Survey",
    shortTitle: "Pre-survey",
    href: "/pre-reveal-survey",
    summary: "Initial judgments before hidden rules are explained.",
  },
  {
    id: "reveal",
    title: "Hidden Rule Reveal",
    shortTitle: "Reveal",
    href: "/hidden-rule-reveal",
    summary: "Explanation that participants may not have been evaluating equal conditions.",
  },
  {
    id: "post-reveal",
    title: "Post-reveal Survey",
    shortTitle: "Post-survey",
    href: "/post-reveal-survey",
    summary: "Follow-up reflection after the unequal conditions are disclosed.",
  },
  {
    id: "results",
    title: "Individual Results",
    shortTitle: "Results",
    href: "/results",
    summary: "Participant-facing summary of completed stages and response patterns.",
  },
  {
    id: "export",
    title: "Research Data Export",
    shortTitle: "Export",
    href: "/export",
    summary: "Copyable and downloadable JSON for version-one data review.",
  },
];
