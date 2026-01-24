# Environment Setup Validation Checklist

## PostgreSQL Setup

- [ ] PostgreSQL installed and running
  ```bash
  # Check if PostgreSQL is running (Windows)
  sc query postgresql-x64-15
  
  # Or start it
  pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start
  ```

- [ ] Create superadmin database
  ```bash
  psql -U postgres -c "CREATE DATABASE evalis_superadmin;"
  ```

- [ ] Verify database creation
  ```bash
  psql -U postgres -l | findstr evalis_superadmin
  ```

## Backend Setup

- [ ] Navigate to backend folder
  ```bash
  cd evalis-backend
  ```

- [ ] Node.js version check (v16+)
  ```bash
  node --version
  npm --version
  ```

- [ ] Dependencies installed
  ```bash
  npm list @nestjs/core
  npm list typeorm
  npm list pg
  npm list bcrypt
  ```

- [ ] Update .env file with PostgreSQL credentials
  ```
  SUPERADMIN_DB_USERNAME=postgres
  SUPERADMIN_DB_PASSWORD=your_actual_password
  SUPERADMIN_DB_HOST=localhost
  SUPERADMIN_DB_PORT=5432
  SUPERADMIN_DB_NAME=evalis_superadmin
  ```

- [ ] Verify .env variables
  ```bash
  # Backend
  echo %SUPERADMIN_DB_HOST%
  ```

- [ ] Build backend successfully
  ```bash
  npm run build
  # Should complete without errors
  ```

## Frontend Setup

- [ ] Navigate to frontend folder
  ```bash
  cd ../frontend
  ```

- [ ] Node.js version check
  ```bash
  node --version
  npm --version
  ```

- [ ] Dependencies installed
  ```bash
  npm list react
  npm list react-router-dom
  npm list axios
  ```

- [ ] Update .env file
  ```
  VITE_API_URL=http://localhost:3000
  ```

- [ ] Build frontend successfully
  ```bash
  npm run build
  # Should complete without errors
  ```

## Pre-Startup Checklist

### Database
- [ ] PostgreSQL running
- [ ] evalis_superadmin database exists
- [ ] Can connect to database with stored credentials

### Backend
- [ ] .env file complete with all variables
- [ ] npm run build completes without errors
- [ ] Port 3000 is available
  ```bash
  netstat -ano | findstr :3000
  # Should show no listening processes
  ```

### Frontend
- [ ] .env file has correct VITE_API_URL
- [ ] npm run build completes without errors
- [ ] Port 5173 is available
  ```bash
  netstat -ano | findstr :5173
  ```

## Startup Sequence

### Step 1: Start Backend
```bash
cd evalis-backend
npm run start:dev
```

**Expected Output:**
```
[Nest] 12345 - 01/23/2026, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345 - 01/23/2026, 10:30:00 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345 - 01/23/2026, 10:30:01 AM     LOG [NestFactory] Nest application successfully started
[Nest] 12345 - 01/23/2026, 10:30:01 AM     LOG [NestApplication] Listening on port 3000
```

**Verification:**
```bash
curl http://localhost:3000/auth/superadmin/login
# Should return 400 or 415 (missing body), not connection error
```

### Step 2: Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  build x.x.x

➜  Local:   http://localhost:5173/
➜  press h to show help
```

**Verification:**
```bash
# Open in browser
http://localhost:5173
# Should see Landing Page
```

## Health Checks

### Backend Health
```bash
# Check API is responding
curl -X POST http://localhost:3000/auth/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@test.com",
    "password": "test"
  }'

# Expected: UnauthorizedException response
```

### Database Health
```bash
# Check connection from backend logs
# Look for "Listening on port 3000" message
# TypeORM should have initialized superadmin database
```

### Frontend Health
```bash
# Open browser DevTools (F12)
# Console should be clean (no major errors)
# Network tab should show successful fetch to backend
```

## Common Issues & Fixes

### PostgreSQL Not Running
```bash
# Windows: Start PostgreSQL service
net start postgresql-x64-15

# Or use Services app:
# Services → PostgreSQL → Right-click → Start
```

### Port Already in Use
```bash
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

### Cannot Connect to Database
```bash
# Test connection directly
psql -U postgres -h localhost -d evalis_superadmin

# If fails, check:
# 1. PostgreSQL running
# 2. Database exists
# 3. Credentials correct
# 4. Port 5432 open (Windows Firewall)
```

### Frontend Can't Connect to Backend
```bash
# Check VITE_API_URL in frontend/.env
cat frontend/.env

# Verify backend is running
curl http://localhost:3000

# Check browser console (F12) for CORS errors
```

### TypeScript Build Errors
```bash
# Clear cache and rebuild
rm -r dist
npm run build

# Check Node version
node --version  # Should be v16+
```

## Database Initialization Check

After first backend startup, verify tables created:

```bash
# Connect to database
psql -U postgres -d evalis_superadmin

# List tables
\dt

# Expected tables:
# - subscription_plans
# - admins
# - organizations
# - typeorm_metadata (internal)
```

## Verify Subscription Plans Initialized

```bash
psql -U postgres -d evalis_superadmin -c "SELECT * FROM subscription_plans;"

# Should return 3 rows:
# 1 | Free Tier    | 0    | ...
# 2 | Go           | 1000 | ...
# 3 | Advanced     | 5000 | ...
```

## First Admin Creation Test

After both services running:

```bash
# 1. SuperAdmin Login (should succeed)
curl -X POST http://localhost:3000/auth/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sajansah205@gmail.com",
    "password": "AdminEvalis@9898"
  }'
# Copy the access_token

# 2. Create Admin (replace token)
curl -X POST http://localhost:3000/auth/superadmin/create-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Admin",
    "email": "test@example.com",
    "password": "TestPass123",
    "organizationName": "TEST_ORG",
    "subscriptionPlan": "Go"
  }'
# Should return admin details

# 3. Admin Login (should succeed)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "organizationName": "TEST_ORG"
  }'
# Should return admin token
```

## Verify Organization Database Created

After creating first admin:

```bash
# Check if new database exists
psql -U postgres -l | findstr evalis_test_org

# Should show:
# evalis_test_org | postgres | UTF8 | ...
```

## Performance Baseline

Expected startup times (first run):

| Component | Time |
|-----------|------|
| PostgreSQL startup | < 5 seconds |
| Backend compile + start | 10-15 seconds |
| Frontend dev server start | 5-10 seconds |
| DB initialization | < 2 seconds |
| First API call | 500-1000ms |

## SSL/HTTPS Notes (For Production)

- [ ] Backend: Configure https in NestJS
- [ ] Frontend: Update VITE_API_URL to https://
- [ ] Database: Enable SSL connections
- [ ] Certificate setup with Let's Encrypt

## Monitoring Commands

### Check Running Processes
```bash
# Backend process
tasklist | findstr node

# PostgreSQL process
tasklist | findstr postgres
```

### View Logs
```bash
# Backend logs
npm run start:dev
# Logs appear in terminal

# PostgreSQL logs
# Windows: C:\Program Files\PostgreSQL\15\data\pg_log
```

### Resource Usage
```bash
# Memory and CPU
Get-Process | where {$_.Name -like "*node*"} | Select-Object Name, CPU, WS
Get-Process | where {$_.Name -like "*postgres*"} | Select-Object Name, CPU, WS
```

---

**Setup Complete!** ✅

Once all checkboxes are marked, your Evalis system is ready for development.
