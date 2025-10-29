<!-- 830a5b47-6de2-4508-8d36-aa3e49733345 eef7f6c4-593e-4381-9db0-441306c19b92 -->
# Go Backend Architecture Plan for Camp Manager

## 1. Multi-Tenancy Data Model

### Hierarchy Structure

```
Tenant (Root)
  └── Camps (1:many)
       ├── Sessions (optional time periods)
       ├── Campers (can be associated with a session)
       ├── Events (can be associated with a session)
       ├── Groups (can be associated with a session)
       ├── Staff Members
       ├── Locations
       ├── Programs
       ├── Activities
       └── Other entities...
```

**Important**: Sessions are NOT a hierarchical level - they're just another entity at the camp level. Campers, events, and groups can optionally reference a `session_id` for filtering/organization, but they exist independently at the camp level. A session is simply a time period (e.g., "Week 1", "Session A") that you can use to segment your camp data.

### Core Tenancy Tables

**tenants** (Top-level tenant - can represent a single camp or multi-camp organization)

- `id` (UUID, PK)
- `name` (VARCHAR, indexed)
- `description` (TEXT)
- `slug` (VARCHAR, unique, indexed) - for subdomain routing (e.g., "summer-camp-2024")
- `subscription_tier` (ENUM: free, basic, premium, enterprise)
- `max_camps` (INT) - subscription limit (1 for single camp, unlimited for enterprise)
- `settings` (JSONB) - tenant-wide settings
- `created_at`, `updated_at`, `deleted_at` (soft delete)

**camps** (Scoped to tenant)

- `id` (UUID, PK)
- `tenant_id` (UUID, FK -> tenants.id, indexed)
- `name` (VARCHAR)
- `description` (TEXT)
- `start_date` (DATE) - overall camp season start
- `end_date` (DATE) - overall camp season end
- `daily_start_time` (TIME) - e.g., "08:00"
- `daily_end_time` (TIME) - e.g., "20:00"
- `address` (JSONB) - {street, city, state, zipCode, country}
- `contact_info` (JSONB) - {phone, email, website}
- `logo_url` (VARCHAR)
- `timezone` (VARCHAR) - e.g., "America/New_York"
- `settings` (JSONB) - camp-specific settings
- `created_at`, `updated_at`, `deleted_at`
- **Composite Index**: `(tenant_id, id)` for fast tenant lookups
- **Index**: `(tenant_id, created_at DESC)` for listing

## 2. Database Schema Design (Aligned with OpenAPI meta/spec structure)

### Session Management (Time Periods)

**sessions** (Optional time segments within a camp - e.g., Week 1, Week 2)

- `id` (UUID, PK)
- `camp_id` (UUID, FK -> camps.id, indexed)
- `tenant_id` (UUID, FK, denormalized for query optimization)
- `name` (VARCHAR)
- `description` (TEXT)
- `start_date` (DATE)
- `end_date` (DATE)
- `created_at`, `updated_at`, `deleted_at`
- **Composite Index**: `(camp_id, start_date, end_date)` for date range queries
- **Composite Index**: `(tenant_id, camp_id, id)` for multi-level isolation

### People Management

**campers**

- `id` (UUID, PK)
- `camp_id` (UUID, FK -> camps.id, indexed)
- `tenant_id` (UUID, FK, denormalized)
- `session_id` (UUID, FK -> sessions.id, nullable, indexed) - optional association
- `first_name` (VARCHAR, indexed for search)
- `last_name` (VARCHAR, indexed for search)
- `age` (INT)
- `gender` (VARCHAR) - enum: male, female
- `photo_url` (VARCHAR)
- `registration_date` (TIMESTAMP)
- `family_group_id` (UUID, FK -> groups.id, nullable, indexed)
- `medical_info` (JSONB) - allergies, medications, notes, etc.
- `parent_contact` (JSONB) - name, phone, email, emergency contact
- `created_at`, `updated_at`, `deleted_at`
- **Composite Index**: `(camp_id, session_id)` for filtering
- **Composite Index**: `(family_group_id)` for group queries
- **GIN Index**: `medical_info` for JSON search
- **Full-text Index**: `(first_name, last_name)` for name search

**roles** (Tenant-wide, reusable across camps)

- `id` (UUID, PK)
- `tenant_id` (UUID, FK -> tenants.id, indexed)
- `name` (VARCHAR)
- `description` (TEXT)
- `color` (VARCHAR) - hex color
- `permissions` (JSONB) - role-based permissions
- `created_at`, `updated_at`, `deleted_at`
- **Unique Index**: `(tenant_id, name)` prevent duplicate role names

**staff_members**

- `id` (UUID, PK)
- `tenant_id` (UUID, FK, indexed)
- `camp_id` (UUID, FK, nullable) - can work across camps if NULL
- `role_id` (UUID, FK -> roles.id, indexed)
- `first_name` (VARCHAR, indexed)
- `last_name` (VARCHAR, indexed)
- `email` (VARCHAR, unique, indexed)
- `phone` (VARCHAR)
- `photo_url` (VARCHAR)
- `manager_id` (UUID, FK -> staff_members.id, self-referential)
- `user_id` (UUID, FK -> users.id, nullable) - if staff has login access
- `created_at`, `updated_at`, `deleted_at`
- **Composite Index**: `(tenant_id, camp_id)` for camp filtering
- **Index**: `(email)` for login lookups
- **Full-text Index**: `(first_name, last_name)` for search

**certifications** (Tenant-wide)

- `id` (UUID, PK)
- `tenant_id` (UUID, FK -> tenants.id, indexed)
- `name` (VARCHAR)
- `description` (TEXT)
- `validity_months` (INT, nullable) - NULL = permanent
- `created_at`, `updated_at`, `deleted_at`
- **Unique Index**: `(tenant_id, name)` prevent duplicates

**staff_certifications** (Many-to-many with metadata)

- `id` (UUID, PK)
- `staff_member_id` (UUID, FK -> staff_members.id)
- `certification_id` (UUID, FK -> certifications.id)
- `tenant_id` (UUID, FK, denormalized)
- `obtained_date` (DATE)
- `expiration_date` (DATE, nullable)
- `certificate_url` (VARCHAR) - document storage
- `created_at`, `updated_at`, `deleted_at`
- **Composite Index**: `(staff_member_id, certification_id)` unique per staff
- **Index**: `(expiration_date)` for expiration alerts

### Resource Management

**areas** (Physical zones within camp)

- `id` (UUID, PK)
- `camp_id` (UUID, FK -> camps.id, indexed)
- `tenant_id` (UUID, FK, denormalized)
- `name` (VARCHAR)
- `description` (TEXT)
- `type` (ENUM: indoor, outdoor, facility, field, water, other)
- `capacity` (INT)
- `equipment` (JSONB array)
- `notes` (TEXT)
- `created_at`, `updated_at`, `deleted_at`
- **Composite Index**: `(camp_id, type)` for filtering by type

**locations** (Activity spaces)

- `id` (UUID, PK)
- `camp_id` (UUID, FK -> camps.id, indexed)
- `tenant_id` (UUID, FK, denormalized)
- `area_id` (UUID, FK -> areas.id, nullable, indexed)
- `name` (VARCHAR)
- `description` (TEXT)
- `type` (ENUM: classroom, activity, sports, dining, outdoor, arts)
- `capacity` (INT)
- `equipment` (JSONB array)
- `notes` (TEXT)
- `created_at`, `updated_at`, `deleted_at`
- **Composite Index**: `(camp_id, area_id)` for nested queries
- **Index**: `(type)` for filtering

**housing_rooms** (Sleeping accommodations)

- `id` (UUID, PK)
- `camp_id` (UUID, FK -> camps.id, indexed)
- `tenant_id` (UUID, FK, denormalized)
- `area_id` (UUID, FK -> areas.id, nullable, indexed)
- `name` (VARCHAR)
- `description` (TEXT)
- `beds` (INT) - number of beds
- `created_at`, `updated_at`, `deleted_at`
- **Composite Index**: `(camp_id, area_id)` for area-based queries

### Program Structure

**programs**

- `id` (UUID, PK)
- `camp_id` (UUID, FK -> camps.id, indexed)
- `tenant_id` (UUID, FK, denormalized)
- `name` (VARCHAR)
- `description` (TEXT)
- `color_id` (UUID, FK -> colors.id, nullable)
- `created_at`, `updated_at`, `deleted_at`
- **Composite Index**: `(camp_id, name)` for unique names per camp

**activities**

- `id` (UUID, PK)
- `camp_id` (UUID, FK -> camps.id, indexed)
- `tenant_id` (UUID, FK, denormalized)
- `name` (VARCHAR)
- `description` (TEXT)
- `duration_minutes` (INT) - default duration
- `default_location_id` (UUID, FK -> locations.id, nullable)
- `default_capacity` (INT)
- `min_staff` (INT) - minimum staff required
- `created_at`, `updated_at`, `deleted_at`
- **Composite Index**: `(camp_id, name)` for unique names

**program_activities** (Many-to-many)

- `program_id` (UUID, FK -> programs.id)
- `activity_id` (UUID, FK -> activities.id)
- `tenant_id` (UUID, FK, denormalized)
- **Composite PK**: `(program_id, activity_id)`
- **Index**: `(activity_id)` for reverse lookups

**activity_certifications** (Required certifications)

- `activity_id` (UUID, FK -> activities.id)
- `certification_id` (UUID, FK -> certifications.id)
- `tenant_id` (UUID, FK, denormalized)
- **Composite PK**: `(activity_id, certification_id)`

### Group Management

**groups** (Unified group system - family groups, age groups, activity groups)

- `id` (UUID, PK)
- `camp_id` (UUID, FK -> camps.id, indexed)
- `tenant_id` (UUID, FK, denormalized)
- `session_id` (UUID, FK -> sessions.id, nullable, indexed) - optional association
- `housing_room_id` (UUID, FK -> housing_rooms.id, nullable)
- `name` (VARCHAR)
- `description` (TEXT)
- `type` (ENUM: family, age_based, activity, custom) - for categorization
- `camper_assignment_type` (ENUM: filter, manual, nested)
- `camper_filters` (JSONB) - {ageMin, ageMax, gender, hasAllergies, sessionId, familyGroupIds}
- `staff_assignment_type` (ENUM: filter, manual)
- `staff_filters` (JSONB) - {roles, certificationIds}
- `label_ids` (UUID array)
- `color` (VARCHAR) - hex color
- `created_at`, `updated_at`, `deleted_at`
- **Composite Index**: `(camp_id, session_id)` for session filtering
- **Composite Index**: `(camp_id, type)` for type filtering
- **GIN Index**: `camper_filters` for JSON queries

**group_campers** (Many-to-many, for manual assignment)

- `group_id` (UUID, FK -> groups.id)
- `camper_id` (UUID, FK -> campers.id)
- `tenant_id` (UUID, FK, denormalized)
- `joined_at` (TIMESTAMP)
- **Composite PK**: `(group_id, camper_id)`
- **Index**: `(camper_id)` for reverse lookups

**group_staff** (Many-to-many)

- `group_id` (UUID, FK -> groups.id)
- `staff_member_id` (UUID, FK -> staff_members.id)
- `tenant_id` (UUID, FK, denormalized)
- `assigned_at` (TIMESTAMP)
- **Composite PK**: `(group_id, staff_member_id)`
- **Index**: `(staff_member_id)` for staff schedule queries

**group_hierarchy** (For nested groups)

- `parent_group_id` (UUID, FK -> groups.id)
- `child_group_id` (UUID, FK -> groups.id)
- `tenant_id` (UUID, FK, denormalized)
- **Composite PK**: `(parent_group_id, child_group_id)`
- **Index**: `(child_group_id)` for parent lookups

### Event & Scheduling

**events**

- `id` (UUID, PK)
- `camp_id` (UUID, FK -> camps.id, indexed)
- `tenant_id` (UUID, FK, denormalized)
- `session_id` (UUID, FK -> sessions.id, nullable, indexed) - optional association
- `title` (VARCHAR, indexed)
- `description` (TEXT)
- `start_time` (TIMESTAMPTZ, indexed) - with timezone
- `end_time` (TIMESTAMPTZ, indexed)
- `location_id` (UUID, FK -> locations.id, nullable)
- `program_id` (UUID, FK -> programs.id, nullable)
- `activity_id` (UUID, FK -> activities.id, nullable)
- `color_id` (UUID, FK -> colors.id, nullable)
- `capacity` (INT)
- `recurrence_id` (UUID, nullable) - links recurring events
- `is_recurrence_parent` (BOOLEAN)
- `recurrence_rule` (JSONB) - stores recurrence pattern (freq, interval, byweekday, until)
- `created_at`, `updated_at`, `deleted_at`
- **Composite Index**: `(camp_id, start_time, end_time)` for calendar queries
- **Composite Index**: `(location_id, start_time, end_time)` for location conflicts
- **Index**: `(recurrence_id)` for recurring event series
- **Index**: `(session_id)` for session filtering

**event_groups** (Groups assigned to events)

- `event_id` (UUID, FK -> events.id)
- `group_id` (UUID, FK -> groups.id)
- `tenant_id` (UUID, FK, denormalized)
- **Composite PK**: `(event_id, group_id)`

**event_enrollments** (Individual camper enrollments)

- `id` (UUID, PK)
- `event_id` (UUID, FK -> events.id, indexed)
- `camper_id` (UUID, FK -> campers.id, indexed)
- `tenant_id` (UUID, FK, denormalized)
- `enrolled_at` (TIMESTAMP)
- `enrolled_by_user_id` (UUID, FK -> users.id, nullable)
- `source` (ENUM: manual, group, automatic) - how they got enrolled
- `created_at`, `updated_at`
- **Composite Index**: `(event_id, camper_id)` unique per event
- **Composite Index**: `(camper_id, event_id)` for camper schedule queries
- **Composite Index**: `(event_id, enrolled_at)` for enrollment order

**event_staff** (Staff assigned to events)

- `event_id` (UUID, FK -> events.id)
- `staff_member_id` (UUID, FK -> staff_members.id)
- `tenant_id` (UUID, FK, denormalized)
- `role` (VARCHAR) - lead, assistant, observer
- `assigned_at` (TIMESTAMP)
- **Composite PK**: `(event_id, staff_member_id)`
- **Index**: `(staff_member_id)` for staff schedule

**event_exclusions** (Explicit exclusions from group enrollment)

- `event_id` (UUID, FK -> events.id)
- `camper_id` (UUID, FK -> campers.id, nullable)
- `staff_member_id` (UUID, FK -> staff_members.id, nullable)
- `tenant_id` (UUID, FK, denormalized)
- **Composite Index**: `(event_id, camper_id)` where camper_id not null
- **Composite Index**: `(event_id, staff_member_id)` where staff_member_id not null

### Configuration & Reference Data

**colors** (Camp-specific or tenant-wide)

- `id` (UUID, PK)
- `tenant_id` (UUID, FK -> tenants.id, indexed)
- `camp_id` (UUID, FK -> camps.id, nullable, indexed)
- `name` (VARCHAR)
- `description` (TEXT)
- `hex_value` (VARCHAR) - e.g., "#FF5733"
- `is_default` (BOOLEAN)
- `created_at`, `updated_at`, `deleted_at`
- **Index**: `(camp_id, is_default)` for default color lookup
- **Unique Index**: `(tenant_id, camp_id, name)` prevent duplicates

**duration_presets** (Camp-specific presets)

- `id` (UUID, PK)
- `camp_id` (UUID, FK -> camps.id, indexed)
- `tenant_id` (UUID, FK, denormalized)
- `name` (VARCHAR)
- `description` (TEXT)
- `duration_minutes` (INT)
- `is_default` (BOOLEAN)
- `created_at`, `updated_at`, `deleted_at`

**labels** (Tenant-wide tags)

- `id` (UUID, PK)
- `tenant_id` (UUID, FK -> tenants.id, indexed)
- `name` (VARCHAR)
- `description` (TEXT)
- `color` (VARCHAR)
- `created_at`, `updated_at`, `deleted_at`

### Authentication & Authorization

**users** (Login accounts)

- `id` (UUID, PK)
- `tenant_id` (UUID, FK -> tenants.id, indexed)
- `email` (VARCHAR, unique, indexed)
- `password_hash` (VARCHAR)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `role` (ENUM: tenant_admin, camp_admin, staff, parent) - system role
- `is_active` (BOOLEAN)
- `email_verified` (BOOLEAN)
- `last_login_at` (TIMESTAMP)
- `created_at`, `updated_at`, `deleted_at`
- **Unique Index**: `(email)` for login

**user_camps** (Camp access control)

- `user_id` (UUID, FK -> users.id)
- `camp_id` (UUID, FK -> camps.id)
- `role` (VARCHAR) - admin, counselor, viewer
- `permissions` (JSONB) - granular permissions
- **Composite PK**: `(user_id, camp_id)`

**refresh_tokens** (JWT refresh token management)

- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, indexed)
- `token_hash` (VARCHAR, unique, indexed)
- `expires_at` (TIMESTAMP)
- `revoked` (BOOLEAN)
- `created_at`
- **Index**: `(user_id, revoked, expires_at)` for active tokens

## 3. Go Project Structure (Modular Monolith)

```
camp-manager-backend/
├── cmd/
│   ├── api/                    # Main API server
│   │   └── main.go
│   ├── migrate/                # Database migration tool
│   │   └── main.go
│   └── worker/                 # Background job worker (future)
│       └── main.go
│
├── internal/                   # Private application code
│   ├── domain/                 # Domain models (entities) - matches API meta/spec
│   │   ├── tenant.go
│   │   ├── camp.go
│   │   ├── session.go
│   │   ├── camper.go
│   │   ├── staff.go
│   │   ├── event.go
│   │   ├── group.go
│   │   ├── location.go
│   │   ├── role.go
│   │   ├── certification.go
│   │   └── ...
│   │
│   ├── repository/             # Data access layer (by entity) - GORM implementations
│   │   ├── postgres/
│   │   │   ├── tenant.go
│   │   │   ├── camp.go
│   │   │   ├── camper.go
│   │   │   ├── staff.go
│   │   │   ├── event.go
│   │   │   ├── group.go
│   │   │   └── ...
│   │   └── interfaces.go       # Repository interfaces
│   │
│   ├── service/                # Business logic (by bounded context)
│   │   ├── tenant/             # Tenant & camp management
│   │   │   ├── tenant.go
│   │   │   └── camp.go
│   │   ├── people/             # Campers & staff management
│   │   │   ├── camper.go
│   │   │   ├── staff.go
│   │   │   └── certification.go
│   │   ├── scheduling/         # Events & calendar
│   │   │   ├── event.go
│   │   │   ├── enrollment.go
│   │   │   ├── conflict.go
│   │   │   └── recurrence.go
│   │   ├── resources/          # Locations, rooms, areas
│   │   │   ├── location.go
│   │   │   ├── housing.go
│   │   │   └── area.go
│   │   ├── programs/           # Programs & activities
│   │   │   ├── program.go
│   │   │   └── activity.go
│   │   ├── groups/             # Group management
│   │   │   └── group.go
│   │   └── auth/               # Authentication & authorization
│   │       ├── auth.go
│   │       └── jwt.go
│   │
│   ├── handler/                # HTTP handlers (API routes)
│   │   ├── rest/
│   │   │   ├── camp.go
│   │   │   ├── camper.go
│   │   │   ├── staff.go
│   │   │   ├── event.go
│   │   │   ├── group.go
│   │   │   ├── session.go
│   │   │   └── ...
│   │   └── middleware/
│   │       ├── auth.go         # JWT validation
│   │       ├── tenant.go       # Multi-tenancy context (from JWT)
│   │       ├── ratelimit.go
│   │       └── logging.go
│   │
│   ├── cache/                  # Redis caching layer
│   │   ├── redis.go
│   │   └── keys.go             # Cache key patterns
│   │
│   ├── dto/                    # Data transfer objects (API models)
│   │   ├── request/
│   │   │   ├── camper.go
│   │   │   ├── event.go
│   │   │   └── ...
│   │   └── response/
│   │       ├── camper.go
│   │       ├── event.go
│   │       └── ...
│   │
│   ├── database/               # Database setup & migrations
│   │   ├── gorm.go             # GORM setup and configuration
│   │   └── migrations/
│   │       ├── 001_init_schema.sql
│   │       ├── 002_add_indexes.sql
│   │       └── ...
│   │
│   └── pkg/                    # Internal shared utilities
│       ├── config/
│       │   └── config.go       # Configuration management
│       ├── errors/
│       │   └── errors.go       # Custom error types
│       ├── logger/
│       │   └── logger.go       # Structured logging
│       └── validator/
│           └── validator.go    # Request validation
│
├── pkg/                        # Public packages (can be imported)
│   └── client/                 # Go client SDK (future)
│       └── client.go
│
├── scripts/
│   ├── seed-data.sql           # Development seed data
│   └── generate-mocks.sh       # Test mock generation
│
├── docs/
│   ├── api/                    # API documentation
│   ├── architecture.md
│   └── database.md
│
├── tests/
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
│
├── .env.example
├── .gitignore
├── go.mod
├── go.sum
├── Makefile                    # Common commands
├── Dockerfile
├── docker-compose.yml          # Local development setup
└── README.md
```

### Service Boundaries (Ready to Split)

Each service directory represents a **bounded context** that can be extracted into a microservice:

1. **tenant** - Tenant & camp lifecycle
2. **people** - Campers, staff, certifications
3. **scheduling** - Events, enrollments, conflicts
4. **resources** - Locations, rooms, areas
5. **programs** - Programs & activities
6. **groups** - Group management & filtering
7. **auth** - Authentication & authorization

## 4. API Design & Routing

### Multi-Tenant URL Structure (Simplified)

**Tenant context is extracted from JWT token** - users belong to one tenant, so no need for `/tenants/{tenant_id}` in URLs.

```
/api/v1/camps
/api/v1/camps/{camp_id}/...
```

**Example routes:**

- `POST /api/v1/auth/login` - Login (returns JWT with tenant_id)
- `POST /api/v1/auth/register` - Register new user
- `GET /api/v1/me` - Get current user info
- `GET /api/v1/camps` - List camps for authenticated user's tenant
- `POST /api/v1/camps` - Create camp in authenticated user's tenant
- `GET /api/v1/camps/{camp_id}` - Get camp details
- `GET /api/v1/camps/{camp_id}/sessions` - List sessions
- `POST /api/v1/camps/{camp_id}/sessions` - Create session
- `GET /api/v1/camps/{camp_id}/campers` - List campers
- `POST /api/v1/camps/{camp_id}/campers` - Create camper
- `GET /api/v1/camps/{camp_id}/events` - List events
- `POST /api/v1/camps/{camp_id}/events` - Create event
- `POST /api/v1/camps/{camp_id}/events/{event_id}/enroll` - Enroll camper
- `GET /api/v1/camps/{camp_id}/groups` - List groups
- `GET /api/v1/camps/{camp_id}/staff-members` - List staff

### Middleware Stack

```go
// Public routes (no auth required)
publicRouter.Post("/api/v1/auth/login", handlers.Login)
publicRouter.Post("/api/v1/auth/register", handlers.Register)

// Protected routes (auth required)
protectedRouter.Use(
    middleware.RequestID(),
    middleware.Logger(),
    middleware.Recoverer(),
    middleware.RealIP(),
    middleware.Timeout(60 * time.Second),
    middleware.RateLimit(),
    middleware.CORS(),
    middleware.Authenticate(),      // JWT validation - extracts user_id and tenant_id
    middleware.LoadTenantContext(), // Loads tenant_id from JWT into context
    middleware.AuthorizeCampAccess(), // Verifies user has access to camp_id from URL
)

protectedRouter.Route("/api/v1", func(r chi.Router) {
    r.Get("/me", handlers.GetCurrentUser)
    r.Get("/camps", handlers.ListCamps)
    r.Post("/camps", handlers.CreateCamp)
    
    r.Route("/camps/{camp_id}", func(r chi.Router) {
        r.Get("/", handlers.GetCamp)
        r.Get("/campers", handlers.ListCampers)
        r.Post("/campers", handlers.CreateCamper)
        // ... more routes
    })
})
```

### Tenant Context Flow

```go
// 1. User logs in
POST /api/v1/auth/login
{
  "email": "admin@camp.com",
  "password": "***"
}

// 2. Server returns JWT with tenant_id embedded
{
  "token": "eyJ...",  // Contains: {user_id, tenant_id, camps: [...]}
  "user": {...}
}

// 3. All subsequent requests include JWT in header
GET /api/v1/camps/{camp_id}/campers
Authorization: Bearer eyJ...

// 4. Middleware extracts tenant_id from JWT and validates access
// 5. All database queries automatically filtered by tenant_id
```

## 5. Caching Strategy (Redis)

### Cache Patterns

**Cache Keys:**

```
tenant:{tenant_id}:camp:{camp_id}:campers
tenant:{tenant_id}:camp:{camp_id}:camper:{camper_id}
tenant:{tenant_id}:camp:{camp_id}:events:date:{date}
tenant:{tenant_id}:camp:{camp_id}:event:{event_id}:enrollments
tenant:{tenant_id}:user:{user_id}:permissions
```

**Caching Strategy:**

- **Read-through cache** for frequently accessed data (campers, staff, events)
- **Write-through cache** for consistency
- **TTL**: 5 minutes for list queries, 15 minutes for single entities
- **Cache invalidation**: On write operations, invalidate related keys
- **Distributed cache**: Redis for horizontal scaling

**What to cache:**

1. Camper/staff lists (frequently accessed)
2. Event calendar queries (high read volume)
3. Group membership calculations (expensive queries)
4. User permissions (checked on every request)
5. Tenant/camp metadata (rarely changes)

**What NOT to cache:**

- Real-time conflict detection results
- Enrollment operations (needs strong consistency)
- Authentication tokens (use Redis for token blacklist only)

## 6. Performance Optimizations

### Database Query Patterns with GORM

**Efficient multi-tenant queries:**

```go
// GORM automatically applies tenant_id from middleware context
var campers []Camper
result := db.Where("tenant_id = ? AND camp_id = ? AND session_id = ?", 
    tenantID, campID, sessionID).
    Limit(100).
    Find(&campers)

// Use preloading to avoid N+1 queries
db.Preload("FamilyGroup").
   Preload("Session").
   Where("camp_id = ?", campID).
   Find(&campers)
```

**Denormalization strategy:**

- Store `tenant_id` in all tables (even when inferable) for faster queries
- Avoid excessive JOINs; prefer multiple fast queries with caching
- Use GORM's Preload for efficient eager loading

**Connection pooling:**

```go
sqlDB, _ := db.DB()
sqlDB.SetMaxIdleConns(10)
sqlDB.SetMaxOpenConns(100)
sqlDB.SetConnMaxLifetime(time.Hour)
```

### Indexes for Common Queries

**Critical indexes:**

```sql
-- Multi-tenant isolation (most important!)
CREATE INDEX idx_campers_tenant_camp ON campers(tenant_id, camp_id);
CREATE INDEX idx_events_tenant_camp ON events(tenant_id, camp_id);

-- Calendar queries (very frequent)
CREATE INDEX idx_events_time_range ON events(camp_id, start_time, end_time);
CREATE INDEX idx_events_date ON events(camp_id, DATE(start_time));

-- Enrollment queries
CREATE INDEX idx_enrollments_event ON event_enrollments(event_id);
CREATE INDEX idx_enrollments_camper ON event_enrollments(camper_id, event_id);

-- Conflict detection
CREATE INDEX idx_events_location_time ON events(location_id, start_time, end_time) 
WHERE deleted_at IS NULL;

-- Search functionality
CREATE INDEX idx_campers_name ON campers 
USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- JSON queries for filters
CREATE INDEX idx_groups_filters ON groups USING gin(camper_filters);
```

## 7. Security & Authorization

### JWT Token Structure

```json
{
  "sub": "user_id",
  "tenant_id": "tenant_id",
  "role": "tenant_admin|camp_admin|staff|parent",
  "camps": ["camp_id_1", "camp_id_2"],
  "permissions": ["read:campers", "write:events"],
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Permission Model

- **Tenant Admin**: Full access to all camps in tenant
- **Camp Admin**: Full access to specific camp(s)
- **Staff**: Read access + limited write based on role
- **Parent**: Read-only access to own camper(s)

### Row-Level Security with GORM

```go
// Middleware extracts tenant from JWT and stores in context
type TenantContext struct {
    TenantID uuid.UUID
    CampID   *uuid.UUID // Optional - if accessing camp-specific resource
    UserID   uuid.UUID
}

// All repositories use tenant context automatically
func (r *CamperRepository) List(ctx context.Context, campID uuid.UUID) ([]Camper, error) {
    tenant := middleware.GetTenantContext(ctx)
    var campers []Camper
    
    err := r.db.Where("tenant_id = ? AND camp_id = ?", 
        tenant.TenantID, campID).
        Find(&campers).Error
        
    return campers, err
}

// GORM scopes for automatic tenant filtering
func TenantScope(tenantID uuid.UUID) func(db *gorm.DB) *gorm.DB {
    return func(db *gorm.DB) *gorm.DB {
        return db.Where("tenant_id = ?", tenantID)
    }
}

// Usage
db.Scopes(TenantScope(tenantID)).Find(&campers)
```

## 8. Technology Stack

**Core:**

- Go 1.22+
- PostgreSQL 16+
- Redis 7+
- **GORM v2** (ORM)

**Libraries:**

- **Web framework**: Chi router (lightweight, composable)
- **ORM**: GORM v2 with PostgreSQL driver
- **Validation**: go-playground/validator/v10
- **JWT**: golang-jwt/jwt/v5
- **Config**: viper
- **Logging**: zap (structured logging)
- **Testing**: testify, go-sqlmock
- **Migrations**: GORM AutoMigrate + custom SQL migrations
- **Redis**: go-redis/redis/v9
- **UUID**: google/uuid

**DevOps:**

- Docker & Docker Compose
- Makefile for common tasks
- GitHub Actions for CI/CD

## 9. Domain Models (Meta/Spec Structure with GORM)

All entities follow the OpenAPI meta/spec pattern with GORM tags:

```go
// Base structures
type EntityMeta struct {
    ID          uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
    Name        string     `json:"name" gorm:"type:varchar(255);not null"`
    Description string     `json:"description,omitempty" gorm:"type:text"`
    CreatedAt   time.Time  `json:"createdAt" gorm:"autoCreateTime"`
    UpdatedAt   time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
    DeletedAt   gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"` // Soft delete
}

// Example: Camper
type Camper struct {
    Meta CamperMeta `json:"meta" gorm:"embedded;embeddedPrefix:meta_"`
    Spec CamperSpec `json:"spec" gorm:"embedded;embeddedPrefix:spec_"`
}

type CamperMeta struct {
    ID        uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey"`
    CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
    UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
    DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`
}

type CamperSpec struct {
    FirstName        string         `json:"firstName" gorm:"type:varchar(100);not null;index"`
    LastName         string         `json:"lastName" gorm:"type:varchar(100);not null;index"`
    Age              int            `json:"age" gorm:"not null"`
    Gender           string         `json:"gender" gorm:"type:varchar(20);not null"`
    PhotoURL         string         `json:"photoUrl,omitempty" gorm:"type:varchar(500)"`
    RegistrationDate time.Time      `json:"registrationDate" gorm:"type:timestamp"`
    FamilyGroupID    *uuid.UUID     `json:"familyGroupId,omitempty" gorm:"type:uuid;index"`
    SessionID        *uuid.UUID     `json:"sessionId,omitempty" gorm:"type:uuid;index"`
    MedicalInfo      datatypes.JSON `json:"-" gorm:"type:jsonb"` // GORM JSON type
    ParentContact    datatypes.JSON `json:"-" gorm:"type:jsonb"`
    
    // Tenant info (not in API, used internally)
    TenantID         uuid.UUID      `json:"-" gorm:"type:uuid;not null;index:idx_camper_tenant_camp"`
    CampID           uuid.UUID      `json:"-" gorm:"type:uuid;not null;index:idx_camper_tenant_camp"`
    
    // Relations (GORM will handle these)
    FamilyGroup      *Group         `json:"-" gorm:"foreignKey:FamilyGroupID"`
    Session          *Session       `json:"-" gorm:"foreignKey:SessionID"`
}

// Table name
func (Camper) TableName() string {
    return "campers"
}

// Example: Event
type Event struct {
    Meta EventMeta `json:"meta" gorm:"embedded;embeddedPrefix:meta_"`
    Spec EventSpec `json:"spec" gorm:"embedded;embeddedPrefix:spec_"`
}

type EventMeta struct {
    ID        uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey"`
    CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
    UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
    DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`
}

type EventSpec struct {
    Title            string         `json:"title" gorm:"type:varchar(255);not null;index"`
    Description      string         `json:"description,omitempty" gorm:"type:text"`
    StartTime        time.Time      `json:"startDate" gorm:"type:timestamptz;not null;index"`
    EndTime          time.Time      `json:"endDate" gorm:"type:timestamptz;not null;index"`
    LocationID       *uuid.UUID     `json:"locationId,omitempty" gorm:"type:uuid;index"`
    ProgramID        *uuid.UUID     `json:"programId,omitempty" gorm:"type:uuid"`
    ActivityID       *uuid.UUID     `json:"activityId,omitempty" gorm:"type:uuid"`
    ColorID          *uuid.UUID     `json:"colorId,omitempty" gorm:"type:uuid"`
    Capacity         int            `json:"capacity,omitempty" gorm:"type:int"`
    RecurrenceID     *uuid.UUID     `json:"recurrenceId,omitempty" gorm:"type:uuid;index"`
    IsRecurrenceParent bool         `json:"isRecurrenceParent,omitempty" gorm:"default:false"`
    RecurrenceRule   datatypes.JSON `json:"-" gorm:"type:jsonb"`
    
    // Tenant info
    TenantID         uuid.UUID      `json:"-" gorm:"type:uuid;not null;index:idx_event_tenant_camp"`
    CampID           uuid.UUID      `json:"-" gorm:"type:uuid;not null;index:idx_event_tenant_camp"`
    SessionID        *uuid.UUID     `json:"sessionId,omitempty" gorm:"type:uuid;index"`
    
    // Relations
    Location         *Location      `json:"-" gorm:"foreignKey:LocationID"`
    Program          *Program       `json:"-" gorm:"foreignKey:ProgramID"`
    Activity         *Activity      `json:"-" gorm:"foreignKey:ActivityID"`
    Enrollments      []EventEnrollment `json:"-" gorm:"foreignKey:EventID"`
    Groups           []Group        `json:"-" gorm:"many2many:event_groups;"`
}

func (Event) TableName() string {
    return "events"
}
```

## 10. Migration from Frontend

### Phase 1: API Implementation

1. Set up database schema with GORM models and migrations
2. Implement core CRUD endpoints
3. Add authentication & multi-tenancy (JWT with tenant_id)
4. Set up Redis caching

### Phase 2: Frontend Integration

1. Replace localStorage calls with API calls
2. Add authentication flow with JWT
3. Update error handling
4. Test all existing features

### Phase 3: Advanced Features

1. Real-time updates (WebSockets)
2. Background jobs (event reminders, reports)
3. File uploads (photos, documents)
4. Advanced reporting

## 11. Next Steps

1. **Set up project structure** - Initialize Go modules, directory structure
2. **Database setup** - Create GORM models, configure PostgreSQL connection
3. **Core services** - Implement tenant, auth services first
4. **API endpoints** - Build REST handlers progressively
5. **Testing** - Unit tests per service, integration tests
6. **Documentation** - API docs with Swagger/OpenAPI
7. **Deployment** - Docker setup, CI/CD pipeline

### To-dos

- [ ] Initialize Go project structure with modules, directories, and dependencies
- [ ] Create PostgreSQL database schema with migrations for all tables and indexes
- [ ] Implement domain models (entities) for all core types
- [ ] Build repository layer with PostgreSQL implementations for data access
- [ ] Implement authentication service with JWT, user management, and permissions
- [ ] Create multi-tenancy middleware for organization and camp context extraction
- [ ] Implement business logic services for tenant, people, scheduling, resources, programs, and groups
- [ ] Build REST API handlers and routes for all endpoints with proper middleware
- [ ] Set up Redis caching layer with cache patterns and invalidation strategies
- [ ] Implement request validation and error handling with proper status codes
- [ ] Create unit tests for services and integration tests for API endpoints
- [ ] Set up Docker and docker-compose for local development and deployment