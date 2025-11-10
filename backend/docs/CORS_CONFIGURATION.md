# CORS Configuration Guide

This document explains how Cross-Origin Resource Sharing (CORS) is configured in the backend to allow requests from the frontend.

## Overview

CORS (Cross-Origin Resource Sharing) is a security feature that restricts web pages from making requests to a different domain than the one that served the web page. Our backend implements CORS middleware to allow specific origins (like your frontend application) to make API requests.

## Configuration

### Environment Variable

The backend uses the `CORS_ALLOWED_ORIGINS` environment variable to specify which origins are allowed to make requests.

**Format:** Comma-separated list of allowed origins

**Example:**
```bash
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://myapp.com
```

### Default Configuration

If not specified, the backend defaults to allowing:
- `http://localhost:5173` (Vite default port)
- `http://localhost:3000` (Common React/Next.js port)

### Development Setup

1. **Create a `.env` file** in the `backend` directory (if not already present):
   ```bash
   cp .env.example .env
   ```

2. **Verify CORS configuration:**
   ```bash
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

3. **Start the backend:**
   ```bash
   go run cmd/api/main.go
   ```

### Production Setup

For production, set the environment variable to your frontend's production URL:

```bash
CORS_ALLOWED_ORIGINS=https://app.yourdomain.com,https://www.yourdomain.com
```

**Security Note:** Never use `*` (wildcard) in production as it allows requests from any origin.

## How It Works

### CORS Middleware (`internal/middleware/cors.go`)

The CORS middleware:

1. **Checks the Origin header** of incoming requests
2. **Compares it** against the list of allowed origins
3. **Sets appropriate CORS headers** if the origin is allowed:
   - `Access-Control-Allow-Origin`: The requesting origin
   - `Access-Control-Allow-Methods`: Allowed HTTP methods
   - `Access-Control-Allow-Headers`: Allowed headers
   - `Access-Control-Allow-Credentials`: Allows cookies/auth headers
   - `Access-Control-Max-Age`: Cache duration for preflight requests

4. **Handles preflight requests** (OPTIONS method) automatically

### Middleware Order

The CORS middleware is applied **first** in the middleware chain (see `cmd/api/main.go`):

```go
r := chi.NewRouter()

// CORS middleware - must be before other middleware
corsMiddleware := middleware.NewCORSMiddleware(middleware.CORSConfig{
    AllowedOrigins: middleware.ParseAllowedOrigins(cfg.CORS.AllowedOrigins),
})
r.Use(corsMiddleware)

// Other middleware follows...
r.Use(chi_middleware.RequestID)
r.Use(chi_middleware.Logger)
// ...
```

This ensures CORS headers are set before any other processing occurs.

## Allowed Methods

The middleware allows the following HTTP methods:
- GET
- POST
- PUT
- DELETE
- OPTIONS
- PATCH

## Allowed Headers

The middleware allows the following request headers:
- Accept
- Authorization
- Content-Type
- X-CSRF-Token

## Credentials

The middleware sets `Access-Control-Allow-Credentials: true`, which allows:
- Cookies
- Authorization headers
- TLS client certificates

This is required for JWT authentication to work correctly.

## Testing CORS

### Using curl

Test a preflight request:

```bash
curl -X OPTIONS http://localhost:8080/api/v1/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Expected response should include:
```
< Access-Control-Allow-Origin: http://localhost:5173
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
< Access-Control-Allow-Headers: Accept, Authorization, Content-Type, X-CSRF-Token
< Access-Control-Allow-Credentials: true
```

### Using Browser

1. Open your frontend application at `http://localhost:5173`
2. Open browser developer tools (F12)
3. Go to the Network tab
4. Make an API request (e.g., login)
5. Check the response headers for `Access-Control-Allow-Origin`

If CORS is working, you should see the header and no CORS errors in the console.

## Troubleshooting

### CORS Error: "No 'Access-Control-Allow-Origin' header is present"

**Cause:** The requesting origin is not in the allowed origins list.

**Solution:**
1. Check your `.env` file or environment variables
2. Ensure the origin matches exactly (including protocol and port)
3. Restart the backend after changing the configuration

**Example:**
```bash
# Wrong - missing protocol
CORS_ALLOWED_ORIGINS=localhost:5173

# Correct
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### CORS Error: "The CORS policy blocks the request"

**Cause:** The request includes credentials but CORS is not properly configured.

**Solution:**
1. Ensure `Access-Control-Allow-Credentials: true` is set
2. Check that the origin is not a wildcard (`*`)
3. Verify the request includes credentials properly

### OPTIONS requests return 404

**Cause:** The OPTIONS handler is not properly registered.

**Solution:**
The CORS middleware handles OPTIONS requests automatically. Ensure the middleware is applied before routing.

### CORS works in development but not production

**Cause:** Environment variables not set correctly in production.

**Solution:**
1. Verify `CORS_ALLOWED_ORIGINS` is set in production environment
2. Check that the URL matches exactly (https vs http, www vs non-www)
3. Review server logs for CORS-related messages

## Multiple Environments

You can create different `.env` files for different environments:

### `.env.development`
```bash
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### `.env.staging`
```bash
CORS_ALLOWED_ORIGINS=https://staging.yourdomain.com
```

### `.env.production`
```bash
CORS_ALLOWED_ORIGINS=https://app.yourdomain.com,https://www.yourdomain.com
```

## Security Best Practices

1. **Never use wildcard (`*`) in production**
   ```bash
   # BAD - allows any origin
   CORS_ALLOWED_ORIGINS=*
   ```

2. **Be specific with origins**
   ```bash
   # GOOD - explicit allowed origins
   CORS_ALLOWED_ORIGINS=https://app.yourdomain.com
   ```

3. **Use HTTPS in production**
   ```bash
   # Development - OK
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   
   # Production - Use HTTPS
   CORS_ALLOWED_ORIGINS=https://app.yourdomain.com
   ```

4. **Limit allowed origins** to only the origins that need access

5. **Review CORS logs** regularly to ensure no unauthorized origins are attempting access

## Related Files

- `internal/middleware/cors.go` - CORS middleware implementation
- `internal/config/config.go` - Configuration loading and defaults
- `cmd/api/main.go` - Middleware application
- `.env.example` - Example environment configuration

## References

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Chi Router Documentation](https://go-chi.io/)

