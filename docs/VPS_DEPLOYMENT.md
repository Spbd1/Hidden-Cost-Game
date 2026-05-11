# VPS Deployment Guide with Docker Compose

This beginner-friendly guide deploys Hidden Cost Game on an Ubuntu 22.04 or 24.04 VPS using Docker Compose, PostgreSQL, and a reverse proxy for HTTPS.

Assumptions:

- You can SSH into a fresh Ubuntu 22.04/24.04 VPS.
- Your domain already points to the VPS public IP address.
- You run commands as a sudo-capable user.
- The app will listen privately on `127.0.0.1:3000`; public traffic should go through HTTPS on ports 80 and 443.

## 1. Server update

Update package lists and installed packages first:

```bash
sudo apt update
sudo apt upgrade -y
```

If the upgrade installs a new kernel or asks for a reboot, reboot before continuing:

```bash
sudo reboot
```

Reconnect with SSH after the server comes back online.

## 2. Install required tools

Install basic command-line tools used by the rest of this guide:

```bash
sudo apt install -y git curl nano ca-certificates
```

## 3. Install Docker from Docker's official apt repository

Use Docker's official apt repository instead of only Ubuntu's default Docker packages.

### Set up Docker's apt keyring

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

### Add the Docker apt repository

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

### Install Docker Engine and Docker Compose plugin

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Check Docker versions

```bash
docker --version
docker compose version
```

If you see a permission error when running `docker`, either prefix Docker commands with `sudo` or add your user to the `docker` group:

```bash
sudo usermod -aG docker $USER
```

Then log out and back in before retrying Docker commands.

## 4. Clone the deployment branch

Clone the exact branch and enter the project directory:

```bash
git clone --branch codex/improve-admin-dashboard-analytics https://github.com/Spbd1/Hidden-Cost-Game.git hidden-cost-game
cd hidden-cost-game
```

## 5. Configure `.env`

Create your private environment file from the example:

```bash
cp .env.example .env
nano .env
```

Set production values before starting the app:

```dotenv
APP_BASE_URL="https://your-domain.com"
ENABLE_SERVER_SUBMISSION="true"
NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION="true"
ADMIN_EXPORT_TOKEN="long random secret"
POSTGRES_PASSWORD="long random password"
GOOGLE_SHEETS_WEBHOOK_URL=""
GOOGLE_SHEETS_WEBHOOK_SECRET=""
```

Replace `https://your-domain.com` with your real HTTPS domain.

Required production values:

- `APP_BASE_URL="https://your-domain.com"`: the public URL for the deployed site.
- `ENABLE_SERVER_SUBMISSION="true"`: enables the server API that accepts participant submissions.
- `NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION="true"`: shows the submission UI in the browser; because this is a public build-time value, rebuild the app after changing it.
- `ADMIN_EXPORT_TOKEN="long random secret"`: secret token used to open `/admin` and export CSV/JSON. Keep it private, never leave it as `change-me-before-production`, and send it only in the `Authorization: Bearer <token>` header.
- `POSTGRES_PASSWORD="long random password"`: password for the Docker PostgreSQL database. Keep it private and back up your data before changing it later. The production app refuses to start if this is still the example `hcg_password_change_me` value.

Optional Google Sheets values:

- `GOOGLE_SHEETS_WEBHOOK_URL`: optional Google Apps Script web app URL for mirroring successful submissions to a Google Sheet. Use the ready-to-copy receiver in `docs/google-sheets-apps-script.js`.
- `GOOGLE_SHEETS_WEBHOOK_SECRET`: optional shared secret used by the app and Apps Script webhook. Recommended when the Sheets webhook is enabled.

Save and exit nano with `Ctrl+O`, `Enter`, then `Ctrl+X`.

## 6. Generate strong secrets

Generate random secrets on the VPS:

```bash
openssl rand -hex 32
```

Run the command once for `ADMIN_EXPORT_TOKEN`, once for `POSTGRES_PASSWORD`, and once for `GOOGLE_SHEETS_WEBHOOK_SECRET` if you enable the Sheets webhook.

## 7. Start the app

Build and start the app and database in the background. If `.env` still contains placeholder production secrets, the app container will fail closed before starting Next.js; replace `ADMIN_EXPORT_TOKEN` and `POSTGRES_PASSWORD` first.

```bash
docker compose up --build -d
```

Run database migrations after the containers are up:

```bash
docker compose exec app npm run db:migrate
```

## 8. Check health

Check running containers:

```bash
docker compose ps
```

Watch app logs:

```bash
docker compose logs -f app
```

Press `Ctrl+C` to stop following logs.

Check the local health endpoint from the VPS:

```bash
curl http://127.0.0.1:3000/api/health
```

A healthy app should return a JSON response.

Run the VPS smoke test script to verify the homepage, health endpoint, and token-protected admin API endpoints without printing the admin token:

```bash
BASE_URL=http://127.0.0.1:3000 ADMIN_EXPORT_TOKEN="..." bash scripts/vps-smoke-test.sh
```

If you only want to verify public endpoints, omit `ADMIN_EXPORT_TOKEN` and the admin checks will be skipped:

```bash
BASE_URL=http://127.0.0.1:3000 bash scripts/vps-smoke-test.sh
```

## 9. Reverse proxy with Caddy

Use a reverse proxy so visitors reach the app over HTTPS. Caddy is beginner-friendly because it can automatically request and renew TLS certificates.

Install Caddy on Ubuntu:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https gnupg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

Edit the Caddy configuration:

```bash
sudo nano /etc/caddy/Caddyfile
```

Use this minimal example, replacing `your-domain.com` with your real domain:

```caddyfile
your-domain.com {
  reverse_proxy 127.0.0.1:3000
}
```

For pilot data collection, also consider adding a second layer around the researcher-only admin routes. The app still requires `ADMIN_EXPORT_TOKEN` at `/api/admin/*`, but Caddy `basic_auth` or an IP allowlist reduces exposure if the token is mishandled. Generate a real hashed password with `caddy hash-password` and replace the placeholder before use:

```caddyfile
your-domain.com {
  route /admin* {
    basic_auth {
      researcher <hashed-password-placeholder>
    }
    reverse_proxy 127.0.0.1:3000
  }

  route /api/admin* {
    basic_auth {
      researcher <hashed-password-placeholder>
    }
    reverse_proxy 127.0.0.1:3000
  }

  reverse_proxy 127.0.0.1:3000
}
```

Use HTTPS for all participant and admin traffic. Do not put `ADMIN_EXPORT_TOKEN` in URLs or query strings, because URLs are more likely to appear in logs, browser history, and referrer data.

Reload Caddy:

```bash
sudo systemctl reload caddy
```

Then open `https://your-domain.com` in your browser.

## 10. Admin route security checklist

Before collecting real pilot data:

- Use HTTPS, with HTTP redirected to HTTPS by Caddy.
- Use a long random `ADMIN_EXPORT_TOKEN`; the production admin API and startup validation refuse a missing token and refuse the example `change-me-before-production` token.
- Use a long random `POSTGRES_PASSWORD`; startup validation refuses the example `hcg_password_change_me` password in production.
- Send the admin token only as `Authorization: Bearer <token>`, not as a query string.
- Optionally protect `/admin` and `/api/admin/*` behind Caddy `basic_auth`, an IP allowlist, VPN, or institutional access control.
- Keep `.env`, database backups, and exported CSV/JSON files private.

## 11. Firewall

Enable UFW and allow only SSH plus web traffic:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
sudo ufw status
```

Do **not** open port `3000` publicly for normal production use. The Docker Compose file binds the app to `127.0.0.1:3000` so Caddy can reach it locally while the internet cannot reach it directly.

Only expose `3000` temporarily when debugging, and close it again immediately afterward.

## 12. Update deployment

From the project directory, create a database backup before changing running containers or applying migrations:

```bash
./scripts/backup-postgres.sh
```

The script stores timestamped SQL backups in `backups/`, for example `backups/hidden_cost_game_20260511_153000.sql`. It reads `POSTGRES_USER` and `POSTGRES_DB` from `.env` when present and uses the safe defaults `hcg` and `hidden_cost_game` otherwise. PostgreSQL stays private because the script runs `pg_dump` inside the Docker Compose `postgres` service; it does not expose port `5432`.

Copy important backups off the VPS before updates or migrations. From your local computer, use `scp` with your real SSH user, server, and deployment path:

```bash
scp your-user@your-server:/path/to/hidden-cost-game/backups/hidden_cost_game_YYYYMMDD_HHMMSS.sql ./
```

Then pull the latest branch changes:

```bash
git pull
```

Rebuild and restart containers:

```bash
docker compose up --build -d
```

Run database migrations:

```bash
docker compose exec app npm run db:migrate
```

Check logs after every update:

```bash
docker compose logs -f app
```

## 13. Backup and restore notes

The bundled PostgreSQL database stores its files in the Docker volume named `postgres_data`. Docker volumes persist when containers are recreated, but they are still on the VPS disk. Back up the database before risky changes, major updates, migrations, or server moves.

Create a timestamped backup:

```bash
./scripts/backup-postgres.sh
```

Backup files are written to the repository-local `backups/` directory, which is ignored by Git. Keep an off-server copy as well; a VPS disk failure, accidental deletion, or bad migration can affect both the Docker volume and local backup files.

Copy a backup from the VPS to your local machine:

```bash
scp your-user@your-server:/path/to/hidden-cost-game/backups/hidden_cost_game_YYYYMMDD_HHMMSS.sql ./
```

Copy a local backup back to the VPS when you intentionally need to restore it:

```bash
scp ./hidden_cost_game_YYYYMMDD_HHMMSS.sql your-user@your-server:/path/to/hidden-cost-game/backups/
```

Important restore warning:

- Restoring a database can overwrite, modify, duplicate, or conflict with existing production data.
- Practice restore steps on a test server first.
- Stop the app or put the site into maintenance mode before restoring production data.
- Verify the backup file name, server, branch, and `.env` database settings before confirming a restore.
- Keep an off-server copy of backup files, not only a copy inside the VPS.

Restore only when you are certain the target database is correct:

```bash
./scripts/restore-postgres.sh backups/hidden_cost_game_YYYYMMDD_HHMMSS.sql
```

The restore helper prints a large warning and requires you to type `RESTORE` before it streams the SQL file into the Docker Compose `postgres` service with `psql`. PostgreSQL remains private; no database port is exposed.

## 14. Final smoke test

After deployment and HTTPS setup, test the full production path:

1. Open `https://your-domain.com`.
2. Complete one full participant session.
3. Submit the completed session at the end of the flow.
4. Open `https://your-domain.com/admin`.
5. Enter `ADMIN_EXPORT_TOKEN`.
6. Export CSV and JSON.
7. Verify the exported files contain the test submission.
8. If `GOOGLE_SHEETS_WEBHOOK_URL` is enabled, verify a new row appears in the Google Sheet. The recommended Apps Script receiver is in `docs/google-sheets-apps-script.js`; it creates the `Submissions` headers on first run and rejects requests whose JSON body does not contain the matching `secret`.

Keep the test export and backup notes with your deployment records so future updates can be checked the same way.
