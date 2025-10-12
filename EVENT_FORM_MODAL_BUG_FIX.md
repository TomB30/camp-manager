# Event Form Modal Bug Fix

## Issue Summary

The `EventFormModal` was not saving data correctly. Specifically:
- Title wasn't being saved
- Campers assigned through `assignedGroups` weren't being enrolled
- Other form fields were not being persisted

## Root Cause

The bug was in the `Calendar.vue` component's `createEvent` method. The method was reading from `this.newEvent` (the component's local data) instead of using the form data emitted by the `EventFormModal`.

### Flow of Data:
1. `Calendar.vue` passes `:form-data="newEvent"` to `EventFormModal`
2. `EventFormModal` creates `localFormData` from the prop
3. User fills in the form, updating `localFormData`
4. User clicks "Create Event", modal emits `@save` with `localFormData`
5. **BUG**: `Calendar.vue`'s `createEvent()` method was ignoring the emitted data and using `this.newEvent` instead

## The Fix

### Before:
```javascript
async createEvent() {
  // Was using this.newEvent directly
  const event: Event = {
    id: `event-${Date.now()}`,
    title: this.newEvent.title,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    roomId: this.newEvent.roomId,
    capacity: this.newEvent.capacity,
    type: this.newEvent.type,
    color: this.newEvent.color,
    enrolledCamperIds: [],
    assignedStaffIds: [],
  };
  
  // ... rest of the method
}
```

### After:
```javascript
async createEvent(formData: any) {
  // Now receives and uses the emitted formData
  const event: Event = {
    id: `event-${Date.now()}`,
    title: formData.title,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    roomId: formData.roomId,
    capacity: formData.capacity,
    type: formData.type,
    color: formData.color,
    enrolledCamperIds: [],
    assignedStaffIds: [],
  };
  
  // ... rest of the method
}
```

## Changes Made

### `src/views/Calendar.vue`

1. **Method Signature**: Updated `createEvent()` to `createEvent(formData: any)` to receive the emitted data
2. **Data Access**: Changed all references from `this.newEvent.*` to `formData.*`
3. **Camper Groups**: Updated the condition to check `formData.camperGroupIds` instead of `this.newEvent.camperGroupIds`
4. **Success Message**: Added success toast when no camper groups are selected

## Key Points

- The modal's `localFormData` is now properly used when saving
- All form fields (title, times, room, capacity, type, color, camper groups) are now correctly saved
- Camper group enrollment now works as expected
- The fix maintains the existing form reset behavior

## Testing Recommendations

1. Create a new event with all fields filled
2. Verify the title is saved correctly
3. Select multiple camper groups and verify they are enrolled
4. Check that room, capacity, type, and color are all persisted
5. Verify the success/warning toasts appear appropriately

## Related Files

- `src/components/modals/EventFormModal.vue` - The modal component (no changes needed)
- `src/views/Calendar.vue` - The parent component (fixed)

