# Summer Camp Manager

A comprehensive web application for managing summer camp operations, including campers enrollment, staff member scheduling, room management, and event planning.

## Features

### 🎯 Core Functionality
- **Campers Management**: Track camper information, allergies, medical notes, and parent contacts
- **Staff Management**: Manage staff members with roles, certifications, and contact information
- **Family Groups**: Organize campers into family groups with assigned sleeping rooms and staff
- **Room Management**: 
  - **Activity Rooms**: Organize rooms with capacity tracking and equipment lists
  - **Sleeping Rooms (Cabins)**: Manage sleeping accommodations for family groups
- **Event Calendar**: Visual calendar with drag-and-drop functionality for scheduling
- **Dynamic Camper Groups**: Create filtered groups based on age, gender, allergies, and more
- **Conflict Detection**: Automatic detection of scheduling conflicts including:
  - Room overcapacity
  - Event overcapacity
  - Camper double-booking
  - Staff double-booking
  - Missing required certifications

### ✨ Key Features
- **Drag & Drop Interface**: Easily move campers between events
- **Real-time Validation**: Prevent conflicts when enrolling campers in events
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

### API Documentation & Commands

The OpenAPI specification is organized in the `api/` directory. See [api/README.md](./api/README.md) for complete documentation.

**Useful API commands:**
```bash
# View interactive API documentation
npm run api:serve
# Then open http://localhost:8080/swagger-ui.html

# Validate the OpenAPI specification
npm run api:validate

# Bundle all API files into a single file
npm run api:bundle

# Generate TypeScript types from OpenAPI spec
npm run api:generate-types
```

For more details and workflows, see [api/QUICK_START.md](./api/QUICK_START.md).

## Project Structure

```
camp-manager/
├── src/
│   ├── components/        # Reusable Vue components
│   │   └── Header.vue     # Main navigation header
│   ├── views/             # Page components
│   │   ├── Dashboard.vue  # Overview and statistics
│   │   ├── Calendar.vue   # Event calendar with drag-and-drop
│   │   ├── Campers.vue   # Camper management
│   │   ├── StaffMembers.vue # Staff management
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
├── api/                   # OpenAPI specification (modular)
│   ├── openapi.yaml       # Main API entry point
│   ├── schemas/           # Entity definitions
│   ├── paths/             # API endpoints
│   └── parameters/        # Reusable parameters
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Usage Guide

### Dashboard
- View statistics for campers, staff members, rooms, and events
- See today's schedule at a glance
- Monitor scheduling conflicts
- Quick access to recent enrollments and room capacity

### Calendar View
- Visual timeline showing all events for a selected day
- Navigate between days using Previous/Next buttons
- Create new events with the "+ New Event" button
- **Drag and drop campers** from the sidebar to enroll them in events
- **Drag and drop campers between events** to move them
- Click on events to see details and manage enrollment
- Real-time conflict detection prevents double-booking

### Campers Management
- Add new campers with medical information and allergies
- Assign campers to family groups (required)
- View all enrolled campers in a card layout
- Click on any camper to see their schedule, family group, and details
- Edit or delete camper records

### Family Groups Management
- Create and manage family groups as the base organizational unit
- Assign family groups to sleeping rooms (cabins)
- Associate staff members with each family group
- View all campers within each family group
- Color-code groups for easy visual identification
- Track family group statistics and assignments

### Staff Management
- Add staff members with roles and certifications
- Color-coded by role (Director, Supervisor, Counselor, Nurse, Instructor)
- View assigned events for each staff member
- Track certifications for compliance

### Room Management

#### Activity Rooms
- Manage rooms with capacity and equipment tracking
- Visual indicators for room usage
- See all events scheduled in each room
- Categorized by type (Classroom, Activity, Sports, Dining, Outdoor, Arts)

#### Sleeping Rooms (Cabins)
- Simple room management with name, bed count, and location
- View family groups assigned to each room
- Track room capacity and occupancy through family groups
- Assignment is permanent through family groups (no temporary assignments)

## Data Model

### Camper
- Basic info: Name, age, parent contact
- Medical: Allergies, medical notes
- Registration date
- **Family group assignment** (required)

### Family Group
- Name and description
- **Assigned sleeping room** (required)
- **Assigned staff members** (array)
- Color for visual identification
- List of campers in the group

### Staff Member
- Basic info: Name, role, contact
- Certifications
- Assigned events
- Associated family groups

### Activity Room
- Name, type, capacity
- Location, equipment
- Usage tracking

### Sleeping Room (Cabin)
- Name, number of beds
- Location (free text)
- Assigned family groups (permanent through family group relationships)

### Event
- Title, description, time range
- Room assignment
- Capacity limits
- Enrolled campers
- Assigned staff
- Required certifications
- Color coding for calendar

### Camper Group (Dynamic)
- Name and description
- Filters: age range, gender, allergies, medical notes
- Color for visual identification
- Automatically populated based on filters

## Conflict Detection

The system automatically detects and prevents:

1. **Room Overcapacity**: Multiple overlapping events exceeding room capacity
2. **Event Overcapacity**: More campers enrolled than event capacity allows
3. **Camper Double-booking**: Camper enrolled in overlapping events
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
- 48 campers with various ages and allergies
- 8 staff members with different roles
- 10 activity rooms of various types
- 6 sleeping rooms (cabins)
- 4 family groups assigned to cabins
- Sample events for a full week schedule
- Dynamic camper groups with various filters

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

