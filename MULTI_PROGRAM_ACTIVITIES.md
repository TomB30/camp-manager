# Multi-Program Activities Feature

## Overview
Activities can now belong to multiple programs, allowing for better flexibility in organizing camp activities. When adding an activity to a program, users can choose to either create a new activity or add an existing activity from another program.

## Changes Made

### 1. Data Model Updates

**`src/types/api.ts`**
- Changed `Activity.programId: string` to `Activity.programIds: string[]`
- Activities now maintain an array of program IDs they belong to

### 2. Store Updates

**`src/stores/campStore.ts`**
- Updated `getActivitiesInProgram()` to check if programId is in the programIds array
- Enhanced `addActivity()` to add activity ID to all associated programs
- Enhanced `updateActivity()` to handle changes in program associations
- Enhanced `deleteActivity()` to remove activity from all associated programs
- Enhanced `deleteProgram()` to handle activities that belong to multiple programs (only deletes activity if it has no remaining programs)
- Added `addActivityToProgram()` method to add an existing activity to a program
- Added `removeActivityFromProgram()` method to remove an activity from a specific program

### 3. Storage Service Updates

**`src/services/storage.ts`**
- Updated `deleteProgram()` to remove the program ID from activities' programIds arrays
- Only deletes activities that have no remaining program associations

### 4. New Component

**`src/components/modals/ActivitySelectorModal.vue`**
- New modal component that presents two options:
  1. **Create New Activity** - Opens the activity form modal to create a new activity
  2. **Add Existing Activity** - Shows a list of activities from other programs that can be added
- Displays existing activities with their current program associations
- Includes search functionality to filter activities
- Shows activity details (duration, description, programs)

### 5. Component Updates

**`src/views/Programs.vue`**
- Changed "+ Add Activity" button to show the new ActivitySelectorModal
- Added `handleCreateNewActivity()` method to open the activity form
- Added `handleAddExistingActivity()` method to add an existing activity to the current program
- Integrated the ActivitySelectorModal component

**`src/components/modals/ActivityFormModal.vue`**
- Updated to accept `programIds` array prop in addition to single `programId`
- Modified `handleSave()` to use programIds array when creating/updating activities
- Maintains backward compatibility with single programId for creating new activities

**`src/components/modals/ActivityDetailModal.vue`**
- Changed "Program" section to "Programs" (plural)
- Now displays all programs the activity belongs to as badges
- Updated styling to show multiple program badges

**`src/components/modals/EventFormModal.vue`**
- Updated to use `activity.programIds[0]` when populating event from activity template
- Uses the first program when activity belongs to multiple programs

### 6. Mock Data Updates

**`src/data/mockData.ts`**
- Updated all mock activities to use `programIds: [...]` instead of `programId: ...`
- Activities initially belong to one program but can be added to others through the UI

## User Experience

### Adding Activities to a Program

1. Navigate to a program's detail view
2. Click "+ Add Activity" button
3. Choose between:
   - **Create New Activity**: Opens the standard activity form
   - **Add Existing Activity**: Shows a searchable list of activities from other programs
4. If adding existing:
   - Search or browse activities
   - Click on an activity to select it
   - Click "Add Selected Activity"
5. Activity is now associated with the current program

### Benefits

- **Reusability**: Activities like "Swimming" can be shared between "Watersports" and "Summer Camp" programs
- **Consistency**: Using the same activity across programs ensures consistent settings (duration, certifications, etc.)
- **Flexibility**: Programs can be organized by theme, age group, or season while sharing common activities
- **Efficiency**: No need to recreate similar activities for different programs

### Activity Detail View

- When viewing an activity's details, all associated programs are displayed as badges
- This makes it easy to see which programs use each activity

### Deleting Programs

- When a program is deleted, activities are only removed from that program
- Activities that belong to other programs remain in the system
- Activities that have no remaining program associations are automatically deleted

## Technical Notes

- The change is backward compatible in the sense that activities now use arrays, but the code handles single-program activities as expected
- All TypeScript types have been updated to reflect the new structure
- The build completes successfully with no errors
- No linter errors were introduced

## Future Enhancements

Potential improvements for future iterations:
1. Bulk add/remove activities from programs
2. Ability to edit an activity's program associations from the activity detail modal
3. Visual indicators when selecting activities that show if they're already in the current program
4. Analytics showing which activities are shared across multiple programs
5. Ability to create a copy of an activity for a new program (if you want similar but not identical activities)

