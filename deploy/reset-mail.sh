#!/usr/bin/env bash
# ==============================================================================
# Aadhiraksha Insurance - Mail Subsystem Reset & Provisioning Script
# Resets Stalwart Mail Server & SnappyMail to clean, persistent, production state.
# ==============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."

# Load environment configuration if present
if [ -f .env ]; then
  # export variables from .env
  set -a
  source .env
  set +a
fi

STALWART_DOMAIN="${MAILSERVER_DOMAIN:-aadhirakshainsurance.com}"
STALWART_SECRET="${STALWART_ADMIN_SECRET:-AadhirakshaMailSecret2026!}"
STALWART_HOST_PORT="${STALWART_HTTP_PORT:-8080}"
ADMIN_EMAIL="admin@${STALWART_DOMAIN}"
ADMIN_PASSWORD="${STALWART_SECRET}"

echo "=========================================================="
echo " Starting Clean Reset of Stalwart Mail & SnappyMail"
echo " Domain:        ${STALWART_DOMAIN}"
echo " Admin User:    ${ADMIN_EMAIL}"
echo "=========================================================="

echo "[1/5] Stopping existing mail containers..."
docker compose stop mailserver webmail 2>/dev/null || true
docker compose rm -f mailserver webmail 2>/dev/null || true

echo "[2/5] Cleaning stale volume and cache data..."
# Reset Stalwart persistent data files
rm -rf data/stalwart/etc/* data/stalwart/data/* 2>/dev/null || true
mkdir -p data/stalwart/etc data/stalwart/data

# Remove stale SnappyMail Docker volume to clear out desynchronized salt keys
docker volume rm aadhiraksha_snappymail_data 2>/dev/null || true

echo "[3/5] Starting Stalwart Mail Server..."
docker compose up -d mailserver

echo "[4/5] Waiting for Stalwart initialization (15 seconds)..."
sleep 15

# Verify Stalwart HTTP responsiveness
MAX_RETRIES=10
COUNT=0
while [ $COUNT -lt $MAX_RETRIES ]; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${STALWART_HOST_PORT}/jmap" 2>/dev/null || echo "000")
  if [ "$HTTP_STATUS" != "000" ]; then
    echo "Stalwart HTTP endpoint is responsive (HTTP $HTTP_STATUS)."
    break
  fi
  echo "Waiting for Stalwart to become ready... attempt $((COUNT+1))/$MAX_RETRIES"
  sleep 3
  COUNT=$((COUNT+1))
done

echo "[5/5] Provisioning domain and admin mailbox..."
AUTH_HEADER="Basic $(echo -n "${ADMIN_EMAIL}:${ADMIN_PASSWORD}" | base64)"

# 1. Provision Domain
curl -s -X POST "http://127.0.0.1:${STALWART_HOST_PORT}/api/principal" \
  -H "Authorization: ${AUTH_HEADER}" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"domain\",
    \"name\": \"${STALWART_DOMAIN}\",
    \"description\": \"Canonical Domain for Aadhiraksha Insurance\"
  }" > /dev/null 2>&1 || true

# 2. Provision Admin Account
curl -s -X POST "http://127.0.0.1:${STALWART_HOST_PORT}/api/principal" \
  -H "Authorization: ${AUTH_HEADER}" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"individual\",
    \"name\": \"admin\",
    \"secret\": \"${ADMIN_PASSWORD}\",
    \"emails\": [\"${ADMIN_EMAIL}\"],
    \"quota\": 10737418240,
    \"roles\": [\"admin\", \"superuser\"]
  }" > /dev/null 2>&1 || true

# Start SnappyMail
docker compose up -d webmail

echo "=========================================================="
echo " Mail Subsystem Reset & Provisioning Complete!"
echo " - Stalwart Web Console:  http://localhost:${STALWART_HOST_PORT}"
echo " - SnappyMail Web Client: http://localhost:8888"
echo " - Admin Account:         ${ADMIN_EMAIL}"
echo " - Password:              ${ADMIN_PASSWORD}"
echo "=========================================================="
