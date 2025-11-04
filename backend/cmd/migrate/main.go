package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/joho/godotenv"

	"github.com/tbechar/camp-manager-backend/internal/config"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"gorm.io/gorm/logger"
)

func main() {
	// Load .env file if it exists (optional)
	_ = godotenv.Load()

	// Parse command-line flags
	action := flag.String("action", "up", "Migration action: up, down, seed")
	flag.Parse()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load configuration: %v\n", err)
		os.Exit(1)
	}

	// Connect to database
	db, err := database.New(&cfg.Database, logger.Info)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()

	fmt.Printf("Connected to database: %s@%s:%s/%s\n",
		cfg.Database.User,
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.Name,
	)

	// Execute migration action
	switch *action {
	case "up":
		fmt.Println("Running migrations...")
		if err := db.RunMigrations(); err != nil {
			fmt.Fprintf(os.Stderr, "Migration failed: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("✅ Migrations completed successfully")

	case "down":
		fmt.Println("WARNING: This will drop all tables and data!")
		fmt.Print("Are you sure? (yes/no): ")
		var confirm string
		fmt.Scanln(&confirm)
		if confirm != "yes" {
			fmt.Println("Migration cancelled")
			os.Exit(0)
		}
		fmt.Println("Dropping all tables...")
		if err := db.DropAllTables(); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to drop tables: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("✅ All tables dropped successfully")

	case "seed":
		fmt.Println("Seeding database with demo data...")
		if err := db.RunMigrations(); err != nil {
			fmt.Fprintf(os.Stderr, "Migration failed: %v\n", err)
			os.Exit(1)
		}
		if err := db.SeedData(); err != nil {
			fmt.Fprintf(os.Stderr, "Seeding failed: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("✅ Database seeded successfully")
		fmt.Println("\nDemo credentials:")
		fmt.Println("  Email: admin@democamp.com")
		fmt.Println("  Password: password123")

	case "reset":
		fmt.Println("WARNING: This will drop all tables, recreate them, and seed data!")
		fmt.Print("Are you sure? (yes/no): ")
		var confirm string
		fmt.Scanln(&confirm)
		if confirm != "yes" {
			fmt.Println("Reset cancelled")
			os.Exit(0)
		}
		fmt.Println("Dropping all tables...")
		if err := db.DropAllTables(); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to drop tables: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("Running migrations...")
		if err := db.RunMigrations(); err != nil {
			fmt.Fprintf(os.Stderr, "Migration failed: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("Seeding database...")
		if err := db.SeedData(); err != nil {
			fmt.Fprintf(os.Stderr, "Seeding failed: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("✅ Database reset successfully")
		fmt.Println("\nDemo credentials:")
		fmt.Println("  Email: admin@democamp.com")
		fmt.Println("  Password: password123")

	default:
		fmt.Fprintf(os.Stderr, "Unknown action: %s\n", *action)
		fmt.Println("Available actions: up, down, seed, reset")
		os.Exit(1)
	}
}

