# Data Collection Guide

This document answers the operational question: **How do I actually get the data from participants?**

## End-to-end flow

1. A participant opens the game URL, gives consent, completes the game, and completes the pre/post reveal measures.
2. At the end, the participant can optionally submit an anonymous session export.
3. The browser sends the export JSON to `POST /api/submissions` when server submissions are enabled.
4. The API validates the payload and stores it in the `ResearchSubmission` table in Postgres.
5. The researcher opens `/admin` or uses `curl` with `ADMIN_EXPORT_TOKEN`.
6. The researcher downloads CSV or JSON for analysis.

`POST /api/research-submissions` is an alias for the same submission handler.

## Before collecting real data

Set these values in `.env` and restart the app:

```bash
ENABLE_SERVER_SUBMISSION="true"
NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION="true"
ADMIN_EXPORT_TOKEN="replace-with-a-long-random-secret"
ADMIN_DASHBOARD_PASSWORD="replace-with-a-long-random-password"
APP_BASE_URL="https://your-domain.com"
```

Run migrations before collecting data:

```bash
docker compose exec app npm run db:migrate
```

## Confirm submissions are stored

Health check:

```bash
curl http://127.0.0.1:3000/api/health
```

Admin stats:

```bash
curl -H "Authorization: Bearer $ADMIN_EXPORT_TOKEN" \
  "$APP_BASE_URL/api/admin/stats"
```

The stats response includes `totalSubmissions`, `completedSubmissions`, treatment-condition counts, and averaged computed metrics.

You can also inspect the database directly from Docker:

```bash
docker compose exec postgres psql -U hcg -d hidden_cost_game -c 'SELECT id, "sessionId", "submittedAt", "completedGameRounds" FROM "ResearchSubmission" ORDER BY submittedAt DESC LIMIT 10;'
```

If you changed `POSTGRES_USER` or `POSTGRES_DB`, update the command.

## Export CSV

From a browser, sign in to `/admin` with `ADMIN_DASHBOARD_PASSWORD` and use the CSV download control.

From the command line:

```bash
curl -H "Authorization: Bearer $ADMIN_EXPORT_TOKEN" \
  "$APP_BASE_URL/api/admin/submissions.csv" \
  -o submissions.csv
```

The CSV flattens key fields such as assignment condition, game outcomes, computed metrics, pre/post survey values, and participant background fields.

## Export JSON

Use the built-in script:

```bash
docker compose exec app npm run export:submissions
```

Or use `curl`:

```bash
curl -H "Authorization: Bearer $ADMIN_EXPORT_TOKEN" \
  "$APP_BASE_URL/api/admin/submissions?limit=500" \
  -o submissions.json
```

The JSON export includes database metadata plus each original submission payload. If the response includes `nextCursor`, request the next page with `?cursor=<nextCursor>`.

## Interpret completeness flags

Each stored payload includes a `completeness` object. The most important fields are:

- `isComplete` — `true` means the participant reached the expected complete export state.
- `completedGameRounds` — number of game rounds completed.
- Additional missing-section flags, if present in the payload, identify which survey or game sections were incomplete.

For primary analyses, start with `completeness.isComplete === true`. Keep incomplete submissions for audit and attrition checks unless your study protocol says otherwise.

## Remove test submissions manually

Back up first. Then delete only the rows you have identified as test data.

Create a backup:

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump -U hcg -d hidden_cost_game > backups/before-test-delete-$(date +%Y%m%d-%H%M%S).sql
```

List recent rows:

```bash
docker compose exec postgres psql -U hcg -d hidden_cost_game -c 'SELECT id, "sessionId", "submittedAt" FROM "ResearchSubmission" ORDER BY submittedAt DESC LIMIT 20;'
```

Delete one known test row by id:

```bash
docker compose exec postgres psql -U hcg -d hidden_cost_game -c 'DELETE FROM "ResearchSubmission" WHERE id = '\''paste-test-submission-id-here'\'';'
```

Delete multiple known test rows by id:

```bash
docker compose exec postgres psql -U hcg -d hidden_cost_game -c 'DELETE FROM "ResearchSubmission" WHERE id IN ('\''id-one'\'', '\''id-two'\'');'
```

Avoid broad date-range deletes unless you have already exported and verified the affected rows.

## Backup before deleting anything

Use `pg_dump` before any manual deletion:

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump -U hcg -d hidden_cost_game > backups/hidden_cost_game-$(date +%Y%m%d-%H%M%S).sql
```

Store important backups somewhere other than the VPS, such as encrypted object storage or an institutional backup location.
