# CreateExam Functionality Analysis
## Old Evalis Project

---

## 1. OVERVIEW

The CreateExam system is a **multi-step wizard form** for creating exams with two distinct exam types:
- **MCQ (Multiple Choice Questions)** - Traditional questionnaire exams
- **PROGRAMMING** - Code challenge exams with automated testing

---

## 2. FORM STRUCTURE & WORKFLOW

### **Step 1: Basic Information**
- **Exam Code** (auto-generated: `EXAM-{timestamp}`)
- **Exam Name** (required)
- **Description** (optional)
- **Subject** (required dropdown)
- **Category** (dropdown: ACADEMIC, CERTIFICATION, EMPLOYMENT, PRACTICE, COMPETITIVE, ENTRANCE)
- **Level** (dropdown: EASY, MEDIUM, HARD, ADVANCED)
- **Exam Type** (radio/select: MCQ or PROGRAMMING)

### **Step 2: Settings & Configuration**
#### Timing Settings:
- Duration (minutes) - required
- Start Time (optional datetime)
- End Time (optional datetime)

#### Scoring Settings:
- Total Questions (auto-calculated, editable)
- Total Marks (auto-calculated from question marks)
- Passing Score (%)
- Negative Marking (checkbox toggle)
  - Conditional field: Negative Mark Percentage (only shows if enabled)

#### Display Settings:
- Randomize Questions (checkbox)
- Randomize Options (checkbox)
- Allow Back Navigation (checkbox)
- Show Results Immediately (checkbox)
- Auto-save Interval (seconds: 5-300)

#### Proctoring Settings:
- Require Webcam (checkbox)
- Full Screen Required (checkbox)
- Prevent Tab Switching (checkbox)

### **Step 3: Questions Management**
**Differs based on exam type:**

#### For MCQ Exams:
Each question includes:
- **Question Type** (select: MCQ, DESCRIPTIVE, TRUE_FALSE, FILL_BLANKS)
- **Marks** (number, 0.5 increments)
- **Difficulty Level** (select: EASY, MEDIUM, HARD, ADVANCED)
- **Question Text** (textarea, required)
- **Options** (for MCQ):
  - Option A, B, C, D (text inputs)
  - Options A & B are required, C & D optional
  - Radio selector for correct answer
- **Correct Answer Explanation** (optional textarea)
- **Question Stats** (displayed at top):
  - Total Questions count
  - Total Marks sum
  - Average Time per Question

#### For PROGRAMMING Exams:
Each question includes:
- **Marks** (integer)
- **Difficulty Level** (select)
- **Time Limit** (seconds: 1-300)
- **Memory Limit** (MB: 32-1024, 32 increments)
- **Problem Statement** (textarea, required)
- **Input Format** (textarea)
- **Output Format** (textarea)
- **Constraints** (textarea)
- **Examples** (textarea, format: Input: ... Output: ...)
- **Edge Cases** (textarea)
- **Supported Languages** (multi-checkbox: Python, JavaScript, C++, Java, Go)
- **Function Signatures** (future/optional)

#### Question Management:
- **Add Question Button** - Add unlimited questions
- **Duplicate Button** - Clone question (with "Copy" suffix)
- **Delete Button** - Remove question (disabled if only 1 question)
- **Question Cards** - Collapsible/expandable display with badges:
  - Question number (Q1, Q2, etc.)
  - Type badge (MCQ, PROGRAMMING, etc.)
  - Difficulty color-coded badge
  - Marks badge

### **Step 4: Review & Submit**
Displays all entered data in read-only format:
- **Basic Information Section**
  - Code, Name, Subject, Type, Category, Level, Duration, Description
- **Settings Section**
  - Total Questions, Total Marks, Passing Score, Negative Marking status
- **Proctoring Section**
  - Webcam, Full Screen, Tab Switch settings
  - Randomization settings
- **Questions Summary**
  - Total count
  - Total marks
  - Average time per question
  - Type breakdown (MCQ count, Descriptive count, etc.)

---

## 3. VALIDATIONS & ERROR HANDLING

### Frontend Validations:
1. **Required Fields:**
   - Exam Code (auto-generated)
   - Exam Name
   - Subject
   - Duration
   - Question Text (for each question)
   - Marks (for each question)
   - Correct Answer (for MCQ questions)
   - Minimum one question required

2. **Conditional Validations:**
   - If Negative Marking enabled → Negative Mark % required
   - If MCQ Type → At least options A & B required
   - If TRUE_FALSE → Must select True or False
   - For Programming → Problem statement required

3. **Error Display:**
   - Validation errors displayed as an array
   - Errors cleared when user makes changes
   - Specific error messages for missing fields

### Backend Validations (from DTO):
```typescript
- IsString() for code, name, subject, category, level, examType
- IsNumber() for durationMinutes, totalQuestions, totalMarks, passingScore
- IsBoolean() for negativeMarking, randomizeQuestions, etc.
- IsOptional() for description, startTime, endTime, negativeMarkPercentage
- ValidateNested() for questions array with CreateQuestionDto
```

### API Error Responses:
- Exam status validation (only DRAFT exams can be edited)
- Duplicate exam code check
- Question validation during import
- Exam must have at least 1 question to publish

---

## 4. STATE MANAGEMENT & DATA STRUCTURE

### React State (`examData`):
```typescript
{
  // Basic Info
  code: string,
  name: string,
  description: string,
  subject: string,
  category: string,
  level: string,
  examType: 'MCQ' | 'PROGRAMMING',
  
  // Timing
  durationMinutes: number,
  startTime: string | Date,
  endTime: string | Date,
  
  // Scoring
  totalQuestions: number,
  totalMarks: number,
  passingScore: number,
  negativeMarking: boolean,
  negativeMarkPercentage: number,
  
  // Display Settings
  randomizeQuestions: boolean,
  randomizeOptions: boolean,
  allowBackNavigation: boolean,
  showResultsImmediately: boolean,
  autoSaveInterval: number,
  
  // Proctoring
  requireWebcam: boolean,
  fullScreenRequired: boolean,
  preventTabSwitch: boolean,
  
  // Questions Array
  questions: Array<{
    id: number,
    questionText: string,
    questionType: 'MCQ' | 'DESCRIPTIVE' | 'TRUE_FALSE' | 'FILL_BLANKS',
    marks: number,
    difficultyLevel: string,
    optionA: string,
    optionB: string,
    optionC: string,
    optionD: string,
    correctAnswer: string,
    correctAnswerExplanation: string,
    hasImage: boolean,
    imageUrl: string,
    imageAltText: string,
    tags: string[]
  }>,
  
  // Programming Questions Array
  programmingQuestions: Array<{
    id: number,
    problemStatement: string,
    inputFormat: string,
    outputFormat: string,
    constraints: string,
    examples: string,
    edgeCases: string,
    supportedLanguages: string[],
    functionSignatures: object,
    maxMarks: number,
    difficulty: string,
    timeLimitSeconds: number,
    memoryLimitMB: number
  }>
}
```

### Additional State Variables:
- `loading: boolean` - Form submission state
- `activeStep: number` - Current step (1-4)
- `validationErrors: string[]` - Error messages array
- `success: boolean` - Submission success status

---

## 5. API INTEGRATION

### Main Endpoint:
```
POST /api/exams/create
Content-Type: application/json

Payload: CreateExamDto (includes all exam data + questions array)
```

### Related Endpoints (from service):
- `GET /api/exams` - List all exams (with pagination, search, status filter)
- `GET /api/exams/:id` - Get exam by ID
- `PUT /api/exams/:id` - Update exam (allowed fields only)
- `DELETE /api/exams/:id` - Delete exam (DRAFT only)
- `POST /api/exams/:id/publish` - Change status to PUBLISHED
- `POST /api/exams/:id/archive` - Archive exam
- `POST /api/exams/:id/questions` - Add question to exam
- `PUT /api/exams/:id/questions/:questionId` - Update specific question
- `DELETE /api/exams/:id/questions/:questionId` - Remove question
- `POST /api/exams/:id/import-questions` - Bulk import questions from JSON
- `GET /api/exams/:id/statistics` - Get exam statistics
- `POST /api/exams/:id/duplicate` - Clone entire exam

### Request/Response Flow:
1. User fills form and clicks "Create Exam"
2. Frontend validates all required fields
3. Form data structured as `CreateExamDto`
4. POST request sent with exam data + all questions
5. Backend:
   - Validates all fields via class-validator
   - Creates exam record in DB
   - Creates all question records linked to exam
   - Sets exam status to DRAFT
   - Returns exam ID + created exam object
6. Frontend receives success response
7. Shows success indicator
8. Redirects to exam list or detail page

---

## 6. UI/UX PATTERNS & COMPONENTS

### Layout & Structure:
- **Container**: `create-exam-container` - Full-width form wrapper
- **Page Header**: Shows title "Create Exam" with breadcrumb/back button
- **Progress Indicator**: 4 steps with visual progress bar
  - Step 1: Basic Info (icon: file)
  - Step 2: Settings (icon: cog)
  - Step 3: Questions (icon: question mark)
  - Step 4: Review (icon: eye)

### Form Patterns:
- **Form Grid**: Multi-column grid layout for inputs
- **Form Groups**: Label + Input with help text below
- **Settings Cards**: Grouped sections with icons and titles
- **Question Cards**: Expandable cards with header and collapsible form

### Button Patterns:
- **Previous/Next Buttons**: `btn-prev` (gray) and `btn-next` (blue)
- **Add Button**: `btn-add-question` (blue outline, filled on hover)
- **Action Buttons**: Icon buttons for duplicate/delete `btn-icon`
- **Submit Button**: `btn-submit` (green gradient, with spinner)
- **Disabled State**: All buttons disable during loading

### Badge/Label System:
- **Difficulty Badges**: Color-coded (Easy: green, Medium: amber, Hard: red, Advanced: purple)
- **Type Badges**: Light blue for question types
- **Marks Badges**: Light blue with marks count
- **Status Badges**: MCQ (blue), Programming (green)

### Interactive Elements:
- **Checkboxes**: Custom styled with checkmark animation
- **Radio Buttons**: For correct answer selection in MCQ
- **Toggle Buttons**: True/False buttons for BOOLEAN questions
- **Select Dropdowns**: For category, level, type, difficulty
- **Textareas**: For multi-line text (question text, explanation)
- **Number Inputs**: With min/max constraints and step values

### Conditional Rendering:
- Negative Marking % field shown only if checkbox enabled
- MCQ Options shown only for MCQ question type
- TRUE_FALSE buttons shown only for TRUE_FALSE type
- PROGRAMMING questions section shown if exam type is PROGRAMMING
- Descriptive/Fill blanks notes shown for respective types

### Help Text/Hints:
- Small text under each field explaining purpose
- Example: "Minimum {passingScore}% required to pass"
- Inline information icons with contextual tips

---

## 7. STYLING & DESIGN PATTERNS

### Color Scheme:
- **Primary Blue**: #3b82f6 (buttons, focus states)
- **Success Green**: #10b981 (submit button, enabled states)
- **Error Red**: #dc2626 (delete buttons, errors)
- **Neutral Gray**: #475569, #64748b (text, borders)
- **Light Gray**: #f1f5f9, #f8fafc (backgrounds)
- **Borders**: #e2e8f0 (light), #cbd5e1 (hover)

### Typography:
- **Headers**: 24px, 600 weight
- **Section Headers**: 18px, 600 weight
- **Labels**: 14px, 500 weight
- **Help Text**: 12px, 400 weight, gray color
- **Body Text**: 14-16px, 400 weight

### Spacing:
- **Card Padding**: 20-25px
- **Form Group Gaps**: 15-20px
- **Section Gaps**: 25-30px
- **Question Card Margin**: 20px bottom

### Responsive Design:
- **Desktop**: Multi-column grids (auto-fit, minmax)
- **Tablet (1024px)**: Single column grids
- **Mobile (768px)**: 
  - Flex columns for buttons
  - Full-width buttons
  - Single column forms
  - Hidden progress connectors
- **Small Mobile (480px)**: 
  - Single column options grid
  - Stack question actions
  - Simplified layouts

### Animations:
- **Spinner**: Rotating circle animation (1s, linear, infinite)
- **Transitions**: 0.2s ease on hover states
- **Button Hover**: 
  - Color change
  - Optional scale/transform
  - Shadow changes

### Accessibility:
- Label associations with form inputs
- Help text for clarification
- Disabled states clearly indicated
- High contrast colors
- Required field indicators (*)
- Error states with clear messaging

---

## 8. SPECIAL FEATURES

### Dynamic Calculation:
- **Auto-calculate Total Marks**: Sum of all question marks
- **Auto-calculate Total Questions**: Count of questions
- **Average Time per Question**: Duration / question count

### Code Auto-generation:
- Exam code auto-generated on load: `EXAM-{last6OfTimestamp}`
- User can edit before submission

### Batch Question Management:
- Add unlimited questions
- Duplicate existing question
- Delete individual questions (min 1 required)
- Reorder not explicit but possible through delete/add

### Image Support (Infrastructure):
- Question images: `hasImage`, `imageUrl`, `imageAltText` fields
- Infrastructure ready but UI not fully implemented in form

### Question Variations:
- **MCQ**: Standard multiple choice with 4 options
- **DESCRIPTIVE**: Free text answer (candidates type)
- **TRUE_FALSE**: Boolean answer type
- **FILL_BLANKS**: Underscores in question text indicate blanks

### Programming Language Selection:
- Multi-select for supported languages
- Options: Python, JavaScript, C++, Java, Go
- Flexible for future additions

### Tagging System:
- Questions have optional tags array
- Infrastructure present for categorization/filtering

---

## 9. BACKEND INTEGRATION DETAILS

### Database Entities:

**Exam Entity:**
```typescript
- id (UUID primary key)
- code (VARCHAR unique)
- name, description, subject
- category, level, examType
- durationMinutes, startTime, endTime
- totalQuestions, totalMarks, passingScore
- negativeMarking, negativeMarkPercentage
- randomizeQuestions, randomizeOptions, allowBackNavigation
- showResultsImmediately, autoSaveInterval
- requireWebcam, fullScreenRequired, preventTabSwitch
- status (DRAFT, PUBLISHED, ARCHIVED, CLOSED)
- createdBy (FK to User)
- createdAt, updatedAt, publishedAt
- totalAttempts, totalPassed, averageScore
```

**Question Entity:**
```typescript
- id (UUID)
- questionText, questionType
- marks, difficultyLevel
- optionA, optionB, optionC, optionD
- correctAnswer, correctAnswerExplanation
- hasImage, imageUrl, imageAltText
- tags (array)
- examId (FK to Exam)
- sectionId (FK to ExamSection, nullable)
- createdAt, updatedAt
- questionOrder
```

**ProgrammingQuestion Entity:**
- Similar structure with programming-specific fields
- problemStatement, inputFormat, outputFormat, constraints
- examples, edgeCases, supportedLanguages
- timeLimitSeconds, memoryLimitMB

### Service Methods:
- `createExam()` - Create exam with questions
- `updateExam()` - Update allowed fields
- `publishExam()` - Change status to PUBLISHED
- `duplicateExam()` - Full exam duplication
- `addQuestionToExam()` - Add single question
- `updateQuestion()` - Update specific question
- `deleteQuestion()` - Remove question (min 1 check)
- `importQuestions()` - Bulk import from JSON
- `getExamStatistics()` - Calculate and return stats

### Status Flow:
```
DRAFT → PUBLISHED → [ARCHIVED or CLOSED]
```
Only DRAFT exams can be edited. Published exams can be archived/closed.

---

## 10. KEY DATA FLOW

### Create Exam Flow:
```
1. User lands on CreateExam page
   ↓
2. Exam form initialized with empty/default values
   ↓
3. User fills Step 1 (Basic Info)
   - Code auto-generated
   - Selects exam type (MCQ or PROGRAMMING)
   ↓
4. Clicks "Next" → Step 2 (Settings)
   - Configure timing, scoring, display, proctoring
   ↓
5. Clicks "Next" → Step 3 (Questions)
   - If MCQ: Add MCQ questions with options
   - If PROGRAMMING: Add problem statements
   ↓
6. Clicks "Next" → Step 4 (Review)
   - Shows complete summary
   ↓
7. Clicks "Create Exam"
   - Frontend validates all required fields
   - Sends POST /api/exams/create with full payload
   ↓
8. Backend:
   - Validates CreateExamDto
   - Creates Exam record (status: DRAFT)
   - Creates all Question records
   - Returns success with exam ID
   ↓
9. Frontend:
   - Shows success state
   - Redirects to exam list or detail page
```

### Edit Exam Flow:
```
1. User navigates to Exam Details (DRAFT only)
2. Loads existing exam data
3. Can edit:
   - Basic info fields (name, description, etc.)
   - Settings (timing, scoring, etc.)
   - Questions (add, edit, delete)
4. Changes saved via PUT /api/exams/:id
5. Can add new questions via POST /api/exams/:id/questions
6. Can update specific question via PUT /api/exams/:id/questions/:questionId
```

### Publish Exam Flow:
```
1. Draft exam must have ≥ 1 question
2. Click "Publish" button
3. POST /api/exams/:id/publish
4. Status changes from DRAFT → PUBLISHED
5. No further editing allowed (service returns error)
6. Exam available for candidates to take
```

---

## 11. IMPLEMENTATION CHECKLIST FOR NEW PROJECT

- [ ] Create Step-based form component with progress indicator
- [ ] Step 1: Basic information form (code, name, subject, category, level, type)
- [ ] Step 2: Settings configuration (timing, scoring, display, proctoring)
- [ ] Step 3: Question management (MCQ and Programming variants)
- [ ] Step 4: Review and summary page
- [ ] Implement handleInputChange for basic fields
- [ ] Implement question array management (add, edit, delete, duplicate)
- [ ] Implement conditional rendering based on exam type
- [ ] Implement conditional field visibility (e.g., negative marking %)
- [ ] Implement dynamic calculations (total marks, total questions)
- [ ] Implement validation error handling
- [ ] Create backend CreateExamDto with proper validation
- [ ] Create Exam and Question entities with all fields
- [ ] Implement exams.service.ts with createExam method
- [ ] Implement exams.controller.ts POST /exams endpoint
- [ ] Implement form submission and API call
- [ ] Add success/error state handling
- [ ] Implement responsive CSS styling
- [ ] Add icon/badge styling
- [ ] Implement loading spinner
- [ ] Add help text and tooltips
- [ ] Test multi-step navigation
- [ ] Test form validation
- [ ] Test question CRUD operations
- [ ] Test API integration
- [ ] Test responsive design on mobile

---

## 12. TECHNICAL DEPENDENCIES

### Frontend:
- React (hooks: useState, useEffect)
- React Router (useNavigate)
- React Icons (FaPlus, FaSave, FaClock, etc.)
- Axios or custom API service

### Backend:
- NestJS
- TypeORM
- class-validator
- PostgreSQL (or other SQL DB)

### Styling:
- Pure CSS (no CSS-in-JS framework)
- Responsive grid and flexbox
- CSS transitions and animations

---

## 13. NOTES FOR IMPLEMENTATION

1. **Exam Type Branching**: The form significantly differs based on selected exam type (MCQ vs PROGRAMMING). Consider separate components or well-organized conditional rendering.

2. **Question Management**: Questions are stored as arrays in state and can be dynamically added/removed. Consider optimization for large question counts.

3. **Image Upload**: Infrastructure exists for question images but uploading mechanism not implemented in form.

4. **File Import**: Backend has importQuestions() method but no file upload UI in form.

5. **Sections**: Backend supports exam sections, but frontend form doesn't include section management in this version.

6. **Status-Based Permissions**: Only DRAFT exams can be edited. Published exams are immutable (important for data integrity).

7. **Auto-save**: Infrastructure in place (autoSaveInterval field) but actual implementation not shown in form.

8. **Proctoring**: All proctoring fields are configurable but enforcement happens during exam taking, not in this form.

9. **Performance**: For very large question counts (100+), consider pagination or lazy loading in Step 3.

10. **Data Persistence**: Form state is ephemeral. If page refreshes, all data is lost until saved. Consider:
    - Draft auto-save
    - SessionStorage backup
    - Server-side draft save every N seconds
