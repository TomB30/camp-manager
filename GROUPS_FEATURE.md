# Camper Groups - Backoffice Feature

## Overview

The Camper Groups feature is a powerful backoffice tool that allows camp managers to create virtual groups of campers based on flexible criteria. These groups can then be used to quickly assign multiple campers to events, saving time and effort.

## Features

### 1. **Create Virtual Groups**
Create dynamic groups that automatically include campers matching specific criteria:

- **Age Range**: Filter by minimum and/or maximum age (e.g., 8-11 years old)
- **Gender**: Filter by male or female campers
- **Sleeping Rooms (Cabins)**: Include campers from specific cabins
- **Allergies**: Filter by campers with or without allergies
- **Color Coding**: Assign colors to groups for visual identification

### 2. **Dynamic Group Membership**
Groups are dynamic - if you add a new camper that matches a group's criteria, they automatically become part of that group. No manual updates needed!

### 3. **Quick Event Assignment**
From the Calendar view, you can now:
- Assign an entire group to an event with one click
- See how many campers will be enrolled before confirming
- Get feedback on any conflicts (e.g., campers already enrolled or event at capacity)

## How to Use

### Creating a Group

1. Navigate to **Groups** in the sidebar
2. Click **"+ Create Group"**
3. Fill in the group details:
   - **Name**: Give your group a descriptive name (e.g., "Junior Campers", "Cabin 1 Swimmers")
   - **Description**: Optional description
   - **Color**: Pick a color for visual identification
4. Set your filter criteria:
   - **Age Range**: Set minimum and/or maximum age
   - **Gender**: Select male, female, or any
   - **Sleeping Rooms**: Check one or more cabins
   - **Allergies**: Filter for campers with or without allergies
5. See the preview count of matching campers at the bottom
6. Click **"Create Group"**

### Viewing Group Details

1. Click on any group card in the Groups view
2. See:
   - Filter criteria applied
   - Full list of matching campers
   - Metadata (created date, last updated)
3. Edit or delete the group as needed

### Assigning Groups to Events

1. Go to **Calendar** view
2. Click on an event to view details
3. In the **"Quick Assign Camper Group"** section at the top:
   - Select a group from the dropdown
   - See how many campers are in that group
   - Click **"Assign"**
4. Review the results:
   - Success message if all campers were enrolled
   - Conflict details if some couldn't be enrolled (e.g., already enrolled, event full, time conflicts)

## Example Use Cases

### Example 1: Age-Based Activity Groups
**Scenario**: You want to create separate swimming groups for different age ranges.

**Solution**:
- Create "Junior Swimmers" group (ages 6-9)
- Create "Intermediate Swimmers" group (ages 10-13)
- Create "Senior Swimmers" group (ages 14+)
- Assign each group to their appropriate swimming session

### Example 2: Cabin-Based Activities
**Scenario**: You want to assign all campers from Cabin 1 and Cabin 2 to a special bonfire event.

**Solution**:
- Create "Cabins 1-2 Group"
- Select both cabins in the filter
- Assign the group to the bonfire event

### Example 3: Allergy-Aware Meal Planning
**Scenario**: You need to seat campers with allergies at specific tables during meals.

**Solution**:
- Create "Campers with Allergies" group
- Set filter: Has Allergies = Yes
- Assign this group to a special meal event with allergy-friendly menu

### Example 4: Gender-Specific Activities
**Scenario**: You're running gender-specific sports activities.

**Solution**:
- Create "Boys Sports" group (Gender = Male, Age 10-14)
- Create "Girls Sports" group (Gender = Female, Age 10-14)
- Assign each to their respective sports events

## Technical Details

### Data Structure

**CamperGroup**:
```typescript
{
  id: string;
  name: string;
  description?: string;
  color?: string;
  filters: {
    ageMin?: number;
    ageMax?: number;
    gender?: 'male' | 'female';
    sleepingRoomIds?: string[];
    hasAllergies?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Storage
- Groups are stored in localStorage under the key `camp_camper_groups`
- They persist across browser sessions
- Can be backed up and restored with other camp data

### API Integration
The groups feature is fully integrated with:
- **Store Management**: `campStore.ts` includes all group CRUD operations
- **Storage Service**: `storage.ts` handles persistence
- **Event Enrollment**: Groups can be enrolled in events with conflict detection
- **Calendar View**: UI integration for quick assignment

## Benefits

1. **Time Savings**: Assign dozens of campers to events in seconds instead of one-by-one
2. **Flexibility**: Create as many groups as needed with different criteria combinations
3. **Dynamic Updates**: Groups automatically update when campers are added/modified
4. **Conflict Management**: Automatic detection of scheduling conflicts when assigning groups
5. **Organization**: Better organization and categorization of campers
6. **Reusability**: Create groups once, use them throughout the camp session

## Tips

- Use descriptive names for groups so they're easy to identify
- Combine multiple criteria for precise targeting (e.g., "Boys ages 8-10 from Cabin 1")
- Create broad groups (e.g., "All Juniors") for recurring activities
- Use colors consistently for related groups
- Preview the camper count before creating to ensure your filters are correct
- Groups are read-only in terms of membership - to change who's in a group, adjust the filters

## Future Enhancements

Potential additions to consider:
- Export group lists to CSV
- Group templates for common configurations
- Historical tracking of group enrollments
- Email notifications to parents of campers in a group
- Group-based reporting and analytics

