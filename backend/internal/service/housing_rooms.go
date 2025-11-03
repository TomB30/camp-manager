package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
)

// HousingRoomsService defines the interface for housing room business logic
type HousingRoomsService interface {
	// List retrieves housing rooms with pagination and optional search
	List(ctx context.Context, limit, offset int, search *string) (*api.HousingRoomsListResponse, error)

	// GetByID retrieves a single housing room by ID
	GetByID(ctx context.Context, id uuid.UUID) (*api.HousingRoom, error)

	// Create creates a new housing room
	Create(ctx context.Context, req *api.HousingRoomCreationRequest) (*api.HousingRoom, error)

	// Update updates an existing housing room
	Update(ctx context.Context, id uuid.UUID, req *api.HousingRoomUpdateRequest) (*api.HousingRoom, error)

	// Delete deletes a housing room by ID
	Delete(ctx context.Context, id uuid.UUID) error
}

// housingRoomsService implements HousingRoomsService
type housingRoomsService struct {
	repo HousingRoomsRepository
}

// NewHousingRoomsService creates a new housing rooms service
func NewHousingRoomsService(repo HousingRoomsRepository) HousingRoomsService {
	return &housingRoomsService{
		repo: repo,
	}
}

// List retrieves housing rooms with pagination and optional search
func (s *housingRoomsService) List(ctx context.Context, limit, offset int, search *string) (*api.HousingRoomsListResponse, error) {
	// TODO: Implement list logic
	return nil, nil
}

// GetByID retrieves a single housing room by ID
func (s *housingRoomsService) GetByID(ctx context.Context, id uuid.UUID) (*api.HousingRoom, error) {
	// TODO: Implement get by ID logic
	return nil, nil
}

// Create creates a new housing room
func (s *housingRoomsService) Create(ctx context.Context, req *api.HousingRoomCreationRequest) (*api.HousingRoom, error) {
	// TODO: Implement create logic
	return nil, nil
}

// Update updates an existing housing room
func (s *housingRoomsService) Update(ctx context.Context, id uuid.UUID, req *api.HousingRoomUpdateRequest) (*api.HousingRoom, error) {
	// TODO: Implement update logic
	return nil, nil
}

// Delete deletes a housing room by ID
func (s *housingRoomsService) Delete(ctx context.Context, id uuid.UUID) error {
	// TODO: Implement delete logic
	return nil
}

