# Sleeping Rooms Update: Family Groups Only

## Overview

The sleeping rooms have been updated to support **family group assignments only**. Temporary camper group assignments with date ranges have been removed to simplify the room assignment model.

## Changes Made

### 1. Type Definitions (`src/types/api.ts`)

**Removed:**
- `assignedGroups?: Array<{ groupId: string; startDate: string; endDate: string; }>` from `SleepingRoom`

**New Structure:**
```typescript
SleepingRoom {
  id: string;
  name: string;
  beds: number;
  location?: string;
}
```

### 2. Sleeping Rooms View (`src/views/SleepingRooms.vue`)

**Removed:**
- Camper group assignment section in the room detail modal
- "Assign Temporary Group" form
- Date range inputs for group assignments
- `assignGroupData` state property
- `assignGroup()` method
- `removeGroupAssignment()` method
- `getGroupName()` method
- `availableGroups` computed property

**Updated:**
- Grid view now shows family groups only
- Table view "Assigned Groups" column renamed to "Family Groups"
- Room detail modal shows only family groups with camper and staff counts
- Delete confirmation message updated to reflect family groups

**Kept:**
- Family groups display and navigation
- "View Details" button to navigate to family group page
- All family group functionality

### 3. Mock Data (`src/data/mockData.ts`)

**Removed:**
- `assignedGroups: []` from all `mockSleepingRooms` entries

### 4. Documentation Updates

**FAMILY_GROUPS_FEATURE.md:**
- Updated to clarify that sleeping rooms only support family group assignments
- Removed mentions of temporary group assignments

**README.md:**
- Updated sleeping room description to remove temporary assignments
- Clarified that assignments are permanent through family groups

## Room Assignment Model

### Before
```
SleepingRoom
├─→ FamilyGroups (permanent, through familyGroupId relationship)
└─→ CamperGroups (temporary, with start/end dates via assignedGroups array)
```

### After
```
SleepingRoom
└─→ FamilyGroups (exclusive assignment through familyGroupId relationship)
    └─→ Campers (inherited from family group membership)
```

## Key Points

1. **Simplified Model**: Sleeping rooms are now assigned exclusively through family groups
2. **No Temporary Assignments**: Removed the ability to assign camper groups to sleeping rooms with date ranges
3. **Single Source of Truth**: Room assignments are managed solely through the family group relationship
4. **Cleaner UI**: Removed complex date-based assignment forms from the sleeping rooms view

## User Impact

### What Changed for Users

**Sleeping Rooms View:**
- No longer shows "Assign Temporary Group" section
- Only displays family groups assigned to each room
- Simplified detail modal with fewer options

**Room Assignment:**
- To assign campers to a sleeping room, users must:
  1. Create or edit a family group
  2. Assign the family group to a sleeping room
  3. Add campers to that family group

### What Stayed the Same

- Family group display and functionality
- Room information (name, beds, location)
- Ability to view family group details
- Camper assignment through family groups

## Migration Notes

If upgrading from a previous version that had `assignedGroups`:

1. **Data Cleanup**: The `assignedGroups` field will be automatically ignored in the new schema
2. **No Data Loss**: Family group assignments remain unchanged
3. **Rebuild Required**: Run `npm run build` to apply type changes

## Benefits

1. **Consistency**: Single method for room assignment (family groups)
2. **Simplicity**: Removed complex date-based logic
3. **Clarity**: Clear organizational structure (Camper → FamilyGroup → SleepingRoom)
4. **Maintainability**: Fewer edge cases and simpler code

## Related Features

- **Family Groups** (`/family-groups`): Manage family groups and their room assignments
- **Campers** (`/campers`): Assign campers to family groups (which determines their room)
- **Sleeping Rooms** (`/sleeping-rooms`): View rooms and their family group assignments

## Technical Details

### Removed Interfaces
```typescript
// No longer part of SleepingRoom
assignedGroups?: Array<{
  groupId: string;
  startDate: string;
  endDate: string;
}>;
```

### Updated Methods
- Room deletion now checks for family group assignments instead of `assignedGroups`
- Room save no longer preserves `assignedGroups` field

## Testing

To test the updated functionality:

1. **View a sleeping room**: Should show family groups only
2. **Create a family group**: Assign it to a sleeping room
3. **Add campers**: Assign them to the family group
4. **View the sleeping room again**: Should show the family group with camper count
5. **Delete attempt**: Should warn if family groups are assigned

## Future Considerations

If temporary room assignments are needed in the future, they should be implemented at the **event level** rather than at the sleeping room level, as events already support date-based operations.

## Rollback

To rollback this change:
1. Restore `assignedGroups` to the `SleepingRoom` interface
2. Add back the UI components in `SleepingRooms.vue`
3. Restore the removed methods
4. Update mock data to include `assignedGroups: []`

---

**Version**: 1.0.0  
**Date**: 2025-10-10  
**Status**: ✅ Complete and tested

