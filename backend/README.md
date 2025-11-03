# Camp Manager Backend

Backend API server for the Camp Manager application, built with Go, Chi router, GORM, and PostgreSQL.

## Features

- 🚀 RESTful API with Chi router
- 🗄️ PostgreSQL database with GORM ORM
- 📝 Structured logging with Zap
- ⚙️ Configuration management with Viper
- 🐳 Docker Compose for local development
- ✅ Health check endpoint

## Prerequisites

- Go 1.22 or higher
- Docker and Docker Compose
- Make (optional, for convenience commands)

## Quick Start

### 1. Clone and Setup

```bash
cd camp-manager-backend
cp .env.example .env
```

### 2. Start PostgreSQL

```bash
make docker-up
```

Or without Make:

```bash
docker-compose up -d
```

### 3. Install Dependencies

```bash
go mod download
```

### 4. Run the Server

```bash
make run
```

Or without Make:

```bash
go run cmd/api/main.go
```

The server will start on `http://localhost:8080`

### 5. Test Health Check

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Project Structure

```
camp-manager-backend/
├── cmd/
│   └── api/                    # Application entry point
│       └── main.go
├── internal/                   # Private application code
│   ├── config/                 # Configuration management
│   ├── database/               # Database connection
│   ├── handler/                # HTTP handlers
│   ├── middleware/             # HTTP middleware
│   ├── service/                # Business logic
│   ├── repository/             # Data access layer
│   └── domain/                 # Domain models
├── pkg/                        # Public packages
│   ├── logger/                 # Logging utilities
│   └── errors/                 # Error handling
├── scripts/                    # Utility scripts
├── docker-compose.yml          # PostgreSQL setup
├── Makefile                    # Development commands
└── README.md
```

## Development Commands

### Using Make

- `make help` - Show available commands
- `make run` - Run the server
- `make build` - Build the binary
- `make docker-up` - Start PostgreSQL
- `make docker-down` - Stop PostgreSQL
- `make docker-logs` - View PostgreSQL logs
- `make test` - Run tests
- `make lint` - Run linters (requires golangci-lint)
- `make clean` - Remove build artifacts
- `make tidy` - Tidy dependencies

### Without Make

```bash
# Run server
go run cmd/api/main.go

# Build binary
go build -o bin/api cmd/api/main.go

# Run tests
go test -v ./...

# Start/stop PostgreSQL
docker-compose up -d
docker-compose down

# View logs
docker-compose logs -f postgres
```

## Configuration

Configuration is managed through environment variables. See `.env.example` for all available options.

Key configurations:

- **Server**: Host, port, timeouts
- **Database**: Connection details, pool settings
- **Logging**: Level (debug, info, warn, error), format (json, console)

## API Endpoints

### Health Check

**GET** `/health`

Returns the health status of the server and database connection.

**Response:**

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Database

PostgreSQL 16 is used as the database. Connection details:

- **Host**: localhost
- **Port**: 5432
- **Database**: campmanager
- **User**: campmanager
- **Password**: campmanager_dev

### Connection Pool Settings

- Max Idle Connections: 10
- Max Open Connections: 100
- Connection Max Lifetime: 1 hour

## Logging

Structured logging with Zap:

- **Development mode**: Console format with colors
- **Production mode**: JSON format for log aggregation

Log levels: debug, info, warn, error

## Tech Stack

- **Language**: Go 1.22+
- **Web Framework**: Chi v5
- **ORM**: GORM v2
- **Database**: PostgreSQL 16
- **Logging**: Zap
- **Configuration**: Viper
- **Database Driver**: pgx/v5

## Next Steps

This infrastructure is ready for feature implementation:

1. Define domain models in `internal/domain/`
2. Create repositories in `internal/repository/`
3. Implement business logic in `internal/service/`
4. Add HTTP handlers in `internal/handler/`
5. Create database migrations

## License

MIT

