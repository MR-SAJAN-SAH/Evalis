# Exam Controller Dashboard - Setup & Implementation Guide

## Quick Start

### Installation
No additional dependencies required. The dashboard uses:
- React 18+
- React Icons
- React Router
- Axios (for API calls)

### Environment Setup
```bash
# .env or .env.local
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ORGANIZATION_ID=your-org-id
```

### File Integration
All files are already created and integrated:

```
✅ Component: src/pages/ExamControllerDashboard.tsx
✅ Styles: src/styles/ExamControllerDashboard.css
✅ Components: src/components/DashboardComponents/
✅ Services: src/services/DashboardService/
✅ Hooks: src/hooks/
```

### Running the Dashboard
```bash
cd frontend
npm install
npm run dev
```

Navigate to: `http://localhost:5173/exam-controller/dashboard`

## Component Integration

### 1. Import the Dashboard
```typescript
// src/App.tsx
import ExamControllerDashboard from './pages/ExamControllerDashboard';

<Route path="/exam-controller/dashboard" element={<ExamControllerDashboard />} />
```

### 2. Dashboard Components
Use the pre-built components:

```typescript
import { 
  ChartWidget, 
  ActionMenu, 
  NotificationCenter, 
  FilterPanel 
} from './components/DashboardComponents';

// Chart Widget Example
<ChartWidget
  title="Exam Performance"
  data={[
    { label: 'Java', value: 85, color: '#3b82f6' },
    { label: 'Python', value: 92, color: '#10b981' },
  ]}
  type="bar"
  height={300}
  exportable={true}
  onExport={() => console.log('Export')}
/>

// Action Menu Example
<ActionMenu
  options={[
    { label: 'View', action: () => console.log('View') },
    { label: 'Edit', action: () => console.log('Edit') },
    { label: 'Delete', action: () => console.log('Delete'), variant: 'danger' },
  ]}
/>
```

### 3. Using Custom Hooks
```typescript
import { useDashboardData, useExamActions } from './hooks';

// In your component
const { stats, exams, loading, error, refetch } = useDashboardData({
  organizationId: 'org-123',
  autoRefresh: true,
  refreshInterval: 30000,
});

const { createExam, deleteExam, loading: actionLoading } = useExamActions({
  onSuccess: (msg) => showNotification(msg),
  onError: (err) => showError(err),
});
```

## API Integration

### Expected Backend Endpoints

Ensure your backend provides these endpoints:

```
GET /api/exams/stats
  Params: organizationId
  Response: { totalExams, activeExams, totalCandidates, averageScore, completionRate, passRate }

GET /api/exams
  Params: organizationId, page, limit, status, searchTerm
  Response: { exams: [], total: number }

GET /api/exams/:id
  Response: { id, title, status, totalQuestions, duration, ... }

POST /api/exams
  Body: { title, description, duration, passingPercentage, ... }
  Response: { id, ... }

PATCH /api/exams/:id
  Body: { title, description, ... }
  Response: { id, ... }

DELETE /api/exams/:id
  Response: 204 No Content

PATCH /api/exams/:id/publish
  Body: { filters?: {...} }
  Response: { id, status: 'PUBLISHED', ... }

GET /api/exams/activity-logs
  Params: organizationId, limit
  Response: [{ id, type, title, description, timestamp }]

GET /api/exams/:id/analytics
  Response: { passRate, averageScore, completionRate, ... }

GET /api/exams/:id/export
  Params: format (csv|xlsx)
  Response: Blob (file download)
```

## Customization Guide

### 1. Modify Colors
Edit `src/styles/ExamControllerDashboard.css`:

```css
:root {
  --primary: #3b82f6;           /* Change primary color */
  --success: #10b981;            /* Change success color */
  --warning: #f59e0b;            /* Change warning color */
  --danger: #ef4444;             /* Change danger color */
}
```

### 2. Add New Stat Cards
In `ExamControllerDashboard.tsx`:

```typescript
<div className="stat-card info">
  <div className="stat-icon">
    <FaYourIcon />
  </div>
  <div className="stat-content">
    <p className="stat-label">Your Label</p>
    <p className="stat-value">123</p>
    <p className="stat-change">↑ Change</p>
  </div>
</div>
```

### 3. Customize Navigation
Edit the `nav-menu` section in the sidebar:

```typescript
<button className="nav-item" onClick={() => setActiveTab('custom')}>
  <YourIcon /> Custom Tab
</button>
```

### 4. Add New Filters
Modify the `FilterPanel` usage:

```typescript
<FilterPanel
  filters={[
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'tech', label: 'Technology' },
        { value: 'management', label: 'Management' },
      ],
    },
  ]}
  onFilterChange={handleFilterChange}
  onApply={handleApplyFilters}
  onReset={handleResetFilters}
/>
```

## Testing

### Unit Testing Example
```typescript
import { render, screen } from '@testing-library/react';
import ExamControllerDashboard from './ExamControllerDashboard';

test('renders dashboard title', () => {
  render(<ExamControllerDashboard />);
  expect(screen.getByText(/Exam Controller/i)).toBeInTheDocument();
});
```

### E2E Testing Example
```typescript
// cypress/e2e/dashboard.cy.ts
describe('Exam Controller Dashboard', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password');
    cy.visit('/exam-controller/dashboard');
  });

  it('should display statistics', () => {
    cy.contains('Total Exams').should('be.visible');
    cy.contains('Active Exams').should('be.visible');
  });

  it('should create a new exam', () => {
    cy.get('.banner-cta').click();
    cy.url().should('include', '/admin/create-exam');
  });
});
```

## Performance Tuning

### 1. Optimize Data Fetching
```typescript
const { stats, exams, refetch } = useDashboardData({
  organizationId: 'org-123',
  autoRefresh: false,  // Disable if not needed
  refreshInterval: 60000,  // Increase interval
});
```

### 2. Implement React.memo for Cards
```typescript
const ExamCard = React.memo(({ exam }: { exam: Exam }) => (
  // Card JSX
));
```

### 3. Use useMemo for Expensive Calculations
```typescript
const filteredExams = useMemo(() => {
  return exams.filter(/* conditions */);
}, [exams]);
```

## Troubleshooting

### Issue: Dashboard not loading
**Solution**: 
- Check if the route is correctly configured
- Verify API URL in environment variables
- Check browser console for errors

### Issue: Data not fetching
**Solution**:
- Verify JWT token in localStorage
- Check API endpoints are accessible
- Enable CORS on backend if needed

### Issue: Styling looks broken
**Solution**:
- Clear browser cache (Cmd/Ctrl + Shift + Delete)
- Rebuild CSS: `npm run build`
- Check if ExamControllerDashboard.css is imported

### Issue: Responsive design not working
**Solution**:
- Add viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Check mobile breakpoints in CSS
- Test with Chrome DevTools

## Production Deployment

### 1. Build Optimization
```bash
npm run build
# Check bundle size
npm run analyze  # if configured
```

### 2. Environment Variables
```
REACT_APP_API_URL=https://api.yourcompany.com
REACT_APP_ANALYTICS_KEY=your-analytics-key
```

### 3. Performance Monitoring
Add to your monitoring service:
```typescript
// Sentry, DataDog, or similar
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-dsn",
  environment: process.env.NODE_ENV,
});
```

### 4. Security Headers
Ensure server sends:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

## Support & Questions

For issues or questions:
1. Check this documentation first
2. Review the code comments in components
3. Check the existing Evalis documentation
4. Open an issue with details

## Next Steps

1. **Connect to Real API**: Update DashboardService endpoints
2. **Implement Real Data**: Replace mock data with API calls
3. **Add More Features**: Use the component library to extend functionality
4. **Set Up Monitoring**: Add error tracking and analytics
5. **Performance Testing**: Run Lighthouse audit
6. **User Testing**: Get feedback and iterate

---

**Version**: 1.0.0
**Last Updated**: January 25, 2026
