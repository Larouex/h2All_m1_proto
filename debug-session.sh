#!/bin/bash

# H2All Campaign Progress Debug Session
# This script starts the development server and opens debug pages

echo "🐛 Starting H2All Campaign Progress Debug Session"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo -e "${BLUE}🔍 Running lint check...${NC}"
npm run lint

echo -e "${BLUE}🏗️  Building application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Starting development server...${NC}"
echo -e "${YELLOW}The server will start on http://localhost:3000${NC}"
echo ""
echo -e "${GREEN}Debug URLs:${NC}"
echo -e "  🐛 Debug Page: http://localhost:3000/debug/campaign-progress"
echo -e "  📄 Claimed2 Page: http://localhost:3000/claimed2"
echo -e "  🔧 Admin Dashboard: http://localhost:3000/admin"
echo -e "  📊 Database Debug: http://localhost:3000/api/debug/database"
echo -e "  🌱 Seed Campaign: http://localhost:3000/api/campaigns/seed"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the development server
npm run dev
