# API Client Generation Guide

This project can now generate API clients and types for both **TypeScript** (frontend) and **Go** (backend) from the single OpenAPI specification.

## Quick Start

### Generate All Clients (Recommended)

```bash
make api-generate-all
```

This will generate:
- TypeScript types → `frontend/src/types/api.ts`
- TypeScript client → `frontend/src/generated/api/`
- Go types → `backend/internal/api/types.gen.go`
- Go client → `backend/internal/api/client.gen.go`
- Go server interfaces → `backend/internal/api/server.gen.go`

### Generate Frontend Only

```bash
make api-generate          # TypeScript types only
make generate-client       # TypeScript client (from frontend/)
```

### Generate Backend Only

```bash
make api-generate-go       # Go types + client + server
```

## What's Generated

### For TypeScript (Frontend)

- **Types**: All OpenAPI schemas as TypeScript types
- **Client**: HTTP client with methods for each endpoint
- **Location**: `frontend/src/generated/api/`

### For Go (Backend)

- **Types**: All OpenAPI schemas as Go structs
- **Client**: HTTP client for calling API endpoints
- **Server**: Chi router interfaces for implementing handlers
- **Location**: `backend/internal/api/`

## How It Works

### Frontend (TypeScript)

Uses `@hey-api/openapi-ts` to generate TypeScript code from the OpenAPI spec.

### Backend (Go)

Uses `oapi-codegen` with two methods:

1. **Local** - If you have `oapi-codegen` installed in your PATH
2. **Docker** (fallback) - Uses Docker to generate code with Go 1.23

The Docker method requires Docker Desktop but works regardless of your local Go setup.

## Requirements

### For Frontend Generation

- Node.js and npm (already installed)
- Run from `frontend/` directory or root

### For Backend Generation

**Option 1: Docker (Recommended)**
- Docker Desktop installed
- No other requirements

**Option 2: Local Generation**
- Go 1.21+ properly installed
- Install oapi-codegen: `go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest`

## Workflow

When you update the API:

1. **Edit the OpenAPI YAML files** in `api/schemas/` or `api/paths/`

2. **Validate the specification**:
   ```bash
   make api-validate
   ```

3. **Bundle the specification**:
   ```bash
   make api-bundle
   ```

4. **Regenerate all clients**:
   ```bash
   make api-generate-all
   ```

5. **Update your code** to use the new types/endpoints

## Troubleshooting

### "Docker is not installed"

Install Docker Desktop: https://www.docker.com/products/docker-desktop

### "oapi-codegen: command not found"

This is normal! The system will automatically use Docker-based generation instead.

### Go Version Mismatch Errors

If you see `compile: version "go1.23.4" does not match go tool version "go1.24.5"`:

**Solution 1 (Recommended)**: Use Docker-based generation (automatic)
- No action needed - it's already working!

**Solution 2**: Fix your Go installation
1. Download Go from https://golang.org/dl/
2. Install the latest stable version
3. Verify: `go version`
4. Clean cache: `go clean -cache && go clean -modcache`

### Generated TypeScript files have errors

Run `npm install` in the frontend directory to ensure all dependencies are installed.

### Generated Go files have import errors

Run `go mod tidy` in the backend directory:
```bash
cd backend
go mod tidy
```

## Documentation

- **Backend details**: See `backend/GO_CLIENT_GENERATION.md`
- **Frontend details**: See `frontend/README.md`
- **OpenAPI spec**: See `api/README.md`

## Benefits

✅ **Single Source of Truth**: One OpenAPI spec defines all APIs
✅ **Type Safety**: Compile-time type checking in both languages
✅ **Consistency**: Frontend and backend always in sync
✅ **Auto-completion**: Full IDE support with generated types
✅ **Validation**: Catch API changes at build time, not runtime
✅ **Documentation**: OpenAPI spec serves as living documentation

## What You Can Do Now

### Frontend Developers

```typescript
import { CampersService } from '@/generated/api';

// Type-safe API calls
const campers = await CampersService.getCampers({
  limit: 10,
  offset: 0
});

// Auto-completion works!
campers.items.forEach(camper => {
  console.log(camper.spec.firstName);
});
```

### Backend Developers

```go
import "github.com/tbechar/camp-manager-backend/internal/api"

// Use generated types
func processCamper(camper api.Camper) {
    fmt.Printf("Name: %s %s\n", 
        camper.Spec.FirstName,
        camper.Spec.LastName)
}

// Type-safe client
client, _ := api.NewClientWithResponses("http://localhost:8080")
resp, _ := client.GetCampersWithResponse(ctx, &params)
```

## Summary

You can now use:
- `make api-generate-all` - Generate everything
- `make api-generate` - Generate TypeScript only
- `make api-generate-go` - Generate Go only

The generation works automatically using Docker, so you don't need to install any additional tools beyond Docker Desktop.

