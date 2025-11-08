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

// StaffMembersService defines the interface for staff member business logic
type StaffMembersService interface {
	// List retrieves staff members with pagination and optional search
	List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit int, offset int, search *string) (*api.StaffMembersListResponse, error)

	// GetByID retrieves a single staff member by ID
	GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.StaffMember, error)

	// Create creates a new staff member
	Create(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, req *api.StaffMemberCreationRequest) (*api.StaffMember, error)

	// Update updates an existing staff member
	Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, req *api.StaffMemberUpdateRequest) (*api.StaffMember, error)

	// Delete deletes a staff member by ID
	Delete(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) error
}

// staffMembersService implements StaffMembersService
type staffMembersService struct {
	repo StaffMembersRepository
}

// NewStaffMembersService creates a new staff members service
func NewStaffMembersService(repo StaffMembersRepository) StaffMembersService {
	return &staffMembersService{
		repo: repo,
	}
}

// List retrieves staff members with pagination and optional search
func (s *staffMembersService) List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit int, offset int, search *string) (*api.StaffMembersListResponse, error) {
	staffMembers, total, err := s.repo.List(ctx, tenantId, campId, limit, offset, search)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to list staff members", err)
	}

	// Convert domain staff members to API staff members
	apiStaffMembers := make([]api.StaffMember, len(staffMembers))
	for i, staffMember := range staffMembers {
		apiStaffMembers[i] = staffMember.ToAPI()
	}

	return &api.StaffMembersListResponse{
		Items:  apiStaffMembers,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single staff member by ID
func (s *staffMembersService) GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.StaffMember, error) {
	staffMember, err := s.repo.GetByID(ctx, tenantId, campId, id)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get staff member", err)
	}

	// Convert domain staff member to API staff member
	apiStaffMember := staffMember.ToAPI()
	return &apiStaffMember, nil
}

// Create creates a new staff member
func (s *staffMembersService) Create(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, req *api.StaffMemberCreationRequest) (*api.StaffMember, error) {
	domainStaffMember := domain.StaffMember{
		TenantID:       tenantId,
		CampID:         campId,
		Name:           req.Meta.Name,
		Description:    utils.PtrToString(req.Meta.Description),
		Birthday:       req.Spec.Birthday.Time,
		Gender:         string(req.Spec.Gender),
		RoleID:         req.Spec.RoleId,
		Phone:          utils.PtrToString(req.Spec.Phone),
		HousingGroupID: req.Spec.HousingGroupId,
	}
	domainStaffMember.GroupStaffMembers = []domain.GroupStaffMember{}
	if req.Spec.GroupIds != nil {
		for _, groupId := range *req.Spec.GroupIds {
			domainStaffMember.GroupStaffMembers = append(domainStaffMember.GroupStaffMembers, domain.GroupStaffMember{GroupID: groupId, StaffMemberID: domainStaffMember.ID})
		}
	}
	domainStaffMember.StaffCertifications = []domain.StaffCertification{}
	if req.Spec.CertificationIds != nil {
		for _, certificationId := range *req.Spec.CertificationIds {
			domainStaffMember.StaffCertifications = append(domainStaffMember.StaffCertifications, domain.StaffCertification{CertificationID: certificationId, StaffMemberID: domainStaffMember.ID})
		}
	}

	if err := s.repo.Create(ctx, tenantId, campId, &domainStaffMember); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create staff member", err)
	}

	// Convert domain staff member to API staff member
	apiStaffMember := domainStaffMember.ToAPI()
	return &apiStaffMember, nil
}

// Update updates an existing staff member
func (s *staffMembersService) Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, req *api.StaffMemberUpdateRequest) (*api.StaffMember, error) {
	domainStaffMember, err := s.repo.GetByID(ctx, tenantId, campId, id)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get staff member", err)
	}
	domainStaffMember.Name = req.Meta.Name
	domainStaffMember.Description = utils.PtrToString(req.Meta.Description)
	domainStaffMember.Birthday = req.Spec.Birthday.Time
	domainStaffMember.Gender = string(req.Spec.Gender)
	domainStaffMember.RoleID = req.Spec.RoleId
	domainStaffMember.Phone = utils.PtrToString(req.Spec.Phone)
	domainStaffMember.HousingGroupID = req.Spec.HousingGroupId
	domainStaffMember.GroupStaffMembers = []domain.GroupStaffMember{}
	if req.Spec.GroupIds != nil {
		for _, groupId := range *req.Spec.GroupIds {
			domainStaffMember.GroupStaffMembers = append(domainStaffMember.GroupStaffMembers, domain.GroupStaffMember{GroupID: groupId, StaffMemberID: domainStaffMember.ID})
		}
	}
	domainStaffMember.StaffCertifications = []domain.StaffCertification{}
	if req.Spec.CertificationIds != nil {
		for _, certificationId := range *req.Spec.CertificationIds {
			domainStaffMember.StaffCertifications = append(domainStaffMember.StaffCertifications, domain.StaffCertification{CertificationID: certificationId, StaffMemberID: domainStaffMember.ID})
		}
	}
	if err := s.repo.Update(ctx, tenantId, campId, id, domainStaffMember); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update staff member", err)
	}

	// Convert domain staff member to API staff member
	apiStaffMember := domainStaffMember.ToAPI()
	return &apiStaffMember, nil
}

// Delete deletes a staff member by ID
func (s *staffMembersService) Delete(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) error {
	_, err := s.repo.GetByID(ctx, tenantId, campId, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Staff member not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get staff member", err)
	}

	if err := s.repo.Delete(ctx, tenantId, campId, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete staff member", err)
	}
	return nil
}
