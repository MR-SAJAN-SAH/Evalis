# 📢 Announcement System - Quick Start Guide

## ⚡ 5-Minute Setup

### Backend (Already Implemented)
```bash
# 1. New files already created:
✅ evalis-backend/src/teacher/entities/classroom-announcement.entity.ts
✅ evalis-backend/src/teacher/dtos/announcement.dto.ts
✅ evalis-backend/src/teacher/services/announcement.service.ts
✅ evalis-backend/src/teacher/services/file-upload.service.ts
✅ evalis-backend/src/teacher/announcement.controller.ts

# 2. teacher.module.ts already updated
✅ AnnouncementService added
✅ FileUploadService added
✅ AnnouncementController registered
✅ Multer configured for file uploads

# 3. Run migrations (if needed)
npm run typeorm migration:run
```

### Frontend (Already Implemented)
```bash
# 1. New components created:
✅ frontend/src/components/AnnouncementForm.tsx
✅ frontend/src/components/AnnouncementForm.css
✅ frontend/src/components/AnnouncementFeed.tsx
✅ frontend/src/components/AnnouncementFeed.css

# 2. Services updated:
✅ frontend/src/services/classroomAPI.ts (added announcementAPI)

# 3. AdvancedClassroom updated:
✅ Imports added
✅ State management added
✅ Stream tab replaced with announcement system
✅ Modals integrated

# 4. CSS updated:
✅ AdvancedClassroom.css (new styles for button and loading)
```

---

## 🎯 Feature Quick Reference

### For Teachers

| Action | Steps | Result |
|--------|-------|--------|
| **Create Announcement** | 1. Navigate to Stream tab<br>2. Click "Create Announcement"<br>3. Fill form with details<br>4. Click "Publish" | Announcement visible to all students |
| **Add Media** | 1. In form, click image/video icons<br>2. Select file from device<br>3. Upload completes automatically | File added to announcement |
| **Set Priority** | 1. In settings, select priority<br>2. 'Urgent' shows red indicator | Visual distinction for students |
| **Require Acknowledgment** | 1. Check "Requires Acknowledgment"<br>2. Publish announcement | Badge shown to students |
| **Pin Announcement** | 1. Click star icon on announcement<br>2. Star turns gold | Appears at top of feed |
| **Edit Announcement** | 1. Click edit button<br>2. Modify content<br>3. Save changes | Updated immediately |
| **Delete Announcement** | 1. Click delete button<br>2. Confirm deletion | Removed from all students' feeds |

### For Students

| Action | Steps | Result |
|--------|-------|--------|
| **View Announcements** | 1. Navigate to Stream tab<br>2. Announcements auto-load<br>3. Scroll through feed | See all teacher announcements |
| **Download Attachments** | 1. Hover over attachment<br>2. Click download icon | File saved to device |
| **View Media** | 1. Click on image/video thumbnail<br>2. Modal opens with full view | Full-screen preview |
| **Check Priority** | 1. Look for color badge<br>2. Red = Urgent, Orange = High | Know importance level |
| **Track Reads** | Teacher can see who viewed | Your view is tracked |

---

## 📁 File Organization

### Backend Structure
```
evalis-backend/
└── src/
    └── teacher/
        ├── announcement.controller.ts           ← API endpoints
        ├── teacher.module.ts                    ← Updated with new services
        ├── entities/
        │   └── classroom-announcement.entity.ts ← Database schema
        ├── dtos/
        │   └── announcement.dto.ts              ← Request/response schemas
        └── services/
            ├── announcement.service.ts          ← Business logic
            └── file-upload.service.ts           ← File handling
```

### Frontend Structure
```
frontend/src/
├── services/
│   └── classroomAPI.ts                  ← API client (announcementAPI added)
├── components/
│   ├── AnnouncementForm.tsx             ← Teacher form component
│   ├── AnnouncementForm.css             ← Form styling
│   ├── AnnouncementFeed.tsx             ← Student feed component
│   └── AnnouncementFeed.css             ← Feed styling
└── pages/candidate/
    ├── AdvancedClassroom.tsx            ← Updated with announcement system
    └── AdvancedClassroom.css            ← Updated styles
```

---

## 🔌 API Endpoints Reference

### Create Announcement
```typescript
POST /api/teacher/announcements/create
{
  classroomId: "classroom-uuid",
  title: "Important Update",
  content: "Details here...",
  attachments: [],
  priority: "high",
  status: "published"
}
```

### Get Announcements
```typescript
GET /api/teacher/announcements/student/classroom/{classroomId}
// Returns: Announcement[]
```

### Upload File
```typescript
POST /api/teacher/announcements/upload/{classroomId}
Content-Type: multipart/form-data
file: <File>
```

### Toggle Pin
```typescript
POST /api/teacher/announcements/{announcementId}/pin
// Returns: Updated Announcement with isPinned toggled
```

### Delete Announcement
```typescript
DELETE /api/teacher/announcements/{announcementId}
// Returns: { success: true }
```

---

## 🎨 Component Props

### AnnouncementForm
```tsx
<AnnouncementForm
  classroomId="classroom-id"
  onAnnouncementCreated={(announcement) => {
    // Handle new announcement
  }}
  onClose={() => {
    // Close form modal
  }}
/>
```

### AnnouncementFeed
```tsx
<AnnouncementFeed
  announcements={announcementList}
  isTeacher={userRole === 'teacher'}
  onDelete={(id) => handleDelete(id)}
  onTogglePin={(id) => handlePin(id)}
  onEdit={(announcement) => handleEdit(announcement)}
/>
```

---

## 📊 Data Models

### Announcement Interface
```typescript
interface Announcement {
  id: string                           // UUID
  classroomId: string                 // Foreign key
  teacherId: string                   // Creator
  teacherName: string                 // Display name
  title: string                       // Required
  content: string                     // Rich text
  contentHtml?: string                // HTML version
  attachments?: AnnouncementAttachment[]
  status: 'published' | 'draft' | 'archived'
  viewCount: number                   // View tracker
  viewedBy?: string[]                 // Student IDs who viewed
  coverImage?: string                 // Featured image URL
  metadata?: {
    isPinned?: boolean                // Pin status
    priority?: 'normal' | 'high' | 'urgent'
    tags?: string[]                   // Hashtags
    requiresAck?: boolean             // Ack required
    allowComments?: boolean
  }
  createdAt: string                   // ISO datetime
  updatedAt: string                   // ISO datetime
  scheduledFor?: Date                 // Future publish
}
```

### AnnouncementAttachment Interface
```typescript
interface AnnouncementAttachment {
  id: string                          // UUID
  name: string                        // Original filename
  url: string                         // Download URL
  type: 'image' | 'video' | 'document' | 'audio'
  mimeType: string                    // e.g., 'image/jpeg'
  size: number                        // Bytes
  uploadedAt: Date                    // ISO datetime
}
```

---

## 🎨 Styling Customization

### Theme Colors (CSS Variables)
```css
:root {
  --primary: #667eea;         /* Main color */
  --primary-dark: #5a6fd8;    /* Hover state */
  --secondary: #764ba2;       /* Accent */
  --success: #10b981;         /* Success state */
  --warning: #f59e0b;         /* High priority */
  --danger: #ef4444;          /* Urgent priority */
  --info: #3b82f6;            /* Info messages */
}
```

### Priority Colors
```css
Priority.normal   → Gray (#9ca3af)
Priority.high     → Orange (#f59e0b)
Priority.urgent   → Red (#ef4444) [with pulse animation]
```

### Dark Mode
Automatically supported with CSS media query:
```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles automatically applied */
}
```

---

## 🔍 Debugging Tips

### Browser Console
```javascript
// Check loaded announcements
console.log('Announcements:', announcements)

// Test API call
announcementAPI.getStudentAnnouncements(classroomId)
  .then(res => console.log(res))

// Monitor file upload
console.log('Uploading file:', file)
```

### Server Console
```bash
# Watch for logs
📨 Processing invitation response:  {info}
✅ Announcement created: {id}
📥 Loading announcements for classroom: {id}
📤 Uploading file: {filename}
🔔 [Controller] Creating announcement...
```

### Common Issues

**Issue**: Announcements not showing
```javascript
// Check:
1. selectedClassroom !== null
2. userEmail !== null
3. Student is enrolled in classroom
4. API response status
```

**Issue**: File upload fails
```javascript
// Check:
1. File size < 50MB
2. File type is supported
3. Network connection
4. Server has disk space
```

**Issue**: API errors
```javascript
// Check logs:
console.error() in catch blocks
// Response format: { success, data, message }
```

---

## 🚀 Deployment Checklist

- [ ] **Backend**
  - [ ] Database migrations run
  - [ ] Upload directory created: `./uploads/announcements/`
  - [ ] File permissions set correctly
  - [ ] JWT auth configured
  - [ ] CORS enabled for frontend

- [ ] **Frontend**
  - [ ] API_BASE_URL set correctly
  - [ ] Components imported
  - [ ] CSS files included
  - [ ] TypeScript compiled without errors
  - [ ] Components render in browser

- [ ] **Testing**
  - [ ] Create announcement as teacher
  - [ ] Upload files successfully
  - [ ] View as student
  - [ ] Pin/unpin works
  - [ ] Delete removes announcement
  - [ ] View count increments
  - [ ] Works on mobile

---

## 📱 Responsive Design

### Desktop (> 1024px)
- Full layout with all features
- Sidebar navigation
- Large media previews
- All buttons visible

### Tablet (768px - 1024px)
- Optimized spacing
- Touch-friendly buttons
- Compact media gallery
- Simplified navigation

### Mobile (< 768px)
- Single-column layout
- Stacked buttons
- Full-width form
- Bottom sheet for modals
- Efficient media display

---

## 🔒 Security Notes

- ✅ Teachers can only post to their own classrooms
- ✅ Students can only view their enrolled classrooms
- ✅ File types validated server-side
- ✅ File size limited to 50MB
- ✅ File paths prevent directory traversal
- ✅ JWT required for all operations
- ✅ View tracking tracks studentIDs securely

---

## 📊 Performance Notes

- **Database Indices**: Fast queries optimized
- **Pagination**: 20 announcements per page
- **Lazy Loading**: Only load on tab selection
- **Caching**: Metadata cached with announcement
- **File Handling**: Efficient streaming for downloads

---

## 🎓 Learning Resources

1. **TypeORM Entities**: See `classroom-announcement.entity.ts`
2. **NestJS Services**: See `announcement.service.ts`
3. **React Components**: See `AnnouncementForm.tsx`
4. **File Handling**: See `file-upload.service.ts`
5. **API Design**: See `announcement.controller.ts`
6. **CSS Styling**: See `AnnouncementForm.css` & `AnnouncementFeed.css`

---

## 🎯 Next Steps

1. **Test the system**
   ```
   1. Start both backend and frontend
   2. Login as teacher
   3. Create an announcement
   4. Login as student
   5. View announcement
   ```

2. **Customize styling** (optional)
   - Edit CSS variables in component files
   - Adjust colors for brand
   - Modify spacing/sizing

3. **Extend functionality** (optional)
   - Add comments system
   - Implement reactions
   - Add real-time updates
   - Add advanced search

4. **Monitor & optimize**
   - Check browser console for errors
   - Monitor server logs
   - Test on various devices
   - Verify performance

---

## 📞 Support

For issues or questions:
1. Check the comprehensive docs: `ANNOUNCEMENT_SYSTEM_COMPLETE.md`
2. Review browser console for errors
3. Check server logs for API errors
4. Verify database migrations ran
5. Test with sample data

---

**Version**: 1.0.0  
**Status**: ✅ Ready to Use  
**Last Updated**: January 24, 2026
