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

// ColorsService defines the interface for color business logic
type ColorsService interface {
	// List retrieves colors with pagination and optional search
	List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) (*api.ColorsListResponse, error)

	// GetByID retrieves a single color by ID
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Color, error)

	// Create creates a new color
	Create(ctx context.Context, tenantID, campID uuid.UUID, req *api.ColorCreationRequest) (*api.Color, error)

	// Update updates an existing color
	Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.ColorUpdateRequest) (*api.Color, error)

	// Delete deletes a color by ID
	Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error
}

// colorsService implements ColorsService
type colorsService struct {
	repo ColorsRepository
}

// NewColorsService creates a new colors service
func NewColorsService(repo ColorsRepository) ColorsService {
	return &colorsService{
		repo: repo,
	}
}

// List retrieves colors with pagination and optional search
func (s *colorsService) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) (*api.ColorsListResponse, error) {
	colors, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to list colors", err)
	}

	// Convert domain colors to API colors
	apiColors := make([]api.Color, len(colors))
	for i, color := range colors {
		apiColors[i] = color.ToAPI()
	}

	return &api.ColorsListResponse{
		Items:  apiColors,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single color by ID
func (s *colorsService) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Color, error) {
	color, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Color not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get color", err)
	}

	apiColor := color.ToAPI()
	return &apiColor, nil
}

// Create creates a new color
func (s *colorsService) Create(ctx context.Context, tenantID, campID uuid.UUID, req *api.ColorCreationRequest) (*api.Color, error) {
	// Create domain color from request
	color := &domain.Color{
		TenantID:    tenantID,
		CampID:      campID,
		Name:        req.Meta.Name,
		Description: utils.PtrToString(req.Meta.Description),
		HexValue:    req.Spec.HexValue,
		Default:     utils.PtrToBool(req.Spec.Default),
	}

	// Save to database
	if err := s.repo.Create(ctx, color); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create color", err)
	}

	apiColor := color.ToAPI()
	return &apiColor, nil
}

// Update updates an existing color
func (s *colorsService) Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.ColorUpdateRequest) (*api.Color, error) {
	// Check if color exists and belongs to tenant/camp
	existingColor, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Color not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get color", err)
	}

	// Update fields
	existingColor.Name = req.Meta.Name
	existingColor.Description = utils.PtrToString(req.Meta.Description)
	existingColor.HexValue = req.Spec.HexValue
	existingColor.Default = utils.PtrToBool(req.Spec.Default)

	// Save updates
	if err := s.repo.Update(ctx, tenantID, campID, existingColor); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update color", err)
	}

	// Fetch updated color to get latest timestamps
	updatedColor, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated color", err)
	}

	apiColor := updatedColor.ToAPI()
	return &apiColor, nil
}

// Delete deletes a color by ID
func (s *colorsService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	// Check if color exists
	_, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Color not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get color", err)
	}

	// Delete the color
	if err := s.repo.Delete(ctx, tenantID, campID, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete color", err)
	}

	return nil
}
