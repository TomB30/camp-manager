# Staff Availability Check - User Guide

## What's New?

When creating or editing events, the system now automatically checks if staff members are available at the selected time. This prevents accidentally double-booking staff members.

## How to Use

### Creating a New Event

1. **Navigate to Calendar**
   - Go to the Calendar view
   - Select the date you want to create an event

2. **Open Event Form**
   - Click the "+ New Event" button
   - Fill in the event details (title, time, room, etc.)

3. **Assign Staff Members**
   - Scroll to the "Assign Staff Members" section
   - You'll see a list of all available staff
   - Each staff member will show one of these indicators:

   **✓ John Smith - Camp Director**
   - Green checkmark means: Has all required certifications
   - Can be safely assigned

   **Sarah Jones - Assistant Director**
   - No indicator means: Available for assignment
   - Can be assigned

   **⚠️ Mike Johnson - Counselor (Already assigned to "Swimming Lessons" at 2:00 PM)**
   - Warning icon means: Already assigned to another event
   - Shows which event and what time
   - You can still assign them, but you'll see the conflict

4. **Understanding the Indicators**
   - At the bottom of the staff section, you'll see a legend:
     - ✓ = Has all required certifications
     - ⚠️ = Already assigned to another event at this time

### Editing an Event

1. **Open Existing Event**
   - Click on any event in the calendar
   - Click the "Edit" button in the event details modal

2. **Change Times (if needed)**
   - If you change the start or end time
   - Staff availability indicators will update automatically
   - You'll see if the new time creates conflicts

3. **Modify Staff Assignments**
   - The system won't flag the current event as a conflict
   - Only shows conflicts with OTHER events
   - Safe to re-save without making changes

## Example Scenarios

### Scenario 1: Staff is Available ✅

**Situation:**
- Creating "Arts & Crafts" from 2:00 PM to 3:00 PM
- Want to assign Sarah Jones
- Sarah Jones has no other assignments at that time

**What You'll See:**
```
Sarah Jones - Assistant Director
```

**Action:** Assign Sarah Jones - no conflicts!

---

### Scenario 2: Staff Has Conflict ⚠️

**Situation:**
- Creating "Outdoor Games" from 2:30 PM to 3:30 PM  
- Want to assign Mike Johnson
- Mike Johnson is already assigned to "Swimming Lessons" from 2:00 PM to 3:00 PM

**What You'll See:**
```
⚠️ Mike Johnson - Counselor (Already assigned to "Swimming Lessons" at 2:00 PM)
```

**Action:** You can:
- Choose a different staff member
- Change the event time to avoid the conflict
- Assign Mike anyway (system allows but warns you)

---

### Scenario 3: Staff Has Certifications ✓

**Situation:**
- Creating "Lifeguard Training" with required certification: "First Aid"
- Mike Johnson has the "First Aid" certification

**What You'll See:**
```
✓ Mike Johnson - Counselor
```

**Action:** Assign Mike - he has the required certification!

---

### Scenario 4: Multiple Issues ⚠️

**Situation:**
- Creating "Water Safety" requiring "Lifeguard" certification
- Want to assign Tom Brown
- Tom Brown is assigned to another event at the same time
- Tom Brown doesn't have the required certification

**What You'll See:**
```
⚠️ Tom Brown - Counselor (Already assigned to "Beach Activities" at 3:00 PM)
```

**Action:** Find a different staff member who:
- Has the required certification
- Is available at that time

## Tips for Best Results

### 1. Check Times First
- Set your event start and end times before assigning staff
- This ensures availability checks are accurate

### 2. Review Conflicts
- Always read the conflict messages
- They tell you exactly which event and what time

### 3. Use the Calendar
- Switch to different calendar views to see the full schedule
- This helps you understand why staff are unavailable

### 4. Plan Ahead
- Create a rough schedule first
- Then assign staff based on availability

### 5. Balance Workload
- Try not to assign the same staff to too many consecutive events
- Give staff breaks between events

## Common Questions

### Q: Can I still assign staff who have conflicts?
**A:** Yes! The system warns you but doesn't prevent the assignment. Use your judgment - sometimes overlapping assignments are intentional (e.g., event handoffs).

### Q: What if I see a conflict that seems wrong?
**A:** Check:
- The times of both events (they might overlap by just a few minutes)
- The date (make sure you're looking at the right day)
- If the other event still exists (someone might be creating it simultaneously)

### Q: Does this work for editing existing events?
**A:** Yes! When editing, the system:
- Excludes the current event from conflict checks
- Shows conflicts with all OTHER events
- Updates in real-time as you change times

### Q: What about events on different days?
**A:** Events on different days never conflict. The system only checks events on the same date.

### Q: Can I see all of a staff member's assignments?
**A:** Currently, you can:
- View the calendar to see all events
- Click on individual events to see assigned staff
- Use the Dashboard to see conflicts
- (Future enhancement: Staff schedule view)

## Visual Reference

### No Conflict - Safe to Assign
```
┌─────────────────────────────────────┐
│ Assign Staff Members (Optional)    │
├─────────────────────────────────────┤
│                                     │
│ [+] Sarah Jones - Assistant Director│
│                                     │
│ Selected:                           │
│ • John Smith - Camp Director        │
│ • Sarah Jones - Assistant Director  │
│                                     │
│ ✓ = Has required certifications     │
│ ⚠️ = Already assigned to another    │
│     event at this time              │
└─────────────────────────────────────┘
```

### With Conflict - Warning Shown
```
┌─────────────────────────────────────┐
│ Assign Staff Members (Optional)    │
├─────────────────────────────────────┤
│ Search:                             │
│ [⚠️ Mike Johnson - Counselor       ]│
│ [(Already assigned to "Swimming..." │
│ at 2:00 PM)                         │
│                                     │
│ ✓ = Has required certifications     │
│ ⚠️ = Already assigned to another    │
│     event at this time              │
└─────────────────────────────────────┘
```

## Related Features

- **Event Calendar**: View all events and staff assignments
- **Dashboard**: See all scheduling conflicts at a glance
- **Staff Management**: View staff certifications
- **Certifications**: Manage required certifications for events

## Need Help?

If you encounter issues:
1. Refresh the page (sometimes helps with stale data)
2. Check that event times are valid (end time after start time)
3. Verify staff members exist and are active
4. Look for any error messages in the toast notifications

---

**Feature Version:** 1.0  
**Last Updated:** October 13, 2025

