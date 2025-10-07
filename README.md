# Summer Camp Manager

A comprehensive web application for managing summer camp operations, including children enrollment, team member scheduling, room management, and event planning.

## Features

### 🎯 Core Functionality
- **Children Management**: Track children information, allergies, medical notes, and parent contacts
- **Team Management**: Manage staff members with roles, certifications, and contact information
- **Room Management**: Organize rooms with capacity tracking and equipment lists
- **Event Calendar**: Visual calendar with drag-and-drop functionality for scheduling
- **Conflict Detection**: Automatic detection of scheduling conflicts including:
  - Room overcapacity
  - Event overcapacity
  - Child double-booking
  - Staff double-booking
  - Missing required certifications

### ✨ Key Features
- **Drag & Drop Interface**: Easily move children between events
- **Real-time Validation**: Prevent conflicts when enrolling children in events
- **Capacity Management**: Visual indicators for room and event capacity
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Local Storage**: Data persists in browser (first version using mock backend)

## Technology Stack

### Frontend
- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Pinia**: State management
- **Vue Router**: Client-side routing
- **date-fns**: Date manipulation and formatting

### API Schema
- **OpenAPI 3.0**: API specification for type safety between frontend and backend

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
camp-manager/
├── src/
│   ├── components/        # Reusable Vue components
│   │   └── Header.vue     # Main navigation header
│   ├── views/             # Page components
│   │   ├── Dashboard.vue  # Overview and statistics
│   │   ├── Calendar.vue   # Event calendar with drag-and-drop
│   │   ├── Children.vue   # Children management
│   │   ├── TeamMembers.vue # Staff management
│   │   └── Rooms.vue      # Room management
│   ├── stores/            # Pinia stores
│   │   └── campStore.ts   # Main application state
│   ├── services/          # Business logic
│   │   ├── storage.ts     # Local storage service (async)
│   │   └── conflicts.ts   # Conflict detection logic
│   ├── data/              # Mock data
│   │   └── mockData.ts    # Initial seed data
│   ├── types/             # TypeScript types
│   │   └── api.ts         # Generated from OpenAPI schema
│   ├── router/            # Vue Router configuration
│   ├── style.css          # Global styles
│   ├── App.vue            # Root component
│   └── main.ts            # Application entry point
├── openapi.yaml           # OpenAPI specification
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Usage Guide

### Dashboard
- View statistics for children, team members, rooms, and events
- See today's schedule at a glance
- Monitor scheduling conflicts
- Quick access to recent enrollments and room capacity

### Calendar View
- Visual timeline showing all events for a selected day
- Navigate between days using Previous/Next buttons
- Create new events with the "+ New Event" button
- **Drag and drop children** from the sidebar to enroll them in events
- **Drag and drop children between events** to move them
- Click on events to see details and manage enrollment
- Real-time conflict detection prevents double-booking

### Children Management
- Add new children with medical information and allergies
- View all enrolled children in a card layout
- Click on any child to see their schedule and details
- Edit or delete child records

### Team Management
- Add team members with roles and certifications
- Color-coded by role (Director, Supervisor, Counselor, Nurse, Instructor)
- View assigned events for each team member
- Track certifications for compliance

### Room Management
- Manage rooms with capacity and equipment tracking
- Visual indicators for room usage
- See all events scheduled in each room
- Categorized by type (Classroom, Activity, Sports, Dining, Outdoor, Arts)

## Data Model

### Child
- Basic info: Name, age, parent contact
- Medical: Allergies, medical notes
- Registration date

### Team Member
- Basic info: Name, role, contact
- Certifications
- Assigned events

### Room
- Name, type, capacity
- Location, equipment
- Usage tracking

### Event
- Title, description, time range
- Room assignment
- Capacity limits
- Enrolled children
- Assigned staff
- Required certifications
- Color coding for calendar

## Conflict Detection

The system automatically detects and prevents:

1. **Room Overcapacity**: Multiple overlapping events exceeding room capacity
2. **Event Overcapacity**: More children enrolled than event capacity allows
3. **Child Double-booking**: Child enrolled in overlapping events
4. **Staff Double-booking**: Staff assigned to overlapping events
5. **Missing Certifications**: Events requiring certifications not held by assigned staff

Conflicts are displayed on the dashboard and prevent invalid enrollments.

## Future Enhancements

### Backend Development
The current version uses local storage with async functions to simulate a backend. The next phase will include:

- **Node.js/TypeScript** or **Go** backend
- RESTful API following the OpenAPI specification
- Database integration (PostgreSQL/MongoDB)
- User authentication and authorization
- Real-time updates with WebSockets
- Report generation (PDF exports)
- Email notifications for parents and staff

### Additional Features
- Multi-week/multi-session support
- Attendance tracking
- Payment and billing management
- Parent portal
- Photo sharing
- Emergency contact management
- Activity planning templates
- Resource inventory management

## Development Notes

### Mock Data
The application comes pre-seeded with sample data including:
- 8 children with various ages and allergies
- 6 team members with different roles
- 7 rooms of various types
- Sample events for today's schedule

### Type Safety
All data types are defined in the OpenAPI schema and automatically converted to TypeScript types, ensuring consistency when the backend is implemented.

### Storage Service
The `storageService` uses async functions to match the future API structure, making the transition to a real backend seamless.

## Contributing

This is the initial frontend-only version. When contributing:
1. Maintain TypeScript type safety
2. Follow the existing component structure
3. Update the OpenAPI schema if adding new data fields
4. Test conflict detection logic thoroughly
5. Ensure responsive design principles

## License

MIT License - feel free to use this project for your summer camp!

## Support

For questions or issues, please open a GitHub issue or contact the development team.

---

**Current Version**: 0.0.1 (Frontend Only)  
**Status**: ✅ Ready for testing and feedback

