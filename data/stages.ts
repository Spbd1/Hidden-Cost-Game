import type { StudyStage } from "@/types/research";

export const studyStages: StudyStage[] = [
  {
    id: "introduction",
    title: "Landing / Introduction",
    shortTitle: "Intro",
    href: "/",
    summary: "A brief overview of the decision-making study.",
  },
  {
    id: "consent",
    title: "Informed Consent",
    shortTitle: "Consent",
    href: "/consent",
    summary: "Voluntary participation, local storage, incomplete information, and prototype expectations.",
  },
  {
    id: "background",
    title: "Participant Background",
    shortTitle: "Background",
    href: "/background",
    summary: "Broad non-identifying context for cautious interpretation.",
  },
  {
    id: "game",
    title: "Decision Game",
    shortTitle: "Game",
    href: "/game",
    summary: "Five healthcare-related decisions under an undisclosed cost profile.",
  },
  {
    id: "visible-results",
    title: "Visible Results",
    shortTitle: "Visible results",
    href: "/visible-results",
    summary: "A score table shown before the hidden rule is explained.",
  },
  {
    id: "pre-reveal",
    title: "Pre-reveal Survey",
    shortTitle: "Pre-survey",
    href: "/pre-reveal-survey",
    summary: "Initial interpretations before unequal conditions are disclosed.",
  },
  {
    id: "reveal",
    title: "Hidden Rule Reveal",
    shortTitle: "Reveal",
    href: "/hidden-rule-reveal",
    summary: "Explanation that visible outcomes may reflect hidden cost rules.",
  },
  {
    id: "post-reveal",
    title: "Post-reveal Survey",
    shortTitle: "Post-survey",
    href: "/post-reveal-survey",
    summary: "Follow-up interpretation after the hidden cost rule is visible.",
  },
  {
    id: "individual-results",
    title: "Individual Results",
    shortTitle: "Individual results",
    href: "/individual-results",
    summary: "A summary of game outcomes, judgment shifts, computed metrics, and interpretation.",
  },
  {
    id: "export",
    title: "Research Data Export",
    shortTitle: "Export",
    href: "/export",
    summary: "Copyable and downloadable JSON for prototype review.",
  },
];
