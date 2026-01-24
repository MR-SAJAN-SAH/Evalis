# Troubleshooting Guide

## Common Issues and Solutions

---

## Backend Issues

### 1. Port 3000 Already in Use

**Error Message:**
```
Error: listen EADDRINUSE :::3000
```

**Solution:**

**Option A: Find and Kill Process**
```bash
# Find process using port 3000
netstat -ano | findstr :3000
# Output: TCP    0.0.0.0:3000    LISTENING    12345

# Kill the process
taskkill /PID 12345 /F
```

**Option B: Use Different Port**
```bash
# Edit .env
PORT=3001

# Restart backend
npm run start:dev
```

---

### 2. Cannot Connect to PostgreSQL Database

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causes & Solutions:**

**PostgreSQL Not Running**
```bash
# Start PostgreSQL service
net start postgresql-x64-15

# If that doesn't work, start it manually
"C:\Program Files\PostgreSQL\15\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\15\data" start
```

**Wrong Credentials in .env**
```bash
# Test connection manually
psql -U postgres -h localhost -d evalis_superadmin

# If it fails, check:
# 1. Username (default: postgres)
# 2. Password (what you set during PostgreSQL installation)
# 3. Database name (should be: evalis_superadmin)
```

**Database Doesn't Exist**
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE evalis_superadmin;"

# Verify it was created
psql -U postgres -l | findstr evalis_superadmin
```

**Fix in .env**
```
SUPERADMIN_DB_HOST=localhost
SUPERADMIN_DB_PORT=5432
SUPERADMIN_DB_USERNAME=postgres
SUPERADMIN_DB_PASSWORD=your_actual_password
SUPERADMIN_DB_NAME=evalis_superadmin
```

---

### 3. TypeScript Compilation Errors

**Error Message:**
```
error TS2345: Argument of type 'string | undefined' is not assignable...
```

**Solution:**

This is usually fixed if you just rebuilt. But if it persists:

```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

### 4. JWT_SECRET Not Set

**Error Message:**
```
JwtModule: secret is undefined
```

**Solution:**
```bash
# Edit .env and add:
JWT_SECRET=your_super_secret_key_change_this_in_production

# Restart backend
npm run start:dev
```

---

### 5. SuperAdmin Login Fails

**Error Message:**
```
UnauthorizedException: Invalid superadmin credentials
```

**Solution:**

Verify credentials in `.env`:
```bash
# Must be exactly:
SUPERADMIN_EMAIL=sajansah205@gmail.com
SUPERADMIN_PASSWORD=AdminEvalis@9898
```

**Test with curl:**
```bash
curl -X POST http://localhost:3000/auth/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sajansah205@gmail.com",
    "password": "AdminEvalis@9898"
  }'

# Should return: { "access_token": "...", "role": "superadmin", ... }
```

---

### 6. Organization Database Creation Fails

**Error Message:**
```
BadRequestException: Failed to create organization database
```

**Causes:**

**PostgreSQL user doesn't have CREATE DATABASE permission**
```bash
# Connect as admin user
psql -U postgres

# Give permissions
ALTER USER postgres CREATEDB;
```

**Database name already exists**
```bash
# Try with different organization name
# Or delete the old database:
DROP DATABASE evalis_existing_org;
```

---

### 7. Cannot Find Subscription Plans

**Error Message:**
```
BadRequestException: Invalid subscription plan
```

**Solution:**

Check if subscription plans were initialized:
```bash
# Connect to database
psql -U postgres -d evalis_superadmin

# Check plans table
SELECT * FROM subscription_plans;

# Should return 3 rows. If empty, restart backend:
npm run start:dev
# Backend will automatically initialize on startup
```

---

## Frontend Issues

### 1. Port 5173 Already in Use

**Error Message:**
```
Port 5173 is already in use
```

**Solution:**

**Option A: Kill Process**
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Option B: Use Different Port**
```bash
# Vite will automatically use next available port
npm run dev
# Watch output for the actual port being used
```

---

### 2. Cannot Connect to Backend

**Error Message (in console):**
```
Failed to fetch from http://localhost:3000
```

**Causes & Solutions:**

**Backend Not Running**
```bash
# Check if backend is running
netstat -ano | findstr :3000

# If not, start it
cd evalis-backend
npm run start:dev
```

**Wrong API URL in .env**
```bash
# Edit frontend/.env
VITE_API_URL=http://localhost:3000
```

**CORS Not Enabled**
The backend needs to accept requests from localhost:5173.
Current implementation should handle this automatically.

**Network Issues**
```bash
# Test connection directly
curl http://localhost:3000

# If failed, backend might be down
```

---

### 3. Blank Page After Login

**Causes:**

**Token Not Being Stored**
```bash
# Check browser localStorage
# Open DevTools (F12) → Application → Local Storage
# Should show:
# - accessToken
# - role
# - userEmail
# - organizationName (for admins)
```

**Protected Route Issues**
```bash
# Check browser console for errors
# F12 → Console tab
```

**Solution:**
```bash
# Clear localStorage and try again
# F12 → Application → Local Storage → Clear All
# Then login again
```

---

### 4. Login Form Not Submitting

**Causes:**

**Validation Errors**
- Email not valid format
- Password too short
- Organization name empty (for admin login)

**Solution:**
```bash
# Check browser console for validation messages
# Ensure all fields are filled correctly
```

**Network Issues**
```bash
# Check Network tab in DevTools (F12)
# Look for failed requests to backend
```

---

### 5. Cannot Switch Between Login Modes

**Solution:**
Make sure you're clicking the "Admin Login" or "SuperAdmin Login" tabs at the top of the login form.

---

### 6. Styling/CSS Not Loading

**Solution:**

```bash
# Clear Vite cache
rm -r node_modules/.vite

# Rebuild
npm run build

# Or restart dev server
npm run dev
```

---

## Database Issues

### 1. Cannot List Tables

**Command:**
```bash
psql -U postgres -d evalis_superadmin -c "\dt"
```

**Expected Output:**
```
              List of relations
 Schema |        Name        | Type  | Owner    
--------+--------------------+-------+----------
 public | admin              | table | postgres
 public | organization       | table | postgres
 public | subscription_plan  | table | postgres
```

**If Empty:**
Restart backend - it will initialize tables automatically.

---

### 2. Database Stuck or Corrupted

**Solution:**

```bash
# Connect as admin
psql -U postgres

# Drop the database
DROP DATABASE evalis_superadmin;

# Recreate it
CREATE DATABASE evalis_superadmin;

# Exit
\q

# Restart backend
npm run start:dev
# Tables will be recreated automatically
```

---

### 3. Check for Deadlocks

**Command:**
```bash
psql -U postgres -d evalis_superadmin -c "
  SELECT * FROM pg_stat_activity 
  WHERE state = 'active';
"
```

**If Many Processes:**
```bash
# Kill all connections
psql -U postgres -d evalis_superadmin -c "
  SELECT pg_terminate_backend(pid) 
  FROM pg_stat_activity 
  WHERE datname = 'evalis_superadmin' 
  AND pid <> pg_backend_pid();
"
```

---

## Authentication Issues

### 1. JWT Token Expired

**Error:**
```
UnauthorizedException: Jwt malformed
```

**Solution:**
The token expires after 24 hours (configurable in .env).
User needs to login again to get a new token.

---

### 2. Wrong Organization Name on Login

**Error:**
```
UnauthorizedException: Organization not found
```

**Solution:**
```bash
# Organization names are case-sensitive and stored in UPPERCASE
# If you created: "My Organization"
# Login with: "MY ORGANIZATION"

# Or exactly as returned by API
```

---

### 3. Wrong Email or Password

**Error:**
```
UnauthorizedException: Invalid credentials
```

**Solution:**
```bash
# Double-check:
# 1. Email is spelled correctly
# 2. Password is correct (case-sensitive)
# 3. For admin login, organization name is correct
```

---

## Performance Issues

### 1. Slow Login Response

**Causes:**
- Database query taking too long
- Network latency
- Server processing

**Solution:**

```bash
# Check network tab in browser DevTools
# F12 → Network → Try login again
# Look for response times

# If consistently slow:
# 1. Check database connection performance
# 2. Verify no other heavy processes running
# 3. Check RAM usage
```

---

### 2. Frontend Slow to Load

**Solutions:**

```bash
# Rebuild frontend
npm run build

# Check what's slow in DevTools
# F12 → Performance tab → Record → Reload

# Clear browser cache
# F12 → Application → Clear Storage
```

---

## Getting Help

### 1. Check Logs

**Backend Logs:**
Look at the terminal where you ran `npm run start:dev`

**Frontend Logs:**
```bash
# Browser console (F12 → Console tab)
# Look for red error messages
```

**Database Logs:**
```bash
# On Windows:
# C:\Program Files\PostgreSQL\15\data\pg_log
```

---

### 2. Test API Directly

Use curl to test if API is working:

```bash
# Test if backend is running
curl http://localhost:3000

# Test superadmin login
curl -X POST http://localhost:3000/auth/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "sajansah205@gmail.com", "password": "AdminEvalis@9898"}'
```

---

### 3. Restart Everything

If nothing works:

```bash
# 1. Stop both services (Ctrl+C in terminals)

# 2. Kill hanging processes
taskkill /IM node.exe /F
taskkill /IM postgres.exe /F

# 3. Start fresh
# Terminal 1:
cd evalis-backend
npm run start:dev

# Terminal 2 (after backend starts):
cd frontend
npm run dev
```

---

### 4. Check System Requirements

```bash
# Node.js version (need v16+)
node --version

# npm version
npm --version

# PostgreSQL running
tasklist | findstr postgres

# Open ports
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

---

## Quick Diagnostic Checklist

Run these to diagnose issues:

```bash
# 1. PostgreSQL running?
sc query postgresql-x64-15 | findstr STATE

# 2. Database exists?
psql -U postgres -l | findstr evalis_superadmin

# 3. Backend running?
netstat -ano | findstr :3000

# 4. Frontend running?
netstat -ano | findstr :5173

# 5. Node version correct?
node --version

# 6. npm dependencies installed?
npm list @nestjs/core | head -3

# 7. Backend builds?
cd evalis-backend && npm run build

# 8. Frontend builds?
cd ../frontend && npm run build
```

---

## Contact Support

When reporting issues, include:

1. **Error Message** - Exact error text
2. **Logs** - Terminal output or browser console
3. **Steps to Reproduce** - How to recreate the issue
4. **System Info**
   - OS (Windows/Mac/Linux)
   - Node version
   - PostgreSQL version
5. **Attempted Fixes** - What you've already tried

---

**Tip:** Most issues are resolved by:
1. Restarting services
2. Checking .env files
3. Verifying PostgreSQL is running
4. Clearing caches and rebuilding

Good luck! 🚀
