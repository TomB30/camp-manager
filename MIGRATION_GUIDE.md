# Migration Guide: Flat Structure to Meta/Spec Structure

## Overview

This guide helps you migrate the codebase from the old flat entity structure to the new meta/spec structure introduced by the OpenAPI schema refactoring.

## What Changed

### Before (Flat Structure)
```typescript
const program: Program = {
  id: "uuid",
  name: "Swimming",
  description: "Water activities",
  createdAt: "2024-01-01T10:00:00Z",
  updatedAt: "2024-01-15T14:30:00Z",
  colorId: "color-uuid",
  activityIds: ["activity-1"],
  // ... other fields
};

// Accessing fields
console.log(program.id);
console.log(program.name);
console.log(program.colorId);
```

### After (Meta/Spec Structure)
```typescript
const program: Program = {
  meta: {
    id: "uuid",
    name: "Swimming",
    description: "Water activities",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z"
  },
  spec: {
    colorId: "color-uuid",
    activityIds: ["activity-1"],
    // ... other fields
  }
};

// Accessing fields
console.log(program.meta.id);
console.log(program.meta.name);
console.log(program.spec.colorId);
```

## Field Mapping

### Meta Fields (Common to all entities)
- `entity.id` → `entity.meta.id`
- `entity.name` → `entity.meta.name`
- `entity.description` → `entity.meta.description`
- `entity.createdAt` → `entity.meta.createdAt`
- `entity.updatedAt` → `entity.meta.updatedAt`

### Spec Fields (Entity-specific)
All other fields move to `spec`:
- `program.colorId` → `program.spec.colorId`
- `camper.firstName` → `camper.spec.firstName`
- `event.title` → `event.spec.title`
- `session.startDate` → `session.spec.startDate`

## Helper Functions

Use the provided helper functions in `/src/utils/entityHelpers.ts` and `/src/utils/requestHelpers.ts` to reduce boilerplate.

### Entity Helpers

```typescript
import { 
  getId, 
  getName, 
  getDisplayName,
  getDescription,
  findById,
  sortByName 
} from '@/utils/entityHelpers';

// Get ID from any entity
const id = getId(program);  // program.meta.id

// Get name (handles special cases)
const name = getName(program);  // program.meta.name

// Get display name (works for all entities including Camper/StaffMember/Event)
const displayName = getDisplayName(camper);  // "John Doe"
const eventName = getDisplayName(event);     // event.spec.title

// Find entity by ID
const program = findById(programs, programId);

// Sort entities
const sortedPrograms = sortByName(programs);
```

### Request Helpers

```typescript
import { 
  createRequest,
  createSimpleRequest,
  createProgramRequest,
  createCamperRequest 
} from '@/utils/requestHelpers';

// Create a simple request (Role, Certification, etc.)
const roleRequest = createSimpleRequest('Counselor', 'Camp counselor role');

// Create a Program request
const programRequest = createProgramRequest(
  'Swimming',
  'Water activities',
  {
    colorId: 'color-uuid',
    activityIds: ['activity-1'],
    staffMemberIds: ['staff-1'],
    locationIds: ['location-1']
  }
);

// Create a Camper request
const camperRequest = createCamperRequest({
  firstName: 'John',
  lastName: 'Doe',
  age: 12,
  gender: 'male',
  sessionId: 'session-uuid'
});
```

## Migration Strategy

### Phase 1: Update Mock Data (Priority: HIGH)

Start with `src/data/mockData.ts` as all components depend on it.

**Example: Program**
```typescript
// Before
const mockPrograms: Program[] = [
  {
    id: v4(),
    name: "Swimming",
    description: "Water activities",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    colorId: colors[0].id,
    activityIds: [],
    staffMemberIds: [],
    locationIds: []
  }
];

// After
const mockPrograms: Program[] = [
  {
    meta: {
      id: v4(),
      name: "Swimming",
      description: "Water activities",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    spec: {
      colorId: colors[0].meta.id,  // Note: also update references
      activityIds: [],
      staffMemberIds: [],
      locationIds: []
    }
  }
];
```

**Important:** When creating mock data, be careful with references. If you reference another entity's ID, use `entity.meta.id`.

### Phase 2: Update Stores (Priority: HIGH)

Stores manage state and are used throughout the app.

**Common Patterns:**

```typescript
// Finding by ID
// Before
const program = programs.value.find(p => p.id === id);

// After
const program = programs.value.find(p => p.meta.id === id);
// Or use helper
import { findById } from '@/utils/entityHelpers';
const program = findById(programs.value, id);

// Filtering
// Before
return programs.value.filter(p => ids.includes(p.id));

// After
return programs.value.filter(p => ids.includes(p.meta.id));

// Sorting
// Before
return [...programs.value].sort((a, b) => a.name.localeCompare(b.name));

// After
return [...programs.value].sort((a, b) => 
  (a.meta.name || '').localeCompare(b.meta.name || '')
);
// Or use helper
import { sortByName } from '@/utils/entityHelpers';
return sortByName(programs.value);
```

### Phase 3: Update Services (Priority: MEDIUM)

Services handle API calls and data transformation.

**Request Building:**
```typescript
// Before
const createProgram = (data: any) => {
  return fetch('/api/programs', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// After
import { createProgramRequest } from '@/utils/requestHelpers';

const createProgram = (name: string, description: string, spec: any) => {
  const request = createProgramRequest(name, description, spec);
  return fetch('/api/programs', {
    method: 'POST',
    body: JSON.stringify(request)
  });
};
```

### Phase 4: Update Components (Priority: MEDIUM)

Components display and interact with entities.

**Display Patterns:**
```vue
<!-- Before -->
<template>
  <div>
    <h3>{{ program.name }}</h3>
    <p>{{ program.description }}</p>
    <span>ID: {{ program.id }}</span>
  </div>
</template>

<!-- After -->
<template>
  <div>
    <h3>{{ program.meta.name }}</h3>
    <p>{{ program.meta.description }}</p>
    <span>ID: {{ program.meta.id }}</span>
  </div>
</template>

<!-- Or with helper in script -->
<script setup lang="ts">
import { getDisplayName, getId } from '@/utils/entityHelpers';

// In computed or method
const displayName = computed(() => getDisplayName(props.program));
const entityId = computed(() => getId(props.program));
</script>
```

**Special Cases:**

```vue
<!-- Camper/StaffMember (firstName/lastName) -->
<!-- Before -->
<span>{{ camper.firstName }} {{ camper.lastName }}</span>

<!-- After -->
<span>{{ camper.spec.firstName }} {{ camper.spec.lastName }}</span>
<!-- Or use helper -->
<span>{{ getDisplayName(camper) }}</span>

<!-- Event (title instead of name) -->
<!-- Before -->
<span>{{ event.title }}</span>

<!-- After -->
<span>{{ event.spec.title }}</span>
<!-- Or use helper -->
<span>{{ getDisplayName(event) }}</span>
```

### Phase 5: Update Utilities (Priority: LOW)

Update utility functions that work with entities.

**Example: colorUtils.ts**
```typescript
// Before
export function getColorFromEntity(entity: { colorId?: string }): Color | undefined {
  if (!entity.colorId) return undefined;
  return colors.value.find(c => c.id === entity.colorId);
}

// After
export function getColorFromEntity(entity: { spec: { colorId?: string } }): Color | undefined {
  if (!entity.spec.colorId) return undefined;
  return colors.value.find(c => c.meta.id === entity.spec.colorId);
}
```

### Phase 6: Update Tests (Priority: LOW)

Update test files to use the new structure.

**Factory Functions:**
```typescript
// Create a test entity factory
function createTestProgram(overrides = {}): Program {
  return {
    meta: {
      id: 'test-id',
      name: 'Test Program',
      description: 'Test description',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    spec: {
      colorId: 'color-id',
      activityIds: [],
      staffMemberIds: [],
      locationIds: [],
    },
    ...overrides
  };
}
```

## Common Patterns Reference

### Pattern 1: Accessing Fields
```typescript
// ❌ Old way
const id = entity.id;
const name = entity.name;

// ✅ New way
const id = entity.meta.id;
const name = entity.meta.name;

// ✅ With helper
import { getId, getName } from '@/utils/entityHelpers';
const id = getId(entity);
const name = getName(entity);
```

### Pattern 2: Finding by ID
```typescript
// ❌ Old way
const found = items.find(item => item.id === id);

// ✅ New way
const found = items.find(item => item.meta.id === id);

// ✅ With helper
import { findById } from '@/utils/entityHelpers';
const found = findById(items, id);
```

### Pattern 3: Mapping to IDs
```typescript
// ❌ Old way
const ids = entities.map(e => e.id);

// ✅ New way
const ids = entities.map(e => e.meta.id);

// ✅ With helper
import { getIds } from '@/utils/entityHelpers';
const ids = getIds(entities);
```

### Pattern 4: Filtering by IDs
```typescript
// ❌ Old way
const filtered = entities.filter(e => ids.includes(e.id));

// ✅ New way
const filtered = entities.filter(e => ids.includes(e.meta.id));

// ✅ With helper
import { filterByIds } from '@/utils/entityHelpers';
const filtered = filterByIds(entities, ids);
```

### Pattern 5: Sorting by Name
```typescript
// ❌ Old way
const sorted = [...entities].sort((a, b) => a.name.localeCompare(b.name));

// ✅ New way
const sorted = [...entities].sort((a, b) => 
  (a.meta.name || '').localeCompare(b.meta.name || '')
);

// ✅ With helper
import { sortByName } from '@/utils/entityHelpers';
const sorted = sortByName(entities);
```

### Pattern 6: Creating New Entities
```typescript
// ❌ Old way
const newProgram = {
  id: v4(),
  name: 'New Program',
  description: 'Description',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  colorId: 'color-id',
  activityIds: []
};

// ✅ New way
const newProgram = {
  meta: {
    id: v4(),
    name: 'New Program',
    description: 'Description',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  spec: {
    colorId: 'color-id',
    activityIds: []
  }
};

// ✅ With helper
import { createEntity } from '@/utils/entityHelpers';
const newProgram = createEntity(
  v4(),
  'New Program',
  'Description',
  { colorId: 'color-id', activityIds: [] }
);
```

### Pattern 7: Display Names for All Entity Types
```typescript
import { getDisplayName } from '@/utils/entityHelpers';

// Works for all entity types
const programName = getDisplayName(program);        // Returns meta.name
const camperName = getDisplayName(camper);         // Returns "firstName lastName"
const staffName = getDisplayName(staffMember);     // Returns "firstName lastName"
const eventName = getDisplayName(event);           // Returns spec.title
```

## Troubleshooting

### Type Errors

**Error:** `Property 'id' does not exist on type 'Program'`
**Solution:** Use `entity.meta.id` instead of `entity.id`

**Error:** `Property 'colorId' does not exist on type 'Program'`
**Solution:** Use `entity.spec.colorId` instead of `entity.colorId`

### Null/Undefined Errors

**Error:** `Cannot read property 'name' of undefined`
**Solution:** Add optional chaining: `entity?.meta?.name`

## Testing the Migration

After each phase, test the affected components:

1. **Visual Testing:** Check that data displays correctly in the UI
2. **Unit Tests:** Run `npm test` to catch breaking changes
3. **Build:** Run `npm run build` to ensure TypeScript compilation passes
4. **E2E Tests:** Run `npm run test:e2e` for integration testing

## Migration Checklist

- [ ] Phase 1: Update mockData.ts
- [ ] Phase 2: Update all stores (19 files)
- [ ] Phase 3: Update all services (20 files)
- [ ] Phase 4: Update all components
  - [ ] Update views (7 files)
  - [ ] Update components (81 files)
- [ ] Phase 5: Update utilities (5 files)
- [ ] Phase 6: Update tests (50 files)
- [ ] Verify build passes: `npm run build`
- [ ] Verify tests pass: `npm test`
- [ ] Visual regression testing in browser

## Need Help?

- Check the helper functions in `/src/utils/entityHelpers.ts`
- Check the request helpers in `/src/utils/requestHelpers.ts`
- Reference the examples in this guide
- Look at the OpenAPI schemas in `/api/schemas/` for the correct structure

