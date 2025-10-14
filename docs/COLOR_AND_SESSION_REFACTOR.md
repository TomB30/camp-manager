# Color and Session Refactoring

## Overview
This document describes the major refactoring that centralizes color management and adds session tracking for campers. All entities that previously used hardcoded color hex values now reference colors from the Camp Settings, and all campers are assigned to specific camp sessions.

## Changes Made

### 1. **Type Updates**

#### Camper Type
- **Added**: `sessionId?: string` field
- **Purpose**: Track which camp session each camper is registered for
- Each camper can be registered to one of the camp's defined sessions (e.g., Week 1, Week 2, etc.)

#### Entity Color Fields
Updated the following types to use `colorId` instead of (or in addition to) hardcoded `color` hex values:

- **Event**: Added `colorId?: string`, kept `color?: string` for backward compatibility
- **Program**: Added `colorId?: string`, kept `color?: string` as deprecated
- **CamperGroup**: Added `colorId?: string`, kept `color?: string` as deprecated
- **FamilyGroup**: Added `colorId?: string`, kept `color?: string` as deprecated
- **Activity**: Added `colorId?: string`, kept `color?: string` as deprecated

### 2. **Mock Data Updates**

#### Color Migration
All mock data entities now use `colorId` references instead of hardcoded hex values:

- **Programs**: All 10 programs updated to use colorId
- **Activities**: All 35 activities updated to use colorId
- **Events**: Color references mapped to colorIds
- **Groups**: CamperGroups and FamilyGroups mapped to colorIds

**Color Mappings Used:**
```
Ocean Blue (#3B82F6)      -> color-001
Forest Green (#10B981)    -> color-002
Sunset Orange (#F59E0B)   -> color-003
Royal Purple (#8B5CF6)    -> color-004
Flamingo Pink (#EC4899)   -> color-005
Fire Red (#EF4444)        -> color-006
Teal Wave (#14B8A6)       -> color-007
Indigo Night (#6366F1)    -> color-008
```

#### Session Distribution
All 350 campers have been distributed across the 5 camp sessions:

- **Distribution**: ~70 campers per session using round-robin (modulo 5)
- **Sessions**:
  - Session 1: Week 1 - Adventure Begins (June 15-21)
  - Session 2: Week 2 - Explorer's Quest (June 22-28)
  - Session 3: Week 3-4 - Summer Spectacular (June 29 - July 12) - 2 weeks
  - Session 4: Week 5 - Arts & Performance (July 13-19)
  - Session 5: Week 6 - Grand Finale (July 20-26)

### 3. **Utility Functions**

Created `/src/utils/colorUtils.ts` with helper functions:

```typescript
// Resolves colorId to hex value from store
resolveColor(colorId?: string, fallbackColor?: string): string

// Gets color from entity (supports both colorId and legacy color)
getEntityColor(entity: {colorId?: string; color?: string}): string
```

**Usage Example:**
```typescript
import { getEntityColor } from '@/utils/colorUtils';

// In a component displaying a program:
const programColor = getEntityColor(program);
// Returns hex value from colorId, or falls back to legacy color field
```

### 4. **Backward Compatibility**

The refactoring maintains backward compatibility:

- **Legacy Support**: All entities keep their old `color` field marked as deprecated
- **Graceful Fallback**: Helper functions fall back to legacy color if colorId not found
- **Data Migration**: Existing data with hex colors will still work, new data uses colorId

## Benefits

### Centralized Color Management
1. **Single Source of Truth**: All colors defined in Camp Settings
2. **Easy Updates**: Change a color once, updates everywhere
3. **Customization**: Camp admins can define their own color palette
4. **Consistency**: Ensures color usage is consistent across the application

### Session Tracking
1. **Registration Management**: Know which campers are in which session
2. **Capacity Planning**: Track session enrollment
3. **Reporting**: Generate session-specific reports
4. **Flexibility**: Support various session durations (weeks, months, custom)

## Usage in Forms

### Displaying Colors
When displaying an entity's color in cards, calendars, or other views:

```typescript
import { getEntityColor } from '@/utils/colorUtils';

const eventColor = getEntityColor(event);
// Use eventColor for styling
```

### Color Selection in Forms
Forms should be updated to use a dropdown/selector for colors instead of ColorPicker:

```vue
<template>
  <select v-model="formData.colorId">
    <option v-for="color in store.colors" :key="color.id" :value="color.id">
      <span :style="{background: color.hexValue}"></span>
      {{ color.name }}
    </option>
  </select>
</template>
```

### Session Selection in Camper Forms
Camper forms should include session selection:

```vue
<template>
  <div class="form-group">
    <label>Registered Session</label>
    <select v-model="formData.sessionId">
      <option value="">No session selected</option>
      <option v-for="session in store.sessions" :key="session.id" :value="session.id">
        {{ session.name }} ({{ formatDateRange(session.startDate, session.endDate) }})
      </option>
    </select>
  </div>
</template>
```

## Migration Path

### For Existing Data
1. **Old Format**: Entities with `color: "#3B82F6"` will continue to work
2. **New Format**: New/updated entities should use `colorId: "color-001"`
3. **Transition**: Forms can be gradually updated to use colorId selectors

### For New Features
- All new entities should use `colorId` exclusively
- Use `getEntityColor()` helper for display
- Use session selector in camper forms

## Components to Update

### High Priority (For Full Feature Support)
These components should be updated to use colorId selectors:

1. **Event Form Modal** (`EventFormModal.vue`)
   - Replace ColorPicker with color dropdown
   - Update save logic to use colorId

2. **Program Form Modal** (`ProgramFormModal.vue`)
   - Replace ColorPicker with color dropdown
   - Update save logic to use colorId

3. **Camper Form Modal** (`CamperFormModal.vue`)
   - Add session selector
   - Update save logic to include sessionId

4. **Group Form Modal** (`GroupFormModal.vue`)
   - Replace ColorPicker with color dropdown
   - Update save logic to use colorId

5. **Family Group Form Modal** (`FamilyGroupFormModal.vue`)
   - Replace ColorPicker with color dropdown
   - Update save logic to use colorId

6. **Activity Form Modal** (`ActivityFormModal.vue`)
   - Replace ColorPicker with color dropdown
   - Update save logic to use colorId

### Display Components (Already Compatible)
These components should work as-is with the helper functions:

- Event cards/calendars - use `getEntityColor(event)`
- Program cards - use `getEntityColor(program)`
- Group cards - use `getEntityColor(group)`
- Activity displays - use `getEntityColor(activity)`

## Data Flow

### Creating New Entities
```
User selects color from dropdown (colorId)
  ↓
Form saves entity with colorId
  ↓
Store saves to localStorage
  ↓
Display components use getEntityColor() to resolve to hex
  ↓
Rendered with correct color from Camp Settings
```

### Displaying Existing Entities
```
Entity loaded from storage
  ↓
Has colorId? → Resolve from store → Display
  ↓ (no)
Has color? → Use legacy hex → Display
  ↓ (no)
Use default color
```

## Testing Notes

### Verify Color References
1. Check that all programs display with correct colors
2. Verify activities inherit proper colors
3. Ensure events show appropriate colors
4. Confirm groups display with assigned colors

### Verify Session Assignment
1. Check that all campers have sessionIds
2. Verify session distribution is balanced
3. Test session filtering if implemented
4. Confirm session info displays correctly

## Future Enhancements

### Possible Improvements
1. **Session-Based Filtering**: Filter campers, events by session
2. **Session Capacity Warnings**: Alert when session approaches max capacity
3. **Color Migration Tool**: Batch convert old color values to colorIds
4. **Session Dashboard**: Overview of enrollment per session
5. **Color Usage Analytics**: Show which colors are most used
6. **Session Overlap Detection**: Warn if camper registered to overlapping sessions

### Potential Features
- Camper transfer between sessions
- Session waiting lists
- Session-specific pricing
- Color themes (predefined sets of colors)
- Seasonal color palettes

## Technical Notes

### Performance
- Color resolution is fast (O(1) lookup in store)
- No impact on existing functionality
- Backward compatible fallbacks ensure robustness

### Data Integrity
- ColorId references are validated against store
- Missing colors fall back gracefully
- Session IDs validated against available sessions

### Maintainability
- Centralized color management reduces duplication
- Type safety ensures colorId usage is correct
- Helper functions abstract complexity

## Related Documentation
- [CAMP_SETTINGS_FEATURE.md](./CAMP_SETTINGS_FEATURE.md) - Camp Settings implementation
- [COLOR_PICKER_COMPONENT.md](./COLOR_PICKER_COMPONENT.md) - Original color picker
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Overall project structure

## Summary

This refactoring provides:
✅ Centralized color management through Camp Settings
✅ Session tracking for all campers
✅ Backward compatibility with existing data
✅ Helper functions for easy color resolution
✅ Foundation for session-based features
✅ Scalable architecture for future enhancements

The system now has a solid foundation for managing camp colors and sessions as configurable settings rather than hardcoded values.

