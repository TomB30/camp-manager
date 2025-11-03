<!-- 312be492-3a4e-4b84-ba30-5e4780535018 6ba383c5-9439-4a03-8e28-dd6bc3aa3e45 -->
# Go Backend Infrastructure Setup

## Overview

Initialize the Go backend project with proper structure, dependencies, configuration management, and PostgreSQL connection. This prepares the foundation without creating any tables or API endpoints yet.

## Project Structure

```
camp-manager-backend/
├── cmd/
│   └── api/
│       └── main.go              # API server entry point
├── internal/
│   ├── config/
│   │   └── config.go            # Configuration management with viper
│   ├── database/
│   │   └── postgres.go          # PostgreSQL connection with GORM
│   ├── middleware/
│   │   └── .gitkeep             # Placeholder for future middleware
│   ├── handler/
│   │   └── .gitkeep             # Placeholder for future handlers
│   ├── service/
│   │   └── .gitkeep             # Placeholder for future services
│   ├── repository/
│   │   └── .gitkeep             # Placeholder for future repositories
│   └── domain/
│       └── .gitkeep             # Placeholder for future domain models
├── pkg/
│   ├── logger/
│   │   └── logger.go            # Structured logging with zap
│   └── errors/
│       └── errors.go            # Custom error types
├── scripts/
│   └── .gitkeep
├── .env.example                 # Environment variable template
├── .gitignore
├── go.mod                       # Go module definition
├── go.sum                       # Dependency checksums
├── Makefile                     # Common development commands
├── docker-compose.yml           # PostgreSQL for local development
├── Dockerfile                   # Application container (future)
└── README.md                    # Project documentation
```

## Core Dependencies

```go
// go.mod will include:
- github.com/go-chi/chi/v5           // HTTP router
- gorm.io/gorm                       // ORM
- gorm.io/driver/postgres            // PostgreSQL driver
- github.com/google/uuid             // UUID generation
- github.com/spf13/viper             // Configuration management
- go.uber.org/zap                    // Structured logging
- github.com/joho/godotenv           // .env file loading
```

## Configuration Structure

Environment variables:

```env
# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
SERVER_READ_TIMEOUT=30s
SERVER_WRITE_TIMEOUT=30s

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=campmanager
DB_PASSWORD=campmanager_dev
DB_NAME=campmanager
DB_SSLMODE=disable
DB_MAX_IDLE_CONNS=10
DB_MAX_OPEN_CONNS=100
DB_CONN_MAX_LIFETIME=1h

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json
```

## Key Files to Create

### 1. `cmd/api/main.go`

- Initialize configuration
- Setup logger
- Connect to PostgreSQL
- Setup HTTP router (Chi)
- Graceful shutdown handling

### 2. `internal/config/config.go`

- Config struct with all settings
- Load from environment using viper
- Validation of required fields

### 3. `internal/database/postgres.go`

- GORM connection setup
- Connection pool configuration
- Health check function
- Graceful close function

### 4. `pkg/logger/logger.go`

- Zap logger initialization
- Development vs production modes
- Structured logging helpers

### 5. `pkg/errors/errors.go`

- Custom error types for domain errors
- HTTP error response helpers

### 6. `docker-compose.yml`

- PostgreSQL 16 container
- Volume for data persistence
- Exposed ports for local development

### 7. `Makefile`

- `make run` - Run the server
- `make build` - Build binary
- `make docker-up` - Start PostgreSQL
- `make docker-down` - Stop PostgreSQL
- `make test` - Run tests
- `make lint` - Run linters

## Implementation Steps

1. Create project directory and initialize Go module
2. Create directory structure with placeholder files
3. Install core dependencies
4. Implement configuration management (viper)
5. Implement logger (zap)
6. Implement PostgreSQL connection (GORM)
7. Create main.go with server initialization
8. Create docker-compose.yml for local PostgreSQL
9. Create Makefile with common commands
10. Create .env.example and .gitignore
11. Create README.md with setup instructions
12. Test: Start PostgreSQL and run server to verify connection

## Health Check Endpoint

**Endpoint:** `GET /health`

**Response (success):**

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Response (database error):**

```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "connection error message",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Usage:**

```bash
curl http://localhost:8080/health
```

## Success Criteria

- [x] Go module initialized with all dependencies
- [x] Directory structure created
- [x] Configuration loads from environment
- [x] Logger initializes and outputs structured logs
- [x] PostgreSQL connection established successfully
- [x] Server starts and listens on configured port
- [x] Docker Compose starts PostgreSQL container
- [x] **Health check endpoint responds with status and database connection state**
- [x] Makefile commands work correctly
- [x] README documents setup process

## Todos

- [ ] create-project-structure
- [ ] initialize-go-module
- [ ] implement-config-management
- [ ] implement-logger
- [ ] implement-database-connection
- [ ] create-main-server-file
- [ ] create-docker-compose
- [ ] create-makefile
- [ ] create-documentation
- [ ] test-infrastructure

### To-dos

- [ ] Create project directory structure with all folders and placeholder files
- [ ] Initialize Go module and install core dependencies (chi, gorm, viper, zap, etc.)
- [ ] Implement configuration management with viper for environment variables
- [ ] Implement structured logging with zap (development and production modes)
- [ ] Implement PostgreSQL connection setup with GORM and connection pooling
- [ ] Create main.go with server initialization, router setup, and graceful shutdown
- [ ] Create docker-compose.yml for local PostgreSQL container
- [ ] Create Makefile with common development commands (run, build, docker-up, etc.)
- [ ] Create README.md, .env.example, and .gitignore files
- [ ] Test: Start PostgreSQL, run server, verify connection and health endpoint