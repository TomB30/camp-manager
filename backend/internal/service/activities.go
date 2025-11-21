package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	pkgerrors "github.com/tbechar/camp-manager-backend/pkg/errors"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// ActivitiesService defines the interface for activity business logic
type ActivitiesService interface {
	// List retrieves activities with pagination and optional search
	List(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.ActivitiesListResponse, error)

	// GetByID retrieves a single activity by ID
	GetByID(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID) (*api.Activity, error)

	// Create creates a new activity
	Create(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, req *api.ActivityCreationRequest) (*api.Activity, error)

	// Update updates an existing activity
	Update(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID, req *api.ActivityUpdateRequest) (*api.Activity, error)

	// Delete deletes an activity by ID
	Delete(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID) error
}

// activitiesService implements ActivitiesService
type activitiesService struct {
	repo               ActivitiesRepository
	programsRepo       ProgramsRepository
	locationsRepo      LocationsRepository
	timeBlocksRepo     TimeBlocksRepository
	certificationsRepo CertificationsRepository
}

// NewActivitiesService creates a new activities service
func NewActivitiesService(repo ActivitiesRepository, programsRepo ProgramsRepository, locationsRepo LocationsRepository, timeBlocksRepo TimeBlocksRepository, certificationsRepo CertificationsRepository) ActivitiesService {
	return &activitiesService{
		repo:               repo,
		programsRepo:       programsRepo,
		locationsRepo:      locationsRepo,
		timeBlocksRepo:     timeBlocksRepo,
		certificationsRepo: certificationsRepo,
	}
}

// List retrieves activities with pagination and optional search
func (s *activitiesService) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.ActivitiesListResponse, error) {
	activities, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search, filterStrings, sortBy, sortOrder)
	if err != nil {
		return nil, pkgerrors.BadRequest("Failed to list activities", err)
	}

	// Convert domain activities to API activities
	apiActivities := make([]api.Activity, len(activities))
	for i, activity := range activities {
		apiActivities[i] = activity.ToAPI()
	}

	return &api.ActivitiesListResponse{
		Items:  apiActivities,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single activity by ID
func (s *activitiesService) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Activity, error) {
	activity, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Activity not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get activity", err)
	}

	apiActivity := activity.ToAPI()
	return &apiActivity, nil
}

// Create creates a new activity
func (s *activitiesService) Create(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, req *api.ActivityCreationRequest) (*api.Activity, error) {
	// Validate timing options are mutually exclusive
	timingOptionsCount := 0
	if req.Spec.Duration != nil {
		timingOptionsCount++
	}
	if req.Spec.FixedTime != nil {
		timingOptionsCount++
	}
	if req.Spec.TimeBlockId != nil {
		timingOptionsCount++
	}
	if timingOptionsCount > 1 {
		return nil, pkgerrors.BadRequest("Only one of duration, fixedTime, or timeBlockId can be specified", nil)
	}

	// Validate programId exists (required)
	if _, err := s.programsRepo.GetByID(ctx, tenantID, campID, req.Spec.ProgramId); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.BadRequest("Program not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to validate program", err)
	}

	// Validate defaultLocationId exists if provided
	if req.Spec.DefaultLocationId != nil {
		if _, err := s.locationsRepo.GetByID(ctx, tenantID, campID, *req.Spec.DefaultLocationId); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.BadRequest("Default location not found", err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate location", err)
		}
	}

	// Validate timeBlockId exists if provided
	if req.Spec.TimeBlockId != nil {
		if _, err := s.timeBlocksRepo.GetByID(ctx, tenantID, campID, *req.Spec.TimeBlockId); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.BadRequest("Time block not found", err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate time block", err)
		}
	}

	// Validate certifications in requiredStaff if provided
	if req.Spec.RequiredStaff != nil {
		for _, staff := range *req.Spec.RequiredStaff {
			if staff.RequiredCertificationId != nil {
				if _, err := s.certificationsRepo.GetByID(ctx, tenantID, campID, *staff.RequiredCertificationId); err != nil {
					if errors.Is(err, gorm.ErrRecordNotFound) {
						return nil, pkgerrors.BadRequest(fmt.Sprintf("Certification %s not found", *staff.RequiredCertificationId), err)
					}
					return nil, pkgerrors.InternalServerError("Failed to validate certification", err)
				}
			}
		}
	}

	// Validate activity IDs in activityConflicts if provided
	if req.Spec.ActivityConflicts != nil {
		allActivityIDs := []uuid.UUID{}
		if req.Spec.ActivityConflicts.PreActivityConflicts != nil {
			allActivityIDs = append(allActivityIDs, *req.Spec.ActivityConflicts.PreActivityConflicts...)
		}
		if req.Spec.ActivityConflicts.PostActivityConflicts != nil {
			allActivityIDs = append(allActivityIDs, *req.Spec.ActivityConflicts.PostActivityConflicts...)
		}
		if req.Spec.ActivityConflicts.ConcurrentActivityConflicts != nil {
			allActivityIDs = append(allActivityIDs, *req.Spec.ActivityConflicts.ConcurrentActivityConflicts...)
		}

		for _, activityID := range allActivityIDs {
			if _, err := s.repo.GetByID(ctx, tenantID, campID, activityID); err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, pkgerrors.BadRequest(fmt.Sprintf("Activity %s in conflicts not found", activityID), err)
				}
				return nil, pkgerrors.InternalServerError("Failed to validate conflict activity", err)
			}
		}
	}

	// Serialize JSONB fields
	var fixedTimeJSON json.RawMessage
	if req.Spec.FixedTime != nil {
		var err error
		fixedTimeJSON, err = json.Marshal(req.Spec.FixedTime)
		if err != nil {
			return nil, pkgerrors.BadRequest("Invalid fixedTime format", err)
		}
	}

	var requiredStaffJSON json.RawMessage
	if req.Spec.RequiredStaff != nil {
		var err error
		requiredStaffJSON, err = json.Marshal(req.Spec.RequiredStaff)
		if err != nil {
			return nil, pkgerrors.BadRequest("Invalid requiredStaff format", err)
		}
	}

	var activityConflictsJSON json.RawMessage
	if req.Spec.ActivityConflicts != nil {
		var err error
		activityConflictsJSON, err = json.Marshal(req.Spec.ActivityConflicts)
		if err != nil {
			return nil, pkgerrors.BadRequest("Invalid activityConflicts format", err)
		}
	}

	// Create domain activity from request
	activity := &domain.Activity{
		TenantID:          tenantID,
		CampID:            campID,
		Name:              req.Meta.Name,
		Description:       utils.PtrToString(req.Meta.Description),
		ProgramID:         req.Spec.ProgramId,
		DefaultLocationID: req.Spec.DefaultLocationId,
		Duration:          req.Spec.Duration,
		FixedTime:         fixedTimeJSON,
		TimeBlockID:       req.Spec.TimeBlockId,
		RequiredStaff:     requiredStaffJSON,
		ActivityConflicts: activityConflictsJSON,
	}

	// Save to database
	if err := s.repo.Create(ctx, activity); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create activity", err)
	}

	apiActivity := activity.ToAPI()
	return &apiActivity, nil
}

// Update updates an existing activity
func (s *activitiesService) Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.ActivityUpdateRequest) (*api.Activity, error) {
	// Check if activity exists and belongs to tenant/camp
	existingActivity, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Activity not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get activity", err)
	}

	// Validate timing options are mutually exclusive
	timingOptionsCount := 0
	if req.Spec.Duration != nil {
		timingOptionsCount++
	}
	if req.Spec.FixedTime != nil {
		timingOptionsCount++
	}
	if req.Spec.TimeBlockId != nil {
		timingOptionsCount++
	}
	if timingOptionsCount > 1 {
		return nil, pkgerrors.BadRequest("Only one of duration, fixedTime, or timeBlockId can be specified", nil)
	}

	// Validate programId exists (required)
	if _, err := s.programsRepo.GetByID(ctx, tenantID, campID, req.Spec.ProgramId); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.BadRequest("Program not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to validate program", err)
	}

	// Validate defaultLocationId exists if provided
	if req.Spec.DefaultLocationId != nil {
		if _, err := s.locationsRepo.GetByID(ctx, tenantID, campID, *req.Spec.DefaultLocationId); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.BadRequest("Default location not found", err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate location", err)
		}
	}

	// Validate timeBlockId exists if provided
	if req.Spec.TimeBlockId != nil {
		if _, err := s.timeBlocksRepo.GetByID(ctx, tenantID, campID, *req.Spec.TimeBlockId); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, pkgerrors.BadRequest("Time block not found", err)
			}
			return nil, pkgerrors.InternalServerError("Failed to validate time block", err)
		}
	}

	// Validate certifications in requiredStaff if provided
	if req.Spec.RequiredStaff != nil {
		for _, staff := range *req.Spec.RequiredStaff {
			if staff.RequiredCertificationId != nil {
				if _, err := s.certificationsRepo.GetByID(ctx, tenantID, campID, *staff.RequiredCertificationId); err != nil {
					if errors.Is(err, gorm.ErrRecordNotFound) {
						return nil, pkgerrors.BadRequest(fmt.Sprintf("Certification %s not found", *staff.RequiredCertificationId), err)
					}
					return nil, pkgerrors.InternalServerError("Failed to validate certification", err)
				}
			}
		}
	}

	// Validate activity IDs in activityConflicts if provided
	if req.Spec.ActivityConflicts != nil {
		allActivityIDs := []uuid.UUID{}
		if req.Spec.ActivityConflicts.PreActivityConflicts != nil {
			allActivityIDs = append(allActivityIDs, *req.Spec.ActivityConflicts.PreActivityConflicts...)
		}
		if req.Spec.ActivityConflicts.PostActivityConflicts != nil {
			allActivityIDs = append(allActivityIDs, *req.Spec.ActivityConflicts.PostActivityConflicts...)
		}
		if req.Spec.ActivityConflicts.ConcurrentActivityConflicts != nil {
			allActivityIDs = append(allActivityIDs, *req.Spec.ActivityConflicts.ConcurrentActivityConflicts...)
		}

		for _, activityID := range allActivityIDs {
			// Skip self-reference
			if activityID == id {
				continue
			}
			if _, err := s.repo.GetByID(ctx, tenantID, campID, activityID); err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, pkgerrors.BadRequest(fmt.Sprintf("Activity %s in conflicts not found", activityID), err)
				}
				return nil, pkgerrors.InternalServerError("Failed to validate conflict activity", err)
			}
		}
	}

	// Serialize JSONB fields
	var fixedTimeJSON json.RawMessage
	if req.Spec.FixedTime != nil {
		var err error
		fixedTimeJSON, err = json.Marshal(req.Spec.FixedTime)
		if err != nil {
			return nil, pkgerrors.BadRequest("Invalid fixedTime format", err)
		}
	}

	var requiredStaffJSON json.RawMessage
	if req.Spec.RequiredStaff != nil {
		var err error
		requiredStaffJSON, err = json.Marshal(req.Spec.RequiredStaff)
		if err != nil {
			return nil, pkgerrors.BadRequest("Invalid requiredStaff format", err)
		}
	}

	var activityConflictsJSON json.RawMessage
	if req.Spec.ActivityConflicts != nil {
		var err error
		activityConflictsJSON, err = json.Marshal(req.Spec.ActivityConflicts)
		if err != nil {
			return nil, pkgerrors.BadRequest("Invalid activityConflicts format", err)
		}
	}

	// Update fields
	existingActivity.Name = req.Meta.Name
	existingActivity.Description = utils.PtrToString(req.Meta.Description)
	existingActivity.ProgramID = req.Spec.ProgramId
	existingActivity.DefaultLocationID = req.Spec.DefaultLocationId
	existingActivity.Duration = req.Spec.Duration
	existingActivity.FixedTime = fixedTimeJSON
	existingActivity.TimeBlockID = req.Spec.TimeBlockId
	existingActivity.RequiredStaff = requiredStaffJSON
	existingActivity.ActivityConflicts = activityConflictsJSON

	// Save updates
	if err := s.repo.Update(ctx, tenantID, campID, existingActivity); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update activity", err)
	}

	// Fetch updated activity to get latest timestamps
	updatedActivity, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated activity", err)
	}

	apiActivity := updatedActivity.ToAPI()
	return &apiActivity, nil
}

// Delete deletes an activity by ID
func (s *activitiesService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	// Check if activity exists
	_, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Activity not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get activity", err)
	}

	// Delete the activity
	if err := s.repo.Delete(ctx, tenantID, campID, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete activity", err)
	}

	return nil
}
