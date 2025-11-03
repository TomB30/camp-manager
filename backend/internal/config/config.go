package config

import (
	"fmt"
	"time"

	"github.com/spf13/viper"
)

// Config holds all configuration for the application
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Logging  LoggingConfig
}

// ServerConfig holds HTTP server configuration
type ServerConfig struct {
	Host         string
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

// DatabaseConfig holds database connection configuration
type DatabaseConfig struct {
	Host            string
	Port            string
	User            string
	Password        string
	Name            string
	SSLMode         string
	MaxIdleConns    int
	MaxOpenConns    int
	ConnMaxLifetime time.Duration
}

// LoggingConfig holds logging configuration
type LoggingConfig struct {
	Level  string
	Format string
}

// Load reads configuration from environment variables
func Load() (*Config, error) {
	viper.SetDefault("SERVER_HOST", "0.0.0.0")
	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("SERVER_READ_TIMEOUT", "30s")
	viper.SetDefault("SERVER_WRITE_TIMEOUT", "30s")

	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "campmanager")
	viper.SetDefault("DB_PASSWORD", "campmanager_dev")
	viper.SetDefault("DB_NAME", "campmanager")
	viper.SetDefault("DB_SSLMODE", "disable")
	viper.SetDefault("DB_MAX_IDLE_CONNS", 10)
	viper.SetDefault("DB_MAX_OPEN_CONNS", 100)
	viper.SetDefault("DB_CONN_MAX_LIFETIME", "1h")

	viper.SetDefault("LOG_LEVEL", "debug")
	viper.SetDefault("LOG_FORMAT", "json")

	// Automatically read from environment variables
	viper.AutomaticEnv()

	// Parse durations
	readTimeout, err := time.ParseDuration(viper.GetString("SERVER_READ_TIMEOUT"))
	if err != nil {
		return nil, fmt.Errorf("invalid SERVER_READ_TIMEOUT: %w", err)
	}

	writeTimeout, err := time.ParseDuration(viper.GetString("SERVER_WRITE_TIMEOUT"))
	if err != nil {
		return nil, fmt.Errorf("invalid SERVER_WRITE_TIMEOUT: %w", err)
	}

	connMaxLifetime, err := time.ParseDuration(viper.GetString("DB_CONN_MAX_LIFETIME"))
	if err != nil {
		return nil, fmt.Errorf("invalid DB_CONN_MAX_LIFETIME: %w", err)
	}

	config := &Config{
		Server: ServerConfig{
			Host:         viper.GetString("SERVER_HOST"),
			Port:         viper.GetString("SERVER_PORT"),
			ReadTimeout:  readTimeout,
			WriteTimeout: writeTimeout,
		},
		Database: DatabaseConfig{
			Host:            viper.GetString("DB_HOST"),
			Port:            viper.GetString("DB_PORT"),
			User:            viper.GetString("DB_USER"),
			Password:        viper.GetString("DB_PASSWORD"),
			Name:            viper.GetString("DB_NAME"),
			SSLMode:         viper.GetString("DB_SSLMODE"),
			MaxIdleConns:    viper.GetInt("DB_MAX_IDLE_CONNS"),
			MaxOpenConns:    viper.GetInt("DB_MAX_OPEN_CONNS"),
			ConnMaxLifetime: connMaxLifetime,
		},
		Logging: LoggingConfig{
			Level:  viper.GetString("LOG_LEVEL"),
			Format: viper.GetString("LOG_FORMAT"),
		},
	}

	return config, nil
}

// GetAddress returns the server address in the format host:port
func (c *ServerConfig) GetAddress() string {
	return c.Host + ":" + c.Port
}

// GetDSN returns the PostgreSQL connection string
func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.Name, c.SSLMode,
	)
}
