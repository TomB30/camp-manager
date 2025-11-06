package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
)

// ActivitiesService defines the interface for activity business logic
type ActivitiesService interface {
	// List retrieves activities with pagination and optional search
	List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit int, offset int, search *string) (*api.ActivitiesListResponse, error)

	// GetByID retrieves a single activity by ID
	GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.Activity, error)

	// Create creates a new activity
	Create(ctx context.Context, req *api.ActivityCreationRequest) (*api.Activity, error)

	// Update updates an existing activity
	Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, req *api.ActivityUpdateRequest) (*api.Activity, error)

	// Delete deletes an activity by ID
	Delete(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) error
}

// activitiesService implements ActivitiesService
type activitiesService struct {
	repo ActivitiesRepository
}

// NewActivitiesService creates a new activities service
func NewActivitiesService(repo ActivitiesRepository) ActivitiesService {
	return &activitiesService{
		repo: repo,
	}
}

// List retrieves activities with pagination and optional search
func (s *activitiesService) List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit int, offset int, search *string) (*api.ActivitiesListResponse, error) {
	// TODO: Implement list logic
	return nil, nil
}

// GetByID retrieves a single activity by ID
func (s *activitiesService) GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.Activity, error) {
	// TODO: Implement get by ID logic
	return nil, nil
}

// Create creates a new activity
func (s *activitiesService) Create(ctx context.Context, req *api.ActivityCreationRequest) (*api.Activity, error) {
	// TODO: Implement create logic
	return nil, nil
}

// Update updates an existing activity
func (s *activitiesService) Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, req *api.ActivityUpdateRequest) (*api.Activity, error) {
	// TODO: Implement update logic
	return nil, nil
}

// Delete deletes an activity by ID
func (s *activitiesService) Delete(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) error {
	// TODO: Implement delete logic
	return nil
}
