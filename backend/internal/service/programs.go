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

// ProgramsService defines the interface for program business logic
type ProgramsService interface {
	// List retrieves programs with pagination and optional search
	List(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.ProgramsListResponse, error)

	// GetByID retrieves a single program by ID
	GetByID(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID) (*api.Program, error)

	// Create creates a new program
	Create(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, req *api.ProgramCreationRequest) (*api.Program, error)

	// Update updates an existing program
	Update(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID, req *api.ProgramUpdateRequest) (*api.Program, error)

	// Delete deletes a program by ID
	Delete(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID) error
}

// programsService implements ProgramsService
type programsService struct {
	repo         ProgramsRepository
	colorsRepo   ColorsRepository
	locationsRepo LocationsRepository
	groupsRepo   GroupsRepository
	activitiesRepo ActivitiesRepository
}

// NewProgramsService creates a new programs service
func NewProgramsService(repo ProgramsRepository, colorsRepo ColorsRepository, locationsRepo LocationsRepository, groupsRepo GroupsRepository, activitiesRepo ActivitiesRepository) ProgramsService {
	return &programsService{
		repo:          repo,
		colorsRepo:    colorsRepo,
		locationsRepo: locationsRepo,
		groupsRepo:    groupsRepo,
		activitiesRepo: activitiesRepo,
	}
}

// List retrieves programs with pagination and optional search
func (s *programsService) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.ProgramsListResponse, error) {
	programs, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search, filterStrings, sortBy, sortOrder)
	if err != nil {
		return nil, pkgerrors.BadRequest("Failed to list programs", err)
	}

	// Convert domain programs to API programs
	apiPrograms := make([]api.Program, len(programs))
	for i, program := range programs {
		apiPrograms[i] = program.ToAPI()
	}

	return &api.ProgramsListResponse{
		Items:  apiPrograms,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single program by ID
func (s *programsService) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Program, error) {
	program, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Program not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get program", err)
	}

	apiProgram := program.ToAPI()
	return &apiProgram, nil
}

// Create creates a new program
func (s *programsService) Create(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, req *api.ProgramCreationRequest) (*api.Program, error) {
	// Validate colorId exists if provided
	if req.Spec.ColorId != nil {
		if _, err := s.colorsRepo.GetByID(ctx, tenantID, campID, *req.Spec.ColorId); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.BadRequest("Color not found", err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate color", err)
		}
	}

	// Prepare location IDs
	locationIDs := []uuid.UUID{}
	if req.Spec.LocationIds != nil {
		locationIDs = *req.Spec.LocationIds
		// Validate all locationIds exist
		for _, locationID := range locationIDs {
			if _, err := s.locationsRepo.GetByID(ctx, tenantID, campID, locationID); err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, pkgerrors.BadRequest(fmt.Sprintf("Location %s not found", locationID), err)
				}
				return nil, pkgerrors.InternalServerError("Failed to validate location", err)
			}
		}
	}

	// Prepare staff group IDs
	staffGroupIDs := []uuid.UUID{}
	if req.Spec.StaffGroupIds != nil {
		staffGroupIDs = *req.Spec.StaffGroupIds
		// Validate all staffGroupIds exist
		for _, groupID := range staffGroupIDs {
			if _, err := s.groupsRepo.GetByID(ctx, tenantID, campID, groupID); err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, pkgerrors.BadRequest(fmt.Sprintf("Group %s not found", groupID), err)
				}
				return nil, pkgerrors.InternalServerError("Failed to validate group", err)
			}
		}
	}

	// Activity IDs will be empty on creation (activities reference programs, not vice versa)
	activityIDs := []uuid.UUID{}
	if req.Spec.ActivityIds != nil {
		activityIDs = *req.Spec.ActivityIds
		// Note: We don't validate activity IDs on create since activities must be created after the program
	}

	// Create domain program from request
	program := &domain.Program{
		TenantID:      tenantID,
		CampID:        campID,
		Name:          req.Meta.Name,
		Description:   utils.PtrToString(req.Meta.Description),
		ColorID:       req.Spec.ColorId,
		ActivityIDs:   activityIDs,
		StaffGroupIDs: staffGroupIDs,
		LocationIDs:   locationIDs,
	}

	// Save to database
	if err := s.repo.Create(ctx, program); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create program", err)
	}

	apiProgram := program.ToAPI()
	return &apiProgram, nil
}

// Update updates an existing program
func (s *programsService) Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.ProgramUpdateRequest) (*api.Program, error) {
	// Check if program exists and belongs to tenant/camp
	existingProgram, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Program not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get program", err)
	}

	// Validate colorId exists if provided
	if req.Spec.ColorId != nil {
		if _, err := s.colorsRepo.GetByID(ctx, tenantID, campID, *req.Spec.ColorId); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.BadRequest("Color not found", err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate color", err)
		}
	}

	// Prepare location IDs
	locationIDs := []uuid.UUID{}
	if req.Spec.LocationIds != nil {
		locationIDs = *req.Spec.LocationIds
		// Validate all locationIds exist
		for _, locationID := range locationIDs {
			if _, err := s.locationsRepo.GetByID(ctx, tenantID, campID, locationID); err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, pkgerrors.BadRequest(fmt.Sprintf("Location %s not found", locationID), err)
				}
				return nil, pkgerrors.InternalServerError("Failed to validate location", err)
			}
		}
	}

	// Prepare staff group IDs
	staffGroupIDs := []uuid.UUID{}
	if req.Spec.StaffGroupIds != nil {
		staffGroupIDs = *req.Spec.StaffGroupIds
		// Validate all staffGroupIds exist
		for _, groupID := range staffGroupIDs {
			if _, err := s.groupsRepo.GetByID(ctx, tenantID, campID, groupID); err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, pkgerrors.BadRequest(fmt.Sprintf("Group %s not found", groupID), err)
				}
				return nil, pkgerrors.InternalServerError("Failed to validate group", err)
			}
		}
	}

	// Activity IDs are read-only (managed through activities themselves)
	activityIDs := existingProgram.ActivityIDs
	if req.Spec.ActivityIds != nil {
		activityIDs = *req.Spec.ActivityIds
		// Note: We allow updating activity IDs but they should be read-only in practice
	}

	// Update fields
	existingProgram.Name = req.Meta.Name
	existingProgram.Description = utils.PtrToString(req.Meta.Description)
	existingProgram.ColorID = req.Spec.ColorId
	existingProgram.LocationIDs = locationIDs
	existingProgram.StaffGroupIDs = staffGroupIDs
	existingProgram.ActivityIDs = activityIDs

	// Save updates
	if err := s.repo.Update(ctx, tenantID, campID, existingProgram); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update program", err)
	}

	// Fetch updated program to get latest timestamps
	updatedProgram, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated program", err)
	}

	apiProgram := updatedProgram.ToAPI()
	return &apiProgram, nil
}

// Delete deletes a program by ID (CASCADE will auto-delete related activities)
func (s *programsService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	// Check if program exists
	_, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Program not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get program", err)
	}

	// Delete the program (CASCADE will delete associated activities)
	if err := s.repo.Delete(ctx, tenantID, campID, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete program", err)
	}

	return nil
}
