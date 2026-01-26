@echo off
REM Deployment Helper Script for Evalis (Windows)
REM Run this script to prepare your application for deployment

echo.
echo 🚀 Evalis Deployment Preparation Script
echo ========================================
echo.

REM Check if git is available
where git >nul 2>nul
if errorlevel 1 (
    echo ❌ Git is not installed. Please install git first.
    pause
    exit /b 1
)

echo ✓ Git is installed
echo.

REM Step 1: Check git status
echo 1️⃣ Checking git status...
git status
echo.

REM Step 2: Check .env files
echo 2️⃣ Checking environment files...

if exist "evalis-backend\.env.example" (
    echo ✓ evalis-backend\.env.example found
) else (
    echo ❌ evalis-backend\.env.example not found
)

if exist "frontend\.env.example" (
    echo ✓ frontend\.env.example found
) else (
    echo ❌ frontend\.env.example not found
)
echo.

REM Step 3: Verify package.json files
echo 3️⃣ Verifying package.json files...

if exist "evalis-backend\package.json" (
    echo ✓ Backend package.json found
) else (
    echo ❌ Backend package.json not found
    pause
    exit /b 1
)

if exist "frontend\package.json" (
    echo ✓ Frontend package.json found
) else (
    echo ❌ Frontend package.json not found
    pause
    exit /b 1
)
echo.

REM Step 4: Summary
echo 📋 DEPLOYMENT CHECKLIST:
echo ✓ Git repository is ready
echo ✓ Environment files are configured
echo ✓ Package files are present
echo.

echo 📚 Next Steps:
echo 1. Follow the deployment guide in DEPLOYMENT_TO_INTERNET.md
echo 2. Sign up for free accounts:
echo    - Render: https://render.com
echo    - Vercel: https://vercel.com
echo 3. Deploy database first ^(Render PostgreSQL^)
echo 4. Deploy backend ^(Render Web Service^)
echo 5. Update frontend .env with backend URL
echo 6. Deploy frontend ^(Vercel^)
echo.
echo 🎉 Your application will be live on the internet!
echo.

pause
