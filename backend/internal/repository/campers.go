package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"gorm.io/gorm"
)

// CampersRepository handles database operations for campers
type CampersRepository struct {
	db *database.Database
}

// NewCampersRepository creates a new campers repository
func NewCampersRepository(db *database.Database) *CampersRepository {
	return &CampersRepository{db: db}
}

// camperFields defines the filterable fields and their types for campers (API field names)
var camperFields = map[string]domain.FieldType{
	"name":           domain.FieldTypeText,
	"birthday":       domain.FieldTypeDate,
	"gender":         domain.FieldTypeText,
	"sessionId":      domain.FieldTypeUUID,
	"housingGroupId": domain.FieldTypeUUID,
}

// camperFieldToColumn maps API field names to database column names
var camperFieldToColumn = map[string]string{
	"name":           "name",
	"birthday":       "birthday",
	"gender":         "gender",
	"sessionId":      "session_id",
	"housingGroupId": "housing_group_id",
}

// camperSortableFields defines the sortable fields for campers (API field names)
var camperSortableFields = []string{"name", "birthday", "gender", "sessionId", "housingGroupId"}

// List retrieves a paginated list of campers
func (r *CampersRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.Camper, int64, error) {
	var campers []domain.Camper
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

	query, err = ApplyFilters(query, filters, camperFields, camperFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply filters: %w", err)
	}

	// Get total count
	if err := query.Model(&domain.Camper{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count campers: %w", err)
	}

	// Apply sorting
	query, err = ApplySorting(query, sortBy, sortOrder, camperSortableFields, camperFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply sorting: %w", err)
	}

	// If no sorting was specified, use default
	if sortBy == nil || *sortBy == "" {
		query = query.Order("created_at DESC")
	}

	// Get paginated results with preloaded relationships
	if err := query.
		Preload("GroupCampers").
		Limit(limit).
		Offset(offset).
		Find(&campers).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list campers: %w", err)
	}

	return campers, total, nil
}

// GetByID retrieves a single camper by ID
func (r *CampersRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Camper, error) {
	var camper domain.Camper

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Preload("GroupCampers").
		Where("id = ?", id).
		First(&camper).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("camper not found")
		}
		return nil, fmt.Errorf("failed to get camper: %w", err)
	}

	return &camper, nil
}

// Create inserts a new camper
func (r *CampersRepository) Create(ctx context.Context, camper *domain.Camper) error {
	// Start a transaction
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {

		// Insert the camper
		if err := tx.Create(&camper).Error; err != nil {
			return fmt.Errorf("failed to create camper: %w", err)
		}

		// Sync group relationships
		if err := syncGroupCampers(tx, camper.ID, &camper.GroupCampers); err != nil {
			return err
		}

		return nil
	})
}

// Update updates an existing camper
func (r *CampersRepository) Update(ctx context.Context, tenantID, campID, id uuid.UUID, camper *domain.Camper) error {
	// Start a transaction
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Check if camper exists and belongs to tenant/camp
		var existing domain.Camper
		if err := tx.Where("id = ? AND tenant_id = ? AND camp_id = ?", id, tenantID, campID).
			First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return fmt.Errorf("camper not found or unauthorized")
			}
			return fmt.Errorf("failed to find camper: %w", err)
		}

		// Update the camper fields
		updates := map[string]interface{}{
			"name":             camper.Name,
			"birthday":         camper.Birthday,
			"gender":           camper.Gender,
			"session_id":       camper.SessionID,
			"housing_group_id": camper.HousingGroupID,
		}

		if camper.Description != "" {
			updates["description"] = camper.Description
		} else {
			updates["description"] = ""
		}

		result := tx.Model(&domain.Camper{}).
			Where("id = ? AND tenant_id = ? AND camp_id = ?", id, tenantID, campID).
			Updates(updates)

		if result.Error != nil {
			return fmt.Errorf("failed to update camper: %w", result.Error)
		}

		if result.RowsAffected == 0 {
			return fmt.Errorf("camper not found or unauthorized")
		}

		// Sync group relationships using delete-all-and-recreate strategy
		if err := syncGroupCampers(tx, id, &camper.GroupCampers); err != nil {
			return err
		}

		return nil
	})
}

// Delete soft deletes a camper by ID
func (r *CampersRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	// Start a transaction to handle soft delete and junction table cleanup
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// First, hard delete all junction table entries for this camper
		// (junction tables don't use soft delete)
		if err := tx.Where("camper_id = ?", id).Delete(&domain.GroupCamper{}).Error; err != nil {
			return fmt.Errorf("failed to delete group associations: %w", err)
		}

		// Then soft delete the camper using scoped query
		result := ScopedTxQuery(tx, tenantID, campID).
			Where("id = ?", id).
			Delete(&domain.Camper{})

		if result.Error != nil {
			return fmt.Errorf("failed to delete camper: %w", result.Error)
		}

		if result.RowsAffected == 0 {
			return fmt.Errorf("camper not found or unauthorized")
		}

		return nil
	})
}

// syncGroupCampers syncs the group_campers junction table using delete-all-and-recreate strategy
func syncGroupCampers(tx *gorm.DB, camperID uuid.UUID, groupIDs *[]domain.GroupCamper) error {
	// Delete all existing group associations
	if err := tx.Where("camper_id = ?", camperID).Delete(&domain.GroupCamper{}).Error; err != nil {
		return fmt.Errorf("failed to delete existing group associations: %w", err)
	}

	// Insert new associations if provided
	if groupIDs != nil && len(*groupIDs) > 0 {
		for _, groupCamper := range *groupIDs {
			groupCamper := domain.GroupCamper{
				GroupID:  groupCamper.GroupID,
				CamperID: groupCamper.CamperID,
			}
			if err := tx.Create(&groupCamper).Error; err != nil {
				return fmt.Errorf("failed to create group association: %w", err)
			}
		}
	}

	return nil
}
