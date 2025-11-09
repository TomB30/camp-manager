package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// LocationsRepository handles database operations for locations
type LocationsRepository struct {
	db *database.Database
}

// NewLocationsRepository creates a new locations repository
func NewLocationsRepository(db *database.Database) *LocationsRepository {
	return &LocationsRepository{db: db}
}

// locationFields defines the filterable fields and their types for locations (API field names)
var locationFields = map[string]domain.FieldType{
	"name":   domain.FieldTypeText,
	"areaId": domain.FieldTypeUUID,
}

// locationFieldToColumn maps API field names to database column names
var locationFieldToColumn = map[string]string{
	"name":      "name",
	"areaId":    "area_id",
	"createdAt": "created_at",
}

// locationSortableFields defines the sortable fields for locations (API field names)
var locationSortableFields = []string{"name", "areaId", "createdAt"}

// List retrieves a paginated list of locations filtered by tenant and camp
func (r *LocationsRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.Location, int64, error) {
	var locations []domain.Location
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

	query, err = ApplyFilters(query, filters, locationFields, locationFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply filters: %w", err)
	}

	// Get total count
	if err := query.Model(&domain.Location{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count locations: %w", err)
	}

	// Apply sorting
	query, err = ApplySorting(query, sortBy, sortOrder, locationSortableFields, locationFieldToColumn)
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
		Find(&locations).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list locations: %w", err)
	}

	return locations, total, nil
}

// GetByID retrieves a single location by ID with tenant and camp validation
func (r *LocationsRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Location, error) {
	var location domain.Location

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		First(&location).Error

	if err != nil {
		return nil, err
	}

	return &location, nil
}

// Create inserts a new location
func (r *LocationsRepository) Create(ctx context.Context, location *domain.Location) error {
	if err := r.db.WithContext(ctx).Create(location).Error; err != nil {
		return fmt.Errorf("failed to create location: %w", err)
	}
	return nil
}

// Update updates an existing location with tenant and camp validation
func (r *LocationsRepository) Update(ctx context.Context, tenantID, campID uuid.UUID, location *domain.Location) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Model(&domain.Location{}).
		Where("id = ?", location.ID).
		Updates(map[string]interface{}{
			"area_id":     location.AreaID,
			"name":        location.Name,
			"description": location.Description,
			"capacity":    location.Capacity,
			"equipment":   location.Equipment,
			"notes":       location.Notes,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to update location: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("location not found or unauthorized")
	}

	return nil
}

// Delete soft deletes a location by ID with tenant and camp validation
func (r *LocationsRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		Delete(&domain.Location{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete location: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("location not found or unauthorized")
	}

	return nil
}
