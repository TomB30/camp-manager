# Family Group Camper Management

## Overview

Family groups now support direct camper management within the family group creation/editing interface. Users can add and remove campers directly when working with family groups, providing a more intuitive workflow.

## Features

### Add/Remove Campers in Family Group Form

When creating or editing a family group, users can now:

1. **View Current Campers**: See all campers currently assigned to the family group
2. **Add Campers**: Select and add campers from a dropdown of available campers
3. **Remove Campers**: Remove campers from the family group with a single click
4. **Visual Feedback**: Each camper shows their initials in an avatar and their full name

### Dual Management Approach

Campers can be assigned to family groups in two ways:

#### 1. From Campers View (Camper-Centric)
- Navigate to **Campers** page
- Create or edit a camper
- Select a family group from the dropdown
- Save the camper

**Use Case**: "I have a new camper to add, let me assign them to the right family group"

#### 2. From Family Groups View (Group-Centric)
- Navigate to **Family Groups** page
- Create or edit a family group
- Add campers using the campers selection interface
- Save the family group

**Use Case**: "I'm organizing this family group, let me add all the right campers to it"

## User Interface

### Campers Selection Section

Located in the family group create/edit modal, the campers section includes:

```
┌─────────────────────────────────────┐
│ Campers in this Group               │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [JD] John Doe            [×]    │ │
│ │ [SM] Sarah Miller        [×]    │ │
│ │ [TJ] Tommy Johnson       [×]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Add a camper... ▼] [Add]          │
└─────────────────────────────────────┘
```

**Components:**
- **Selected Campers List**: Scrollable list showing current members
- **Camper Avatar**: Circular badge with initials
- **Remove Button**: Red "×" button to remove camper
- **Add Dropdown**: Select from available campers
- **Add Button**: Confirm addition

### Visual Design

- **Camper Items**: White background with hover effect
- **Avatar**: Blue circular badge with white initials
- **Remove Button**: Red circular button that scales on hover
- **Scrollable**: List scrolls when there are many campers (max height: 200px)

## Workflow

### Creating a New Family Group with Campers

1. Click **"+ Create Family Group"**
2. Enter group name and description
3. Select a sleeping room
4. Optionally select staff members
5. **Add campers**:
   - Select camper from dropdown
   - Click "Add" button
   - Repeat for each camper
6. Choose a group color
7. Click **"Create Group"**

Result: Family group is created and all selected campers are assigned to it

### Editing a Family Group's Campers

1. Click on a family group to view details
2. Click **"Edit"** button
3. The form loads with current campers displayed
4. **Add new campers**:
   - Select from dropdown
   - Click "Add"
5. **Remove campers**:
   - Click the "×" button next to any camper
6. Click **"Update Group"**

Result: 
- Newly added campers are assigned to this family group
- Removed campers keep their old `familyGroupId` (they need to be reassigned manually to another group)

## Technical Implementation

### Data Flow

#### Creating a Family Group
```javascript
formData.camperIds = ['camper-001', 'camper-002', 'camper-003']

↓ On save:

for each camperId in formData.camperIds:
  updateCamper({ ...camper, familyGroupId: newGroupId })
```

#### Editing a Family Group
```javascript
currentCamperIds = ['camper-001', 'camper-002']
formData.camperIds = ['camper-002', 'camper-003', 'camper-004']

↓ Calculate changes:

campersToAdd = ['camper-003', 'camper-004']
campersToRemove = ['camper-001']

↓ Apply:

for camperId in campersToAdd:
  updateCamper({ ...camper, familyGroupId: groupId })

// Removed campers keep their current familyGroupId
// User must reassign them manually
```

### State Management

**Form Data:**
```typescript
formData: {
  name: string;
  description: string;
  sleepingRoomId: string;
  staffMemberIds: string[];
  camperIds: string[];  // New field
  color: string;
}
```

**Helper Methods:**
- `getCamperFullName(camperId)`: Get camper's full name
- `getCamperInitials(camperId)`: Get initials for avatar
- `addCamper()`: Add selected camper to the list
- `removeCamper(camperId)`: Remove camper from the list

**Computed Properties:**
- `availableCampers`: Filters out campers already in `formData.camperIds`

### Camper Assignment Logic

When saving a family group:

1. **Create Mode**:
   - Create the family group
   - Assign all `formData.camperIds` to the new group

2. **Edit Mode**:
   - Update the family group
   - Compare current vs. new camper lists
   - Add new campers to the group
   - Note: Removed campers stay in their current group until manually reassigned

## User Benefits

### 1. Intuitive Group Organization
- See all group members in one place
- Add/remove members while configuring the group
- Visual representation with avatars

### 2. Flexibility
- Two ways to assign campers (camper-centric or group-centric)
- Choose the workflow that fits the task

### 3. Batch Operations
- Add multiple campers to a new group during creation
- Reorganize groups by adding/removing multiple campers at once

### 4. Visual Feedback
- Immediate confirmation of group membership
- Easy to spot which campers are assigned
- Clear action buttons

## Important Notes

### Removed Campers
⚠️ **Important**: When you remove a camper from a family group:
- The camper's `familyGroupId` is **not** automatically updated
- The camper will still show as belonging to the old group until reassigned
- You must manually assign the camper to another family group

**Why?** This prevents campers from being left without a family group assignment, as every camper requires a family group.

### Alternative: Reassignment
To properly move a camper to another group:
1. Edit the **new** family group and add the camper, OR
2. Edit the **camper** directly and change their family group

## Use Cases

### Organizing New Campers
**Scenario**: Registration day, multiple new campers arriving

**Workflow**:
1. Create family groups for each cabin
2. As campers check in, go to Family Groups
3. Edit the appropriate group
4. Add each camper to their assigned group
5. Save and repeat

### Rebalancing Groups
**Scenario**: Need to move campers between groups for better distribution

**Workflow**:
1. Go to Family Groups
2. Edit the target group
3. Add campers who should move to this group
4. Save
5. Go to Campers view to verify changes

### Setting Up for a New Session
**Scenario**: Planning a new camp session with predetermined group assignments

**Workflow**:
1. Create all family groups with names and rooms
2. For each group:
   - Edit the group
   - Add all assigned campers at once
   - Assign staff members
   - Choose a color
   - Save
3. Review in Sleeping Rooms view

## UI Components

### Selected Camper Item

```html
<div class="selected-camper-item">
  <div class="camper-info-sm">
    <div class="camper-avatar-xs">JD</div>
    <span>John Doe</span>
  </div>
  <button class="btn-remove">×</button>
</div>
```

### Add Camper Section

```html
<div class="add-camper-section">
  <select v-model="selectedCamperToAdd">
    <option value="">Add a camper...</option>
    <option value="camper-001">John Doe (Age 12)</option>
  </select>
  <button @click="addCamper">Add</button>
</div>
```

## Styling

- **Camper List**: Bordered container with light background
- **Hover Effects**: Subtle background change on item hover
- **Remove Button**: Scales up on hover for better UX
- **Scrollable**: Overflow handling for many campers
- **Responsive**: Works on all screen sizes

## Related Features

- **Campers View** (`/campers`): Alternative way to assign family groups
- **Sleeping Rooms View** (`/sleeping-rooms`): View group assignments by room
- **Family Groups View** (`/family-groups`): Main interface for group management

## Best Practices

1. **Plan Ahead**: Create family groups before adding campers for bulk operations
2. **Use Batch Add**: Add multiple campers when creating a new group
3. **Verify Assignments**: Check Sleeping Rooms view to see group distribution
4. **Reorganize Carefully**: Remember removed campers need to be reassigned
5. **Color Code**: Use colors to quickly identify groups

## Future Enhancements

Potential improvements:
- **Drag and Drop**: Drag campers between groups
- **Bulk Operations**: Select multiple campers to add at once
- **Smart Suggestions**: Suggest campers based on age, gender, etc.
- **Reassignment on Remove**: Automatically prompt for new group when removing
- **Capacity Warnings**: Alert when group size exceeds room capacity
- **Conflict Detection**: Warn about age/gender imbalances

---

**Version**: 1.0.0  
**Date**: 2025-10-10  
**Status**: ✅ Implemented and tested

