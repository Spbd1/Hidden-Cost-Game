# Hidden Cost Game

A research-oriented decision-making game prototype about how people judge others' failure, protest, or choices when unequal conditions are hidden.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Local-state-first architecture prepared for future API/database integration

## Version 1 scope

This first implementation includes the full project skeleton, routing, shared layout, progress indicator, and base components. Full game mechanics, survey logic, and persistence will be implemented later.

## Routes

1. `/` — Landing / Introduction
2. `/consent` — Informed Consent
3. `/background` — Participant Background
4. `/game` — Game
5. `/pre-reveal-survey` — Pre-reveal Survey
6. `/hidden-rule-reveal` — Hidden Rule Reveal
7. `/post-reveal-survey` — Post-reveal Survey
8. `/results` — Individual Results
9. `/export` — Research Data Export

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run typecheck
npm run build
```
