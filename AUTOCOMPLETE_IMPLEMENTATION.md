# Autocomplete Component Implementation

## Overview
This document describes the implementation of the Autocomplete component that replaces all select elements throughout the application with a searchable, keyboard-navigable dropdown.

## Component Features

### Core Functionality
- **Type-ahead Search**: Users can start typing to filter options instantly
- **Keyboard Navigation**: Full support for keyboard navigation (Arrow keys, Enter, Escape)
- **Customizable Options**: Supports both simple and complex option structures
- **Disabled Options**: Can mark specific options as disabled
- **Clear Selection**: Easy-to-use clear button when a value is selected
- **Portal/Teleport**: Dropdown uses Teleport to render at body level, preventing z-index and overflow issues
- **Smart Positioning**: Automatically positions above or below the input based on available space

### Props
- `modelValue`: The selected value (v-model compatible)
- `options`: Array of options (can be primitives or objects)
- `placeholder`: Placeholder text for the input
- `required`: Whether the field is required
- `disabled`: Whether the field is disabled
- `primitive`: If true, options are treated as primitive values (strings/numbers)
- `optionLabel`: Function or string key to get the label from an option
- `optionValue`: Function or string key to get the value from an option
- `optionDisabled`: Function or string key to check if an option is disabled
- `filterMode`: 'contains' or 'startsWith' for filtering behavior
- `maxHeight`: Maximum height for the dropdown (default: 300px)

### Keyboard Shortcuts
- **↓ Arrow Down**: Navigate to next option
- **↑ Arrow Up**: Navigate to previous option
- **Enter**: Select highlighted option
- **Escape**: Close dropdown
- **Tab**: Normal tab behavior

## Files Modified

### New Component
- `src/components/Autocomplete.vue` - The reusable autocomplete component

### Core Components Updated
- `src/components/FilterBar.vue` - Filter dropdowns now use Autocomplete instead of select elements

### Views Updated
1. **Campers.vue**
   - Gender selection
   - Family Group selection

2. **Groups.vue**
   - Gender filter
   - Allergies filter

3. **Calendar.vue**
   - Room selection (event creation)
   - Event type selection
   - Group assignment selection

4. **FamilyGroups.vue**
   - Add camper selection
   - Sleeping room selection (with disabled state for insufficient capacity)

5. **TeamMembers.vue**
   - Role selection
   - Manager selection

6. **StaffMembers.vue**
   - Role selection
   - Manager selection

7. **Rooms.vue**
   - Room type selection

## Usage Example

### Basic Usage (Simple Options)
```vue
<Autocomplete
  v-model="selectedValue"
  :options="[
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' }
  ]"
  placeholder="Select gender..."
  :required="true"
/>
```

### Computed Options
```vue
<script>
computed: {
  familyGroupOptions() {
    return this.store.familyGroups.map(group => ({
      label: `${group.name} - ${this.getSleepingRoomName(group.sleepingRoomId)}`,
      value: group.id
    }));
  }
}
</script>

<template>
  <Autocomplete
    v-model="formData.familyGroupId"
    :options="familyGroupOptions"
    placeholder="Select a family group..."
    :required="true"
  />
</template>
```

### Options with Disabled State
```vue
<script>
computed: {
  sleepingRoomOptions() {
    return this.store.sleepingRooms.map(room => ({
      label: `${room.name} (${room.beds} beds)${this.canFitInRoom(room) ? '' : ' - Not enough beds'}`,
      value: room.id,
      disabled: !this.canFitInRoom(room)
    }));
  }
}
</script>

<template>
  <Autocomplete
    v-model="formData.sleepingRoomId"
    :options="sleepingRoomOptions"
    placeholder="Select a sleeping room..."
    :required="true"
  />
</template>
```

## Benefits

1. **Better UX**: Users can quickly find options by typing instead of scrolling
2. **Consistency**: All dropdowns throughout the app now have the same look and behavior
3. **Accessibility**: Better keyboard navigation than native select elements
4. **Flexibility**: Easy to customize and extend for specific use cases
5. **Modern UI**: Clean, modern design that matches the application's aesthetic
6. **Smart Positioning**: Dropdown automatically adjusts position to stay visible

## Technical Details

### Component Architecture
- Built with Vue 3 Composition API
- Uses Teleport to render dropdown at body level
- Implements debounced search filtering
- Smart scroll handling to keep highlighted option visible
- Window resize and scroll listeners for dynamic positioning

### Styling
- Uses CSS custom properties for theming
- Matches the existing form component styles
- Responsive design
- Smooth transitions and hover effects
- Custom scrollbar styling

## Testing

The autocomplete component has been tested across all views:
- ✅ Campers Management
- ✅ Groups
- ✅ Calendar/Events
- ✅ Family Groups
- ✅ Team Members
- ✅ Staff Members
- ✅ Rooms
- ✅ FilterBar Component (used across all list views)

All previous select functionality has been preserved while adding the new autocomplete features.

## Additional Notes

### FilterBar Integration
The FilterBar component, which is used across all list views in the application, has been updated to use the Autocomplete component for its filter dropdowns. This means:
- All filter dropdowns (gender, age, role, room type, etc.) now support type-ahead search
- The filter experience is consistent across the entire application
- Users can quickly find filter options by typing
- The compact filter bar maintains its layout while providing enhanced functionality

