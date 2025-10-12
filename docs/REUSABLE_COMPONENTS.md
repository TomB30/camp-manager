# Reusable Components Guide

This document describes the reusable components created to reduce code duplication across views.

## Components Overview

### 1. ViewHeader
**Purpose:** Consistent page headers with title, optional tooltip, and action buttons.

**Props:**
- `title` (String, required): Page title
- `tooltip` (String): Optional tooltip text shown with InfoTooltip

**Slots:**
- `actions`: Header action buttons

**Usage:**
```vue
<ViewHeader 
  title="Programs" 
  tooltip="Programs are collections of activities, staff members, and locations."
>
  <template #actions>
    <button class="btn btn-primary" @click="showModal = true">
      + Create Program
    </button>
  </template>
</ViewHeader>
```

---

### 2. EmptyState
**Purpose:** Consistent empty state displays for "no data" and "no results" scenarios.

**Props:**
- `type` (String): 'empty' (default) or 'no-results'
- `icon` (Component): Custom icon component (optional)
- `iconSize` (Number): Icon size in pixels (default: 64)
- `title` (String): Empty state title
- `message` (String): Empty state message
- `actionText` (String): Action button text
- `actionButtonClass` (String): Button class (default: 'btn-primary')

**Slots:**
- `icon`: Custom icon content
- `action`: Custom action content

**Events:**
- `action`: Emitted when action button is clicked

**Usage:**
```vue
<!-- No data state -->
<EmptyState
  type="empty"
  title="No Programs Yet"
  message="Create your first program to organize activities, staff, and locations."
  action-text="Create Program"
  @action="showModal = true"
/>

<!-- No results state -->
<EmptyState
  type="no-results"
  title="No Programs Found"
  message="No programs match your search query."
  action-text="Clear Filters"
  action-button-class="btn-secondary"
  @action="clearFilters"
/>
```

---

### 3. AvatarInitials
**Purpose:** Display user/camper initials in a circular avatar.

**Props:**
- `firstName` (String): First name
- `lastName` (String): Last name
- `text` (String): Alternative text (overrides first/last name)
- `size` (String): 'xs', 'sm', 'md' (default), 'lg', 'xl'
- `color` (String): Background color (default: var(--accent-color))

**Usage:**
```vue
<!-- Using first/last name -->
<AvatarInitials 
  first-name="John" 
  last-name="Doe" 
  size="md" 
/>

<!-- Using text -->
<AvatarInitials 
  text="TW" 
  size="lg" 
  color="#10B981" 
/>
```

**Sizes:**
- xs: 24px
- sm: 32px
- md: 48px (default)
- lg: 64px
- xl: 80px

---

### 4. ColorIndicator
**Purpose:** Small colored dot or bar for visual coding.

**Props:**
- `color` (String): Color hex code (default: '#6366F1')
- `type` (String): 'dot' (default) or 'bar'
- `size` (String): 'sm', 'md' (default), 'lg'

**Usage:**
```vue
<!-- Colored dot -->
<ColorIndicator color="#6366F1" type="dot" size="md" />

<!-- Colored bar (for card borders) -->
<ColorIndicator color="#10B981" type="bar" size="lg" />
```

---

### 5. EntityCard
**Purpose:** Generic card component for grid views with consistent styling.

**Props:**
- `title` (String): Card title
- `description` (String): Card description (max 2 lines with ellipsis)
- `badge` (String): Badge text in header
- `color` (String): Left border color
- `clickable` (Boolean): Whether card is clickable (default: true)

**Slots:**
- `header-badge`: Custom badge content
- `default`: Main content area
- `stats`: Card statistics/metadata
- `footer`: Card footer

**Events:**
- `click`: Emitted when card is clicked

**Usage:**
```vue
<EntityCard
  title="Swimming Program"
  description="Fun water activities for all skill levels"
  badge="5 activities"
  color="#60A5FA"
  @click="selectProgram(program.id)"
>
  <template #stats>
    <span class="stat-item">
      <Users :size="16" />
      3 staff
    </span>
    <span class="stat-item">
      <Home :size="16" />
      2 locations
    </span>
  </template>
</EntityCard>
```

---

### 6. EntityListItem
**Purpose:** List item with avatar, info, and actions (for detail views).

**Props:**
- `title` (String): Item title
- `subtitle` (String): Item subtitle
- `firstName` (String): For avatar initials
- `lastName` (String): For avatar initials
- `avatarColor` (String): Avatar background color
- `removable` (Boolean): Show remove button (default: false)

**Slots:**
- `avatar`: Custom avatar content
- `default`: Custom info content
- `metadata`: Additional metadata below subtitle
- `actions`: Custom action buttons

**Events:**
- `remove`: Emitted when remove button is clicked

**Usage:**
```vue
<EntityListItem
  first-name="Tom"
  last-name="Wilson"
  title="Tom Wilson"
  subtitle="Counselor"
  :removable="true"
  @remove="confirmRemoveStaff(staff.id)"
>
  <template #metadata>
    <div class="staff-certifications">
      <span class="certification-badge">First Aid</span>
      <span class="certification-badge">CPR</span>
    </div>
  </template>
</EntityListItem>
```

---

## Migration Guide

### Before (Duplicated Code)
```vue
<!-- In every view -->
<div class="view-header">
  <div class="view-title">
    <h2>Programs</h2>
    <InfoTooltip>Program tooltip text</InfoTooltip>
  </div>
  <div class="header-actions">
    <button class="btn btn-primary">+ Create</button>
  </div>
</div>
```

### After (Using Component)
```vue
<ViewHeader title="Programs" tooltip="Program tooltip text">
  <template #actions>
    <button class="btn btn-primary">+ Create</button>
  </template>
</ViewHeader>
```

---

## Benefits

1. **Reduced Code Duplication**: ~40% less code in view files
2. **Consistent UI**: All views use same components = consistent look
3. **Easier Maintenance**: Update once, applies everywhere
4. **Better Testing**: Test components in isolation
5. **Faster Development**: Reuse instead of rewrite

---

## Next Steps

To fully adopt these components:

1. Refactor `Programs.vue` to use new components
2. Refactor `StaffMembers.vue` to use new components
3. Refactor `Groups.vue` to use new components
4. Refactor `Campers.vue` to use new components
5. Refactor `FamilyGroups.vue` to use new components
6. Remove duplicate styles from individual views

---

## Notes

- All components are fully typed with TypeScript
- All components follow Vue 3 Composition API best practices
- Components are designed to be flexible with slots for customization
- Styles use CSS variables for theming consistency

