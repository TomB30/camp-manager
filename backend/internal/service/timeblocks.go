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

// TimeBlocksService defines the interface for time block business logic
type TimeBlocksService interface {
	// List retrieves time blocks with pagination and optional search
	List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.TimeBlocksListResponse, error)

	// GetByID retrieves a single time block by ID
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.TimeBlock, error)

	// Create creates a new time block
	Create(ctx context.Context, tenantID, campID uuid.UUID, req *api.TimeBlockCreationRequest) (*api.TimeBlock, error)

	// Update updates an existing time block
	Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.TimeBlockUpdateRequest) (*api.TimeBlock, error)

	// Delete deletes a time block by ID
	Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error
}

// timeBlocksService implements TimeBlocksService
type timeBlocksService struct {
	repo TimeBlocksRepository
}

// NewTimeBlocksService creates a new time blocks service
func NewTimeBlocksService(repo TimeBlocksRepository) TimeBlocksService {
	return &timeBlocksService{
		repo: repo,
	}
}

// List retrieves time blocks with pagination and optional search
func (s *timeBlocksService) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.TimeBlocksListResponse, error) {
	timeBlocks, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search, filterStrings, sortBy, sortOrder)
	if err != nil {
		return nil, pkgerrors.BadRequest("Failed to list time blocks", err)
	}

	// Convert domain time blocks to API time blocks
	apiTimeBlocks := make([]api.TimeBlock, len(timeBlocks))
	for i, timeBlock := range timeBlocks {
		apiTimeBlocks[i] = timeBlock.ToAPI()
	}

	// Calculate next offset
	var next *int
	if offset+limit < int(total) {
		nextOffset := offset + limit
		next = &nextOffset
	}

	return &api.TimeBlocksListResponse{
		Items:  apiTimeBlocks,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
		Next:   next,
	}, nil
}

// GetByID retrieves a single time block by ID
func (s *timeBlocksService) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.TimeBlock, error) {
	timeBlock, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Time block not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get time block", err)
	}

	apiTimeBlock := timeBlock.ToAPI()
	return &apiTimeBlock, nil
}

// Create creates a new time block
func (s *timeBlocksService) Create(ctx context.Context, tenantID, campID uuid.UUID, req *api.TimeBlockCreationRequest) (*api.TimeBlock, error) {
	// Convert days of week from API to domain
	var daysOfWeek domain.DaysOfWeek
	if req.Spec.DaysOfWeek != nil {
		daysOfWeek = make([]string, len(*req.Spec.DaysOfWeek))
		for i, day := range *req.Spec.DaysOfWeek {
			daysOfWeek[i] = string(day)
		}
	}

	// Create domain time block from request
	timeBlock := &domain.TimeBlock{
		TenantID:    tenantID,
		CampID:      campID,
		Name:        req.Meta.Name,
		Description: utils.PtrToString(req.Meta.Description),
		StartTime:   req.Spec.StartTime,
		EndTime:     req.Spec.EndTime,
		DaysOfWeek:  daysOfWeek,
	}

	// Save to database
	if err := s.repo.Create(ctx, timeBlock); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create time block", err)
	}

	apiTimeBlock := timeBlock.ToAPI()
	return &apiTimeBlock, nil
}

// Update updates an existing time block
func (s *timeBlocksService) Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.TimeBlockUpdateRequest) (*api.TimeBlock, error) {
	// Check if time block exists and belongs to tenant/camp
	existingTimeBlock, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Time block not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get time block", err)
	}

	// Convert days of week from API to domain
	var daysOfWeek domain.DaysOfWeek
	if req.Spec.DaysOfWeek != nil {
		daysOfWeek = make([]string, len(*req.Spec.DaysOfWeek))
		for i, day := range *req.Spec.DaysOfWeek {
			daysOfWeek[i] = string(day)
		}
	}

	// Update fields
	existingTimeBlock.Name = req.Meta.Name
	existingTimeBlock.Description = utils.PtrToString(req.Meta.Description)
	existingTimeBlock.StartTime = req.Spec.StartTime
	existingTimeBlock.EndTime = req.Spec.EndTime
	existingTimeBlock.DaysOfWeek = daysOfWeek

	// Save updates
	if err := s.repo.Update(ctx, tenantID, campID, existingTimeBlock); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update time block", err)
	}

	// Fetch updated time block to get latest timestamps
	updatedTimeBlock, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated time block", err)
	}

	apiTimeBlock := updatedTimeBlock.ToAPI()
	return &apiTimeBlock, nil
}

// Delete deletes a time block by ID
func (s *timeBlocksService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	// Check if time block exists
	_, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Time block not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get time block", err)
	}

	// Delete the time block
	if err := s.repo.Delete(ctx, tenantID, campID, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete time block", err)
	}

	return nil
}

