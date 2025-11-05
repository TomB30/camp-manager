# Context Utilities Package

A utility package for working with request context values in the Camp Manager backend.

## Overview

This package provides type-safe utilities for storing and retrieving authentication-related values from Go's `context.Context`. It's primarily used to pass user information from authentication middleware to handlers and services.

## Context Keys

The package defines the following context keys:

```go
UserIDKey   ContextKey = "userID"
TenantIDKey ContextKey = "tenantID"
EmailKey    ContextKey = "email"
```

## Functions

### Extraction Functions

Each value type has three extraction variants:

#### 1. Safe Extraction (with boolean)
Returns the value and a boolean indicating if it was found.

```go
userID, ok := context.ExtractUserID(ctx)
if !ok {
    // Handle missing value
}
```

Available:
- `ExtractUserID(ctx) (string, bool)`
- `ExtractTenantID(ctx) (string, bool)`
- `ExtractEmail(ctx) (string, bool)`

#### 2. Must Extraction (panics on error)
Panics if the value is not found or is empty. Use in contexts where missing values are programmer errors.

```go
userID := context.MustExtractUserID(ctx)
```

Available:
- `MustExtractUserID(ctx) string`
- `MustExtractTenantID(ctx) string`
- `MustExtractEmail(ctx) string`

#### 3. Error Extraction (returns error)
Returns an error if the value is not found or is empty.

```go
userID, err := context.ExtractUserIDOrError(ctx)
if err != nil {
    return err
}
```

Available:
- `ExtractUserIDOrError(ctx) (string, error)`
- `ExtractTenantIDOrError(ctx) (string, error)`
- `ExtractEmailOrError(ctx) (string, error)`

### Setting Functions

Add values to the context:

```go
// Set individual values
ctx = context.WithUserID(ctx, "user-123")
ctx = context.WithTenantID(ctx, "tenant-456")
ctx = context.WithEmail(ctx, "user@example.com")

// Set all user context values at once
ctx = context.WithUserContext(ctx, "user-123", "tenant-456", "user@example.com")
```

Available:
- `WithUserID(ctx, userID string) context.Context`
- `WithTenantID(ctx, tenantID string) context.Context`
- `WithEmail(ctx, email string) context.Context`
- `WithUserContext(ctx, userID, tenantID, email string) context.Context`

## Usage Examples

### In Middleware

```go
import pkgcontext "github.com/tbechar/camp-manager-backend/pkg/context"

func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Validate token and extract claims
        claims, err := validateToken(token)
        if err != nil {
            // Handle error
            return
        }
        
        // Add user context
        ctx := r.Context()
        ctx = pkgcontext.WithUserContext(ctx, claims.UserID, claims.TenantID, claims.Email)
        
        // Pass to next handler
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

### In Handlers

```go
import pkgcontext "github.com/tbechar/camp-manager-backend/pkg/context"

func MyHandler(w http.ResponseWriter, r *http.Request) {
    // Safe extraction with check
    userID, ok := pkgcontext.ExtractUserID(r.Context())
    if !ok {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }
    
    // Use userID...
}
```

### In Services

```go
import pkgcontext "github.com/tbechar/camp-manager-backend/pkg/context"

func (s *MyService) DoSomething(ctx context.Context) error {
    // Extract with error handling
    userID, err := pkgcontext.ExtractUserIDOrError(ctx)
    if err != nil {
        return fmt.Errorf("unauthorized: %w", err)
    }
    
    tenantID, err := pkgcontext.ExtractTenantIDOrError(ctx)
    if err != nil {
        return fmt.Errorf("missing tenant: %w", err)
    }
    
    // Use values...
    return nil
}
```

## When to Use Each Extraction Method

### Use Safe Extraction (`Extract*`)
- In handlers where you need to return HTTP errors
- When missing values should result in user-facing errors
- When you want explicit control over error handling

```go
userID, ok := pkgcontext.ExtractUserID(ctx)
if !ok {
    errors.WriteError(w, errors.Unauthorized("Not authenticated", nil))
    return
}
```

### Use Must Extraction (`MustExtract*`)
- In code paths that should only be reached when authenticated
- When missing values indicate a programming error (middleware bug)
- In tests where you control the context

```go
// This should never fail if middleware is working
userID := pkgcontext.MustExtractUserID(ctx)
```

### Use Error Extraction (`Extract*OrError`)
- In service layer where you want to return errors
- When building error chains
- When you want consistent error handling

```go
userID, err := pkgcontext.ExtractUserIDOrError(ctx)
if err != nil {
    return fmt.Errorf("authentication required: %w", err)
}
```

## Best Practices

1. **Import Alias**: Use an alias to avoid conflicts with the standard `context` package:
   ```go
   import pkgcontext "github.com/tbechar/camp-manager-backend/pkg/context"
   ```

2. **Middleware Responsibility**: Authentication middleware should set all user context values at once using `WithUserContext()`

3. **Handler Validation**: Handlers should use safe extraction and return appropriate HTTP errors

4. **Service Layer**: Services should use error extraction for consistent error handling

5. **Never Modify Context**: Contexts are immutable. Always assign the result of `With*` functions:
   ```go
   // ❌ Wrong
   pkgcontext.WithUserID(ctx, userID)
   
   // ✅ Correct
   ctx = pkgcontext.WithUserID(ctx, userID)
   ```

6. **Check for Empty**: Even when extraction succeeds, check for empty strings if needed:
   ```go
   userID, ok := pkgcontext.ExtractUserID(ctx)
   if !ok || userID == "" {
       // Handle invalid/missing user ID
   }
   ```

## Type Safety

The package uses a custom `ContextKey` type to prevent accidental key collisions:

```go
type ContextKey string
```

This ensures that context values set by this package can only be retrieved using the provided functions, preventing accidental overwrites or reads from other packages.

## Testing

In tests, you can easily create authenticated contexts:

```go
func TestMyHandler(t *testing.T) {
    ctx := context.Background()
    ctx = pkgcontext.WithUserContext(ctx, "test-user", "test-tenant", "test@example.com")
    
    req := httptest.NewRequest("GET", "/endpoint", nil)
    req = req.WithContext(ctx)
    
    // Test handler with authenticated context
    handler.ServeHTTP(recorder, req)
}
```

## Integration with Existing Code

This package replaces the previous context utilities that were in the `middleware` package:

- ✅ **Before**: `middleware.UserIDKey`, `middleware.GetUserID()`
- ✅ **After**: `pkgcontext.UserIDKey`, `pkgcontext.ExtractUserID()`

The refactoring provides:
- Better separation of concerns
- More extraction options (safe, must, error)
- Reusability across the entire codebase
- Consistent API for context operations

