#!/usr/bin/env bash
set -euo pipefail

DEFAULT_POSTGRES_USER="hcg"
DEFAULT_POSTGRES_DB="hidden_cost_game"
ENV_FILE=".env"

usage() {
  printf 'Usage: %s <backup-file.sql>\n' "$0" >&2
}

read_env_value() {
  local key="$1"

  if [[ ! -f "$ENV_FILE" ]]; then
    return 1
  fi

  awk -v key="$key" '
    BEGIN { FS = "=" }
    /^[[:space:]]*#/ { next }
    /^[[:space:]]*$/ { next }
    {
      line = $0
      sub(/^[[:space:]]*export[[:space:]]+/, "", line)
      split(line, parts, "=")
      name = parts[1]
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", name)
      if (name != key) {
        next
      }
      value = substr(line, index(line, "=") + 1)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", value)
      if (value ~ /^".*"$/ || value ~ /^'\''.*'\''$/) {
        value = substr(value, 2, length(value) - 2)
      }
      found = 1
      print value
      exit
    }
    END { if (!found) exit 1 }
  ' "$ENV_FILE"
}

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

BACKUP_FILE="$1"

if [[ ! -f "$BACKUP_FILE" ]]; then
  printf 'Backup file not found: %s\n' "$BACKUP_FILE" >&2
  exit 1
fi

if [[ ! -r "$BACKUP_FILE" ]]; then
  printf 'Backup file is not readable: %s\n' "$BACKUP_FILE" >&2
  exit 1
fi

POSTGRES_USER="${POSTGRES_USER:-}"
POSTGRES_DB="${POSTGRES_DB:-}"

if [[ -z "$POSTGRES_USER" ]]; then
  POSTGRES_USER="$(read_env_value POSTGRES_USER || true)"
fi

if [[ -z "$POSTGRES_DB" ]]; then
  POSTGRES_DB="$(read_env_value POSTGRES_DB || true)"
fi

POSTGRES_USER="${POSTGRES_USER:-$DEFAULT_POSTGRES_USER}"
POSTGRES_DB="${POSTGRES_DB:-$DEFAULT_POSTGRES_DB}"

cat <<'WARNING'

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!! WARNING: DATABASE RESTORE MAY OVERWRITE OR MODIFY DATA !!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

This command will stream the backup into the Docker Compose postgres
service without exposing the PostgreSQL port. Run it only when you are
certain the backup file and target database are correct.

WARNING

printf 'Target database: %s\n' "$POSTGRES_DB"
printf 'Target user: %s\n' "$POSTGRES_USER"
printf 'Backup file: %s\n\n' "$BACKUP_FILE"
printf 'Type RESTORE to continue: '
read -r CONFIRMATION

if [[ "$CONFIRMATION" != "RESTORE" ]]; then
  printf 'Restore cancelled.\n'
  exit 1
fi

docker compose exec -T postgres psql \
  --username="$POSTGRES_USER" \
  --dbname="$POSTGRES_DB" \
  --set=ON_ERROR_STOP=1 \
  < "$BACKUP_FILE"

printf 'PostgreSQL restore completed from: %s\n' "$BACKUP_FILE"
