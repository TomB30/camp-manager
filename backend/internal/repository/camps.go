package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// CampsRepository handles database operations for camps
type CampsRepository struct {
	db *database.Database
}

// NewCampsRepository creates a new camps repository
func NewCampsRepository(db *database.Database) *CampsRepository {
	return &CampsRepository{
		db: db,
	}
}

// campFields defines the filterable fields and their types for camps (API field names)
var campFields = map[string]domain.FieldType{
	"name": domain.FieldTypeText,
}

// campFieldToColumn maps API field names to database column names
var campFieldToColumn = map[string]string{
	"name": "name",
}

// campSortableFields defines the sortable fields for camps (API field names)
var campSortableFields = []string{"name"}

// List returns a paginated list of camps for a tenant, filtered by accessible camp IDs
// If campIDs is nil, returns all camps in the tenant (for system/tenant-scope users)
// If campIDs is not nil, returns only the specified camps (for camp-scope users)
func (r *CampsRepository) List(ctx context.Context, tenantID uuid.UUID, campIDs []uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.Camp, int64, error) {
	var camps []domain.Camp
	var total int64

	// Build base query
	query := r.db.DB.WithContext(ctx).Model(&domain.Camp{}).Where("tenant_id = ?", tenantID)

	// Apply camp ID filter for camp-scoped users
	if campIDs != nil {
		if len(campIDs) == 0 {
			// User has no camp access - return empty result
			return []domain.Camp{}, 0, nil
		}
		query = query.Where("id IN ?", campIDs)
	}

	// Apply search filter if provided
	query = ApplySearchFilter(query, search, "name")

	// Parse and apply filters
	filters, err := ParseFilterStrings(filterStrings)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to parse filters: %w", err)
	}

	query, err = ApplyFilters(query, filters, campFields, campFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply filters: %w", err)
	}

	// Apply sorting
	query, err = ApplySorting(query, sortBy, sortOrder, campSortableFields, campFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply sorting: %w", err)
	}

	// If no sorting was specified, use default
	if sortBy == nil || *sortBy == "" {
		query = query.Order("created_at DESC")
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	if err := query.Limit(limit).Offset(offset).Find(&camps).Error; err != nil {
		return nil, 0, err
	}

	return camps, total, nil
}

// GetByID returns a single camp by ID
func (r *CampsRepository) GetByID(ctx context.Context, tenantID, campID uuid.UUID) (*domain.Camp, error) {
	var camp domain.Camp

	if err := r.db.DB.WithContext(ctx).
		Where("id = ? AND tenant_id = ?", campID, tenantID).
		First(&camp).Error; err != nil {
		return nil, err
	}

	return &camp, nil
}

// Create creates a new camp
func (r *CampsRepository) Create(ctx context.Context, camp *domain.Camp) error {
	return r.db.DB.WithContext(ctx).Create(camp).Error
}

// Update updates an existing camp
func (r *CampsRepository) Update(ctx context.Context, camp *domain.Camp) error {
	return r.db.DB.WithContext(ctx).
		Model(&domain.Camp{}).
		Where("id = ? AND tenant_id = ?", camp.ID, camp.TenantID).
		Updates(camp).Error
}

// Delete soft deletes a camp
func (r *CampsRepository) Delete(ctx context.Context, tenantID, campID uuid.UUID) error {
	return r.db.DB.WithContext(ctx).
		Where("id = ? AND tenant_id = ?", campID, tenantID).
		Delete(&domain.Camp{}).Error
}
