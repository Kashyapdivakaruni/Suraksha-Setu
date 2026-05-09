# Suraksha Setu - Deployment Guide

**Last Updated**: May 10, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Local Verification](#step-1-local-verification)
3. [Step 2: GitHub Setup](#step-2-github-setup)
4. [Step 3: Vercel Deployment](#step-3-vercel-deployment)
5. [Step 4: Post-Deployment Verification](#step-4-post-deployment-verification)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

You must have:
- [Node.js 18+](https://nodejs.org/) installed
- [Git](https://git-scm.com/) installed
- GitHub account with repository created: `https://github.com/Kashyapdivakaruni/Suraksha-Setu`
- Vercel account (free tier: `https://vercel.com/signup`)
- PostgreSQL database (for production) or Neon/Supabase account

---

## Step 1: Local Verification

### 1.1 Verify the Application Works

```bash
# Navigate to project directory
cd "suraksha setu"

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npm run prisma:migrate

# Seed the database with test data
npm run seed

# Start the development server
npm run dev
```

**Expected Output:**
```
✓ Ready in 2.3s
- Local: http://localhost:3000
```

### 1.2 Test All User Roles

Visit `http://localhost:3000` and test:

**Citizen Login:**
- Email: `citizen@demo.com`
- Password: `password123`
- ✅ Should see: Dashboard, Profile, QR Code

**EMS Login:**
- Email: `ems@demo.com`
- Password: `password123`
- ✅ Should see: Scanner, Case Creation, Hospital Assignment

**Hospital Login:**
- Email: `hospital@demo.com`
- Password: `password123`
- ✅ Should see: Emergency Ward, Incoming Cases

**Police Login:**
- Email: `police@demo.com`
- Password: `password123`
- ✅ Should see: Dashboard, Reports

---

## Step 2: GitHub Setup

### 2.1 Initialize Git Repository

```bash
# Navigate to project directory
cd "suraksha setu"

# Initialize git (if not already done)
git init

# Configure git user
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

### 2.2 Create .gitignore (if missing)

```bash
# Already present in project, but verify it contains:
cat .gitignore
```

**Should contain:**
```
node_modules/
.env
.env.local
dist/
build/
.next/
prisma/migrations/
.DS_Store
```

### 2.3 Create Initial Commit

```bash
# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: Suraksha Setu v1.0.0 - Emergency Response Platform"

# Verify commit
git log --oneline
```

### 2.4 Connect to GitHub Repository

```bash
# Add remote origin (replace with your actual repo)
git remote add origin https://github.com/Kashyapdivakaruni/Suraksha-Setu.git

# Verify remote
git remote -v

# Push to GitHub (creates main branch)
git branch -M main
git push -u origin main
```

**Expected Output:**
```
[main (root-commit) abc1234] Initial commit
Enumerating objects: 150, done.
...
 create mode 100644 package.json
 create mode 100644 README.md
```

### 2.5 Verify on GitHub

- Visit: `https://github.com/Kashyapdivakaruni/Suraksha-Setu`
- ✅ Should see: All project files pushed
- ✅ Should see: Commits visible in history

---

## Step 3: Vercel Deployment

### 3.1 Connect GitHub to Vercel

1. Visit: `https://vercel.com`
2. Sign in or create account
3. Click **"New Project"**
4. Click **"Import Git Repository"**
5. Paste repo URL: `https://github.com/Kashyapdivakaruni/Suraksha-Setu`
6. Click **"Import"**

### 3.2 Configure Vercel Project

**Project Settings:**
- **Project Name:** `suraksha-setu` (auto-filled)
- **Framework:** Next.js (auto-detected)
- **Root Directory:** `./` (default)

### 3.3 Configure Environment Variables

In Vercel Dashboard, go to **Settings → Environment Variables** and add:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_very_strong_random_secret_key_here_min_32_chars
APP_URL=https://suraksha-setu.vercel.app
NEXT_PUBLIC_APP_NAME=Suraksha Setu
NODE_ENV=production
```

**Getting `DATABASE_URL`:**

**Option A: Using Neon (Recommended for free tier)**
1. Visit: `https://neon.tech`
2. Sign up and create new project
3. Create database
4. Copy connection string: `postgresql://user:password@...`
5. Paste into Vercel

**Option B: Using Supabase**
1. Visit: `https://supabase.com`
2. Create new project
3. Get PostgreSQL connection string from Settings → Database
4. Copy and paste into Vercel

**Option C: Using Railway**
1. Visit: `https://railway.app`
2. Create new project
3. Add PostgreSQL plugin
4. Copy `DATABASE_URL` from variables

### 3.4 Configure Build Command

In Vercel Dashboard, go to **Settings → Build & Development Settings**

**Build Command:**
```bash
npx prisma generate && npx prisma migrate deploy && next build
```

**Output Directory:** `.next` (auto-filled)

**Install Command:** `npm install` (default)

### 3.5 Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (typically 2-3 minutes)
3. Once complete, click URL to visit deployed app

**Expected Build Log:**
```
✓ Exported in 1.5s
✓ Prisma schema validated
✓ Prisma migrations deployed
> next build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting build fragments
✓ Build complete
```

---

## Step 4: Post-Deployment Verification

### 4.1 Test Production URL

Visit your Vercel deployment URL (e.g., `https://suraksha-setu.vercel.app`)

**Tests to Perform:**

1. **Home Page**
   - ✅ Should load without errors
   - ✅ All images/icons should display
   - ✅ Buttons should be clickable

2. **Citizen Login**
   - Email: `citizen@demo.com`
   - Password: `password123`
   - ✅ Should redirect to dashboard

3. **QR Generation**
   - Navigate to Emergency QR
   - ✅ QR code should generate
   - ✅ Download option should work

4. **EMS Case Creation**
   - Log in as EMS
   - Create case
   - ✅ Should complete without errors

5. **Hospital Dashboard**
   - Log in as Hospital
   - ✅ Should show available beds/status

### 4.2 Check Logs

In Vercel Dashboard:
1. Go to **Deployments → Latest Deployment**
2. Click **"Logs"** tab
3. ✅ Should show: `ready - started server on 0.0.0.0:3000`
4. ✅ No error messages

### 4.3 Test API Endpoints

```bash
# Test authentication
curl https://your-deployment-url.vercel.app/api/auth/login

# Test citizen profile
curl https://your-deployment-url.vercel.app/api/citizen/profile

# Should return: 401 or 403 (authentication required) or valid data
```

---

## Environment Variables

### Development (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET=dev-secret-key-change-in-production
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Suraksha Setu
NODE_ENV=development
```

### Production (Vercel)
```
DATABASE_URL=postgresql://user:pass@neon.tech/dbname?sslmode=require
JWT_SECRET=production_secret_min_32_characters_long_random_string
APP_URL=https://suraksha-setu.vercel.app
NEXT_PUBLIC_APP_NAME=Suraksha Setu
NODE_ENV=production
```

**⚠️ IMPORTANT:**
- Never commit `.env` file to GitHub
- Use strong random `JWT_SECRET` in production
- Keep database credentials private
- Rotate `JWT_SECRET` regularly

---

## Database Setup

### For Production (PostgreSQL)

**Using Neon:**
1. Create account: `https://neon.tech`
2. Create project
3. Create database
4. Copy connection string
5. Test connection:
```bash
psql "your-connection-string-here"
```

**Running Migrations:**
```bash
# From your machine
npx prisma migrate deploy

# From Vercel (automatic on deploy)
# Build command handles this
```

### Reset Database (if needed)

```bash
# WARNING: This deletes all data!
npx prisma migrate reset
```

---

## Troubleshooting

### Issue: Build Failed - "Prisma Migration Error"

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Check migrations
npx prisma migrate status

# If stuck, backup and reset
npx prisma migrate reset --force
npx prisma db push
npm run seed
```

### Issue: "Invalid DATABASE_URL"

**Solution:**
- Verify PostgreSQL server is running
- Check connection string syntax
- Ensure SSL mode is correct (`?sslmode=require`)
- Test locally first: `psql your-connection-string`

### Issue: "NextJS Build Failed"

**Solution:**
1. Check Node version: `node --version` (should be 18+)
2. Clear cache: `npm cache clean --force`
3. Rebuild: `npm run build`
4. Check for TypeScript errors: `npm run type-check`

### Issue: Tokens Not Working After Deployment

**Solution:**
- Generate new `JWT_SECRET` 
- Ensure `JWT_SECRET` is set in Vercel environment variables
- Redeploy: `git push` (triggers automatic Vercel rebuild)

### Issue: Database Migrations Didn't Run

**Solution:**
In Vercel Build Settings, ensure build command is:
```
npx prisma generate && npx prisma migrate deploy && next build
```

---

## Continuous Deployment

**Automatic Redeploy on Push:**

```bash
# Make changes
git add .
git commit -m "Feature: Add new functionality"

# Push to GitHub
git push origin main

# Vercel automatically detects push and redeploys
# Check deployment status: https://vercel.com/dashboard
```

---

## Rollback (If Needed)

In Vercel Dashboard:
1. Go to **Deployments**
2. Find previous working deployment
3. Click **"..." → "Promote to Production"**
4. Previous version will be restored

---

## Performance Optimization

For production, consider:

1. **Enable Image Optimization**
   - Vercel does this automatically

2. **Enable Analytics**
   - Vercel Dashboard → Analytics tab

3. **Monitor Errors**
   - Vercel Dashboard → Monitoring → Error Tracking

4. **Database Connection Pooling**
   - Add to `DATABASE_URL`: `?schema=public`

---

## Security Checklist

- ✅ Environment variables configured
- ✅ Database using SSL connection
- ✅ JWT_SECRET set to strong random value
- ✅ API routes have authentication checks
- ✅ .env file not in Git repository
- ✅ CORS properly configured
- ✅ Rate limiting considered

---

## Support & Monitoring

**Vercel Alerts:**
- Enable in Dashboard → Settings → Alerts
- Get notified of build failures

**Database Monitoring:**
- Neon: Check dashboard for connection issues
- Supabase: Monitor query performance
- Railway: Check CPU/memory usage

---

## Next Steps

1. ✅ Verify all tests passing
2. ✅ Push to GitHub
3. ✅ Deploy to Vercel
4. ✅ Test production URL
5. ✅ Set up monitoring/alerts
6. ✅ Plan backup strategy

---

**Status: READY FOR PRODUCTION** ✅

*Last Updated: May 10, 2026*
