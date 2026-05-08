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
npm run lint
npm run build
```

## Server testing

Local production test:

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run start
```

Then open:

```text
http://localhost:3000
```

VPS / Node server notes:

- Requires Node 20+.
- Run `npm ci` if a `package-lock.json` exists; otherwise run `npm install`.
- Run `npm run build` before starting the production server.
- Start with `npm run start`.
- Set `PORT` if needed, for example `PORT=3000 npm run start`.
- Use a reverse proxy such as Nginx or Caddy if exposing publicly.
- No database is required for this prototype.
- Data is local to the user’s browser.

Docker server test:

```bash
docker build -t hidden-cost-game .
docker run --rm -p 3000:3000 hidden-cost-game
```

## Study flow

1. **Introduction** — explains the prototype and study sequence.
2. **Consent** — summarizes voluntary participation, local-only storage, incomplete information, and prototype limitations.
3. **Background** — collects broad, non-identifying context, including optional baseline exposure and policy-preference items.
4. **Decision game** — asks participants to make five healthcare-related choices.
5. **Visible results** (`/visible-results`) — shows only a score table before the hidden rule is disclosed.
6. **Pre-reveal survey** — records interpretation of visible score differences without revealing the hidden cost manipulation.
7. **Hidden rule reveal** — explains that treatment costs differed by hidden profile and that the purpose is to study judgment under incomplete information.
8. **Post-reveal survey** — records parallel, reveal-aware interpretation questions after disclosure.
9. **Individual results** (`/individual-results`) — summarizes game outcomes, judgment changes, computed metrics, participant-facing interpretation, and JSON export.
10. **Export** — provides copyable and downloadable JSON.

Legacy `/results` visits are redirected in the browser: completed post-reveal sessions go to `/individual-results`; otherwise they go to `/visible-results`.

Progress is stored in `localStorage` under `hidden-cost-game-session`, so refreshing the page should restore the current session as much as the browser allows. The export panel includes a **Reset study session** button that clears local progress after confirmation.

Expected route sequence for server testing:

```text
/ -> /consent -> /background -> /game -> /visible-results -> /pre-reveal-survey -> /hidden-rule-reveal -> /post-reveal-survey -> /individual-results -> /export
```

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

## Survey design

The pre-reveal survey separates attribution, responsibility, constraint suspicion, protest legitimacy, rule correction, redistribution, confidence, information sufficiency, and a short open explanation. The post-reveal survey uses parallel reveal-aware items, including perceived structural impact, initial judgment accuracy, perspective change, and a short open revision.

All Likert items use 1–7 scales. Closed-ended survey items are required, and open text responses require 10–500 characters. Survey drafts autosave to browser `localStorage`.

## What data is collected

The prototype stores data locally in the browser. The JSON export can include:

- Session metadata: session ID, session creation time, export time, `exportVersion`, and `schemaVersion`.
- Stage timestamps: `preRevealSurveyStartedAt`, `preRevealSurveyCompletedAt`, `revealViewedAt`, `postRevealSurveyStartedAt`, and `postRevealSurveyCompletedAt`.
- Participant background: age group, gender, subjective economic status, medical-cost pressure, healthcare coverage, special organizational coverage, inequality-orientation rating, institutional-trust rating, optional prior exposure to unequal systems, and optional baseline support for correcting unequal starting conditions.
- Assigned game profile: displayed profile, hidden profile, and treatment cost multiplier.
- Game summary: final financial score, final health score, treatment choice counts, total treatment cost paid, and total available income.
- Round-level game data: one record per medical event.
- Pre-reveal survey answers using the current field names.
- Post-reveal survey answers using the current field names.
- Computed analytical metrics.
- Completeness flags: `hasParticipantProfile`, `completedGame`, `completedGameRounds`, `hasPreRevealSurvey`, `hasSeenReveal`, `hasPostRevealSurvey`, and `isComplete`.

No backend is configured in this prototype. Data leaves the browser only if a user copies or downloads the export and shares it elsewhere.

## Analytical metrics

The metrics are simple derived values for prototype analysis. They should not be treated as validated psychological measures.

- **Responsibility Shift**: post-reveal responsibility rating minus pre-reveal responsibility rating. Negative values mean responsibility attribution decreased after the reveal.
- **Constraint Recognition Shift**: perceived hidden-cost impact minus pre-reveal constraint suspicion.
- **Protest Legitimacy Shift**: post-reveal protest legitimacy rating minus pre-reveal rating.
- **Rule Correction Support Shift**: post-reveal rule-correction support minus pre-reveal support.
- **Redistribution Support Shift**: post-reveal redistribution support minus pre-reveal support.
- **Certainty Correction**: pre-reveal confidence minus post-reveal rating of the initial judgment’s accuracy.
- **Information Caution**: `8 - informationSufficiency`, where higher values indicate the participant felt they had less information before the reveal.
- **Perspective Change**: post-reveal rating of how much the reveal changed views of lower-scoring players.
- **Cost burden ratio**: total treatment cost paid divided by total available income.
- **Care avoidance index**: skipped treatments plus half of partial treatments.
- **Attribution Category Shift**: pre-reveal primary attribution compared with post-reveal revised primary attribution.

## Ethical and research limitations

This project is a prototype and should be reviewed before use with real participants.

Important limitations:

- The game is simplified and does not model real healthcare systems, insurance designs, illness severity, or household constraints.
- The surveys are not validated scales.
- The hidden-rule structure is a form of incomplete information and would require appropriate ethics review in a real study.
- Local storage is not secure research storage and can be cleared by the browser or accessed by someone using the same device.
- The prototype does not collect consent signatures, researcher contact details, withdrawal workflows, accessibility accommodations, or debriefing materials suitable for a formal study.
- Results should be interpreted as exploratory interaction data, not as evidence about an individual participant's character, politics, empathy, or decision quality.

## Tech stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Browser `localStorage` persistence
