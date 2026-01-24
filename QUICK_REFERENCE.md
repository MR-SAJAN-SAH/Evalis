# 🎯 User Profile Details System - Quick Reference

## What You Get

A complete user profile details management system with:
- **Eye Icon Button** - Click to view/edit user details
- **Professional Modal** - Modern, beautiful interface
- **View Mode** - See all user information (read-only)
- **Edit Mode** - Edit extended user profile fields
- **Smart Data Protection** - Core info never editable
- **Smooth Workflow** - Validation, error handling, success messages

---

## How It Works

### For Users/Admins
1. Go to **Admin → User Management**
2. Find the user you want to view
3. Click the **👁️ (eye icon)** in the Actions column
4. Modal opens showing all user details
5. Click **Edit** to modify extended information
6. Click **Save** to save changes or **Cancel** to discard
7. Click **✕** or outside modal to close

### For Developers

#### Backend Flow
```
GET /auth/user/:userId
  ↓
AuthService.getUserProfile()
  ↓
Fetch User + UserProfile data
  ↓
Auto-create profile if missing
  ↓
Return merged data

PUT /auth/user/:userId/profile
  ↓
AuthService.updateUserProfile()
  ↓
Validate data
  ↓
Update only profile fields (core info protected)
  ↓
Return success message
```

#### Frontend Flow
```
Click eye icon
  ↓
UserDetailsModal component opens
  ↓
Fetch user data from GET endpoint
  ↓
Display in form (all disabled)
  ↓
User clicks Edit
  ↓
Enable editable fields only
  ↓
User edits and clicks Save
  ↓
Send PUT request
  ↓
Show success message
  ↓
Close modal or stay in view mode
```

---

## File Locations

### Backend Files
```
evalis-backend/
├── src/
│   ├── users/entities/
│   │   └── user-profile.entity.ts ✨ NEW
│   ├── auth/
│   │   ├── auth.service.ts ✏️ MODIFIED
│   │   └── auth.controller.ts ✏️ MODIFIED
│   ├── config/
│   │   └── database.config.ts ✏️ MODIFIED
│   └── app.module.ts ✏️ MODIFIED
```

### Frontend Files
```
frontend/
├── src/
│   └── admin/
│       ├── components/
│       │   ├── UserDetailsModal.tsx ✨ NEW (350+ lines)
│       │   └── UserDetailsModal.css ✨ NEW (375 lines)
│       ├── pages/
│       │   └── UserManagement.tsx ✏️ MODIFIED
│       └── styles/
│           └── admin.css ✏️ MODIFIED
```

---

## Data Structure

### User Table (Core Info - Non-Editable)
```
id, name, email, role, isActive, createdAt
```

### UserProfile Table (Extended Info - Editable)
```
Contact:    phoneNumber, personalEmail
Personal:   dateOfBirth, gender, country, profileUrl
Academic:   school, department, rollNumber, registrationNumber,
            admissionBatch, currentSemester, graduated, cgpa
Additional: scholarship, portfolioLink, resumeUrl, githubUrl
Parent:     parentName, parentPhone
```

---

## Component Props

```typescript
interface UserDetailsModalProps {
  userId: string;      // User ID from user table
  userName: string;    // Display user name
  userEmail: string;   // Display email
  onClose: () => void; // Callback when modal closes
}
```

---

## API Endpoints

### Get User Profile
```
GET http://localhost:3000/auth/user/:userId

Response:
{
  "user": { id, name, email, role, isActive, createdAt },
  "profile": { phoneNumber, personalEmail, dateOfBirth, ... }
}
```

### Update User Profile
```
PUT http://localhost:3000/auth/user/:userId/profile

Body:
{
  "phoneNumber": "123-456-7890",
  "personalEmail": "user@example.com",
  "dateOfBirth": "1990-01-15",
  ...
}

Response:
{
  "message": "Profile updated successfully",
  "profile": { ...updated data }
}
```

---

## Styling Information

### Color Palette
- **Primary Gradient**: #667eea → #764ba2 (purple/blue)
- **Details Button**: #3498db (blue)
- **Success**: #3c3 (green background) / #3 green text
- **Error**: #c33 (red text) / #fee (red background)
- **Background**: #f9f9f9 (light gray)
- **Text**: #333 (dark gray)
- **Borders**: #e0e0e0 (light gray)

### CSS Classes
```
.modal-overlay        - Full screen backdrop
.modal-content        - Main modal container
.modal-header         - Top section with user info
.modal-body           - Scrollable content area
.modal-footer         - Bottom action buttons
.section              - Info section container
.section-title        - Section heading
.info-grid            - Responsive field grid
.info-field           - Individual field wrapper
.btn-primary          - Save button style
.btn-secondary        - Cancel button style
.alert-error          - Error message style
.alert-success        - Success message style
.spinner              - Loading indicator
```

---

## Testing the Feature

### Step-by-Step Test
1. Start backend: `npm run start:dev` (in evalis-backend)
2. Start frontend: `npm run dev` (in frontend)
3. Login to admin dashboard
4. Go to Admin → User Management
5. Find any user and click the eye icon
6. Verify modal opens with user details
7. Check that core fields are disabled (grayed out)
8. Click Edit button
9. Modify a field (e.g., phone number)
10. Click Save
11. Verify success message appears
12. Click Details again
13. Verify changes persisted

### Expected Behaviors
- ✅ Modal opens smoothly with animation
- ✅ User data loads from API
- ✅ Core fields always disabled
- ✅ Extended fields editable in edit mode
- ✅ Validation on save
- ✅ Success/error messages display
- ✅ Cancel reverts changes
- ✅ Modal responsive on mobile

---

## Customization Guide

### Change Button Color
Edit `src/admin/styles/admin.css`:
```css
.btn-icon.details {
  color: #YOUR_COLOR; /* Change color here */
}
```

### Change Modal Width
Edit `src/admin/components/UserDetailsModal.css`:
```css
.modal-content {
  max-width: 900px; /* Adjust this value */
}
```

### Add New Profile Fields
1. Add to `UserProfile` entity in backend
2. Add to form in `UserDetailsModal.tsx`
3. Add to API endpoint response
4. Update database migration

### Change Form Section Order
Edit `UserDetailsModal.tsx` - reorder `<section>` elements in render

---

## Troubleshooting

### Modal doesn't open
- Check browser console for errors
- Verify UserDetailsModal import in UserManagement.tsx
- Check that eye icon click handler is attached

### Data not loading
- Ensure backend is running on http://localhost:3000
- Check Network tab in browser DevTools
- Verify user ID is correct

### Cannot edit fields
- Check that you clicked Edit button
- Verify core fields have disabled attribute
- Check browser console for JavaScript errors

### Save not working
- Ensure backend endpoint PUT /auth/user/:userId/profile exists
- Check form validation is passing
- Look for API errors in Network tab
- Verify user has permission to update

---

## Performance Notes

- Modal data is fetched on-demand (lazy loading)
- Profile auto-created only on first access
- No database queries until modal is opened
- Efficient eager loading prevents N+1 queries
- CSS animations use GPU acceleration

---

## Security

- Core user info protected from editing
- Only authorized users can modify profiles
- All inputs validated server-side
- SQL injection prevention via TypeORM
- XSS prevention via React sanitization
- CORS configured for same-origin requests

---

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify API endpoints are responding (use Postman)
3. Check backend logs for server errors
4. Ensure database migration has been run
5. Verify UserProfile table exists in database

---

**Version**: 1.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2024
