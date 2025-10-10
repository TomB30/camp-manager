# Family Groups Feature

## Overview

The Family Groups feature introduces a fundamental organizational unit in the camp management system. Each camper must be assigned to a Family Group, and each Family Group is assigned to a specific sleeping room and has associated staff members.

## Key Concepts

### Family Group
A Family Group is the base organizational unit for campers. It represents a group of campers who share the same sleeping room and are supervised by specific staff members.

**Properties:**
- **Name**: The name of the family group (e.g., "Eagles Family", "Bears Family")
- **Description**: Optional description of the group
- **Sleeping Room**: Required assignment to a sleeping room (cabin)
- **Staff Members**: Array of staff member IDs assigned to supervise this group
- **Color**: Optional color for visual identification in the UI
- **Timestamps**: Created at and updated at timestamps

### Relationships

```
FamilyGroup
├─→ SleepingRoom (required, 1:1)
├─→ StaffMembers (0:many)
└─← Campers (0:many)
```

- Each **Family Group** must be assigned to exactly one **Sleeping Room**
- Each **Family Group** can have zero or more **Staff Members** assigned
- Each **Camper** must belong to exactly one **Family Group**
- Each **Sleeping Room** can have multiple **Family Groups** assigned to it

## Data Structure

### FamilyGroup Interface

```typescript
export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  sleepingRoomId: string; // Required
  staffMemberIds: string[]; // Array of staff IDs
  color?: string; // Hex color for UI
  createdAt: string;
  updatedAt: string;
}
```

### Updated Camper Interface

```typescript
export interface Camper {
  // ... other properties
  familyGroupId: string; // Required - replaces direct sleepingRoomId
}
```

### SleepingRoom Assignment

Sleeping rooms are assigned to campers exclusively through **Family Groups**:
- Each **Family Group** is assigned to exactly one **Sleeping Room**
- Campers are indirectly assigned to rooms through their **Family Group** membership
- There are **no temporary or date-based group assignments** to sleeping rooms

## Features

### Family Groups Management View (`/family-groups`)

A dedicated view for managing family groups with:
- Grid view of all family groups with visual cards
- Color-coded group identification
- Quick stats: number of campers, assigned room, staff count
- Detailed view showing:
  - Group description
  - Assigned sleeping room
  - List of staff members
  - List of campers in the group
- Create/Edit/Delete operations

### Updated Sleeping Rooms View

The sleeping rooms view now shows:
- **Family Groups Section**: Lists all family groups assigned to each room
  - Shows camper count per family group
  - Shows staff member count
  - Link to view family group details
- Sleeping rooms can **only** be assigned through family groups (no temporary assignments)

### Updated Campers View

Campers now include:
- **Family Group Assignment**: Required field when creating/editing campers
- **Family Group Display**: Shows in camper detail modal
  - Group name with color badge
  - Associated sleeping room
- **Form Field**: Dropdown to select family group during camper creation/editing

## Store Methods

### Computed Properties

- `getFamilyGroupById(id: string)`: Get a single family group by ID
- `getCampersInFamilyGroup(familyGroupId: string)`: Get all campers in a family group
- `getFamilyGroupsInRoom(sleepingRoomId: string)`: Get all family groups assigned to a room

### Actions

- `addFamilyGroup(familyGroup: FamilyGroup)`: Create a new family group
- `updateFamilyGroup(familyGroup: FamilyGroup)`: Update an existing family group
- `deleteFamilyGroup(id: string)`: Delete a family group

## Mock Data

The system includes sample family groups for testing:

1. **Eagles Family** (Cabin A)
   - 2 staff members
   - Multiple campers
   - Blue color

2. **Bears Family** (Cabin B)
   - 2 staff members
   - Multiple campers
   - Green color

3. **Wolves Family** (Cabin C)
   - 2 staff members
   - Multiple campers
   - Orange color

4. **Hawks Family** (Cabin D)
   - 2 staff members
   - Multiple campers
   - Purple color

## User Workflows

### Creating a Family Group

1. Navigate to **Family Groups** page
2. Click **"+ Create Family Group"**
3. Fill in:
   - Group name (required)
   - Description (optional)
   - Select sleeping room (required)
   - Select staff members (optional, multiple)
   - **Add campers** (optional, multiple) - NEW!
     - Select camper from dropdown
     - Click "Add" to include them
     - Remove with "×" button if needed
   - Choose a color (optional)
4. Click **"Create Group"**

### Assigning Campers to a Family Group

#### Method 1: From Campers View (Camper-Centric)

1. Navigate to **Campers** page
2. Click **"+ Add Camper"** or edit an existing camper
3. Fill in camper information
4. Select **Family Group** from the dropdown (required)
   - Shows group name and assigned room
5. Save camper

#### Method 2: From Family Groups View (Group-Centric) - NEW!

1. Navigate to **Family Groups** page
2. Click on a family group or create a new one
3. In the edit/create form:
   - Select campers from the dropdown
   - Click "Add" to assign them to the group
   - Use "×" to remove campers
4. Click **"Update Group"** or **"Create Group"**

**Tip**: The group-centric approach is ideal when organizing multiple campers at once or setting up groups for a new session.

### Viewing Family Groups in a Room

1. Navigate to **Cabins** page
2. Click on a sleeping room card or "View Details"
3. View the **"Family Groups"** section showing:
   - List of family groups assigned to this room
   - Camper count per group
   - Staff count per group
   - Click "View Details" to navigate to the family group

## Migration Notes

### Breaking Changes

1. **Camper Model**: 
   - Removed: `sleepingRoomId` field
   - Added: `familyGroupId` field (required)

2. **Sleeping Room Display**:
   - No longer shows direct camper assignments
   - Shows family groups instead
   - Temporary camper group assignments remain unchanged

3. **Camper Group Filters**:
   - Removed: `sleepingRoomIds` filter
   - Groups now filter by family group indirectly through campers

### Data Migration

When upgrading existing data:
1. Create family groups for each sleeping room
2. Migrate campers from `sleepingRoomId` to `familyGroupId`
3. Assign staff members to family groups
4. Remove obsolete sleeping room references

## UI Components

### New Components

- **FamilyGroups.vue**: Main management view for family groups

### Updated Components

- **SleepingRooms.vue**: Shows family groups instead of individual campers
- **Campers.vue**: Includes family group selection and display
- **Sidebar.vue**: Added "Family Groups" navigation link

### Navigation

- **Dashboard** → Overview
- **Calendar** → Events
- **Campers** → Camper management (with family group assignment)
- **Staff** → Staff management
- **Activity Rooms** → Activity room management
- **Cabins** → Sleeping rooms (shows family groups)
- **Family Groups** → Family group management (NEW)
- **Camper Groups** → Dynamic camper groups (renamed from "Groups")

## Technical Implementation

### Type Definitions (`src/types/api.ts`)
- Added `FamilyGroup` interface
- Updated `Camper` interface
- Updated `CamperGroupFilter` interface

### Store (`src/stores/campStore.ts`)
- Added `familyGroups` state
- Added computed properties for family group operations
- Added CRUD actions for family groups

### Storage Service (`src/services/storage.ts`)
- Added CRUD operations for family groups
- Updated seed data handling

### Mock Data (`src/data/mockData.ts`)
- Added sample family groups
- Updated campers with family group assignments

### Router (`src/router/index.ts`)
- Added `/family-groups` route

## Best Practices

1. **Always assign campers to a family group** - This is required for proper room management
2. **Assign staff to family groups** - Ensures supervision and responsibility tracking
3. **Use colors for quick identification** - Helps distinguish groups visually
4. **Keep family groups balanced** - Distribute campers evenly across groups when possible
5. **Update family groups when room changes occur** - Maintain data consistency

## Future Enhancements

Potential improvements for the family group feature:

1. **Capacity Management**: Warn when family groups exceed room capacity
2. **Age-based Grouping**: Suggest family groups based on camper ages
3. **Gender-based Grouping**: Ensure proper gender distribution in rooms
4. **Staff Rotation**: Schedule and track staff assignments over time
5. **Group Activities**: Associate activities specific to family groups
6. **Communication Tools**: Group messaging or announcements
7. **Reports**: Generate family group rosters and statistics

## Related Documentation

- [Family Group Camper Management](./FAMILY_GROUP_CAMPER_MANAGEMENT.md) - Detailed guide on managing campers within family groups
- [Project Summary](./PROJECT_SUMMARY.md)
- [Groups Feature](./GROUPS_FEATURE.md)
- [Getting Started](./GETTING_STARTED.md)
- [Usage Guide](./USAGE_GUIDE.md)

