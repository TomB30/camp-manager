package database

import (
	"embed"
	"fmt"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/tbechar/camp-manager-backend/internal/domain"
)

//go:embed migrations/up/*.sql
//go:embed migrations/down/*.sql
var migrationFiles embed.FS

// RunMigrations executes all pending "up" migrations
func (d *Database) RunMigrations() error {
	// Create migrations tracking table if it doesn't exist
	if err := d.createMigrationsTable(); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Read all up migration files
	entries, err := migrationFiles.ReadDir("migrations/up")
	if err != nil {
		return fmt.Errorf("failed to read migration files: %w", err)
	}

	// Collect up migrations and extract base names
	type migration struct {
		baseName string
		upFile   string
		downFile string
	}

	var migrations []*migration

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".up.sql") {
			continue
		}

		upFileName := entry.Name()
		baseName := strings.TrimSuffix(upFileName, ".up.sql")
		downFileName := baseName + ".down.sql"

		// Verify corresponding down migration exists
		downPath := filepath.Join("migrations", "down", downFileName)
		if _, err := migrationFiles.ReadFile(downPath); err != nil {
			return fmt.Errorf("missing down migration for %s (expected %s)", upFileName, downFileName)
		}

		migrations = append(migrations, &migration{
			baseName: baseName,
			upFile:   upFileName,
			downFile: downFileName,
		})
	}

	// Sort migrations by base name
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].baseName < migrations[j].baseName
	})

	// Execute each migration that hasn't been run yet
	for _, mig := range migrations {
		// Check if migration has already been run
		var count int64
		d.DB.Raw("SELECT COUNT(*) FROM schema_migrations WHERE version = ?", mig.baseName).Scan(&count)
		if count > 0 {
			fmt.Printf("Migration %s already applied, skipping\n", mig.baseName)
			continue
		}

		// Read up migration file
		content, err := migrationFiles.ReadFile(filepath.Join("migrations", "up", mig.upFile))
		if err != nil {
			return fmt.Errorf("failed to read migration %s: %w", mig.upFile, err)
		}

		fmt.Printf("Running migration: %s\n", mig.baseName)

		// Execute migration in a transaction
		tx := d.DB.Begin()
		if err := tx.Exec(string(content)).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to execute migration %s: %w", mig.baseName, err)
		}

		// Record migration (store base name)
		if err := tx.Exec("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)", mig.baseName, time.Now()).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to record migration %s: %w", mig.baseName, err)
		}

		if err := tx.Commit().Error; err != nil {
			return fmt.Errorf("failed to commit migration %s: %w", mig.baseName, err)
		}

		fmt.Printf("Successfully applied migration: %s\n", mig.baseName)
	}

	return nil
}

// RollbackMigration rolls back the last applied migration
func (d *Database) RollbackMigration() error {
	// Get the last applied migration (base name)
	var lastMigration string
	err := d.DB.Raw("SELECT version FROM schema_migrations ORDER BY applied_at DESC LIMIT 1").Scan(&lastMigration).Error
	if err != nil {
		return fmt.Errorf("failed to get last migration: %w", err)
	}

	if lastMigration == "" {
		fmt.Println("No migrations to rollback")
		return nil
	}

	// Construct down migration filename
	downFileName := lastMigration + ".down.sql"
	downPath := filepath.Join("migrations", "down", downFileName)
	content, err := migrationFiles.ReadFile(downPath)
	if err != nil {
		return fmt.Errorf("failed to read down migration %s: %w", downFileName, err)
	}

	fmt.Printf("Rolling back migration: %s\n", lastMigration)

	// Execute rollback in a transaction
	tx := d.DB.Begin()
	if err := tx.Exec(string(content)).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to execute down migration %s: %w", lastMigration, err)
	}

	// Remove migration record
	if err := tx.Exec("DELETE FROM schema_migrations WHERE version = ?", lastMigration).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to remove migration record %s: %w", lastMigration, err)
	}

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit rollback %s: %w", lastMigration, err)
	}

	fmt.Printf("Successfully rolled back migration: %s\n", lastMigration)
	return nil
}

// RollbackAll rolls back all applied migrations
func (d *Database) RollbackAll() error {
	for {
		var count int64
		d.DB.Raw("SELECT COUNT(*) FROM schema_migrations").Scan(&count)
		if count == 0 {
			fmt.Println("All migrations rolled back")
			return nil
		}

		if err := d.RollbackMigration(); err != nil {
			return err
		}
	}
}

// createMigrationsTable creates a table to track which migrations have been run
func (d *Database) createMigrationsTable() error {
	return d.DB.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`).Error
}

// DropAllTables drops all tables (use with caution - for testing only)
func (d *Database) DropAllTables() error {
	tables := []string{
		"areas",
		"certifications",
		"colors",
		"refresh_tokens",
		"access_rules",
		"users",
		"camps",
		"tenants",
		"schema_migrations",
	}

	for _, table := range tables {
		if err := d.DB.Exec(fmt.Sprintf("DROP TABLE IF EXISTS %s CASCADE", table)).Error; err != nil {
			return fmt.Errorf("failed to drop table %s: %w", table, err)
		}
	}

	return nil
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

	// Create a default camp
	startDate, _ := time.Parse("2006-01-02", "2025-06-15")
	endDate, _ := time.Parse("2006-01-02", "2025-08-15")

	camp := &domain.Camp{
		TenantID:       tenant.ID,
		Name:           "Summer Camp 2025",
		Description:    "Demo summer camp for testing",
		StartDate:      startDate,
		EndDate:        endDate,
		DailyStartTime: "08:00",
		DailyEndTime:   "17:00",
		Timezone:       "America/New_York",
	}

	if err := d.DB.Create(camp).Error; err != nil {
		return fmt.Errorf("failed to create seed camp: %w", err)
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

	// Create some default colors for testing
	colors := []domain.Color{
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Red",
			Description: "Bright red color for high-energy activities",
			HexValue:    "#FF0000",
			Default:     true,
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Blue",
			Description: "Calming blue for water activities",
			HexValue:    "#0000FF",
			Default:     false,
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Green",
			Description: "Nature green for outdoor activities",
			HexValue:    "#00FF00",
			Default:     false,
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Yellow",
			Description: "Sunny yellow for morning activities",
			HexValue:    "#FFFF00",
			Default:     false,
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Purple",
			Description: "Creative purple for arts and crafts",
			HexValue:    "#800080",
			Default:     false,
		},
	}

	for _, color := range colors {
		if err := d.DB.Create(&color).Error; err != nil {
			return fmt.Errorf("failed to create seed color: %w", err)
		}
	}

	// Create some default areas for testing
	areas := []domain.Area{
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Main Field",
			Description: "Large open field for sports and outdoor activities",
			Capacity:    100,
			Equipment:   []string{"Soccer goals", "Frisbees", "Cones", "Portable bleachers"},
			Notes:       "Check for drainage after heavy rain",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Arts & Crafts Cabin",
			Description: "Indoor space dedicated to creative activities",
			Capacity:    30,
			Equipment:   []string{"Tables", "Chairs", "Paint supplies", "Clay", "Easels"},
			Notes:       "Air conditioning available",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Swimming Pool",
			Description: "Olympic-size outdoor pool with diving boards",
			Capacity:    75,
			Equipment:   []string{"Life jackets", "Pool noodles", "Diving boards", "Lane dividers"},
			Notes:       "Lifeguard on duty required. Chlorine levels checked daily",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Dining Hall",
			Description: "Main dining facility with industrial kitchen",
			Capacity:    200,
			Equipment:   []string{"Tables", "Benches", "Stage", "PA system", "Kitchen equipment"},
			Notes:       "Can also be used for assemblies and evening programs",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Nature Trail",
			Description: "1.5 mile hiking trail through the woods",
			Capacity:    40,
			Equipment:   []string{"Trail markers", "Benches", "Nature identification guides"},
			Notes:       "Check for fallen trees after storms. Bug spray recommended",
		},
	}

	for _, area := range areas {
		if err := d.DB.Create(&area).Error; err != nil {
			return fmt.Errorf("failed to create seed area: %w", err)
		}
	}

	// Create some default certifications for testing
	certifications := []domain.Certification{
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "First Aid",
			Description: "Certification in first aid",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "CPR",
			Description: "Certification in CPR",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Wilderness First Aid",
			Description: "Certification in wilderness first aid",
		},
	}

	for _, certification := range certifications {
		if err := d.DB.Create(&certification).Error; err != nil {
			return fmt.Errorf("failed to create seed certification: %w", err)
		}
	}

	// Create a second tenant for testing multi-tenancy
	tenant2 := &domain.Tenant{
		Name:             "Adventure Camps Inc",
		Description:      "An adventure camp organization for testing multi-tenancy",
		Slug:             "adventure-camps",
		SubscriptionTier: "basic",
		MaxCamps:         5,
	}

	if err := d.DB.Create(tenant2).Error; err != nil {
		return fmt.Errorf("failed to create second seed tenant: %w", err)
	}

	// Create a camp for the second tenant
	startDate2, _ := time.Parse("2006-01-02", "2025-07-01")
	endDate2, _ := time.Parse("2006-01-02", "2025-07-31")

	camp2 := &domain.Camp{
		TenantID:       tenant2.ID,
		Name:           "Adventure Camp July 2025",
		Description:    "Outdoor adventure camp for testing",
		StartDate:      startDate2,
		EndDate:        endDate2,
		DailyStartTime: "07:00",
		DailyEndTime:   "18:00",
		Timezone:       "America/Los_Angeles",
	}

	if err := d.DB.Create(camp2).Error; err != nil {
		return fmt.Errorf("failed to create second seed camp: %w", err)
	}

	// Create a user for the second tenant (password: "password123")
	user2 := &domain.User{
		TenantID:      tenant2.ID,
		Email:         "admin@adventurecamps.com",
		PasswordHash:  passwordHash, // Reuse the same hash
		FirstName:     "Adventure",
		LastName:      "Admin",
		IsActive:      true,
		EmailVerified: true,
	}

	if err := d.DB.Create(user2).Error; err != nil {
		return fmt.Errorf("failed to create second seed user: %w", err)
	}

	// Create tenant-level access rule for second admin
	accessRule2 := &domain.AccessRule{
		UserID:    user2.ID,
		Role:      "admin",
		ScopeType: "tenant",
		ScopeID:   &tenant2.ID,
	}

	if err := d.DB.Create(accessRule2).Error; err != nil {
		return fmt.Errorf("failed to create second seed access rule: %w", err)
	}

	// Create some colors for the second tenant/camp
	colors2 := []domain.Color{
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Orange",
			Description: "Energetic orange for adventure activities",
			HexValue:    "#FFA500",
			Default:     true,
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Teal",
			Description: "Cool teal for water sports",
			HexValue:    "#008080",
			Default:     false,
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Brown",
			Description: "Earthy brown for hiking activities",
			HexValue:    "#8B4513",
			Default:     false,
		},
	}

	for _, color := range colors2 {
		if err := d.DB.Create(&color).Error; err != nil {
			return fmt.Errorf("failed to create second tenant seed color: %w", err)
		}
	}

	// Create some areas for the second tenant/camp
	areas2 := []domain.Area{
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Rock Climbing Wall",
			Description: "45-foot outdoor climbing wall with multiple routes",
			Capacity:    20,
			Equipment:   []string{"Harnesses", "Helmets", "Ropes", "Belay devices", "Crash pads"},
			Notes:       "Certified instructors required. Weather dependent",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Archery Range",
			Description: "Outdoor archery range with 10 targets",
			Capacity:    25,
			Equipment:   []string{"Bows", "Arrows", "Targets", "Arm guards", "Quivers"},
			Notes:       "Safety briefing mandatory. Check wind conditions",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Lakefront Beach",
			Description: "Sandy beach area with dock for swimming and kayaking",
			Capacity:    60,
			Equipment:   []string{"Kayaks", "Paddles", "Life vests", "Beach chairs", "First aid kit"},
			Notes:       "Water quality tested weekly. Buddy system required",
		},
	}

	for _, area := range areas2 {
		if err := d.DB.Create(&area).Error; err != nil {
			return fmt.Errorf("failed to create second tenant seed area: %w", err)
		}
	}

	// Create some default certifications for the second tenant/camp
	certifications2 := []domain.Certification{
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "First Aid",
			Description: "Certification in first aid",
		},
	}

	for _, certification := range certifications2 {
		if err := d.DB.Create(&certification).Error; err != nil {
			return fmt.Errorf("failed to create second tenant seed certification: %w", err)
		}
	}

	return nil
}
