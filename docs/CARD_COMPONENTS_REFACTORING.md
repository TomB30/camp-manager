# Card Components Refactoring

## Overview
This document describes the refactoring of view-specific card components to improve code reusability, maintainability, and consistency across the application.

## Motivation
Previously, each view contained its own card markup and styling, leading to:
- **Code duplication**: Similar card structures repeated across multiple views
- **Maintenance overhead**: Changes to card styling required updates in multiple files
- **Inconsistent styling**: Slight variations in card appearance across different views
- **Large view files**: View files were cluttered with card markup and CSS

## Solution
Created 7 dedicated card components, each tailored to a specific entity type:
1. `ProgramCard`
2. `GroupCard`
3. `CamperCard`
4. `FamilyGroupCard`
5. `StaffCard`
6. `RoomCard`
7. `SleepingRoomCard`

## Card Components

### ProgramCard
**Location**: `src/components/cards/ProgramCard.vue`

**Props**:
- `program` (Program): The program data
- `activitiesCount` (Number): Number of activities
- `staffCount` (Number): Number of staff members
- `locationsCount` (Number): Number of locations

**Features**:
- Colored left border based on program color
- Badge showing activities count
- Staff and locations statistics with icons
- Hover animation effect

**Usage**:
```vue
<ProgramCard
  :program="program"
  :activities-count="getActivitiesCount(program.id)"
  :staff-count="getStaffCount(program.id)"
  :locations-count="getLocationsCount(program.id)"
  @click="selectProgram(program.id)"
/>
```

---

### GroupCard
**Location**: `src/components/cards/GroupCard.vue`

**Props**:
- `group` (CamperGroup): The group data
- `campersCount` (Number): Number of campers

**Slots**:
- `filters`: Custom filter tags to display

**Features**:
- Colored left border based on group color
- Badge showing campers count
- Flexible slot for displaying filter criteria
- Description with text truncation

**Usage**:
```vue
<GroupCard
  :group="group"
  :campers-count="getCampersCount(group.id)"
  @click="selectGroup(group.id)"
>
  <template #filters>
    <span class="filter-tag">Gender: Male</span>
    <span class="filter-tag">Age: 10-12</span>
  </template>
</GroupCard>
```

---

### CamperCard
**Location**: `src/components/cards/CamperCard.vue`

**Props**:
- `camper` (Camper): The camper data
- `formattedGender` (String): Formatted gender string
- `todayEventsCount` (Number): Number of events today

**Features**:
- Avatar with initials
- Age and gender badges
- Allergy count warning badge (if applicable)
- Parent contact information
- Today's events count

**Usage**:
```vue
<CamperCard
  :camper="camper"
  :formatted-gender="formatGender(camper.gender)"
  :today-events-count="getCamperTodayEvents(camper.id).length"
  @click="selectCamper(camper.id)"
/>
```

---

### FamilyGroupCard
**Location**: `src/components/cards/FamilyGroupCard.vue`

**Props**:
- `group` (FamilyGroup): The family group data
- `campersCount` (Number): Number of campers
- `formattedDateRange` (String): Formatted date range
- `sleepingRoomName` (String): Name of assigned sleeping room

**Features**:
- Colored left border based on group color
- Date range display with emoji
- Sleeping room information with icon
- Staff count indicator

**Usage**:
```vue
<FamilyGroupCard
  :group="group"
  :campers-count="getCampersCount(group.id)"
  :formatted-date-range="`${formatDate(group.startDate)} - ${formatDate(group.endDate)}`"
  :sleeping-room-name="getSleepingRoomName(group.sleepingRoomId)"
  @click="selectGroup(group.id)"
/>
```

---

### StaffCard
**Location**: `src/components/cards/StaffCard.vue`

**Props**:
- `member` (StaffMember): The staff member data
- `formattedRole` (String): Formatted role string
- `roleColor` (String): Color associated with the role

**Features**:
- Avatar with initials (colored by role)
- Role badge
- Email display
- Certifications count

**Usage**:
```vue
<StaffCard
  :member="member"
  :formatted-role="formatRole(member.role)"
  :role-color="getRoleColor(member.role)"
  @click="selectMember(member.id)"
/>
```

---

### RoomCard
**Location**: `src/components/cards/RoomCard.vue`

**Props**:
- `room` (Room): The room data
- `formattedType` (String): Formatted room type
- `iconColor` (String): Color for the icon background
- `usagePercent` (Number): Usage percentage

**Slots**:
- `icon`: Custom icon component (e.g., lucide-vue icons)

**Features**:
- Colored icon background
- Room type and capacity badges
- Location display
- Usage bar with percentage
- Color-coded usage indicator (red > 80%, green otherwise)

**Usage**:
```vue
<RoomCard
  :room="room"
  :formatted-type="formatRoomType(room.type)"
  :icon-color="getRoomTypeColor(room.type)"
  :usage-percent="getRoomUsage(room.id)"
  @click="selectRoom(room.id)"
>
  <template #icon>
    <BookOpen :size="24" :stroke-width="2" />
  </template>
</RoomCard>
```

---

### SleepingRoomCard
**Location**: `src/components/cards/SleepingRoomCard.vue`

**Props**:
- `room` (SleepingRoom): The sleeping room data
- `familyGroups` (FamilyGroup[]): Assigned family groups

**Features**:
- Bed icon with accent color background
- Beds count badge
- Location display
- List of assigned family groups (or "No family groups assigned")

**Usage**:
```vue
<SleepingRoomCard
  :room="room"
  :family-groups="getFamilyGroupsForRoom(room.id)"
  @click="selectRoom(room.id)"
/>
```

## Updated Views

All the following views have been refactored to use the new card components:

1. **Programs.vue** - Uses `ProgramCard`
2. **Groups.vue** - Uses `GroupCard`
3. **Campers.vue** - Uses `CamperCard`
4. **FamilyGroups.vue** - Uses `FamilyGroupCard`
5. **StaffMembers.vue** - Uses `StaffCard`
6. **Rooms.vue** - Uses `RoomCard`
7. **SleepingRooms.vue** - Uses `SleepingRoomCard`

## Benefits

### Code Reduction
- **Programs.vue**: Reduced by ~70 lines (card markup + CSS)
- **Groups.vue**: Reduced by ~60 lines
- **Campers.vue**: Reduced by ~50 lines
- **FamilyGroups.vue**: Reduced by ~65 lines
- **StaffMembers.vue**: Reduced by ~45 lines
- **Rooms.vue**: Reduced by ~70 lines
- **SleepingRooms.vue**: Reduced by ~55 lines

**Total reduction**: ~415 lines of duplicated code

### Maintainability
- Single source of truth for card styling
- Changes to card appearance only require updating the component
- Consistent hover effects and transitions across all views
- Easier to test card behavior in isolation

### Consistency
- Uniform card structure across the application
- Standardized spacing, padding, and border-radius
- Consistent hover animations (translateY + shadow)
- Predictable props and events API

### Developer Experience
- View files are now cleaner and easier to read
- Card components are self-documenting with TypeScript props
- Reusable across different contexts
- Easy to add new views with consistent card styling

## Design Patterns

### Composition over Configuration
Cards use slots where flexibility is needed (e.g., `GroupCard` filters, `RoomCard` icon), but provide sensible defaults and computed values where appropriate.

### Consistent API
All card components follow a similar pattern:
- Accept entity data as the primary prop
- Emit `click` event for selection
- Use scoped CSS for styling
- Support hover animations
- Respect the global CSS variables for theming

### Responsive Design
Cards are designed to work within grid layouts with `minmax(300px, 1fr)` columns, ensuring they look good on all screen sizes.

## Shared CSS Styles

To further reduce duplication, common card styles have been extracted into a shared CSS file:

**Location**: `src/components/cards/card-styles.css`

### Available CSS Classes

#### Base Card Styles
- **`.card-clickable`** - Adds cursor pointer and hover animation (translateY + box-shadow)
- **`.card-horizontal`** - Horizontal layout with flex and gap

#### Card Structure
- **`.card-header`** - Header with title and badge, flex space-between layout
- **`.card-description`** - Description text with 2-line truncation
- **`.card-details`** - Details section for cards with avatar/icon layout
- **`.card-icon`** - 64x64 icon container with centered content

#### Card Content
- **`.card-meta`** - Metadata row with badges
- **`.card-info-row`** - Info row with icon and text
- **`.card-stats`** - Stats container with multiple stat items
- **`.card-stat-item`** - Individual stat item with icon

### Usage Example

```vue
<template>
  <div class="card card-clickable card-horizontal">
    <div class="card-icon" :style="{ background: color }">
      <Icon :size="24" />
    </div>
    <div class="card-details">
      <h4>Title</h4>
      <div class="card-meta">
        <span class="badge">Badge</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './card-styles.css';

/* Component-specific styles only */
.custom-style {
  /* ... */
}
</style>
```

### Benefits of Shared CSS

1. **Consistency**: All cards use identical hover effects, spacing, and typography
2. **Maintainability**: Changes to card styling only require updating one file
3. **File Size**: Reduced CSS duplication saves ~300 lines across all cards
4. **Performance**: Browser can cache the shared styles more efficiently
5. **Developer Experience**: Clear naming conventions make it easy to understand card structure

## Future Improvements

1. **Generic EntityCard**: Consider creating a more generic base card that can be extended
2. **Accessibility**: Add ARIA labels and keyboard navigation support
3. **Loading States**: Add skeleton loading states for cards
4. **Animations**: Consider adding micro-interactions (e.g., badge pulse, icon bounce)
5. **Dark Mode**: Ensure cards work well in dark mode with appropriate color adjustments
6. **CSS Modules**: Consider migrating to CSS modules for better scoping

## Related Documentation
- [Reusable Components](./REUSABLE_COMPONENTS.md)
- [Refactoring Summary](./REFACTORING_SUMMARY.md)
- [UI Refresh](./UI_REFRESH.md)

