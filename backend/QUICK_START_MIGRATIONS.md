# Quick Start: Database Migrations

## Prerequisites

1. PostgreSQL running:
```bash
make docker-up
```

## Running Migrations

### Option 1: Using Makefile (Recommended)

```bash
# Run migrations only
make migrate-up

# Run migrations + seed demo data
make migrate-seed

# Reset database (drop + migrate + seed)
make migrate-reset
```

### Option 2: Using Migration CLI

```bash
# Run migrations
go run cmd/migrate/main.go -action=up

# Seed demo data
go run cmd/migrate/main.go -action=seed

# Reset database
go run cmd/migrate/main.go -action=reset
```

### Option 3: Automatic on Server Start

```bash
# Migrations run automatically when starting the server
make run
```

## Demo Credentials (After Seeding)

- **Email**: admin@democamp.com
- **Password**: password123
- **Role**: tenant_admin (system-level access)

## Verify Database

```bash
# Connect to database
docker exec -it camp-manager-postgres psql -U postgres -d camp_manager

# List tables
\dt

# View data
SELECT * FROM tenants;
SELECT * FROM users;
SELECT email, role, is_active FROM users;
SELECT u.email, ar.role, ar.scope_type, ar.scope_id FROM users u JOIN access_rules ar ON u.id = ar.user_id;

# Exit
\q
```

## Database Schema

### Tables Created

1. **tenants** - Top-level organizations
2. **camps** - Individual camps within tenants
3. **users** - User accounts with authentication
4. **access_rules** - Granular permissions (system/tenant/camp level)
5. **refresh_tokens** - JWT refresh token management

### Key Features

- ✅ UUID primary keys on all tables
- ✅ Soft deletes with `deleted_at` timestamps
- ✅ JSONB fields for flexible data (address, contact info, settings)
- ✅ Bcrypt password hashing (cost factor: 10)
- ✅ Foreign key constraints with CASCADE delete
- ✅ CHECK constraints for data validation
- ✅ Optimized indexes for multi-tenant queries
- ✅ Automatic `updated_at` triggers

## Troubleshooting

### PostgreSQL not running
```bash
make docker-up
# Wait a few seconds for PostgreSQL to start
```

### Connection refused
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
make docker-logs
```

### Migration errors
```bash
# Reset database completely
make migrate-reset

# Or drop and recreate manually
make migrate-down
make migrate-up
```

### Go version mismatch
```bash
# Use Docker to build instead
make docker-build
```

## Next Steps

After running migrations:

1. **Test Authentication** - Implement auth endpoints
2. **Test Repositories** - Update repository layer to use domain models
3. **Add More Entities** - Migrate remaining entities (sessions, campers, staff, etc.)
4. **Add Tests** - Write integration tests for migrations

## File Structure

```
backend/
├── cmd/
│   ├── api/main.go           # Auto-runs migrations on startup
│   └── migrate/main.go       # Standalone migration CLI
├── internal/
│   ├── database/
│   │   ├── migrations.go     # GORM migration functions
│   │   └── migrations/       # SQL reference files
│   └── domain/               # GORM domain models
│       ├── tenant.go
│       ├── camp.go
│       ├── user.go
│       ├── access_rule.go
│       └── password.go
└── Makefile                  # Migration commands
```

## Important Notes

⚠️ **Production Considerations:**

- Change demo credentials immediately
- Review and test migrations on staging first
- Always backup production data before migrating
- Consider using migration versioning tools for production
- Set up proper database access controls
- Use environment-specific configuration
- Enable SSL for database connections
- Set up monitoring and alerting

## Documentation

For detailed information:

- **Database Design**: See `internal/database/README.md`
- **Implementation Details**: See `MIGRATIONS_IMPLEMENTATION.md`
- **Architecture Plan**: See `.cursor/plans/go-backend-architecture-830a5b47.plan.md`

