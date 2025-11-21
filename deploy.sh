#!/bin/bash

# EduBaza Auto-Deploy Script
# Runs on server after git push

set -e  # Exit on error

echo "========================================="
echo "🚀 EduBaza Auto-Deploy Started"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Are you in the right directory?${NC}"
    exit 1
fi

echo -e "${GREEN}[1/6] Pulling latest changes from GitHub...${NC}"
git pull origin main

echo -e "${GREEN}[2/6] Installing dependencies...${NC}"
npm install

echo -e "${GREEN}[3/6] Building Next.js application...${NC}"
npm run build

echo -e "${GREEN}[4/6] Stopping old PM2 process...${NC}"
pm2 stop edubaza || echo "No existing process to stop"

echo -e "${GREEN}[5/6] Starting new PM2 process...${NC}"
pm2 start npm --name "edubaza" -- start
pm2 save

echo -e "${GREEN}[6/6] Checking application status...${NC}"
pm2 list
pm2 logs edubaza --lines 10 --nostream

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ Deploy completed successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Application URL: https://baza.eduplay.uz"
echo "PM2 Status: pm2 list"
echo "View Logs: pm2 logs edubaza"
echo ""
