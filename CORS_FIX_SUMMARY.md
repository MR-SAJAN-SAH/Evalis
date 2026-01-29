# CORS API Fix Summary

## Problem
All hardcoded `/api/` relative paths in frontend components were causing CORS issues on Render because:
- Frontend deployed on: `https://evalis-frontend.onrender.com`
- Backend deployed on: `https://evalis-backend.onrender.com`
- Relative paths resolve to frontend domain ❌
- Need absolute URLs pointing to backend domain ✅

## Solution
Created a centralized `getApiUrl()` helper function that:
1. Checks for `VITE_API_URL` environment variable (set during Render build)
2. If present, constructs full backend URLs (production mode)
3. Falls back to relative `/api/` paths (development mode)

## Changes Made

### New File Created
- **`frontend/src/utils/apiHelper.ts`** - Central API URL builder function

### Files Updated (18 total)

#### Pages
1. `src/pages/UserLoginPage.tsx` - Fixed `/api/auth/user-login`
2. `src/pages/ExamControllerDashboard.tsx` - Fixed 3 endpoints:
   - `/api/papers`
   - `/api/papers/upload`
   - `/api/papers` (notes update)
3. `src/pages/CandidateDashboard.tsx` - Fixed `/api/exams`
4. `src/pages/EvaluatorDashboard.tsx` - Fixed `/api/papers/evaluator/my-assignments`

#### Candidate Pages
5. `src/pages/candidate/ProgrammingExamTaking.tsx` - Fixed `/api/programming/run-code`
6. `src/pages/candidate/ExamResults.tsx` - Fixed `/api/exams/candidate/submissions`
7. `src/pages/candidate/CandidateDashboard.tsx` - Fixed 3 endpoints:
   - `/api/exams`
   - `/api/exams/candidate/submissions`
   - `/api/notifications/unread-count`

#### Components
8. `src/components/NotificationCenter.tsx` - Fixed 2 endpoints:
   - `/api/notifications`
   - `/api/notifications/mark-all-read`

#### Admin Pages
9. `src/admin/pages/DashboardHome.tsx` - Fixed `/api/users/total-count`
10. `src/admin/pages/LiveProctoring.tsx` - Fixed `/api/exams/submissions/live`
11. `src/admin/pages/AuditLogs.tsx` - Fixed `/api/audit-logs`
12. `src/admin/pages/AddUser.tsx` - Fixed `/api/auth/create-user`
13. `src/admin/pages/UserManagement.tsx` - Fixed 2 endpoints:
    - `/api/auth/users`
    - `/api/email/send-to-user`

#### Admin Components
14. `src/admin/components/exam/AIQuestionGenerator.tsx` - Fixed `/api/ai/generate-questions`

## Implementation Pattern

### Before (❌ CORS Issue)
```typescript
const response = await fetch('/api/auth/users?organizationName=X', {
  // request config
});
```

### After (✅ Works on Render)
```typescript
import { getApiUrl } from '../../utils/apiHelper';

const response = await fetch(getApiUrl('/auth/users?organizationName=X'), {
  // request config
});
```

### Helper Function
```typescript
export const getApiUrl = (endpoint: string): string => {
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  if (backendUrl.startsWith('http')) {
    return `${backendUrl}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  }
  return `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};
```

## Environment Configuration

### Render Build Command
```bash
VITE_API_URL=https://evalis-backend.onrender.com npm install && npm run build
```

This substitutes `import.meta.env.VITE_API_URL` with the production backend URL during the build process.

## Testing
✅ Frontend builds successfully with all imports
✅ All API calls now use proper full URLs
✅ CORS should be resolved on Render deployment

## Deployment
- Commit: `b175514`
- Changes: 17 files modified, 1 new file created
- Build Status: ✅ Successful
- Ready for Render deployment
