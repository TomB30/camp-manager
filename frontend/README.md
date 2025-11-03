# Camp Manager - Frontend

Vue 3 + TypeScript frontend application for the Summer Camp Manager system.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open your browser and navigate to http://localhost:5173

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable Vue components
│   │   ├── modals/        # Modal dialogs
│   │   ├── forms/         # Form components
│   │   └── ...
│   ├── views/             # Page components
│   │   ├── Dashboard.vue  # Overview and statistics
│   │   ├── Calendar.vue   # Event calendar with drag-and-drop
│   │   ├── Campers.vue    # Camper management
│   │   ├── StaffMembers.vue # Staff management
│   │   ├── Groups.vue     # Family groups management
│   │   ├── Programs.vue   # Programs and activities
│   │   └── CampSettings.vue # Camp configuration
│   ├── stores/            # Pinia stores for state management
│   │   ├── campStore.ts   # Main camp data
│   │   ├── eventStore.ts  # Events and calendar
│   │   └── ...
│   ├── services/          # Business logic and API clients
│   │   ├── storage.ts     # Local storage service (async)
│   │   ├── conflicts.ts   # Conflict detection logic
│   │   └── ...
│   ├── composables/       # Reusable composition functions
│   │   └── useToast.ts    # Toast notifications
│   ├── utils/             # Utility functions
│   │   ├── dateUtils.ts   # Date formatting and manipulation
│   │   ├── colorUtils.ts  # Color generation
│   │   └── ...
│   ├── data/              # Mock data
│   │   └── mockData.ts    # Initial seed data
│   ├── generated/         # Auto-generated from OpenAPI
│   │   └── api/           # TypeScript types
│   ├── router/            # Vue Router configuration
│   ├── style.scss         # Global styles
│   ├── App.vue            # Root component
│   └── main.ts            # Application entry point
├── public/                # Static assets
├── index.html             # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## 🧩 Key Features

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

### Programs & Activities
- Organize activities into programs
- Define activity durations and locations
- Track required certifications for activities
- Associate staff and locations with programs

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Testing
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate coverage report

### Code Quality
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run type-check` - Type check with TypeScript

### API
- `npm run api:generate-types` - Generate TypeScript types from OpenAPI spec
- `npm run api:validate` - Validate OpenAPI specification
- `npm run api:bundle` - Bundle API files into single spec

## 🗄️ Data Model

### Camper
- Basic info: Name, birthday, gender
- Registration date
- Session assignment (required)
- Family group assignment
- Photo

### Family Group
- Name and description
- Assigned sleeping room
- Assigned staff members (array)
- Color for visual identification
- List of campers in the group

### Staff Member
- Basic info: Name, birthday, role
- Email and phone
- Certifications (array of IDs)
- Manager assignment
- Photo

### Event
- Title, description, time range
- Location assignment
- Capacity limits
- Group assignments (array)
- Exclude lists (staff/campers)
- Required certifications
- Color coding for calendar
- Program and activity references

### Session
- Name and description
- Start and end dates
- Used for organizing campers and groups

### Program
- Name and description
- Color coding
- Associated activities, staff, and locations

### Activity
- Name and description
- Program assignments (array)
- Duration, capacity, minimum staff
- Default location
- Required certifications

## 🚨 Conflict Detection

The system automatically detects and prevents:

1. **Room Overcapacity**: Multiple overlapping events exceeding room capacity
2. **Event Overcapacity**: More campers enrolled than event capacity allows
3. **Camper Double-booking**: Camper enrolled in overlapping events
4. **Staff Double-booking**: Staff assigned to overlapping events
5. **Missing Certifications**: Events requiring certifications not held by assigned staff

Conflicts are displayed on the dashboard and prevent invalid enrollments.

## 🛠️ Technology Stack

- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Quasar** - UI component framework
- **date-fns** - Date manipulation and formatting
- **Vitest** - Unit testing framework

## 🔄 State Management

The application uses Pinia stores for state management:

- `campStore` - Camp configuration and settings
- `camperStore` - Camper data and operations
- `staffStore` - Staff members and roles
- `eventStore` - Events and calendar
- `groupStore` - Family groups
- `sessionStore` - Camp sessions
- `programStore` - Programs and activities
- `locationStore` - Locations and areas
- `colorStore` - Color palette
- `roleStore` - Staff roles
- `certificationStore` - Certifications

## 🎨 Styling

- **Quasar Framework** - Component library with Material Design
- **SCSS** - CSS preprocessor
- **Custom Variables** - Defined in `quasar-variables.scss`
- **Responsive Design** - Mobile-first approach

## 🔗 API Integration

The frontend is designed to work with the Go backend API:

- OpenAPI-generated TypeScript types in `src/generated/api/`
- Async service layer in `src/services/`
- Currently uses localStorage for development (mock backend)
- Ready for seamless transition to real API

## 📝 Mock Data

The application comes pre-seeded with sample data:
- 48 campers with various ages and backgrounds
- 8 staff members with different roles
- 10 activity rooms of various types
- 6 sleeping rooms (cabins)
- 4 family groups assigned to cabins
- Sample events for a full week schedule
- Multiple sessions and programs

## 🧪 Testing

Tests are written using Vitest:

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Generate coverage
npm run test:coverage
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📚 Additional Documentation

See the [main documentation](../docs/) for:
- Architecture overview
- Feature guides
- API documentation
- Development workflows

## 🤝 Contributing

When contributing to the frontend:
1. Maintain TypeScript type safety
2. Follow Vue 3 Composition API patterns
3. Write tests for new features
4. Update OpenAPI schema if adding new data fields
5. Ensure responsive design principles

## 📄 License

MIT License

