# Getting Started with Summer Camp Manager

Welcome! This guide will help you get the Summer Camp Manager running on your machine in just a few minutes.

## ⚡ Quick Start (5 minutes)

### Step 1: Check Prerequisites

You need Node.js installed. Check by running:
```bash
node --version
```

You should see version 18 or higher (e.g., `v18.x.x` or `v20.x.x`).

**Don't have Node.js?** Download it from [nodejs.org](https://nodejs.org/)

### Step 2: Install Dependencies

Open your terminal in the project folder and run:
```bash
npm install
```

This will download all required packages (~80 packages, takes 30-60 seconds).

### Step 3: Start the Application

```bash
npm run dev
```

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Open Your Browser

Visit: **http://localhost:5173**

🎉 **That's it!** The app is now running with sample data.

---

## 🎮 First Steps in the App

### 1. Explore the Dashboard
- Look at the statistics (8 children, 6 team members, etc.)
- Check today's schedule
- Notice if there are any conflicts

### 2. Try the Calendar
1. Click **"Calendar"** in the navigation
2. You'll see today's events in a timeline view
3. On the right sidebar, you'll see all children

### 3. Drag and Drop (The Fun Part!)
1. Find a child in the right sidebar (e.g., "Emma Johnson")
2. Click and hold on the child's card
3. Drag it over to an event on the calendar
4. Drop it - the child is now enrolled!

**Try this:**
- Drag a child to an event that's already full → You'll get an error
- Drag a child who's already in another event at the same time → Conflict detected!

### 4. Create a New Event
1. Click **"+ New Event"** button
2. Fill in the form:
   - Title: "Music Class"
   - Start: 11:00 AM
   - End: 12:00 PM
   - Room: Select "Classroom A"
   - Capacity: 15
   - Type: Activity
3. Click **"Create Event"**
4. Your new event appears on the calendar!

### 5. View Children Details
1. Click **"Children"** in navigation
2. Click on any child card
3. See their allergies, medical notes, and enrolled events
4. Try clicking **"Edit"** to modify information

### 6. Explore Team & Rooms
- **Team**: View staff members, their roles, and certifications
- **Rooms**: See all facilities and their capacity usage

---

## 🎯 Sample Scenarios to Try

### Scenario 1: Schedule a Swimming Activity
1. Go to Calendar
2. Create a new event:
   - Title: "Swimming Lesson"
   - Time: 2:00 PM - 3:00 PM
   - Room: Swimming Pool
   - Capacity: 20
3. Drag 5-6 children to this event
4. Notice the capacity indicator updates

### Scenario 2: Test Conflict Detection
1. Find a child enrolled in an event at 10:00 AM
2. Try to drag them to another event at 10:30 AM
3. You'll get a conflict error - awesome! 🎉

### Scenario 3: Add Your First Child
1. Go to Children
2. Click "+ Add Child"
3. Fill in details (try adding an allergy)
4. Click "Add Child"
5. Now drag them into an event!

### Scenario 4: Check Room Capacity
1. Go to Rooms
2. Click on "Main Hall"
3. See all events scheduled there
4. Notice the capacity usage percentage

---

## 📖 What's in the Sample Data?

The app comes pre-loaded with:

### 8 Children
- Ages 7-11
- Some with allergies (peanuts, dairy, shellfish)
- Already enrolled in various events

### 6 Team Members
- Sarah Anderson (Director)
- Michael Taylor (Counselor)
- Jessica Thomas (Counselor with swimming cert)
- David Martinez (Art Instructor)
- Emily Garcia (Nurse)
- James Rodriguez (Sports Instructor)

### 7 Rooms
- Main Hall (30 capacity)
- Art Studio (15)
- Sports Field (25)
- Swimming Pool (20)
- Classroom A (20)
- Dining Hall (50)
- Outdoor Plaza (40)

### Today's Schedule
- 9:00 AM - Morning Assembly (everyone)
- 10:00 AM - Arts & Crafts (4 kids)
- 10:00 AM - Soccer Practice (4 kids)
- 12:00 PM - Lunch (everyone)
- 2:00 PM - Swimming (4 kids)
- 2:00 PM - Nature Education (4 kids)
- 4:00 PM - Free Play (everyone)

---

## 🔧 Common First-Time Issues

### Issue: "npm: command not found"
**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

### Issue: Port 5173 already in use
**Solution**: 
```bash
# Kill the process on port 5173
# On Mac/Linux:
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: "Cannot find module '@/stores/campStore'"
**Solution**: The `@` symbol is an alias for `src/`. This should work automatically. Try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Changes not showing up
**Solution**: 
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Or clear browser cache
3. Restart dev server

### Issue: "This site can't be reached"
**Solution**: Make sure the dev server is running (you should see "VITE ready" in terminal)

---

## 🎨 Understanding the Interface

### Color Coding
- **Blue**: Primary actions, sports events
- **Green**: Activities, success states
- **Orange**: Arts, warnings
- **Purple**: Free time, director role
- **Red**: Errors, nurse role
- **Brown**: Meals

### Icons
- 👶 Children
- 👥 Team Members
- 🏠 Rooms
- 📅 Events
- ⚠️ Conflicts
- 📍 Location
- 🎨 Arts
- ⚽ Sports
- 🍽️ Dining

### Badges
- **Blue badges**: Information (roles, room types)
- **Green badges**: Certifications, positive states
- **Yellow badges**: Warnings (allergies)
- **Red badges**: Errors, capacity full

---

## 🚀 Next Steps

Once you're comfortable with the basics:

1. **Read the Usage Guide**: `USAGE_GUIDE.md` for detailed features
2. **Explore the Code**: Check `DEVELOPER_GUIDE.md` if you want to understand how it works
3. **Try Advanced Features**: 
   - Create complex schedules
   - Test capacity limits
   - Add many children and events
4. **Provide Feedback**: What features do you need? What's confusing?

---

## 💾 Your Data

**Important to Know:**
- All data is stored in your browser's local storage
- It's specific to this browser and computer
- Clearing browser data will reset everything
- To start fresh, clear local storage (see below)

### How to Reset Data
1. Open browser DevTools (F12)
2. Go to Application → Local Storage → http://localhost:5173
3. Delete all items starting with `camp_`
4. Refresh the page

The sample data will reload automatically!

---

## 📱 Supported Browsers

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ IE11 (not supported)

---

## 🆘 Need Help?

### Quick Tips
1. **Check the dashboard first** - It shows conflicts and today's schedule
2. **Use drag-and-drop** - It's faster than manual enrollment
3. **Pay attention to capacity** - Red indicators mean "full"
4. **Check allergies** - Yellow badges on children indicate allergies

### Resources
- **Full Documentation**: See `README.md`
- **User Guide**: See `USAGE_GUIDE.md`
- **Developer Guide**: See `DEVELOPER_GUIDE.md`
- **Report Issues**: Open a GitHub issue

### Support Channels
- GitHub Issues: For bugs and feature requests
- Documentation: Check all `.md` files
- Code Comments: The code is well-commented

---

## ✅ Verification Checklist

Before you consider yourself "set up":

- [ ] Application loads without errors
- [ ] You can see the dashboard with statistics
- [ ] You can navigate to all pages (Calendar, Children, Team, Rooms)
- [ ] Drag-and-drop works (try moving a child)
- [ ] You can create a new event
- [ ] You can add a new child
- [ ] Conflicts are detected when appropriate
- [ ] You understand where data is stored (local storage)

---

## 🎓 Learning Path

**Beginner** (Day 1):
- Follow this getting started guide
- Explore all pages
- Try drag-and-drop
- Create 1-2 events

**Intermediate** (Day 2-3):
- Read USAGE_GUIDE.md
- Try all CRUD operations
- Test conflict scenarios
- Understand capacity management

**Advanced** (Week 1):
- Read DEVELOPER_GUIDE.md
- Understand the code structure
- Think about features you'd add
- Consider backend integration

---

## 🎉 You're Ready!

Congratulations! You now have a working summer camp management system.

**What makes this special:**
- ✨ Modern, beautiful UI
- 🚀 Fast and responsive
- 🎯 Intuitive drag-and-drop
- 🛡️ Conflict prevention
- 📊 Real-time updates
- 🎨 Professional design

**Remember**: This is a prototype. The real power comes when connected to a backend database with authentication, but you can already do a lot!

---

**Questions?** Check the other documentation files or open an issue!

**Enjoying it?** Star the project on GitHub! ⭐

**Want to contribute?** See `CONTRIBUTING.md`!

Happy camp managing! 🏕️ ☀️

