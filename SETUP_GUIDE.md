# Evalis - Exam Management System

A comprehensive exam management system built with NestJS and React, supporting multiple organizations with separate databases and flexible subscription plans.

## Features Implemented

### Backend (NestJS)
- ✅ PostgreSQL database setup for superadmin
- ✅ Dynamic database creation for organizations
- ✅ JWT-based authentication
- ✅ SuperAdmin authentication endpoint (`/auth/superadmin/login`)
- ✅ Admin creation with organization setup
- ✅ Three subscription plans: Free Tier, Go (1000 INR/year), Advanced (5000 INR/year)
- ✅ Role-based access control

### Frontend (React)
- ✅ Landing page with login button
- ✅ Login page with dual modes (Admin/SuperAdmin)
- ✅ Protected routes with authentication context
- ✅ JWT token management
- ✅ Responsive UI with modern styling

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup

1. Create a PostgreSQL database for superadmin:
```sql
CREATE DATABASE evalis_superadmin;
```

2. Update the `.env` file in the backend with your PostgreSQL credentials:
```
SUPERADMIN_DB_HOST=localhost
SUPERADMIN_DB_PORT=5432
SUPERADMIN_DB_USERNAME=postgres
SUPERADMIN_DB_PASSWORD=your_password
SUPERADMIN_DB_NAME=evalis_superadmin
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd evalis-backend
```

2. Install dependencies (already done):
```bash
npm install
```

3. Update the `.env` file with your configuration:
```
SUPERADMIN_EMAIL=sajansah205@gmail.com
SUPERADMIN_PASSWORD=AdminEvalis@9898
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRATION=24h
PORT=3000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run start:dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies (already done):
```bash
npm install
```

3. Update the `.env` file:
```
VITE_API_URL=http://localhost:3000
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication

#### SuperAdmin Login
```
POST /auth/superadmin/login
Content-Type: application/json

{
  "email": "sajansah205@gmail.com",
  "password": "AdminEvalis@9898"
}
```

#### Admin Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123",
  "organizationName": "ORGANIZATION_NAME"
}
```

#### Create Admin (SuperAdmin Only)
```
POST /auth/superadmin/create-admin
Content-Type: application/json

{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "SecurePassword123",
  "organizationName": "MY_ORGANIZATION",
  "subscriptionPlan": "Free Tier" | "Go" | "Advanced"
}
```

## Database Schema

### Superadmin Database (evalis_superadmin)

#### subscription_plans
- id (PrimaryKey)
- name (varchar, unique) - 'Free Tier', 'Go', 'Advanced'
- pricePerYear (integer) - 0, 1000, 5000
- description (text)
- features (jsonb)
- createdAt (timestamp)

#### admins
- id (uuid, PrimaryKey)
- name (varchar)
- email (varchar, unique)
- password (varchar, hashed)
- subscriptionPlanId (foreign key)
- isActive (boolean)
- createdAt (timestamp)
- updatedAt (timestamp)

#### organizations
- id (uuid, PrimaryKey)
- name (varchar, unique, UPPERCASE)
- databaseName (varchar)
- adminId (uuid, foreign key)
- isActive (boolean)
- createdAt (timestamp)
- updatedAt (timestamp)

### Organization-Specific Databases
Each organization gets its own database with name format: `evalis_[organization_name]`

## Application Flow

1. **User Access**: User visits the landing page at `/`
2. **Login**: Click "Login" button to go to `/login`
3. **Authentication**:
   - **Admin**: Enter email, organization name, and password
   - **SuperAdmin**: Enter superadmin email and password
4. **Redirection**: 
   - Admins → `/admin/dashboard`
   - SuperAdmin → `/superadmin/dashboard`

## SuperAdmin Default Credentials
- **Email**: sajansah205@gmail.com
- **Password**: AdminEvalis@9898

## Subscription Plans

### Free Tier
- Price: 0 INR/year
- Max Candidates: 50
- Max Exams: 5
- Features: Basic Reporting

### Go
- Price: 1000 INR/year
- Max Candidates: 500
- Max Exams: 50
- Features: Advanced Reporting, API Access

### Advanced
- Price: 5000 INR/year
- Max Candidates: 5000
- Max Exams: 500
- Features: Advanced Reporting, API Access, Custom Integrations, Dedicated Support

## Next Steps

### To be implemented later:
- Admin dashboard with exam management
- Candidate management system
- Exam controller functionality
- Evaluator system
- Reporting and analytics
- Email notifications
- Payment integration for subscriptions
- Organization-specific database schemas
- User roles (Candidate, Evaluator, Exam Controller)
- Exam creation and management
- Real-time exam monitoring
- Evaluation system

## Error Handling

The application includes comprehensive error handling:
- Validation errors for user inputs
- Database connection errors
- Authentication failures
- Authorization checks

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Environment variable configuration
- Protected API routes
- Input validation with class-validator

## Development Notes

- TypeORM is configured for automatic schema synchronization in development mode
- Enable `synchronize: false` in production
- Update JWT_SECRET in production environment
- Use strong passwords for superadmin and admins
- Always use HTTPS in production

## Troubleshooting

### Backend won't start
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `evalis_superadmin`

### Frontend can't connect to backend
- Ensure backend is running on `http://localhost:3000`
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

### Login fails
- Verify credentials are correct
- For superadmin: email must be `sajansah205@gmail.com`
- For admins: organization name must match exactly (case-sensitive)

## License

This project is proprietary and confidential.
