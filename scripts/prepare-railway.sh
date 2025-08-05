#!/bin/bash

# Railway Deployment Preparation Script
# This script helps prepare your local environment for Railway deployment

echo "🚂 Railway Deployment Preparation"
echo "================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

echo "📋 Pre-deployment checks..."

# Check if required files exist
REQUIRED_FILES=("package.json" "railway.yml" "railway.json" ".env.railway")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check if environment template exists
if [ -f ".env.railway" ]; then
    echo ""
    echo "📝 Environment Variables Template:"
    echo "Copy these to your Railway service settings:"
    echo "==========================================="
    grep -E "^[A-Z_]+=.*" .env.railway | grep -v "^#" | head -10
    echo ""
fi

# Build test
echo "🔨 Testing build process..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - fix errors before deploying"
    exit 1
fi

# Git status check
echo ""
echo "📦 Git repository status:"
if git status --porcelain | grep -q .; then
    echo "⚠️  Uncommitted changes detected:"
    git status --short
    echo ""
    echo "Consider committing changes before deployment:"
    echo "  git add ."
    echo "  git commit -m 'Prepare for Railway deployment'"
    echo "  git push origin main"
else
    echo "✅ Repository is clean and ready for deployment"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Commit any remaining changes to git"
echo "2. Push to GitHub: git push origin main"
echo "3. Go to Railway: https://railway.app"
echo "4. Deploy from GitHub repository"
echo "5. Add PostgreSQL service"
echo "6. Set environment variables from .env.railway"
echo ""
echo "📚 See RAILWAY_DEPLOYMENT.md for detailed instructions"
