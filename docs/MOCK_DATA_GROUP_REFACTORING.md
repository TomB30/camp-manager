# Mock Data Update: Group-Based Event Assignments

## Summary

Updated the mock data generation to use the new group-based event model instead of direct camper/staff assignments.

## Changes Made

### 1. Event Creation Function Updated

**Before:**
```typescript
const createEvent = (
  id: number,
  title: string,
  //... other params
  staffIds: string[],
  camperIds: string[],
  //... other params
): Event
```

**After:**
```typescript
const createEvent = (
  id: number,
  title: string,
  //... other params
  groupIds: string[],
  //... other params
  excludeStaffIds?: string[],
  excludeCamperIds?: string[]
): Event
```

### 2. Helper Function for Group Assignment

Created a new `getGroups()` helper function that intelligently assigns groups to events:

- **Small events (count ≤ 2)**: Uses 1-2 camper groups
- **Medium events (count ≤ 5)**: Uses 2-5 family groups  
- **Large events (count > 5)**: Uses a mix of camper groups and family groups

This creates realistic event assignments that leverage the existing group structure.

### 3. Event Updates

All generated events now use:
- `groupIds` array instead of `enrolledCamperIds` and `assignedStaffIds`
- Optional `excludeCamperIds` and `excludeStaffIds` for demonstrating exclusions

#### Example Assignments

**Morning Assembly** (Large Event):
- Assigns 8 groups (mix of all camper groups + family groups)
- Capacity: 150

**Pottery Class** (Small Event):
- Assigns Junior Campers group (group-001)
- Capacity: 15

**Baking Class** (With Exclusions):
- Assigns Allergy-Aware Group (group-005)
- Excludes 2 specific campers on the first day
- Demonstrates the exclusion feature

### 4. Realistic Group Usage

Events now use meaningful group assignments:

**Camper Groups (5 total)**:
1. **Junior Campers** (Ages 6-9)
2. **Senior Campers** (Ages 13+)
3. **Middle Age Campers** (Ages 10-12)
4. **Girls Power** (Female campers only)
5. **Allergy-Aware Group** (Campers with allergies)

**Family Groups (24 total)**:
- One per housing cabin
- Contains campers + assigned staff members
- Used for events that need both campers and staff

### 5. Benefits of New Model

1. **More Realistic**: Reflects how camps actually schedule activities (by groups, not individuals)
2. **Dynamic**: When group membership changes, events automatically reflect the changes
3. **Flexible**: Can still handle individual exclusions when needed
4. **Cleaner Data**: Reduces array sizes in event objects
5. **Better Performance**: Fewer IDs to store and manage

### 6. Demonstrative Features

The mock data includes examples of:
- Events with single camper groups
- Events with multiple family groups
- Events mixing camper groups and family groups
- Events with individual camper exclusions
- Events with individual staff exclusions
- Large all-camp events
- Age-appropriate group assignments

## Example Event Structure

```typescript
{
  id: 'event-123',
  title: 'Pottery',
  startTime: '2025-10-16T10:00:00Z',
  endTime: '2025-10-16T11:30:00Z',
  locationId: 'room-002',
  capacity: 15,
  type: 'activity',
  groupIds: ['group-001'], // Junior Campers
  excludeCamperIds: undefined,
  excludeStaffIds: undefined,
  color: '#EC4899',
  programId: 'program-002',
  activityId: 'activity-005'
}
```

## Migration Path

For existing applications with old event data:
1. Create appropriate groups from existing data
2. Analyze event enrollment patterns
3. Map enrolled campers to appropriate groups
4. Convert events to use groupIds
5. Handle edge cases with exclusion arrays

## Next Steps

1. ✅ Update API schema (Event.yaml)
2. ✅ Regenerate TypeScript types
3. ✅ Update eventsStore with new getters
4. ✅ Update UI components to use new model
5. ✅ Update mock data generation
6. ⏳ Fix remaining component references
7. ⏳ Update conflict detection
8. ⏳ Test full application flow

