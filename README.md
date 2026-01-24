# Evalis - Comprehensive Exam Management System

[![Status](https://img.shields.io/badge/Status-Phase%201%20Complete-green)](https://github.com/yourusername/evalis)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019-blue)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-NestJS%2011-red)](https://nestjs.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2012-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-yellow)](#)

Evalis is a modern, scalable exam management platform built with enterprise-grade architecture. It supports multiple organizations with separate databases, flexible subscription tiers, and comprehensive authentication.

---

## 🚀 Features

### Current Implementation (Phase 1)
- ✅ **Multi-Organization Support** - Isolated databases per organization
- ✅ **Role-Based Authentication** - SuperAdmin and Admin roles with JWT tokens
- ✅ **Secure Password Handling** - Bcrypt encryption for all passwords
- ✅ **Subscription Management** - Free Tier, Go, and Advanced plans
- ✅ **Dynamic Database Creation** - Auto-create organization databases
- ✅ **Protected Routes** - Role-based access control on frontend
- ✅ **Responsive UI** - Mobile, tablet, and desktop support
- ✅ **RESTful APIs** - Well-structured backend endpoints
- ✅ **Type-Safe Code** - Full TypeScript implementation

### Coming Soon (Phase 2+)
- [ ] Admin dashboards
- [ ] Candidate management
- [ ] Exam management system
- [ ] Real-time exam monitoring
- [ ] Advanced analytics and reporting
- [ ] Payment integration

---

## 📋 Tech Stack

### Frontend
- **Framework:** React 19.2.0
- **Language:** TypeScript
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Build Tool:** Vite
- **Styling:** CSS3

### Backend
- **Framework:** NestJS 11
- **Language:** TypeScript
- **ORM:** TypeORM
- **Database:** PostgreSQL 12+
- **Authentication:** JWT + Bcrypt
- **Validation:** class-validator

### Infrastructure
- **Port:** 3000 (Backend), 5173 (Frontend)
- **Database:** PostgreSQL 12+
- **Runtime:** Node.js 16+

---

## 🏗 Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  Landing Page → Login → Dashboard       │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON
┌──────────────▼──────────────────────────┐
│      Backend (NestJS)                   │
│  AuthController → AuthService → DB      │
└──────────────┬──────────────────────────┘
               │ SQL
┌──────────────▼──────────────────────────┐
│      PostgreSQL Databases                │
│  Superadmin DB + Org-Specific DBs       │
└─────────────────────────────────────────┘
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed system diagrams.

---

## ⚡ Quick Start

### Prerequisites
- Node.js v16+
- PostgreSQL v12+
- npm or yarn

### 1. Create Database
```bash
psql -U postgres -c "CREATE DATABASE evalis_superadmin;"
```

### 2. Setup Backend
```bash
cd evalis-backend
npm install
npm run start:dev  # Runs on http://localhost:3000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

### 4. Access Application
```
Open http://localhost:5173 in your browser
```

### 5. Default Login
```
Email:    sajansah205@gmail.com
Password: AdminEvalis@9898
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute setup guide |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed setup instructions |
| [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) | API endpoint testing |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design and flow |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues and solutions |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Feature list and implementation |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Project overview and status |
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | Documentation guide |
| [SETUP_VALIDATION.md](SETUP_VALIDATION.md) | Startup verification checklist |

**New to Evalis?** Start with [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## 🔐 Default Credentials

### SuperAdmin Account
```
Email:    sajansah205@gmail.com
Password: AdminEvalis@9898
```

⚠️ **Important:** Change this password in production!

---

## 📊 Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **Free Tier** | Free | Basic reporting |
| **Go** | ₹1,000/year | Advanced reporting, API access |
| **Advanced** | ₹5,000/year | Full features + dedicated support |

---

## 🔑 API Endpoints

### Authentication
```bash
# SuperAdmin Login
POST /auth/superadmin/login
Body: { email, password }

# Create Admin (SuperAdmin only)
POST /auth/superadmin/create-admin
Body: { name, email, password, organizationName, subscriptionPlan }

# Admin Login
POST /auth/login
Body: { email, password, organizationName }
```

See [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for detailed examples.

---

## 🛣 Frontend Routes

| Route | Purpose | Authentication |
|-------|---------|-----------------|
| `/` | Landing page | None |
| `/login` | Login page | None |
| `/admin/dashboard` | Admin dashboard | Required (admin) |
| `/superadmin/dashboard` | SuperAdmin dashboard | Required (superadmin) |

---

## 📁 Project Structure

```
evalis-backend/
├── src/
│   ├── app.module.ts                 (Main module)
│   ├── config/database.config.ts     (Database setup)
│   ├── auth/                         (Authentication)
│   ├── superadmin/                   (SuperAdmin features)
│   └── main.ts                       (Entry point)
├── .env                              (Configuration)
└── package.json

frontend/
├── src/
│   ├── App.tsx                       (Main app)
│   ├── pages/                        (Landing, Login)
│   ├── context/AuthContext.tsx       (State management)
│   ├── services/apiService.ts        (API client)
│   └── components/                   (Components)
├── .env                              (Configuration)
└── package.json
```

---

## ⚙️ Environment Variables

### Backend (.env)
```
# Database
SUPERADMIN_DB_HOST=localhost
SUPERADMIN_DB_PORT=5432
SUPERADMIN_DB_USERNAME=postgres
SUPERADMIN_DB_PASSWORD=your_password
SUPERADMIN_DB_NAME=evalis_superadmin

# SuperAdmin Credentials
SUPERADMIN_EMAIL=sajansah205@gmail.com
SUPERADMIN_PASSWORD=AdminEvalis@9898

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRATION=24h

# Server
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

---

## 🧪 Testing

### Quick Test
```bash
# Login as SuperAdmin
curl -X POST http://localhost:3000/auth/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sajansah205@gmail.com",
    "password": "AdminEvalis@9898"
  }'
```

See [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for more examples.

---

## 🚀 Deployment

### Prerequisites
- Server with Node.js v16+
- PostgreSQL database
- SSL/HTTPS certificates

### Build for Production
```bash
# Backend
cd evalis-backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
# Serve dist/ folder
```

### Security Checklist
- [ ] Update JWT_SECRET
- [ ] Configure HTTPS
- [ ] Set NODE_ENV=production
- [ ] Disable database synchronization
- [ ] Set strong database passwords
- [ ] Configure CORS for production domain
- [ ] Enable SQL injection prevention
- [ ] Set up rate limiting
- [ ] Configure logging
- [ ] Set up monitoring

See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for full deployment checklist.

---

## 🐛 Troubleshooting

Common issues and solutions are documented in [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

Quick diagnostics:
```bash
# Check PostgreSQL
psql -U postgres -l

# Check Node.js
node --version
npm --version

# Check ports
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

---

## 📈 Project Status

**Phase 1: ✅ COMPLETE**
- Foundation and authentication system
- Database setup and entity models
- API endpoints for superadmin and admin
- Frontend landing and login pages
- Protected routes and role-based access

**Phase 2: 🔄 IN PLANNING**
- Admin dashboards
- Organization settings
- User management

**Phase 3+: 📅 PLANNED**
- Exam management
- Candidate system
- Evaluation system
- Advanced features

---

## 🤝 Contributing

While this is currently a proprietary project, feel free to review the code and implementation.

### Code Quality Standards
- TypeScript with strict mode
- ESLint for code style
- Input validation on all endpoints
- Comprehensive error handling
- Responsive design principles

---

## 📝 License

This project is proprietary and confidential.

---

## 👨‍💼 Project Information

- **Status:** Active Development (Phase 1 Complete)
- **Created:** January 23, 2026
- **Version:** 1.0.0
- **Database:** PostgreSQL 12+
- **Node.js:** v16+

---

## 📞 Support

For setup assistance:
1. Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
2. Review relevant documentation
3. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 🎯 Next Steps

1. **New User?** → Read [QUICK_START.md](QUICK_START.md)
2. **Need Setup Help?** → Read [SETUP_GUIDE.md](SETUP_GUIDE.md)
3. **Want to Test?** → Check [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)
4. **Understand System?** → Read [ARCHITECTURE.md](ARCHITECTURE.md)
5. **Having Issues?** → Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 🎉 Ready to Use!

Your Evalis system is fully implemented and ready for development.

```bash
# Quick start command
cd evalis-backend && npm run start:dev &
cd ../frontend && npm run dev
```

Open http://localhost:5173 and login with:
- Email: `sajansah205@gmail.com`
- Password: `AdminEvalis@9898`

---

**Happy coding! 🚀**

Built with ❤️ using React, NestJS, and PostgreSQL.
