#!/bin/bash
# NordicRate — Hetzner Server Initial Setup Script
# Run as root: bash setup.sh
set -e

DOMAIN="nordicrate.berkaybarboros.com"
APP_DIR="/var/www/nordicrate"
REPO="https://github.com/berkaybarboros/nordicrate.git"

echo "==> [1/7] System update"
apt-get update -y && apt-get upgrade -y

echo "==> [2/7] Install Node.js 22 + Nginx + Certbot + Git"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs nginx certbot python3-certbot-nginx git
npm install -g pm2

echo "==> [3/7] Clone repo"
mkdir -p /var/www
git clone $REPO $APP_DIR
cd $APP_DIR

echo "==> [4/7] Create .env.local"
cat > $APP_DIR/.env.local << EOF
NEXT_PUBLIC_BASE_URL=https://$DOMAIN
EOF

echo "==> [5/7] Install dependencies & build"
npm install
npm run build

echo "==> [6/7] Start app with PM2"
pm2 start $APP_DIR/ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo "==> [7/7] Configure Nginx"
cp $APP_DIR/deploy/nginx.conf /etc/nginx/sites-available/nordicrate
ln -sf /etc/nginx/sites-available/nordicrate /etc/nginx/sites-enabled/nordicrate
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "✅ Setup complete! Now run SSL:"
echo "   certbot --nginx -d $DOMAIN"
