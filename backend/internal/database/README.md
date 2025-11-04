# Database Layer

This directory contains the database connection setup, migrations, and related utilities for the Camp Manager backend.

## Overview

The database layer is built on top of:
- **PostgreSQL 16+** - Primary database
- **GORM v2** - ORM for Go
- **UUID** - All entities use UUIDs as primary keys
- **Soft Deletes** - Most entities support soft deletion with `deleted_at` timestamps

## Structure

```
database/
├── postgres.go          # Database connection and configuration
├── migrations.go        # GORM-based migrations
├── migrations/          # SQL migration files (for reference)
│   └── 001_init_tenants_camps_users.sql
└── README.md           # This file
```

## Running Migrations

### Using Make (Recommended)

```bash
# Run migrations (create/update tables)
make migrate-up

# Seed database with demo data
make migrate-seed

# Drop all tables (DESTRUCTIVE!)
make migrate-down

# Reset database (drop, migrate, seed)
make migrate-reset
```

### Using Go Command Directly

```bash
# Run migrations
go run cmd/migrate/main.go -action=up

# Seed database
go run cmd/migrate/main.go -action=seed

# Drop all tables
go run cmd/migrate/main.go -action=down

# Reset database
go run cmd/migrate/main.go -action=reset
```

### Automatic Migrations

The API server automatically runs migrations on startup, so you don't need to manually migrate before running the server:

```bash
make run  # or go run cmd/api/main.go
```

## Database Schema

### Core Tables

#### tenants
Top-level organization entity. Can represent a single camp or multi-camp organization.

**Key Fields:**
- `id` - UUID primary key
- `name` - Organization name
- `slug` - URL-safe identifier for subdomain routing
- `subscription_tier` - Subscription level (free, basic, premium, enterprise)
- `max_camps` - Maximum camps allowed

#### camps
Individual camps within a tenant organization.

**Key Fields:**
- `id` - UUID primary key
- `tenant_id` - Foreign key to tenants
- `name` - Camp name
- `start_date`, `end_date` - Overall camp season dates
- `daily_start_time`, `daily_end_time` - Daily schedule (HH:MM format)
- `address` - JSONB address object
- `contact_info` - JSONB contact information
- `timezone` - IANA timezone (e.g., "America/New_York")

#### users
User accounts with authentication credentials.

**Key Fields:**
- `id` - UUID primary key
- `tenant_id` - Foreign key to tenants
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `role` - System role (tenant_admin, camp_admin, staff, parent)
- `is_active` - Account status
- `email_verified` - Email verification status

#### access_rules
User access permissions at different scope levels.

**Key Fields:**
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `role` - Role at this scope (admin, program-admin, viewer)
- `scope_type` - Scope level (system, tenant, camp)
- `scope_id` - ID of tenant or camp (null for system scope)

#### refresh_tokens
JWT refresh tokens for maintaining user sessions.

**Key Fields:**
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `token_hash` - Hashed refresh token
- `expires_at` - Token expiration timestamp
- `revoked` - Whether token has been revoked

### Indexes

The following indexes are automatically created for optimal query performance:

**Multi-tenant Isolation:**
- `idx_camps_tenant_id_created_at` - Camp listing by tenant
- `idx_users_tenant_id_email` - User lookups by tenant

**Authentication & Authorization:**
- `idx_users_email` - User login lookups
- `idx_access_rules_user_id_scope_type` - Permission checks
- `idx_refresh_tokens_user_id_revoked_expires` - Active token lookups

**Performance:**
- `idx_tenants_name` - Tenant name search
- `idx_camps_tenant_id_name` - Camp name search

### Constraints

**Check Constraints:**
- Subscription tier must be valid (free, basic, premium, enterprise)
- User role must be valid (tenant_admin, camp_admin, staff, parent)
- Access rule role must be valid (admin, program-admin, viewer)
- Access rule scope type must be valid (system, tenant, camp)
- Camp end date must be >= start date
- Daily times must be in HH:MM format

**Foreign Keys:**
- All foreign keys have CASCADE delete behavior for data integrity
- Soft deletes are used where appropriate to preserve historical data

## Domain Models

Domain models are defined in `internal/domain/` and map directly to database tables:

```go
// Example: User model
type User struct {
    ID            uuid.UUID      `gorm:"type:uuid;primaryKey"`
    TenantID      uuid.UUID      `gorm:"type:uuid;not null;index"`
    Email         string         `gorm:"type:varchar(255);uniqueIndex;not null"`
    PasswordHash  string         `gorm:"type:varchar(255);not null"`
    // ... more fields
    CreatedAt     time.Time      `gorm:"autoCreateTime"`
    UpdatedAt     time.Time      `gorm:"autoUpdateTime"`
    DeletedAt     gorm.DeletedAt `gorm:"index"`
    
    // Relations
    Tenant       Tenant        `gorm:"foreignKey:TenantID"`
    AccessRules  []AccessRule  `gorm:"foreignKey:UserID"`
}
```

### GORM Features Used

- **AutoMigrate** - Automatic table creation and updates
- **Soft Deletes** - `gorm.DeletedAt` for recoverable deletions
- **Hooks** - `BeforeCreate` for UUID generation
- **Relations** - One-to-many and many-to-many relationships
- **JSONB** - Native PostgreSQL JSON support for flexible fields
- **Indexes** - Composite and partial indexes for performance

## Seed Data

The `migrate-seed` command creates demo data for development:

**Demo Tenant:**
- Name: "Demo Camp Organization"
- Slug: "demo-camp"
- Tier: Premium
- Max Camps: 10

**Demo User:**
- Email: admin@democamp.com
- Password: password123
- Role: tenant_admin
- Access: System-level admin

⚠️ **Security Note:** Change the demo credentials in production!

## Connection Configuration

Database connection is configured via environment variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=camp_manager
DB_SSLMODE=disable
DB_MAX_IDLE_CONNS=10
DB_MAX_OPEN_CONNS=100
DB_CONN_MAX_LIFETIME=1h
```

See `internal/config/config.go` for full configuration options.

## Best Practices

### Multi-Tenancy
- Always filter queries by `tenant_id`
- Use GORM scopes for automatic tenant filtering
- Denormalize `tenant_id` on related tables for query performance

### Performance
- Use indexes for frequently queried columns
- Preload related data to avoid N+1 queries
- Use connection pooling (configured in postgres.go)
- Consider caching for frequently accessed data

### Security
- Never expose `password_hash` in JSON responses
- Use bcrypt for password hashing (cost factor: 10)
- Validate and sanitize all inputs
- Use prepared statements (GORM does this automatically)

### Migrations
- Test migrations on a copy of production data
- Always backup before running migrations
- Review auto-generated migrations before applying
- Consider downgrade migrations for production

## Troubleshooting

### Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
make docker-logs

# Test connection
psql -h localhost -U postgres -d camp_manager
```

### Migration Issues

```bash
# Check GORM debug output
# Set log level to "debug" in config

# Manually inspect database
psql -h localhost -U postgres -d camp_manager
\dt  # List tables
\d users  # Describe users table
```

### Vendor Issues

```bash
# Update vendor directory after adding dependencies
go mod vendor

# Verify dependencies
go mod verify
```

## Future Enhancements

- [ ] Add migration versioning (e.g., golang-migrate)
- [ ] Add database seeding for all entities
- [ ] Add database backup/restore utilities
- [ ] Add performance monitoring
- [ ] Add database connection health checks
- [ ] Add read replicas for scaling
- [ ] Add database sharding for multi-tenancy

## References

- [GORM Documentation](https://gorm.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Go Database/SQL Tutorial](https://go.dev/doc/database/overview)

