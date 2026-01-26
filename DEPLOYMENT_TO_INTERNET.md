# FREE DEPLOYMENT GUIDE - Evalis Application

Complete guide to deploy Evalis (Backend + Frontend + Database) to the internet for FREE.

## 🚀 DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR USERS                                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
        ▼                          ▼
┌──────────────────────┐  ┌──────────────────────┐
│  FRONTEND (Vercel)   │  │  BACKEND (Render)    │
│  React/Vite          │  │  NestJS + Node       │
│  vercel.app domain   │◄─►  render.com domain  │
└──────────────────────┘  └──────┬───────────────┘
                                  │
                                  ▼
                         ┌──────────────────────┐
                         │  DATABASE (Render)   │
                         │  PostgreSQL          │
                         │  Free Tier           │
                         └──────────────────────┘
```

---

## 📋 STEP-BY-STEP DEPLOYMENT GUIDE

### PHASE 1: PREPARE YOUR CODE (LOCAL)

#### Step 1.1: Push Code to GitHub (Already Done ✓)
Your code is already pushed to GitHub at: `c:\Users\sajan\Documents\GitHub\Evalis`

#### Step 1.2: Create Environment Configuration Files

**Backend - Create `.env.production`:**
```env
NODE_ENV=production
PORT=3000

# Database Configuration (will be updated after DB setup)
SUPERADMIN_DB_HOST=your-postgres-host.render.com
SUPERADMIN_DB_PORT=5432
SUPERADMIN_DB_USERNAME=evalis_user
SUPERADMIN_DB_PASSWORD=your_strong_password_here
SUPERADMIN_DB_NAME=evalis_superadmin

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
JWT_EXPIRATION=24h

# CORS Configuration (update with Vercel frontend URL after deployment)
CORS_ORIGIN=https://evalis.vercel.app
```

**Frontend - Create `.env.production`:**
```env
VITE_API_URL=https://evalis-backend.onrender.com/api
```

---

### PHASE 2: SET UP FREE DATABASE (Render PostgreSQL)

**Steps:**

1. **Sign up for FREE:**
   - Go to https://render.com
   - Click "Get Started" → Sign up with GitHub (recommended)

2. **Create PostgreSQL Database:**
   - Dashboard → New → PostgreSQL
   - Name: `evalis-superadmin`
   - PostgreSQL Version: 15
   - Plan: **Free** (0.15 GB storage)
   - Region: Select closest to you
   - Click "Create Database"

3. **Wait 2-3 minutes for creation**

4. **Get Connection Details:**
   - Click on database name
   - Under "Connections" → Copy these:
     - **Hostname**: `xxx.render.com`
     - **Port**: `5432`
     - **Database**: `evalis_superadmin`
     - **Username**: `evalis_user`
     - **Password**: `xxxxx` (save this!)
     - **External Database URL**: Copy full connection string

5. **Store these credentials safely** - you'll need them for backend deployment

**Cost: FREE** ✓

---

### PHASE 3: DEPLOY BACKEND (Render)

**Steps:**

1. **Sign up/Login to Render:**
   - https://render.com (use GitHub login for easier deployment)

2. **Create New Web Service:**
   - Dashboard → New → Web Service
   - Connect your GitHub account if not already connected
   - Select repository: `Evalis`
   - Branch: `main`

3. **Configure Web Service:**
   - **Name**: `evalis-backend`
   - **Environment**: `Node`
   - **Build Command**: 
     ```
     cd evalis-backend && npm install && npm run build
     ```
   - **Start Command**: 
     ```
     cd evalis-backend && npm run start:prod
     ```
   - **Plan**: **Free** (will sleep after 15 min inactivity)

4. **Add Environment Variables:**
   - Click "Advanced" → "Add Environment Variable"
   - Add all from your `.env.production`:
     ```
     NODE_ENV=production
     PORT=3000
     SUPERADMIN_DB_HOST=<from Render DB>
     SUPERADMIN_DB_PORT=5432
     SUPERADMIN_DB_USERNAME=<from Render DB>
     SUPERADMIN_DB_PASSWORD=<from Render DB>
     SUPERADMIN_DB_NAME=evalis_superadmin
     JWT_SECRET=your_long_random_secret_key
     CORS_ORIGIN=https://evalis.vercel.app
     ```

5. **Create Web Service**
   - Render will automatically deploy from GitHub
   - Wait 5-10 minutes for build to complete
   - You'll get a URL like: `https://evalis-backend-xxxx.onrender.com`
   - **Copy this URL** - needed for frontend

6. **Test Backend:**
   - Visit: `https://evalis-backend-xxxx.onrender.com/api`
   - Should show NestJS API response

**Cost: FREE** ✓ (with 15-min inactivity sleep)

---

### PHASE 4: UPDATE FRONTEND & DEPLOY (Vercel)

**Steps:**

1. **Update Frontend Environment Variable:**
   - Edit [frontend/.env.production](frontend/.env.production)
   - Replace `VITE_API_URL` with your actual backend URL:
     ```
     VITE_API_URL=https://evalis-backend-xxxx.onrender.com/api
     ```

2. **Commit and Push:**
   ```bash
   cd C:\Users\sajan\Documents\GitHub\Evalis
   git add frontend/.env.production
   git commit -m "Update backend API URL for deployment"
   git push origin main
   ```

3. **Sign up for FREE Vercel:**
   - Go to https://vercel.com
   - Click "Continue with GitHub"
   - Authorize Vercel to access your repositories

4. **Create Vercel Project:**
   - Dashboard → "New Project"
   - Select `Evalis` repository
   - **Framework**: Vite
   - **Root Directory**: `./frontend`

5. **Configure Project:**
   - Click "Override" → Add Build & Output settings:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

6. **Deploy:**
   - Click "Deploy"
   - Wait 3-5 minutes
   - Get URL like: `https://evalis.vercel.app`

7. **Update Backend CORS:**
   - Back to Render → evalis-backend service
   - Edit Environment Variables
   - Update `CORS_ORIGIN=https://evalis.vercel.app`
   - Redeploy

**Cost: FREE** ✓

---

### PHASE 5: TESTING & VERIFICATION

**Test Checklist:**

- [ ] Frontend loads: Visit `https://evalis.vercel.app`
- [ ] Backend responds: Visit `https://evalis-backend-xxxx.onrender.com/api`
- [ ] Login works: Try to login with test credentials
- [ ] API calls work: Check network tab in browser DevTools (no CORS errors)
- [ ] Database working: Create a new exam and verify data saves

**Common Issues & Fixes:**

| Issue | Solution |
|-------|----------|
| CORS errors | Update backend `CORS_ORIGIN` env var with frontend URL |
| Database connection timeout | Check Render DB hostname, port, credentials |
| Backend returns 502 | Check build logs in Render, ensure all deps installed |
| Frontend blank page | Check console for API URL errors, verify `.env.production` |
| Slow loading (first time) | Free tier apps go to sleep - first request takes 30sec |

---

## 📊 COST SUMMARY

| Service | Plan | Cost |
|---------|------|------|
| Render PostgreSQL | Free (0.15 GB) | **$0** |
| Render Backend | Free (15-min sleep) | **$0** |
| Vercel Frontend | Hobby (Unlimited) | **$0** |
| **TOTAL MONTHLY** | | **$0** |

---

## 🔄 CONTINUOUS DEPLOYMENT

After initial setup:

1. **Make code changes locally**
2. **Git push to GitHub**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Both Render and Vercel auto-deploy** from GitHub
4. **No manual deployment needed!** ✓

---

## 🛡️ SECURITY RECOMMENDATIONS

⚠️ **IMPORTANT - For production use:**

1. **Change default passwords** - Never use example passwords
2. **Generate strong JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Store secrets safely** - Use environment variables, NEVER commit to git
4. **HTTPS only** - Both Render and Vercel provide free HTTPS ✓
5. **Add database backups** - Enable backups in Render (paid feature)
6. **Rate limiting** - Consider adding rate limiting to API endpoints
7. **Validate all inputs** - Already in place with NestJS ValidationPipe ✓

---

## 📱 MONITORING & SCALING

**Free tier monitoring:**
- Render: Built-in logs and monitoring
- Vercel: Built-in analytics
- Uptime: Free tier apps sleep after 15 min - users see slow first response

**To avoid sleeping** (paid):
- Render: Upgrade to paid plan ($7/month for always-on)
- Keep-alive service: Use free services like https://www.verifalia.com/tools/uptime-monitor

---

## 🚀 NEXT STEPS

1. **Do Step-by-step now following PHASE 1-5 above**
2. **After deployment, share your URLs:**
   - Frontend: `https://evalis.vercel.app`
   - Backend: `https://evalis-backend-xxxx.onrender.com`
3. **Share with users to test**
4. **Monitor for issues and fix bugs**
5. **Consider upgrading paid plans if needed:**
   - Render Backend: $7/month (always-on)
   - Database: $19/month (500MB storage)
   - Vercel: Free is usually enough

---

## 📞 SUPPORT RESOURCES

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **NestJS Deployment**: https://docs.nestjs.com/deployment
- **Vite Build Guide**: https://vitejs.dev/guide/build.html

---

**Last Updated**: January 24, 2026
**Status**: Ready for deployment ✓
