# Conflict Navigation Feature

## Overview
Added the ability to click on scheduling conflicts in the Dashboard to automatically navigate to the Calendar view with the specific event selected, making it easy for users to fix conflicts.

## Changes Made

### 1. Dashboard.vue (`src/views/Dashboard.vue`)

#### Template Changes
- Made conflict items clickable by adding `@click="goToConflictEvent(conflict)"` event handler
- Added visual indicator "View Event →" to show the item is clickable
- Added hover states and cursor pointer for better UX

#### Script Changes
- Added `Conflict` type import from `@/types/api`
- Added `goToConflictEvent(conflict: Conflict)` method that:
  - Determines the appropriate event ID based on conflict type:
    - For `event_overcapacity` and `missing_certification`: uses `entityId` (the event ID)
    - For other conflicts (`camper_double_booked`, `staff_double_booked`, `room_overcapacity`): uses first `conflictingIds` element
  - Retrieves the event to verify it exists
  - Navigates to `/calendar` with `eventId` as a query parameter

#### Style Changes
- Added `cursor: pointer` to `.conflict-item`
- Added hover effects with background color change, border, and shadow
- Added `.conflict-action` styles for the "View Event →" text with opacity transitions
- Made `.conflict-message` flex to take available space

### 2. Calendar.vue (`src/views/Calendar.vue`)

#### Added Lifecycle Hook
- Added `mounted()` hook to call `handleEventIdFromQuery()` on component mount

#### Added Watcher
- Added `$route.query.eventId` watcher to handle navigation when query parameters change
- Allows multiple conflict clicks to work correctly without page refresh

#### Added Method
- Added `handleEventIdFromQuery()` method that:
  - Reads `eventId` from query parameters
  - Finds the event in the store
  - Sets `selectedDate` to the event's start date
  - Sets `selectedEventId` to open the EventDetailModal
  - Clears the query parameter using `router.replace()` to prevent reopening on refresh

## User Experience Flow

1. User views Dashboard and sees scheduling conflicts
2. User clicks on a conflict item
3. Application navigates to Calendar view
4. Calendar automatically:
   - Sets the date to match the event's date
   - Opens the Event Detail Modal for the conflicting event
5. User can now view the event details and make changes to resolve the conflict

## Conflict Types Handled

The feature intelligently handles all conflict types:

1. **Event Overcapacity** - Navigates to the overcapacity event
2. **Missing Certification** - Navigates to the event missing certifications
3. **Camper Double Booked** - Navigates to the first conflicting event
4. **Staff Double Booked** - Navigates to the first conflicting event
5. **Room Overcapacity** - Navigates to the first conflicting event in the room

## Technical Details

### Query Parameter Flow
```
Dashboard → Calendar
  query: { eventId: 'event-123' }
  ↓
Calendar.mounted() → handleEventIdFromQuery()
  ↓
Sets selectedDate and selectedEventId
  ↓
EventDetailModal opens
  ↓
router.replace({ query: {} }) clears parameter
```

### Conflict Type Logic
```typescript
if (conflict.type === 'event_overcapacity' || conflict.type === 'missing_certification') {
  // Event-specific conflicts: entityId is the event
  eventId = conflict.entityId;
} else if (conflict.conflictingIds && conflict.conflictingIds.length > 0) {
  // Other conflicts: use first conflicting event
  eventId = conflict.conflictingIds[0];
}
```

## Benefits

1. **Improved UX** - One-click navigation from conflict to event
2. **Faster Resolution** - Reduces time to find and fix conflicts
3. **Better Discoverability** - Visual indicators make the feature obvious
4. **Consistent Navigation** - Uses existing event detail modal
5. **Clean URLs** - Query parameter is cleared after use

## Future Enhancements

Potential improvements:
- Show all conflicting events in a list when multiple events are involved
- Add ability to navigate between multiple conflicting events
- Highlight the specific conflict reason in the event detail modal
- Add conflict resolution suggestions directly in the modal

