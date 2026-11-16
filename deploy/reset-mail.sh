#!/usr/bin/env bash
# ==============================================================================
# Aadhiraksha Insurance - Mail Subsystem Reset & Provisioning Script
# Resets Stalwart Mail Server & SnappyMail to clean, persistent, production state.
# ==============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."

# Load environment configuration if present
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

STALWART_DOMAIN="${MAILSERVER_DOMAIN:-aadhirakshainsurance.com}"
STALWART_SECRET="${STALWART_ADMIN_SECRET:-AadhirakshaMailSecret2026!}"
ADMIN_EMAIL="admin@${STALWART_DOMAIN}"
ADMIN_PASSWORD="${STALWART_SECRET}"
HTTP_PORT="${STALWART_HTTP_PORT:-8080}"

echo "=========================================================="
echo " Starting Clean Reset of Stalwart Mail & SnappyMail"
echo " Domain:        ${STALWART_DOMAIN}"
echo " Admin User:    ${ADMIN_EMAIL}"
echo " Recovery User: admin"
echo "=========================================================="

echo "[1/6] Stopping existing mail containers..."
docker rm -f aadhiraksha_mailserver aadhiraksha_webmail 2>/dev/null || true

echo "[2/6] Cleaning stale data & preparing clean RocksDB configuration..."
rm -rf data/stalwart/etc/* data/stalwart/data/* 2>/dev/null || true
mkdir -p data/stalwart/etc data/stalwart/data

# Bootstrap clean RocksDB config for Stalwart so it knows its datastore
cat <<EOF > data/stalwart/etc/config.json
{
  "@type": "RocksDb",
  "path": "/var/lib/stalwart"
}
EOF

# Remove old snappymail volume to avoid corrupt cached states
docker volume rm aadhiraksha_snappymail_data 2>/dev/null || true

echo "[3/6] Starting Stalwart Mail Server..."
docker compose up -d mailserver

echo "[4/6] Waiting for Stalwart initialization (15 seconds)..."
sleep 15

# Verify Stalwart HTTP responsiveness
MAX_RETRIES=15
COUNT=0
while [ $COUNT -lt $MAX_RETRIES ]; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${HTTP_PORT}/jmap" 2>/dev/null || echo "000")
  if [ "$HTTP_STATUS" != "000" ]; then
    echo "Stalwart HTTP endpoint is responsive (HTTP $HTTP_STATUS)."
    break
  fi
  echo "Waiting for Stalwart to become ready... attempt $((COUNT+1))/$MAX_RETRIES"
  sleep 3
  COUNT=$((COUNT+1))
done

echo "[5/6] Starting SnappyMail Web Client..."
docker compose up -d webmail
sleep 5

# Ensure SnappyMail domains directory exists and inject domain configuration safely into the volume
echo "[6/6] Injecting domain configuration into SnappyMail volume..."
docker exec aadhiraksha_webmail mkdir -p /var/lib/snappymail/_data_/_default_/domains/
docker cp deploy/mail/snappymail/domains/aadhirakshainsurance.com.json aadhiraksha_webmail:/var/lib/snappymail/_data_/_default_/domains/aadhirakshainsurance.com.json
docker cp deploy/mail/snappymail/domains/aadhirakshainsurance.com.json aadhiraksha_webmail:/var/lib/snappymail/_data_/_default_/domains/default.json
docker exec aadhiraksha_webmail chown -R www-data:www-data /var/lib/snappymail/_data_/_default_/domains/ 2>/dev/null || true

# Provision domain and admin mailbox in Stalwart using basic recovery auth
echo "Provisioning domain and admin mailbox in Stalwart..."
AUTH_BASIC="Basic $(echo -n "admin:${ADMIN_PASSWORD}" | base64)"

curl -s -X POST "http://127.0.0.1:${HTTP_PORT}/api/principal" \
  -H "Authorization: ${AUTH_BASIC}" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"domain\",
    \"name\": \"${STALWART_DOMAIN}\",
    \"description\": \"Canonical Domain for Aadhiraksha Insurance\"
  }" > /dev/null 2>&1 || true

curl -s -X POST "http://127.0.0.1:${HTTP_PORT}/api/principal" \
  -H "Authorization: ${AUTH_BASIC}" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"individual\",
    \"name\": \"admin\",
    \"secret\": \"${ADMIN_PASSWORD}\",
    \"emails\": [\"${ADMIN_EMAIL}\"],
    \"quota\": 10737418240,
    \"roles\": [\"admin\", \"superuser\"]
  }" > /dev/null 2>&1 || true

echo "=========================================================="
echo " Mail Subsystem Reset & Provisioning Complete!"
echo " - Stalwart Web Console:  https://mail-admin.${STALWART_DOMAIN}"
echo "                          (or http://localhost:${HTTP_PORT})"
echo "   Login username:        admin"
echo "   Login password:        ${ADMIN_PASSWORD}"
echo ""
echo " - SnappyMail Web Client: https://mail.${STALWART_DOMAIN}"
echo "                          (or http://localhost:8888)"
echo "   Login username:        admin (or ${ADMIN_EMAIL})"
echo "   Login password:        ${ADMIN_PASSWORD}"
echo "=========================================================="
