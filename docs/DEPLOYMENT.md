# Deployment Guide

This guide covers practical VPS deployment for the Hidden Cost Game with Docker Compose or with a native Node/Postgres installation.

## A. VPS assumptions

- Ubuntu server, preferably an LTS release.
- Either:
  - Docker Engine with the Docker Compose plugin installed, or
  - Node 20, npm, and PostgreSQL installed directly on the server.
- A domain name is strongly recommended so participants can use a stable URL.
- HTTPS is strongly recommended. Use Caddy for automatic HTTPS, or Nginx with Certbot/Let's Encrypt.
- Keep Postgres private. Do not expose port `5432` to the public internet.

## Required production environment variables

Start from the example file, then change all secrets before production:

```bash
cp .env.example .env
nano .env
```

At minimum review:

- `APP_BASE_URL` — set this to `https://your-domain.com` in production.
- `ENABLE_SERVER_SUBMISSION` and `NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION` — set both to `true` when you want participant submissions stored on the server.
- `ADMIN_EXPORT_TOKEN` — use a long random value for API exports.
- `ADMIN_DASHBOARD_PASSWORD` — use a long random password for `/admin`.
- `POSTGRES_PASSWORD` — change the local Docker default before real data collection.
- `DATABASE_URL` — for native Node deployments, point this at the local/native Postgres database.

Generate secrets with a command such as:

```bash
openssl rand -base64 32
```

## B. Docker deployment

The Docker setup includes an `app` service and a private `postgres` service with a persistent `postgres_data` volume. The Postgres service has no public `ports:` mapping by default.

```bash
git clone <repo-url> hidden-cost-game
cd hidden-cost-game
cp .env.example .env
nano .env
```

Start the app and database:

```bash
docker compose up --build -d
```

Run database migrations after the containers are up:

```bash
docker compose exec app npm run db:migrate
```

This project does **not** run destructive reset commands at container startup. Migrations are explicit so the app does not silently lose data.

Check logs:

```bash
docker compose logs -f app
```

Check the health endpoint from the VPS:

```bash
curl http://127.0.0.1:3000/api/health
```

Expected output is JSON with `"ok": true`. If server submissions are enabled and the database URL is configured, the response should also show `serverSubmissionEnabled: true` and `databaseConfigured: true`.

## Native Node 20 + Postgres deployment

Install Node 20, npm, and Postgres with your preferred Ubuntu package workflow. Create a Postgres user and database matching your `.env`, for example:

```bash
sudo -u postgres psql
```

```sql
CREATE USER hcg WITH PASSWORD 'replace-with-a-long-random-password';
CREATE DATABASE hidden_cost_game OWNER hcg;
\q
```

Then deploy the app:

```bash
git clone <repo-url> hidden-cost-game
cd hidden-cost-game
cp .env.example .env
nano .env
npm install
npm run db:generate
npm run build
npm run db:migrate
npm run start
```

For production, run the Node process under a supervisor such as systemd or pm2 and place Nginx or Caddy in front of it.

## C. Nginx reverse proxy example

Bind Docker Compose to localhost and proxy public traffic through Nginx:

```nginx
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

After this, add HTTPS with Certbot or your preferred ACME client.

## D. Caddy example

Caddy can manage HTTPS automatically when DNS points to the VPS:

```caddyfile
your-domain.com {
    reverse_proxy localhost:3000
}
```

## E. Firewall

Allow only SSH and web traffic from the public internet:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Do not allow public access to Postgres (`5432`). The Docker Compose file intentionally keeps Postgres private on the Compose network.

## F. Backups

Back up before migrations, updates, or deletion. This example matches the Docker Compose service/user/database defaults:

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump -U hcg -d hidden_cost_game > backups/hidden_cost_game-$(date +%Y%m%d-%H%M%S).sql
```

If you changed `POSTGRES_USER` or `POSTGRES_DB`, update the `pg_dump` command accordingly.

Restore only after verifying you are targeting the correct environment:

```bash
cat backups/hidden_cost_game-YYYYMMDD-HHMMSS.sql | docker compose exec -T postgres psql -U hcg -d hidden_cost_game
```

## G. Updating deployment

```bash
git pull
docker compose up --build -d
docker compose exec app npm run db:migrate
docker compose logs -f app
curl http://127.0.0.1:3000/api/health
```

Run a backup before updating if the database contains real participant submissions.

## H. Rollback notes

- Keep a copy of the previous Git commit SHA before updating: `git rev-parse HEAD`.
- If a new build fails before migrations are run, return to the previous commit and rebuild:

```bash
git checkout <previous-commit-sha>
docker compose up --build -d
```

- Database migrations are harder to roll back than app code. Prisma deploy migrations are intended to move forward. Always back up before running migrations against production data.
- If a migration has already changed production data or schema, restore from a verified backup or create a forward-fix migration rather than running destructive reset commands.

## Maintainer contact

For deployment questions, methodological feedback, or collaboration inquiries, contact Dr. Mohammad Moradi at dr.moradi@gmail.com or https://www.linkedin.com/in/mohammad-moradik/.
