# Backend Skeleton Implementation

This document describes the skeleton implementation created for the Camp Manager backend.

## Overview

A complete three-layer architecture has been scaffolded with function signatures for all entities defined in the OpenAPI specification. The skeleton follows best practices with clear separation of concerns between handlers, services, and repositories.

## Architecture Layers

### 1. Handler Layer (`internal/handler/`)

HTTP request handlers that receive requests, validate inputs, and return responses.

**Files Created:**
- `handler.go` - Main aggregator that implements the `api.ServerInterface`
- `activities.go` - Activity CRUD handlers
- `areas.go` - Area CRUD handlers
- `campers.go` - Camper CRUD handlers
- `certifications.go` - Certification CRUD handlers
- `colors.go` - Color CRUD handlers
- `events.go` - Event CRUD handlers
- `groups.go` - Group CRUD handlers
- `housing_rooms.go` - Housing room CRUD handlers
- `locations.go` - Location CRUD handlers
- `programs.go` - Program CRUD handlers
- `roles.go` - Role CRUD handlers
- `sessions.go` - Session CRUD handlers
- `staff_members.go` - Staff member CRUD handlers
- `health.go` - Health check handler (already existed)

**Handler Methods:**
Each entity handler has:
- `List{Entity}` - List with pagination and search
- `Create{Entity}` - Create new entity
- `Get{Entity}ById` - Get single entity by ID
- `Update{Entity}ById` - Update existing entity
- `Delete{Entity}ById` - Delete entity

### 2. Service Layer (`internal/service/`)

Business logic layer that orchestrates between handlers and repositories.

**Files Created:**
- `repository.go` - Repository interfaces used by services
- `activities.go` - Activity business logic
- `areas.go` - Area business logic
- `campers.go` - Camper business logic
- `certifications.go` - Certification business logic
- `colors.go` - Color business logic
- `events.go` - Event business logic
- `groups.go` - Group business logic
- `housing_rooms.go` - Housing room business logic
- `locations.go` - Location business logic
- `programs.go` - Program business logic
- `roles.go` - Role business logic
- `sessions.go` - Session business logic
- `staff_members.go` - Staff member business logic

**Service Interface Methods:**
Each service defines:
- `List(ctx, limit, offset, search)` - Paginated list with optional search
- `GetByID(ctx, id)` - Retrieve single entity
- `Create(ctx, request)` - Create new entity
- `Update(ctx, id, request)` - Update existing entity
- `Delete(ctx, id)` - Delete entity

**Repository Interfaces:**
All repository interfaces are defined in `service/repository.go` with methods:
- `List(ctx, limit, offset, search)` - Returns entities and total count
- `GetByID(ctx, id)` - Returns single entity or error
- `Create(ctx, entity)` - Inserts new entity
- `Update(ctx, id, entity)` - Updates existing entity
- `Delete(ctx, id)` - Deletes entity

### 3. Repository Layer (`internal/repository/`)

Data access layer that handles all database operations.

**Files Created:**
- `activities.go` - Activity data access
- `areas.go` - Area data access
- `campers.go` - Camper data access
- `certifications.go` - Certification data access
- `colors.go` - Color data access
- `events.go` - Event data access
- `groups.go` - Group data access
- `housing_rooms.go` - Housing room data access
- `locations.go` - Location data access
- `programs.go` - Program data access
- `roles.go` - Role data access
- `sessions.go` - Session data access
- `staff_members.go` - Staff member data access

**Repository Methods:**
Each repository implements:
- `List(ctx, limit, offset, search)` - Query with pagination
- `GetByID(ctx, id)` - Single row query
- `Create(ctx, entity)` - INSERT query
- `Update(ctx, id, entity)` - UPDATE query
- `Delete(ctx, id)` - DELETE query

**Helper Methods:**
- `scan{Entity}(row)` - Scans single row into entity
- `scan{Entity}s(rows)` - Scans multiple rows into slice

## Entities Covered

The skeleton implementation covers all 13 entities from the OpenAPI spec:

1. **Activities** - Program activities
2. **Areas** - Physical areas/zones
3. **Campers** - Camp participants
4. **Certifications** - Staff certifications
5. **Colors** - Color tags/labels
6. **Events** - Scheduled events
7. **Groups** - Camper/staff groups
8. **Housing Rooms** - Accommodation rooms
9. **Locations** - Event locations
10. **Programs** - Camp programs
11. **Roles** - Staff roles
12. **Sessions** - Camp sessions
13. **Staff Members** - Staff information

## Dependency Injection

The `handler.go` file's `NewHandler()` function wires up all dependencies:

```go
// Initialize repositories
activitiesRepo := repository.NewActivitiesRepository(db)
// ... other repos

// Initialize services
activitiesService := service.NewActivitiesService(activitiesRepo)
// ... other services

// Initialize handlers
activities := NewActivitiesHandler(activitiesService)
// ... other handlers
```

## Next Steps

To implement the actual logic, you'll need to:

### 1. Database Schema
- Create migration files for all entities
- Define tables with proper relationships
- Add indexes for search and foreign keys

### 2. Repository Implementation
- Implement SQL queries for each CRUD operation
- Handle JSONB fields for arrays and nested objects
- Implement full-text search for list operations
- Handle transactions where needed

### 3. Service Implementation
- Add business logic and validation
- Handle entity relationships
- Implement search/filter logic
- Add error handling and logging

### 4. Handler Implementation
- Parse request bodies
- Validate inputs
- Map between API types and domain models
- Format responses with proper status codes
- Handle errors gracefully

### 5. Testing
- Add unit tests for each layer
- Add integration tests for the full stack
- Add API tests using the OpenAPI spec

## Usage Example

Once implemented, the handler can be used in the main API server:

```go
// In cmd/api/main.go
db := database.NewDatabase(config)
handler := handler.NewHandler(db)

// Register with chi router
router := api.HandlerFromMux(handler, chiRouter)
```

## File Structure

```
backend/
├── internal/
│   ├── handler/
│   │   ├── handler.go           # Main aggregator
│   │   ├── activities.go
│   │   ├── areas.go
│   │   ├── campers.go
│   │   ├── certifications.go
│   │   ├── colors.go
│   │   ├── events.go
│   │   ├── groups.go
│   │   ├── housing_rooms.go
│   │   ├── locations.go
│   │   ├── programs.go
│   │   ├── roles.go
│   │   ├── sessions.go
│   │   ├── staff_members.go
│   │   └── health.go
│   ├── service/
│   │   ├── repository.go        # Repository interfaces
│   │   ├── activities.go
│   │   ├── areas.go
│   │   ├── campers.go
│   │   ├── certifications.go
│   │   ├── colors.go
│   │   ├── events.go
│   │   ├── groups.go
│   │   ├── housing_rooms.go
│   │   ├── locations.go
│   │   ├── programs.go
│   │   ├── roles.go
│   │   ├── sessions.go
│   │   └── staff_members.go
│   └── repository/
│       ├── activities.go
│       ├── areas.go
│       ├── campers.go
│       ├── certifications.go
│       ├── colors.go
│       ├── events.go
│       ├── groups.go
│       ├── housing_rooms.go
│       ├── locations.go
│       ├── programs.go
│       ├── roles.go
│       ├── sessions.go
│       └── staff_members.go
```

## Notes

- All TODO comments mark where implementation is needed
- Type-safe with generated API types from OpenAPI spec
- Follows Go best practices and idioms
- No linting errors in the skeleton code
- Ready for implementation of actual business logic

