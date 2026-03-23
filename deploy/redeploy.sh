#!/bin/bash
# NordicRate — Redeploy (run after git push)
# Run on server: bash /var/www/nordicrate/deploy/redeploy.sh
set -e

APP_DIR="/var/www/nordicrate"
cd $APP_DIR

echo "==> Pull latest changes"
git pull origin main

echo "==> Install dependencies"
npm install

echo "==> Build"
npm run build

echo "==> Restart PM2"
pm2 restart nordicrate

echo "✅ Redeployed successfully!"
pm2 status
