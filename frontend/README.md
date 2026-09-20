# School Admission Management - Frontend

## Framework & Architecture
- **Framework**: Next.js (App Router)
- **State & Context**: React Context (`AuthContext`)
- **API Client**: Modular fetch wrapper (`lib/api.js`)

## Routing Structure
- `/login` - Authentication (Parent & Admission Team)
- `/register` - Parent Registration
- `/parent/dashboard` - Parent Overview & Quick Actions
- `/parent/students` - Student List
- `/parent/students/create` - New Student Application Form
- `/parent/students/[id]` - Student Details, Fee Payment & Slot Booking
- `/admission/dashboard` - Admission Team Overview & Metrics
- `/admission/applications` - Admission Applications List
- `/admission/applications/[id]` - Application Review, Score Entry & Course Assignment

## Reusable Components
- `Navbar.jsx`: Top navigation bar with user details and logout
- `Sidebar.jsx`: Role-based navigation sidebar
- `StatusBadge.jsx`: Color-coded application status badge
- `StatusTimeline.jsx`: Visual workflow timeline showing current stage
- `StudentForm.jsx`: Form for creating/editing student information
- `ExamSlotList.jsx`: Component for browsing and selecting available exam slots
- `Loading.jsx`: Unified loading state component
