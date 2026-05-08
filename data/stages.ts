import type { StudyStage } from "@/types/research";

export const studyStages: StudyStage[] = [
  {
    id: "introduction",
    title: "Start",
    shortTitle: "01 Start",
    href: "/",
    summary: "Overview of the study experience.",
  },
  {
    id: "consent",
    title: "Consent",
    shortTitle: "02 Consent",
    href: "/consent",
    summary: "Voluntary participation, local storage, incomplete information, and prototype expectations.",
  },
  {
    id: "background",
    title: "Background",
    shortTitle: "03 Background",
    href: "/background",
    summary: "Broad non-identifying context for cautious interpretation.",
  },
  {
    id: "game",
    title: "Task",
    shortTitle: "04 Task",
    href: "/game",
    summary: "Five short healthcare-related decision rounds.",
  },
  {
    id: "visible-results",
    title: "Score table",
    shortTitle: "05 Score table",
    href: "/visible-results",
    summary: "A simple table of visible outcomes.",
  },
  {
    id: "pre-reveal",
    title: "Questions",
    shortTitle: "06 Questions",
    href: "/pre-reveal-survey",
    summary: "Initial interpretation questions based on the visible information.",
  },
  {
    id: "reveal",
    title: "Debrief",
    shortTitle: "07 Debrief",
    href: "/hidden-rule-reveal",
    summary: "Fuller explanation of the scenario and study design.",
  },
  {
    id: "post-reveal",
    title: "Follow-up",
    shortTitle: "08 Follow-up",
    href: "/post-reveal-survey",
    summary: "Follow-up interpretation questions after the debrief.",
  },
  {
    id: "individual-results",
    title: "Summary",
    shortTitle: "09 Summary",
    href: "/individual-results",
    summary: "Individual summary, response patterns, and optional data submission.",
  },
  {
    id: "export",
    title: "Export",
    shortTitle: "10 Export",
    href: "/export",
    summary: "Copy or download the local research export.",
  },
];
