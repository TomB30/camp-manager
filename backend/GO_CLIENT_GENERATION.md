# Go Client Generation from OpenAPI

This document explains how to generate Go client and types from the OpenAPI specification.

## Overview

The backend can now generate Go client libraries and types from the OpenAPI specification located in the `api/` directory. This ensures type safety and consistency between the API specification and the Go backend implementation.

## Generated Files

The generation creates three files in `backend/internal/api/`:

- **`types.gen.go`** - Go types/structs corresponding to OpenAPI schemas (requests, responses, entities)
- **`client.gen.go`** - HTTP client implementation for calling the API endpoints
- **`server.gen.go`** - Server interface definitions for implementing API handlers with Chi router

## Quick Start

### Generate All Clients (Frontend + Backend)

From the project root:

```bash
make api-generate-all
```

This will:
1. Bundle the OpenAPI specification
2. Generate TypeScript types and client for the frontend
3. Generate Go types and client for the backend

### Generate Only Go Client

From the project root:

```bash
make api-generate-go
```

Or from the backend directory:

```bash
cd backend
make generate-client
```

## How It Works

The generation process uses [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen), a powerful tool for generating Go code from OpenAPI 3.x specifications.

### Two Generation Methods

1. **Local Generation** (if oapi-codegen is installed):
   - Uses the oapi-codegen binary in your PATH
   - Faster, no Docker overhead

2. **Docker-based Generation** (fallback):
   - Uses Docker to run oapi-codegen in a container
   - Works even if you don't have oapi-codegen installed locally
   - Requires Docker to be installed

The Makefile automatically chooses the appropriate method based on whether oapi-codegen is available.

## Configuration

The generation is controlled by three configuration files:

- **`.oapi-codegen-types.yaml`** - Configuration for generating types
- **`.oapi-codegen-client.yaml`** - Configuration for generating HTTP client
- **`.oapi-codegen-server.yaml`** - Configuration for generating server interfaces

These files are located in the `backend/` directory.

## Installation (Optional)

If you want to use local generation (faster), install oapi-codegen:

### If you have a working Go installation:

```bash
go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest
```

### If you have Go installation issues:

The Docker-based generation will work automatically. No additional setup needed!

## Fixing Go Installation Issues

If you encounter Go version mismatch errors, you have two options:

### Option 1: Use Docker (Recommended)

The Docker-based generation handles all dependencies automatically. Just make sure Docker is installed:

```bash
docker --version
```

### Option 2: Fix Your Go Installation

If you see errors like `compile: version "go1.23.4" does not match go tool version "go1.24.5"`:

1. **Check your Go version:**
   ```bash
   go version
   ```

2. **Reinstall Go:**
   - Download the latest stable version from https://golang.org/dl/
   - Follow installation instructions for your OS
   - Verify installation: `go version`

3. **Clean Go cache:**
   ```bash
   go clean -cache
   go clean -modcache
   ```

## Usage in Go Code

### Using the Generated Types

```go
package main

import (
    "github.com/tbechar/camp-manager-backend/internal/api"
)

func example() {
    // Use generated types for type-safe API requests/responses
    camper := api.Camper{
        Meta: api.EntityMeta{
            Id: "123",
            // ...
        },
        Spec: api.CamperSpec{
            FirstName: "John",
            LastName: "Doe",
            // ...
        },
    }
    
    // Types ensure compile-time safety
}
```

### Using the Generated Client

```go
package main

import (
    "context"
    "net/http"
    
    "github.com/tbechar/camp-manager-backend/internal/api"
)

func main() {
    // Create a client pointing to your API
    client, err := api.NewClientWithResponses("http://localhost:8080")
    if err != nil {
        panic(err)
    }
    
    ctx := context.Background()
    
    // Get all campers with type-safe parameters
    params := api.GetCampersParams{
        Limit: ptr(10),
        Offset: ptr(0),
    }
    
    resp, err := client.GetCampersWithResponse(ctx, &params)
    if err != nil {
        panic(err)
    }
    
    if resp.StatusCode() == http.StatusOK {
        // Type-safe response handling
        campers := resp.JSON200
        for _, camper := range campers.Items {
            println(camper.Spec.FirstName, camper.Spec.LastName)
        }
    }
}

func ptr[T any](v T) *T {
    return &v
}
```

### Implementing Server Handlers

The generated server interfaces can be used with the Chi router:

```go
package handler

import (
    "net/http"
    
    "github.com/tbechar/camp-manager-backend/internal/api"
)

type CampersHandler struct {
    // Your service dependencies
}

// Implement the generated ServerInterface
func (h *CampersHandler) GetCampers(w http.ResponseWriter, r *http.Request, params api.GetCampersParams) {
    // Implementation with type-safe parameters
}

func (h *CampersHandler) PostCampers(w http.ResponseWriter, r *http.Request) {
    // Implementation
}

// ... more methods
```

## Workflow

When you modify the OpenAPI specification:

1. **Update the YAML files** in `api/schemas/` or `api/paths/`
2. **Validate the spec:**
   ```bash
   make api-validate
   ```
3. **Regenerate clients:**
   ```bash
   make api-generate-all
   ```
4. **Update your code** to use the new types/endpoints

## Troubleshooting

### Error: "oapi-codegen: command not found"

This is normal! The system will automatically use Docker-based generation. If you see this message but generation succeeds, everything is working correctly.

### Error: "Docker is not installed or not in PATH"

Install Docker Desktop from https://www.docker.com/products/docker-desktop

### Error: Permission denied when running generate-client.sh

Make the script executable:

```bash
chmod +x backend/scripts/generate-client.sh
```

### Generated files have import errors

Run `go mod tidy` to ensure all dependencies are downloaded:

```bash
cd backend
go mod tidy
```

You may need to add the oapi-codegen runtime dependency:

```bash
cd backend
go get github.com/oapi-codegen/runtime
```

## Additional Resources

- [oapi-codegen Documentation](https://github.com/oapi-codegen/oapi-codegen)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Project API Documentation](../api/README.md)

## Summary

You now have three ways to use the OpenAPI spec:

1. **Frontend** - TypeScript types and client
2. **Backend** - Go types and client (for internal API calls)
3. **Backend** - Server interfaces (for implementing API handlers)

All three stay synchronized with the single source of truth: the OpenAPI specification in `api/`.

