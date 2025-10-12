# Family Group Form Fix

## Issue
When creating or editing a family group, some fields (staff members, sleeping room, color, and campers) weren't being saved properly.

## Root Cause
The `FamilyGroupFormModal` component maintained its own copy of form data in `localFormData`, but the slot contents in `FamilyGroups.vue` were binding directly to the parent component's `formData` instead of the modal's `localFormData`. 

This meant:
- When the user changed staff members, sleeping room, color, or campers in the form
- These changes updated the parent's `formData`
- But when the form was saved, the modal emitted its own `localFormData` which didn't contain these changes
- Result: Only name, description, start date, and end date were saved correctly

## Solution
The fix involved exposing the modal's `localFormData` through scoped slots:

### 1. Updated `FamilyGroupFormModal.vue`
Modified all slots to pass the `localFormData` as a scoped slot prop:
```vue
<slot name="campers-selection" :formData="localFormData"></slot>
<slot name="staff-selection" :formData="localFormData"></slot>
<slot name="room-info" :formData="localFormData"></slot>
<slot name="room-select" :formData="localFormData"></slot>
<slot name="capacity-warning" :formData="localFormData"></slot>
<slot name="color-picker" :formData="localFormData"></slot>
```

### 2. Updated `FamilyGroups.vue`
- Modified all slot templates to receive and use the `modalFormData` from the scoped slots
- Created new methods that work with the modal's form data:
  - `addCamperToModal()` - adds camper to the modal's form data
  - `removeCamperFromModal()` - removes camper from the modal's form data
  - `getAvailableCampersOptions()` - gets available campers based on modal's form data
  - `getTotalPeople()` - calculates total people from modal's form data
  - `getSleepingRoomOptions()` - gets room options with availability based on modal's form data
  - `canFitInRoomById()` - checks if room can fit people from modal's form data
  - `getSelectedRoomById()` - gets room by ID

## Testing
After the fix:
1. All form fields now correctly bind to the modal's `localFormData`
2. When creating a new family group, all fields (name, description, dates, staff, campers, room, color) are saved
3. When editing an existing family group, all changes are properly persisted
4. The build completes successfully with no errors

## Files Changed
- `/src/components/modals/FamilyGroupFormModal.vue`
- `/src/views/FamilyGroups.vue`

