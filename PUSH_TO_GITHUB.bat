@echo off
REM Suraksha Setu - GitHub Push Helper Script
REM This script automates the process of pushing to GitHub

echo.
echo ================================================
echo  Suraksha Setu - GitHub Deployment Script
echo ================================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/
    pause
    exit /b 1
)

REM Navigate to project directory
cd /d "c:\Users\kashy\Downloads\suraksha setu (6)\suraksha setu"
if errorlevel 1 (
    echo ERROR: Could not navigate to project directory
    pause
    exit /b 1
)

echo [1/5] Configuring Git...
git config user.email "deployment@suraksha-setu.io" >nul 2>&1
git config user.name "Suraksha Setu Deploy" >nul 2>&1
echo ✓ Git configured

echo.
echo [2/5] Initializing repository...
if exist .git (
    echo Repository already exists, skipping init
) else (
    git init
)
echo ✓ Repository initialized

echo.
echo [3/5] Staging all files...
git add .
echo ✓ Files staged

echo.
echo [4/5] Creating commit...
git commit -m "v1.0.0: Suraksha Setu Emergency Response Platform - Production Ready"
if errorlevel 1 (
    echo Note: Nothing new to commit (or files already committed)
) else (
    echo ✓ Commit created
)

echo.
echo [5/5] Pushing to GitHub...
echo GitHub Repository: https://github.com/Kashyapdivakaruni/Suraksha-Setu

REM Remove existing remote if it exists
git remote remove origin 2>nul

REM Add remote
git remote add origin https://github.com/Kashyapdivakaruni/Suraksha-Setu.git

REM Set branch to main
git branch -M main

REM Push to GitHub
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ Push failed. Common reasons:
    echo    1. GitHub authentication issue
    echo    2. Network connectivity problem
    echo    3. Repository not accessible
    echo.
    echo Try running manually:
    echo    git push -u origin main --force
    echo.
    pause
    exit /b 1
) else (
    echo ✓ Successfully pushed to GitHub!
)

echo.
echo ================================================
echo  ✅ GitHub Push Complete!
echo ================================================
echo.
echo Next Steps:
echo 1. Visit: https://github.com/Kashyapdivakaruni/Suraksha-Setu
echo 2. Verify all files are visible
echo 3. Go to: https://vercel.com/new
echo 4. Import the GitHub repository
echo 5. Configure environment variables
echo 6. Deploy to Vercel
echo.
echo For detailed instructions, see: QUICK_DEPLOYMENT.md
echo.
pause
