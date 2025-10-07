# Summer Camp Manager - Quick Reference Card

## 🚀 Essential Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📂 Key Files

```
src/
├── App.vue                    # Root component
├── main.ts                    # Entry point
├── components/Header.vue      # Navigation
├── views/
│   ├── Dashboard.vue          # Main overview
│   ├── Calendar.vue           # Event calendar (drag-drop)
│   ├── Children.vue           # Children management
│   ├── TeamMembers.vue        # Staff management
│   └── Rooms.vue              # Room management
├── stores/campStore.ts        # State management (Pinia)
├── services/
│   ├── storage.ts             # Local storage operations
│   └── conflicts.ts           # Conflict detection
└── types/api.ts               # TypeScript types
```

## 🎯 Quick Actions

### View Data
```typescript
import { useCampStore } from '@/stores/campStore'
const store = useCampStore()

store.children          // All children
store.events            // All events
store.teamMembers       // All team members
store.rooms             // All rooms
store.conflicts         // Current conflicts
```

### Create/Update/Delete
```typescript
// Children
await store.addChild(child)
await store.updateChild(child)
await store.deleteChild(id)

// Events
await store.addEvent(event)
await store.updateEvent(event)
await store.deleteEvent(id)

// Enrollment
await store.enrollChild(eventId, childId)
await store.unenrollChild(eventId, childId)
await store.moveChild(fromEventId, toEventId, childId)
```

### Query Data
```typescript
// Get by ID
store.getChildById(id)
store.getEventById(id)
store.getTeamMemberById(id)
store.getRoomById(id)

// Filter
store.eventsForDate(date)
store.childEvents(childId)
store.staffEvents(staffId)
store.roomEvents(roomId)
```

## 🎨 UI Components

### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-error">Error</button>
<button class="btn btn-sm">Small</button>
```

### Badges
```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```

### Forms
```html
<div class="form-group">
  <label class="form-label">Label</label>
  <input type="text" class="form-input" />
</div>

<select class="form-select">...</select>
<textarea class="form-textarea">...</textarea>
```

### Layout
```html
<div class="container">
  <div class="card">
    <div class="card-header">Header</div>
    Body content
  </div>
</div>

<div class="grid grid-cols-2">...</div>
<div class="flex items-center gap-2">...</div>
```

## 🎭 CSS Variables

```css
/* Colors */
--primary-color: #2196F3
--success-color: #4CAF50
--warning-color: #FFC107
--error-color: #F44336
--background: #F5F7FA
--surface: #FFFFFF
--text-primary: #212121
--text-secondary: #757575

/* Spacing */
--radius: 8px
--shadow: 0 2px 4px rgba(0,0,0,0.1)
```

## 🔍 Conflict Types

```typescript
type ConflictType = 
  | 'room_overcapacity'      // Room can't fit all
  | 'event_overcapacity'     // Event is full
  | 'child_double_booked'    // Child in 2 places
  | 'staff_double_booked'    // Staff in 2 places
  | 'missing_certification'  // Staff lacks cert
```

## 📅 Date Formatting

```typescript
import { format } from 'date-fns'

format(date, 'MMM d, yyyy')      // Oct 7, 2025
format(date, 'h:mm a')           // 2:30 PM
format(date, 'EEEE')             // Tuesday
```

## 🗺️ Routes

```
/              Dashboard
/calendar      Event calendar
/children      Children list
/team          Team members
/rooms         Rooms
```

## 🎪 Event Types

```typescript
type EventType = 
  | 'activity'      // General activities
  | 'sports'        // Sports events
  | 'arts'          // Arts & crafts
  | 'education'     // Learning
  | 'meal'          // Meals
  | 'free-time'     // Unstructured time
```

## 👥 Team Roles

```typescript
type Role = 
  | 'counselor'     // Direct supervision
  | 'supervisor'    // Section oversight
  | 'director'      // Overall management
  | 'nurse'         // Medical support
  | 'instructor'    // Specialized teaching
```

## 🏠 Room Types

```typescript
type RoomType = 
  | 'classroom'     // Traditional learning
  | 'activity'      // Multi-purpose
  | 'sports'        // Athletic facilities
  | 'dining'        // Food service
  | 'outdoor'       // Open-air
  | 'arts'          // Creative studios
```

## 🛠️ Utility Functions

```typescript
import { 
  formatDate,
  formatTime,
  getInitials,
  calculatePercentage,
  sortEventsByTime,
  debounce,
  isValidEmail
} from '@/utils/helpers'
```

## 🔥 Hot Tips

1. **Drag & Drop**: Hold and drag children to events
2. **Quick View**: Click any card for details
3. **Conflicts**: Check dashboard regularly
4. **Capacity**: Watch the progress bars
5. **Search**: Use Ctrl+F in browser for now
6. **Refresh**: F5 if something looks wrong
7. **Reset Data**: Clear local storage to restart

## 📊 Local Storage Keys

```javascript
camp_children        // Children data
camp_team_members    // Staff data
camp_rooms          // Room data
camp_events         // Event data
```

## 🐛 Debug Tips

```javascript
// In browser console:
localStorage.getItem('camp_children')  // View children
localStorage.clear()                   // Reset all data

// Check store
const store = window.__store  // If exposed
console.log(store.conflicts)
```

## 🎯 Common Patterns

### Modal
```vue
<Teleport to="body">
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">...</div>
      <div class="modal-body">...</div>
      <div class="modal-footer">...</div>
    </div>
  </div>
</Teleport>
```

### Drag and Drop
```vue
<div
  draggable="true"
  @dragstart="onDragStart($event, item.id)"
  @dragend="onDragEnd"
>Item</div>

<div
  @drop="onDrop($event)"
  @dragover.prevent
  @dragleave="onDragLeave"
>Drop Zone</div>
```

## 📖 Documentation Index

```
README.md              Overview & setup
GETTING_STARTED.md     First-time users
USAGE_GUIDE.md         End-user manual
DEVELOPER_GUIDE.md     Technical reference
CONTRIBUTING.md        How to contribute
ROADMAP.md            Future plans
PROJECT_SUMMARY.md     High-level overview
QUICK_REFERENCE.md     This file
```

## 🆘 Emergency Commands

```bash
# Server won't start
rm -rf node_modules package-lock.json
npm install

# Build fails
npm run build -- --debug

# Port in use
lsof -ti:5173 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5173   # Windows

# Reset everything
rm -rf node_modules dist
npm install
npm run dev
```

## 🔗 Useful Links

- **Vue 3**: https://vuejs.org/
- **TypeScript**: https://typescriptlang.org/
- **Vite**: https://vitejs.dev/
- **Pinia**: https://pinia.vuejs.org/
- **date-fns**: https://date-fns.org/

## 💡 Pro Tips

1. Use TypeScript autocomplete (Ctrl+Space)
2. Check Vue DevTools for debugging
3. Read the OpenAPI schema for data structure
4. Use computed properties for derived state
5. Keep components under 300 lines
6. Test drag-drop on touch devices
7. Check conflicts before major changes
8. Use Git for version control
9. Document new features
10. Write tests (coming soon!)

---

**Version**: 0.0.1  
**Last Updated**: October 2025  

**Keep this handy!** Bookmark or print for quick reference. 🔖

