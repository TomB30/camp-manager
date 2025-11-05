package database

import (
	"fmt"

	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// RunMigrations executes all database migrations
func (d *Database) RunMigrations() error {
	// AutoMigrate will create tables, missing columns and missing indexes
	// It will NOT change existing column types or delete unused columns
	err := d.DB.AutoMigrate(
		&domain.Tenant{},
		&domain.Camp{},
		&domain.User{},
		&domain.AccessRule{},
		&domain.RefreshToken{},
	)
	if err != nil {
		return fmt.Errorf("failed to run auto migrations: %w", err)
	}

	// Run custom migrations for indexes and constraints
	if err := d.createIndexes(); err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}

	// Run custom migrations for constraints
	if err := d.createConstraints(); err != nil {
		return fmt.Errorf("failed to create constraints: %w", err)
	}

	return nil
}

// createIndexes creates additional indexes not handled by GORM tags
func (d *Database) createIndexes() error {
	// Composite indexes for multi-tenant isolation
	indexes := []string{
		// Tenants - name search
		"CREATE INDEX IF NOT EXISTS idx_tenants_name ON tenants(name)",
		
		// Camps - tenant isolation and listing
		"CREATE INDEX IF NOT EXISTS idx_camps_tenant_id_created_at ON camps(tenant_id, created_at DESC)",
		"CREATE INDEX IF NOT EXISTS idx_camps_tenant_id_name ON camps(tenant_id, name)",
		
		// Users - tenant isolation
		"CREATE INDEX IF NOT EXISTS idx_users_tenant_id_email ON users(tenant_id, email)",
		"CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL",
		
		// Access Rules - user and scope lookups
		"CREATE INDEX IF NOT EXISTS idx_access_rules_user_id_scope_type ON access_rules(user_id, scope_type)",
		"CREATE INDEX IF NOT EXISTS idx_access_rules_scope_type_scope_id ON access_rules(scope_type, scope_id) WHERE scope_id IS NOT NULL",
		
		// Refresh Tokens - active token lookups
		"CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id_revoked_expires ON refresh_tokens(user_id, revoked, expires_at)",
	}

	for _, idx := range indexes {
		if err := d.DB.Exec(idx).Error; err != nil {
			return fmt.Errorf("failed to create index: %w", err)
		}
	}

	return nil
}

// createConstraints creates additional constraints not handled by GORM tags
func (d *Database) createConstraints() error {
	constraints := []string{
		// Ensure subscription tier is valid
		"ALTER TABLE tenants DROP CONSTRAINT IF EXISTS check_subscription_tier",
		"ALTER TABLE tenants ADD CONSTRAINT check_subscription_tier CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise'))",
		
		// Ensure access rule role is valid
		"ALTER TABLE access_rules DROP CONSTRAINT IF EXISTS check_access_rule_role",
		"ALTER TABLE access_rules ADD CONSTRAINT check_access_rule_role CHECK (role IN ('admin', 'program-admin', 'viewer'))",
		
		// Ensure access rule scope type is valid
		"ALTER TABLE access_rules DROP CONSTRAINT IF EXISTS check_access_rule_scope_type",
		"ALTER TABLE access_rules ADD CONSTRAINT check_access_rule_scope_type CHECK (scope_type IN ('system', 'tenant', 'camp'))",
		
		// Ensure camp dates are valid
		"ALTER TABLE camps DROP CONSTRAINT IF EXISTS check_camp_dates",
		"ALTER TABLE camps ADD CONSTRAINT check_camp_dates CHECK (end_date >= start_date)",
		
		// Ensure daily times are in HH:MM format
		"ALTER TABLE camps DROP CONSTRAINT IF EXISTS check_daily_start_time",
		"ALTER TABLE camps ADD CONSTRAINT check_daily_start_time CHECK (daily_start_time ~ '^([0-1][0-9]|2[0-3]):[0-5][0-9]$')",
		
		"ALTER TABLE camps DROP CONSTRAINT IF EXISTS check_daily_end_time",
		"ALTER TABLE camps ADD CONSTRAINT check_daily_end_time CHECK (daily_end_time ~ '^([0-1][0-9]|2[0-3]):[0-5][0-9]$')",
	}

	for _, constraint := range constraints {
		if err := d.DB.Exec(constraint).Error; err != nil {
			// Log but don't fail on constraint errors (they might already exist)
			fmt.Printf("Warning: failed to create constraint: %v\n", err)
		}
	}

	return nil
}

// DropAllTables drops all tables (use with caution - for testing only)
func (d *Database) DropAllTables() error {
	return d.DB.Migrator().DropTable(
		&domain.RefreshToken{},
		&domain.AccessRule{},
		&domain.User{},
		&domain.Camp{},
		&domain.Tenant{},
	)
}

// SeedData populates the database with initial data for development
func (d *Database) SeedData() error {
	// Check if data already exists
	var count int64
	d.DB.Model(&domain.Tenant{}).Count(&count)
	if count > 0 {
		return nil // Already seeded
	}

	// Create a default tenant
	tenant := &domain.Tenant{
		Name:             "Demo Camp Organization",
		Description:      "A demonstration camp organization",
		Slug:             "demo-camp",
		SubscriptionTier: "premium",
		MaxCamps:         10,
	}

	if err := d.DB.Create(tenant).Error; err != nil {
		return fmt.Errorf("failed to create seed tenant: %w", err)
	}

	// Create a default user (password: "password123")
	passwordHash, err := domain.HashPassword("password123")
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	user := &domain.User{
		TenantID:      tenant.ID,
		Email:         "admin@democamp.com",
		PasswordHash:  passwordHash,
		FirstName:     "Admin",
		LastName:      "User",
		IsActive:      true,
		EmailVerified: true,
	}

	if err := d.DB.Create(user).Error; err != nil {
		return fmt.Errorf("failed to create seed user: %w", err)
	}

	// Create system-level access rule for admin
	accessRule := &domain.AccessRule{
		UserID:    user.ID,
		Role:      "admin",
		ScopeType: "system",
		ScopeID:   nil,
	}

	if err := d.DB.Create(accessRule).Error; err != nil {
		return fmt.Errorf("failed to create seed access rule: %w", err)
	}

	return nil
}

