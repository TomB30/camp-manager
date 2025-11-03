package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
)

// CampersService defines the interface for camper business logic
type CampersService interface {
	// List retrieves campers with pagination and optional search
	List(ctx context.Context, limit, offset int, search *string) (*api.CampersListResponse, error)

	// GetByID retrieves a single camper by ID
	GetByID(ctx context.Context, id uuid.UUID) (*api.Camper, error)

	// Create creates a new camper
	Create(ctx context.Context, req *api.CamperCreationRequest) (*api.Camper, error)

	// Update updates an existing camper
	Update(ctx context.Context, id uuid.UUID, req *api.CamperUpdateRequest) (*api.Camper, error)

	// Delete deletes a camper by ID
	Delete(ctx context.Context, id uuid.UUID) error
}

// campersService implements CampersService
type campersService struct {
	repo CampersRepository
}

// NewCampersService creates a new campers service
func NewCampersService(repo CampersRepository) CampersService {
	return &campersService{
		repo: repo,
	}
}

// List retrieves campers with pagination and optional search
func (s *campersService) List(ctx context.Context, limit, offset int, search *string) (*api.CampersListResponse, error) {
	// TODO: Implement list logic
	return nil, nil
}

// GetByID retrieves a single camper by ID
func (s *campersService) GetByID(ctx context.Context, id uuid.UUID) (*api.Camper, error) {
	// TODO: Implement get by ID logic
	return nil, nil
}

// Create creates a new camper
func (s *campersService) Create(ctx context.Context, req *api.CamperCreationRequest) (*api.Camper, error) {
	// TODO: Implement create logic
	return nil, nil
}

// Update updates an existing camper
func (s *campersService) Update(ctx context.Context, id uuid.UUID, req *api.CamperUpdateRequest) (*api.Camper, error) {
	// TODO: Implement update logic
	return nil, nil
}

// Delete deletes a camper by ID
func (s *campersService) Delete(ctx context.Context, id uuid.UUID) error {
	// TODO: Implement delete logic
	return nil
}
