package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"gorm.io/gorm"
)

// ProgramsRepository handles database operations for programs
type ProgramsRepository struct {
	db *database.Database
}

// NewProgramsRepository creates a new programs repository
func NewProgramsRepository(db *database.Database) *ProgramsRepository {
	return &ProgramsRepository{db: db}
}

// programFields defines the filterable fields and their types for programs (API field names)
var programFields = map[string]domain.FieldType{
	"name": domain.FieldTypeText,
}

// programFieldToColumn maps API field names to database column names
var programFieldToColumn = map[string]string{
	"name": "name",
}

// programSortableFields defines the sortable fields for programs (API field names)
var programSortableFields = []string{"name"}

// List retrieves a paginated list of programs filtered by tenant and camp
func (r *ProgramsRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.Program, int64, error) {
	var programs []domain.Program
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

	query, err = ApplyFilters(query, filters, programFields, programFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply filters: %w", err)
	}

	// Get total count
	if err := query.Model(&domain.Program{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count programs: %w", err)
	}

	// Apply sorting
	query, err = ApplySorting(query, sortBy, sortOrder, programSortableFields, programFieldToColumn)
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
		Find(&programs).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list programs: %w", err)
	}

	// Load relationships for each program
	for i := range programs {
		if err := r.loadRelationships(ctx, &programs[i]); err != nil {
			return nil, 0, fmt.Errorf("failed to load relationships: %w", err)
		}
	}

	return programs, total, nil
}

// GetByID retrieves a single program by ID with tenant and camp validation
func (r *ProgramsRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Program, error) {
	var program domain.Program

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		First(&program).Error

	if err != nil {
		return nil, err
	}

	// Load relationships
	if err := r.loadRelationships(ctx, &program); err != nil {
		return nil, fmt.Errorf("failed to load relationships: %w", err)
	}

	return &program, nil
}

// Create inserts a new program with its relationships
func (r *ProgramsRepository) Create(ctx context.Context, program *domain.Program) error {
	// Start a transaction
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Create the program
		if err := tx.Create(program).Error; err != nil {
			return fmt.Errorf("failed to create program: %w", err)
		}

		// Create junction table entries
		if err := r.syncRelationships(tx, program); err != nil {
			return err
		}

		return nil
	})
}

// Update updates an existing program with tenant and camp validation
func (r *ProgramsRepository) Update(ctx context.Context, tenantID, campID uuid.UUID, program *domain.Program) error {
	// Start a transaction
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Update the program
		result := ScopedTxQuery(tx, tenantID, campID).
			Model(&domain.Program{}).
			Where("id = ?", program.ID).
			Updates(map[string]interface{}{
				"name":        program.Name,
				"description": program.Description,
				"color_id":    program.ColorID,
			})

		if result.Error != nil {
			return fmt.Errorf("failed to update program: %w", result.Error)
		}

		if result.RowsAffected == 0 {
			return fmt.Errorf("program not found or unauthorized")
		}

		// Sync junction table entries
		if err := r.syncRelationships(tx, program); err != nil {
			return err
		}

		return nil
	})
}

// Delete soft deletes a program by ID with tenant and camp validation
func (r *ProgramsRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		Delete(&domain.Program{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete program: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("program not found or unauthorized")
	}

	return nil
}

// loadRelationships loads the many-to-many relationships for a program
func (r *ProgramsRepository) loadRelationships(ctx context.Context, program *domain.Program) error {
	// Load activity IDs
	var activityIDs []uuid.UUID
	if err := r.db.WithContext(ctx).
		Table("activities").
		Where("program_id = ? AND deleted_at IS NULL", program.ID).
		Pluck("id", &activityIDs).Error; err != nil {
		return fmt.Errorf("failed to load activity IDs: %w", err)
	}
	program.ActivityIDs = activityIDs

	// Load location IDs
	var locationIDs []uuid.UUID
	if err := r.db.WithContext(ctx).
		Table("program_locations").
		Where("program_id = ?", program.ID).
		Pluck("location_id", &locationIDs).Error; err != nil {
		return fmt.Errorf("failed to load location IDs: %w", err)
	}
	program.LocationIDs = locationIDs

	// Load staff group IDs
	var staffGroupIDs []uuid.UUID
	if err := r.db.WithContext(ctx).
		Table("program_staff_groups").
		Where("program_id = ?", program.ID).
		Pluck("group_id", &staffGroupIDs).Error; err != nil {
		return fmt.Errorf("failed to load staff group IDs: %w", err)
	}
	program.StaffGroupIDs = staffGroupIDs

	return nil
}

// syncRelationships synchronizes the junction table entries for a program
func (r *ProgramsRepository) syncRelationships(tx *gorm.DB, program *domain.Program) error {
	// Sync program_locations
	if err := tx.Exec("DELETE FROM program_locations WHERE program_id = ?", program.ID).Error; err != nil {
		return fmt.Errorf("failed to delete old program_locations: %w", err)
	}
	for _, locationID := range program.LocationIDs {
		if err := tx.Exec(
			"INSERT INTO program_locations (program_id, location_id, created_at) VALUES (?, ?, NOW())",
			program.ID, locationID,
		).Error; err != nil {
			return fmt.Errorf("failed to insert program_location: %w", err)
		}
	}

	// Sync program_staff_groups
	if err := tx.Exec("DELETE FROM program_staff_groups WHERE program_id = ?", program.ID).Error; err != nil {
		return fmt.Errorf("failed to delete old program_staff_groups: %w", err)
	}
	for _, groupID := range program.StaffGroupIDs {
		if err := tx.Exec(
			"INSERT INTO program_staff_groups (program_id, group_id, created_at) VALUES (?, ?, NOW())",
			program.ID, groupID,
		).Error; err != nil {
			return fmt.Errorf("failed to insert program_staff_group: %w", err)
		}
	}

	return nil
}
