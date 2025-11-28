package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// TimeBlocksRepository handles database operations for time blocks
type TimeBlocksRepository struct {
	db *database.Database
}

// NewTimeBlocksRepository creates a new time blocks repository
func NewTimeBlocksRepository(db *database.Database) *TimeBlocksRepository {
	return &TimeBlocksRepository{db: db}
}

// timeBlockFields defines the filterable fields and their types for time blocks (API field names)
var timeBlockFields = map[string]domain.FieldType{
	"name":      domain.FieldTypeText,
	"startTime": domain.FieldTypeDate,
	"endTime":   domain.FieldTypeDate,
}

// timeBlockFieldToColumn maps API field names to database column names
var timeBlockFieldToColumn = map[string]string{
	"name":      "name",
	"startTime": "start_time",
	"endTime":   "end_time",
}

// timeBlockSortableFields defines the sortable fields for time blocks (API field names)
var timeBlockSortableFields = []string{"name", "startTime", "endTime"}

// List retrieves a paginated list of time blocks filtered by tenant and camp
func (r *TimeBlocksRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.TimeBlock, int64, error) {
	var timeBlocks []domain.TimeBlock
	var total int64

	// Build the base query with tenant and camp filtering
	query := ScopedQuery(r.db, ctx, tenantID, campID)

	// Add search filter if provided
	query = ApplySearchFilter(query, search, "name")

	// Parse and apply filters
	filters, err := ParseFilterStrings(filterStrings)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to parse filters: %w", err)
	}

	query, err = ApplyFilters(query, filters, timeBlockFields, timeBlockFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply filters: %w", err)
	}

	// Get total count
	if err := query.Model(&domain.TimeBlock{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count time blocks: %w", err)
	}

	// Apply sorting
	query, err = ApplySorting(query, sortBy, sortOrder, timeBlockSortableFields, timeBlockFieldToColumn)
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
		Find(&timeBlocks).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list time blocks: %w", err)
	}

	return timeBlocks, total, nil
}

// GetByID retrieves a single time block by ID with tenant and camp validation
func (r *TimeBlocksRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.TimeBlock, error) {
	var timeBlock domain.TimeBlock

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		First(&timeBlock).Error

	if err != nil {
		return nil, err
	}

	return &timeBlock, nil
}

// Create inserts a new time block
func (r *TimeBlocksRepository) Create(ctx context.Context, timeBlock *domain.TimeBlock) error {
	if err := r.db.WithContext(ctx).Create(timeBlock).Error; err != nil {
		return fmt.Errorf("failed to create time block: %w", err)
	}
	return nil
}

// Update updates an existing time block with tenant and camp validation
func (r *TimeBlocksRepository) Update(ctx context.Context, tenantID, campID uuid.UUID, timeBlock *domain.TimeBlock) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Model(&domain.TimeBlock{}).
		Where("id = ?", timeBlock.ID).
		Updates(map[string]interface{}{
			"name":         timeBlock.Name,
			"description":  timeBlock.Description,
			"start_time":   timeBlock.StartTime,
			"end_time":     timeBlock.EndTime,
			"days_of_week": timeBlock.DaysOfWeek,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to update time block: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("time block not found or unauthorized")
	}

	return nil
}

// Delete soft deletes a time block by ID with tenant and camp validation
func (r *TimeBlocksRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		Delete(&domain.TimeBlock{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete time block: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("time block not found or unauthorized")
	}

	return nil
}
