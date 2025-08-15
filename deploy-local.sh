#!/bin/bash
# deploy-local.sh - Run this on your LOCAL machine

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$HOME/stem_lab_platform"
SSH_USER="u18-apczxnbftdgk"
SSH_HOST="3dprintanddrones.com"
REMOTE_DIR="~/www/3dprintanddrones.com/public_html"

cd $PROJECT_DIR

# 1. Build frontend locally
echo -e "${YELLOW}Building frontend...${NC}"
cd frontend
npm install
npm run build

# 2. Copy build to backend
echo -e "${YELLOW}Copying build files...${NC}"
rm -rf ../backend/public/static
rm -f ../backend/public/asset-manifest.json
rm -f ../backend/public/manifest.json
rm -f ../backend/public/index.html
cp -r build/* ../backend/public/

# 3. Commit and push
cd $PROJECT_DIR
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

# 4. Deploy to server
echo -e "${YELLOW}Deploying to server...${NC}"
ssh -p 18765 $SSH_USER@$SSH_HOST << 'ENDSSH'
cd ~/www/3dprintanddrones.com/public_html
echo "Pulling latest changes..."
git pull origin main

cd backend
echo "Installing composer dependencies..."
composer install --no-dev --optimize-autoloader

echo "Running migrations..."
php artisan migrate --force

echo "Clearing caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

echo "Setting permissions..."
chmod -R 755 storage bootstrap/cache

echo "✅ Deployment complete!"
ENDSSH

echo -e "${GREEN}✅ Deployment finished successfully!${NC}"