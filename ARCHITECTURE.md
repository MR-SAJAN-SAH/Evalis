# Evalis System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Landing Page         Login Page      Protected Routes      │ │
│  │  (/)                  (/login)        (/admin, /superadmin) │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │             AuthContext (State Management)                │ │
│  │  - Access Token                                           │ │
│  │  - User Role (admin/superadmin)                          │ │
│  │  - Organization Info                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           API Service (Axios HTTP Client)                │ │
│  │  - superAdminLogin()                                     │ │
│  │  - adminLogin()                                          │ │
│  │  - createAdmin()                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────────────┐
│                   Backend (NestJS Server)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              AuthController (/auth)                       │ │
│  │  POST /superadmin/login                                  │ │
│  │  POST /superadmin/create-admin                          │ │
│  │  POST /login                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              AuthService (Business Logic)                │ │
│  │  - superAdminLogin()                                     │ │
│  │  - createAdmin()                                         │ │
│  │  - adminLogin()                                          │ │
│  │  - initializeSubscriptionPlans()                        │ │
│  │  - createOrganizationDatabase()                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           TypeORM Repositories & Entities                 │ │
│  │  - AdminRepository                                       │ │
│  │  - OrganizationRepository                               │ │
│  │  - SubscriptionPlanRepository                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕ SQL
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Databases                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Superadmin Database                             │ │
│  │           (evalis_superadmin)                            │ │
│  │                                                           │ │
│  │  ┌──────────────────┐  ┌──────────────────┐            │ │
│  │  │ subscription_    │  │                  │            │ │
│  │  │ plans            │  │  admins          │            │ │
│  │  ├──────────────────┤  ├──────────────────┤            │ │
│  │  │ id (PK)          │  │ id (PK)          │            │ │
│  │  │ name             │  │ name             │            │ │
│  │  │ pricePerYear     │  │ email (unique)   │            │ │
│  │  │ features (JSONB) │  │ password (hash)  │            │ │
│  │  │ createdAt        │  │ planId (FK)      │            │ │
│  │  └──────────────────┘  │ orgId (FK)       │            │ │
│  │          ↑              │ isActive         │            │ │
│  │          └──────────────│ createdAt        │            │ │
│  │                         └──────────────────┘            │ │
│  │                                ↑                        │ │
│  │                         ┌──────┴───────────┐            │ │
│  │                         │                  │            │ │
│  │                    ┌─────────────────┐     │            │ │
│  │                    │ organizations   │     │            │ │
│  │                    ├─────────────────┤     │            │ │
│  │                    │ id (PK)         │     │            │ │
│  │                    │ name (unique)   │─────┘            │ │
│  │                    │ databaseName    │                  │ │
│  │                    │ adminId (FK)    │                  │ │
│  │                    │ isActive        │                  │ │
│  │                    │ createdAt       │                  │ │
│  │                    └─────────────────┘                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │        Organization-Specific Databases                    │ │
│  │        (evalis_[organization_name])                      │ │
│  │                                                           │ │
│  │  Created dynamically for each organization               │ │
│  │  (To be populated with org-specific entities)            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
User Visit
    ↓
┌─────────────────────────────────────────────────────────┐
│  Landing Page (/)                                       │
│  Shows login button and features                       │
└─────────────────────────────────────────────────────────┘
    ↓ (Click Login)
┌─────────────────────────────────────────────────────────┐
│  Login Page (/login)                                    │
│  ┌─────────────────┐  or  ┌──────────────────────┐    │
│  │ Admin Mode      │       │ SuperAdmin Mode      │    │
│  │ - Email         │       │ - Email              │    │
│  │ - Organization  │       │ - Password           │    │
│  │ - Password      │       └──────────────────────┘    │
│  └─────────────────┘                                    │
└─────────────────────────────────────────────────────────┘
    ↓ (Submit)
┌─────────────────────────────────────────────────────────┐
│  Backend: POST /auth/login or                           │
│          POST /auth/superadmin/login                    │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ AuthService                                    │    │
│  │ 1. Verify credentials                         │    │
│  │ 2. Hash password check (bcrypt)               │    │
│  │ 3. Generate JWT token                         │    │
│  │ 4. Return token + role + user info            │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
    ↓ (Response)
┌─────────────────────────────────────────────────────────┐
│  Frontend: AuthContext.login()                          │
│  - Store token in localStorage                         │
│  - Store role (admin/superadmin)                       │
│  - Store user email                                    │
│  - Store organization info (if admin)                  │
└─────────────────────────────────────────────────────────┘
    ↓ (Navigate)
┌─────────────────────────────────────────────────────────┐
│  Protected Route                                        │
│  - /admin/dashboard (for admins)                       │
│  - /superadmin/dashboard (for superadmin)              │
└─────────────────────────────────────────────────────────┘
```

## Admin Creation Flow (SuperAdmin)

```
SuperAdmin Dashboard
    ↓
┌─────────────────────────────────────────────────────────┐
│  Admin Creation Form (to be built)                      │
│  - Admin Name                                           │
│  - Admin Email                                          │
│  - Admin Password                                       │
│  - Organization Name (UPPERCASE)                        │
│  - Subscription Plan (Free/Go/Advanced)                 │
└─────────────────────────────────────────────────────────┘
    ↓ (Submit)
┌─────────────────────────────────────────────────────────┐
│  Backend: POST /auth/superadmin/create-admin            │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ AuthService.createAdmin()                      │    │
│  │ 1. Check if admin email exists (prevent dup)  │    │
│  │ 2. Check if organization exists (prevent dup) │    │
│  │ 3. Hash admin password                         │    │
│  │ 4. Create org database (SQL CREATE DATABASE)  │    │
│  │ 5. Save Admin entity                           │    │
│  │ 6. Save Organization entity                    │    │
│  │ 7. Return success + admin details              │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│  Database Changes:                                      │
│  1. Superadmin DB:                                      │
│     - New row in admins table                          │
│     - New row in organizations table                    │
│  2. New organization database created                   │
│     - Database: evalis_[org_name]                      │
│     - Empty, ready for org-specific data              │
└─────────────────────────────────────────────────────────┘
```

## Data Flow: Admin Login

```
Admin Login Attempt
    ↓
┌─────────────────────────────────────────────────────────┐
│  Frontend: apiService.adminLogin(email, pwd, orgName)   │
│  Request to: POST /auth/login                           │
│  Body: { email, password, organizationName }            │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│  Backend: AuthService.adminLogin()                      │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │ 1. Find Organization by name (UPPERCASE)     │     │
│  │    ↓                                          │     │
│  │    organizationRepository.findOne({           │     │
│  │      where: { name: orgName.toUpperCase() }  │     │
│  │    })                                         │     │
│  └───────────────────────────────────────────────┘     │
│                    ↓                                    │
│  ┌───────────────────────────────────────────────┐     │
│  │ 2. If organization not found → UnAuth error  │     │
│  │    If found, get associated admin            │     │
│  │    ↓                                          │     │
│  │    adminRepository.findOne({                 │     │
│  │      where: { email, id: org.admin.id }      │     │
│  │    })                                         │     │
│  └───────────────────────────────────────────────┘     │
│                    ↓                                    │
│  ┌───────────────────────────────────────────────┐     │
│  │ 3. If admin not found → UnAuth error          │     │
│  │    Compare provided password with hash        │     │
│  │    ↓                                          │     │
│  │    bcrypt.compare(password, admin.password)  │     │
│  └───────────────────────────────────────────────┘     │
│                    ↓                                    │
│  ┌───────────────────────────────────────────────┐     │
│  │ 4. If password invalid → UnAuth error         │     │
│  │    If valid, generate JWT token              │     │
│  │    ↓                                          │     │
│  │    const payload = {                          │     │
│  │      sub: admin.id,                           │     │
│  │      email: admin.email,                      │     │
│  │      role: 'admin',                           │     │
│  │      organizationId: org.id,                  │     │
│  │      organizationName: org.name               │     │
│  │    }                                          │     │
│  │    return jwtService.sign(payload)            │     │
│  └───────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
    ↓ (Response)
┌─────────────────────────────────────────────────────────┐
│  Return to Frontend:                                    │
│  {                                                      │
│    "access_token": "jwt_token_here",                   │
│    "role": "admin",                                     │
│    "email": "admin@example.com",                        │
│    "organizationName": "ORGANIZATION",                  │
│    "subscriptionPlan": "Go"                            │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│  Frontend: AuthContext.login()                          │
│  - Save token                                           │
│  - Save role, email, org, plan                          │
│  - API interceptor adds token to all requests          │
│  - Navigate to /admin/dashboard                        │
└─────────────────────────────────────────────────────────┘
```

## Subscription Plans Structure

```
Subscription Plans Table (evalis_superadmin.subscription_plans)

┌─────────────────────────────────────────────────────────────┐
│ FREE TIER (id: 1)                                           │
├─────────────────────────────────────────────────────────────┤
│ name: "Free Tier"                                           │
│ pricePerYear: 0                                             │
│ description: "Free tier with limited features"              │
│ features: {                                                 │
│   "basicReporting": true                                    │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ GO (id: 2)                                                  │
├─────────────────────────────────────────────────────────────┤
│ name: "Go"                                                  │
│ pricePerYear: 1000                                          │
│ description: "Go subscription - 1000 INR per year"          │
│ features: {                                                 │
│   "advancedReporting": true,                               │
│   "apiAccess": true                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ADVANCED (id: 3)                                            │
├─────────────────────────────────────────────────────────────┤
│ name: "Advanced"                                            │
│ pricePerYear: 5000                                          │
│ description: "Advanced subscription - 5000 INR per year"    │
│ features: {                                                 │
│   "advancedReporting": true,                               │
│   "apiAccess": true,                                        │
│   "customIntegrations": true,                              │
│   "dedicatedSupport": true                                 │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## File Organization

```
Frontend (React + TypeScript)
src/
├── pages/
│   ├── LandingPage.tsx          ← Welcome page with login button
│   ├── LandingPage.css
│   ├── LoginPage.tsx            ← Admin/SuperAdmin login forms
│   └── LoginPage.css
├── components/
│   └── ProtectedRoute.tsx       ← Route protection wrapper
├── context/
│   └── AuthContext.tsx          ← Global auth state (useAuth hook)
├── services/
│   └── apiService.ts            ← API calls with Axios
├── App.tsx                       ← Main routing component
├── App.css
├── main.tsx                      ← React entry point
└── .env                          ← VITE_API_URL

Backend (NestJS + TypeScript)
src/
├── app.module.ts                ← Main module with TypeORM setup
├── main.ts                       ← Server entry point
├── config/
│   └── database.config.ts       ← PostgreSQL configuration
├── auth/
│   ├── auth.controller.ts       ← API endpoints (@Post, etc)
│   └── auth.service.ts          ← Business logic
├── superadmin/
│   ├── entities/
│   │   ├── admin.entity.ts      ← Admin database entity
│   │   ├── organization.entity.ts ← Organization database entity
│   │   └── subscription-plan.entity.ts ← Plan database entity
│   └── dto/
│       └── superadmin.dto.ts    ← Data transfer objects
└── .env                          ← Database & JWT configuration
```

## JWT Token Structure

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload (SuperAdmin):
{
  "sub": "superadmin",
  "email": "sajansah205@gmail.com",
  "role": "superadmin",
  "iat": 1234567890,
  "exp": 1234654290
}

Payload (Admin):
{
  "sub": "admin-uuid",
  "email": "admin@example.com",
  "role": "admin",
  "organizationId": "org-uuid",
  "organizationName": "ORGANIZATION_NAME",
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

This architecture ensures:
✅ Scalability - Organization databases can be added dynamically
✅ Security - JWT authentication, password hashing, role-based access
✅ Separation of Concerns - Clear layers (controller → service → repository)
✅ Type Safety - TypeScript with strict mode
✅ Modern UI - React with routing and context API
✅ Database Isolation - Each organization has its own database
