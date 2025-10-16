# Microservices Architecture Refactoring

## Overview
The codebase has been refactored to follow a microservices architecture pattern, where entity-specific services encapsulate business logic and interact with a generic storage infrastructure layer.

## Architecture

### 1. Generic Storage Layer (`storage.ts`)
The base storage service provides low-level CRUD operations:

```typescript
storageService.getAll<T>(storageKey: string): Promise<T[]>
storageService.getById<T>(storageKey: string, id: string): Promise<T | null>
storageService.save<T>(storageKey: string, item: T): Promise<T>
storageService.delete(storageKey: string, id: string): Promise<void>
storageService.saveBatch<T>(storageKey: string, items: T[]): Promise<T[]>
storageService.clear(storageKey: string): Promise<void>
storageService.clearAll(storageKeys: string[]): Promise<void>
storageService.seed<T>(storageKey: string, data: T[]): Promise<void>
storageService.seedData(data: object): Promise<void>
```

### 2. Storage Keys (`storageKeys.ts`)
Centralized storage key definitions to avoid magic strings:

```typescript
export const STORAGE_KEYS = {
  CAMPERS: 'camp_campers',
  STAFF_MEMBERS: 'camp_staff_members',
  LOCATIONS: 'camp_locations',
  HOUSING_ROOMS: 'camp_housing_rooms',
  EVENTS: 'camp_events',
  CAMPER_GROUPS: 'camp_camper_groups',
  FAMILY_GROUPS: 'camp_family_groups',
  PROGRAMS: 'camp_programs',
  ACTIVITIES: 'camp_activities',
  AREAS: 'camp_areas',
  CERTIFICATIONS: 'camp_certifications',
  COLORS: 'camp_colors',
  SESSIONS: 'camp_sessions',
  LABELS: 'camp_labels',
} as const;
```

### 3. Entity Services
Each entity has its own service that wraps the storage layer and implements entity-specific business logic:

#### Core Entity Services:
- **`campersService.ts`** - Manages camper data and relationships
  - `getCampers()`, `getCamper(id)`, `saveCamper(camper)`, `deleteCamper(id)`
  - `getCampersByFamilyGroup(familyGroupId)`, `getCampersBySession(sessionId)`
  - Handles cleanup when deleting (removes from events)

- **`staffMembersService.ts`** - Manages staff member data
  - `getStaffMembers()`, `getStaffMember(id)`, `saveStaffMember(member)`, `deleteStaffMember(id)`
  - `getStaffMembersByCertification(certificationId)`, `getStaffMembersByManager(managerId)`
  - Handles cleanup when deleting (removes from events)

- **`eventsService.ts`** - Manages event data and enrollments
  - `getEvents(startDate?, endDate?)`, `getEvent(id)`, `saveEvent(event)`, `deleteEvent(id)`
  - `saveEventsBatch(events)` - For bulk operations like recurring events
  - `enrollCamper(eventId, camperId)`, `unenrollCamper(eventId, camperId)`
  - `getEventsForCamper(camperId)`, `getEventsForStaff(staffId)`, `getEventsForLocation(locationId)`, `getEventsForProgram(programId)`

#### Location Services:
- **`locationsService.ts`** - Manages activity/room locations
  - `getLocations()`, `getLocation(id)`, `saveLocation(location)`, `deleteLocation(id)`
  - `getLocationsByArea(areaId)`, `getLocationsByType(type)`

- **`housingRoomsService.ts`** - Manages sleeping rooms
  - `getHousingRooms()`, `getHousingRoom(id)`, `saveHousingRoom(room)`, `deleteHousingRoom(id)`
  - `getHousingRoomsByArea(areaId)`

- **`areasService.ts`** - Manages physical areas
  - `getAreas()`, `getArea(id)`, `saveArea(area)`, `deleteArea(id)`
  - `getAreasByType(type)`

#### Group Services:
- **`groupsService.ts`** - Manages camper groups (filter-based)
  - `getCamperGroups()`, `getCamperGroup(id)`, `saveCamperGroup(group)`, `deleteCamperGroup(id)`
  - Automatically updates `updatedAt` timestamp

- **`familyGroupsService.ts`** - Manages family groups
  - `getFamilyGroups()`, `getFamilyGroup(id)`, `saveFamilyGroup(group)`, `deleteFamilyGroup(id)`
  - `getFamilyGroupsByRoom(housingRoomId)`, `getFamilyGroupsBySession(sessionId)`
  - Automatically updates `updatedAt` timestamp

#### Program Services:
- **`programsService.ts`** - Manages programs
  - `getPrograms()`, `getProgram(id)`, `saveProgram(program)`, `deleteProgram(id)`
  - `getProgramsForStaffMember(staffId)`, `getProgramsForLocation(locationId)`
  - Handles cleanup when deleting (removes from activities, deletes orphaned activities)

- **`activitiesService.ts`** - Manages activities
  - `getActivities()`, `getActivity(id)`, `saveActivity(activity)`, `deleteActivity(id)`
  - `getActivitiesInProgram(programId)`
  - `addActivityToProgram(activityId, programId)`, `removeActivityFromProgram(activityId, programId)`
  - Handles cleanup when deleting (removes from programs)

#### Configuration Services:
- **`certificationsService.ts`** - Manages certifications
  - `getCertifications()`, `getCertification(id)`, `saveCertification(cert)`, `deleteCertification(id)`
  - `getCertificationsWithExpiration()`

- **`colorsService.ts`** - Manages camp colors
  - `getColors()`, `getColor(id)`, `saveColor(color)`, `deleteColor(id)`
  - `getColorByName(name)`, `getColorByHex(hexValue)`

- **`sessionsService.ts`** - Manages camp sessions
  - `getSessions()`, `getSession(id)`, `saveSession(session)`, `deleteSession(id)`
  - `getActiveSessions()`, `getPastSessions()`, `getSessionsInRange(startDate, endDate)`

- **`labelsService.ts`** - Manages labels
  - `getLabels()`, `getLabel(id)`, `saveLabel(label)`, `deleteLabel(id)`
  - `getLabelByName(name)`

### 4. Central Service Export (`services/index.ts`)
All services are exported from a central location for easy importing:

```typescript
import { 
  campersService, 
  eventsService, 
  staffMembersService 
} from '@/services';
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Storage layer only handles data persistence
- Entity services handle business logic
- Clear boundaries between layers

### 2. **Maintainability**
- Each service is focused on a single entity
- Easy to find and update entity-specific logic
- Changes to one entity don't affect others

### 3. **Testability**
- Services can be tested independently
- Mock storage layer for unit tests
- Test business logic without touching storage

### 4. **Scalability**
- Easy to add new entities (create new service)
- Services can be extended with new methods
- Ready for future API integration

### 5. **Consistency**
- All entities follow the same pattern
- Predictable method names and signatures
- Centralized storage key management

### 6. **Future-Ready**
- Easy to replace localStorage with API calls
- Services can add caching, validation, etc.
- Ready for microservices deployment

## Usage Examples

### Simple CRUD Operations
```typescript
// Get all campers
const campers = await campersService.getCampers();

// Get a specific camper
const camper = await campersService.getCamper('camper-001');

// Save a camper
await campersService.saveCamper(updatedCamper);

// Delete a camper (with cleanup)
await campersService.deleteCamper('camper-001');
```

### Business Logic Operations
```typescript
// Enroll a camper in an event
await eventsService.enrollCamper(eventId, camperId);

// Get all events for a camper
const camperEvents = await eventsService.getEventsForCamper(camperId);

// Get staff members with a specific certification
const certifiedStaff = await staffMembersService.getStaffMembersByCertification(certId);

// Add an activity to a program
await activitiesService.addActivityToProgram(activityId, programId);
```

### Batch Operations
```typescript
// Save multiple events at once (recurring events)
await eventsService.saveEventsBatch(recurringEvents);
```

### Query Operations
```typescript
// Get events in a date range
const events = await eventsService.getEvents(startDate, endDate);

// Get active sessions
const activeSessions = await sessionsService.getActiveSessions();

// Get locations by type
const outdoorLocations = await locationsService.getLocationsByType('outdoor');
```

## Migration from Old Architecture

The store (`campStore.ts`) has been updated to use the new entity services instead of calling the storage service directly:

### Before:
```typescript
async addCamper(camper: Camper): Promise<void> {
  await storageService.saveCamper(camper);
  this.campers.push(camper);
}
```

### After:
```typescript
async addCamper(camper: Camper): Promise<void> {
  await campersService.saveCamper(camper);
  this.campers.push(camper);
}
```

## File Structure

```
src/
├── services/
│   ├── storage.ts                 # Generic storage layer
│   ├── storageKeys.ts            # Storage key constants
│   ├── campersService.ts         # Camper entity service
│   ├── staffMembersService.ts    # Staff member entity service
│   ├── eventsService.ts          # Event entity service
│   ├── locationsService.ts       # Location entity service
│   ├── housingRoomsService.ts    # Housing room entity service
│   ├── groupsService.ts          # Camper group entity service
│   ├── familyGroupsService.ts    # Family group entity service
│   ├── programsService.ts        # Program entity service
│   ├── activitiesService.ts      # Activity entity service
│   ├── areasService.ts           # Area entity service
│   ├── certificationsService.ts  # Certification entity service
│   ├── colorsService.ts          # Color entity service
│   ├── sessionsService.ts        # Session entity service
│   ├── labelsService.ts          # Label entity service
│   ├── conflicts.ts              # Conflict detection service
│   └── index.ts                  # Central export
├── stores/
│   └── campStore.ts              # Updated to use entity services
└── utils/
    └── devTools.ts               # Updated to use new services
```

## Next Steps

### Potential Enhancements:
1. **Add validation** to entity services
2. **Add caching** for frequently accessed data
3. **Add logging** for debugging and monitoring
4. **Add error handling** with custom error types
5. **Add TypeScript generics** to reduce code duplication
6. **Add service workers** for offline support
7. **Add API integration** to replace localStorage
8. **Add unit tests** for each service

### API Migration Path:
When ready to migrate to a real API:
1. Update storage service to call API endpoints
2. Entity services remain unchanged
3. Add authentication/authorization to storage layer
4. Add retry logic and error handling
5. Add request/response interceptors

The microservices architecture makes this transition seamless!

