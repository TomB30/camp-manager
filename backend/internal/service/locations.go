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

// LocationsService defines the interface for location business logic
type LocationsService interface {
	// List retrieves locations with pagination and optional search
	List(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, limit, offset int, search *string) (*api.LocationsListResponse, error)

	// GetByID retrieves a single location by ID
	GetByID(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID) (*api.Location, error)

	// Create creates a new location
	Create(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, req *api.LocationCreationRequest) (*api.Location, error)

	// Update updates an existing location
	Update(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID, req *api.LocationUpdateRequest) (*api.Location, error)

	// Delete deletes a location by ID
	Delete(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID) error
}

// locationsService implements LocationsService
type locationsService struct {
	repo      LocationsRepository
	areasRepo AreasRepository
}

// NewLocationsService creates a new locations service
func NewLocationsService(repo LocationsRepository, areasRepo AreasRepository) LocationsService {
	return &locationsService{
		repo:      repo,
		areasRepo: areasRepo,
	}
}

// List retrieves locations with pagination and optional search
func (s *locationsService) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) (*api.LocationsListResponse, error) {
	locations, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to list locations", err)
	}

	// Convert domain locations to API locations
	apiLocations := make([]api.Location, len(locations))
	for i, location := range locations {
		apiLocations[i] = location.ToAPI()
	}

	return &api.LocationsListResponse{
		Items:  apiLocations,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single location by ID
func (s *locationsService) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Location, error) {
	location, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Location not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get location", err)
	}

	apiLocation := location.ToAPI()
	return &apiLocation, nil
}

// Create creates a new location
func (s *locationsService) Create(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, req *api.LocationCreationRequest) (*api.Location, error) {
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

	// Create domain location from request
	equipment := []string{}
	if req.Spec.Equipment != nil {
		equipment = *req.Spec.Equipment
	}

	location := &domain.Location{
		TenantID:    tenantID,
		CampID:      campID,
		AreaID:      req.Spec.AreaId,
		Name:        req.Meta.Name,
		Description: utils.PtrToString(req.Meta.Description),
		Capacity:    utils.PtrToInt(req.Spec.Capacity),
		Equipment:   equipment,
		Notes:       utils.PtrToString(req.Spec.Notes),
	}

	// Save to database
	if err := s.repo.Create(ctx, location); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create location", err)
	}

	apiLocation := location.ToAPI()
	return &apiLocation, nil
}

// Update updates an existing location
func (s *locationsService) Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.LocationUpdateRequest) (*api.Location, error) {
	// Check if location exists and belongs to tenant/camp
	existingLocation, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Location not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get location", err)
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
	existingLocation.AreaID = req.Spec.AreaId
	existingLocation.Name = req.Meta.Name
	existingLocation.Description = utils.PtrToString(req.Meta.Description)
	existingLocation.Capacity = utils.PtrToInt(req.Spec.Capacity)
	if req.Spec.Equipment != nil {
		existingLocation.Equipment = *req.Spec.Equipment
	} else {
		existingLocation.Equipment = []string{}
	}
	existingLocation.Notes = utils.PtrToString(req.Spec.Notes)

	// Save updates
	if err := s.repo.Update(ctx, tenantID, campID, existingLocation); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update location", err)
	}

	// Fetch updated location to get latest timestamps
	updatedLocation, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated location", err)
	}

	apiLocation := updatedLocation.ToAPI()
	return &apiLocation, nil
}

// Delete deletes a location by ID
func (s *locationsService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	// Check if location exists
	_, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Location not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get location", err)
	}

	// Delete the location
	if err := s.repo.Delete(ctx, tenantID, campID, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete location", err)
	}

	return nil
}
