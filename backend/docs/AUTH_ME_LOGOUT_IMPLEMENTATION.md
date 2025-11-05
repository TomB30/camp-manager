# Auth /me and /logout Implementation

## Overview

This document describes the implementation of the `/auth/me` (get current user) and `/auth/logout` endpoints, including JWT authentication middleware.

## What Was Implemented

### 1. JWT Authentication Middleware (`internal/middleware/auth.go`)

Created middleware to validate JWT tokens and extract user information from requests.

**Features:**
- `AuthMiddleware`: Main middleware struct with JWT service dependency
- `Authenticate()`: HTTP middleware that validates Bearer tokens
- Context helpers: `GetUserID()`, `GetTenantID()`, `GetEmail()`

**Flow:**
1. Extract token from `Authorization: Bearer <token>` header
2. Validate token format and signature
3. Parse JWT claims (userId, tenantId, email)
4. Add claims to request context
5. Pass request to next handler

**Error Handling:**
- Missing authorization header → 401 Unauthorized
- Invalid format (not "Bearer <token>") → 401 Unauthorized
- Invalid or expired token → 401 Unauthorized

**Context Keys:**
```go
UserIDKey   ContextKey = "userID"
TenantIDKey ContextKey = "tenantId"
EmailKey    ContextKey = "email"
```

### 2. Get Current User Service (`internal/service/auth.go`)

Implemented `GetCurrentUser()` service method:

**Logic:**
1. Validate user ID from context
2. Fetch user with access rules from repository
3. Return user information wrapped in AuthMe response

**Errors:**
- Empty user ID → 401 Unauthorized
- User not found → 404 Not Found

### 3. Logout Service (`internal/service/auth.go`)

Implemented `Logout()` service method:

**Logic:**
1. Validate user ID from context
2. Verify user exists in database
3. Return success (JWT tokens are stateless)

**Notes:**
- JWT tokens cannot be invalidated server-side without additional infrastructure
- Client is responsible for discarding the token
- Future enhancements could include:
  - Token blacklist (Redis)
  - Refresh token revocation
  - Short-lived tokens with rotation

**Errors:**
- Empty user ID → 401 Unauthorized
- User not found → 404 Not Found

### 4. Get Current User Handler (`internal/handler/auth.go`)

Implemented `GetCurrentUser()` HTTP handler:

**Flow:**
1. Extract user ID from request context (set by middleware)
2. Call service.GetCurrentUser()
3. Handle errors and return appropriate status codes
4. Return JSON response with user information

### 5. Logout Handler (`internal/handler/auth.go`)

Implemented `Logout()` HTTP handler:

**Flow:**
1. Extract user ID from request context (set by middleware)
2. Call service.Logout()
3. Handle errors and return appropriate status codes
4. Return JSON success response

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### 6. Route Configuration (`cmd/api/main.go`)

Updated routing to use middleware and organize auth endpoints:

**Structure:**
```go
r.Route("/api/v1/auth", func(r chi.Router) {
    // Public routes (no authentication)
    r.Post("/login", h.Login)
    r.Post("/signup", h.Signup)
    
    // Protected routes (authentication required)
    r.Group(func(r chi.Router) {
        r.Use(authMiddleware.Authenticate)
        r.Get("/me", h.GetCurrentUser)
        r.Post("/logout", h.Logout)
    })
})
```

**Benefits:**
- Clear separation of public vs protected routes
- Automatic token validation for protected endpoints
- Reusable middleware for future protected routes

## API Endpoints

### GET /api/v1/auth/me

Get information about the currently authenticated user.

**Authentication:** Required (Bearer token)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "tenantId": "tenant-uuid",
    "accessRules": [
      {
        "role": "admin",
        "scopeType": "tenant",
        "scopeId": "tenant-uuid"
      }
    ]
  }
}
```

**Error Responses:**
- 401 Unauthorized - Missing, invalid, or expired token
- 404 Not Found - User not found in database

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:8080/api/v1/auth/me
```

### POST /api/v1/auth/logout

Log out the current user.

**Authentication:** Required (Bearer token)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

**Error Responses:**
- 401 Unauthorized - Missing, invalid, or expired token
- 404 Not Found - User not found in database

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:8080/api/v1/auth/logout
```

**Client Responsibility:**
After successful logout, the client must:
1. Delete the JWT token from storage
2. Clear any cached user data
3. Redirect to login page

## Middleware Usage

The authentication middleware can be applied to any route:

```go
// Single protected route
r.With(authMiddleware.Authenticate).Get("/protected", handler)

// Group of protected routes
r.Group(func(r chi.Router) {
    r.Use(authMiddleware.Authenticate)
    r.Get("/resource1", handler1)
    r.Post("/resource2", handler2)
})
```

## Context Helpers

Extract user information from authenticated requests:

```go
import "github.com/tbechar/camp-manager-backend/internal/middleware"

func MyHandler(w http.ResponseWriter, r *http.Request) {
    // Get user ID
    userID, ok := middleware.GetUserID(r.Context())
    if !ok {
        // Handle missing user ID
    }
    
    // Get tenant ID
    tenantID, ok := middleware.GetTenantID(r.Context())
    
    // Get email
    email, ok := middleware.GetEmail(r.Context())
}
```

## Security Considerations

### 1. Token Validation
- All protected routes automatically validate JWT signature
- Expired tokens are rejected
- Malformed tokens are rejected
- Middleware runs before handlers, ensuring authentication

### 2. Token Lifecycle
- **Access Tokens**: 24-hour expiration
- **Client Storage**: Should use secure storage (httpOnly cookies or secure localStorage)
- **Logout**: Client-side only (tokens remain valid until expiration)

### 3. Future Enhancements

**Token Blacklist (Recommended for Production):**
- Use Redis to store invalidated tokens
- Check blacklist in middleware before validating
- Expire blacklist entries when token expires naturally

**Refresh Tokens:**
- Implement refresh token rotation
- Store refresh tokens in database
- Revoke on logout
- Shorter access token expiration (15 minutes)

**Rate Limiting:**
- Limit failed authentication attempts
- Protect against brute force attacks
- Per-IP and per-user rate limits

## Testing

### Manual Testing

**1. Login to get token:**
```bash
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')
```

**2. Get current user:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/auth/me
```

**3. Logout:**
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/auth/logout
```

**4. Verify token still works (until expiration):**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/auth/me
```

### Expected Behaviors

✅ Valid token → Returns user information  
✅ Missing token → 401 Unauthorized  
✅ Invalid token → 401 Unauthorized  
✅ Expired token → 401 Unauthorized  
✅ Logout → Returns success message  
✅ Token after logout → Still works (stateless JWT)  

## Architecture Notes

### Stateless JWT Approach

**Advantages:**
- No server-side session storage
- Horizontally scalable
- Simple to implement
- Fast validation (no database lookup)

**Disadvantages:**
- Cannot revoke tokens before expiration
- Tokens remain valid after logout
- Larger payload size (includes claims)

**Mitigation Strategies:**
1. Short token expiration times
2. Refresh token rotation
3. Token blacklist for revoked tokens
4. Monitor for suspicious activity

## Related Files

- `internal/middleware/auth.go` - JWT authentication middleware
- `internal/service/auth.go` - Auth service (GetCurrentUser, Logout)
- `internal/handler/auth.go` - Auth HTTP handlers
- `cmd/api/main.go` - Route configuration
- `internal/domain/jwt.go` - JWT utilities

## Next Steps

1. **Implement Token Blacklist**: Add Redis-based token revocation
2. **Add Refresh Tokens**: Implement refresh token rotation
3. **Add Unit Tests**: Test middleware and handlers
4. **Add Integration Tests**: Test full authentication flow
5. **Add Rate Limiting**: Protect authentication endpoints
6. **Add Logging**: Log authentication events
7. **Add Metrics**: Track authentication success/failure rates
8. **Document Best Practices**: Guide for frontend integration

