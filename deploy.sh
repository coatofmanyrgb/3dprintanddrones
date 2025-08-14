#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

# Copy frontend build to backend public directory
echo "📋 Copying frontend build to backend..."
rm -rf ../backend/public/*
cp -r build/* ../backend/public/

# Go to backend
cd ../backend

# Ensure storage and bootstrap/cache directories exist
mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
mkdir -p bootstrap/cache

echo "✅ Build complete!"