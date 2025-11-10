# API Configuration Guide

This document explains how the frontend API client is configured to communicate with the backend.

## Overview

The frontend uses a centralized API configuration system that:
- Reads the API base URL from environment variables
- Configures the generated API client with the correct base URL
- Provides a consistent client instance for all services

## Environment Variables

### Development
Create a `.env.development` file in the `frontend` directory:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

### Production
Create a `.env.production` file in the `frontend` directory:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Local Override (Optional)
You can create a `.env.local` file to override settings for your local environment:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

> **Note:** `.env.local` is gitignored and takes precedence over other env files.

## File Structure

```
frontend/
├── src/
│   ├── config/
│   │   └── api.ts              # API client configuration
│   ├── services/
│   │   └── authService.ts      # Uses configured API client
│   └── main.ts                 # Initializes API client on startup
├── .env.development            # Development environment variables
├── .env.production             # Production environment variables
└── .env.example                # Example environment file
```

## How It Works

### 1. API Configuration (`src/config/api.ts`)

This file:
- Exports `initializeApiClient()` function that configures the client on app startup
- Exports `apiClient` - the configured client instance to use in services
- Exports `getApiUrl()` - helper to get the current API base URL

```typescript
import { apiClient } from "@/config/api";

// Use apiClient in your services
const response = await someApiFunction({ client: apiClient });
```

### 2. Initialization (`src/main.ts`)

The API client is initialized **before** the Vue app is created:

```typescript
import { initializeApiClient } from "./config/api";

// Initialize API client with base URL before creating the app
initializeApiClient();

const app = createApp(App);
```

### 3. Usage in Services (`src/services/authService.ts`)

Services import and use the configured client:

```typescript
import { apiClient } from "@/config/api";
import { login as apiLogin } from "@/generated/api/sdk.gen";

async function login(credentials: LoginRequest) {
  const response = await apiLogin({
    client: apiClient,  // Use the configured client
    body: credentials,
  });
  // ...
}
```

## Development Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.development
   ```

2. **Update the API URL if needed:**
   Edit `.env.development` to match your backend port:
   ```bash
   VITE_API_BASE_URL=http://localhost:8080
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The console will log: `[API Config] Initializing API client with base URL: http://localhost:8080`

## Production Deployment

1. **Set production environment variables:**
   Create `.env.production` with your production API URL:
   ```bash
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

   The built application will use the production API URL.

## Environment Variable Precedence

Vite loads environment variables in this order (later files override earlier ones):

1. `.env` - Loaded in all cases
2. `.env.local` - Loaded in all cases, gitignored
3. `.env.[mode]` - Only loaded in specified mode (e.g., `.env.development`)
4. `.env.[mode].local` - Only loaded in specified mode, gitignored

## Troubleshooting

### API requests are going to the wrong URL

1. Check your `.env.development` file exists and has the correct URL
2. Restart the dev server after changing environment variables
3. Check the console for the initialization log message
4. Verify the URL doesn't have a trailing slash

### CORS errors in development

Make sure your backend is configured to allow requests from your frontend origin:
```
Access-Control-Allow-Origin: http://localhost:5173
```

### Environment variables not working

- Vite only exposes variables prefixed with `VITE_`
- Restart the dev server after adding/changing env files
- Check for typos in variable names

## Adding New API Configuration

To add new configuration options:

1. **Update TypeScript definitions** (`src/vite-env.d.ts`):
   ```typescript
   interface ImportMetaEnv {
     readonly VITE_API_BASE_URL: string;
     readonly VITE_NEW_CONFIG: string;  // Add new config
   }
   ```

2. **Use in `src/config/api.ts`**:
   ```typescript
   client.setConfig({
     baseUrl: getApiBaseUrl(),
     newConfig: import.meta.env.VITE_NEW_CONFIG,
   });
   ```

3. **Update environment files**:
   Add the new variable to `.env.development`, `.env.production`, and `.env.example`.

## Related Files

- `src/config/api.ts` - API client configuration
- `src/vite-env.d.ts` - TypeScript environment variable types
- `src/generated/api/` - Auto-generated API client (do not modify)
- `.env.example` - Example environment variables template

