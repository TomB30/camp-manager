# Authentication & Authorization Guide

## Overview

The frontend automatically handles JWT authentication by including the `Authorization` header in all API requests.

## How It Works

### 1. **Login/Signup Flow**

When a user logs in or signs up:

```typescript
// User logs in
const response = await authService.login({
  email: "user@example.com",
  password: "password"
});

// Token is automatically stored in localStorage
// Key: "auth_token"
```

### 2. **Automatic Authorization Header**

The API client is configured with a **request interceptor** that automatically adds the `Authorization` header to every request:

```typescript
// src/config/api.ts
client.interceptors.request.use((request) => {
  const token = getAuthToken();
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
  }
  return request;
});
```

### 3. **Making Authenticated Requests**

**You don't need to manually add the Authorization header!** Just use the `apiClient`:

```typescript
import { getCamps } from "@/generated/api";
import { apiClient } from "@/config/api";

// The Authorization header is automatically included
async function getCampsApi(): Promise<Camp[]> {
  const response = await getCamps({
    client: apiClient,  // ← Uses configured client with auth
  });
  return response.data?.items || [];
}
```

### 4. **Token Storage**

The JWT token is stored in `localStorage` with the key `"auth_token"`:

```typescript
// Stored after login/signup
localStorage.setItem("auth_token", token);

// Cleared on logout
localStorage.removeItem("auth_token");
```

## API Configuration

### Initial Setup (`src/config/api.ts`)

The API client is initialized in `main.ts` before the app starts:

```typescript
// src/main.ts
import { initializeApiClient } from "./config/api";

// Initialize API client with base URL and interceptors
initializeApiClient();

const app = createApp(App);
// ...
```

### Request Interceptor

Automatically adds the Authorization header:

```typescript
client.interceptors.request.use((request) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
  }
  return request;
});
```

### Response Interceptor

Logs warnings for 401 Unauthorized responses:

```typescript
client.interceptors.response.use((response) => {
  if (response.status === 401) {
    console.warn("[API] Received 401 Unauthorized - token may be expired");
  }
  return response;
});
```

## Helper Functions

### `setAuthToken(token: string)`

Store the authentication token:

```typescript
import { setAuthToken } from "@/config/api";

setAuthToken("your-jwt-token");
```

### `clearAuthToken()`

Clear the authentication token:

```typescript
import { clearAuthToken } from "@/config/api";

clearAuthToken();
```

## Usage in Services

### authService

Handles login, signup, and logout:

```typescript
import { authService } from "@/services";

// Login - token is automatically stored
const { user, token } = await authService.login({
  email: "user@example.com",
  password: "password"
});

// Check authentication status
if (authService.isAuthenticated()) {
  // User is logged in
}

// Logout - token is automatically cleared
await authService.logout();
```

### Other Services

All API services automatically include the auth token:

```typescript
import { getCamps } from "@/generated/api";
import { apiClient } from "@/config/api";

// No need to manually add Authorization header
const response = await getCamps({
  client: apiClient,  // ← Automatically includes Bearer token
});
```

## Troubleshooting

### Getting 401 Unauthorized

**Problem:** API returns 401 even though you're logged in.

**Possible causes:**

1. **Token not stored:** Check if `localStorage.getItem("auth_token")` returns a value
2. **Token expired:** JWT tokens have an expiration time
3. **Invalid token:** Token may be malformed or incorrect

**Solutions:**

1. **Check token in localStorage:**
   ```javascript
   console.log(localStorage.getItem("auth_token"));
   ```

2. **Check request headers in browser DevTools:**
   - Open Network tab
   - Make an API request
   - Check if `Authorization: Bearer <token>` header is present

3. **Try logging in again:** This will refresh the token

### Token Not Included in Requests

**Problem:** Authorization header not being sent with requests.

**Solutions:**

1. **Verify you're using `apiClient`:**
   ```typescript
   // ✅ Correct - uses configured client
   const response = await getCamps({ client: apiClient });
   
   // ❌ Wrong - doesn't use configured client
   const response = await getCamps();
   ```

2. **Check API client initialization:**
   - Ensure `initializeApiClient()` is called in `main.ts`
   - Check console for initialization log message

3. **Verify token exists:**
   ```typescript
   const token = localStorage.getItem("auth_token");
   console.log("Token exists:", !!token);
   ```

### Token Not Persisting

**Problem:** Token is lost after page refresh.

**Solution:** 

The token is stored in `localStorage`, which persists across page refreshes. If it's not persisting:

1. **Check browser settings:** Ensure localStorage is enabled
2. **Check for errors:** Look for console errors during login
3. **Verify storage:** After login, check if token is in localStorage

## Security Best Practices

1. **Never log tokens:** Avoid `console.log(token)` in production
2. **HTTPS only:** Always use HTTPS in production to encrypt the token
3. **Token expiration:** Implement token refresh or re-authentication
4. **Logout on 401:** Consider auto-logout when receiving 401 responses

## Token Format

The backend expects the token in the following format:

```
Authorization: Bearer <jwt-token>
```

Example:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Implementation Details

### Files

- `src/config/api.ts` - API client configuration and interceptors
- `src/services/authService.ts` - Authentication service
- `src/main.ts` - API client initialization

### Flow Diagram

```
┌─────────────────┐
│  User Login     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ authService     │
│  .login()       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Store token in  │
│ localStorage    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Make API call   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Interceptor     │
│ adds Bearer     │
│ token to header │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Request sent    │
│ with Auth       │
└─────────────────┘
```

## Related Documentation

- `frontend/API_CONFIG.md` - API configuration guide
- `backend/docs/CORS_CONFIGURATION.md` - CORS setup
- `backend/docs/AUTH_ME_LOGOUT_IMPLEMENTATION.md` - Backend auth implementation

