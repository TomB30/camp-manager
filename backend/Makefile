.PHONY: help run build docker-up docker-down docker-logs test lint clean tidy

# Default target
help:
	@echo "Available targets:"
	@echo "  run          - Run the server"
	@echo "  build        - Build the binary"
	@echo "  docker-up    - Start PostgreSQL container"
	@echo "  docker-down  - Stop PostgreSQL container"
	@echo "  docker-logs  - View PostgreSQL logs"
	@echo "  test         - Run tests"
	@echo "  lint         - Run linters"
	@echo "  clean        - Remove build artifacts"
	@echo "  tidy         - Tidy and verify dependencies"

# Run the server
run:
	@echo "Starting server..."
	go run cmd/api/main.go

# Build the binary
build:
	@echo "Building binary..."
	go build -o bin/api cmd/api/main.go

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

