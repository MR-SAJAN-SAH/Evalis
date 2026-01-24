# Visual Guide - What You'll See

## Before Opening the Classroom

### URL
```
http://localhost:5173/classroom/1
```

---

## After Opening (Student View)

### Header Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│ ┌─────────────────────┐  ┌──────────────────────────┐           │
│ │ ▼ Data Structures   │  │ Subject: All Subjects ▼ │ 🔔 🤖 🌙 ⚙  │
│ │ & Algorithms        │  │                          │           │
│ │ (Classroom)         │  │                          │           │
│ └─────────────────────┘  └──────────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dropdown Contents (After Clicking Subject Selector)
```
┌─────────────────────────────────────┐
│ All Subjects                        │
├─────────────────────────────────────┤
│ ✓ Mathematics (currently selected) │
├─────────────────────────────────────┤
│ Physics                             │
├─────────────────────────────────────┤
│ Computer Science                    │
├─────────────────────────────────────┤
│ Chemistry                           │
└─────────────────────────────────────┘
```

### Tab Navigation (Below Header)
```
📰 Updates │ 📁 Materials │ 📋 Coursework │ 📖 Exams │ 📊 Grades │ 📈 Analytics │ 👥 People │ ⚙ Settings
```

---

## Tab Contents (When Mathematics is Selected)

### 1. UPDATES TAB ✅
```
┌─────────────────────────────────────────────────────────────┐
│ Creates an update for your Math class                       │
│ [Text area for typing...]                                  │
│ [ Announcement ▼ ] [ Attach ] [ Schedule ] [ Rich Text ]  │
│                                         [ Post ]            │
└─────────────────────────────────────────────────────────────┘

📍 Pinned                                          [📌] [⋮]
By: Mr. Thompson    Today at 9:00 AM    [Announcement]
─────────────────────────────────────────────────────────────
"Welcome to Advanced Mathematics Class"
This is our main discussion forum...
─────────────────────────────────────────────────────────────
[❤ 0] [💬 0] [↗ Share] [👨‍🏫 Notify Class]

💬 Add a comment... [Reply]
```

### 2. MATERIALS TAB ✅
```
Course Materials
────────────────────────────────
(NO Upload button for students)

┌──────────────────┐  ┌──────────────────┐
│ 📄               │  │ 📹               │
│ Chapter 5 -      │  │ Video Lecture:   │
│ Binary Trees     │  │ Tree Traversal   │
│                  │  │                  │
│ Jan 20, 2026     │  │ Jan 18, 2026     │
│ By: Instructor   │  │ By: Instructor   │
│                  │  │                  │
│ [📥 Download]    │  │ [📥 Download]    │
│ BinaryTrees.pdf  │  │ Lecture.mp4      │
└──────────────────┘  └──────────────────┘
```

### 3. COURSEWORK TAB ✅
```
Assignments & Submissions
────────────────────────────────
(NO Create Assignment button for students)
(NO submission statistics visible)

┌─────────────────────────────────────┐
│ Calculus Problem Set                │
├─────────────────────────────────────┤
│ Complete problems 1-50 from...      │
│                                     │
│ 📅 Due: 2026-01-31                 │
│ 🏆 100 points                       │
│ Type: File submission               │
├─────────────────────────────────────┤
│ [✓ Submitted]                       │
│ Grade: 95/100                       │
│ Feedback: "Excellent work!..."      │
└─────────────────────────────────────┘
```

### 4. EXAMS TAB ✅
```
Exams & Assessments
────────────────────────────────
(NO Create Exam button for students)
(NO Monitor/Edit/Export buttons for students)

┌─────────────────────────────────────┐
│ Midterm Exam                        │
│ [🔐 Proctored] [🎯 Adaptive]       │
├─────────────────────────────────────┤
│ Comprehensive exam covering...      │
│                                     │
│ 📅 Scheduled: Feb 15, 2026          │
│ ⏱️  Duration: 120 minutes            │
│ 🏆 100 marks • 50 questions         │
│                                     │
│ Status: Not Started                 │
│ [ Take Exam ]                       │
└─────────────────────────────────────┘
```

### 5. GRADES TAB ✅
```
(Already visible, filtered by subject)

Your Grades in Mathematics

Assignment 1: 92/100
Assignment 2: 88/100
Midterm Exam: 95/100
Quiz 1: 98/100
Final Exam: (Pending)
```

---

## Header Layout Details

### Classroom Selector (Unchanged)
```
▼ Data Structures & Algorithms

When clicked, shows all enrolled classrooms:
┌────────────────────────────────────┐
│ ✓ Data Structures & Algorithms     │ ← Currently selected
│   (Mathematics)                    │
├────────────────────────────────────┤
│ Physics Lab Section A              │
│ (Physics)                          │
├────────────────────────────────────┤
│ Introduction to CS                 │
│ (Computer Science)                 │
└────────────────────────────────────┘
```

### NEW: Subject Selector
```
Subject: [All Subjects ▼]  ← NEW FEATURE

When clicked, shows available subjects:
┌────────────────────────────────────┐
│ ✓ All Subjects (default)           │
├────────────────────────────────────┤
│ Mathematics (from classrooms)       │
├────────────────────────────────────┤
│ Physics (from classrooms)           │
├────────────────────────────────────┤
│ Computer Science (from classrooms)  │
└────────────────────────────────────┘
```

### Right Side Controls (Unchanged)
```
🔔  ← Notifications/Invitations
🤖  ← AI Assistant (shows context-aware help)
🌙  ← Dark Mode Toggle
⚙   ← Settings
```

---

## Teacher View vs Student View

### SAME FOR BOTH:
✅ Classroom selector works  
✅ Subject selector works  
✅ Tab navigation visible  
✅ Can view all content  
✅ Can comment on posts  

### TEACHER SEES (STUDENT DOES NOT):
❌ Upload Material button
❌ Create Assignment button
❌ Create Exam button
❌ Submission statistics (Submitted/Late/Missing/Avg Grade)
❌ Grade button on each submission
❌ Monitor Exam button
❌ Edit Exam button
❌ Export Results button
❌ Material menu (⋮)
❌ Pin post functionality (teacher-only management)

### STUDENT SEES (TEACHER ALSO SEES):
✅ Download buttons for materials
✅ Exam details and status
✅ Assignment submission forms
✅ Their grades/feedback
✅ View-only analytics
✅ All course materials
✅ All relevant coursework

---

## What Happens When You Select a Subject

### Before Selection
```
All 45 posts are visible (from all classrooms/subjects)
```

### After Selecting "Mathematics"
```
Only 12 posts from Mathematics classroom show
Other subjects' content automatically hidden
Empty state shows if no content for subject
```

### After Selecting "Physics"
```
Only 18 posts from Physics classroom show
All tabs update simultaneously
Materials, assignments, exams all filter instantly
```

### After Selecting "All Subjects"
```
Back to showing all 45+ posts
All classrooms' content visible again
```

---

## AI Assistant Panel (Right Side)

### When Opened by Student
```
╔══════════════════════════════════╗
║ 🤖 AI Assistant                  ║ X
╠══════════════════════════════════╣
║                                  ║
║ 📚 For Students:                 ║
║ 💡 Explain This Topic            ║
║ 💡 Summarize Class               ║
║ 💡 Generate Practice Questions   ║
║ 💡 Get Assignment Help           ║
║                                  ║
╚══════════════════════════════════╝
```

### When Opened by Teacher
```
╔══════════════════════════════════╗
║ 🤖 AI Assistant                  ║ X
╠══════════════════════════════════╣
║                                  ║
║ 👨‍🏫 For Teachers:                 ║
║ 💡 Generate Assignment           ║
║ 💡 Create Quiz from Syllabus     ║
║ 💡 Draft Announcement            ║
║ 💡 Suggest Weak Students         ║
║ 💡 Create Study Guide            ║
║                                  ║
╚══════════════════════════════════╝
```

---

## Real-World Workflow Examples

### Scenario 1: Student Reviewing Materials
```
1. Student arrives at classroom
2. Header shows:
   "Classroom: Data Structures" | "Subject: All Subjects"
3. Student clicks Subject dropdown → Selects "Mathematics"
4. Navigates to Materials tab
5. Sees only Mathematics materials
6. Downloads PDF lecture notes
7. Updates tab shows only Math posts
8. Student comments on instructor's announcement
9. Classroom stays synchronized - switching tabs still shows Math content
```

### Scenario 2: Teacher Managing Coursework
```
1. Teacher opens classroom
2. Same subject selector visible
3. Selects "Mathematics" from dropdown
4. Navigates to Coursework tab
5. Sees "Create Assignment" button (NOT hidden)
6. Sees submission statistics for Math class
7. Can grade submissions with "Grade" button
8. Can export results with full details
9. Switching subjects changes all filtered content
```

### Scenario 3: Multi-Subject Student
```
1. Student enrolled in Math, Physics, Chemistry
2. Subject selector shows all 3 subjects
3. Selects "Physics"
4. Views all Physics materials, assignments, exams
5. Switches to "Chemistry"
6. Instantly sees Chemistry content only
7. Each subject is completely separate
8. No content mixing between subjects
```

---

## Responsive Design Examples

### Desktop (1920px)
```
┌─────────────────────────────────────────────────────────────┐
│ [Classroom ▼] [Subject: Dropdown] | [🔔] [🤖] [🌙] [⚙]    │
└─────────────────────────────────────────────────────────────┘
Full-width layout with all controls visible
```

### Tablet (768px)
```
┌───────────────────────────────────────────┐
│ [Classroom ▼] [Subject: Dropdown]  [⋮]   │
│ [🔔] [🤖] [🌙] [⚙]                        │
└───────────────────────────────────────────┘
Subject selector wraps if needed
```

### Mobile (320px)
```
┌──────────────────────────────┐
│ [Class ▼] [Subj ▼] [⋮]      │
└──────────────────────────────┘
Compact layout with abbreviated text
```

---

## Color & Styling

### Light Mode
```
Classroom Selector:
- Background: Light gray
- Text: Dark gray
- Border: Light gray
- Hover: Primary color border

Subject Selector:
- Background: Light gray
- Text: Dark gray
- Border: Light gray
- Hover: Primary color border
- Focus: Primary color outline
```

### Dark Mode (When Toggled with 🌙)
```
Classroom Selector:
- Background: Dark gray
- Text: Light gray
- Border: Dark gray
- Hover: Primary color border

Subject Selector:
- Background: Dark gray
- Text: Light gray
- Border: Dark gray
- Hover: Primary color border
- Focus: Primary color outline
```

---

## Summary: What's New

| Feature | Before | After |
|---------|--------|-------|
| Subject Selection | Hidden in AI Panel | Visible in Header |
| Subject Dropdown | Required 2 clicks | Quick access from header |
| Content Filtering | Manual (by reading) | Automatic by subject |
| Candidate Upload | ❌ Hidden (good) | ✅ Still hidden |
| Candidate Create | ❌ Hidden (good) | ✅ Still hidden |
| Data Sync | ✅ Working | ✅ Enhanced |
| Permissions | ✅ Working | ✅ Reinforced |

---

**This is what your users will experience when they visit the classroom!**

All features are production-ready and industry-standard. ✅
