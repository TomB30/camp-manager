# Programs Feature Documentation

## Overview

The Programs feature has been successfully implemented! This feature allows you to organize your camp's offerings into programs, each containing activities (event templates), staff members, and locations.

## What's New

### 1. Programs
Programs are collections of related activities, staff members, and locations. For example:
- **Watersports**: Wakeboarding, Swimming, Kayaking
- **Arts & Crafts**: Pottery, Painting, Jewelry Making
- **Adventure Sports**: Rock Climbing, Archery, Ropes Course

### 2. Activities (Event Templates)
Activities are reusable templates for creating events. Each activity can include:
- Default duration
- Default location
- Default capacity
- Required staff certifications
- Minimum and maximum staff requirements
- Default color for calendar display

### 3. Key Features

#### Program Management
- **View All Programs**: See all programs with their activity count, staff, and locations
- **Create/Edit Programs**: Add new programs or modify existing ones
- **Program Details**: Click on a program to view:
  - All activities in the program
  - Assigned staff members with their certifications
  - Associated locations
- **Breadcrumb Navigation**: Easy navigation between programs list and program details

#### Activity Templates
- **Create Activities**: Define activities with default settings
- **Activity Details**: View all activity settings including:
  - Duration
  - Default location
  - Capacity
  - Staff requirements
  - Required certifications
- **Event Creation from Templates**: When creating a new event, you can:
  1. Select an activity template
  2. The event form auto-populates with the activity's defaults
  3. Modify any settings as needed
  4. The event is linked to the program and activity

#### Calendar Integration
- **Program Filtering**: Filter calendar events by program
- **Program Labels**: Events created from activities display their program affiliation
- **Color Coding**: Events inherit colors from their activities

## How to Use

### Creating a Program

1. Navigate to **Programs** in the sidebar
2. Click **"+ Create Program"**
3. Fill in:
   - Program name (e.g., "Watersports")
   - Description (optional)
   - Color for visual identification
4. Click **"Create Program"**

### Adding Activities to a Program

1. Click on a program to view its details
2. In the Activities section, click **"+ Add Activity"**
3. Configure the activity:
   - Name (e.g., "Wakeboarding")
   - Description
   - Duration in minutes
   - Default location (optional)
   - Default capacity (optional)
   - Staff requirements (min/max)
   - Required certifications (e.g., "Lifeguard", "Boat Driver")
   - Color
4. Click **"Create Activity"**

### Assigning Staff and Locations

**To assign staff:**
1. In the program details, click **"+ Assign Staff"** in the Staff Members section
2. Select staff members from the list
3. They will be added to the program

**To add locations:**
1. In the program details, click **"+ Add Location"** in the Locations section
2. Select rooms/locations from the list
3. They will be added to the program

### Creating Events from Activity Templates

1. Go to the **Calendar** view
2. Click **"+ New Event"**
3. At the top of the form, you'll see **"Create from Activity Template"**
4. Select an activity from the dropdown (organized by program)
5. The form will auto-populate with:
   - Activity name as the event title
   - Calculated end time based on duration
   - Default location
   - Default capacity
   - Default color
6. Modify any fields as needed
7. Click **"Create Event"**

The event will be created and automatically linked to the program and activity!

### Filtering Events by Program

1. Go to the **Calendar** view
2. In the filter section at the top, you'll see a new **"All Programs"** dropdown
3. Select a program to see only events from that program
4. Use this with other filters (Type, Room) for more specific views

## Sample Data

The app comes with three sample programs:

### 1. Watersports (Blue)
**Activities:**
- Wakeboarding (2 hours, requires Lifeguard + Boat Driver)
- Swimming Lessons (1 hour, requires Lifeguard + Swimming Instructor)
- Kayaking (1.5 hours, requires Lifeguard)

### 2. Arts & Crafts (Pink)
**Activities:**
- Pottery (1.5 hours)
- Painting Workshop (1.25 hours)
- Jewelry Making (1 hour)

### 3. Adventure Sports (Green)
**Activities:**
- Rock Climbing (1.5 hours, requires Climbing Instructor + First Aid)
- Archery (1 hour, requires Archery Instructor)
- Ropes Course (2 hours, requires Ropes Course Instructor + First Aid)

## Technical Details

### Data Structure

**Program:**
```typescript
{
  id: string;
  name: string;
  description?: string;
  color?: string;
  activityIds: string[];
  staffMemberIds: string[];
  roomIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

**Activity:**
```typescript
{
  id: string;
  name: string;
  description?: string;
  programId: string;
  durationMinutes: number;
  defaultRoomId?: string;
  requiredCertifications?: string[];
  minStaff?: number;
  maxStaff?: number;
  defaultCapacity?: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Event (Extended):**
Events now include two new optional fields:
- `programId?: string` - Links the event to a program
- `activityId?: string` - Links the event to an activity template

### Files Created/Modified

**New Files:**
- `src/views/Programs.vue` - Main programs view with breadcrumb navigation
- `src/components/modals/ProgramFormModal.vue` - Program creation/editing
- `src/components/modals/ActivityFormModal.vue` - Activity creation/editing
- `src/components/modals/ActivityDetailModal.vue` - Activity details view

**Modified Files:**
- `src/types/api.ts` - Added Program and Activity types
- `src/services/storage.ts` - Added programs and activities storage
- `src/stores/campStore.ts` - Added programs and activities state management
- `src/router/index.ts` - Added programs route
- `src/components/Sidebar.vue` - Added Programs navigation item
- `src/components/modals/EventFormModal.vue` - Added activity template support
- `src/views/Calendar.vue` - Added program filtering
- `src/data/mockData.ts` - Added sample programs and activities

## Benefits

1. **Organization**: Group related activities, staff, and locations together
2. **Consistency**: Use activity templates to maintain consistent event settings
3. **Efficiency**: Create events faster with pre-configured templates
4. **Filtering**: Quickly view events for specific programs
5. **Staff Management**: See which staff members are assigned to each program
6. **Resource Planning**: Understand which locations are used by each program

## Future Enhancements

Potential improvements for the future:
- Bulk event creation from activities
- Schedule optimization by program
- Program capacity analysis
- Staff certification tracking per program
- Program-based reporting
- Activity availability scheduling

---

**Note**: All data is stored in browser localStorage. The feature is fully functional and ready to use!

