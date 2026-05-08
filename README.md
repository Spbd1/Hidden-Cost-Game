# Hidden Cost Game

Hidden Cost Game is a small Next.js research prototype about how people interpret visible outcomes when unequal starting conditions are hidden. Participants play a simplified healthcare decision game, answer interpretation questions before and after a cost-rule reveal, and can review or download a local JSON export.

The prototype is designed to be simple, neutral, and participant-safe. It is not a diagnostic instrument, a political persuasion tool, or a validated psychological scale.

## How to run it

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js, usually `http://localhost:3000`.

Useful checks:

```bash
npm run typecheck
npm run build
```

## Study flow

1. **Introduction** — explains the prototype and study sequence.
2. **Consent** — summarizes voluntary participation and local-only storage.
3. **Background** — collects broad, non-identifying context.
4. **Decision game** — asks participants to make five healthcare-related choices.
5. **Visible results** — shows a score table before the hidden rule is disclosed.
6. **Pre-reveal survey** — records interpretation of visible score differences.
7. **Hidden rule reveal** — explains that treatment costs differed by hidden profile.
8. **Post-reveal survey** — repeats the core interpretation questions after disclosure.
9. **Results and export** — summarizes outcomes, computed metrics, and JSON data.

Progress is stored in `localStorage` under `hidden-cost-game-session`, so refreshing the page should restore the current session as much as the browser allows.

## Game logic

Each participant is randomly assigned one displayed profile:

- **Profile A / High coverage**: treatment costs are multiplied by `0.3`.
- **Profile B / Low coverage**: treatment costs are multiplied by `1.0`.

The profile label is visible during the game, but the meaning of the profile is hidden until the reveal page.

The participant starts with:

- `100` financial points
- `100` health points

There are five medical events. Each round adds `20` financial points and then subtracts the cost of the selected option:

- **Full treatment**: pays the full assigned treatment cost and keeps health unchanged.
- **Partial treatment**: pays the partial assigned treatment cost and reduces health by `10`.
- **Skip treatment**: pays `0` and reduces health by `25`.

Every completed round records the displayed profile, hidden profile, base costs, actual costs, selected choice, paid cost, financial score before and after, health before and after, timestamp, and decision time.

## What data is collected

The prototype stores data locally in the browser. The JSON export can include:

- Session metadata: session ID, session creation time, export time, export version.
- Participant background: age group, gender, subjective economic status, medical-cost pressure, healthcare coverage, special organizational coverage, inequality-orientation rating, and institutional-trust rating.
- Assigned game profile: displayed profile, hidden profile, and treatment cost multiplier.
- Game summary: final financial score, final health score, treatment choice counts, total treatment cost paid, and total available income.
- Round-level game data: one record per medical event.
- Pre-reveal survey answers.
- Post-reveal survey answers.
- Computed analytical metrics.
- Completeness flags indicating whether each major section is present.

No backend is configured in this prototype. Data leaves the browser only if a user copies or downloads the export and shares it elsewhere.

## Analytical metrics

The metrics are simple derived values for prototype analysis. They should not be treated as validated psychological measures.

- **Individual Attribution Score (pre/post)**: reverse-coded from the attribution question. Higher values mean the response placed relatively more weight on individual choices.
- **Systemic Attribution Score (pre/post)**: direct score from the attribution question. Higher values mean the response placed relatively more weight on game conditions.
- **Protest Legitimacy Shift**: post-reveal protest legitimacy rating minus pre-reveal rating.
- **Fairness Support Shift**: post-reveal rule-adjustment fairness rating minus pre-reveal rating.
- **Empathy / Perspective Shift**: the participant's post-reveal rating of how much the reveal changed their view.
- **Certainty Correction**: pre-reveal confidence minus post-reveal rating of initial judgment accuracy.
- **Cost burden ratio**: total treatment cost paid divided by total available income.
- **Care avoidance index**: skipped treatments plus half of partial treatments, used as a rough indicator of reduced-care choices.

## Ethical and research limitations

This project is a prototype and should be reviewed before use with real participants.

Important limitations:

- The game is simplified and does not model real healthcare systems, insurance designs, illness severity, or household constraints.
- The surveys are not validated scales.
- The hidden-rule structure may be considered a form of limited disclosure and would require appropriate ethics review in a real study.
- Local storage is not secure research storage and can be cleared by the browser or accessed by someone using the same device.
- The prototype does not collect consent signatures, researcher contact details, withdrawal workflows, accessibility accommodations, or debriefing materials suitable for a formal study.
- Results should be interpreted as exploratory interaction data, not as evidence about an individual participant's character, politics, empathy, or decision quality.

## Tech stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Browser `localStorage` persistence
