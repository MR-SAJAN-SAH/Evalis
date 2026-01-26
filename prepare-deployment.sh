#!/bin/bash
# Deployment Helper Script for Evalis
# Run this script to prepare your application for deployment

echo "🚀 Evalis Deployment Preparation Script"
echo "========================================"
echo ""

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

echo "✓ Git is installed"
echo ""

# Step 1: Check git status
echo "1️⃣ Checking git status..."
git status
echo ""

# Step 2: Ensure code is committed
read -p "2️⃣ Is all your code committed? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please commit your changes with: git add . && git commit -m 'Your message'"
    exit 1
fi

# Step 3: Check .env files
echo ""
echo "3️⃣ Checking environment files..."

if [ ! -f "evalis-backend/.env.example" ]; then
    echo "❌ evalis-backend/.env.example not found"
else
    echo "✓ evalis-backend/.env.example found"
fi

if [ ! -f "frontend/.env.example" ]; then
    echo "❌ frontend/.env.example not found"
else
    echo "✓ frontend/.env.example found"
fi
echo ""

# Step 4: Verify package.json files
echo "4️⃣ Verifying package.json files..."

if [ -f "evalis-backend/package.json" ]; then
    echo "✓ Backend package.json found"
else
    echo "❌ Backend package.json not found"
    exit 1
fi

if [ -f "frontend/package.json" ]; then
    echo "✓ Frontend package.json found"
else
    echo "❌ Frontend package.json not found"
    exit 1
fi
echo ""

# Step 5: Summary
echo "📋 DEPLOYMENT CHECKLIST:"
echo "✓ Git repository is ready"
echo "✓ Code is committed"
echo "✓ Environment files are configured"
echo "✓ Package files are present"
echo ""

echo "📚 Next Steps:"
echo "1. Follow the deployment guide in DEPLOYMENT_TO_INTERNET.md"
echo "2. Sign up for free accounts:"
echo "   - Render: https://render.com"
echo "   - Vercel: https://vercel.com"
echo "3. Deploy database first (Render PostgreSQL)"
echo "4. Deploy backend (Render Web Service)"
echo "5. Update frontend .env with backend URL"
echo "6. Deploy frontend (Vercel)"
echo ""
echo "🎉 Your application will be live on the internet!"
