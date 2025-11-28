package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// HousingRoomsRepository handles database operations for housing rooms
type HousingRoomsRepository struct {
	db *database.Database
}

// NewHousingRoomsRepository creates a new housing rooms repository
func NewHousingRoomsRepository(db *database.Database) *HousingRoomsRepository {
	return &HousingRoomsRepository{db: db}
}

// housingRoomFields defines the filterable fields and their types for housing rooms (API field names)
var housingRoomFields = map[string]domain.FieldType{
	"name":     domain.FieldTypeText,
	"beds":     domain.FieldTypeNumber,
	"areaId":   domain.FieldTypeUUID,
	"bathroom": domain.FieldTypeText,
}

// housingRoomFieldToColumn maps API field names to database column names
var housingRoomFieldToColumn = map[string]string{
	"name":     "name",
	"beds":     "beds",
	"areaId":   "area_id",
	"bathroom": "bathroom",
}

// housingRoomSortableFields defines the sortable fields for housing rooms (API field names)
var housingRoomSortableFields = []string{"name", "beds", "areaId", "bathroom"}

// List retrieves a paginated list of housing rooms filtered by tenant and camp
func (r *HousingRoomsRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.HousingRoom, int64, error) {
	var housingRooms []domain.HousingRoom
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

	query, err = ApplyFilters(query, filters, housingRoomFields, housingRoomFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply filters: %w", err)
	}

	// Get total count
	if err := query.Model(&domain.HousingRoom{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count housing rooms: %w", err)
	}

	// Apply sorting
	query, err = ApplySorting(query, sortBy, sortOrder, housingRoomSortableFields, housingRoomFieldToColumn)
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
		Find(&housingRooms).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list housing rooms: %w", err)
	}

	return housingRooms, total, nil
}

// GetByID retrieves a single housing room by ID with tenant and camp validation
func (r *HousingRoomsRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.HousingRoom, error) {
	var housingRoom domain.HousingRoom

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		First(&housingRoom).Error

	if err != nil {
		return nil, err
	}

	return &housingRoom, nil
}

// Create inserts a new housing room
func (r *HousingRoomsRepository) Create(ctx context.Context, room *domain.HousingRoom) error {
	if err := r.db.WithContext(ctx).Create(room).Error; err != nil {
		return fmt.Errorf("failed to create housing room: %w", err)
	}
	return nil
}

// Update updates an existing housing room with tenant and camp validation
func (r *HousingRoomsRepository) Update(ctx context.Context, tenantID, campID uuid.UUID, room *domain.HousingRoom) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Model(&domain.HousingRoom{}).
		Where("id = ?", room.ID).
		Updates(map[string]interface{}{
			"area_id":     room.AreaID,
			"name":        room.Name,
			"description": room.Description,
			"beds":        room.Beds,
			"bathroom":    room.Bathroom,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to update housing room: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("housing room not found or unauthorized")
	}

	return nil
}

// Delete soft deletes a housing room by ID with tenant and camp validation
func (r *HousingRoomsRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		Delete(&domain.HousingRoom{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete housing room: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("housing room not found or unauthorized")
	}

	return nil
}
