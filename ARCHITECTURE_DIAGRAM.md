# 🏗️ System Architecture Diagram

## Complete User Profile Details System

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER / FRONTEND                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              User Management Page                         │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │  User Table                                         │ │   │
│  │  │  ────────────────────────────────────────────────   │ │   │
│  │  │  Name  │ Email │ Role │ Status │ Created │ Actions │ │   │
│  │  │  ─────────────────────────────────────────────────  │ │   │
│  │  │  John  │ john  │ ...  │ Active │ ...     │ 👁️ ✏️ 🗑️│ │   │
│  │  │  Mary  │ mary  │ ...  │ Active │ ...     │ 👁️ ✏️ 🗑️│ │   │
│  │  │                                                    │ │   │
│  │  │  [User clicks 👁️ eye icon]                        │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                       │                                   │   │
│  │                       ▼                                   │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │      UserDetailsModal Component                      │ │   │
│  │  │                                                      │ │   │
│  │  │  ┌──────────────────────────────────────────────┐   │ │   │
│  │  │  │ Header: John Doe [Evaluator]               │   │ │   │
│  │  │  │ [Edit] [Close] ✕                           │   │ │   │
│  │  │  └──────────────────────────────────────────────┘   │ │   │
│  │  │                                                      │ │   │
│  │  │  ┌──────────────────────────────────────────────┐   │ │   │
│  │  │  │ Core Info (DISABLED):                       │   │ │   │
│  │  │  │ Name: John Doe [DISABLED]                  │   │ │   │
│  │  │  │ Email: john@example.com [DISABLED]        │   │ │   │
│  │  │  │ Role: Evaluator [DISABLED]                 │   │ │   │
│  │  │  │ Status: Active [DISABLED]                  │   │ │   │
│  │  │  └──────────────────────────────────────────────┘   │ │   │
│  │  │                                                      │ │   │
│  │  │  ┌──────────────────────────────────────────────┐   │ │   │
│  │  │  │ Contact Info:                               │   │ │   │
│  │  │  │ Phone: +1234567890 [ENABLED]               │   │ │   │
│  │  │  │ Personal Email: john@email.com [ENABLED]   │   │ │   │
│  │  │  └──────────────────────────────────────────────┘   │ │   │
│  │  │                                                      │ │   │
│  │  │  ┌──────────────────────────────────────────────┐   │ │   │
│  │  │  │ Personal Info:                              │   │ │   │
│  │  │  │ Date of Birth: 1990-01-15 [ENABLED]        │   │ │   │
│  │  │  │ Gender: Male [ENABLED - SELECT]            │   │ │   │
│  │  │  │ Country: USA [ENABLED]                     │   │ │   │
│  │  │  │ Profile URL: http://... [ENABLED]          │   │ │   │
│  │  │  └──────────────────────────────────────────────┘   │ │   │
│  │  │                                                      │ │   │
│  │  │  [Additional sections...]                           │ │   │
│  │  │                                                      │ │   │
│  │  │  ┌──────────────────────────────────────────────┐   │ │   │
│  │  │  │ [Save] [Cancel]                             │   │ │   │
│  │  │  └──────────────────────────────────────────────┘   │ │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                       │                                   │   │
│  └───────────────────────┼───────────────────────────────────┘   │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │
                HTTP/REST  │
                           ▼
        ┌──────────────────────────────────┐
        │   BACKEND / API LAYER            │
        │                                  │
        │  ┌────────────────────────────┐  │
        │  │  NestJS Application        │  │
        │  │                            │  │
        │  │  ┌──────────────────────┐  │  │
        │  │  │ AuthController       │  │  │
        │  │  │                      │  │  │
        │  │  │ GET /auth/user/:id   │◄────┼──┐
        │  │  │ PUT /auth/user/:id/  │  │  │  │
        │  │  │     profile          │◄────┼──┤
        │  │  └──────────────────────┘  │  │  │
        │  │           │                │  │  │
        │  │           ▼                │  │  │
        │  │  ┌──────────────────────┐  │  │  │
        │  │  │ AuthService          │  │  │  │
        │  │  │                      │  │  │  │
        │  │  │ getUserProfile()     │  │  │  │
        │  │  │ updateUserProfile()  │  │  │  │
        │  │  │ getUserById()        │  │  │  │
        │  │  └──────────────────────┘  │  │  │
        │  │           │                │  │  │
        │  │           ▼                │  │  │
        │  │  ┌──────────────────────┐  │  │  │
        │  │  │ TypeORM Repositories │  │  │  │
        │  │  │                      │  │  │  │
        │  │  │ UserRepository       │  │  │  │
        │  │  │ UserProfileRepository│  │  │  │
        │  │  └──────────────────────┘  │  │  │
        │  └────────────────────────────┘  │  │
        │           │                       │  │
        └───────────┼───────────────────────┘  │
                    │                          │
                    ▼                          │
        ┌──────────────────────────────────┐  │
        │    DATABASE LAYER (PostgreSQL)   │  │
        │                                  │  │
        │  ┌────────────────────────────┐  │  │
        │  │  users TABLE               │  │  │
        │  │  ─────────────────────────  │  │  │
        │  │  id         (UUID) [PK]    │  │  │
        │  │  name       (VARCHAR)      │  │  │
        │  │  email      (VARCHAR)      │  │  │
        │  │  role       (VARCHAR)      │  │  │
        │  │  isActive   (BOOLEAN)      │  │  │
        │  │  createdAt  (TIMESTAMP)    │  │  │
        │  │  ...                       │  │  │
        │  │  [CORE INFO PROTECTED]     │  │  │
        │  └────────────────────────────┘  │  │
        │              │                    │  │
        │              │ OneToOne           │  │
        │              │ Relationship       │  │
        │              ▼                    │  │
        │  ┌────────────────────────────┐  │  │
        │  │  user_profiles TABLE       │  │  │
        │  │  ─────────────────────────  │  │  │
        │  │  id (UUID) [PK]            │  │  │
        │  │  userId (UUID) [FK]        │  │  │
        │  │  phoneNumber (VARCHAR)     │  │  │
        │  │  personalEmail (VARCHAR)   │  │  │
        │  │  dateOfBirth (DATE)        │  │  │
        │  │  gender (VARCHAR)          │  │  │
        │  │  country (VARCHAR)         │  │  │
        │  │  profileUrl (VARCHAR)      │  │  │
        │  │  school (VARCHAR)          │  │  │
        │  │  department (VARCHAR)      │  │  │
        │  │  ... 12 more fields        │  │  │
        │  │  createdAt (TIMESTAMP)     │  │  │
        │  │  updatedAt (TIMESTAMP)     │  │  │
        │  │  [EDITABLE FIELDS ONLY]    │  │  │
        │  └────────────────────────────┘  │  │
        │                                  │  │
        └──────────────────────────────────┘  │
                                              │
                    API RESPONSE              │
                         ◄────────────────────┘
```

---

## Component Hierarchy

```
App
├── Router
│   ├── LandingPage
│   ├── LoginPage
│   ├── AdminDashboard
│   │   ├── AdminLayout
│   │   │   ├── Header
│   │   │   ├── Sidebar
│   │   │   └── MainContent
│   │   │       └── UserManagement ◄─── You are here
│   │   │           ├── SearchBar
│   │   │           ├── FilterBar
│   │   │           ├── Table
│   │   │           │   └── Row
│   │   │           │       └── Actions
│   │   │           │           ├── [👁️ Details Button]
│   │   │           │           ├── [Edit Button]
│   │   │           │           └── [Delete Button]
│   │   │           │
│   │   │           └── UserDetailsModal ◄─── NEW COMPONENT
│   │   │               ├── Header (with gradient)
│   │   │               ├── Body
│   │   │               │   ├── Core Info Section
│   │   │               │   ├── Contact Info Section
│   │   │               │   ├── Personal Info Section
│   │   │               │   ├── Academic Info Section
│   │   │               │   ├── Additional Info Section
│   │   │               │   └── Parent Info Section
│   │   │               └── Footer
│   │   │                   └── Action Buttons
│   │   │
│   │   └── ...other admin pages
│   │
│   └── ...other routes
│
└── AuthContext (provides user auth data)
```

---

## State Management Flow

```
UserManagement Component
├── State:
│   ├── users: User[]                    ◄─── From API GET /auth/users
│   ├── searchTerm: string
│   ├── filterRole: string
│   ├── currentPage: number
│   ├── loading: boolean
│   │
│   ├── showDetailsModal: boolean        ◄─── NEW
│   ├── selectedUser: User | null        ◄─── NEW
│   │
│   └── showModal: boolean (legacy)
│
├── useEffect:
│   └── fetchUsers() on mount
│
├── Event Handlers:
│   ├── handleDetailsClick(user) ◄─── NEW
│   │   ├── setSelectedUser(user)
│   │   └── setShowDetailsModal(true)
│   ├── handleEdit()
│   ├── handleDelete(id)
│   └── ...
│
└── Render:
    ├── Table with users
    │   └── Eye icon button calls handleDetailsClick()
    │
    └── Conditional: if showDetailsModal && selectedUser
        └── <UserDetailsModal
              userId={selectedUser.id}
              userName={selectedUser.name}
              userEmail={selectedUser.email}
              onClose={() => {
                setShowDetailsModal(false)
                setSelectedUser(null)
              }}
            />
```

---

## Data Flow: View User Profile

```
User clicks eye icon (Details button)
        │
        ▼
Event handler: handleDetailsClick(user)
        │
        ├── setSelectedUser(user)
        ├── setShowDetailsModal(true)
        │
        ▼
UserDetailsModal component renders with props
        │
        ├── userId = user.id
        ├── userName = user.name
        ├── userEmail = user.email
        └── onClose = callback
        │
        ▼
useEffect runs:
        │
        ├── Shows loading spinner
        ├── Calls fetchUserProfile()
        │   └── GET /auth/user/:userId
        │       │
        │       ▼
        │   Backend: AuthService.getUserProfile()
        │       │
        │       ├── Find User with profile relation
        │       ├── If profile doesn't exist: create empty
        │       └── Return { user, profile }
        │       │
        │       ▼
        │   Response arrives with data
        │
        ├── Merge user data with profile data
        ├── Populate formData state
        ├── Store originalData backup
        │
        ▼
Display modal with form (all fields disabled)
        │
        ├── Core Info fields: DISABLED
        ├── Extended fields: DISABLED
        └── Edit button: ENABLED
```

---

## Data Flow: Edit & Save Profile

```
User clicks Edit button
        │
        ▼
setIsEditMode(true)
        │
        ▼
Form fields become editable:
        │
        ├── Core fields: STILL DISABLED
        └── Extended fields: NOW ENABLED
        │
        ▼
User edits fields and clicks Save
        │
        ▼
handleSave() called:
        │
        ├── Validate form
        ├── Extract only extended fields
        ├── setSaving(true)
        │
        ▼
PUT /auth/user/:userId/profile
        │
        ├── Body: { phoneNumber, personalEmail, ... }
        │
        ▼
Backend: AuthService.updateUserProfile()
        │
        ├── Find UserProfile by userId
        ├── Update only profile fields
        ├── Core User fields NEVER updated
        ├── Save to database
        │
        ▼
Response: { message, profile }
        │
        ├── setSaving(false)
        ├── setSuccess(true)
        ├── Show success alert
        ├── setIsEditMode(false)
        │
        ▼
After 1 second: close modal
        │
        ▼
Modal closes, user list refreshes
```

---

## API Endpoint Flows

### GET /auth/user/:userId

```
Request:
├── Method: GET
├── URL: /auth/user/:userId
├── Params: { userId: UUID }
└── Auth: Required (SessionStorage token)

Backend Processing:
├── Extract userId from params
├── AuthService.getUserProfile(userId)
│   ├── Find User with profile relation
│   │   └── Eager load profile
│   ├── If profile missing: create empty
│   └── Return { user, profile }
├── Merge data
└── Return response

Response:
├── Status: 200 OK
└── Body: {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Evaluator",
      "isActive": true,
      "createdAt": "2024-01-15..."
    },
    "profile": {
      "phoneNumber": "+1234567890",
      "personalEmail": "john@email.com",
      "dateOfBirth": "1990-01-15",
      ...
    }
  }
```

### PUT /auth/user/:userId/profile

```
Request:
├── Method: PUT
├── URL: /auth/user/:userId/profile
├── Params: { userId: UUID }
├── Auth: Required
└── Body: {
    "phoneNumber": "+1234567890",
    "personalEmail": "john@email.com",
    "dateOfBirth": "1990-01-15",
    "gender": "Male",
    ... [editable fields only]
  }

Backend Processing:
├── Extract userId from params
├── Validate request body
├── AuthService.updateUserProfile(userId, body)
│   ├── Find UserProfile by userId
│   ├── Update profile fields ONLY
│   ├── Core User fields PROTECTED
│   ├── Save changes
│   └── Return updated profile
└── Return response

Response:
├── Status: 200 OK
└── Body: {
    "message": "Profile updated successfully",
    "profile": {
      "phoneNumber": "+1234567890",
      "personalEmail": "john@email.com",
      ...
    }
  }
```

---

## Authentication & Security Flow

```
Browser Session (sessionStorage)
        │
        └─► authToken: JWT token
            └─► Contains: userId, email, role, organization

HTTP Request
        │
        ├── Header: Authorization: Bearer {token}
        │
        ▼
Backend: @UseGuards(AuthGuard)
        │
        ├── Verify token signature
        ├── Extract user info
        ├── Attach to Request object
        │
        ▼
Controller Method:
        │
        ├── @Req() request: Request
        │   └── Has user info from JWT
        │
        ├── Verify user permission
        ├── Process request
        │
        ▼
Response (200 OK) or Error (401/403)
```

---

## Error Handling Flow

```
Error occurs at any layer:

1. Frontend (React):
   └─► try-catch block
       ├─► setError(message)
       ├─► Display error alert
       └─► Disable Save button

2. API Call:
   └─► fetch() error
       ├─► 4xx: Validation/Auth error
       ├─► 5xx: Server error
       └─► Network: Connection error

3. Backend (NestJS):
   └─► try-catch block
       ├─► ValidationException
       ├─► UnauthorizedException
       ├─► BadRequestException
       └─► InternalServerErrorException

4. Error Response:
   ├── Status: 400, 401, 403, 500, etc.
   └── Body: {
         "statusCode": number,
         "message": "Error description",
         "error": "ErrorType"
       }

5. Frontend Display:
   ├─► Parse error response
   ├─► Show alert to user
   ├─► Log to console
   └─► Allow retry
```

---

## File Organization

```
evalis-backend/
├── src/
│   ├── users/
│   │   └── entities/
│   │       ├── user.entity.ts         ◄─── MODIFIED (added relation)
│   │       └── user-profile.entity.ts ◄─── NEW (22 fields)
│   │
│   ├── auth/
│   │   ├── auth.controller.ts         ◄─── MODIFIED (2 endpoints)
│   │   └── auth.service.ts            ◄─── MODIFIED (3 methods)
│   │
│   ├── config/
│   │   └── database.config.ts         ◄─── MODIFIED (registered entity)
│   │
│   ├── app.module.ts                  ◄─── MODIFIED (import UserProfile)
│   └── ...
│
frontend/
├── src/
│   └── admin/
│       ├── components/
│       │   ├── UserDetailsModal.tsx   ◄─── NEW (350+ lines)
│       │   └── UserDetailsModal.css   ◄─── NEW (375 lines)
│       │
│       ├── pages/
│       │   └── UserManagement.tsx     ◄─── MODIFIED (added modal)
│       │
│       └── styles/
│           └── admin.css              ◄─── MODIFIED (details button)
│
└── ...
```

---

**This diagram shows the complete architecture of the User Profile Details Management System.**

All components work together seamlessly to provide a professional, secure, and user-friendly experience.
