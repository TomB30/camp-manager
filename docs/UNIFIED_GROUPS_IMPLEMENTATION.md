# Unified Groups System Implementation

## Overview

The camp management system has been refactored to use a unified `Group` type that consolidates the previous `CamperGroup` and `FamilyGroup` types, while adding powerful new capabilities.

## Key Features

### 1. Unified Group Model
- **Single Group Type**: One `Group` type replaces both `CamperGroup` and `FamilyGroup`
- **Optional Housing**: Groups can optionally have a `housingRoomId`
- **Optional Session**: Groups can optionally be tied to a specific `sessionId`
- **Flexible Assignment**: Groups support both automatic (filter-based) and manual member assignment

### 2. Camper Assignment Options

#### Option A: Filter-Based (Auto-Assignment)
Use `camperFilters` to automatically match campers based on criteria:
```typescript
{
  camperFilters: {
    ageMin: 10,
    ageMax: 12,
    gender: 'male',
    hasAllergies: false,
    sessionId: 'session-001',
    familyGroupIds: ['family-group-001', 'family-group-002']
  }
}
```

#### Option B: Manual Selection
Use `camperIds` to explicitly select specific campers:
```typescript
{
  camperIds: ['camper-001', 'camper-002', 'camper-003']
}
```

**Important**: `camperFilters` and `camperIds` are mutually exclusive.

### 3. Staff Assignment Options

#### Option A: Filter-Based (Auto-Assignment)
Use `staffFilters` to automatically match staff based on criteria:
```typescript
{
  staffFilters: {
    roles: ['counselor', 'instructor'],
    certificationIds: ['cert-lifeguard', 'cert-first-aid']
  }
}
```

#### Option B: Manual Selection
Use `staffIds` to explicitly select specific staff:
```typescript
{
  staffIds: ['staff-001', 'staff-002']
}
```

**Important**: `staffFilters` and `staffIds` are mutually exclusive.

### 4. Nested Groups
Create hierarchical group structures using `groupIds`:
```typescript
{
  name: 'All Youth Campers',
  groupIds: ['group-juniors', 'group-middle-age', 'group-seniors']
}
```

When querying a nested group:
- `getCampersInGroup()` recursively collects campers from all child groups
- `getStaffInGroup()` recursively collects staff from all child groups

## API Schema

### Group.yaml
Located at: `api/schemas/Group.yaml`

Key fields:
- `id`: UUID (required)
- `name`: string (required)
- `description`: string (optional)
- `colorId`: UUID (optional)
- `sessionId`: UUID (optional)
- `housingRoomId`: UUID (optional)
- `camperFilters`: object (optional)
- `camperIds`: array of UUIDs (optional)
- `staffFilters`: object (optional)
- `staffIds`: array of UUIDs (optional)
- `groupIds`: array of UUIDs (optional)
- `labelIds`: array of UUIDs (optional)

### StaffFilter.yaml
Located at: `api/schemas/StaffFilter.yaml`

Fields:
- `roles`: array of strings
- `certificationIds`: array of UUIDs
- `minAge`: integer (optional)
- `maxAge`: integer (optional)

## TypeScript Implementation

### Types
- `Group`: Unified group type (`src/types/api.ts`)
- `StaffFilter`: Staff filter criteria type
- Camper filter is embedded in `Group.camperFilters`

### Store
**Location**: `src/stores/groupsStore.ts`

Key methods:
- `loadGroups()`: Load all groups
- `getGroupById(id)`: Get a specific group
- `getCampersInGroup(groupId)`: Get all campers (recursive for nested groups)
- `getStaffInGroup(groupId)`: Get all staff (recursive for nested groups)
- `filterCampers(filters)`: Apply camper filters
- `filterStaff(filters)`: Apply staff filters
- `addGroup(group)`: Create a new group
- `updateGroup(group)`: Update an existing group
- `deleteGroup(id)`: Delete a group
- `validateGroup(group)`: Validate business rules

### Service
**Location**: `src/services/groupsService.ts`

Handles storage operations for unified groups.

## UI Components

### GroupCard
**Location**: `src/components/cards/GroupCard.vue`

Displays group information with:
- Group name and color indicator
- Type badges (Nested, Auto-assigned, Manual, Housing)
- Member counts (campers and staff)
- Session and housing room info
- Filter criteria display
- Label tags

### GroupFormModal
**Location**: `src/components/modals/GroupFormModal.vue`

Comprehensive form for creating/editing groups with:
- Basic info (name, description, color, labels)
- Session and housing room selection
- Group type selection:
  - Nested Group (select child groups)
  - Auto-assign Campers (configure filters)
  - Manual Camper Selection (select specific campers)
  - Empty Group (no campers)
- Staff assignment type:
  - No Staff
  - Auto-assign Staff (configure filters)
  - Manual Staff Selection
- Real-time preview counts for filter-based assignments

### GroupDetailModal
**Location**: `src/components/modals/GroupDetailModal.vue`

Displays full group details including:
- Description and type badges
- Session and housing information
- Labels
- Child groups (for nested groups)
- Filter criteria
- Full campers list with avatars
- Full staff list with avatars
- Creation and update timestamps
- Edit and delete actions

### Groups View
**Location**: `src/views/GroupsNew.vue`

Main interface with:
- View toggle (grid/table)
- Filter bar with search and multiple filters:
  - Type filter (nested, auto-campers, manual-campers, has-housing, has-session)
  - Session filter
  - Label filter
- Grid view with GroupCard components
- Table view with DataTable component
- Empty states for no groups and no results
- Modal integration for details and forms

## Router Configuration

**Location**: `src/router/index.ts`

The `/groups` route now points to `GroupsNew.vue`:
```typescript
{
  path: '/groups',
  name: 'groups',
  component: () => import('../views/GroupsNew.vue'),
}
```

## Storage

**Key**: `camp_groups` (defined in `src/services/storageKeys.ts`)

## Validation Rules

The store's `validateGroup()` method enforces:
1. Cannot use both `camperFilters` and `camperIds`
2. Cannot use both `staffFilters` and `staffIds`
3. Groups with housing should have a session
4. Groups cannot contain themselves (circular reference check)

## Migration from Old System

### Old CamperGroup
```typescript
{
  id: 'group-001',
  name: 'Junior Campers',
  filters: { ageMin: 6, ageMax: 9 },
  familyGroupIds: ['family-001']
}
```

### New Unified Group
```typescript
{
  id: 'group-001',
  name: 'Junior Campers',
  camperFilters: {
    ageMin: 6,
    ageMax: 9,
    familyGroupIds: ['family-001']
  }
}
```

### Old FamilyGroup
```typescript
{
  id: 'family-001',
  name: 'Eagles Family',
  housingRoomId: 'room-001',
  staffMemberIds: ['staff-001'],
  sessionId: 'session-001'
}
```

### New Unified Group
```typescript
{
  id: 'family-001',
  name: 'Eagles Family',
  housingRoomId: 'room-001',
  staffIds: ['staff-001'],
  sessionId: 'session-001',
  camperIds: ['camper-001', 'camper-002'] // Manually selected
}
```

## Example Use Cases

### 1. Traditional Family Group
A physical housing unit with specific campers and staff:
```typescript
{
  name: 'Eagles Cabin',
  sessionId: 'session-1',
  housingRoomId: 'cabin-a',
  camperIds: ['camper-1', 'camper-2', 'camper-3', 'camper-4'],
  staffIds: ['counselor-1', 'counselor-2']
}
```

### 2. Age-Based Activity Group
Auto-assigned campers for an activity:
```typescript
{
  name: 'Junior Swimmers',
  camperFilters: {
    ageMin: 8,
    ageMax: 10
  },
  staffFilters: {
    roles: ['instructor'],
    certificationIds: ['lifeguard-cert']
  }
}
```

### 3. Nested Program Group
Combine multiple age groups:
```typescript
{
  name: 'All Day Camp',
  groupIds: ['junior-swimmers', 'senior-swimmers', 'teen-swimmers']
}
```

### 4. Session-Specific Group
Filter campers from a specific session:
```typescript
{
  name: 'Week 1 Teens',
  sessionId: 'session-1',
  camperFilters: {
    ageMin: 13,
    sessionId: 'session-1'
  }
}
```

### 5. Staff Resource Pool
Group staff by certification:
```typescript
{
  name: 'Certified Lifeguards',
  staffFilters: {
    certificationIds: ['lifeguard-cert']
  }
}
```

## Benefits

1. **Flexibility**: One system handles all grouping needs
2. **Power**: Combine filters, manual selection, and nesting as needed
3. **Efficiency**: Auto-assignment reduces manual work
4. **Hierarchy**: Nested groups enable complex organizational structures
5. **Consistency**: Unified interface across all group types
6. **Type Safety**: Full TypeScript support throughout

## Future Enhancements

Potential additions to consider:
- Group templates for common configurations
- Bulk group operations
- Group duplication/cloning
- Advanced filtering (e.g., by medical needs, experience level)
- Group scheduling and availability
- Parent group references (inverse of groupIds)
- Group permissions and access control
- Export/import group configurations

