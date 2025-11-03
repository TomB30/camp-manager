package database

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/tbechar/camp-manager-backend/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Database wraps the GORM database connection
type Database struct {
	*gorm.DB
}

// New creates a new database connection
func New(cfg *config.DatabaseConfig, logLevel logger.LogLevel) (*Database, error) {
	dsn := cfg.GetDSN()

	// Configure GORM
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	}

	// Connect to database
	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Get underlying SQL DB for connection pool configuration
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	// Configure connection pool
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	return &Database{DB: db}, nil
}

// Health checks the database connection
func (d *Database) Health() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	return sqlDB.Ping()
}

// Close closes the database connection
func (d *Database) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	return sqlDB.Close()
}

// GetSQLDB returns the underlying *sql.DB for advanced use cases
func (d *Database) GetSQLDB() (*sql.DB, error) {
	return d.DB.DB()
}

// GetGORMLogLevel converts string log level to GORM log level
func GetGORMLogLevel(level string) logger.LogLevel {
	switch level {
	case "debug":
		return logger.Info
	case "info":
		return logger.Warn
	case "warn":
		return logger.Warn
	case "error":
		return logger.Error
	default:
		return logger.Silent
	}
}
