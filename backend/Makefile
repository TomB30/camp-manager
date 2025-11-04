.PHONY: help run build docker-build docker-up docker-down docker-logs test lint clean tidy generate-client install-tools migrate-up migrate-down migrate-seed migrate-reset

# Default target
help:
	@echo "Available targets:"
	@echo "  run             - Run the server"
	@echo "  build           - Build the binary"
	@echo "  docker-build    - Build the binary using Docker"
	@echo "  docker-up       - Start PostgreSQL container"
	@echo "  docker-down     - Stop PostgreSQL container"
	@echo "  docker-logs     - View PostgreSQL logs"
	@echo "  migrate-up      - Run database migrations"
	@echo "  migrate-down    - Drop all database tables"
	@echo "  migrate-seed    - Seed database with demo data"
	@echo "  migrate-reset   - Reset database (drop, migrate, seed)"
	@echo "  test            - Run tests"
	@echo "  lint            - Run linters"
	@echo "  clean           - Remove build artifacts"
	@echo "  tidy            - Tidy and verify dependencies"
	@echo "  generate-client - Generate Go client and types from OpenAPI spec"
	@echo "  install-tools   - Install required tools (oapi-codegen)"

# Run the server
run:
	@echo "Starting server..."
	go run cmd/api/main.go

# Build the binary
build:
	@echo "Building binary..."
	go build -o bin/api cmd/api/main.go

# Build the migrate binary
build-migrate:
	@echo "Building migrate binary..."
	go build -o bin/migrate cmd/migrate/main.go

# Build the binary using Docker (avoids local Go version issues)
docker-build:
	@echo "Building binary with Docker..."
	@docker build --target builder -t camp-manager-backend-builder .
	@docker create --name camp-manager-temp camp-manager-backend-builder
	@mkdir -p bin
	@docker cp camp-manager-temp:/build/bin/api bin/api
	@docker rm camp-manager-temp
	@echo "✓ Binary built successfully in bin/api"

# Start PostgreSQL with Docker Compose
docker-up:
	@echo "Starting PostgreSQL..."
	docker-compose up -d
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 3

# Stop PostgreSQL
docker-down:
	@echo "Stopping PostgreSQL..."
	docker-compose down

# View PostgreSQL logs
docker-logs:
	docker-compose logs -f postgres

# Run database migrations
migrate-up:
	@echo "Running database migrations..."
	@go run cmd/migrate/main.go -action=up

# Drop all database tables (DESTRUCTIVE!)
migrate-down:
	@echo "WARNING: This will drop all database tables!"
	@go run cmd/migrate/main.go -action=down

# Seed database with demo data
migrate-seed:
	@echo "Seeding database with demo data..."
	@go run cmd/migrate/main.go -action=seed

# Reset database (drop, migrate, seed)
migrate-reset:
	@echo "Resetting database..."
	@go run cmd/migrate/main.go -action=reset

# Run tests
test:
	@echo "Running tests..."
	go test -v -race -coverprofile=coverage.out ./...
	@go tool cover -func=coverage.out

# Run linters (requires golangci-lint)
lint:
	@echo "Running linters..."
	@which golangci-lint > /dev/null || (echo "golangci-lint not installed. Install from https://golangci-lint.run/usage/install/" && exit 1)
	golangci-lint run

# Clean build artifacts
clean:
	@echo "Cleaning..."
	rm -rf bin/
	rm -f coverage.out

# Tidy dependencies
tidy:
	@echo "Tidying dependencies..."
	go mod tidy
	go mod verify

# Install required tools
install-tools:
	@echo "Checking for oapi-codegen..."
	@which oapi-codegen > /dev/null 2>&1 && echo "✓ oapi-codegen found in PATH" || echo "Note: oapi-codegen not found, will use Docker-based script"

# Generate Go client and types from OpenAPI spec
# If oapi-codegen is available locally, use it; otherwise use Docker
generate-client: install-tools
	@if which oapi-codegen > /dev/null 2>&1; then \
		echo "Generating Go types and client from OpenAPI spec (using local oapi-codegen)..."; \
		mkdir -p internal/api; \
		echo "  - Generating types..."; \
		oapi-codegen -config .oapi-codegen-types.yaml -o internal/api/types.gen.go ../api/openapi-bundled.yaml; \
		echo "  - Generating client..."; \
		oapi-codegen -config .oapi-codegen-client.yaml -o internal/api/client.gen.go ../api/openapi-bundled.yaml; \
		echo "  - Generating server interfaces..."; \
		oapi-codegen -config .oapi-codegen-server.yaml -o internal/api/server.gen.go ../api/openapi-bundled.yaml; \
		echo "✓ Go client and types generated in internal/api/"; \
	else \
		echo "Using Docker-based generation (oapi-codegen not in PATH)..."; \
		./scripts/generate-client.sh; \
	fi

