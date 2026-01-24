# Quick Test Guide - Subject Selector & Permissions

## How to Test the Implementation

### Test URL
```
http://localhost:5173/classroom/1
```

## Visual Elements to Verify

### 1. Header Layout
- [x] Classroom selector dropdown on left ✓
- [x] **NEW: Subject selector dropdown next to classroom selector** ✓
- [x] Bell icon for notifications ✓
- [x] AI Assistant button ✓
- [x] Settings button ✓

### 2. Subject Selector Appearance
**Location**: Left side of header, after classroom name selector

**Design:**
```
┌─────────────────────────────┐
│ Classroom Selector │ Subject: [Dropdown ▼] │ [Bell] [AI] [⚙️]
└─────────────────────────────┘
```

## Functional Testing Steps

### Test 1: Subject Selector Visibility
1. Navigate to classroom page
2. Look for "Subject:" label with dropdown in header left
3. ✅ Should see dropdown with list of all enrolled subjects

### Test 2: Subject Selection & Filtering
1. Select different subjects from dropdown
2. Observe content changes in each tab:
   - **Updates Tab**: Only posts from selected subject shown
   - **Materials Tab**: Only materials from selected subject shown
   - **Coursework Tab**: Only assignments from selected subject shown
   - **Exams Tab**: Only exams from selected subject shown
3. ✅ Content should update immediately

### Test 3: Student Permissions (as Candidate)

#### Materials Tab - Student Should NOT See:
- ❌ "Upload Material" button hidden
- ❌ Three-dot menu (⋮) on material cards hidden
- ✅ Download button for materials visible
- ✅ Material content visible

#### Coursework Tab - Student Should NOT See:
- ❌ "Create Assignment" button hidden
- ❌ Submission statistics panel hidden (Submitted/Late/Missing/Avg Grade)
- ❌ "Grade" button on submissions hidden
- ✅ Assignment details visible
- ✅ Can submit assignments

#### Exams Tab - Student Should NOT See:
- ❌ "Create Exam" button hidden
- ❌ "Monitor" button hidden
- ❌ "Edit" button hidden
- ❌ "Export Results" button hidden
- ❌ Student status statistics hidden
- ✅ Can view exam details
- ✅ Can take exam (if applicable)

### Test 4: Teacher Permissions (as Teacher/Evaluator)

All controls should be VISIBLE:
- ✅ "Upload Material" button visible
- ✅ Material menu (⋮) buttons visible
- ✅ "Create Assignment" button visible
- ✅ Submission statistics panel visible
- ✅ "Grade" buttons visible
- ✅ "Create Exam" button visible
- ✅ "Monitor", "Edit", "Export Results" buttons visible

### Test 5: Empty States
1. Select a subject with no content
2. Each tab should show appropriate empty message:
   - Updates: "No updates yet"
   - Materials: "No materials yet"
   - Coursework: "No assignments yet"
   - Exams: "No exams yet"

### Test 6: Cross-Tab Consistency
1. Change subject
2. Go through each tab (Updates → Materials → Coursework → Exams)
3. ✅ All tabs show content for selected subject consistently

### Test 7: Dark Mode Toggle
1. Click moon icon
2. Subject selector should adapt to dark mode
3. ✅ Dropdown styles update correctly
4. ✅ Text remains readable

## API & Data Validation

### Check Browser Console
```javascript
// Should see no errors related to:
// - Cannot find name 'FaChalkboard'
// - Undefined candidateSubjects
// - Undefined selectedSubject
```

### Verify API Calls
1. Open DevTools → Network tab
2. Filter by `classroom` or `candidate`
3. Should see successful responses for:
   - `GET /api/candidate/classrooms/list` → returns classroom array with subjects
   - Each classroom object has `subject` field

### Sample Response Structure
```json
{
  "success": true,
  "data": [
    {
      "id": "classroom-1",
      "name": "Class A",
      "subject": "Mathematics",
      ...
    },
    {
      "id": "classroom-2",
      "name": "Class B",
      "subject": "Physics",
      ...
    }
  ]
}
```

## Common Issues & Solutions

### Issue 1: Subject dropdown empty
- **Cause**: No classrooms loaded or no subjects in classrooms
- **Fix**: Verify `loadEnrolledClassrooms()` completes successfully
- **Check**: Console logs should show loaded classrooms

### Issue 2: Content not filtering
- **Cause**: Subject not matching between dropdown and classroom data
- **Fix**: Verify `selectedClassroom?.subject === selected subject`
- **Debug**: Add console.log in getFilteredPosts(), etc.

### Issue 3: Student still sees buttons
- **Cause**: Role check not working (`isStudent` false when should be true)
- **Fix**: Verify `role === 'CANDIDATE' || role === 'candidate'`
- **Check**: Console: `console.log('isStudent:', isStudent)`

### Issue 4: Dropdown not appearing
- **Cause**: CSS not loading or className mismatch
- **Fix**: Verify CSS file imported in component
- **Check**: DevTools → Elements → check class applied

## Performance Testing

### Load Time
- Subject dropdown should appear instantly
- Filtering should be < 100ms even with large datasets
- No noticeable lag when switching subjects

### Memory Usage
- No memory leaks when switching subjects repeatedly
- DevTools → Performance → record 30 seconds of subject switching
- Should see stable memory usage

## Accessibility Testing

### Keyboard Navigation
1. Press Tab to focus subject selector
2. Press Space/Enter to open dropdown
3. Use Arrow keys to navigate options
4. Press Enter to select

### Screen Reader (if available)
- Should announce "Subject selector, select"
- Should announce each subject option
- Should announce selected subject

## Final Verification Checklist

- [ ] Subject selector visible in header
- [ ] All subjects listed in dropdown
- [ ] Content filters by subject
- [ ] Students cannot upload materials
- [ ] Students cannot create assignments
- [ ] Students cannot create exams
- [ ] Teachers see all buttons
- [ ] Empty states work
- [ ] Dark mode compatible
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Keyboard accessible
- [ ] API calls successful

## Expected Behavior Summary

| Scenario | Expected Behavior |
|----------|-------------------|
| Load page | Subject dropdown shows with all subjects |
| Select subject | All tabs update to show only that subject's content |
| Student views Materials | No upload button, can download |
| Student views Assignments | No create button, no stats, can submit |
| Student views Exams | No create/edit/export buttons, can take exam |
| Teacher views Materials | Upload button visible, can manage |
| Teacher views Assignments | Create button visible, stats visible, can grade |
| Teacher views Exams | Create button visible, can monitor/edit/export |
| No data for subject | Appropriate empty state shown |
| Switch subjects rapidly | Smooth transitions, no data loss |

---

**Testing Date**: January 24, 2026  
**Component**: AdvancedClassroom.tsx  
**Status**: ✅ Ready for QA Testing
