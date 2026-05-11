#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
BASE_URL="${BASE_URL%/}"
ADMIN_EXPORT_TOKEN="${ADMIN_EXPORT_TOKEN:-}"

failures=0

print_pass() {
  printf 'PASS: %s\n' "$1"
}

print_fail() {
  printf 'FAIL: %s\n' "$1"
  failures=$((failures + 1))
}

http_get() {
  local url="$1"
  local output_file="$2"
  shift 2

  local status
  if ! status=$(curl --silent --show-error --location --output "$output_file" --write-out '%{http_code}' "$@" "$url"); then
    printf '000'
    return 0
  fi

  printf '%s' "$status"
}

check_status() {
  local label="$1"
  local url="$2"
  shift 2

  local response_file
  response_file=$(mktemp)
  local status
  status=$(http_get "$url" "$response_file" "$@")
  rm -f "$response_file"

  if [[ "$status" == "200" ]]; then
    print_pass "$label returned HTTP 200"
  else
    print_fail "$label returned HTTP $status (expected 200)"
  fi
}

check_health() {
  local response_file
  response_file=$(mktemp)
  local status
  status=$(http_get "$BASE_URL/api/health" "$response_file")

  if [[ "$status" == "200" ]]; then
    print_pass "GET $BASE_URL/api/health returned HTTP 200"
  else
    print_fail "GET $BASE_URL/api/health returned HTTP $status (expected 200)"
  fi

  if [[ -s "$response_file" ]] && LC_ALL=C grep -Eq '^[[:space:]]*[{[]' "$response_file"; then
    print_pass "GET $BASE_URL/api/health returned JSON-like text"
  else
    print_fail "GET $BASE_URL/api/health did not return JSON-like text"
  fi

  rm -f "$response_file"
}

check_status "GET $BASE_URL/" "$BASE_URL/"
check_health

if [[ -n "$ADMIN_EXPORT_TOKEN" ]]; then
  auth_header="Authorization: Bearer ${ADMIN_EXPORT_TOKEN}"
  check_status "GET $BASE_URL/api/admin/diagnostics" "$BASE_URL/api/admin/diagnostics" --header "$auth_header"
  check_status "GET $BASE_URL/api/admin/stats" "$BASE_URL/api/admin/stats" --header "$auth_header"
else
  printf 'SKIP: ADMIN_EXPORT_TOKEN is not set; skipping admin diagnostics and stats checks\n'
fi

if (( failures > 0 )); then
  printf 'FAIL: VPS smoke test completed with %d failure(s)\n' "$failures"
  exit 1
fi

printf 'PASS: VPS smoke test completed successfully\n'
