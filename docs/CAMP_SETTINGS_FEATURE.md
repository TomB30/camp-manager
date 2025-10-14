# Camp Settings Feature

## Overview
The Camp Settings view is a comprehensive backoffice admin panel that allows camp managers to configure core settings and infrastructure before the camp season begins. This is a one-time setup page for settings that typically remain constant year after year.

## Features

### 1. **Colors Management**
- Define custom color palettes for use throughout the camp system
- Each color has a name and hex value
- Colors are dynamically used in events, programs, groups, and other features
- The ColorPicker component automatically uses these custom colors
- **Path**: `/settings` → Colors tab

**Benefits**:
- Customize the visual branding to match your camp's identity
- Consistent color usage across all features
- Easy to update colors in one place

### 2. **Sessions Management**
- Define time periods (weeks, months, or custom durations) for camper registration
- Each session includes:
  - Name (e.g., "Week 1: Adventure Begins")
  - Start and end dates
  - Optional description
  - Optional maximum camper capacity
- **Path**: `/settings` → Sessions tab

**Benefits**:
- Clearly define registration periods
- Manage capacity for different time periods
- Support flexible session durations (1 week, 2 weeks, month, etc.)

### 3. **Locations Management**
- Manage all physical locations within the camp
- Previously standalone, now integrated into settings
- Includes indoor, outdoor, facility, field, water, and other location types
- **Path**: `/settings` → Locations tab

**Benefits**:
- Centralize all infrastructure management
- Set up locations once at the beginning of the season
- Grid and table views for easy management

### 4. **Cabins (Sleeping Rooms) Management**
- Manage sleeping accommodations for campers and family groups
- Track bed capacity and location assignments
- View family groups assigned to each cabin
- **Path**: `/settings` → Cabins tab

**Benefits**:
- Organize sleeping arrangements in one place
- Track cabin capacity and assignments
- Link family groups to specific cabins

## Navigation Changes

### Sidebar Updates
- **New**: "Camp Settings" navigation item (wrench icon)
- **Moved**: Locations and Sleeping Rooms moved from "Camp Info" section to Camp Settings
- **Camp Info** section now only contains Activity Rooms and Certifications

### Routing
- New route: `/settings`
- Old routes for `/locations` and `/sleeping-rooms` still work but are deprecated
- Settings view is the recommended location for managing these entities

## User Interface

### Design Principles
- **Different UI**: Uses a tabbed interface instead of standard view layout
- **Visual Distinction**: Purple gradient header to indicate backoffice functionality
- **Tab Navigation**: Easy switching between different setting categories
- **Consistent Patterns**: Each tab follows similar layout patterns for familiarity

### Tab Structure
Each tab includes:
- Header with description
- Action buttons (Add, View Toggle when applicable)
- Empty states for when no items exist
- Grid or table views for displaying items
- Modals for add/edit operations

## Technical Implementation

### New Types
```typescript
// Camp Color - customizable color options
interface CampColor {
  id: string;
  name: string;
  hexValue: string;
  createdAt: string;
  updatedAt: string;
}

// Camp Session - time periods for registration
interface CampSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  maxCampers?: number;
  createdAt: string;
  updatedAt: string;
}
```

### Store Integration
- New state: `colors` and `sessions` arrays
- New actions: `addColor`, `updateColor`, `deleteColor`, `addSession`, `updateSession`, `deleteSession`
- New getters: `getColorById`, `getSessionById`

### Storage Service
- New storage keys: `camp_colors` and `camp_sessions`
- Full CRUD operations for both entities
- Integrated with existing localStorage-based storage

### Color Picker Integration
The `ColorPicker` component now automatically uses custom colors from camp settings:
- If custom colors exist, they are used
- If no custom colors are configured, falls back to default colors
- Seamless integration with existing features

## Mock Data
Default data includes:
- 8 preset colors (Ocean Blue, Forest Green, Sunset Orange, etc.)
- 5 sample sessions covering a 6-week camp season
- Includes week-long and two-week sessions

## File Structure
```
src/
├── views/
│   └── CampSettings.vue              # Main settings view with tabs
├── components/
│   ├── settings/
│   │   ├── ColorsTab.vue            # Colors management
│   │   ├── SessionsTab.vue          # Sessions management
│   │   ├── LocationsTab.vue         # Locations management (moved)
│   │   └── CabinsTab.vue            # Cabins management (moved)
│   └── ColorPicker.vue              # Updated to use dynamic colors
├── stores/
│   └── campStore.ts                 # Updated with colors/sessions
├── services/
│   └── storage.ts                   # Updated with colors/sessions CRUD
├── types/
│   └── api.ts                       # New types: CampColor, CampSession
└── data/
    └── mockData.ts                  # Mock colors and sessions
```

## Usage Workflow

### First-Time Setup
1. Navigate to "Camp Settings" in the sidebar
2. Configure colors for your camp's branding
3. Define camp sessions (weeks, months, etc.)
4. Set up locations and cabins
5. These settings will be used throughout the system

### Ongoing Use
- Colors and sessions are typically set once and rarely changed
- Locations and cabins may be updated if facilities change
- The settings view serves as a central place for all infrastructure management

## Future Enhancements
Potential additions to Camp Settings:
- Camp information (name, address, contact details)
- Age groups/divisions
- Activity categories
- Equipment inventory
- Staff roles and permissions
- Email templates
- Notification preferences

## Related Documentation
- [COLOR_PICKER_COMPONENT.md](./COLOR_PICKER_COMPONENT.md) - Color picker implementation
- [LOCATIONS_FEATURE.md](./LOCATIONS_FEATURE.md) - Original locations feature
- [SLEEPING_ROOMS_UPDATE.md](./SLEEPING_ROOMS_UPDATE.md) - Sleeping rooms implementation
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Overall project structure

## Notes
- This is a backoffice feature intended for camp administrators
- Settings should be configured before the camp season begins
- Changes to colors/sessions will affect existing data (events, groups, etc.)
- The tabbed interface differentiates this from operational views

