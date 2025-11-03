package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
)

// LocationsService defines the interface for location business logic
type LocationsService interface {
	// List retrieves locations with pagination and optional search
	List(ctx context.Context, limit, offset int, search *string) (*api.LocationsListResponse, error)

	// GetByID retrieves a single location by ID
	GetByID(ctx context.Context, id uuid.UUID) (*api.Location, error)

	// Create creates a new location
	Create(ctx context.Context, req *api.LocationCreationRequest) (*api.Location, error)

	// Update updates an existing location
	Update(ctx context.Context, id uuid.UUID, req *api.LocationUpdateRequest) (*api.Location, error)

	// Delete deletes a location by ID
	Delete(ctx context.Context, id uuid.UUID) error
}

// locationsService implements LocationsService
type locationsService struct {
	repo LocationsRepository
}

// NewLocationsService creates a new locations service
func NewLocationsService(repo LocationsRepository) LocationsService {
	return &locationsService{
		repo: repo,
	}
}

// List retrieves locations with pagination and optional search
func (s *locationsService) List(ctx context.Context, limit, offset int, search *string) (*api.LocationsListResponse, error) {
	// TODO: Implement list logic
	return nil, nil
}

// GetByID retrieves a single location by ID
func (s *locationsService) GetByID(ctx context.Context, id uuid.UUID) (*api.Location, error) {
	// TODO: Implement get by ID logic
	return nil, nil
}

// Create creates a new location
func (s *locationsService) Create(ctx context.Context, req *api.LocationCreationRequest) (*api.Location, error) {
	// TODO: Implement create logic
	return nil, nil
}

// Update updates an existing location
func (s *locationsService) Update(ctx context.Context, id uuid.UUID, req *api.LocationUpdateRequest) (*api.Location, error) {
	// TODO: Implement update logic
	return nil, nil
}

// Delete deletes a location by ID
func (s *locationsService) Delete(ctx context.Context, id uuid.UUID) error {
	// TODO: Implement delete logic
	return nil
}

