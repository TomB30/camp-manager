# Quick CORS Setup Guide

## Development Setup (5173 Port)

Your backend is now configured to allow CORS requests from `http://localhost:5173` (Vite default) by default.

### ✅ What Was Done

1. **Created CORS Middleware** (`internal/middleware/cors.go`)
   - Handles CORS headers
   - Processes preflight (OPTIONS) requests
   - Validates allowed origins

2. **Updated Configuration** (`internal/config/config.go`)
   - Added `CORS` configuration section
   - Default allowed origins: `http://localhost:5173,http://localhost:3000`

3. **Applied Middleware** (`cmd/api/main.go`)
   - CORS middleware is applied first in the chain
   - Runs before authentication and other middleware

### 🚀 Usage

#### Default Configuration
The backend now allows requests from:
- `http://localhost:5173` (Vite/Vue default)
- `http://localhost:3000` (React/Next.js common port)

**No additional configuration needed for development!**

#### Custom Configuration
If you need to allow additional origins, create a `.env` file:

```bash
# backend/.env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081,http://custom-domain.local
```

### 🧪 Testing

Start your backend:
```bash
cd backend
go run cmd/api/main.go
```

Start your frontend:
```bash
cd frontend
npm run dev
```

Your frontend requests should now work without CORS errors!

### 📝 Verify CORS is Working

Make a request from your frontend. Check the response headers in browser dev tools:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```

### ⚙️ Environment Variables

```bash
# backend/.env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Format:** Comma-separated list of allowed origins

**Example for multiple origins:**
```bash
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://staging.myapp.com
```

### 🔒 Production Configuration

For production, update the environment variable to your production frontend URL:

```bash
CORS_ALLOWED_ORIGINS=https://app.yourdomain.com
```

**Important:** Never use `*` (wildcard) in production!

### 🐛 Troubleshooting

**Still getting CORS errors?**

1. **Check the origin matches exactly:**
   - Include protocol: `http://` not just `localhost:5173`
   - Check the port matches
   - No trailing slashes

2. **Restart the backend** after changing `.env` file

3. **Check browser console** for specific error messages

4. **Verify with curl:**
   ```bash
   curl -X OPTIONS http://localhost:8080/api/v1/auth/login \
     -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -v
   ```

### 📚 More Information

See `docs/CORS_CONFIGURATION.md` for detailed documentation.

