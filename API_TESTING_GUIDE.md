# API Testing Guide

Use these curl commands or Postman to test the API endpoints.

## 1. SuperAdmin Login

```bash
curl -X POST http://localhost:3000/auth/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sajansah205@gmail.com",
    "password": "AdminEvalis@9898"
  }'
```

Expected Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "superadmin",
  "email": "sajansah205@gmail.com"
}
```

## 2. Create Admin (SuperAdmin Only)

```bash
curl -X POST http://localhost:3000/auth/superadmin/create-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "organizationName": "ACME_CORPORATION",
    "subscriptionPlan": "Go"
  }'
```

Expected Response:
```json
{
  "message": "Admin created successfully",
  "admin": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "organization": {
      "name": "ACME_CORPORATION",
      "databaseName": "evalis_acme_corporation"
    },
    "subscriptionPlan": "Go"
  }
}
```

## 3. Admin Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123",
    "organizationName": "ACME_CORPORATION"
  }'
```

Expected Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "email": "john@example.com",
  "organizationName": "ACME_CORPORATION",
  "subscriptionPlan": "Go"
}
```

## Test Flow

1. First, login as SuperAdmin using endpoint #1
2. Use the `access_token` from the response in the Authorization header for endpoint #2
3. Create an admin with one of the three subscription plans
4. Use the admin credentials to login using endpoint #3

## Subscription Plan Options
- "Free Tier"
- "Go"
- "Advanced"

## Notes
- Organization names will automatically be converted to UPPERCASE
- Databases are created automatically when an admin is created
- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 24 hours (configurable in .env)
