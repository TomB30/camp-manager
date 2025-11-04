# Database Migrations Implementation Summary

## Overview

This document summarizes the implementation of database migrations and domain models for the Camp Manager backend, focusing on the core multi-tenant entities: **Tenants**, **Camps**, and **Users**.

## What Was Implemented

### 1. Domain Models (`internal/domain/`)

Created GORM-based domain models that align with both the architecture plan and OpenAPI schemas:

#### **tenant.go**
- `Tenant` model with full multi-tenancy support
- Fields: id, name, description, slug, subscription_tier, max_camps, settings
- Soft delete support with `DeletedAt`
- Relations to camps and users

#### **camp.go**
- `Camp` model with meta/spec structure
- Core fields: id, tenant_id, name, description
- Spec fields: start_date, end_date, daily times, timezone
- JSONB fields: address, contact_info, settings
- Custom types: `Address` and `Contact` with JSON marshaling
- Relations to tenant and access rules

#### **user.go**
- `User` model with authentication support
- Fields: id, tenant_id, email, password_hash, role, etc.
- Security: password_hash never exposed in JSON
- Relations to tenant, access rules, and refresh tokens
- `RefreshToken` sub-model for JWT token management

#### **access_rule.go**
- `AccessRule` model for granular permissions
- Implements the OpenAPI `AccessRule` schema
- Three scope types: system, tenant, camp
- Three role types: admin, program-admin, viewer
- Helper methods: `IsSystemScope()`, `IsTenantScope()`, `IsCampScope()`

#### **password.go**
- Password hashing utilities using bcrypt
- Functions: `HashPassword()`, `CheckPassword()`, `GenerateRandomToken()`
- Default bcrypt cost: 10 (good balance of security and performance)

### 2. Migration System (`internal/database/`)

#### **migrations.go**
Comprehensive GORM-based migration system with:

**Core Functions:**
- `RunMigrations()` - Auto-migrate all tables with indexes and constraints
- `createIndexes()` - Create composite and partial indexes
- `createConstraints()` - Add CHECK constraints for data validation
- `DropAllTables()` - Clean database (for testing)
- `SeedData()` - Populate demo data for development

**Indexes Created:**
- Multi-tenant isolation indexes (tenant_id + other fields)
- Authentication indexes (email lookups)
- Permission indexes (user_id + scope_type)
- Performance indexes (name searches, active tokens)

**Constraints Added:**
- Valid subscription tiers (free, basic, premium, enterprise)
- Valid user roles (tenant_admin, camp_admin, staff, parent)
- Valid access rule roles (admin, program-admin, viewer)
- Valid scope types (system, tenant, camp)
- Date validation (end_date >= start_date)
- Time format validation (HH:MM)

#### **migrations/001_init_tenants_camps_users.sql**
Reference SQL migration file with:
- Complete CREATE TABLE statements
- All indexes explicitly defined
- CHECK constraints
- Foreign key relationships with CASCADE delete
- Triggers for `updated_at` timestamps
- Comprehensive comments for documentation

### 3. Migration Commands

#### **cmd/migrate/main.go**
Standalone migration CLI tool with actions:
- `up` - Run migrations
- `down` - Drop all tables (with confirmation)
- `seed` - Seed demo data
- `reset` - Drop, migrate, and seed (with confirmation)

#### **Integration with API Server**
Updated `cmd/api/main.go` to automatically run migrations on startup.

#### **Makefile Targets**
Added convenient make commands:
```bash
make migrate-up      # Run migrations
make migrate-down    # Drop tables
make migrate-seed    # Seed data
make migrate-reset   # Reset database
```

### 4. Documentation

#### **internal/database/README.md**
Comprehensive documentation covering:
- Database schema overview
- Table descriptions and key fields
- Index and constraint details
- Migration usage instructions
- Domain model examples
- GORM features used
- Seed data credentials
- Configuration guide
- Best practices
- Troubleshooting tips
- Future enhancements

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│    Tenants      │
│  (Root Entity)  │
└────────┬────────┘
         │
         │ 1:many
         │
    ┌────┴─────┬───────────────┐
    │          │               │
    ▼          ▼               ▼
┌────────┐ ┌───────┐     ┌─────────────┐
│ Camps  │ │ Users │────▶│ Access Rules│
└────────┘ └───┬───┘     └──────┬──────┘
               │                 │
               │ 1:many          │ scope_id
               │                 │
               ▼                 ▼
        ┌────────────┐    ┌──────────┐
        │   Refresh  │    │  Tenant  │
        │   Tokens   │    │  or Camp │
        └────────────┘    └──────────┘
```

### Key Design Decisions

1. **UUID Primary Keys**: All entities use UUIDs for global uniqueness and security
2. **Soft Deletes**: Most entities support recovery with `deleted_at` timestamps
3. **JSONB Fields**: Flexible storage for addresses, contacts, and settings
4. **Denormalized tenant_id**: Included in child tables for query optimization
5. **Cascade Deletes**: Foreign keys cascade for data integrity
6. **Multi-level Access Control**: System → Tenant → Camp hierarchy

## OpenAPI Alignment

### User Schema Mapping

**OpenAPI Schema** (`api/schemas/User.yaml`):
```yaml
properties:
  id: string
  email: string (format: email)
  tenantId: string
  accessRules: array of AccessRule
```

**Domain Model** (`internal/domain/user.go`):
```go
type User struct {
    ID          uuid.UUID      `json:"id"`
    Email       string         `json:"email"`
    TenantID    uuid.UUID      `json:"tenantId"`
    AccessRules []AccessRule   `json:"accessRules,omitempty"`
    // ... additional fields
}
```

### AccessRule Schema Mapping

**OpenAPI Schema** (`api/schemas/AccessRule.yaml`):
```yaml
properties:
  role: string (enum: admin, program-admin, viewer)
  scopeType: string (enum: system, tenant, camp)
  scopeId: string (nullable)
```

**Domain Model** (`internal/domain/access_rule.go`):
```go
type AccessRule struct {
    Role      string     `json:"role"`
    ScopeType string     `json:"scopeType"`
    ScopeID   *uuid.UUID `json:"scopeId,omitempty"`
    // ... additional fields
}
```

### Camp Schema Mapping

**OpenAPI Schema** (`api/schemas/Camp.yaml`):
```yaml
properties:
  meta:
    id, tenantId, name, description, createdAt, updatedAt
  spec:
    startDate, endDate, dailyStartTime, dailyEndTime, address, contactInfo, logoUrl
```

**Domain Model** (`internal/domain/camp.go`):
```go
type Camp struct {
    // Meta fields
    ID          uuid.UUID
    TenantID    uuid.UUID
    Name        string
    Description string
    CreatedAt   time.Time
    UpdatedAt   time.Time
    
    // Spec fields
    StartDate      time.Time
    EndDate        time.Time
    DailyStartTime string
    DailyEndTime   string
    Address        Address  // JSONB
    ContactInfo    Contact  // JSONB
    LogoURL        string
    // ...
}
```

## Demo Data

Running `make migrate-seed` creates:

**Demo Tenant:**
- Organization: "Demo Camp Organization"
- Slug: `demo-camp`
- Tier: Premium (10 camps allowed)

**Demo User:**
- Email: `admin@democamp.com`
- Password: `password123` (bcrypt hashed)
- Role: tenant_admin
- Access: System-level admin (full access)

⚠️ **Important**: Change these credentials in production!

## Testing the Implementation

### 1. Start PostgreSQL
```bash
make docker-up
```

### 2. Run Migrations
```bash
make migrate-up
```

### 3. Seed Demo Data
```bash
make migrate-seed
```

### 4. Verify Database
```bash
psql -h localhost -U postgres -d camp_manager
\dt                 # List all tables
SELECT * FROM tenants;
SELECT * FROM users;
SELECT * FROM access_rules;
```

### 5. Start API Server
```bash
make run
```

The server will automatically run migrations on startup.

## Files Created

```
backend/
├── cmd/
│   └── migrate/
│       └── main.go                          # NEW: Migration CLI tool
├── internal/
│   ├── database/
│   │   ├── migrations.go                    # NEW: GORM migrations
│   │   ├── migrations/
│   │   │   └── 001_init_tenants_camps_users.sql  # NEW: SQL reference
│   │   └── README.md                        # NEW: Database docs
│   └── domain/
│       ├── tenant.go                        # NEW: Tenant model
│       ├── camp.go                          # NEW: Camp model
│       ├── user.go                          # NEW: User & RefreshToken models
│       ├── access_rule.go                   # NEW: AccessRule model
│       └── password.go                      # NEW: Password utilities
├── Makefile                                 # UPDATED: Added migration targets
├── go.mod                                   # UPDATED: golang.org/x/crypto direct
└── MIGRATIONS_IMPLEMENTATION.md             # NEW: This document
```

## Next Steps

### Immediate
- [ ] Test migrations with PostgreSQL
- [ ] Verify seed data creation
- [ ] Test password hashing/validation
- [ ] Update repository implementations to use domain models

### Short Term
- [ ] Implement authentication endpoints (login, register, refresh)
- [ ] Add middleware for JWT validation
- [ ] Add middleware for tenant context extraction
- [ ] Create repository implementations for CRUD operations
- [ ] Add unit tests for domain models

### Medium Term
- [ ] Implement remaining entities (sessions, campers, staff, events, groups)
- [ ] Add migration versioning system
- [ ] Add database backup/restore utilities
- [ ] Add performance monitoring
- [ ] Add caching layer (Redis)

### Long Term
- [ ] Add read replicas for scaling
- [ ] Add database sharding for multi-tenancy
- [ ] Add audit logging
- [ ] Add data retention policies
- [ ] Add GDPR compliance features

## Key Benefits

1. **Type Safety**: GORM models provide compile-time type checking
2. **Developer Experience**: Auto-migration reduces manual SQL writing
3. **Flexibility**: Can switch to manual migrations when needed
4. **Documentation**: Comprehensive docs and comments
5. **Testing**: Easy database reset for integration tests
6. **Security**: Bcrypt password hashing, prepared statements
7. **Performance**: Optimized indexes for common queries
8. **Scalability**: Multi-tenant architecture ready to scale

## References

- [Architecture Plan](../../../.cursor/plans/go-backend-architecture-830a5b47.plan.md)
- [OpenAPI Spec](../../../api/openapi-bundled.yaml)
- [Database README](internal/database/README.md)
- [GORM Documentation](https://gorm.io/docs/)

## Support

For issues or questions:
1. Check the [Database README](internal/database/README.md) for common issues
2. Review the architecture plan for design decisions
3. Check GORM documentation for ORM-specific questions

