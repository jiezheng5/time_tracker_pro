# Time Tracking App - MVP Specification

## MVP Definition

The Minimum Viable Product (MVP) will deliver the core time tracking functionality with essential visualization features, focusing on the primary user need: **accurate time recording and basic insights**.

## MVP Features (Must-Have)

### 1. Time Entry Interface
- **Weekly Grid View**: 7 days × 12 hours (9am-11pm) = 84 time slots
- **One-Click Entry**: Click any time slot to add/edit activity
- **Quick Category Selection**: Dropdown with color-coded categories
- **Priority Marking**: Simple checkboxes for Important/Urgent
- **Visual Feedback**: Immediate color coding after assignment

### 2. Category Management
- **CRUD Operations**: Create, edit, delete categories
- **Color Assignment**: Choose from predefined color palette (8-12 colors)
- **Default Categories**: Pre-populate with common categories:
  - Work/Coding
  - Learning/Study
  - Exercise/Health
  - Family/Social
  - Rest/Entertainment
  - Meals
  - Commute/Travel

### 3. ✅ Enhanced Dashboard (COMPLETED)
- **Current Week View**: Primary focus on this week's data ✅
- **Category Distribution**: Interactive pie chart with responsive sizing ✅
- **Priority Distribution**: Pie chart visualization of Eisenhower Matrix ✅
- **Weekly Progress**: Bar chart showing daily activity patterns ✅
- **Quick Stats**: Total tracked hours, category breakdown ✅
- **Adjustable Layout**: Resizable sidebar (350-800px) for optimal chart viewing ✅

### 4. Data Persistence
- **Local Storage**: All data saved in browser
- **Auto-save**: Changes saved immediately
- **Data Validation**: Prevent invalid entries

### 5. Export Functionality
- **CSV Export**: Weekly data export for external analysis
- **Simple Format**: Date, Hour, Category, Important, Urgent, Description

## MVP User Stories

### Primary User Flow
```
As a user, I want to:
1. Open the app and see the current week's time grid, granularity of 1 hour
2. Click on a time slot (e.g., Monday 10am)
3. Select a category from dropdown (e.g., "Work/Coding/AI Study/..."), color-coded, user should be able to quickly scan and select the right category, user should be able to add new categories on the fly
4. Mark as Important & Urgent quardrants, Eisenhower matrix, if needed
5. See the slot immediately color-coded
6. View basic stats on the dashboard
7. Export my week's data as CSV
```

### Success Criteria
- ✅ Add a time entry in <5 seconds
- ✅ Visual feedback within 200ms of interaction
- ✅ App loads in <2 seconds
- ✅ Works on desktop and mobile browsers
- ✅ Adjustable chart layout for optimal data visualization
- ✅ Responsive charts that adapt to panel width changes

## MVP Exclusions (Future Features)

### Not in MVP
- ❌ Advanced charts (trends, comparisons)
- ❌ Screenshot sharing
- ❌ Cloud sync/user accounts
- ❌ Bulk editing tools
- ❌ Keyboard shortcuts
- ❌ Dark mode
- ❌ Advanced export formats (JSON, PDF)
- ❌ Data import functionality
- ❌ Activity descriptions/notes
- ❌ Time tracking timer/stopwatch
- ❌ Notifications/reminders

## Technical MVP Scope

### Core Components to Build
1. **TimeGrid**: Main 7×12 grid component
2. **TimeSlot**: Individual hour slot component
3. **CategorySelector**: Dropdown with colors
4. **PriorityToggle**: Important/Urgent checkboxes
5. **CategoryManager**: CRUD interface for categories
6. **Dashboard**: Simple stats and one chart
7. **ExportButton**: CSV download functionality

### Data Structure (Simplified)
```typescript
interface TimeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  hour: number; // 9-22
  categoryId: string;
  isImportant: boolean;
  isUrgent: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
}
```

### Tech Stack (Minimal)
- **React 18** + **TypeScript**
- **Next.js 14** (for easy deployment)
- **Tailwind CSS** (for rapid styling)
- **Chart.js** (for simple charts)
- **date-fns** (for date handling)

## MVP Development Plan

### Week 1: Foundation
- [ ] Project setup with Next.js + TypeScript
- [ ] Basic layout and routing
- [ ] TimeGrid component with static data
- [ ] Category management interface

### Week 2: Core Functionality
- [ ] Time entry creation/editing
- [ ] Local storage integration
- [ ] Category color coding
- [ ] Priority marking system

### Week 3: Dashboard & Polish
- [ ] Basic dashboard with pie chart
- [ ] Eisenhower matrix view
- [ ] CSV export functionality
- [ ] Responsive design

### Week 4: Testing & Refinement
- [ ] User testing for 5-second goal
- [ ] Performance optimization
- [ ] Bug fixes and edge cases
- [ ] Documentation

## MVP Success Metrics

### Quantitative
- Time to add entry: <5 seconds ✅
- App load time: <2 seconds ✅
- Weekly tracking rate: >80% ✅

### Qualitative
- User can understand the interface immediately
- Color coding makes patterns obvious
- Export provides useful data for analysis
- Mobile experience is usable

## Post-MVP Roadmap

### Version 1.1 (Month 2)
- Advanced charts and trends
- Bulk editing capabilities
- Activity descriptions
- Dark mode

### Version 1.2 (Month 3)
- Cloud sync and user accounts
- Screenshot sharing
- Data import/export improvements

### Version 2.0 (Month 4+)
- Mobile app
- Team features
- AI-powered insights
- Calendar integration

---

*This MVP specification ensures we build a focused, usable product that validates the core concept before adding complexity.*
