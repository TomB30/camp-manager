# Events API - Quick Start Guide

Get started testing the Events API in 5 minutes!

## 🚀 Setup (2 minutes)

### Step 1: Import to Postman
1. Open Postman
2. Click **Import** → Select both files:
   - `Events_API.postman_collection.json`
   - `Camp_Manager_Local.postman_environment.json`

### Step 2: Select Environment
1. In top-right corner, select **"Camp Manager - Local"** environment
2. Click the eye icon 👁️ to view/edit variables

### Step 3: Start Backend
```bash
cd backend
make docker-up    # Start PostgreSQL
make run          # Start backend server
```

## ✅ Test Basic Flow (3 minutes)

### 1. Login (Required First!)
📍 **Authentication > Login**

- Uses demo credentials: `admin@democamp.com` / `password123`
- Auto-saves `auth_token` to environment
- **Action**: Click **Send**

### 2. Set Camp ID
After login, you need a camp ID:

**Option A - From Database:**
```sql
-- Connect to your DB and get a camp ID
SELECT id, name FROM camps LIMIT 1;
```

**Option B - From Seeded Data:**
The demo data creates a camp. Check the backend logs or use:
```bash
# In backend terminal, look for "Demo Camp" ID in startup logs
```

**Action**: 
1. Copy the camp UUID
2. Click 👁️ next to environment name
3. Set `camp_id` value
4. Click **Save**

### 3. Create Your First Event
📍 **Events - Basic CRUD > Create Single Event**

**Action**: Click **Send**

✅ **Success!** You should see:
- Status: `201 Created`
- Response with event details
- `event_id` auto-saved to environment

### 4. List Events
📍 **Events - Basic CRUD > List Events**

**Action**: Click **Send**

✅ You should see your newly created event in the list

### 5. Get Specific Event
📍 **Events - Basic CRUD > Get Event by ID**

**Action**: Click **Send** (uses auto-saved `event_id`)

✅ Returns the event you just created

## 🔄 Test Recurring Events

### Create Daily Recurring Series
📍 **Events - Recurring > Create Daily Recurring Event**

**Action**: Click **Send**

✅ Creates 5 daily events, auto-saves IDs

### Verify Series Created
📍 **Events - Basic CRUD > List Events**

**Action**: Click **Send**

✅ You should now see 6 total events (1 single + 5 recurring)

### Update Single Occurrence
📍 **Events - Recurring > Update Single Event in Series**

**Action**: Click **Send**

✅ Modifies only one occurrence, breaks it from series

### Delete Entire Series
📍 **Events - Recurring > Delete Entire Series**

**Action**: Click **Send**

✅ Removes all recurring events

## 🎯 Common Use Cases

### Filter Events by Date
1. Go to **Events - Advanced > Filter Events by Date Range**
2. Modify dates in query params
3. Click **Send**

### Search Events
1. Go to **Events - Advanced > Search Events by Name**
2. Change `search` parameter value
3. Click **Send**

### Test Cascade Delete
1. Create an activity first (need Activities API)
2. Create event with that activity
3. Try **Delete Activity (Check Conflict)** → Get 409 error
4. Use **Delete Activity (Force Cascade)** → Deletes both

## 🐛 Troubleshooting

### "401 Unauthorized"
→ Run **Authentication > Login** again

### "404 Camp Not Found"
→ Set correct `camp_id` in environment variables

### "Invalid Date"
→ Use ISO 8601 format: `2024-06-15T10:00:00Z`

### "Variable not set"
→ Check environment is selected (top-right dropdown)

## 📚 What's Next?

### Explore Advanced Features
- ✅ Create events with group assignments
- ✅ Add required staff with certifications
- ✅ Test weekly/monthly recurrence patterns
- ✅ Try update scopes (single/future/all)
- ✅ Test cascade deletion with programs

### Read Full Documentation
- See `README.md` for complete API reference
- Check request examples for all features
- Review error handling scenarios

## 💡 Pro Tips

1. **Auto-Variables**: Login and create requests auto-save IDs
2. **Collection Variables**: Already set in collection (base_url, etc.)
3. **Environment Variables**: Need manual setup (camp_id, activity_id, etc.)
4. **Pre-filled Bodies**: All requests have working example payloads
5. **Query Params**: Disabled params show additional options

## 🎉 You're Ready!

You now have a working Events API test environment. Explore the collection to test:
- ✅ Single events
- ✅ Recurring event series  
- ✅ Update/delete scopes
- ✅ Filtering & sorting
- ✅ Group assignments
- ✅ Staff requirements
- ✅ Cascade deletion

Happy testing! 🚀

