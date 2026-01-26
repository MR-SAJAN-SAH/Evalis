# DEPLOYMENT QUICK REFERENCE

**Created**: January 24, 2026  
**Status**: Ready for Internet Deployment (FREE TIER)

---

## 🎯 DEPLOYMENT OVERVIEW

Your Evalis application is ready to be deployed on the internet completely **FREE**. This document provides quick reference for deployment configuration.

---

## 📦 SERVICES TO DEPLOY

### 1️⃣ DATABASE - PostgreSQL (Render)
- **Cost**: FREE
- **Size**: 0.15 GB (sufficient for testing)
- **Setup Time**: 5 minutes
- **Service**: Render PostgreSQL
- **Link**: https://render.com

### 2️⃣ BACKEND - NestJS API (Render)
- **Cost**: FREE (sleeps after 15 min inactivity)
- **Language**: Node.js (TypeScript)
- **Setup Time**: 10 minutes
- **Service**: Render Web Service
- **Link**: https://render.com

### 3️⃣ FRONTEND - React App (Vercel)
- **Cost**: FREE
- **Framework**: React + Vite
- **Setup Time**: 5 minutes
- **Service**: Vercel
- **Link**: https://vercel.com

---

## 🚀 DEPLOYMENT QUICK STEPS

### STEP 1: Create Database (2-3 min)
```
1. Go to https://render.com
2. Sign up with GitHub
3. New → PostgreSQL
4. Name: evalis-superadmin
5. Plan: Free
6. Create Database
7. Copy connection details
```

### STEP 2: Deploy Backend (10 min)
```
1. Go to https://render.com/dashboard
2. New → Web Service
3. Connect GitHub repository: Evalis
4. Name: evalis-backend
5. Environment: Node
6. Build: cd evalis-backend && npm install && npm run build
7. Start: cd evalis-backend && npm run start:prod
8. Plan: Free
9. Add Environment Variables (from .env.example)
10. Create → Wait for deployment
11. Copy your backend URL: https://evalis-backend-xxxx.onrender.com
```

### STEP 3: Update Frontend & Deploy (5 min)
```
1. Edit frontend/.env.production
2. Set VITE_API_URL=https://evalis-backend-xxxx.onrender.com/api
3. Git push
4. Go to https://vercel.com
5. New Project → Select Evalis
6. Framework: Vite
7. Root Directory: ./frontend
8. Deploy
9. Your frontend URL: https://evalis.vercel.app
```

### STEP 4: Update Backend CORS & Redeploy (2 min)
```
1. Go to Render backend settings
2. Edit Environment Variable: CORS_ORIGIN=https://evalis.vercel.app
3. Redeploy
```

---

## 🔧 ENVIRONMENT VARIABLES

### Backend (.env.production)
```env
NODE_ENV=production
PORT=3000
SUPERADMIN_DB_HOST=<from Render>
SUPERADMIN_DB_PORT=5432
SUPERADMIN_DB_USERNAME=evalis_user
SUPERADMIN_DB_PASSWORD=<from Render>
SUPERADMIN_DB_NAME=evalis_superadmin
JWT_SECRET=<generate new random string>
CORS_ORIGIN=https://evalis.vercel.app
```

### Frontend (.env.production)
```env
VITE_API_URL=https://evalis-backend-xxxx.onrender.com/api
```

---

## 📋 DEPLOYMENT CHECKLIST

- [ ] Code committed to GitHub ✓
- [ ] `.env.example` files created ✓
- [ ] Dockerfile optimized ✓
- [ ] Database set up on Render
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL
- [ ] Test login functionality
- [ ] Test create/view exams
- [ ] Check no console errors
- [ ] Share URLs with users

---

## 🔗 IMPORTANT URLS

### During Deployment (Update these as you deploy)

| Service | Provider | URL | Status |
|---------|----------|-----|--------|
| Frontend | Vercel | https://evalis.vercel.app | ⏳ Pending |
| Backend | Render | https://evalis-backend-xxxx.onrender.com | ⏳ Pending |
| Database | Render | render.com | ⏳ Pending |

---

## ⚠️ COMMON ISSUES & SOLUTIONS

### "CORS error" on login
**Solution**: Backend's `CORS_ORIGIN` env var doesn't match frontend URL
- Update in Render → Redeploy backend

### "Cannot reach backend" 
**Solution**: Backend URL wrong in frontend `.env.production`
- Update and redeploy frontend on Vercel

### "Database connection timeout"
**Solution**: Render DB credentials wrong
- Verify hostname, port, username, password
- Check Render database connection string

### App is very slow first time
**Normal for free tier!** First request wakes up sleeping server (30 sec)
- Consider upgrading for always-on ($7/month)

---

## 🛡️ SECURITY RECOMMENDATIONS

### Before Going Live

1. **Generate Strong JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Change Default Passwords**
   - Never use `password123` etc.
   - Use strong, random credentials

3. **Enable HTTPS** ✓ (Already enabled on Render & Vercel)

4. **Rate Limiting** - Add if needed:
   ```typescript
   @UseGuards(ThrottlerGuard)
   @Throttle(10, 60) // 10 requests per 60 seconds
   ```

5. **Never Commit Secrets**
   - Use `.env` files (not `.env.production`)
   - Add to `.gitignore`

---

## 📊 COST BREAKDOWN

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Render PostgreSQL | $0 | 0.15 GB storage |
| Render Backend | $0 | Sleeps after 15 min inactivity |
| Vercel Frontend | $0 | Unlimited (hobby plan) |
| **Total** | **$0/month** | Suitable for testing & small usage |

### To Upgrade (Optional, for always-on)
- Render Backend: +$7/month → Always on
- Render Database: +$19/month → 500MB storage

---

## 📞 GETTING HELP

1. **Deployment Guide**: See `DEPLOYMENT_TO_INTERNET.md`
2. **Render Docs**: https://render.com/docs
3. **Vercel Docs**: https://vercel.com/docs
4. **NestJS Docs**: https://docs.nestjs.com
5. **Vite Docs**: https://vitejs.dev

---

## ✅ READY TO DEPLOY!

Your application is fully prepared. Follow the quick steps above and you'll have Evalis live on the internet in **~30 minutes** - completely free!

**Next Step**: Run `prepare-deployment.bat` (Windows) or `prepare-deployment.sh` (Linux/Mac)

---

*Last Updated: January 24, 2026*
