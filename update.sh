#!/bin/bash
# Run this on server to pull latest changes and rebuild
set -e

APP_DIR="/var/www/wp-connect"
cd ${APP_DIR}

echo "=== Pulling latest changes ==="
git pull origin main

echo "=== Updating scraper ==="
cd ${APP_DIR}/gpt
npm install
npm run build
npx prisma generate

echo "=== Updating dashboard ==="
cd ${APP_DIR}/dashboard
npm install
npx prisma generate
npm run build

echo "=== Restarting services ==="
pm2 restart dashboard

echo "=== Done! ==="
pm2 status
