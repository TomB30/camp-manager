# Group-Based Event Assignment - Complete Refactoring

## ✅ Completed Tasks

### 1. OpenAPI Schema Updates
- **File**: `/api/schemas/Event.yaml`
- **Changes**:
  - Removed `assignedStaffIds` array
  - Removed `enrolledCamperIds` array
  - Added `groupIds` array for group assignments
  - Added `excludeStaffIds` array for individual staff exclusions
  - Added `excludeCamperIds` array for individual camper exclusions

### 2. TypeScript Type Generation
- **Files**: `/src/types/api.ts`
- **Process**:
  1. Bundled OpenAPI spec: `npm run api:bundle`
  2. Generated types: `npx openapi-typescript api/openapi-bundled.yaml -o src/types/api.ts`
- **Result**: Event interface now includes new properties

### 3. Store Updates

#### eventsStore.ts
- **New Getters**:
  - `getEventCamperIds(eventId)`: Computes camper IDs from assigned groups minus exclusions
  - `getEventStaffIds(eventId)`: Computes staff IDs from assigned groups minus exclusions
  
- **New Actions**:
  - `addGroupToEvent(eventId, groupId)`
  - `removeGroupFromEvent(eventId, groupId)`
  - `excludeCamper(eventId, camperId)`
  - `removeExcludedCamper(eventId, camperId)`
  - `excludeStaff(eventId, staffId)`
  - `removeExcludedStaff(eventId, staffId)`

- **Removed Actions**:
  - `enrollCamper`
  - `unenrollCamper`
  - `moveCamper`

#### familyGroupsStore.ts
- **New Getter**: `getCampersInFamilyGroup(familyGroupId)` - Returns campers in a family group

#### groupsStore.ts
- **Removed**: `enrollCamperGroup` action (no longer needed)

### 4. Service Updates

#### eventsService.ts
- **Removed Methods**:
  - `enrollCamper`
  - `unenrollCamper`
  - `getEventsForCamper`
  - `getEventsForStaff`

#### conflicts.ts
- **Updated**: All conflict detection methods now accept computed camper/staff maps
- **Modified Methods**:
  - `detectConflicts` now accepts `eventCamperMap` and `eventStaffMap` parameters
  - `canAssignStaff` now accepts `eventStaffMap` parameter
- **Removed**: `canEnrollCamper` method

### 5. UI Component Updates

#### EventFormModal.vue
- **Template Changes**:
  - Replaced "Assign Staff" and "Assign Camper Groups" with unified "Assign Groups" section
  - Shows both Camper Groups and Family Groups with checkboxes
  - Added "Exclude Individual Campers" section (conditional)
  - Added "Exclude Individual Staff" section (conditional)

- **Script Changes**:
  - Updated `EventFormData` interface
  - Added `campersInAssignedGroups` computed property
  - Added `staffInAssignedGroups` computed property
  - Added helper methods for group colors and counts
  - Updated `handleSave` to use new model

#### EventDetailModal.vue
- **Template Changes**:
  - Replaced enrolled campers list with "Assigned Groups" section
  - Added "Participants" summary with total counts
  - Added "Excluded Campers" section
  - Added "Excluded Staff" section
  - Each section has appropriate action buttons

- **Script Changes**:
  - Updated computed properties to use store getters
  - Added `getGroupName`, `getGroupDetails`, `getGroupColor` methods
  - Added `removeGroup` and `removeExclusion` methods

#### Calendar.vue
- **Changes**:
  - Updated `eventFormData` to use new model
  - Modified `filteredEvents` to use `getEventCamperIds` and `getEventStaffIds`
  - Updated all event creation/editing methods
  - Removed camper unenrollment functionality

#### EventsByDate.vue
- **Changes**:
  - Added `eventsStore` setup
  - Updated enrollment display to use `getEnrolledCount` method
  - Added `getEnrolledCount` method using store getter

#### DailyCalendarView.vue
- **Changes**:
  - Added `eventsStore` setup
  - Updated capacity display to use `getEnrolledCount` method
  - Added `getEnrolledCount` method using store getter

#### WeeklyCalendarView.vue
- **Changes**:
  - Added `eventsStore` setup
  - Updated capacity display to use `getEnrolledCount` method
  - Added `getEnrolledCount` method using store getter

### 6. Mock Data Updates

#### mockData.ts
- **Major Changes**:
  - Updated `createEvent` function signature to use `groupIds` instead of `staffIds` and `camperIds`
  - Created `getGroups` helper function for intelligent group assignment
  - Removed `getCampers` helper function
  - Updated all event generation to use group-based assignments

- **Group Assignment Logic**:
  - Small events (≤2 groups): Use camper groups
  - Medium events (≤5 groups): Use family groups
  - Large events (>5 groups): Mix of camper and family groups

- **Example Assignments**:
  - Morning Assembly: 8 groups (all-camp event)
  - Pottery: Junior Campers group
  - Soccer: Middle Age group + family group
  - Baking: Allergy-Aware Group with exclusions (demonstrates feature)

## 📊 Benefits

### 1. Simplified Management
- Assign entire groups to events instead of individual campers/staff
- Reduces administrative overhead
- More intuitive workflow for camp managers

### 2. Dynamic Updates
- When group membership changes, events automatically reflect the changes
- No need to manually update each event

### 3. Flexible Exclusions
- Can still exclude specific individuals from assigned groups
- Handles edge cases while maintaining group-based structure

### 4. Better Data Model
- Cleaner event objects (smaller arrays)
- More maintainable codebase
- Reflects real-world camp operations

### 5. Automatic Staff Assignment
- Staff assignment through family groups
- Staff travel with their assigned campers
- Reduces scheduling conflicts

## 🎯 How It Works

### Event Participant Calculation

```typescript
function getEventCampers(event: Event): Camper[] {
  let campers = [];
  
  // 1. Get all campers from assigned groups
  for (const groupId of event.groupIds) {
    campers.push(...getCampersFromGroup(groupId));
  }
  
  // 2. Remove excluded campers
  campers = campers.filter(c => 
    !event.excludeCamperIds?.includes(c.id)
  );
  
  return campers;
}
```

### Example Workflow

1. **Create Event**: "Swimming Lessons"
2. **Assign Groups**: Junior Campers + 2 Family Groups
3. **Auto-Calculated**: 
   - 35 campers (from all 3 groups)
   - 3 staff (from family groups)
4. **Optional Exclusion**: Exclude specific camper with medical restriction
5. **Final Enrollment**: 34 campers, 3 staff

## 🔄 Migration from Old Model

For existing data with direct assignments:

```typescript
// Old Model
{
  enrolledCamperIds: [id1, id2, id3, ...],
  assignedStaffIds: [staff1, staff2]
}

// New Model
{
  groupIds: [group1, group2],
  excludeCamperIds: [],
  excludeStaffIds: []
}
```

## ⚠️ Remaining Tasks

1. Update remaining legacy components (campStoreLegacy.ts, Dashboard.vue, LocationsTab.vue)
2. Add comprehensive tests for new functionality
3. Update user documentation
4. Consider data migration script for production

## 📝 API Updates Needed

If this were a real backend:

1. Update event creation/update endpoints
2. Add group assignment endpoints:
   - `POST /events/{id}/groups`
   - `DELETE /events/{id}/groups/{groupId}`
3. Add exclusion endpoints:
   - `POST /events/{id}/exclude/campers`
   - `POST /events/{id}/exclude/staff`
4. Update event response to compute participants server-side

## 🎉 Success Criteria

- ✅ Schema updated and types generated
- ✅ Store logic refactored
- ✅ Main UI components updated
- ✅ Mock data converted to new model
- ⏳ All TypeScript errors resolved
- ⏳ Application builds successfully
- ⏳ All features working in development

## 📚 Related Documentation

- [Event Group Assignment](./EVENT_GROUP_ASSIGNMENT.md) - Original feature spec
- [Mock Data Refactoring](./MOCK_DATA_GROUP_REFACTORING.md) - Detailed mock data changes
- [Groups Feature](./GROUPS_FEATURE.md) - Groups system overview
- [Family Groups Feature](./FAMILY_GROUPS_FEATURE.md) - Family groups overview

