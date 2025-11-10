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

// GroupsService defines the interface for group business logic
type GroupsService interface {
	// List retrieves groups with pagination and optional search
	List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit int, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.GroupsListResponse, error)

	// GetByID retrieves a single group by ID
	GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.Group, error)

	// Create creates a new group
	Create(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, req *api.GroupCreationRequest) (*api.Group, error)

	// Update updates an existing group
	Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, req *api.GroupUpdateRequest) (*api.Group, error)

	// Delete deletes a group by ID
	Delete(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) error
}

// groupsService implements GroupsService
type groupsService struct {
	repo             GroupsRepository
	sessionsRepo     SessionsRepository
	housingRoomsRepo HousingRoomsRepository
}

// NewGroupsService creates a new groups service
func NewGroupsService(repo GroupsRepository, sessionsRepo SessionsRepository, housingRoomsRepo HousingRoomsRepository) GroupsService {
	return &groupsService{
		repo:             repo,
		sessionsRepo:     sessionsRepo,
		housingRoomsRepo: housingRoomsRepo,
	}
}

// List retrieves groups with pagination and optional search
func (s *groupsService) List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit int, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.GroupsListResponse, error) {
	groups, total, err := s.repo.List(ctx, tenantId, campId, limit, offset, search, filterStrings, sortBy, sortOrder)
	if err != nil {
		return nil, pkgerrors.BadRequest("Failed to list groups", err)
	}

	// Convert domain groups to API groups
	apiGroups := make([]api.Group, len(groups))
	for i, group := range groups {
		apiGroups[i] = group.ToAPI()
	}

	return &api.GroupsListResponse{
		Items:  apiGroups,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single group by ID
func (s *groupsService) GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.Group, error) {
	group, err := s.repo.GetByID(ctx, tenantId, campId, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Group not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get group", err)
	}

	apiGroup := group.ToAPI()
	return &apiGroup, nil
}

// Create creates a new group
func (s *groupsService) Create(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, req *api.GroupCreationRequest) (*api.Group, error) {
	err := s.validateGroupRequest(ctx, tenantId, campId, req.Spec.SessionId, req.Spec.HousingRoomId, nil)
	if err != nil {
		return nil, pkgerrors.BadRequest(err.Error(), err)
	}

	domainGroup := domain.Group{
		TenantID:      tenantId,
		CampID:        campId,
		Name:          req.Meta.Name,
		Description:   utils.PtrToString(req.Meta.Description),
		SessionID:     req.Spec.SessionId,
		HousingRoomID: req.Spec.HousingRoomId,
	}

	domainGroup.GroupCampers = []domain.GroupCamper{}
	if req.Spec.CamperIds != nil {
		for _, camperId := range *req.Spec.CamperIds {
			domainGroup.GroupCampers = append(domainGroup.GroupCampers, domain.GroupCamper{CamperID: camperId, GroupID: domainGroup.ID})
		}
	}
	domainGroup.GroupStaffMembers = []domain.GroupStaffMember{}
	if req.Spec.StaffIds != nil {
		for _, staffMemberId := range *req.Spec.StaffIds {
			domainGroup.GroupStaffMembers = append(domainGroup.GroupStaffMembers, domain.GroupStaffMember{StaffMemberID: staffMemberId, GroupID: domainGroup.ID})
		}
	}
	domainGroup.ChildGroups = []domain.GroupGroup{}
	if req.Spec.GroupIds != nil {
		for _, groupId := range *req.Spec.GroupIds {
			domainGroup.ChildGroups = append(domainGroup.ChildGroups, domain.GroupGroup{ChildGroupID: groupId, ParentGroupID: domainGroup.ID})
		}
	}

	// Save to database
	if err := s.repo.Create(ctx, &domainGroup); err != nil {
		return nil, pkgerrors.InternalServerError(fmt.Sprintf("Failed to create group: %s", err.Error()), err)
	}

	apiGroup := domainGroup.ToAPI()
	return &apiGroup, nil
}

// Update updates an existing group
func (s *groupsService) Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, req *api.GroupUpdateRequest) (*api.Group, error) {
	err := s.validateGroupRequest(ctx, tenantId, campId, req.Spec.SessionId, req.Spec.HousingRoomId, &id)
	if err != nil {
		return nil, pkgerrors.BadRequest(err.Error(), err)
	}

	existingGroup, err := s.repo.GetByID(ctx, tenantId, campId, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Group not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get group", err)
	}

	// Update fields
	existingGroup.Name = req.Meta.Name
	existingGroup.Description = utils.PtrToString(req.Meta.Description)
	existingGroup.SessionID = req.Spec.SessionId
	existingGroup.HousingRoomID = req.Spec.HousingRoomId
	existingGroup.GroupCampers = []domain.GroupCamper{}
	if req.Spec.CamperIds != nil {
		for _, camperId := range *req.Spec.CamperIds {
			existingGroup.GroupCampers = append(existingGroup.GroupCampers, domain.GroupCamper{CamperID: camperId, GroupID: existingGroup.ID})
		}
	}
	existingGroup.GroupStaffMembers = []domain.GroupStaffMember{}
	if req.Spec.StaffIds != nil {
		for _, staffMemberId := range *req.Spec.StaffIds {
			existingGroup.GroupStaffMembers = append(existingGroup.GroupStaffMembers, domain.GroupStaffMember{StaffMemberID: staffMemberId, GroupID: existingGroup.ID})
		}
	}
	existingGroup.ChildGroups = []domain.GroupGroup{}
	if req.Spec.GroupIds != nil {
		for _, groupId := range *req.Spec.GroupIds {
			existingGroup.ChildGroups = append(existingGroup.ChildGroups, domain.GroupGroup{ChildGroupID: groupId, ParentGroupID: existingGroup.ID})
		}
	}
	// Save updates
	if err := s.repo.Update(ctx, tenantId, campId, id, existingGroup); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update group", err)
	}

	apiGroup := existingGroup.ToAPI()
	return &apiGroup, nil
}

// Delete deletes a group by ID
func (s *groupsService) Delete(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) error {
	// Check if group exists and belongs to tenant/camp
	_, err := s.repo.GetByID(ctx, tenantId, campId, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Group not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get group", err)
	}

	if err := s.repo.Delete(ctx, tenantId, campId, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete group", err)
	}

	return nil
}

func (s *groupsService) validateGroupRequest(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, sessionId *uuid.UUID, housingRoomId *uuid.UUID, excludeGroupId *uuid.UUID) error {
	if housingRoomId != nil && sessionId == nil {
		return fmt.Errorf("group with housing room must have a session ID")
	}

	if sessionId != nil {
		_, err := s.sessionsRepo.GetByID(ctx, tenantId, campId, *sessionId)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("session with id '%s' not found", sessionId.String())
			}
			return fmt.Errorf("failed to check session existence: %w", err)
		}
	}

	if housingRoomId != nil {
		_, err := s.housingRoomsRepo.GetByID(ctx, tenantId, campId, *housingRoomId)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("housing room with id '%s' not found", housingRoomId.String())
			}
			return fmt.Errorf("failed to check housing room existence: %w", err)
		}

		if sessionId != nil {
			existingGroup, err := s.repo.FindByHousingRoomAndSession(ctx, tenantId, campId, *housingRoomId, *sessionId)
			if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("failed to check housing room uniqueness: %w", err)
			}

			if existingGroup != nil {
				if excludeGroupId == nil || *excludeGroupId != existingGroup.ID {
					return fmt.Errorf("housing room '%s' is already assigned to another group in session '%s'", housingRoomId.String(), sessionId.String())
				}
			}
		}
	}

	return nil
}
