# Hidden Cost Game

Hidden Cost Game is a web-based research prototype for studying how people interpret visible outcomes before and after learning that participants faced unequal hidden cost conditions.

The application is designed for local demonstration and controlled pilot deployment. It includes a participant flow, local JSON export, optional server submission, PostgreSQL storage, protected researcher export endpoints, and a minimal admin dashboard.

## What the project studies

Hidden Cost Game examines judgment under incomplete information in a simplified decision environment. Participants first see outcome differences without knowing that players may have faced different underlying cost conditions; after the reveal, they reconsider their earlier interpretations.

The prototype is intended to support exploratory research questions about:

- **Invisible inequality**: how unobserved differences in cost burden can shape visible outcomes.
- **Decision-making under incomplete information**: how participants make judgments when important contextual information is missing.
- **Attribution of outcomes**: whether lower scores are attributed to decisions, risk acceptance, constraints, luck, or insufficient information.
- **Perceived fairness**: whether outcome differences are judged as fair before and after the hidden rule is disclosed.
- **Legitimacy of objection/protest**: whether objections from lower-scoring players are considered legitimate.
- **Support for rule correction and redistribution**: whether participants support adjusting rules or transferring points when hidden disadvantage is confirmed.
- **Pre/post reveal design**: how interpretations shift between the visible-results stage and the reveal-aware stage.

The language and measures are intentionally neutral. The prototype is not a diagnostic instrument, a persuasion tool, or a validated psychological scale.

## Study flow

The implemented participant route sequence is:

1. **`/` — introduction**: introduces the prototype, the general sequence, and local-first data handling.
2. **`/consent` — consent and incomplete-information notice**: explains voluntary participation, no direct identifiers, browser storage, and that some game information is intentionally withheld until the reveal.
3. **`/background` — non-identifying background variables**: collects broad participant context such as age group, gender, subjective economic status, medical cost pressure, healthcare coverage, and baseline orientation items.
4. **`/game` — five healthcare-related decision rounds**: assigns a visible profile, runs five simplified healthcare decision rounds, and records decisions, costs, scores, health, and timing.
5. **`/visible-results` — score table before reveal**: shows a fictional comparison table and the participant's visible outcome before the hidden cost rule is disclosed.
6. **`/pre-reveal-survey` — initial interpretation**: records initial judgments based only on the visible results table.
7. **`/hidden-rule-reveal` — hidden cost rule disclosed**: explains that the visible profile corresponded to unequal treatment-cost conditions.
8. **`/post-reveal-survey` — revised interpretation**: records parallel judgments after the hidden cost condition is known.
9. **`/individual-results` — summary, metrics, optional server submission**: summarizes the participant's game outcome, survey shifts, computed metrics, local JSON export, and optional server submission when enabled.
10. **`/export` — JSON export and submission status**: provides copy/download controls for the JSON export, reset controls, and optional server submission status.
11. **`/admin` — protected researcher dashboard, not part of participant flow**: lets researchers enter an export token to view server-submitted data summaries and download JSON/CSV.

There is also a legacy **`/results`** route that redirects in the browser to `/individual-results` for sessions with a completed post-reveal survey, or to `/visible-results` otherwise.

<img width="812" height="896" alt="image" src="https://github.com/user-attachments/assets/054f2c36-b9a6-4109-9cc0-a656081b0577" />


## Current implementation

The current implementation uses:

- **Next.js 14 App Router** for pages and API routes.
- **React 18** and **TypeScript** for the participant and admin interfaces.
- **Tailwind CSS** for styling.
- **Browser `localStorage` persistence** under `hidden-cost-game-session` for participant progress and local exports.
- **Optional server submission** through `POST /api/submissions`; `POST /api/research-submissions` is an alias.
- **PostgreSQL + Prisma** for pilot-mode server storage.
- **JSON and CSV export** through protected admin endpoints.
- **Simple protected admin dashboard** at `/admin` using bearer-token-style access with `ADMIN_EXPORT_TOKEN`.
- **Security headers** configured in `next.config.mjs`, including CSP, frame denial, content-type protection, referrer policy, and a restrictive permissions policy.

## Local setup

### Required tools

- **Node.js 22 LTS**. The repository includes `.nvmrc`, so users of `nvm` can run `nvm use` from the project root.
- **npm**. Use the committed `package-lock.json` with `npm ci` for reproducible installs on fresh clones and CI.
- **PostgreSQL** only when using server submission or admin exports. Local demo mode can run without a database while server submission is disabled.

### Clone repository

```bash
git clone https://github.com/Spbd1/Hidden-Cost-Game.git
cd Hidden-Cost-Game
nvm use # optional, if you use nvm
```

### Install dependencies

```bash
npm ci
```

Use `npm install` only when intentionally updating dependencies or regenerating `package-lock.json`.

### Configure environment

```bash
cp .env.example .env
```

Edit `.env` before enabling server features:

- Set `DATABASE_URL` to your PostgreSQL connection string when using server submission/admin exports.
- Keep `ENABLE_SERVER_SUBMISSION="false"` and `NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION="false"` for browser-only local demo mode.
- Set a long random `ADMIN_EXPORT_TOKEN` before exposing admin routes.
- Do not commit `.env` or real secrets.

### Generate Prisma client

```bash
npm run db:generate
# equivalent: npx prisma generate
```

### Run database migration

For local development databases:

```bash
npm run db:dev
# equivalent: npx prisma migrate dev
```

For production or CI/CD deployment databases:

```bash
npm run db:migrate
# equivalent: npx prisma migrate deploy
```

These scripts wrap `npx prisma migrate dev` and `npx prisma migrate deploy`, respectively.

### Start dev server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Local demo mode works without a database when server submission is disabled. In that mode, participant progress remains in the browser and completed sessions can still be copied or downloaded as JSON.

### Build production bundle

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

Then open:

```text
http://localhost:3000
```

`npm run dev` starts the hot-reloading development server. `npm run build` compiles the production bundle and catches build-time TypeScript, Next.js, and bundling issues that may not appear during development.

## Environment variables

Start from `.env.example` for local or server configuration.

| Variable | Required? | Example | Used by | Description |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Required for server submission and admin exports | `postgresql://hcg:password@localhost:5432/hidden_cost_game?schema=public` | Prisma, submission API, admin API | PostgreSQL connection string. Local demo mode can run without it if server submission is disabled. |
| `APP_BASE_URL` | Recommended for deployment and export scripts | `https://your-domain.com` | Export script, admin dashboard curl examples | Base URL for deployed app and command-line export helper. |
| `ENABLE_SERVER_SUBMISSION` | Required to store participant submissions | `true` | Server API | Server-side gate for `POST /api/submissions`. If not `true`, server submission returns disabled. |
| `NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION` | Required to show participant submission UI | `true` | Browser UI | Build-time public flag. Controls whether participants see the optional server submission panel. Set it to `true` only when the server endpoint and database are ready. |
| `ADMIN_EXPORT_TOKEN` | Required for admin dashboard/API | `replace-with-a-long-random-secret` | `/admin`, `/api/admin/*` | Bearer token used to fetch stats and exports. Keep secret and rotate if exposed. |
| `SUBMISSION_RATE_LIMIT_WINDOW_MS` | Optional | `60000` | Submission API | In-memory rate-limit window for submission attempts. Defaults to 60000 ms. |
| `SUBMISSION_RATE_LIMIT_MAX` | Optional | `20` | Submission API | Maximum submissions per client key per window. Defaults to 20. |
| `MAX_SUBMISSION_BODY_BYTES` | Optional | `250000` | Submission API | Maximum accepted submission body size. Defaults to 250000 bytes. |
| `CONSENT_VERSION` | Optional server metadata fallback | `pilot-consent-v1` | Submission API | Stored as a fallback if a submitted payload lacks `consentVersion`. The client export currently uses the version constant in `utils/researchMetrics.ts`. |
| `SCHEMA_VERSION` | Present in `.env.example`; not currently read by app code | `research-export-v1` | Deployment convention only | Reserved/configuration note for schema versioning. The client export currently uses the schema version constant in `utils/researchMetrics.ts`. |

For Docker Compose, `.env.example` also includes `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` for the bundled PostgreSQL service.

## Server pilot mode with Docker

The Docker Compose setup runs the Next.js app and a private PostgreSQL service. Postgres is not exposed with a public host port by default.

```bash
cp .env.example .env
# edit .env
# at minimum, change secrets and set APP_BASE_URL for deployment
docker compose up --build -d
docker compose exec app npm run db:migrate
curl http://localhost:3000/api/health
```

For data collection, set both submission flags before building/restarting:

```bash
ENABLE_SERVER_SUBMISSION="true"
NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION="true"
```

Use a reverse proxy such as Caddy or Nginx in front of the app for public deployments, and enable HTTPS before collecting pilot data.

## Server pilot mode without Docker

Requirements:

- Node.js 22 LTS
- npm
- PostgreSQL
- A configured `DATABASE_URL`
- A private `.env` with deployment secrets

Typical setup:

```bash
npm ci
npm run db:generate
npm run db:migrate # runs npx prisma migrate deploy
npm run build
npm run start
```

A PM2 example:

```bash
npm install -g pm2
pm2 start npm --name hidden-cost-game -- start
pm2 save
```

In production, place the Node process behind HTTPS with a reverse proxy and keep PostgreSQL private to the server or private network.

## How data collection works

Data collection is local-first and only reaches the researcher after an explicit optional submission step:

```text
Participant browser
→ localStorage
→ optional POST /api/submissions
→ PostgreSQL
→ /admin dashboard or admin CSV/JSON endpoints
```

Important operational details:

- Participant progress is saved in browser `localStorage` as the session proceeds.
- Data does not reach the researcher unless server submission is enabled and the participant clicks submit.
- Server submission requires both the server flag (`ENABLE_SERVER_SUBMISSION=true`) and the browser UI flag (`NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION=true`).
- No direct identifiers are requested in the participant flow.
- Participants are instructed not to enter names, contact details, or other identifying information in open text responses.
- The research payload does not store IP addresses.
- The server stores a hashed user-agent value as operational metadata, not in the research payload.
- Researchers can download collected rows as JSON or CSV from `/admin` or from the protected admin API endpoints.

## Admin dashboard

The dashboard is available at:

```text
/admin
```

It:

- Requires `ADMIN_EXPORT_TOKEN`; the researcher enters the token in the browser.
- Shows total submissions, completed submissions, first/last submission timestamps, and high/low coverage counts.
- Shows average computed metrics for submitted rows.
- Shows recent submissions sorted newest first.
- Downloads JSON and CSV from the browser.
- Stores the entered token in `sessionStorage` by default; the optional “remember” checkbox stores it in browser `localStorage`.

The dashboard is intentionally not a full authentication system. Use it only over HTTPS. For stronger protection, put `/admin` and `/api/admin/*` behind reverse proxy basic auth, an allowlist, institutional SSO, or a VPN.

## Exporting collected data

### Browser export

1. Open `/admin` on the deployed site.
2. Enter `ADMIN_EXPORT_TOKEN`.
3. Click **Download CSV** or **Download JSON**.

### Curl export from a deployed server

JSON:

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_EXPORT_TOKEN" \
  "https://your-domain.com/api/admin/submissions?limit=100" \
  -o submissions.json
```

CSV:

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_EXPORT_TOKEN" \
  "https://your-domain.com/api/admin/submissions.csv" \
  -o submissions.csv
```

### Curl export from localhost

JSON:

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_EXPORT_TOKEN" \
  "http://localhost:3000/api/admin/submissions?limit=100" \
  -o submissions.json
```

CSV:

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_EXPORT_TOKEN" \
  "http://localhost:3000/api/admin/submissions.csv" \
  -o submissions.csv
```

### Scripted JSON export

The `export:submissions` script saves a JSON file under `exports/` using `APP_BASE_URL` and `ADMIN_EXPORT_TOKEN`:

```bash
APP_BASE_URL="https://your-domain.com" ADMIN_EXPORT_TOKEN="YOUR_ADMIN_EXPORT_TOKEN" npm run export:submissions
```

The JSON endpoint is paginated and supports `limit` up to 500 plus `cursor` for additional pages. The CSV endpoint exports all rows available to the admin token.

## Data schema

The database stores each submitted session in the `ResearchSubmission` table. The full research export is stored as a JSON payload, while selected relational columns are stored for indexing, filtering, and export metadata.

Stored relational fields include:

- `id`
- `sessionId`
- `schemaVersion`
- `exportVersion`
- `consentVersion`
- `assignedDisplayedProfile`
- `assignedHiddenProfile`
- `completedGameRounds`
- `submittedAt`
- `payload`
- `appVersion`
- `userAgentHash`
- `createdAt`

The full JSON research export includes:

- `participantProfile`
- `assignedProfile`
- `gameSummary`
- `gameRounds`
- `preRevealSurvey`
- `postRevealSurvey`
- `computedMetrics`
- `completeness`
- `consentVersion`
- `schemaVersion`
- session and timestamp fields
- optional server submission status metadata

CSV export flattens core fields for analysis, including assignment condition, final scores, treatment-choice counts, computed metrics, survey responses, open-text responses, and participant background variables.

## Survey measures

All main Likert items use 1–7 response scales. Open text fields require 10–500 characters. These are prototype measures, not validated scales.

Implemented measures include:

- **Primary attribution**: the participant's initial explanation for lower scores based only on visible results.
- **Individual responsibility**: perceived responsibility of lower-scoring players.
- **Constraint suspicion**: pre-reveal expectation that players may have faced different constraints.
- **Protest/objecting legitimacy**: perceived legitimacy of objections by lower-scoring players.
- **Rule correction support**: support for adjusting rules or scoring when hidden constraints are present.
- **Redistribution support**: support for transferring points from higher-scoring to lower-scoring players under confirmed hidden disadvantage.
- **Confidence**: confidence in the initial interpretation.
- **Information sufficiency**: perceived adequacy of available information before the reveal.
- **Structural impact**: post-reveal perceived effect of the hidden cost difference.
- **Perspective change**: post-reveal reported change in views of lower-scoring players.
- **Remembered initial judgment**: post-reveal memory of the participant's pre-reveal attribution, responsibility rating, constraint-suspicion rating, and confidence in that memory.

## Computed metrics

Computed metrics are derived from game and survey responses for prototype analysis:

- **`responsibilityShift`**: post-reveal individual responsibility minus pre-reveal individual responsibility.
- **`constraintRecognitionShift`**: post-reveal structural impact minus pre-reveal constraint suspicion.
- **`protestLegitimacyShift`**: post-reveal protest legitimacy minus pre-reveal protest legitimacy.
- **`ruleCorrectionSupportShift`**: post-reveal rule-correction support minus pre-reveal rule-correction support.
- **`redistributionSupportShift`**: post-reveal redistribution support minus pre-reveal redistribution support.
- **`certaintyCorrection`**: pre-reveal confidence minus post-reveal rating of initial judgment accuracy.
- **`informationCaution`**: `8 - informationSufficiency`; higher values indicate less felt information before the reveal.
- **`perspectiveChange`**: post-reveal rating of how much the reveal changed views of lower-scoring players.
- **`burden`**: total treatment cost paid divided by total available income.
- **`careAvoidance`**: skipped treatments plus half of partial treatments.
- **`attributionCategoryShift`**: pre-reveal primary attribution compared with post-reveal revised primary attribution.
- **`rememberedResponsibilityError`**: remembered pre-reveal responsibility minus the original pre-reveal responsibility rating.
- **`rememberedConstraintSuspicionError`**: remembered pre-reveal constraint suspicion minus the original pre-reveal constraint-suspicion rating.
- **`rememberedPrimaryAttributionMatchesOriginal`**: whether remembered and original pre-reveal primary attribution match.
- **`memoryConfidence`**: confidence in memory of the initial interpretation.
- **`memoryDistortionMagnitude`**: absolute remembered responsibility error plus absolute remembered constraint-suspicion error.

## Contact and collaboration

This project is maintained by Dr. Mohammad Moradi.

- Email: dr.moradi@gmail.com
- LinkedIn: https://www.linkedin.com/in/mohammad-moradik/

Thoughtful feedback, methodological suggestions, replication ideas, and collaboration inquiries are very welcome. If you are interested in the project or have comments on the study design, please feel free to get in touch.

## Privacy and ethics

This project uses incomplete information and should be reviewed carefully before use with real participants.

Key points:

- No direct identifiers are requested.
- Participants are told not to enter identifying information in open text responses.
- Data remains local-only until optional server submission is enabled and the participant chooses to submit.
- Incomplete information is used during the game and interpretation stage, then revealed before optional server submission.
- Participants can stop before submission; in that case, no data reaches the researcher through the app.
- The prototype is exploratory and not a validated instrument.
- Formal research use may require ethics review, IRB review, consent materials, withdrawal instructions, accessibility review, and data-management planning.
- Browser `localStorage` is not secure research storage and can be cleared or accessed by someone using the same browser profile.
- Server deployment must use HTTPS before collecting pilot data.
- Researchers must protect `ADMIN_EXPORT_TOKEN` and database credentials.
- Deletion is not self-service unless a study-specific deletion workflow is implemented. Manual deletion is possible for known records through database operations.

## Security notes

For pilot deployment:

- Use HTTPS for all participant and admin traffic.
- Keep `.env` private and out of version control.
- Use a long, random `ADMIN_EXPORT_TOKEN`.
- Rotate `ADMIN_EXPORT_TOKEN` immediately if it may have leaked.
- Do not expose PostgreSQL publicly.
- Back up the database before updates, migrations, or deletion.
- Put `/admin` and `/api/admin/*` behind stronger access controls for real deployments.
- Security headers are configured in `next.config.mjs`.
- Submission rate limiting is in-memory and prototype-level; it is not enterprise-grade abuse protection and will reset when the app process restarts.

## Deployment

A production deployment should use the same reproducible setup as a fresh clone or CI runner:

```bash
npm ci
npm run db:generate
npm run db:migrate # runs npx prisma migrate deploy
npm run build
npm run start
```

Required deployment environment variables for server collection are:

- `DATABASE_URL` for PostgreSQL storage and Prisma migrations.
- `ENABLE_SERVER_SUBMISSION=true` so `POST /api/submissions` accepts submissions.
- `NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION=true` before `npm run build` so the participant UI exposes server submission.
- `ADMIN_EXPORT_TOKEN` for `/admin` and `/api/admin/*` exports.
- `APP_BASE_URL` for export helpers and deployment-specific examples.

Optional operational controls are `SUBMISSION_RATE_LIMIT_WINDOW_MS`, `SUBMISSION_RATE_LIMIT_MAX`, and `MAX_SUBMISSION_BODY_BYTES`. They default to safe prototype values when unset, but production deployments should review them for the expected participant volume and hosting topology.

## Deployment checklist

Before collecting pilot data:

- [ ] Set production environment variables in `.env` or hosting configuration.
- [ ] Set `APP_BASE_URL` to the deployed HTTPS origin.
- [ ] Set `ENABLE_SERVER_SUBMISSION=true` on the server.
- [ ] Set `NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION=true` before build so participants see the submission UI.
- [ ] Use a strong `ADMIN_EXPORT_TOKEN`.
- [ ] Install exactly from the lockfile: `npm ci`.
- [ ] Generate Prisma client: `npm run db:generate`.
- [ ] Run database migration: `npm run db:migrate` (`npx prisma migrate deploy`).
- [ ] Run build checks: `npm run typecheck`, `npm run lint`, and `npm run build`.
- [ ] Verify health: `curl http://localhost:3000/api/health` or the equivalent deployed URL.
- [ ] Complete one test participant session.
- [ ] Submit the test session.
- [ ] Verify `/admin` stats show the test submission.
- [ ] Export JSON.
- [ ] Export CSV.
- [ ] Delete test submissions if needed and permitted by the study plan.
- [ ] Configure database backups.
- [ ] Configure a reverse proxy.
- [ ] Enable HTTPS.
- [ ] Confirm PostgreSQL is not publicly reachable.

## Troubleshooting

### Dependency installation fails

- Confirm Node.js 22 LTS is active: `node --version`.
- Fresh clones and CI should use `npm ci`, not `npm install`.
- If build works on one machine but not another, remove local install artifacts and reinstall from the lockfile: `rm -rf node_modules && npm ci`.
- Use `npm install` only when intentionally changing dependencies and committing the resulting `package-lock.json`.

### Port 3000 is already in use

Run the app on another port:

```bash
PORT=3001 npm run dev
```

or stop the process currently using port 3000.

### `DATABASE_URL` missing

- Local demo mode can run without `DATABASE_URL` if server submission is disabled.
- Server submission API will not work without `DATABASE_URL`.
- Server submission and admin exports require `DATABASE_URL`.
- For Docker Compose, the app service builds `DATABASE_URL` from `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`.

### Prisma types are missing or Prisma client is not generated

Run:

```bash
npx prisma generate
```

or the equivalent package script:

```bash
npm run db:generate
```

Then restart the app process. This is required on fresh clones before TypeScript can use the generated Prisma client types reliably.

### Migration failed

- Confirm PostgreSQL is running and reachable.
- Confirm `DATABASE_URL` points to the intended database.
- For Docker, verify the database is healthy: `docker compose ps`.
- Re-run: `docker compose exec app npm run db:migrate`.
- Back up before manual repair or production migration changes.

### Admin export returns 401

- Confirm the request includes `Authorization: Bearer YOUR_ADMIN_EXPORT_TOKEN`.
- Confirm the token exactly matches the server's `ADMIN_EXPORT_TOKEN`.
- Restart the app if the environment variable changed.

### Admin dashboard says invalid token

- Re-enter `ADMIN_EXPORT_TOKEN`; the implemented dashboard does not use a separate dashboard password.
- Clear remembered admin token from the dashboard or browser storage if an old token was saved.
- Confirm `/api/admin/stats` works with curl and the same token.

### Server submission button does not appear

- Set `NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION=true` before building the app.
- Rebuild and restart; public `NEXT_PUBLIC_*` values are embedded into the client bundle.
- Also set `ENABLE_SERVER_SUBMISSION=true` so the server accepts submissions.

### Participant submitted but admin dashboard shows zero

- Confirm the submission response showed success.
- Confirm `ENABLE_SERVER_SUBMISSION=true` and `DATABASE_URL` are set on the running server.
- Check `/api/health` for `serverSubmissionEnabled` and `databaseConfigured`.
- Confirm migrations were run.
- Confirm the admin dashboard is pointed at the same deployment/database that received the submission.

### Docker app cannot connect to Postgres

- Start both services: `docker compose up --build -d`.
- Check health and logs: `docker compose ps` and `docker compose logs postgres app`.
- Use the Compose service host (`postgres`) inside Docker, not `localhost`, for app-to-database connections.
- Ensure `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` match the composed `DATABASE_URL`.

### `localStorage` has a stale session

- Use **Reset study session** in the export panel, or clear site data in the browser.
- For manual browser-console cleanup, remove `hidden-cost-game-session` from `localStorage`.

## Development scripts

Scripts currently defined in `package.json`:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Starts the Next.js development server. |
| `npm run build` | Builds the production Next.js app. |
| `npm run start` | Starts the production server after a successful build. |
| `npm run lint` | Runs the Next.js ESLint check. |
| `npm run typecheck` | Runs TypeScript with `tsc --noEmit`. |
| `npm run db:generate` | Generates the Prisma client. |
| `npm run db:dev` | Runs Prisma migrate in development mode. |
| `npm run db:migrate` | Applies existing Prisma migrations in deployment mode. |
| `npm run db:studio` | Opens Prisma Studio for database inspection. |
| `npm run validate:sample` | Validates the sample research export JSON. |
| `npm run export:submissions` | Downloads admin JSON submissions from `APP_BASE_URL` using `ADMIN_EXPORT_TOKEN` and saves them under `exports/`. |

## Limitations

- The decision game is simplified and does not model real healthcare systems, insurance contracts, illness severity, household budgets, or clinical outcomes.
- The survey measures are prototypes and are not validated scales.
- The visible score table is fictional and intended to support the experimental flow.
- The hidden-rule reveal may create demand effects or cue participants toward particular interpretations.
- Online samples may have attention, comprehension, device, and representativeness limitations.
- Results should be interpreted as exploratory prototype data only.
- The app does not currently include a self-service deletion workflow.
- The admin dashboard is intentionally minimal and is not a full authentication or research data-management system.

## License / status

License: MIT. See `LICENSE`.

Project status: Research prototype. Suitable for controlled pilot testing after deployment review.
