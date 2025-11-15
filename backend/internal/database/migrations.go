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
		"housing_rooms",
		"locations",
		"roles",
		"sessions",
		"areas",
		"certifications",
		"colors",
		"time_blocks",
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

	// Store created areas for later reference
	createdAreas := make([]domain.Area, len(areas))
	for i, area := range areas {
		if err := d.DB.Create(&area).Error; err != nil {
			return fmt.Errorf("failed to create seed area: %w", err)
		}
		createdAreas[i] = area
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

	// Store created areas for later reference
	createdAreas2 := make([]domain.Area, len(areas2))
	for i, area := range areas2 {
		if err := d.DB.Create(&area).Error; err != nil {
			return fmt.Errorf("failed to create second tenant seed area: %w", err)
		}
		createdAreas2[i] = area
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

	// Create some default sessions for the first tenant/camp
	sessionStartDate1, _ := time.Parse("2006-01-02", "2025-06-15")
	sessionEndDate1, _ := time.Parse("2006-01-02", "2025-06-28")
	sessionStartDate2, _ := time.Parse("2006-01-02", "2025-07-01")
	sessionEndDate2, _ := time.Parse("2006-01-02", "2025-07-14")
	sessionStartDate3, _ := time.Parse("2006-01-02", "2025-07-15")
	sessionEndDate3, _ := time.Parse("2006-01-02", "2025-07-28")
	sessionStartDate4, _ := time.Parse("2006-01-02", "2025-08-01")
	sessionEndDate4, _ := time.Parse("2006-01-02", "2025-08-15")

	sessions := []domain.Session{
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Session 1 - Early Summer",
			Description: "First session of the summer for ages 8-12",
			StartDate:   sessionStartDate1,
			EndDate:     sessionEndDate1,
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Session 2 - Mid Summer",
			Description: "Second session focusing on water activities",
			StartDate:   sessionStartDate2,
			EndDate:     sessionEndDate2,
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Session 3 - Late Summer",
			Description: "Third session with outdoor adventures",
			StartDate:   sessionStartDate3,
			EndDate:     sessionEndDate3,
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Session 4 - End of Summer",
			Description: "Final session with special events and performances",
			StartDate:   sessionStartDate4,
			EndDate:     sessionEndDate4,
		},
	}

	for _, session := range sessions {
		if err := d.DB.Create(&session).Error; err != nil {
			return fmt.Errorf("failed to create seed session: %w", err)
		}
	}

	// Create some default roles for the first tenant/camp
	roles := []domain.Role{
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Camp Director",
			Description: "Overall leadership and management of the camp",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Program Director",
			Description: "Oversees all camp programs and activities",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Counselor",
			Description: "Direct supervision and guidance of campers",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Lifeguard",
			Description: "Ensures safety at all water-based activities",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Activity Specialist",
			Description: "Leads specialized activities like arts, sports, or outdoor education",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Kitchen Staff",
			Description: "Prepares and serves meals",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Maintenance",
			Description: "Maintains facilities and equipment",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			Name:        "Health Director",
			Description: "Provides medical care and manages health services",
		},
	}

	for _, role := range roles {
		if err := d.DB.Create(&role).Error; err != nil {
			return fmt.Errorf("failed to create seed role: %w", err)
		}
	}

	// Create some default sessions for the second tenant/camp
	sessionStartDate5, _ := time.Parse("2006-01-02", "2025-07-01")
	sessionEndDate5, _ := time.Parse("2006-01-02", "2025-07-15")
	sessionStartDate6, _ := time.Parse("2006-01-02", "2025-07-16")
	sessionEndDate6, _ := time.Parse("2006-01-02", "2025-07-31")

	sessions2 := []domain.Session{
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Adventure Session 1",
			Description: "First two-week adventure session with rock climbing focus",
			StartDate:   sessionStartDate5,
			EndDate:     sessionEndDate5,
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Adventure Session 2",
			Description: "Second two-week adventure session with water sports focus",
			StartDate:   sessionStartDate6,
			EndDate:     sessionEndDate6,
		},
	}

	for _, session := range sessions2 {
		if err := d.DB.Create(&session).Error; err != nil {
			return fmt.Errorf("failed to create second tenant seed session: %w", err)
		}
	}

	// Create some default roles for the second tenant/camp
	roles2 := []domain.Role{
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Adventure Director",
			Description: "Leads all adventure-based programming",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Climbing Instructor",
			Description: "Certified climbing instructor for rock wall activities",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Wilderness Guide",
			Description: "Leads backcountry trips and outdoor expeditions",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Waterfront Director",
			Description: "Oversees all waterfront activities and safety",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			Name:        "Challenge Course Facilitator",
			Description: "Facilitates high and low ropes course activities",
		},
	}

	for _, role := range roles2 {
		if err := d.DB.Create(&role).Error; err != nil {
			return fmt.Errorf("failed to create second tenant seed role: %w", err)
		}
	}

	// Create some default locations for the first tenant/camp
	// Using valid area IDs from the createdAreas slice
	locations := []domain.Location{
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      &createdAreas[0].ID, // Main Field
			Name:        "North Soccer Field",
			Description: "Northern section of the main field, ideal for soccer games",
			Capacity:    50,
			Equipment:   []string{"Soccer goals", "Corner flags", "Cones"},
			Notes:       "Well-maintained grass, best for morning activities",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      &createdAreas[0].ID, // Main Field
			Name:        "South Activity Zone",
			Description: "Southern portion of the main field for various outdoor activities",
			Capacity:    40,
			Equipment:   []string{"Frisbees", "Cones", "Portable bleachers"},
			Notes:       "Slightly sloped, good drainage",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      &createdAreas[1].ID, // Arts & Crafts Cabin
			Name:        "Painting Studio",
			Description: "Dedicated space for painting and drawing activities",
			Capacity:    15,
			Equipment:   []string{"Easels", "Paint supplies", "Brushes", "Canvas"},
			Notes:       "Natural lighting from north-facing windows",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      &createdAreas[1].ID, // Arts & Crafts Cabin
			Name:        "Crafts Workshop",
			Description: "Workshop area for hands-on craft projects",
			Capacity:    15,
			Equipment:   []string{"Tables", "Chairs", "Clay", "Craft supplies", "Drying racks"},
			Notes:       "Sink available for cleanup",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      &createdAreas[2].ID, // Swimming Pool
			Name:        "Deep End Section",
			Description: "Deep water area with diving boards",
			Capacity:    25,
			Equipment:   []string{"Diving boards", "Lane dividers", "Depth markers"},
			Notes:       "12-foot depth, advanced swimmers only",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      &createdAreas[2].ID, // Swimming Pool
			Name:        "Shallow Pool Area",
			Description: "Shallow water section for beginners",
			Capacity:    50,
			Equipment:   []string{"Life jackets", "Pool noodles", "Kickboards"},
			Notes:       "3-4 foot depth, perfect for swim lessons",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      &createdAreas[3].ID, // Dining Hall
			Name:        "Main Dining Area",
			Description: "Primary seating area for meals",
			Capacity:    150,
			Equipment:   []string{"Tables", "Benches"},
			Notes:       "Can accommodate full camp for meals",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      &createdAreas[3].ID, // Dining Hall
			Name:        "Performance Stage",
			Description: "Stage area at front of dining hall",
			Capacity:    50,
			Equipment:   []string{"Stage", "PA system", "Spotlights", "Microphones"},
			Notes:       "Used for evening programs and talent shows",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      &createdAreas[4].ID, // Nature Trail
			Name:        "Trailhead",
			Description: "Starting point of the nature trail with information kiosk",
			Capacity:    20,
			Equipment:   []string{"Trail maps", "Information boards", "First aid kit"},
			Notes:       "Check in required before trail hikes",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      &createdAreas[4].ID, // Nature Trail
			Name:        "Observation Point",
			Description: "Scenic overlook midway through the trail",
			Capacity:    15,
			Equipment:   []string{"Benches", "Binoculars", "Nature guides"},
			Notes:       "Great spot for bird watching and nature education",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      nil, // No specific area - standalone location
			Name:        "Central Pavilion",
			Description: "Covered outdoor pavilion near camp center",
			Capacity:    75,
			Equipment:   []string{"Picnic tables", "Grills", "Trash bins"},
			Notes:       "Available for group gatherings and outdoor meals",
		},
	}

	for _, location := range locations {
		if err := d.DB.Create(&location).Error; err != nil {
			return fmt.Errorf("failed to create seed location: %w", err)
		}
	}

	// Create some default locations for the second tenant/camp
	locations2 := []domain.Location{
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      &createdAreas2[0].ID, // Rock Climbing Wall
			Name:        "Beginner Routes Section",
			Description: "Lower section of the climbing wall with easier routes",
			Capacity:    8,
			Equipment:   []string{"Harnesses (S-M)", "Helmets", "Belay devices", "Crash pads"},
			Notes:       "Routes rated 5.4 to 5.7",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      &createdAreas2[0].ID, // Rock Climbing Wall
			Name:        "Advanced Routes Section",
			Description: "Upper section with challenging routes for experienced climbers",
			Capacity:    6,
			Equipment:   []string{"Harnesses (M-L)", "Helmets", "Belay devices", "Quickdraws"},
			Notes:       "Routes rated 5.8 to 5.12, certified instructors required",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      &createdAreas2[1].ID, // Archery Range
			Name:        "Target Range Left",
			Description: "Left side of archery range with 5 targets",
			Capacity:    12,
			Equipment:   []string{"Bows (youth)", "Arrows", "Targets", "Arm guards"},
			Notes:       "20-yard distance, suitable for beginners",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      &createdAreas2[1].ID, // Archery Range
			Name:        "Target Range Right",
			Description: "Right side of archery range with 5 targets",
			Capacity:    12,
			Equipment:   []string{"Bows (adult)", "Arrows", "Targets", "Quivers"},
			Notes:       "30-yard distance, for intermediate to advanced archers",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      &createdAreas2[2].ID, // Lakefront Beach
			Name:        "Swimming Beach",
			Description: "Designated swimming area with roped boundaries",
			Capacity:    40,
			Equipment:   []string{"Life vests", "Beach chairs", "Rescue equipment"},
			Notes:       "Lifeguard on duty required, water tested daily",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      &createdAreas2[2].ID, // Lakefront Beach
			Name:        "Kayak Launch",
			Description: "Boat launch area for kayaking activities",
			Capacity:    20,
			Equipment:   []string{"Kayaks", "Paddles", "Life vests", "Safety whistles"},
			Notes:       "Check weather conditions before launch, buddy system required",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      nil, // No specific area - standalone location
			Name:        "Base Camp",
			Description: "Central meeting point and equipment storage",
			Capacity:    60,
			Equipment:   []string{"Benches", "Bulletin board", "First aid station", "Equipment lockers"},
			Notes:       "Daily briefings held here at 8 AM and 6 PM",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      nil, // No specific area - standalone location
			Name:        "Campfire Circle",
			Description: "Outdoor amphitheater with stone fire pit",
			Capacity:    50,
			Equipment:   []string{"Log benches", "Fire pit", "Guitar", "S'mores supplies"},
			Notes:       "Evening programs most nights, weather permitting",
		},
	}

	for _, location := range locations2 {
		if err := d.DB.Create(&location).Error; err != nil {
			return fmt.Errorf("failed to create second tenant seed location: %w", err)
		}
	}

	// Create some default housing rooms for the first tenant/camp
	// Using valid area IDs from the createdAreas slice
	housingRooms := []domain.HousingRoom{
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      nil, // Standalone cabin
			Name:        "Cabin 1 - Pines",
			Description: "Cozy cabin in the pine grove, perfect for younger campers",
			Beds:        8,
			Bathroom:    "shared",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      nil, // Standalone cabin
			Name:        "Cabin 2 - Oaks",
			Description: "Spacious cabin near the oak trees",
			Beds:        10,
			Bathroom:    "shared",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      nil, // Standalone cabin
			Name:        "Cabin 3 - Maples",
			Description: "Modern cabin with attached facilities",
			Beds:        8,
			Bathroom:    "private",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      nil, // Standalone cabin
			Name:        "Staff Lodge A",
			Description: "Staff housing with private rooms",
			Beds:        4,
			Bathroom:    "private",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      nil, // Standalone cabin
			Name:        "Staff Lodge B",
			Description: "Additional staff housing",
			Beds:        6,
			Bathroom:    "shared",
		},
		{
			TenantID:    tenant.ID,
			CampID:      camp.ID,
			AreaID:      &createdAreas[3].ID, // Dining Hall area - staff quarters
			Name:        "Kitchen Staff Quarters",
			Description: "Housing for kitchen and dining staff",
			Beds:        4,
			Bathroom:    "private",
		},
	}

	for _, room := range housingRooms {
		if err := d.DB.Create(&room).Error; err != nil {
			return fmt.Errorf("failed to create seed housing room: %w", err)
		}
	}

	// Create some default housing rooms for the second tenant/camp
	housingRooms2 := []domain.HousingRoom{
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      nil, // Standalone cabin
			Name:        "Bunkhouse Alpha",
			Description: "Large bunkhouse for adventure camp participants",
			Beds:        12,
			Bathroom:    "shared",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      nil, // Standalone cabin
			Name:        "Bunkhouse Beta",
			Description: "Second large bunkhouse",
			Beds:        12,
			Bathroom:    "shared",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      nil, // Standalone cabin
			Name:        "Instructor Cabin",
			Description: "Private cabin for senior instructors",
			Beds:        2,
			Bathroom:    "private",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      &createdAreas2[2].ID, // Lakefront Beach area
			Name:        "Waterfront Staff Cabin",
			Description: "Housing for waterfront staff near the beach",
			Beds:        4,
			Bathroom:    "shared",
		},
		{
			TenantID:    tenant2.ID,
			CampID:      camp2.ID,
			AreaID:      &createdAreas2[0].ID, // Rock Climbing Wall area
			Name:        "Climbing Crew Quarters",
			Description: "Housing for rock climbing instructors",
			Beds:        3,
			Bathroom:    "private",
		},
	}

	for _, room := range housingRooms2 {
		if err := d.DB.Create(&room).Error; err != nil {
			return fmt.Errorf("failed to create second tenant seed housing room: %w", err)
		}
	}

	// Create additional test users with various access rules for authorization testing
	
	// User 3: Camp-scoped admin for Demo Camp (first camp)
	user3 := &domain.User{
		TenantID:      tenant.ID,
		Email:         "camp1admin@democamp.com",
		PasswordHash:  passwordHash,
		FirstName:     "Camp1",
		LastName:      "Admin",
		IsActive:      true,
		EmailVerified: true,
	}
	if err := d.DB.Create(user3).Error; err != nil {
		return fmt.Errorf("failed to create user3: %w", err)
	}
	accessRule3 := &domain.AccessRule{
		UserID:    user3.ID,
		Role:      "admin",
		ScopeType: "camp",
		ScopeID:   &camp.ID,
	}
	if err := d.DB.Create(accessRule3).Error; err != nil {
		return fmt.Errorf("failed to create accessRule3: %w", err)
	}

	// User 4: Tenant-scoped program-admin for Demo Camp Organization
	user4 := &domain.User{
		TenantID:      tenant.ID,
		Email:         "programadmin@democamp.com",
		PasswordHash:  passwordHash,
		FirstName:     "Program",
		LastName:      "Admin",
		IsActive:      true,
		EmailVerified: true,
	}
	if err := d.DB.Create(user4).Error; err != nil {
		return fmt.Errorf("failed to create user4: %w", err)
	}
	accessRule4 := &domain.AccessRule{
		UserID:    user4.ID,
		Role:      "program-admin",
		ScopeType: "tenant",
		ScopeID:   &tenant.ID,
	}
	if err := d.DB.Create(accessRule4).Error; err != nil {
		return fmt.Errorf("failed to create accessRule4: %w", err)
	}

	// User 5: Camp-scoped program-admin for first camp only
	user5 := &domain.User{
		TenantID:      tenant.ID,
		Email:         "programadmin.camp1@democamp.com",
		PasswordHash:  passwordHash,
		FirstName:     "Camp1Program",
		LastName:      "Admin",
		IsActive:      true,
		EmailVerified: true,
	}
	if err := d.DB.Create(user5).Error; err != nil {
		return fmt.Errorf("failed to create user5: %w", err)
	}
	accessRule5 := &domain.AccessRule{
		UserID:    user5.ID,
		Role:      "program-admin",
		ScopeType: "camp",
		ScopeID:   &camp.ID,
	}
	if err := d.DB.Create(accessRule5).Error; err != nil {
		return fmt.Errorf("failed to create accessRule5: %w", err)
	}

	// User 6: Tenant-scoped viewer for Demo Camp Organization
	user6 := &domain.User{
		TenantID:      tenant.ID,
		Email:         "viewer@democamp.com",
		PasswordHash:  passwordHash,
		FirstName:     "Viewer",
		LastName:      "User",
		IsActive:      true,
		EmailVerified: true,
	}
	if err := d.DB.Create(user6).Error; err != nil {
		return fmt.Errorf("failed to create user6: %w", err)
	}
	accessRule6 := &domain.AccessRule{
		UserID:    user6.ID,
		Role:      "viewer",
		ScopeType: "tenant",
		ScopeID:   &tenant.ID,
	}
	if err := d.DB.Create(accessRule6).Error; err != nil {
		return fmt.Errorf("failed to create accessRule6: %w", err)
	}

	// User 7: Camp-scoped viewer for first camp only
	user7 := &domain.User{
		TenantID:      tenant.ID,
		Email:         "viewer.camp1@democamp.com",
		PasswordHash:  passwordHash,
		FirstName:     "Camp1Viewer",
		LastName:      "User",
		IsActive:      true,
		EmailVerified: true,
	}
	if err := d.DB.Create(user7).Error; err != nil {
		return fmt.Errorf("failed to create user7: %w", err)
	}
	accessRule7 := &domain.AccessRule{
		UserID:    user7.ID,
		Role:      "viewer",
		ScopeType: "camp",
		ScopeID:   &camp.ID,
	}
	if err := d.DB.Create(accessRule7).Error; err != nil {
		return fmt.Errorf("failed to create accessRule7: %w", err)
	}

	// User 8: Camp-scoped admin for second tenant's camp
	user8 := &domain.User{
		TenantID:      tenant2.ID,
		Email:         "campadmin@adventurecamps.com",
		PasswordHash:  passwordHash,
		FirstName:     "Adventure",
		LastName:      "CampAdmin",
		IsActive:      true,
		EmailVerified: true,
	}
	if err := d.DB.Create(user8).Error; err != nil {
		return fmt.Errorf("failed to create user8: %w", err)
	}
	accessRule8 := &domain.AccessRule{
		UserID:    user8.ID,
		Role:      "admin",
		ScopeType: "camp",
		ScopeID:   &camp2.ID,
	}
	if err := d.DB.Create(accessRule8).Error; err != nil {
		return fmt.Errorf("failed to create accessRule8: %w", err)
	}

	// User 9: Program-admin with camp scope for second tenant
	user9 := &domain.User{
		TenantID:      tenant2.ID,
		Email:         "programadmin@adventurecamps.com",
		PasswordHash:  passwordHash,
		FirstName:     "Adventure",
		LastName:      "ProgramAdmin",
		IsActive:      true,
		EmailVerified: true,
	}
	if err := d.DB.Create(user9).Error; err != nil {
		return fmt.Errorf("failed to create user9: %w", err)
	}
	accessRule9 := &domain.AccessRule{
		UserID:    user9.ID,
		Role:      "program-admin",
		ScopeType: "camp",
		ScopeID:   &camp2.ID,
	}
	if err := d.DB.Create(accessRule9).Error; err != nil {
		return fmt.Errorf("failed to create accessRule9: %w", err)
	}

	// User 10: Viewer with tenant scope for second tenant
	user10 := &domain.User{
		TenantID:      tenant2.ID,
		Email:         "viewer@adventurecamps.com",
		PasswordHash:  passwordHash,
		FirstName:     "Adventure",
		LastName:      "Viewer",
		IsActive:      true,
		EmailVerified: true,
	}
	if err := d.DB.Create(user10).Error; err != nil {
		return fmt.Errorf("failed to create user10: %w", err)
	}
	accessRule10 := &domain.AccessRule{
		UserID:    user10.ID,
		Role:      "viewer",
		ScopeType: "tenant",
		ScopeID:   &tenant2.ID,
	}
	if err := d.DB.Create(accessRule10).Error; err != nil {
		return fmt.Errorf("failed to create accessRule10: %w", err)
	}

	// User 11: User with multiple access rules (admin in one camp, viewer in another)
	// This tests users with access to multiple camps
	user11 := &domain.User{
		TenantID:      tenant.ID,
		Email:         "multicamp@democamp.com",
		PasswordHash:  passwordHash,
		FirstName:     "MultiCamp",
		LastName:      "User",
		IsActive:      true,
		EmailVerified: true,
	}
	if err := d.DB.Create(user11).Error; err != nil {
		return fmt.Errorf("failed to create user11: %w", err)
	}
	// Admin access to first camp
	accessRule11a := &domain.AccessRule{
		UserID:    user11.ID,
		Role:      "admin",
		ScopeType: "camp",
		ScopeID:   &camp.ID,
	}
	if err := d.DB.Create(accessRule11a).Error; err != nil {
		return fmt.Errorf("failed to create accessRule11a: %w", err)
	}

	fmt.Println("\n=== Test Users Created ===")
	fmt.Println("System Admin:")
	fmt.Println("  Email: admin@democamp.com | Password: password123 | Scope: system | Role: admin")
	fmt.Println("\nTenant Admins:")
	fmt.Println("  Email: admin@adventurecamps.com | Password: password123 | Scope: tenant (Adventure Camps) | Role: admin")
	fmt.Println("\nCamp Admins:")
	fmt.Println("  Email: camp1admin@democamp.com | Password: password123 | Scope: camp (Summer Camp 2025) | Role: admin")
	fmt.Println("  Email: campadmin@adventurecamps.com | Password: password123 | Scope: camp (Adventure Camp) | Role: admin")
	fmt.Println("\nProgram Admins:")
	fmt.Println("  Email: programadmin@democamp.com | Password: password123 | Scope: tenant (Demo Camp Org) | Role: program-admin")
	fmt.Println("  Email: programadmin.camp1@democamp.com | Password: password123 | Scope: camp (Summer Camp 2025) | Role: program-admin")
	fmt.Println("  Email: programadmin@adventurecamps.com | Password: password123 | Scope: camp (Adventure Camp) | Role: program-admin")
	fmt.Println("\nViewers:")
	fmt.Println("  Email: viewer@democamp.com | Password: password123 | Scope: tenant (Demo Camp Org) | Role: viewer")
	fmt.Println("  Email: viewer.camp1@democamp.com | Password: password123 | Scope: camp (Summer Camp 2025) | Role: viewer")
	fmt.Println("  Email: viewer@adventurecamps.com | Password: password123 | Scope: tenant (Adventure Camps) | Role: viewer")
	fmt.Println("\nMulti-Access:")
	fmt.Println("  Email: multicamp@democamp.com | Password: password123 | Scope: camp (Summer Camp 2025) | Role: admin")
	fmt.Println("==========================\n")

	return nil
}
