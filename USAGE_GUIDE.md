# Summer Camp Manager - Usage Guide

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

The application will automatically load with sample data including children, staff, rooms, and events.

## Main Features

### 1. Dashboard (`/`)

The dashboard provides an overview of your camp operations:

- **Statistics Cards**: Quick view of total children, staff members, rooms, and today's events
- **Conflicts Alert**: Shows any scheduling conflicts that need attention
- **Today's Schedule**: Timeline view of all events happening today
- **Quick Actions**: Fast navigation to key sections
- **Recent Enrollments**: Latest children registered
- **Room Capacity**: Visual indicators of room usage

**Tips**:
- Check the conflicts section regularly to ensure smooth operations
- Use the dashboard as your starting point each day

### 2. Calendar View (`/calendar`)

The calendar is the heart of the application where you manage events and enrollments.

#### Creating Events

1. Click the **"+ New Event"** button
2. Fill in event details:
   - Title (e.g., "Arts & Crafts")
   - Start and end times
   - Select a room
   - Set capacity (max number of children)
   - Choose event type (Activity, Sports, Arts, Education, Meal, Free Time)
   - Pick a color for visual identification
3. Click **"Create Event"**

#### Managing Enrollments (Drag & Drop)

**Method 1: Enroll from Children List**
1. Find a child in the right sidebar
2. Click and drag the child's card
3. Drop it onto an event in the calendar
4. The system will automatically check for conflicts

**Method 2: Move Between Events**
1. Click on an event to open details
2. In the modal, you'll see enrolled campers
3. Drag a child from the enrolled list
4. Drop them onto another event in the calendar

**Method 3: Manual Enrollment**
1. Click on an event to open details
2. Drag a child from the sidebar
3. Drop into the "Enrolled Children" area
4. Or use the "Remove" button to unenroll

#### Conflict Prevention

The system automatically prevents:
- Enrolling a child in overlapping events
- Exceeding event capacity
- Room double-booking with capacity issues

You'll see an error message if you try to create a conflict.

#### Navigation

- Use **Previous Day** / **Next Day** buttons to browse dates
- Click **Today** to jump to the current date
- Click any event to see full details and manage enrollment

### 3. Campers Management (`/campers`)

Manage all registered children in your camp.

#### Adding a Child

1. Click **"+ Add Child"**
2. Fill in the form:
   - First and last name
   - Age (5-18)
   - Parent contact (email or phone)
   - Allergies (comma-separated, e.g., "Peanuts, Dairy")
   - Medical notes (special instructions)
3. Click **"Add Child"**

#### Viewing Child Details

1. Click on any child card
2. View their information including:
   - Basic details
   - Allergies and medical notes
   - Registration date
   - All enrolled events

#### Editing a Child

1. Click on a child to open details
2. Click **"Edit"**
3. Modify information
4. Click **"Update Child"**

#### Deleting a Child

1. Click on a child to open details
2. Click **"Delete Child"**
3. Confirm deletion
4. The child will be removed from all events automatically

**Important**: Children with allergies are marked with a warning badge. Always check medical notes before event assignment.

### 4. Staff Management (`/staff`)

Manage your camp staff and their assignments.

#### Adding Staff Members

1. Click **"+ Add Staff Member"**
2. Fill in details:
   - First and last name
   - Role (Counselor, Supervisor, Director, Nurse, Instructor)
   - Email and phone
   - Certifications (comma-separated, e.g., "CPR, First Aid, Swimming")
3. Click **"Add Member"**

#### Role Types

- **Director**: Overall camp management (Purple)
- **Supervisor**: Section oversight (Blue)
- **Counselor**: Direct child supervision (Green)
- **Nurse**: Medical support (Red)
- **Instructor**: Specialized activities (Orange)

#### Certifications

Track important certifications like:
- CPR
- First Aid
- Swimming
- Sports Coaching
- Art Education
- Child Safety

The system can require specific certifications for events and will alert you if they're missing.

#### Viewing Staff Schedule

1. Click on a staff member
2. See all assigned events
3. Check for scheduling conflicts

### 5. Room Management (`/rooms`)

Organize your physical spaces and track their usage.

#### Adding Rooms

1. Click **"+ Add Room"**
2. Enter details:
   - Room name
   - Type (Classroom, Activity, Sports, Dining, Outdoor, Arts)
   - Capacity (maximum occupancy)
   - Location (building/area)
   - Equipment (comma-separated)
   - Notes (special instructions)
3. Click **"Add Room"**

#### Room Types & Icons

- 📚 **Classroom**: Traditional learning spaces
- 🎯 **Activity**: Multi-purpose activity rooms
- ⚽ **Sports**: Athletic facilities
- 🍽️ **Dining**: Cafeteria/dining halls
- 🌳 **Outdoor**: Open-air spaces
- 🎨 **Arts**: Creative studios

#### Capacity Monitoring

Each room card shows:
- Current usage percentage
- Color-coded indicator:
  - Green: Under 80% usage
  - Red: Over 80% usage

#### Viewing Room Schedule

1. Click on a room
2. See all scheduled events
3. Check capacity and conflicts

## Best Practices

### Daily Workflow

1. **Morning**: Check dashboard for today's schedule and conflicts
2. **Review conflicts**: Address any scheduling issues
3. **Check-in**: Review room capacities and staff assignments
4. **Adjustments**: Use drag-and-drop to move children if needed
5. **End of day**: Preview tomorrow's schedule

### Avoiding Conflicts

1. **Check capacity** before creating events
2. **Review child schedules** before enrollment
3. **Monitor staff availability** for overlapping events
4. **Verify certifications** for specialized activities
5. **Plan ahead** to avoid last-minute changes

### Organizing Events

1. **Use color coding** for easy visual identification:
   - Activities: Green
   - Sports: Blue
   - Arts: Orange
   - Education: Light Green
   - Meals: Brown
   - Free Time: Purple

2. **Set realistic capacities** based on:
   - Room size
   - Staff-to-child ratios
   - Activity requirements

3. **Block schedule** common events:
   - Morning assembly
   - Meal times
   - Rest periods

### Managing Special Needs

1. **Track allergies** in child profiles
2. **Add medical notes** for special requirements
3. **Assign appropriate staff** with necessary certifications
4. **Monitor capacity** for activities with special equipment

## Data Management

### Current Storage

All data is stored in your browser's local storage. This means:
- ✅ Fast access
- ✅ Works offline
- ✅ No server required
- ⚠️ Data is browser-specific
- ⚠️ Clearing browser data will reset the app

### Resetting Data

To reset to the original sample data:
1. Open browser developer tools (F12)
2. Go to Application/Storage → Local Storage
3. Delete all items starting with `camp_`
4. Refresh the page

### Backup (Manual)

1. Open browser developer tools (F12)
2. Go to Application/Storage → Local Storage
3. Copy the values for:
   - `camp_campers`
   - `camp_staff_members`
   - `camp_rooms`
   - `camp_events`
4. Save them in a text file

## Keyboard Shortcuts

While the current version doesn't have keyboard shortcuts, here are recommended workflows:

- Use **Tab** to navigate between form fields
- **Enter** submits forms
- **Escape** closes modals (in future versions)
- Click outside modals to close them

## Troubleshooting

### Events Not Showing

**Problem**: Events don't appear on the calendar  
**Solution**: 
- Check that you're viewing the correct date
- Verify events are created for the selected day
- Refresh the page if data seems stale

### Drag and Drop Not Working

**Problem**: Can't drag children to events  
**Solution**:
- Make sure you're clicking and holding on the child card
- Check that the event isn't at full capacity
- Verify no time conflicts exist

### Conflict Warnings

**Problem**: Getting unexpected conflict warnings  
**Solution**:
- Check the dashboard for details on conflicts
- Review overlapping event times
- Verify room capacities
- Check staff assignments

### Performance Issues

**Problem**: App feels slow with lots of data  
**Solution**:
- The mock data includes 8 children and 7 events
- Current version should handle 50+ children easily
- For larger operations, wait for the backend version

## Sample Data

The application comes with pre-populated sample data:

**8 Children**:
- Emma Johnson (8), Liam Smith (10), Olivia Williams (9)
- Noah Brown (7), Ava Davis (11), Ethan Miller (8)
- Sophia Wilson (9), Mason Moore (10)

**6 Staff Members**:
- Sarah Anderson (Director)
- Michael Taylor (Counselor)
- Jessica Thomas (Counselor with Swimming cert)
- David Martinez (Instructor - Art)
- Emily Garcia (Nurse)
- James Rodriguez (Instructor - Sports)

**7 Rooms**:
- Main Hall (30 capacity)
- Art Studio (15)
- Sports Field (25)
- Swimming Pool (20)
- Classroom A (20)
- Dining Hall (50)
- Outdoor Plaza (40)

**Sample Events** (Today's schedule):
- 9:00 AM - Morning Assembly
- 10:00 AM - Arts & Crafts / Soccer Practice
- 12:00 PM - Lunch
- 2:00 PM - Swimming / Nature Education
- 4:00 PM - Free Play

## Next Steps

This is the **frontend-only prototype** with mock data. The next phase will include:

1. **Backend Development**:
   - RESTful API (Node.js/TypeScript or Go)
   - PostgreSQL database
   - User authentication

2. **Additional Features**:
   - Multi-week planning
   - Attendance tracking
   - Parent portal
   - Reports and exports
   - Email notifications

3. **Enhancements**:
   - Batch operations
   - Templates for recurring events
   - Mobile app
   - Real-time collaboration

## Support

For questions or feature requests:
- Open a GitHub issue
- Contact the development team
- Check the README.md for technical details

---

**Version**: 0.0.1 (Frontend Prototype)  
**Last Updated**: October 2025

