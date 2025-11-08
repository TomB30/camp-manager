package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	pkgcontext "github.com/tbechar/camp-manager-backend/pkg/context"
	pkgerrors "github.com/tbechar/camp-manager-backend/pkg/errors"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// CampsService defines the interface for camp business logic
type CampsService interface {
	// List retrieves camps with pagination and optional search
	List(ctx context.Context, tenantID uuid.UUID, limit, offset int, search *string) (*api.CampsListResponse, error)

	// GetByID retrieves a single camp by ID
	GetByID(ctx context.Context, tenantID, campID uuid.UUID) (*api.Camp, error)

	// Create creates a new camp
	Create(ctx context.Context, tenantID uuid.UUID, req *api.CampCreationRequest) (*api.Camp, error)

	// Update updates an existing camp
	Update(ctx context.Context, tenantID, campID uuid.UUID, req *api.CampUpdateRequest) (*api.Camp, error)

	// Delete deletes a camp by ID
	Delete(ctx context.Context, tenantID, campID uuid.UUID) error
}

// campsService implements CampsService
type campsService struct {
	repo CampsRepository
}

// NewCampsService creates a new camps service
func NewCampsService(repo CampsRepository) CampsService {
	return &campsService{
		repo: repo,
	}
}

// List returns a paginated list of camps for a tenant, filtered by user access
func (s *campsService) List(ctx context.Context, tenantID uuid.UUID, limit, offset int, search *string) (*api.CampsListResponse, error) {
	// Extract user's access rules from context to filter camps
	accessRules, err := pkgcontext.ExtractAccessRules(ctx)
	if err != nil {
		return nil, pkgerrors.Unauthorized("Authentication required", err)
	}

	// Determine which camp IDs the user has access to
	campIDs := extractAccessibleCampIDs(accessRules, tenantID)

	// Fetch camps with access filtering
	camps, total, err := s.repo.List(ctx, tenantID, campIDs, limit, offset, search)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to list camps", err)
	}

	// Convert domain camps to API camps
	apiCamps := make([]api.Camp, len(camps))
	for i, camp := range camps {
		apiCamps[i] = camp.ToAPI()
	}

	// Calculate next offset
	var next *int
	if offset+limit < int(total) {
		nextVal := offset + limit
		next = &nextVal
	}

	return &api.CampsListResponse{
		Items:  apiCamps,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
		Next:   next,
	}, nil
}

// GetByID returns a single camp by ID, checking user access
func (s *campsService) GetByID(ctx context.Context, tenantID, campID uuid.UUID) (*api.Camp, error) {
	// Extract user's access rules from context to verify access
	accessRules, err := pkgcontext.ExtractAccessRules(ctx)
	if err != nil {
		return nil, pkgerrors.Unauthorized("Authentication required", err)
	}

	// Check if user has access to this specific camp
	if !hasAccessToCamp(accessRules, tenantID, campID) {
		return nil, pkgerrors.Forbidden("No access to this camp", nil)
	}

	camp, err := s.repo.GetByID(ctx, tenantID, campID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Camp not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get camp", err)
	}

	apiCamp := camp.ToAPI()
	return &apiCamp, nil
}

// Create creates a new camp
func (s *campsService) Create(ctx context.Context, tenantID uuid.UUID, req *api.CampCreationRequest) (*api.Camp, error) {
	// Convert API request to domain camp
	camp := &domain.Camp{
		TenantID:       tenantID,
		Name:           req.Meta.Name,
		Description:    utils.PtrToString(req.Meta.Description),
		StartDate:      req.Spec.StartDate.Time,
		EndDate:        req.Spec.EndDate.Time,
		DailyStartTime: req.Spec.DailyStartTime,
		DailyEndTime:   req.Spec.DailyEndTime,
		LogoURL:        utils.PtrToString(req.Spec.LogoUrl),
		Timezone:       "America/New_York", // Default timezone
	}

	// Convert Address if provided
	if req.Spec.Address != nil {
		camp.Address = domain.Address{
			Street:  utils.PtrToString(req.Spec.Address.Street),
			City:    utils.PtrToString(req.Spec.Address.City),
			State:   utils.PtrToString(req.Spec.Address.State),
			ZipCode: utils.PtrToString(req.Spec.Address.ZipCode),
			Country: utils.PtrToString(req.Spec.Address.Country),
		}
	}

	// Convert ContactInfo if provided
	if req.Spec.ContactInfo != nil {
		var email string
		if req.Spec.ContactInfo.Email != nil {
			email = string(*req.Spec.ContactInfo.Email)
		}
		camp.ContactInfo = domain.Contact{
			Phone:   utils.PtrToString(req.Spec.ContactInfo.Phone),
			Email:   email,
			Website: utils.PtrToString(req.Spec.ContactInfo.Website),
		}
	}

	// Validate dates
	if camp.EndDate.Before(camp.StartDate) {
		return nil, pkgerrors.BadRequest("End date must be after start date", nil)
	}

	// Save to database
	if err := s.repo.Create(ctx, camp); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create camp", err)
	}

	apiCamp := camp.ToAPI()
	return &apiCamp, nil
}

// Update updates an existing camp
func (s *campsService) Update(ctx context.Context, tenantID, campID uuid.UUID, req *api.CampUpdateRequest) (*api.Camp, error) {
	// Extract user's access rules from context to verify access
	accessRules, err := pkgcontext.ExtractAccessRules(ctx)
	if err != nil {
		return nil, pkgerrors.Unauthorized("Authentication required", err)
	}

	// Check if user has access to this specific camp
	if !hasAccessToCamp(accessRules, tenantID, campID) {
		return nil, pkgerrors.Forbidden("No access to this camp", nil)
	}

	// First, check if camp exists
	existingCamp, err := s.repo.GetByID(ctx, tenantID, campID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Camp not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get camp", err)
	}

	// Update fields
	existingCamp.Name = req.Meta.Name
	existingCamp.Description = utils.PtrToString(req.Meta.Description)
	existingCamp.StartDate = req.Spec.StartDate.Time
	existingCamp.EndDate = req.Spec.EndDate.Time
	existingCamp.DailyStartTime = req.Spec.DailyStartTime
	existingCamp.DailyEndTime = req.Spec.DailyEndTime
	existingCamp.LogoURL = utils.PtrToString(req.Spec.LogoUrl)

	// Update Address if provided
	if req.Spec.Address != nil {
		existingCamp.Address = domain.Address{
			Street:  utils.PtrToString(req.Spec.Address.Street),
			City:    utils.PtrToString(req.Spec.Address.City),
			State:   utils.PtrToString(req.Spec.Address.State),
			ZipCode: utils.PtrToString(req.Spec.Address.ZipCode),
			Country: utils.PtrToString(req.Spec.Address.Country),
		}
	} else {
		existingCamp.Address = domain.Address{}
	}

	// Update ContactInfo if provided
	if req.Spec.ContactInfo != nil {
		var email string
		if req.Spec.ContactInfo.Email != nil {
			email = string(*req.Spec.ContactInfo.Email)
		}
		existingCamp.ContactInfo = domain.Contact{
			Phone:   utils.PtrToString(req.Spec.ContactInfo.Phone),
			Email:   email,
			Website: utils.PtrToString(req.Spec.ContactInfo.Website),
		}
	} else {
		existingCamp.ContactInfo = domain.Contact{}
	}

	// Validate dates
	if existingCamp.EndDate.Before(existingCamp.StartDate) {
		return nil, pkgerrors.BadRequest("End date must be after start date", nil)
	}

	// Save to database
	if err := s.repo.Update(ctx, existingCamp); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update camp", err)
	}

	apiCamp := existingCamp.ToAPI()
	return &apiCamp, nil
}

// Delete soft deletes a camp
func (s *campsService) Delete(ctx context.Context, tenantID, campID uuid.UUID) error {
	// Check if camp exists
	_, err := s.repo.GetByID(ctx, tenantID, campID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Camp not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get camp", err)
	}

	// Delete the camp
	if err := s.repo.Delete(ctx, tenantID, campID); err != nil {
		return pkgerrors.InternalServerError("Failed to delete camp", err)
	}

	return nil
}

// extractAccessibleCampIDs extracts the camp IDs that a user has access to based on their access rules
// Returns nil for system and tenant-scope users (meaning all camps in the tenant)
// Returns specific camp IDs for camp-scope users
func extractAccessibleCampIDs(accessRules []domain.AccessRule, tenantID uuid.UUID) []uuid.UUID {
	var campIDs []uuid.UUID

	for _, rule := range accessRules {
		// System scope - has access to all camps
		if rule.IsSystemScope() {
			return nil // nil means "all camps"
		}

		// Tenant scope - has access to all camps in this tenant
		if rule.IsTenantScope() && rule.ScopeID != nil && *rule.ScopeID == tenantID {
			return nil // nil means "all camps in this tenant"
		}

		// Camp scope - collect specific camp IDs
		if rule.IsCampScope() && rule.ScopeID != nil {
			campIDs = append(campIDs, *rule.ScopeID)
		}
	}

	return campIDs
}

// hasAccessToCamp checks if a user has access to a specific camp
func hasAccessToCamp(accessRules []domain.AccessRule, tenantID, campID uuid.UUID) bool {
	for _, rule := range accessRules {
		// System scope - has access to everything
		if rule.IsSystemScope() {
			return true
		}

		// Tenant scope - has access to all camps in this tenant
		if rule.IsTenantScope() && rule.ScopeID != nil && *rule.ScopeID == tenantID {
			return true
		}

		// Camp scope - check if it matches this specific camp
		if rule.IsCampScope() && rule.ScopeID != nil && *rule.ScopeID == campID {
			return true
		}
	}

	return false
}
