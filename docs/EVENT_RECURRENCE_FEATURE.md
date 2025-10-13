# Event Recurrence Feature

## Overview

The Event Recurrence feature allows you to create repeating events in the camp calendar, similar to Google Calendar. This is useful for activities that occur regularly (e.g., daily swimming classes, weekly team meetings, monthly campfire events).

## Features

### Recurrence Options

1. **Frequency Selection**
   - Daily: Repeat every X days
   - Weekly: Repeat every X weeks on selected days
   - Monthly: Repeat every X months

2. **Day Selection (Weekly Only)**
   - Choose specific days of the week for the event to repeat
   - Visual day selector with S, M, T, W, T, F, S buttons (circular, clickable)
   - Select multiple days to create events on specific weekdays (e.g., Mon/Wed/Fri or Sun/Tue/Thu)
   - The event date's day is automatically pre-selected when you switch to weekly mode

3. **End Conditions**
   - **Never**: Event continues indefinitely (up to 365 occurrences for safety)
   - **On Date**: Specify an end date
   - **After X Occurrences**: Specify number of times to repeat

## User Interface

The recurrence UI appears in the Event Form Modal when creating a new event (not when editing existing events). The interface includes:

- **Checkbox**: Enable/disable recurrence
- **Interval Controls**: Up/down arrows to adjust repeat interval
- **Frequency Dropdown**: Select day/week/month
- **Day Buttons**: For weekly recurrence, select specific days
- **End Options**: Radio buttons for Never/On/After
- **Summary**: Real-time preview of the recurrence rule

## How to Use

### Creating a Recurring Event

1. Click "+ New Event" in the Calendar view
2. Fill in the event details (title, time, room, etc.)
3. Check the "Repeat Event" checkbox
4. Configure recurrence settings:
   - Set how often it repeats (interval and frequency)
   - For weekly: select which days
   - Set when it ends
5. Review the summary
6. Click "Create Event"

### Examples

#### Daily Swimming Class
- **Repeat every**: 1 day
- **Ends**: After 30 occurrences

#### Weekly Team Meeting (Mondays and Wednesdays)
- **Repeat every**: 1 week
- **Repeat on**: M, W (select both days)
- **Ends**: On 2025-12-31

#### Activity on Specific Days (Sunday, Tuesday, Thursday)
- **Repeat every**: 1 week
- **Repeat on**: S, T, Th (select these three days)
- **Ends**: After 20 occurrences

#### Monthly Campfire
- **Repeat every**: 1 month
- **Ends**: Never

## Technical Details

### Data Structure

Events created as part of a recurrence series include:
- `recurrenceId`: Unique identifier linking all events in the series
- `isRecurrenceParent`: Boolean indicating the first event (parent) of the series

### Implementation

1. **Recurrence Utility** (`src/utils/recurrence.ts`)
   - Generates dates based on recurrence rules
   - Validates recurrence configurations
   - Formats human-readable summaries

2. **Event Form Modal** (`src/components/modals/EventFormModal.vue`)
   - UI for configuring recurrence
   - Validation of recurrence settings
   - Passes recurrence data to parent component

3. **Calendar View** (`src/views/Calendar.vue`)
   - Handles creation of all event instances
   - Automatically enrolls camper groups for all instances
   - Provides feedback on creation success

### Limitations

- Maximum 365 occurrences as a safety limit
- Recurrence can only be set when creating new events
- Each instance is a separate event (editing one doesn't affect others)
- Weekly recurrence requires at least one day selected

## Future Enhancements

Potential improvements for the feature:

1. **Edit All Instances**: Allow editing all events in a recurrence series at once
2. **Delete Series**: Option to delete entire recurrence series
3. **Exception Dates**: Skip specific dates in the recurrence
4. **Custom Recurrence**: More advanced patterns (e.g., first Monday of each month)
5. **Visual Indicators**: Show recurring events with special icons in calendar views

## Styling

The recurrence UI follows the existing design system:
- Matches the camp manager's color scheme
- Responsive design for mobile devices
- Interactive elements with hover states
- Clear visual feedback for selections

## Testing

To test the recurrence feature:

1. Create a daily recurring event
2. Create a weekly recurring event with multiple days selected
3. Create a monthly recurring event
4. Test different end conditions (never, on date, after X times)
5. Verify events appear correctly in all calendar views
6. Check that camper group enrollment works for all instances

## Support

For issues or questions about the recurrence feature, refer to the project documentation or contact the development team.

