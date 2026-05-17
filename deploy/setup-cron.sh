#!/bin/bash
# VPS cron job setup — tek seferlik çalıştır
# Öncesinde CRON_SECRET'i .env.local'a ekle

BASE_URL="https://nordicrate.berkaybarboros.com"
SECRET="${CRON_SECRET}"

if [ -z "$SECRET" ]; then
  echo "ERROR: CRON_SECRET env variable not set"
  echo "Add to /var/www/nordicrate/.env.local first:"
  echo "  CRON_SECRET=<generate with: openssl rand -hex 32>"
  exit 1
fi

# Crontab entries
CRON_RATES="0 * * * * curl -s -X POST -H 'x-cron-secret: ${SECRET}' ${BASE_URL}/api/cron/sync-rates >> /var/log/nordicrate-cron.log 2>&1"
CRON_SCORES="0 2 * * * curl -s -X POST -H 'x-cron-secret: ${SECRET}' ${BASE_URL}/api/cron/refresh-scores >> /var/log/nordicrate-cron.log 2>&1"

# Mevcut crontab'a ekle (duplicate önlemek için kontrol)
(crontab -l 2>/dev/null | grep -v 'nordicrate'; echo "$CRON_RATES"; echo "$CRON_SCORES") | crontab -

echo "✅ Cron jobs added:"
echo "   - sync-rates: her saat başı"
echo "   - refresh-scores: her gece 02:00"
echo ""
echo "Kontrol: crontab -l | grep nordicrate"
