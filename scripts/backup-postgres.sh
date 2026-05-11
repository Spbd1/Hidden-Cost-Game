#!/usr/bin/env bash
set -euo pipefail

DEFAULT_POSTGRES_USER="hcg"
DEFAULT_POSTGRES_DB="hidden_cost_game"
BACKUP_DIR="backups"
ENV_FILE=".env"

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
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTPUT_PATH="${BACKUP_DIR}/${POSTGRES_DB}_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

docker compose exec -T postgres pg_dump \
  --username="$POSTGRES_USER" \
  --dbname="$POSTGRES_DB" \
  --no-owner \
  --no-privileges \
  > "$OUTPUT_PATH"

printf 'PostgreSQL backup written to: %s\n' "$OUTPUT_PATH"
