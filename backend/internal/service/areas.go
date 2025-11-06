package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	pkgerrors "github.com/tbechar/camp-manager-backend/pkg/errors"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// AreasService defines the interface for area business logic
type AreasService interface {
	// List retrieves areas with pagination and optional search
	List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) (*api.AreasListResponse, error)

	// GetByID retrieves a single area by ID
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Area, error)

	// Create creates a new area
	Create(ctx context.Context, tenantID, campID uuid.UUID, req *api.AreaCreationRequest) (*api.Area, error)

	// Update updates an existing area
	Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.AreaUpdateRequest) (*api.Area, error)

	// Delete deletes an area by ID
	Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error
}

// areasService implements AreasService
type areasService struct {
	repo AreasRepository
}

// NewAreasService creates a new areas service
func NewAreasService(repo AreasRepository) AreasService {
	return &areasService{
		repo: repo,
	}
}

// List retrieves areas with pagination and optional search
func (s *areasService) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) (*api.AreasListResponse, error) {
	areas, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to list areas", err)
	}

	// Convert domain areas to API areas
	apiAreas := make([]api.Area, len(areas))
	for i, area := range areas {
		apiAreas[i] = area.ToAPI()
	}

	return &api.AreasListResponse{
		Items:  apiAreas,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single area by ID
func (s *areasService) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Area, error) {
	area, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Area not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get area", err)
	}

	apiArea := area.ToAPI()
	return &apiArea, nil
}

// Create creates a new area
func (s *areasService) Create(ctx context.Context, tenantID, campID uuid.UUID, req *api.AreaCreationRequest) (*api.Area, error) {
	// Create domain area from request
	equipment := []string{}
	if req.Spec.Equipment != nil {
		equipment = *req.Spec.Equipment
	}

	area := &domain.Area{
		TenantID:    tenantID,
		CampID:      campID,
		Name:        req.Meta.Name,
		Description: utils.PtrToString(req.Meta.Description),
		Capacity:    utils.PtrToInt(req.Spec.Capacity),
		Equipment:   equipment,
		Notes:       utils.PtrToString(req.Spec.Notes),
	}

	// Save to database
	if err := s.repo.Create(ctx, area); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create area", err)
	}

	apiArea := area.ToAPI()
	return &apiArea, nil
}

// Update updates an existing area
func (s *areasService) Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.AreaUpdateRequest) (*api.Area, error) {
	// Check if area exists and belongs to tenant/camp
	existingArea, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Area not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get area", err)
	}

	// Update fields
	existingArea.Name = req.Meta.Name
	existingArea.Description = utils.PtrToString(req.Meta.Description)
	existingArea.Capacity = utils.PtrToInt(req.Spec.Capacity)
	if req.Spec.Equipment != nil {
		existingArea.Equipment = *req.Spec.Equipment
	} else {
		existingArea.Equipment = []string{}
	}
	existingArea.Notes = utils.PtrToString(req.Spec.Notes)

	// Save updates
	if err := s.repo.Update(ctx, tenantID, campID, existingArea); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update area", err)
	}

	// Fetch updated area to get latest timestamps
	updatedArea, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated area", err)
	}

	apiArea := updatedArea.ToAPI()
	return &apiArea, nil
}

// Delete deletes an area by ID
func (s *areasService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	// Check if area exists
	_, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Area not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get area", err)
	}

	// Delete the area
	if err := s.repo.Delete(ctx, tenantID, campID, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete area", err)
	}

	return nil
}
