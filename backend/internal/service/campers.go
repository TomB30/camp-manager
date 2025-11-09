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

// CampersService defines the interface for camper business logic
type CampersService interface {
	// List retrieves campers with pagination and optional search
	List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit int, offset int, search *string) (*api.CampersListResponse, error)

	// GetByID retrieves a single camper by ID
	GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.Camper, error)

	// Create creates a new camper
	Create(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, req *api.CamperCreationRequest) (*api.Camper, error)

	// Update updates an existing camper
	Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, req *api.CamperUpdateRequest) (*api.Camper, error)

	// Delete deletes a camper by ID
	Delete(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) error
}

// campersService implements CampersService
type campersService struct {
	repo         CampersRepository
	sessionsRepo SessionsRepository
	groupsRepo   GroupsRepository
}

// NewCampersService creates a new campers service
func NewCampersService(repo CampersRepository, sessionsRepo SessionsRepository, groupsRepo GroupsRepository) CampersService {
	return &campersService{
		repo:         repo,
		sessionsRepo: sessionsRepo,
		groupsRepo:   groupsRepo,
	}
}

// List retrieves campers with pagination and optional search
func (s *campersService) List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit int, offset int, search *string) (*api.CampersListResponse, error) {
	campers, total, err := s.repo.List(ctx, tenantId, campId, limit, offset, search)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to list campers", err)
	}

	// Convert domain campers to API campers
	apiCampers := make([]api.Camper, len(campers))
	for i, camper := range campers {
		apiCampers[i] = camper.ToAPI()
	}

	return &api.CampersListResponse{
		Items:  apiCampers,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single camper by ID
func (s *campersService) GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.Camper, error) {
	camper, err := s.repo.GetByID(ctx, tenantId, campId, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Camper not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get camper", err)
	}

	apiCamper := camper.ToAPI()
	return &apiCamper, nil
}

// Create creates a new camper
func (s *campersService) Create(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, req *api.CamperCreationRequest) (*api.Camper, error) {
	// Validate and extract housing group ID from groupIds
	housingGroupId, err := s.validateAndExtractHousingGroup(ctx, tenantId, campId, req.Spec.GroupIds)
	if err != nil {
		return nil, pkgerrors.BadRequest(err.Error(), err)
	}

	// Validate session
	err = s.validateSession(ctx, tenantId, campId, req.Spec.SessionId)
	if err != nil {
		return nil, pkgerrors.BadRequest(err.Error(), err)
	}

	domainCamper := domain.Camper{
		TenantID:       tenantId,
		CampID:         campId,
		Name:           req.Meta.Name,
		Description:    utils.PtrToString(req.Meta.Description),
		Birthday:       req.Spec.Birthday.Time,
		Gender:         string(req.Spec.Gender),
		SessionID:      req.Spec.SessionId,
		HousingGroupID: housingGroupId,
	}
	domainCamper.GroupCampers = []domain.GroupCamper{}
	if req.Spec.GroupIds != nil {
		for _, groupId := range *req.Spec.GroupIds {
			domainCamper.GroupCampers = append(domainCamper.GroupCampers, domain.GroupCamper{GroupID: groupId, CamperID: domainCamper.ID})
		}
	}

	// Save to database
	if err := s.repo.Create(ctx, &domainCamper); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create camper", err)
	}

	apiCamper := domainCamper.ToAPI()
	return &apiCamper, nil
}

// Update updates an existing camper
func (s *campersService) Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, req *api.CamperUpdateRequest) (*api.Camper, error) {
	// Check if camper exists and belongs to tenant/camp
	existingCamper, err := s.repo.GetByID(ctx, tenantId, campId, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Camper not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get camper", err)
	}

	// Validate and extract housing group ID from groupIds
	housingGroupId, err := s.validateAndExtractHousingGroup(ctx, tenantId, campId, req.Spec.GroupIds)
	if err != nil {
		return nil, pkgerrors.BadRequest(err.Error(), err)
	}

	// Validate session
	err = s.validateSession(ctx, tenantId, campId, req.Spec.SessionId)
	if err != nil {
		return nil, pkgerrors.BadRequest(err.Error(), err)
	}

	existingCamper.Name = req.Meta.Name
	existingCamper.Description = utils.PtrToString(req.Meta.Description)
	existingCamper.Birthday = req.Spec.Birthday.Time
	existingCamper.Gender = string(req.Spec.Gender)
	existingCamper.SessionID = req.Spec.SessionId
	existingCamper.HousingGroupID = housingGroupId
	existingCamper.GroupCampers = []domain.GroupCamper{}
	if req.Spec.GroupIds != nil {
		for _, groupId := range *req.Spec.GroupIds {
			existingCamper.GroupCampers = append(existingCamper.GroupCampers, domain.GroupCamper{GroupID: groupId, CamperID: id})
		}
	}

	// Save updates
	if err := s.repo.Update(ctx, tenantId, campId, id, existingCamper); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update camper", err)
	}

	apiCamper := existingCamper.ToAPI()
	return &apiCamper, nil
}

// Delete deletes a camper by ID
func (s *campersService) Delete(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) error {
	// Check if camper exists and belongs to tenant/camp
	_, err := s.repo.GetByID(ctx, tenantId, campId, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Camper not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get camper", err)
	}

	// Delete the camper
	if err := s.repo.Delete(ctx, tenantId, campId, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete camper", err)
	}

	return nil
}

// validateAndExtractHousingGroup validates that at most one housing group exists in groupIds
// and returns the housing group ID if found
func (s *campersService) validateAndExtractHousingGroup(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, groupIds *[]uuid.UUID) (*uuid.UUID, error) {
	if groupIds == nil || len(*groupIds) == 0 {
		return nil, nil
	}

	// Fetch all groups in a single query
	groups, err := s.groupsRepo.GetByIDs(ctx, tenantId, campId, *groupIds)
	if err != nil {
		return nil, fmt.Errorf("failed to check group existence: %w", err)
	}

	// Check if all requested groups were found
	if len(groups) != len(*groupIds) {
		// Find which group IDs are missing
		foundIds := make(map[uuid.UUID]bool)
		for _, group := range groups {
			foundIds[group.ID] = true
		}
		for _, groupId := range *groupIds {
			if !foundIds[groupId] {
				return nil, fmt.Errorf("group with id '%s' not found", groupId.String())
			}
		}
	}

	// Check for housing groups
	var housingGroupId *uuid.UUID
	housingGroupCount := 0

	for _, group := range groups {
		if group.HousingRoomID != nil {
			housingGroupCount++
			housingGroupId = &group.ID
		}
	}

	if housingGroupCount > 1 {
		return nil, fmt.Errorf("camper can only belong to one housing group, found %d", housingGroupCount)
	}

	return housingGroupId, nil
}

// validateSession validates that the session exists
func (s *campersService) validateSession(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, sessionId uuid.UUID) error {
	_, err := s.sessionsRepo.GetByID(ctx, tenantId, campId, sessionId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("session with id '%s' not found", sessionId.String())
		}
		return fmt.Errorf("failed to check session existence: %w", err)
	}
	return nil
}
