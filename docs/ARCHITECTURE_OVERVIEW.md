# Architecture Overview - Complete Microservices Structure

## Summary

The camp-manager application has been fully refactored to follow a **microservices architecture pattern** across both the data layer (services) and state management layer (stores). This provides exceptional separation of concerns, maintainability, and scalability.

## Full Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     Vue Components                            │
│  (Views, Modals, Cards, Forms)                               │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   Pinia Stores Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Main      │  │  Campers   │  │  Events    │  ... (14)  │
│  │  Store     │  │  Store     │  │  Store     │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  • State management                                          │
│  • Reactivity                                                │
│  • Cross-store coordination                                  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   Services Layer                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Campers   │  │  Staff     │  │  Events    │  ... (14)  │
│  │  Service   │  │  Service   │  │  Service   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  • Business logic                                            │
│  • Entity-specific operations                                │
│  • Data relationships & cleanup                              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              Generic Storage Service                          │
│  • GET, POST, PUT, DELETE                                    │
│  • localStorage operations                                   │
│  • No business logic                                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ localStorage │ (Future: REST API)
                  └──────────────┘
```

## Layer Responsibilities

### 1. Components Layer (Vue)
**Responsibility:** User interface and user interaction

- Render UI
- Handle user input
- Call store actions
- React to store state changes

**Example:**
```vue
<script setup lang="ts">
import { useCampersStore } from '@/stores';

const campersStore = useCampersStore();

async function handleAddCamper() {
  await campersStore.addCamper(newCamper);
}
</script>
```

### 2. Stores Layer (Pinia)
**Responsibility:** State management and reactivity

- Manage entity state
- Provide getters for derived data
- Coordinate actions
- Trigger conflict detection
- Handle cross-store relationships

**Example:**
```typescript
export const useCampersStore = defineStore('campers', {
  state: () => ({
    campers: [] as Camper[],
    loading: false,
  }),
  
  actions: {
    async addCamper(camper: Camper) {
      await campersService.saveCamper(camper);  // Call service
      this.campers.push(camper);                 // Update state
    }
  }
});
```

### 3. Services Layer
**Responsibility:** Business logic and data operations

- Entity-specific business logic
- Data validation
- Relationship management
- Cleanup operations
- Wrap storage calls

**Example:**
```typescript
class CampersService {
  async deleteCamper(id: string) {
    await storageService.delete(STORAGE_KEYS.CAMPERS, id);
    
    // Business logic: Remove from all events
    const events = await storageService.getAll(STORAGE_KEYS.EVENTS);
    // ... cleanup logic
  }
}
```

### 4. Storage Layer
**Responsibility:** Generic data persistence

- CRUD operations on localStorage
- No business logic
- No entity-specific knowledge
- Pure data access

**Example:**
```typescript
class StorageService {
  async getAll<T>(storageKey: string): Promise<T[]> {
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
  }
}
```

## Entity Organization

### 14 Entity Microservices (Complete Vertical Slices)

Each entity has:
- **Service** (`services/[entity]Service.ts`) - Business logic
- **Store** (`stores/[entity]Store.ts`) - State management

| Entity | Service | Store | Description |
|--------|---------|-------|-------------|
| Campers | `campersService.ts` | `campersStore.ts` | Manage campers |
| Staff Members | `staffMembersService.ts` | `staffMembersStore.ts` | Manage staff |
| Events | `eventsService.ts` | `eventsStore.ts` | Manage events & enrollments |
| Locations | `locationsService.ts` | `locationsStore.ts` | Manage activity locations |
| Housing Rooms | `housingRoomsService.ts` | `housingRoomsStore.ts` | Manage sleeping rooms |
| Groups | `groupsService.ts` | `groupsStore.ts` | Manage camper groups |
| Family Groups | `familyGroupsService.ts` | `familyGroupsStore.ts` | Manage family groups |
| Programs | `programsService.ts` | `programsStore.ts` | Manage programs |
| Activities | `activitiesService.ts` | `activitiesStore.ts` | Manage activities |
| Areas | `areasService.ts` | `areasStore.ts` | Manage physical areas |
| Certifications | `certificationsService.ts` | `certificationsStore.ts` | Manage certifications |
| Colors | `colorsService.ts` | `colorsStore.ts` | Manage camp colors |
| Sessions | `sessionsService.ts` | `sessionsStore.ts` | Manage camp sessions |
| Labels | `labelsService.ts` | `labelsStore.ts` | Manage labels |

## Data Flow Examples

### Example 1: Adding a Camper

```
User Action (Component)
        ↓
await campersStore.addCamper(camper)
        ↓
await campersService.saveCamper(camper)
        ↓
await storageService.save(STORAGE_KEYS.CAMPERS, camper)
        ↓
localStorage.setItem(...)
        ↓
State Updated: campersStore.campers.push(camper)
        ↓
Component Re-renders (Vue Reactivity)
```

### Example 2: Deleting a Staff Member (with Cleanup)

```
User Action (Component)
        ↓
await staffMembersStore.deleteStaffMember(id)
        ↓
await staffMembersService.deleteStaffMember(id)
        ↓
await storageService.delete(STORAGE_KEYS.STAFF_MEMBERS, id)
        ↓
Business Logic: Remove from all events
        ↓
await storageService.save(STORAGE_KEYS.EVENTS, updatedEvents)
        ↓
State Updated: staffMembersStore.staffMembers = filtered
eventsStore.events = updated
        ↓
Conflict Detection: mainStore.updateConflicts()
        ↓
Components Re-render
```

### Example 3: Group Enrollment (Cross-Store Operation)

```
User Action (Component)
        ↓
await groupsStore.enrollCamperGroup(eventId, groupId)
        ↓
Get campers in group (uses campersStore)
        ↓
For each camper:
  Check conflicts (uses eventsStore)
  await eventsService.enrollCamper(eventId, camperId)
        ↓
Update eventsStore state
        ↓
mainStore.updateConflicts()
        ↓
Return enrollment summary
        ↓
Components Re-render
```

## Communication Patterns

### Store-to-Store Communication

Stores can reference each other for cross-entity operations:

```typescript
// In groupsStore.ts
import { useCampersStore } from './campersStore';

getCampersInGroup(groupId: string): Camper[] {
  const campersStore = useCampersStore();
  return campersStore.campers.filter(...);
}
```

### Service-to-Service Communication

Services call other services through the storage layer:

```typescript
// In campersService.ts
async deleteCamper(id: string) {
  await storageService.delete(STORAGE_KEYS.CAMPERS, id);
  
  // Access events through storage
  const events = await storageService.getAll(STORAGE_KEYS.EVENTS);
  // ... process events
}
```

### Main Store Coordination

The `mainStore` coordinates all entity stores:

```typescript
async loadAll() {
  await Promise.all([
    campersStore.loadCampers(),
    staffMembersStore.loadStaffMembers(),
    eventsStore.loadEvents(),
    // ... all 14 stores
  ]);
  
  this.updateConflicts();
}
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Each layer has a single responsibility
- Clear boundaries between layers
- Easy to understand and navigate

### 2. **Maintainability**
- Changes to one entity don't affect others
- Easy to locate relevant code
- Reduced merge conflicts

### 3. **Testability**
- Test each layer independently
- Mock dependencies easily
- Isolated unit tests

### 4. **Scalability**
- Add new entities with a clear pattern
- Scale horizontally by adding services/stores
- Ready for distributed architecture

### 5. **Performance**
- Granular reactivity in stores
- Components only subscribe to needed data
- Efficient re-renders

### 6. **Type Safety**
- Full TypeScript support
- Type-safe across all layers
- Compile-time error detection

### 7. **Future-Ready**
- Easy to swap localStorage with API
- Ready for microservices deployment
- Can add caching, logging, etc.

## File Structure

```
src/
├── services/                    # Business Logic Layer
│   ├── storage.ts              # Generic storage infrastructure
│   ├── storageKeys.ts          # Storage key constants
│   ├── conflicts.ts            # Conflict detection service
│   │
│   ├── campersService.ts       # Entity services (14 total)
│   ├── staffMembersService.ts
│   ├── eventsService.ts
│   ├── locationsService.ts
│   ├── housingRoomsService.ts
│   ├── groupsService.ts
│   ├── familyGroupsService.ts
│   ├── programsService.ts
│   ├── activitiesService.ts
│   ├── areasService.ts
│   ├── certificationsService.ts
│   ├── colorsService.ts
│   ├── sessionsService.ts
│   ├── labelsService.ts
│   │
│   └── index.ts                # Central export
│
├── stores/                      # State Management Layer
│   ├── mainStore.ts            # Coordinator store
│   ├── campStore.ts            # Facade (backward compatibility)
│   ├── campStoreLegacy.ts      # Backup
│   │
│   ├── campersStore.ts         # Entity stores (14 total)
│   ├── staffMembersStore.ts
│   ├── eventsStore.ts
│   ├── locationsStore.ts
│   ├── housingRoomsStore.ts
│   ├── groupsStore.ts
│   ├── familyGroupsStore.ts
│   ├── programsStore.ts
│   ├── activitiesStore.ts
│   ├── areasStore.ts
│   ├── certificationsStore.ts
│   ├── colorsStore.ts
│   ├── sessionsStore.ts
│   ├── labelsStore.ts
│   │
│   ├── toastStore.ts           # Utility store
│   └── index.ts                # Central export
│
├── components/                  # UI Layer
│   ├── cards/
│   ├── modals/
│   └── ...
│
└── views/                       # Page Layer
    ├── Campers.vue
    ├── StaffMembers.vue
    ├── Calendar.vue
    └── ...
```

## Usage Guidelines

### For New Features

1. **Create/Update Service** - Add business logic
2. **Create/Update Store** - Add state management
3. **Use in Components** - Import and use store

```typescript
// 1. Service (if needed)
class NewEntityService {
  async getEntities() { ... }
}

// 2. Store
export const useNewEntityStore = defineStore('newEntity', {
  state: () => ({ entities: [] }),
  actions: {
    async loadEntities() {
      this.entities = await newEntityService.getEntities();
    }
  }
});

// 3. Component
<script setup lang="ts">
import { useNewEntityStore } from '@/stores';
const store = useNewEntityStore();
</script>
```

### For Existing Code

Use the backward-compatible facade:

```typescript
import { useCampStore } from '@/stores/campStore';
const store = useCampStore();
// All existing code works unchanged!
```

Gradually migrate to individual stores:

```typescript
// Migrate from:
import { useCampStore } from '@/stores/campStore';
const store = useCampStore();
const campers = store.campers;

// To:
import { useCampersStore } from '@/stores';
const campersStore = useCampersStore();
const campers = campersStore.campers;
```

## Best Practices

### 1. **One Responsibility Per Layer**
- Services: Business logic only
- Stores: State management only
- Storage: Data persistence only

### 2. **Use Services from Stores**
```typescript
// ✅ Good
async addCamper(camper: Camper) {
  await campersService.saveCamper(camper);
  this.campers.push(camper);
}

// ❌ Bad (bypassing service layer)
async addCamper(camper: Camper) {
  await storageService.save(STORAGE_KEYS.CAMPERS, camper);
  this.campers.push(camper);
}
```

### 3. **Keep Stores Reactive**
```typescript
// ✅ Good - mutate state directly
this.campers.push(camper);

// ❌ Bad - replace entire array
this.campers = [...this.campers, camper];
```

### 4. **Update Conflicts After Mutations**
```typescript
await campersStore.addCamper(camper);
mainStore.updateConflicts(); // Important!
```

### 5. **Use Central Exports**
```typescript
// ✅ Good
import { useCampersStore, useEventsStore } from '@/stores';

// ❌ Bad
import { useCampersStore } from '@/stores/campersStore';
import { useEventsStore } from '@/stores/eventsStore';
```

## Migration to API

When ready to replace localStorage with API:

### 1. Update Storage Service Only
```typescript
class StorageService {
  async getAll<T>(storageKey: string): Promise<T[]> {
    // OLD: localStorage
    // return JSON.parse(localStorage.getItem(storageKey));
    
    // NEW: API
    const response = await fetch(`/api/${storageKey}`);
    return response.json();
  }
}
```

### 2. Services and Stores Remain Unchanged!
The entity services and stores continue to work without modification because they use the storage service interface.

### 3. Add API-Specific Features
```typescript
class StorageService {
  // Add authentication
  // Add retry logic
  // Add caching
  // Add error handling
  // etc.
}
```

## Performance Optimization

### Lazy Loading
```typescript
// Load stores on demand
const route = useRoute();
if (route.name === 'campers') {
  const campersStore = useCampersStore();
  await campersStore.loadCampers();
}
```

### Selective Updates
```typescript
// Update only what changed
async updateCamper(camper: Camper) {
  await campersService.saveCamper(camper);
  const index = this.campers.findIndex(c => c.id === camper.id);
  if (index >= 0) {
    this.campers[index] = camper; // Minimal reactivity trigger
  }
}
```

### Batch Operations
```typescript
// Use batch operations when available
await eventsStore.addEventsBatch(recurringEvents); // Faster than loop
```

## Documentation

- **[MICROSERVICES_REFACTORING.md](./MICROSERVICES_REFACTORING.md)** - Services layer refactoring
- **[STORES_REFACTORING.md](./STORES_REFACTORING.md)** - Stores layer refactoring
- **This document** - Complete architecture overview

## Summary

The camp-manager application now features a **complete microservices architecture**:

- ✅ 14 modular entity services
- ✅ 14 modular entity stores
- ✅ Generic storage infrastructure
- ✅ Main coordinating store
- ✅ Backward-compatible facade
- ✅ Clear layer separation
- ✅ Excellent maintainability
- ✅ High testability
- ✅ Ready for scale
- ✅ No breaking changes

This architecture provides a solid foundation for:
- Easy feature additions
- Team collaboration
- Testing and quality assurance
- Performance optimization
- Future API migration
- Microservices deployment

The codebase is now **production-ready, scalable, and maintainable**! 🚀

