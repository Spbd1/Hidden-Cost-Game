# Manual QA Checklist

Use a fresh browser profile or an incognito window unless a step explicitly asks you to keep existing localStorage. Open DevTools > Application > Local Storage for the app origin when verifying saved session fields.

## 1. Fresh participant flow

1. Visit `/`.
   - Expected: Introduction loads without errors and offers a consent/start action.
2. Continue to `/consent` and provide consent.
   - Expected: Progress advances to background; localStorage contains a `hidden-cost-game-session` object with `currentStage` set to `background`.
3. Complete `/background` with valid answers.
   - Expected: App navigates to `/game`; `participantProfile` is saved.
4. Complete every round on `/game`.
   - Expected: App navigates to `/visible-results`; `game.completedAt` is saved and `game.rounds` contains all rounds.
5. Continue to `/pre-reveal-survey`; answer all items with 10-500 characters in the open response.
   - Expected: App either navigates directly to `/hidden-rule-reveal` or, for delayed reveal assignment, to `/pre-reveal-reflection`.
6. If `/pre-reveal-reflection` appears, complete it.
   - Expected: App navigates to `/hidden-rule-reveal`; `preRevealCommitment` is saved.
7. Continue from `/hidden-rule-reveal` to `/post-reveal-survey`.
   - Expected: `revealViewedAt` is saved; hidden rule content displays the assigned profile.
8. Complete `/post-reveal-survey`.
   - Expected: App navigates to `/individual-results`; `postRevealSurveyCompletedAt` is saved.
9. On `/individual-results`, review the export panel.
   - Expected: Completeness banner says export is complete; JSON includes `computedMetrics`, `gameRounds`, `preRevealSurvey`, and `postRevealSurvey`.
10. Visit `/export/submission`.
    - Expected: Submission export page loads, shows the same completed export, and does not 404.

## 2. Back navigation after reveal revision assignment

Run this twice if possible to observe both randomized revision conditions.

1. Complete the flow through `/hidden-rule-reveal`, then navigate back to `/pre-reveal-survey` by browser Back or direct URL.
   - Expected: No earlier page warned the participant that this revision assignment could happen.
2. Inspect localStorage.
   - Expected: `revisionAccess.assignedAfterReveal` is `true`, `revisionAccess.trigger` is `post-reveal-back-navigation`, and `preRevealRevision.attempted` is `true`.
3. If `revisionAccess.condition` is `revision-unlocked`, revise at least one answer and submit.
   - Expected: Inputs are editable; `preRevealSurveyOriginal` preserves the initial answers; `preRevealSurveyRevisedAfterReveal` stores the revised answers; `preRevealRevision.allowed` and `used` are `true`; `revisedAt` is set.
4. If `revisionAccess.condition` is `revision-locked`, try to edit.
   - Expected: Form fields are not shown for editing; page states responses are already recorded; `preRevealRevision.allowed` and `used` are `false`; `blockedAt` is set; original `preRevealSurvey` is unchanged.
5. Continue to `/post-reveal-survey`.
   - Expected: Flow resumes without data loss.

## 3. Replay game

1. From `/individual-results`, choose the optional second playthrough.
   - Expected: `/replay-game` opens with text saying no additional survey questions will be asked.
2. Complete the replay.
   - Expected: App returns to `/individual-results`; `replayGame.completedAt` is saved separately from `game.completedAt`.
3. Compare `game.rounds` and `replayGame.rounds` in localStorage.
   - Expected: Original game rounds remain unchanged; replay choices only appear under `replayGame`.
4. Review export JSON before any server submission.
   - Expected: JSON includes `replayGame`; computed metrics include replay behavior fields such as `replayCompleted` and behavior-change metrics.

## 4. Old or stale localStorage

1. In DevTools, replace the session value with an object missing newer optional fields, for example only `sessionId`, `createdAt`, `currentStage`, `background`, and `responses`.
   - Expected: Reloading `/` or `/export/submission` does not crash; missing optional fields render as absent, blank, or null.
2. Replace `preRevealSurvey` or `postRevealSurvey` with an object missing some fields.
   - Expected: Survey pages load with safe blank/default values instead of throwing an error.
3. Use **Reset study session** from the export panel.
   - Expected: localStorage key is removed and browser returns to `/` with a fresh session on next progress.

## 5. Server submission

These steps require `NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION=true`, server submission enabled, and PostgreSQL configured.

1. Try to submit before completing the full flow.
   - Expected: Submit button is disabled and the UI says to complete the session before submitting.
2. Complete the full flow and submit.
   - Expected: `/api/submissions` returns success; UI displays a submission ID and timestamp; PostgreSQL has a new `researchSubmission` row.
3. Configure an invalid Google Sheets webhook URL or force it to return a non-2xx response, then submit another completed session.
   - Expected: PostgreSQL save still succeeds and the participant sees success; Google Sheets failure only logs a warning.
4. Copy/download the complete export JSON and validate it against the Zod schema with `npm run validate:sample` as a baseline plus any local validation script you use for captured exports.
   - Expected: Complete exports conform to the schema; incomplete local sessions are not accepted by `/api/submissions`.

## 6. Admin dashboard and exports

These steps require `ADMIN_EXPORT_TOKEN` and PostgreSQL data.

1. Visit `/admin`, enter the admin token, and load the dashboard.
   - Expected: Diagnostics, stats, and recent submissions load without crashing.
2. Confirm stats cards render when optional fields such as replay or revision data are missing.
   - Expected: Counts/averages use zero where appropriate; missing optional strings render blank/null rather than throwing.
3. Click **Download JSON**.
   - Expected: A JSON file downloads with recent submissions and payloads.
4. Click **Download CSV**.
   - Expected: CSV downloads; old payloads without optional replay/revision/cost-visibility fields leave those cells blank.
5. Open the CSV.
   - Expected: Rows include both old and new payload shapes without shifted columns or unescaped commas/newlines.
