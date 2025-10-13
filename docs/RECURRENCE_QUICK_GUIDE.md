# Event Recurrence - Quick Guide

## How to Create Events on Specific Days

### Example: Swimming Lessons every Sunday, Tuesday, and Thursday

**Step-by-Step:**

1. Click **"+ New Event"** in the Calendar
2. Fill in event details:
   - Title: "Swimming Lessons"
   - Date: Select any date (e.g., a Tuesday)
   - Time: 2:00 PM - 3:00 PM
   - Room: Select pool/location
   - Other details as needed

3. Check **"Repeat Event"** checkbox

4. Configure recurrence:
   - **Repeat every**: 1
   - **Frequency**: Select "week" from dropdown
   - **Repeat on**: Click the day buttons you want:
     - Click **S** (Sunday) - button turns blue
     - Click **T** (Tuesday) - button turns blue  
     - Click **Th** (Thursday) - button turns blue
   - **Ends**: Choose your preference:
     - "Never" for ongoing
     - "On" and pick end date
     - "After" and set number (e.g., 30 occurrences)

5. Review the summary that appears at the bottom
   - Example: "Weekly on Sun, Tue, Thu, 30 times"

6. Click **"Create Event"**

7. Success! The system creates all instances automatically

---

## Visual Guide

### Day Selector (appears when you select "weekly")

```
Repeat on:

 (S)  (M)  (T)  (W)  (T)  (F)  (S)
  ●         ●              ●

Blue/filled circles = selected days
White circles = not selected
```

### UI Components

- **Checkboxes**: Circular, filled when active
- **Number inputs**: Have up ▲ and down ▼ arrows
- **Day buttons**: Circular, turn blue when selected
- **Help text**: Appears below day selector with examples

---

## Common Patterns

### 1. Every Weekday (Mon-Fri)
- Frequency: weekly
- Days: M, T, W, Th, F

### 2. Weekend Only (Sat-Sun)
- Frequency: weekly  
- Days: S (Sunday), S (Saturday)

### 3. Every Other Day
- Frequency: daily
- Interval: 2

### 4. Twice a Week (Tue/Thu)
- Frequency: weekly
- Days: T, Th

### 5. Three Times a Week (Mon/Wed/Fri)
- Frequency: weekly
- Days: M, W, F

---

## Tips

✅ **Auto-selection**: When you switch to "weekly", the event's day is automatically selected
✅ **Multiple days**: Click multiple day buttons to select them all
✅ **Deselect**: Click a selected (blue) day button again to deselect it
✅ **Real-time summary**: Watch the summary update as you make changes
✅ **Validation**: The system won't let you create invalid patterns

---

## What Happens When You Click "Create Event"

1. System generates all dates based on your pattern
2. Creates individual events for each occurrence
3. Each event is separate (can be edited/deleted individually)
4. All events get the same settings (room, staff, capacity, etc.)
5. If you selected camper groups, they're enrolled in ALL instances
6. Success message shows how many events were created

---

## Example Results

**Pattern**: Every Sunday and Thursday, 4 times
**Start date**: January 7, 2025 (Tuesday)

**Events created**:
- January 9, 2025 (Thursday)
- January 12, 2025 (Sunday)
- January 16, 2025 (Thursday)
- January 19, 2025 (Sunday)

**Total**: 4 events created automatically!

---

## Need Help?

If you don't see the day selector:
1. Make sure you've checked "Repeat Event"
2. Make sure frequency is set to "week" (not "day" or "month")
3. The day buttons should appear below the frequency dropdown

The server is running at: http://localhost:5183/

