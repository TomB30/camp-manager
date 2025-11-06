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

// RolesService defines the interface for role business logic
type RolesService interface {
	// List retrieves roles with pagination and optional search
	List(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, limit, offset int, search *string) (*api.RolesListResponse, error)

	// GetByID retrieves a single role by ID
	GetByID(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID) (*api.Role, error)

	// Create creates a new role
	Create(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, req *api.RoleCreationRequest) (*api.Role, error)

	// Update updates an existing role
	Update(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID, req *api.RoleUpdateRequest) (*api.Role, error)

	// Delete deletes a role by ID
	Delete(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID) error
}

// rolesService implements RolesService
type rolesService struct {
	repo RolesRepository
}

// NewRolesService creates a new roles service
func NewRolesService(repo RolesRepository) RolesService {
	return &rolesService{
		repo: repo,
	}
}

// List retrieves roles with pagination and optional search
func (s *rolesService) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) (*api.RolesListResponse, error) {
	roles, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to list roles", err)
	}

	// Convert domain roles to API roles
	apiRoles := make([]api.Role, len(roles))
	for i, role := range roles {
		apiRoles[i] = role.ToAPI()
	}

	return &api.RolesListResponse{
		Items:  apiRoles,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single role by ID
func (s *rolesService) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Role, error) {
	role, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Role not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get role", err)
	}

	apiRole := role.ToAPI()
	return &apiRole, nil
}

// Create creates a new role
func (s *rolesService) Create(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, req *api.RoleCreationRequest) (*api.Role, error) {
	// Create domain role from request
	role := &domain.Role{
		TenantID:    tenantID,
		CampID:      campID,
		Name:        req.Meta.Name,
		Description: utils.PtrToString(req.Meta.Description),
	}

	// Save to database
	if err := s.repo.Create(ctx, role); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create role", err)
	}

	apiRole := role.ToAPI()
	return &apiRole, nil
}

// Update updates an existing role
func (s *rolesService) Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.RoleUpdateRequest) (*api.Role, error) {
	// Check if role exists and belongs to tenant/camp
	existingRole, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Role not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get role", err)
	}

	// Update fields
	existingRole.Name = req.Meta.Name
	existingRole.Description = utils.PtrToString(req.Meta.Description)

	// Save updates
	if err := s.repo.Update(ctx, tenantID, campID, existingRole); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update role", err)
	}

	// Fetch updated role to get latest timestamps
	updatedRole, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated role", err)
	}

	apiRole := updatedRole.ToAPI()
	return &apiRole, nil
}

// Delete deletes a role by ID
func (s *rolesService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	// Check if role exists
	_, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Role not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get role", err)
	}

	// Delete the role
	if err := s.repo.Delete(ctx, tenantID, campID, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete role", err)
	}

	return nil
}
