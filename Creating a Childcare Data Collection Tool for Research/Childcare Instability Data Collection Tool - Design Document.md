# Childcare Instability Data Collection Tool - Design Document

## Overview
This tool will help researchers collect data about childcare arrangements and weekly schedules from parents. The interface will be intuitive, research-focused, and provide secure data export capabilities.

## User Flow

### Step 1: Welcome & Instructions
- Landing page with clear explanation of the research study
- Instructions on how to use the tool
- Consent form (if required)
- Basic demographic information (optional)

### Step 2: Current Childcare Arrangements
- Form to collect information about all current childcare arrangements
- Fields for each arrangement:
  - Type of care (daycare, family member, nanny, self-care, etc.)
  - Provider name/description
  - Typical days/hours
  - Location
  - Cost (optional)
  - Reliability rating

### Step 3: Weekly Calendar Interface
- Interactive calendar showing the past week (7 days)
- Time slots for waking hours (e.g., 6 AM - 10 PM)
- "Painting" interface similar to when2meet
- Different colors for different childcare arrangements
- Legend showing color coding
- Ability to select time blocks and assign to different care providers

### Step 4: Review & Submit
- Summary of entered data
- Ability to go back and edit
- Submit button to save data
- Thank you message with study contact information

## Technical Architecture

### Frontend (React)
- **Landing Page Component**: Welcome, instructions, consent
- **Demographics Component**: Basic information collection
- **Arrangements Component**: Form for current childcare arrangements
- **Calendar Component**: Interactive weekly calendar with painting functionality
- **Review Component**: Data summary and submission
- **Admin Component**: Data export and management (researcher access)

### Backend (Node.js/Express)
- **Authentication**: Simple session management for researchers
- **Data Storage**: MongoDB for flexible data structure
- **API Endpoints**:
  - POST /api/participant - Create new participant session
  - POST /api/arrangements - Save childcare arrangements
  - POST /api/calendar - Save weekly calendar data
  - GET /api/export - Export data to CSV (admin only)
  - GET /api/participants - List all participants (admin only)

### Database Schema (MongoDB)

```javascript
// Participant Collection
{
  _id: ObjectId,
  sessionId: String,
  demographics: {
    childAge: Number,
    parentAge: Number,
    location: String,
    householdIncome: String // optional
  },
  arrangements: [{
    id: String,
    type: String, // 'daycare', 'family', 'nanny', 'self', 'other'
    providerName: String,
    typicalDays: [String], // ['monday', 'tuesday', ...]
    typicalHours: String,
    location: String,
    cost: Number, // optional
    reliability: Number // 1-5 scale
  }],
  weeklySchedule: [{
    day: String, // 'monday', 'tuesday', etc.
    timeSlots: [{
      hour: Number, // 6-22 (6 AM - 10 PM)
      arrangementId: String, // references arrangements.id
      notes: String // optional
    }]
  }],
  createdAt: Date,
  completedAt: Date
}
```

## UI/UX Design Principles

### Color Scheme
- Primary: Professional blue (#2563eb)
- Secondary: Warm gray (#6b7280)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Childcare types will have distinct, accessible colors

### Layout
- Clean, minimal design
- Mobile-responsive
- Clear navigation between steps
- Progress indicator
- Consistent spacing and typography

### Calendar Interface
- Grid layout similar to when2meet
- Time labels on the left (6 AM, 7 AM, etc.)
- Day labels at the top (Mon, Tue, etc.)
- Hover effects for better usability
- Click and drag functionality for painting time blocks
- Color legend always visible
- Undo/clear functionality

## Data Export Features

### CSV Export Structure
```csv
ParticipantID,ChildAge,ParentAge,Location,ArrangementType,ProviderName,Day,Hour,Notes,Timestamp
P001,4,32,Urban,daycare,Little Stars,monday,8,Regular drop-off,2025-01-15T08:00:00Z
P001,4,32,Urban,self,Parent,monday,17,Picked up from daycare,2025-01-15T17:00:00Z
```

### Admin Dashboard
- Login for researchers
- Participant list with completion status
- Data export options (CSV, filtered exports)
- Basic analytics (completion rates, common arrangements)

## Security & Privacy
- No personally identifiable information stored
- Session-based data collection
- Encrypted data transmission (HTTPS)
- Secure admin authentication
- Data retention policies
- Option for participants to delete their data

## Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Clear, simple language
- Multiple input methods (click, drag, keyboard)

## Mobile Considerations
- Responsive design for tablets and phones
- Touch-friendly interface
- Simplified calendar view for small screens
- Swipe gestures for navigation
- Optimized for portrait orientation

