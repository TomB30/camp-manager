package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
)

// ProgramsService defines the interface for program business logic
type ProgramsService interface {
	// List retrieves programs with pagination and optional search
	List(ctx context.Context, limit, offset int, search *string) (*api.ProgramsListResponse, error)

	// GetByID retrieves a single program by ID
	GetByID(ctx context.Context, id uuid.UUID) (*api.Program, error)

	// Create creates a new program
	Create(ctx context.Context, req *api.ProgramCreationRequest) (*api.Program, error)

	// Update updates an existing program
	Update(ctx context.Context, id uuid.UUID, req *api.ProgramUpdateRequest) (*api.Program, error)

	// Delete deletes a program by ID
	Delete(ctx context.Context, id uuid.UUID) error
}

// programsService implements ProgramsService
type programsService struct {
	repo ProgramsRepository
}

// NewProgramsService creates a new programs service
func NewProgramsService(repo ProgramsRepository) ProgramsService {
	return &programsService{
		repo: repo,
	}
}

// List retrieves programs with pagination and optional search
func (s *programsService) List(ctx context.Context, limit, offset int, search *string) (*api.ProgramsListResponse, error) {
	// TODO: Implement list logic
	return nil, nil
}

// GetByID retrieves a single program by ID
func (s *programsService) GetByID(ctx context.Context, id uuid.UUID) (*api.Program, error) {
	// TODO: Implement get by ID logic
	return nil, nil
}

// Create creates a new program
func (s *programsService) Create(ctx context.Context, req *api.ProgramCreationRequest) (*api.Program, error) {
	// TODO: Implement create logic
	return nil, nil
}

// Update updates an existing program
func (s *programsService) Update(ctx context.Context, id uuid.UUID, req *api.ProgramUpdateRequest) (*api.Program, error) {
	// TODO: Implement update logic
	return nil, nil
}

// Delete deletes a program by ID
func (s *programsService) Delete(ctx context.Context, id uuid.UUID) error {
	// TODO: Implement delete logic
	return nil
}

