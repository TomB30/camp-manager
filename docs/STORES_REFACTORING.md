# Stores Refactoring - Modular Architecture

## Overview
The Pinia store has been refactored from a single monolithic `campStore` into modular, entity-specific stores. This follows the same microservices pattern we applied to the services layer, providing better separation of concerns, improved maintainability, and enhanced testability.

## Architecture

### Before (Monolithic)
```
┌────────────────────────────────────┐
│         campStore                  │
│  • All state (14 entities)         │
│  • All getters                     │
│  • All actions                     │
│  • 800+ lines of code              │
└────────────────────────────────────┘
```

### After (Modular)
```
┌──────────────────────────────────────────────┐
│              mainStore                       │
│  • Coordinates all stores                   │
│  • Handles conflicts                        │
│  • Cross-cutting concerns                   │
└────────────┬─────────────────────────────────┘
             │
    ┌────────┴────────────────────────┐
    │                                  │
┌───▼────┐  ┌──────────┐  ┌──────────▼──┐
│ campers│  │  events  │  │  staff      │
│ Store  │  │  Store   │  │  Members    │
└────────┘  └──────────┘  │  Store      │
                           └─────────────┘
           ... 14 entity stores total
```

## Created Stores

### 1. **Entity Stores** (14 stores)

#### Core Entities
- **`campersStore.ts`** - Manages camper state and operations
- **`staffMembersStore.ts`** - Manages staff member state and operations
- **`eventsStore.ts`** - Manages events and enrollments
- **`locationsStore.ts`** - Manages activity locations
- **`housingRoomsStore.ts`** - Manages sleeping rooms

#### Group Entities
- **`groupsStore.ts`** - Manages camper groups (filter-based)
- **`familyGroupsStore.ts`** - Manages family groups

#### Program Entities
- **`programsStore.ts`** - Manages programs
- **`activitiesStore.ts`** - Manages activities

#### Configuration Entities
- **`areasStore.ts`** - Manages physical areas
- **`certificationsStore.ts`** - Manages certifications
- **`colorsStore.ts`** - Manages camp colors
- **`sessionsStore.ts`** - Manages camp sessions
- **`labelsStore.ts`** - Manages labels

### 2. **Coordinating Store**
- **`mainStore.ts`** - Coordinates all entity stores, handles conflicts, manages loading state

### 3. **Facade Store**
- **`campStore.ts`** - Backward-compatible facade that delegates to new modular stores

### 4. **Supporting Files**
- **`stores/index.ts`** - Central export point for all stores
- **`campStoreLegacy.ts`** - Backup of original monolithic store

## Store Structure Pattern

Each entity store follows a consistent pattern:

```typescript
// Example: campersStore.ts
import { defineStore } from 'pinia';
import type { Camper } from '@/types';
import { campersService } from '@/services';

export const useCampersStore = defineStore('campers', {
  state: () => ({
    campers: [] as Camper[],
    loading: false,
  }),

  getters: {
    getCamperById(state): (id: string) => Camper | undefined {
      return (id: string) => state.campers.find(c => c.id === id);
    },
    // ... other getters
  },

  actions: {
    async loadCampers(): Promise<void> {
      this.loading = true;
      try {
        this.campers = await campersService.getCampers();
      } finally {
        this.loading = false;
      }
    },

    async addCamper(camper: Camper): Promise<void> {
      await campersService.saveCamper(camper);
      this.campers.push(camper);
    },
    // ... other CRUD actions
  }
});
```

## Usage Examples

### Using Individual Entity Stores (Recommended for New Code)

```typescript
<script setup lang="ts">
import { useCampersStore } from '@/stores';

const campersStore = useCampersStore();

// Access state
const campers = campersStore.campers;

// Use getters
const camper = campersStore.getCamperById('camper-001');

// Call actions
await campersStore.addCamper(newCamper);
</script>
```

### Using Multiple Stores

```typescript
<script setup lang="ts">
import { useCampersStore, useEventsStore, useMainStore } from '@/stores';

const campersStore = useCampersStore();
const eventsStore = useEventsStore();
const mainStore = useMainStore();

// Access data from multiple stores
const campers = campersStore.campers;
const events = eventsStore.events;
const conflicts = mainStore.conflicts;

// Perform cross-store operations
await eventsStore.enrollCamper(eventId, camperId);
mainStore.updateConflicts(); // Update conflicts after enrollment
</script>
```

### Using the Facade (Backward Compatibility)

```typescript
<script setup lang="ts">
import { useCampStore } from '@/stores/campStore';

const store = useCampStore();

// Works exactly like the old monolithic store!
const campers = store.campers;
const events = store.events;
await store.addCamper(newCamper);
</script>
```

## Main Store Coordination

The `mainStore` handles cross-cutting concerns:

```typescript
import { useMainStore } from '@/stores';

const mainStore = useMainStore();

// Load all data from all stores
await mainStore.loadAll();

// Get conflicts (automatically detected)
const conflicts = mainStore.conflicts;

// Manually trigger conflict detection
mainStore.updateConflicts();

// Check loading state
const isLoading = mainStore.loading;
```

## Store Communication

Stores can reference each other when needed:

```typescript
// In groupsStore.ts
import { useCampersStore } from './campersStore';

// Inside a getter
getCampersInGroup(): (groupId: string) => Camper[] {
  return (groupId: string) => {
    const campersStore = useCampersStore();
    // Use data from campersStore
    return campersStore.campers.filter(...);
  };
}
```

## Migration Guide

### For New Components
Use individual entity stores directly:

```typescript
// ✅ Recommended
import { useCampersStore, useEventsStore } from '@/stores';

const campersStore = useCampersStore();
const eventsStore = useEventsStore();
```

### For Existing Components
The facade store provides backward compatibility:

```typescript
// ✅ Works without changes
import { useCampStore } from '@/stores/campStore';

const store = useCampStore();
// All existing code continues to work!
```

### Gradual Migration
You can gradually migrate components from the facade to individual stores:

**Before:**
```typescript
import { useCampStore } from '@/stores/campStore';

const store = useCampStore();
const campers = store.campers;
const events = store.events;
```

**After:**
```typescript
import { useCampersStore, useEventsStore } from '@/stores';

const campersStore = useCampersStore();
const eventsStore = useEventsStore();
const campers = campersStore.campers;
const events = eventsStore.events;
```

## Benefits

### 1. **Separation of Concerns**
- Each store focuses on a single entity
- Clear boundaries and responsibilities
- Easier to understand and maintain

### 2. **Better Performance**
- Components only subscribe to stores they need
- Reduced re-renders when unrelated data changes
- More granular reactivity

### 3. **Improved Testability**
- Test stores independently
- Mock individual stores easily
- Isolated unit tests

### 4. **Enhanced Scalability**
- Easy to add new entity stores
- Clear pattern to follow
- No risk of monolithic store growing too large

### 5. **Better Code Organization**
- Each store in its own file
- Easier to find relevant code
- Reduced merge conflicts

### 6. **Backward Compatibility**
- Existing components work unchanged
- Gradual migration possible
- No breaking changes

## File Structure

```
src/
├── stores/
│   ├── index.ts                  # Central export
│   ├── mainStore.ts              # Coordinator
│   ├── campStore.ts              # Facade (backward compatibility)
│   ├── campStoreLegacy.ts        # Backup of original
│   │
│   ├── campersStore.ts           # Entity stores
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
│   └── toastStore.ts             # Utility store
```

## Store API Reference

### Common Pattern (All Entity Stores)

#### State
```typescript
{
  [entities]: EntityType[],  // Array of entities
  loading: boolean            // Loading state
}
```

#### Getters
```typescript
get[Entity]ById: (id: string) => EntityType | undefined
// Plus entity-specific getters
```

#### Actions
```typescript
async load[Entities](): Promise<void>
async add[Entity](entity: EntityType): Promise<void>
async update[Entity](entity: EntityType): Promise<void>
async delete[Entity](id: string): Promise<void>
```

### Main Store API

#### State
```typescript
{
  conflicts: Conflict[],
  loading: boolean
}
```

#### Actions
```typescript
async loadAll(): Promise<void>          // Load all entity stores
updateConflicts(): void                  // Detect and update conflicts
```

## Best Practices

### 1. **Use Individual Stores in New Code**
```typescript
// ✅ Good
import { useCampersStore } from '@/stores';

// ❌ Avoid (use facade only for legacy code)
import { useCampStore } from '@/stores/campStore';
```

### 2. **Call updateConflicts After Mutations**
```typescript
await campersStore.addCamper(camper);
await eventsStore.enrollCamper(eventId, camperId);
mainStore.updateConflicts(); // Update conflicts
```

### 3. **Use mainStore for Initial Load**
```typescript
// In App.vue or root component
const mainStore = useMainStore();
await mainStore.loadAll(); // Loads all entity stores
```

### 4. **Access Cross-Store Data Through Getters**
```typescript
// In a store getter, reference other stores
import { useCampersStore } from './campersStore';

getRelatedData() {
  const campersStore = useCampersStore();
  return campersStore.campers.filter(...);
}
```

## Performance Considerations

### Reactivity Optimization
Components only react to changes in stores they use:

```typescript
// Component A uses only campersStore
import { useCampersStore } from '@/stores';
const campersStore = useCampersStore();
// ✅ Only re-renders when campers change

// Component B uses only eventsStore
import { useEventsStore } from '@/stores';
const eventsStore = useEventsStore();
// ✅ Only re-renders when events change
```

### Lazy Loading
Stores can be loaded on-demand:

```typescript
// Only load when needed
if (needsCamperData) {
  const campersStore = useCampersStore();
  await campersStore.loadCampers();
}
```

## Testing

### Testing Individual Stores

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useCampersStore } from '@/stores/campersStore';

describe('CampersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should add a camper', async () => {
    const store = useCampersStore();
    await store.addCamper(mockCamper);
    expect(store.campers).toHaveLength(1);
  });
});
```

### Mocking Stores

```typescript
// Mock individual stores for component tests
vi.mock('@/stores', () => ({
  useCampersStore: () => ({
    campers: mockCampers,
    getCamperById: vi.fn(),
    addCamper: vi.fn(),
  }),
}));
```

## Future Enhancements

### 1. **Persistence Plugin**
Add automatic localStorage sync for each store

### 2. **Store Composition**
Create composite stores that combine related entities

### 3. **Real-time Sync**
Add WebSocket support for multi-user scenarios

### 4. **Optimistic Updates**
Implement optimistic UI updates with rollback

### 5. **Store Devtools**
Enhanced debugging with store-specific devtools

### 6. **State Snapshots**
Save and restore store state for testing/debugging

## Comparison with Services Layer

Both services and stores follow the same modular pattern:

| Layer | Responsibility | Pattern |
|-------|---------------|---------|
| **Services** | Data fetching, business logic, persistence | Entity-specific services wrapping storage |
| **Stores** | State management, reactivity, cross-store coordination | Entity-specific stores wrapping services |

```
Component → Store → Service → Storage (localStorage/API)
```

This creates a clean, layered architecture where each layer has a clear responsibility.

## Summary

The store refactoring provides:
- ✅ 14 modular, focused entity stores
- ✅ 1 coordinating main store for cross-cutting concerns
- ✅ Backward-compatible facade for existing code
- ✅ Better performance through granular reactivity
- ✅ Improved testability and maintainability
- ✅ Clear migration path for existing components
- ✅ Consistent pattern across all stores
- ✅ No breaking changes to existing code

The modular store architecture aligns perfectly with the microservices pattern in the services layer, creating a cohesive and maintainable codebase! 🎉

