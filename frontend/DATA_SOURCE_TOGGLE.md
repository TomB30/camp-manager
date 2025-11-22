# Data Source Toggle Guide

This application now supports switching between two data sources:
1. **Local Storage** - Data stored in browser's localStorage (default)
2. **Backend API** - Data from the backend server

## Quick Start

### Check Current Mode

Open the browser console and run:
```javascript
devTools.getDataSource()
```

### Toggle Between Modes

To switch from localStorage to backend API (or vice versa):
```javascript
devTools.toggleBackendMode()
```

The page will automatically reload to apply the changes.

## Architecture Overview

### Three-Layer Design

1. **Storage Layer** (`*Storage.ts` files)
   - Original localStorage-based implementations
   - For auth: uses mock users with in-memory validation
   - Located in `src/services/`
   - Examples: `authStorage.ts`, `campersStorage.ts`, `staffMembersStorage.ts`

2. **API Layer** (`api/*Api.ts` files)
   - Backend API implementations
   - Located in `src/services/api/`
   - Examples: `authApi.ts`, `campersApi.ts`, `staffMembersApi.ts`

3. **Unified Service Layer** (`*Service.ts` files)
   - Routes to correct implementation based on mode
   - Located in `src/services/`
   - Examples: `authService.ts`, `campersService.ts`, `staffMembersService.ts`

### How It Works

```typescript
// In campersService.ts
const impl = () => isBackendEnabled() ? campersApi : campersStorage;

export const campersService = {
  listCampers: () => impl().listCampers(),
  // ... other methods
};
```

The service checks `isBackendEnabled()` and routes to the appropriate implementation.

## Configuration

The mode is stored in `localStorage` with the key `data_source_backend`:
- `'false'` or absent = Local Storage mode (default)
- `'true'` = Backend API mode

You can also manually change it:
```javascript
localStorage.setItem('data_source_backend', 'true')  // Enable backend
localStorage.setItem('data_source_backend', 'false') // Enable localStorage
```

## Development Workflow

### Working with Local Data

1. Start with localStorage mode (default)
2. Login with mock users:
   - System Admin: `system@admin.com` / `password`
   - Tenant Admin: `tenant@admin.com` / `password`
   - Camp Admin: `camp@admin.com` / `password`
   - Mixed Access: `mixed@user.com` / `password`
   - Viewer: `viewer@camp.com` / `password`
3. Insert mock data:
   ```javascript
   await devTools.resetData()
   ```
4. Develop and test features offline

### Testing with Backend

1. Ensure backend server is running
2. Switch to backend mode:
   ```javascript
   devTools.toggleBackendMode()
   ```
3. Test API integration
4. Switch back to localStorage when needed

## Services Covered

All services support both modes:
- ✅ Auth (Authentication)
- ✅ Campers
- ✅ Staff Members
- ✅ Events
- ✅ Locations
- ✅ Housing Rooms
- ✅ Groups
- ✅ Programs
- ✅ Activities
- ✅ Areas
- ✅ Certifications
- ✅ Roles
- ✅ Colors
- ✅ Sessions
- ✅ Time Blocks
- ✅ Camp
- ⚠️ Labels (localStorage only - not yet in backend API)

## Future Migration

When ready to fully migrate to backend:

1. Remove localStorage implementations:
   ```bash
   rm src/services/*Storage.ts
   rm src/services/storage.ts
   ```

2. Update unified services to use API directly:
   ```typescript
   // campersService.ts becomes:
   export { campersApi as campersService } from './api/campersApi';
   ```

3. Remove configuration:
   ```bash
   rm src/config/dataSource.ts
   ```

## Troubleshooting

### Data Not Loading
- Check if backend server is running (if in API mode)
- Check browser console for errors
- Verify API base URL in `.env` file

### Mode Not Switching
- Clear browser cache
- Hard reload the page (Ctrl+Shift+R / Cmd+Shift+R)
- Check localStorage to verify the flag value

### Mixed Data
- Each mode has separate data storage
- Switching modes won't migrate data
- Use backend APIs to sync data when ready

## Console Commands Reference

```javascript
// View current mode
devTools.getDataSource()

// Switch modes
devTools.toggleBackendMode()

// Local storage management (only works in localStorage mode)
await devTools.clearData()        // Clear all local data
await devTools.insertMockData()   // Insert mock data
await devTools.resetData()        // Clear and insert fresh data
```

