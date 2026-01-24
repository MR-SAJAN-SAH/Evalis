# Quick Start Guide

## Prerequisites
- Node.js v16+
- PostgreSQL v12+
- npm or yarn

## 1️⃣ Database Setup

Create the superadmin database:
```sql
CREATE DATABASE evalis_superadmin;
```

## 2️⃣ Backend Setup & Run

```bash
# Navigate to backend
cd evalis-backend

# Install dependencies (already done)
npm install

# Update .env with your database credentials
# SUPERADMIN_DB_USERNAME=postgres
# SUPERADMIN_DB_PASSWORD=your_password

# Start development server
npm run start:dev

# Server runs on http://localhost:3000
```

## 3️⃣ Frontend Setup & Run

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Frontend runs on http://localhost:5173
```

## 4️⃣ Access the Application

1. **Open in Browser**: `http://localhost:5173`
2. **Landing Page** appears automatically
3. **Click "Login"** to go to login page

## 5️⃣ Default SuperAdmin Credentials

```
Email: sajansah205@gmail.com
Password: AdminEvalis@9898
```

## 6️⃣ Create Your First Admin

Using the SuperAdmin credentials, create an admin:

```bash
curl -X POST http://localhost:3000/auth/superadmin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "organizationName": "MY_ORGANIZATION",
    "subscriptionPlan": "Go"
  }'
```

## 7️⃣ Login as Admin

Email: `john@example.com`
Password: `SecurePassword123`
Organization: `MY_ORGANIZATION`

## Directory Structure

```
Evalis/
├── evalis-backend/        ← Backend (NestJS)
├── frontend/              ← Frontend (React)
├── SETUP_GUIDE.md         ← Detailed setup
├── API_TESTING_GUIDE.md   ← API examples
└── IMPLEMENTATION_SUMMARY.md ← Full documentation
```

## Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/superadmin/login` | SuperAdmin login |
| POST | `/auth/superadmin/create-admin` | Create admin |
| POST | `/auth/login` | Admin login |

## Frontend Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Landing page | No |
| `/login` | Login page | No |
| `/admin/dashboard` | Admin dashboard | Yes (admin) |
| `/superadmin/dashboard` | SuperAdmin dashboard | Yes (superadmin) |

## Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| Free Tier | Free | Basic Reporting |
| Go | ₹1000/year | Advanced Reporting, API Access |
| Advanced | ₹5000/year | Full features + Dedicated Support |

## Common Commands

### Backend
```bash
npm run start:dev      # Development mode
npm run build          # Build for production
npm run test           # Run tests
npm run lint           # Lint code
```

### Frontend
```bash
npm run dev            # Development mode
npm run build          # Build for production
npm run preview        # Preview build
npm run lint           # Lint code
```

## Troubleshooting

**Port 3000 already in use?**
```bash
# Kill the process or change PORT in .env
set PORT=3001
```

**Database connection failed?**
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Verify database exists

**Frontend can't connect to backend?**
- Ensure backend is running on http://localhost:3000
- Check VITE_API_URL in frontend `.env`

**Forgot SuperAdmin Password?**
- Hard-coded: `AdminEvalis@9898`
- Located in: `evalis-backend/.env`

## Next Steps

1. ✅ Application is running
2. 📋 Create admin accounts as needed
3. 📊 Build dashboards for each role
4. 👥 Implement user management
5. 📝 Add exam management features

## Documentation Files

- **SETUP_GUIDE.md** - Complete setup instructions
- **API_TESTING_GUIDE.md** - Test API endpoints
- **IMPLEMENTATION_SUMMARY.md** - Full feature list
- **QUICK_START.md** - This file

## Support

For issues or questions:
1. Check the documentation files
2. Review error messages in browser console
3. Check backend logs in terminal
4. Verify .env configuration

---

**Happy Coding! 🚀**
