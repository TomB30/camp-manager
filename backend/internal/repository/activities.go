package repository

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// ActivitiesRepository handles database operations for activities
type ActivitiesRepository struct {
	db *database.Database
}

// NewActivitiesRepository creates a new activities repository
func NewActivitiesRepository(db *database.Database) *ActivitiesRepository {
	return &ActivitiesRepository{db: db}
}

// activityFields defines the filterable fields and their types for activities (API field names)
var activityFields = map[string]domain.FieldType{
	"name": domain.FieldTypeText,
}

// activityFieldToColumn maps API field names to database column names
var activityFieldToColumn = map[string]string{
	"name": "name",
}

// activitySortableFields defines the sortable fields for activities (API field names)
var activitySortableFields = []string{"name"}

// List retrieves a paginated list of activities filtered by tenant and camp
func (r *ActivitiesRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.Activity, int64, error) {
	var activities []domain.Activity
	var total int64

	// Build the base query with tenant and camp filtering
	query := ScopedQuery(r.db, ctx, tenantID, campID)

	// Add search filter if provided
	query = ApplySearchFilter(query, search, "name", "description")

	// Parse and apply filters
	filters, err := ParseFilterStrings(filterStrings)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to parse filters: %w", err)
	}

	query, err = ApplyFilters(query, filters, activityFields, activityFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply filters: %w", err)
	}

	// Get total count
	if err := query.Model(&domain.Activity{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count activities: %w", err)
	}

	// Apply sorting
	query, err = ApplySorting(query, sortBy, sortOrder, activitySortableFields, activityFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply sorting: %w", err)
	}

	// If no sorting was specified, use default
	if sortBy == nil || *sortBy == "" {
		query = query.Order("created_at DESC")
	}

	// Get paginated results
	if err := query.
		Limit(limit).
		Offset(offset).
		Find(&activities).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list activities: %w", err)
	}

	return activities, total, nil
}

// GetByID retrieves a single activity by ID with tenant and camp validation
func (r *ActivitiesRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Activity, error) {
	var activity domain.Activity

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		First(&activity).Error

	if err != nil {
		return nil, err
	}

	return &activity, nil
}

// Create inserts a new activity
func (r *ActivitiesRepository) Create(ctx context.Context, activity *domain.Activity) error {
	// Serialize JSONB fields if needed
	if err := r.validateAndSerializeJSONB(activity); err != nil {
		return fmt.Errorf("failed to validate/serialize JSONB fields: %w", err)
	}

	if err := r.db.WithContext(ctx).Create(activity).Error; err != nil {
		return fmt.Errorf("failed to create activity: %w", err)
	}
	return nil
}

// Update updates an existing activity with tenant and camp validation
func (r *ActivitiesRepository) Update(ctx context.Context, tenantID, campID uuid.UUID, activity *domain.Activity) error {
	// Serialize JSONB fields if needed
	if err := r.validateAndSerializeJSONB(activity); err != nil {
		return fmt.Errorf("failed to validate/serialize JSONB fields: %w", err)
	}

	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Model(&domain.Activity{}).
		Where("id = ?", activity.ID).
		Updates(map[string]interface{}{
			"name":                  activity.Name,
			"description":           activity.Description,
			"program_id":            activity.ProgramID,
			"default_location_id":   activity.DefaultLocationID,
			"duration":              activity.Duration,
			"fixed_time":            activity.FixedTime,
			"time_block_id":         activity.TimeBlockID,
			"required_staff":        activity.RequiredStaff,
			"activity_conflicts":    activity.ActivityConflicts,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to update activity: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("activity not found or unauthorized")
	}

	return nil
}

// Delete soft deletes an activity by ID with tenant and camp validation
func (r *ActivitiesRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		Delete(&domain.Activity{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete activity: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("activity not found or unauthorized")
	}

	return nil
}

// validateAndSerializeJSONB validates and ensures JSONB fields are properly serialized
func (r *ActivitiesRepository) validateAndSerializeJSONB(activity *domain.Activity) error {
	// Ensure empty slices/objects are properly serialized as null or empty JSON
	if len(activity.FixedTime) == 0 {
		activity.FixedTime = nil
	}
	if len(activity.RequiredStaff) == 0 {
		activity.RequiredStaff = nil
	}
	if len(activity.ActivityConflicts) == 0 {
		activity.ActivityConflicts = nil
	}

	// Validate that JSONB fields are valid JSON
	if len(activity.FixedTime) > 0 {
		if !json.Valid(activity.FixedTime) {
			return fmt.Errorf("invalid JSON in fixedTime field")
		}
	}
	if len(activity.RequiredStaff) > 0 {
		if !json.Valid(activity.RequiredStaff) {
			return fmt.Errorf("invalid JSON in requiredStaff field")
		}
	}
	if len(activity.ActivityConflicts) > 0 {
		if !json.Valid(activity.ActivityConflicts) {
			return fmt.Errorf("invalid JSON in activityConflicts field")
		}
	}

	return nil
}
