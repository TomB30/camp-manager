# Staff Availability Check Feature

## Overview

The camp manager now includes a staff availability checking system that prevents double-booking of staff members and provides real-time visual feedback when assigning staff to events.

## How It Works

### Conflict Detection

When creating or editing an event, the system automatically checks if each staff member is already assigned to another event at the same time. This prevents scheduling conflicts and ensures proper staffing.

### Visual Indicators

In the Event Form Modal, staff members are displayed with the following indicators:

- **✓** (Green checkmark) - Staff member has all required certifications
- **⚠️** (Warning icon) - Staff member is already assigned to another event at this time, with details about the conflicting event

### Example Display

```
✓ John Smith - Camp Director
Sarah Jones - Assistant Director
⚠️ Mike Johnson - Counselor (Already assigned to "Swimming Lessons" at 2:00 PM)
```

## Technical Implementation

### 1. Conflict Detector Service

Added `canAssignStaff()` method to `/src/services/conflicts.ts`:

```typescript
canAssignStaff(
  eventStartTime: string | Date, 
  eventEndTime: string | Date, 
  staffId: string, 
  allEvents: Event[],
  excludeEventId?: string
): { 
  canAssign: boolean; 
  reason?: string;
  conflictingEvent?: Event;
}
```

This method:
- Takes the event time range and staff member ID
- Checks all existing events for time overlaps
- Excludes the current event when editing (to allow updating an event without triggering a self-conflict)
- Returns availability status with detailed conflict information

### 2. Event Form Modal Updates

Modified `/src/components/modals/EventFormModal.vue` to:

1. **Accept new props:**
   - `eventDate`: The date of the event (for creating full timestamps)
   - `editingEventId`: The ID of the event being edited (to exclude from conflict checks)

2. **Add computed properties:**
   - `eventStartDateTime`: Combines the event date with start time
   - `eventEndDateTime`: Combines the event date with end time

3. **Add staff availability checking:**
   - `isStaffAvailable()`: Checks if a staff member is available using the conflict detector
   - Updated `getStaffLabel()` and `getStaffOption()` to include availability information

### 3. Calendar View Updates

Modified `/src/views/Calendar.vue` to:

1. Pass the event date and editing event ID to the Event Form Modal
2. Add `getEventFormDate()` method that returns:
   - The event's original date when editing
   - The currently selected date when creating a new event

## Usage

### For Users

1. **Creating a New Event:**
   - Select a date in the calendar
   - Click "New Event"
   - When assigning staff, you'll see availability indicators next to each staff member's name
   - Staff already assigned to overlapping events will be marked with a warning icon

2. **Editing an Existing Event:**
   - Click on an event to view details
   - Click "Edit"
   - Change the start/end time if needed
   - Staff availability will update automatically based on the new time
   - The system won't flag the current event as a conflict with itself

### For Developers

To extend this feature:

1. **Add more conflict types:**
   - Extend the `canAssignStaff()` method in `conflicts.ts`
   - Add new return fields for additional information

2. **Customize visual feedback:**
   - Modify `getStaffLabel()` and `getStaffOption()` in `EventFormModal.vue`
   - Update the template's `#after-items` slot to show different indicators

3. **Prevent assignment:**
   - Currently, the system warns but doesn't prevent assigning unavailable staff
   - To prevent assignment, add validation in the `handleSave()` method

## Benefits

1. **Prevents Double-Booking:** Ensures staff members aren't assigned to multiple events at the same time
2. **Real-time Feedback:** Users see availability immediately as they select times and staff
3. **Improved Planning:** Makes it easier to identify scheduling conflicts before they become problems
4. **Better User Experience:** Clear visual indicators help users make informed decisions

## Future Enhancements

Potential improvements to consider:

1. **Filter/Sort Options:** Allow filtering to show only available staff
2. **Alternative Suggestions:** Suggest available staff with similar qualifications
3. **Time-off Integration:** Account for staff time-off requests and availability
4. **Workload Balancing:** Show how many events each staff member is assigned to
5. **Notification System:** Alert staff when they're assigned to events
6. **Capacity Warnings:** Warn if a staff member is assigned to too many consecutive events

## Related Files

- `/src/services/conflicts.ts` - Core conflict detection logic
- `/src/components/modals/EventFormModal.vue` - Event creation/editing form
- `/src/views/Calendar.vue` - Calendar view that manages events
- `/src/components/modals/EventDetailModal.vue` - Event details display

## Testing Recommendations

1. Create multiple events at the same time
2. Try assigning the same staff member to overlapping events
3. Verify that the warning icon appears with correct conflict information
4. Edit an event's time and verify availability updates
5. Ensure editing doesn't show the current event as a conflict
6. Test with events on different days (should not conflict)
7. Test edge cases like events that start when another ends

## Notes

- The system uses time overlap detection: `start1 < end2 && start2 < end1`
- Times are compared using ISO 8601 timestamps for consistency
- The conflict detector is the same system used for camper scheduling conflicts
- Staff can still be assigned to conflicting events (warning only, not blocked)

