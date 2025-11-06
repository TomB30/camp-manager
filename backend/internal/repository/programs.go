package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/database"
)

// ProgramsRepository handles database operations for programs
type ProgramsRepository struct {
	db *database.Database
}

// NewProgramsRepository creates a new programs repository
func NewProgramsRepository(db *database.Database) *ProgramsRepository {
	return &ProgramsRepository{db: db}
}

// List retrieves a paginated list of programs
func (r *ProgramsRepository) List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit int, offset int, search *string) ([]api.Program, int, error) {
	// TODO: Implement query with pagination and search
	return nil, 0, nil
}

// GetByID retrieves a single program by ID
func (r *ProgramsRepository) GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.Program, error) {
	// TODO: Implement single row query
	return nil, nil
}

// Create inserts a new program
func (r *ProgramsRepository) Create(ctx context.Context, program *api.Program) error {
	// TODO: Implement INSERT query
	return nil
}

// Update updates an existing program
func (r *ProgramsRepository) Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, program *api.Program) error {
	// TODO: Implement UPDATE query
	return nil
}

// Delete removes a program by ID
func (r *ProgramsRepository) Delete(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) error {
	// TODO: Implement DELETE query
	return nil
}
