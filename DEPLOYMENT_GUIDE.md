# Deployment Guide for Evalis

## Step 1: Prepare GitHub Repository

### Create a GitHub Account (if you don't have one)
1. Go to https://github.com
2. Sign up for free
3. Create a new repository named "evalis"

### Push Your Code to GitHub
```bash
cd C:\Users\sajan\Documents\Evalis

# Add all files
git add .

# Commit with a message
git commit -m "Initial commit - Evalis project"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/evalis.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Frontend with Vercel

### Quick Setup
1. Go to https://vercel.com
2. Click "Sign up" → Choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub account
4. Click "New Project"
5. Select your "evalis" repository
6. Select "frontend" folder in "Root Directory"
7. Under "Environment Variables", add:
   - `VITE_API_URL` = `https://your-railway-backend-url.com`
   - Click "Deploy"

**Frontend is now LIVE!** 🎉

---

## Step 3: Deploy Backend with Railway

### Setup Instructions
1. Go to https://railway.app
2. Sign up with GitHub
3. Create "New Project" → "Deploy from GitHub repo"
4. Select your "evalis" repository
5. Select "evalis-backend" as the root directory
6. Railway auto-detects Node.js project
7. Click "Deploy"

### Configure Environment Variables in Railway
1. Go to your Railway project
2. Click on the "evalis-backend" service
3. Go to "Variables" tab
4. Add these variables:
   - `DATABASE_URL` = Your MongoDB Atlas or database connection string
   - `JWT_SECRET` = A random secure string (e.g., generate with `openssl rand -hex 32`)
   - `NODE_ENV` = `production`

### Get Your Backend URL
1. In Railway, go to "Settings" for your backend service
2. Copy the "Public URL" (looks like `https://evalis-production-xxx.up.railway.app`)
3. This is your `BACKEND_URL`

---

## Step 4: Update Frontend with Backend URL

1. Go to Vercel dashboard
2. Select your "evalis" project
3. Go to "Settings" → "Environment Variables"
4. Update `VITE_API_URL` to your Railway backend URL
5. Click "Save"
6. Go to "Deployments" → Click on latest deployment → "Redeploy"

**Your app is now FULLY DEPLOYED!** 🚀

---

## Step 5: Setup Database

### Option A: MongoDB Atlas (Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a cluster (Free tier)
4. Create a database user
5. Get connection string
6. Copy string to Railway `DATABASE_URL`

### Option B: Railway PostgreSQL
1. In Railway dashboard
2. Create "New Service" → "PostgreSQL"
3. Copy the provided `DATABASE_URL`
4. Add to environment variables

---

## Continuous Deployment (Auto-Updates)

After this setup, every time you push code to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main
```

✅ **Vercel automatically redeploys frontend** (2-3 minutes)
✅ **Railway automatically redeploys backend** (2-3 minutes)

---

## Managing Secrets Safely

**NEVER commit `.env` file to GitHub!**

1. The `.gitignore` file already prevents this
2. Always set environment variables in:
   - Vercel dashboard (frontend)
   - Railway dashboard (backend)

---

## Testing Your Deployment

1. Go to your Vercel URL
2. Check if the app loads
3. Test all features
4. Check browser console for errors (F12)
5. If errors, check Railway logs:
   - Railway dashboard → Your backend → "Logs" tab

---

## Troubleshooting

### Frontend not connecting to backend
- Check VITE_API_URL in Vercel environment variables
- Verify Railway backend is running (check Railway logs)
- Check browser console for CORS errors

### Backend won't deploy
- Check Railway logs for build errors
- Ensure `npm run build` works locally
- Verify DATABASE_URL is correct

### Database connection failing
- Test database connection string locally
- Verify database exists and user has permissions
- Check Railway DATABASE_URL variable

---

## Next Steps

1. **Custom Domain**: In Vercel/Railway settings, add your domain
2. **Monitoring**: Set up Railway alerts for downtime
3. **Backups**: Enable database backups
4. **SSL**: Both Vercel and Railway handle SSL automatically

Questions? Check the logs in Vercel/Railway dashboards!
