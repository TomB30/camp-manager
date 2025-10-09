# Developer Guide - Summer Camp Manager

## Quick Reference

### Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run type-check       # TypeScript type checking (coming soon)
npm run lint             # ESLint checking (coming soon)
npm run format           # Prettier formatting (coming soon)

# Types
npm run generate-types   # Generate TS types from OpenAPI (when needed)
```

### Project Structure

```
camp-manager/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Header.vue       # Navigation header
│   │
│   ├── views/               # Page components (routes)
│   │   ├── Dashboard.vue    # Main dashboard
│   │   ├── Calendar.vue     # Event calendar
│   │   ├── Campers.vue     # Children management
│   │   ├── TeamMembers.vue  # Staff management
│   │   └── Rooms.vue        # Room management
│   │
│   ├── stores/              # Pinia state management
│   │   └── campStore.ts     # Main application store
│   │
│   ├── services/            # Business logic
│   │   ├── storage.ts       # Local storage service
│   │   └── conflicts.ts     # Conflict detection
│   │
│   ├── types/               # TypeScript definitions
│   │   └── api.ts           # API types from OpenAPI
│   │
│   ├── utils/               # Utility functions
│   │   └── helpers.ts       # Common helper functions
│   │
│   ├── data/                # Mock data
│   │   └── mockData.ts      # Sample data for demo
│   │
│   ├── router/              # Vue Router
│   │   └── index.ts         # Route definitions
│   │
│   ├── App.vue              # Root component
│   ├── main.ts              # Application entry
│   └── style.css            # Global styles
│
├── openapi.yaml             # API specification
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
└── index.html               # HTML entry point
```

## Architecture Overview

### State Management (Pinia)

The application uses a single Pinia store (`campStore`) that manages:

```typescript
// State
- children: Child[]
- teamMembers: TeamMember[]
- rooms: Room[]
- events: Event[]
- conflicts: Conflict[]
- loading: boolean
- selectedDate: Date

// Actions
- loadAll()              // Load all data from storage
- updateConflicts()      // Recalculate conflicts

// Children
- addChild()
- updateChild()
- deleteChild()

// Team Members
- addTeamMember()
- updateTeamMember()
- deleteTeamMember()

// Rooms
- addRoom()
- updateRoom()
- deleteRoom()

// Events
- addEvent()
- updateEvent()
- deleteEvent()
- enrollChild()
- unenrollChild()
- moveChild()

// Computed
- getChildById()
- getTeamMemberById()
- getRoomById()
- getEventById()
- eventsForDate()
- childEvents()
- staffEvents()
- roomEvents()
```

### Storage Service

Provides async CRUD operations for all entities using localStorage:

```typescript
// Children
await storageService.getCampers()
await storageService.getChild(id)
await storageService.saveChild(child)
await storageService.deleteChild(id)

// Similar patterns for:
// - Team Members
// - Rooms
// - Events

// Special operations
await storageService.enrollChild(eventId, childId)
await storageService.unenrollChild(eventId, childId)
await storageService.seedData(mockData)
await storageService.clearAll()
```

### Conflict Detection

The `ConflictDetector` class provides:

```typescript
// Detect all conflicts
const conflicts = conflictDetector.detectConflicts(
  events, 
  children, 
  teamMembers, 
  rooms
)

// Check if enrollment is valid
const result = conflictDetector.canEnrollChild(
  event, 
  childId, 
  allEvents
)
```

**Conflict Types:**
- `room_overcapacity` - Room capacity exceeded by overlapping events
- `event_overcapacity` - Event has more children than capacity
- `child_double_booked` - Child in overlapping events
- `staff_double_booked` - Staff assigned to overlapping events
- `missing_certification` - Required certifications not held by staff

## Key Patterns

### Component Structure

```vue
<template>
  <!-- Template here -->
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCampStore } from '@/stores/campStore'

// Use composition API
const store = useCampStore()
const state = ref(initialValue)
const computed = computed(() => /* ... */)

// Functions
function handleAction() {
  // Logic here
}
</script>

<style scoped>
/* Scoped styles */
</style>
```

### Type Safety

Always import types from the API schema:

```typescript
import type { Child, Event, Room, TeamMember } from '@/types/api'
```

### Async Operations

All storage operations are async to match future API:

```typescript
async function loadData() {
  loading.value = true
  try {
    await store.loadAll()
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loading.value = false
  }
}
```

### Drag and Drop

Standard HTML5 drag and drop API:

```vue
<template>
  <div
    draggable="true"
    @dragstart="onDragStart($event, item.id)"
    @dragend="onDragEnd"
  >
    Draggable Item
  </div>
  
  <div
    @drop="onDrop($event)"
    @dragover.prevent
    @dragleave="onDragLeave"
  >
    Drop Zone
  </div>
</template>

<script setup lang="ts">
function onDragStart(event: DragEvent, id: string) {
  event.dataTransfer!.effectAllowed = 'move'
  draggedId.value = id
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  // Handle drop
}
</script>
```

## Adding New Features

### Adding a New View

1. Create component in `src/views/`:
```typescript
// src/views/NewView.vue
<template>
  <div class="container">
    <h2>New View</h2>
    <!-- Content -->
  </div>
</template>

<script setup lang="ts">
import { useCampStore } from '@/stores/campStore'
const store = useCampStore()
</script>
```

2. Add route in `src/router/index.ts`:
```typescript
{
  path: '/new-view',
  name: 'newView',
  component: () => import('../views/NewView.vue'),
}
```

3. Add navigation in `src/components/Header.vue`:
```vue
<RouterLink to="/new-view" class="nav-link">
  New View
</RouterLink>
```

### Adding a New Entity Type

1. Define schema in `openapi.yaml`:
```yaml
NewEntity:
  type: object
  required:
    - id
    - name
  properties:
    id:
      type: string
    name:
      type: string
```

2. Add type export in `src/types/api.ts`:
```typescript
export type NewEntity = components["schemas"]["NewEntity"]
```

3. Add storage methods in `src/services/storage.ts`:
```typescript
async getNewEntities(): Promise<NewEntity[]> {
  // Implementation
}
```

4. Add store methods in `src/stores/campStore.ts`:
```typescript
const newEntities = ref<NewEntity[]>([])

async function addNewEntity(entity: NewEntity) {
  await storageService.saveNewEntity(entity)
  newEntities.value.push(entity)
}
```

### Adding a New Conflict Type

1. Add to OpenAPI schema:
```yaml
Conflict:
  properties:
    type:
      enum: [...existing, new_conflict_type]
```

2. Add detection logic in `src/services/conflicts.ts`:
```typescript
// In detectConflicts method
if (/* condition */) {
  conflicts.push({
    type: 'new_conflict_type',
    message: 'Description',
    entityId: id,
  })
}
```

## Styling Guide

### CSS Custom Properties

Use these variables for consistent styling:

```css
/* Colors */
--primary-color: #2196F3
--primary-dark: #1976D2
--primary-light: #BBDEFB
--accent-color: #FF9800
--success-color: #4CAF50
--warning-color: #FFC107
--error-color: #F44336
--background: #F5F7FA
--surface: #FFFFFF
--text-primary: #212121
--text-secondary: #757575
--border-color: #E0E0E0

/* Spacing */
--radius: 8px
--radius-sm: 4px
--radius-lg: 12px

/* Shadows */
--shadow: 0 2px 4px rgba(0,0,0,0.1)
--shadow-lg: 0 4px 12px rgba(0,0,0,0.15)
```

### Utility Classes

```html
<!-- Layout -->
<div class="flex items-center justify-between gap-2">
<div class="grid grid-cols-2">

<!-- Spacing -->
<div class="mt-2 mb-3 p-4">

<!-- Text -->
<span class="text-sm text-secondary font-medium">

<!-- Buttons -->
<button class="btn btn-primary">
<button class="btn btn-secondary btn-sm">

<!-- Cards -->
<div class="card">
  <div class="card-header">Title</div>
  Body content
</div>

<!-- Badges -->
<span class="badge badge-primary">
<span class="badge badge-success">
<span class="badge badge-error">
```

## Testing Strategy

### Unit Tests (TODO)

```typescript
// Example with Vitest
import { describe, it, expect } from 'vitest'
import { conflictDetector } from '@/services/conflicts'

describe('ConflictDetector', () => {
  it('should detect child double-booking', () => {
    const result = conflictDetector.detectConflicts(
      mockEvents,
      mockChildren,
      mockTeamMembers,
      mockRooms
    )
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('child_double_booked')
  })
})
```

### Component Tests (TODO)

```typescript
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import Dashboard from '@/views/Dashboard.vue'

it('renders dashboard with stats', () => {
  const wrapper = mount(Dashboard, {
    global: {
      plugins: [createPinia()],
    },
  })
  expect(wrapper.find('.stat-card').exists()).toBe(true)
})
```

## Performance Tips

### Use Computed Properties

```typescript
// ✅ Good - cached
const filteredChildren = computed(() => {
  return children.value.filter(c => c.age >= minAge.value)
})

// ❌ Bad - recalculates on every render
function getFilteredChildren() {
  return children.value.filter(c => c.age >= minAge.value)
}
```

### Debounce Search Inputs

```typescript
import { debounce } from '@/utils/helpers'

const search = debounce((query: string) => {
  // Perform search
}, 300)
```

### Lazy Load Routes

Already implemented in router:
```typescript
component: () => import('../views/Calendar.vue')
```

## Common Issues

### Store Not Updating UI

Make sure you're modifying the reactive state:

```typescript
// ✅ Good
store.children.push(newChild)

// ❌ Bad - won't trigger reactivity
store.children = [...store.children, newChild]
```

### Type Errors with Events

Use proper typing for events:

```typescript
function onDragStart(event: DragEvent) {
  event.dataTransfer!.effectAllowed = 'move'
}

function onSubmit(event: Event) {
  event.preventDefault()
}
```

### Local Storage Not Persisting

Check browser settings:
- Cookies/storage not blocked
- Private/incognito mode issues
- Storage quota not exceeded

## Debugging

### Vue DevTools

Install the Vue DevTools browser extension for:
- Component inspection
- State management (Pinia)
- Event tracking
- Performance profiling

### Console Logging

Use structured logging:

```typescript
console.log('Loading data:', { date, filters })
console.error('Failed to save:', error)
console.warn('Potential conflict:', event)
```

### Check Local Storage

Open DevTools → Application → Local Storage:
- `camp_campers`
- `camp_team_members`
- `camp_rooms`
- `camp_events`

## Deployment

### Production Build

```bash
npm run build
```

Output is in `dist/` directory.

### Environment Variables

For production, set:
```env
VITE_API_BASE_URL=https://api.yourcamp.com
```

### Hosting Options

**Static Hosting:**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**With Backend:**
- DigitalOcean
- AWS (EC2, ECS, Lambda)
- Heroku
- Railway

## Next Steps

1. **Add Tests**: Set up Vitest and write unit tests
2. **Backend API**: Implement according to OpenAPI spec
3. **Authentication**: Add user login system
4. **Real Database**: Replace localStorage with PostgreSQL
5. **Deployment**: Set up CI/CD pipeline

## Resources

- [Vue 3 Docs](https://vuejs.org/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Vite Docs](https://vitejs.dev/)
- [OpenAPI Spec](https://swagger.io/specification/)

---

**Questions?** Open an issue or check the [README](README.md) and [USAGE_GUIDE](USAGE_GUIDE.md).

