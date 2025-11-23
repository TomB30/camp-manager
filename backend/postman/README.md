# Events API - Postman Collection

This Postman collection provides comprehensive testing for the Camp Manager Events API, including recurring events functionality.

## 📦 Import Instructions

1. Open Postman
2. Click **Import** button (top left)
3. Select `Events_API.postman_collection.json`
4. The collection will appear in your Collections sidebar

## 🔧 Setup

### 1. Configure Environment Variables

After importing, you need to set up the following variables:

**Required:**
- `base_url`: Your API base URL (default: `http://localhost:8080`)
- `camp_id`: Your camp ID (get this after login or from existing data)

**Auto-populated (by tests):**
- `auth_token`: Automatically set after login
- `event_id`: Set after creating events
- `recurring_event_id`: Set after creating recurring events
- `recurrence_id`: Set after creating recurring series

**Optional (for advanced tests):**
- `activity_id`: For events based on activity templates
- `program_id`: For program-based events
- `location_id`: For events with locations
- `color_id`: For colored events
- `group_id_1`, `group_id_2`: For group-assigned events
- `certification_id`: For required staff certifications
- `staff_id`: For staff assignments

### 2. Get Your Camp ID

Run the **Authentication > Login** request first, then:

```bash
# Option 1: Use the demo camp from seeded data
# After login, check the response for available camps
# Set camp_id to the ID from the response

# Option 2: Query camps endpoint
GET {{base_url}}/api/v1/camps
```

## 📋 Request Categories

### 1. Authentication
- **Login**: Get authentication token (required first step)

### 2. Events - Basic CRUD
- **List Events**: Get all events with filtering, sorting, pagination
- **Create Single Event**: Create a one-time event
- **Create Event with Activity**: Create event from activity template
- **Get Event by ID**: Retrieve specific event
- **Update Event**: Modify event details
- **Delete Event**: Remove an event

### 3. Events - Recurring
- **Create Daily Recurring Event**: Daily recurrence with N occurrences
- **Create Weekly Recurring Event**: Weekly on specific days until end date
- **Create Monthly Recurring Event**: Monthly recurrence
- **Update Single Event in Series**: Modify one occurrence (breaks from series)
- **Update Future Events in Series**: Update this and future occurrences
- **Update All Events in Series**: Update entire series
- **Delete Single Event in Series**: Remove one occurrence
- **Delete Future Events in Series**: Remove this and future occurrences
- **Delete Entire Series**: Remove all occurrences

### 4. Events - Advanced
- **Create Event with Groups**: Assign events to specific groups
- **Create Event with Required Staff**: Define staff requirements
- **Filter Events by Date Range**: Query events in date range
- **Search Events by Name**: Text search with sorting

### 5. Activities & Programs - Cascade Delete
- **Delete Activity (Check Conflict)**: Returns 409 if events exist
- **Delete Activity (Force Cascade)**: Delete activity and all events
- **Delete Program (Check Conflict)**: Returns 409 if events exist
- **Delete Program (Force Cascade)**: Delete program, activities, and events

## 🎯 Typical Workflow

### Quick Start
1. Run **Authentication > Login**
2. Set `camp_id` in environment variables
3. Run **Create Single Event** to test basic functionality
4. Run **Get Event by ID** to verify

### Test Recurring Events
1. Run **Create Daily Recurring Event**
   - Creates 5 daily occurrences
   - Auto-saves `recurring_event_id` and `recurrence_id`
2. Run **Update Single Event in Series** to modify one occurrence
3. Run **Update All Events in Series** to modify entire series
4. Run **Delete Future Events in Series** to remove upcoming events

### Test Cascade Deletion
1. Create an activity (use Activities API)
2. Create events using that activity
3. Run **Delete Activity (Check Conflict)** → Expect 409 Conflict
4. Run **Delete Activity (Force Cascade)** → Deletes activity and events

## 🔍 Query Parameters

### Filtering
```
filterBy=name=@Meeting
filterBy=startDate>=2024-06-15T00:00:00Z
filterBy=endDate<=2024-06-30T23:59:59Z
```

**Operators:**
- `==` equals
- `!=` not equals
- `<=` less than or equal
- `>=` greater than or equal
- `=@` contains (text only)
- `!@` not contains (text only)
- `=^` starts with (text only)
- `=~` ends with (text only)

### Sorting
```
sortBy=startDate
sortOrder=desc
```

**Sort Fields:** `name`, `startDate`, `endDate`

### Pagination
```
limit=50
offset=0
```

### Update/Delete Scopes
```
updateScope=single|future|all
deleteScope=single|future|all
```

## 📊 Recurrence Rule Format

### Daily Recurrence
```json
{
  "frequency": "daily",
  "interval": 1,
  "endType": "after",
  "occurrences": 5
}
```

### Weekly Recurrence
```json
{
  "frequency": "weekly",
  "interval": 1,
  "daysOfWeek": [1, 3, 5],  // 0=Sunday, 6=Saturday
  "endType": "on",
  "endDate": "2024-12-31T23:59:59Z"
}
```

### Monthly Recurrence
```json
{
  "frequency": "monthly",
  "interval": 2,  // Every 2 months
  "endType": "never"
}
```

## 🧪 Testing Scenarios

### Scenario 1: Simple Event
1. Login
2. Create Single Event
3. Get Event by ID
4. Update Event
5. Delete Event

### Scenario 2: Recurring Series
1. Login
2. Create Weekly Recurring Event (10 weeks)
3. List Events (verify 10 created)
4. Update single occurrence → breaks from series
5. Update future occurrences → updates subset
6. Delete entire series

### Scenario 3: Activity-Based Events
1. Create Activity (via Activities API)
2. Create Event with Activity
3. Try Delete Activity → 409 Conflict
4. Force Delete Activity → Cascades to events

### Scenario 4: Complex Event
1. Create Event with Groups
2. Add Required Staff positions
3. Assign to Location
4. Set Capacity
5. Filter by date range
6. Update with different scope

## 🚨 Error Responses

- **400 Bad Request**: Invalid data (check request body)
- **401 Unauthorized**: Missing or invalid auth token
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Cannot delete (events exist, use force=true)
- **500 Internal Server Error**: Server issue

## 💡 Tips

1. **Auto-save IDs**: The Login and Create requests automatically save IDs to environment variables using test scripts
2. **Date Format**: Always use ISO 8601 format (`2024-06-15T10:00:00Z`)
3. **Scope Defaults**: Both `updateScope` and `deleteScope` default to `single`
4. **Force Delete**: Use `force=true` query parameter for cascade deletion
5. **Filtering**: Multiple `filterBy` parameters are AND-ed together
6. **Pagination**: Default limit is 50, adjust as needed

## 🔗 Related APIs

To fully test events functionality, you may need:
- **Activities API**: Create activity templates
- **Programs API**: Create programs
- **Locations API**: Create locations
- **Colors API**: Create color options
- **Groups API**: Create groups for assignment
- **Staff API**: Create staff members
- **Certifications API**: Create certification requirements

## 📝 Notes

- All requests use Bearer token authentication (set via Login)
- Dates are in UTC timezone
- Soft deletion is used (resources marked as deleted, not removed)
- Recurrence rules are stored only in parent events
- Breaking a single event from series clears its recurrence link

