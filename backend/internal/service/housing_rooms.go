package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	pkgerrors "github.com/tbechar/camp-manager-backend/pkg/errors"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// HousingRoomsService defines the interface for housing room business logic
type HousingRoomsService interface {
	// List retrieves housing rooms with pagination and optional search
	List(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.HousingRoomsListResponse, error)

	// GetByID retrieves a single housing room by ID
	GetByID(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID) (*api.HousingRoom, error)

	// Create creates a new housing room
	Create(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, req *api.HousingRoomCreationRequest) (*api.HousingRoom, error)

	// Update updates an existing housing room
	Update(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID, req *api.HousingRoomUpdateRequest) (*api.HousingRoom, error)

	// Delete deletes a housing room by ID
	Delete(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID) error
}

// housingRoomsService implements HousingRoomsService
type housingRoomsService struct {
	repo      HousingRoomsRepository
	areasRepo AreasRepository
}

// NewHousingRoomsService creates a new housing rooms service
func NewHousingRoomsService(repo HousingRoomsRepository, areasRepo AreasRepository) HousingRoomsService {
	return &housingRoomsService{
		repo:      repo,
		areasRepo: areasRepo,
	}
}

// List retrieves housing rooms with pagination and optional search
func (s *housingRoomsService) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.HousingRoomsListResponse, error) {
	housingRooms, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search, filterStrings, sortBy, sortOrder)
	if err != nil {
		return nil, pkgerrors.BadRequest("Failed to list housing rooms", err)
	}

	// Convert domain housing rooms to API housing rooms
	apiHousingRooms := make([]api.HousingRoom, len(housingRooms))
	for i, room := range housingRooms {
		apiHousingRooms[i] = room.ToAPI()
	}

	return &api.HousingRoomsListResponse{
		Items:  apiHousingRooms,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single housing room by ID
func (s *housingRoomsService) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.HousingRoom, error) {
	housingRoom, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Housing room not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get housing room", err)
	}

	apiHousingRoom := housingRoom.ToAPI()
	return &apiHousingRoom, nil
}

// Create creates a new housing room
func (s *housingRoomsService) Create(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, req *api.HousingRoomCreationRequest) (*api.HousingRoom, error) {
	// Validate area exists if areaId is provided
	if req.Spec.AreaId != nil {
		_, err := s.areasRepo.GetByID(ctx, tenantID, campID, *req.Spec.AreaId)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.NotFound(fmt.Sprintf("Could not find associated area with id: '%s'", req.Spec.AreaId.String()), err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate area", err)
		}
	}

	// Create domain housing room from request
	bathroom := ""
	if req.Spec.Bathroom != nil {
		bathroom = string(*req.Spec.Bathroom)
	}

	housingRoom := &domain.HousingRoom{
		TenantID:    tenantID,
		CampID:      campID,
		AreaID:      req.Spec.AreaId,
		Name:        req.Meta.Name,
		Description: utils.PtrToString(req.Meta.Description),
		Beds:        req.Spec.Beds,
		Bathroom:    bathroom,
	}

	// Save to database
	if err := s.repo.Create(ctx, housingRoom); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create housing room", err)
	}

	apiHousingRoom := housingRoom.ToAPI()
	return &apiHousingRoom, nil
}

// Update updates an existing housing room
func (s *housingRoomsService) Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.HousingRoomUpdateRequest) (*api.HousingRoom, error) {
	// Check if housing room exists and belongs to tenant/camp
	existingHousingRoom, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Housing room not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get housing room", err)
	}

	// Validate area exists if areaId is provided
	if req.Spec.AreaId != nil {
		_, err := s.areasRepo.GetByID(ctx, tenantID, campID, *req.Spec.AreaId)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.NotFound(fmt.Sprintf("Could not find associated area with id: '%s'", req.Spec.AreaId.String()), err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate area", err)
		}
	}

	// Update fields
	existingHousingRoom.AreaID = req.Spec.AreaId
	existingHousingRoom.Name = req.Meta.Name
	existingHousingRoom.Description = utils.PtrToString(req.Meta.Description)
	existingHousingRoom.Beds = req.Spec.Beds
	if req.Spec.Bathroom != nil {
		existingHousingRoom.Bathroom = string(*req.Spec.Bathroom)
	} else {
		existingHousingRoom.Bathroom = ""
	}

	// Save updates
	if err := s.repo.Update(ctx, tenantID, campID, existingHousingRoom); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update housing room", err)
	}

	// Fetch updated housing room to get latest timestamps
	updatedHousingRoom, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated housing room", err)
	}

	apiHousingRoom := updatedHousingRoom.ToAPI()
	return &apiHousingRoom, nil
}

// Delete deletes a housing room by ID
func (s *housingRoomsService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	// Check if housing room exists
	_, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Housing room not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get housing room", err)
	}

	// Delete the housing room
	if err := s.repo.Delete(ctx, tenantID, campID, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete housing room", err)
	}

	return nil
}
