.PHONY: help install start stop dev build test clean docker-up docker-down logs

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target
help:
	@echo "$(BLUE)Camp Manager - Monorepo Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Installation:$(NC)"
	@echo "  make install         - Install all dependencies (frontend + backend)"
	@echo "  make install-fe      - Install frontend dependencies"
	@echo "  make install-be      - Install backend dependencies"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev             - Run both frontend and backend (separate terminals recommended)"
	@echo "  make dev-fe          - Run frontend dev server"
	@echo "  make dev-be          - Run backend server"
	@echo "  make start           - Start all services (frontend, backend, database)"
	@echo "  make stop            - Stop all services"
	@echo ""
	@echo "$(GREEN)Docker/Database:$(NC)"
	@echo "  make docker-up       - Start PostgreSQL container"
	@echo "  make docker-down     - Stop PostgreSQL container"
	@echo "  make docker-logs     - View PostgreSQL logs"
	@echo ""
	@echo "$(GREEN)Building:$(NC)"
	@echo "  make build           - Build both frontend and backend"
	@echo "  make build-fe        - Build frontend"
	@echo "  make build-be        - Build backend"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test            - Run all tests (frontend + backend)"
	@echo "  make test-fe         - Run frontend tests"
	@echo "  make test-be         - Run backend tests"
	@echo ""
	@echo "$(GREEN)API:$(NC)"
	@echo "  make api-validate    - Validate OpenAPI specification"
	@echo "  make api-bundle      - Bundle OpenAPI files"
	@echo "  make api-generate    - Generate TypeScript types from OpenAPI"
	@echo "  make api-docs        - Serve API documentation"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make clean           - Clean build artifacts and dependencies"
	@echo "  make clean-fe        - Clean frontend artifacts"
	@echo "  make clean-be        - Clean backend artifacts"
	@echo "  make logs            - View all logs"
	@echo ""
	@echo "$(GREEN)Deployment:$(NC)"
	@echo "  make deploy-preview  - Build frontend and preview production build"

# Installation
install: install-fe install-be
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

install-fe:
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd frontend && npm install

install-be:
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	cd backend && go mod download

# Development - Start services
dev:
	@echo "$(YELLOW)Note: This will run both services. Consider running them in separate terminals:$(NC)"
	@echo "  Terminal 1: make dev-fe"
	@echo "  Terminal 2: make dev-be"
	@echo ""
	@echo "$(BLUE)Starting development environment...$(NC)"
	@$(MAKE) docker-up
	@echo "$(GREEN)Starting backend in background...$(NC)"
	@cd backend && go run cmd/api/main.go > /tmp/backend.log 2>&1 & echo $$! > /tmp/backend.pid
	@sleep 2
	@echo "$(GREEN)Starting frontend...$(NC)"
	@cd frontend && npm run dev

dev-fe:
	@echo "$(BLUE)Starting frontend dev server...$(NC)"
	cd frontend && npm run dev

dev-be:
	@echo "$(BLUE)Starting backend server...$(NC)"
	@$(MAKE) docker-up
	cd backend && make run

start: docker-up
	@echo "$(BLUE)Starting all services...$(NC)"
	@cd backend && make run &
	@cd frontend && npm run dev &
	@echo "$(GREEN)✓ All services started$(NC)"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend:  http://localhost:8080"

stop:
	@echo "$(BLUE)Stopping all services...$(NC)"
	@-pkill -f "go run cmd/api/main.go" 2>/dev/null || true
	@-pkill -f "npm run dev" 2>/dev/null || true
	@-kill $$(cat /tmp/backend.pid 2>/dev/null) 2>/dev/null || true
	@-rm /tmp/backend.pid 2>/dev/null || true
	@$(MAKE) docker-down
	@echo "$(GREEN)✓ All services stopped$(NC)"

# Docker/Database
docker-up:
	@echo "$(BLUE)Starting PostgreSQL...$(NC)"
	cd backend && docker-compose up -d
	@echo "$(GREEN)✓ PostgreSQL started$(NC)"
	@sleep 2

docker-down:
	@echo "$(BLUE)Stopping PostgreSQL...$(NC)"
	cd backend && docker-compose down
	@echo "$(GREEN)✓ PostgreSQL stopped$(NC)"

docker-logs:
	cd backend && docker-compose logs -f postgres

# Building
build: build-fe build-be
	@echo "$(GREEN)✓ Build complete$(NC)"

build-fe:
	@echo "$(BLUE)Building frontend...$(NC)"
	cd frontend && npm run build
	@echo "$(GREEN)✓ Frontend built: frontend/dist/$(NC)"

build-be:
	@echo "$(BLUE)Building backend...$(NC)"
	cd backend && make build
	@echo "$(GREEN)✓ Backend built: backend/bin/api$(NC)"

# Testing
test: test-fe test-be
	@echo "$(GREEN)✓ All tests completed$(NC)"

test-fe:
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd frontend && npm run test

test-be:
	@echo "$(BLUE)Running backend tests...$(NC)"
	cd backend && make test

# API Commands
api-validate:
	@echo "$(BLUE)Validating OpenAPI specification...$(NC)"
	cd frontend && npm run api:validate

api-bundle:
	@echo "$(BLUE)Bundling OpenAPI specification...$(NC)"
	cd frontend && npm run api:bundle

api-generate:
	@echo "$(BLUE)Generating TypeScript types from OpenAPI...$(NC)"
	cd frontend && npm run api:generate-types
	@echo "$(GREEN)✓ Types generated in frontend/src/generated/$(NC)"

api-docs:
	@echo "$(BLUE)Starting API documentation server...$(NC)"
	@echo "$(GREEN)Open http://localhost:8080/swagger-ui.html$(NC)"
	cd frontend && npm run api:serve

# Maintenance
clean: clean-fe clean-be
	@echo "$(GREEN)✓ All artifacts cleaned$(NC)"

clean-fe:
	@echo "$(BLUE)Cleaning frontend...$(NC)"
	rm -rf frontend/node_modules frontend/dist frontend/coverage
	@echo "$(GREEN)✓ Frontend cleaned$(NC)"

clean-be:
	@echo "$(BLUE)Cleaning backend...$(NC)"
	cd backend && make clean
	@echo "$(GREEN)✓ Backend cleaned$(NC)"

logs:
	@echo "$(BLUE)=== Backend Logs ===$(NC)"
	@tail -20 /tmp/backend.log 2>/dev/null || echo "No backend logs found"
	@echo ""
	@echo "$(BLUE)=== PostgreSQL Logs ===$(NC)"
	@cd backend && docker-compose logs --tail=20 postgres 2>/dev/null || echo "PostgreSQL not running"

# Health check
health:
	@echo "$(BLUE)Checking service health...$(NC)"
	@echo -n "Frontend: "
	@curl -s http://localhost:5173 > /dev/null && echo "$(GREEN)✓ Running$(NC)" || echo "$(RED)✗ Not running$(NC)"
	@echo -n "Backend:  "
	@curl -s http://localhost:8080/health > /dev/null && echo "$(GREEN)✓ Running$(NC)" || echo "$(RED)✗ Not running$(NC)"
	@echo -n "Database: "
	@cd backend && docker-compose ps | grep -q "Up" && echo "$(GREEN)✓ Running$(NC)" || echo "$(RED)✗ Not running$(NC)"

# Quick setup for new developers
setup: install docker-up
	@echo "$(GREEN)✓ Setup complete!$(NC)"
	@echo ""
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "  1. Start backend:  make dev-be  (in one terminal)"
	@echo "  2. Start frontend: make dev-fe  (in another terminal)"
	@echo "  3. Open browser:   http://localhost:5173"

# Deployment
deploy-preview:
	@echo "$(BLUE)Building frontend for production preview...$(NC)"
	cd frontend && npm run build
	@echo "$(GREEN)✓ Build complete: frontend/dist/$(NC)"
	@echo ""
	@echo "$(BLUE)To test the production build locally:$(NC)"
	@echo "  cd frontend && npm run preview"

