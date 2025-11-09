package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// AreasRepository handles database operations for areas
type AreasRepository struct {
	db *database.Database
}

// NewAreasRepository creates a new areas repository
func NewAreasRepository(db *database.Database) *AreasRepository {
	return &AreasRepository{db: db}
}

// List retrieves a paginated list of areas filtered by tenant and camp
func (r *AreasRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) ([]domain.Area, int64, error) {
	var areas []domain.Area
	var total int64

	// Build the base query with tenant and camp filtering
	query := ScopedQuery(r.db, ctx, tenantID, campID)

	// Add search filter if provided
	query = ApplySearchFilter(query, search, "name")

	// Get total count
	if err := query.Model(&domain.Area{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count areas: %w", err)
	}

	// Get paginated results
	if err := query.
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&areas).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list areas: %w", err)
	}

	return areas, total, nil
}

// GetByID retrieves a single area by ID with tenant and camp validation
func (r *AreasRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Area, error) {
	var area domain.Area

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		First(&area).Error

	if err != nil {
		return nil, err
	}

	return &area, nil
}

// Create inserts a new area
func (r *AreasRepository) Create(ctx context.Context, area *domain.Area) error {
	if err := r.db.WithContext(ctx).Create(area).Error; err != nil {
		return fmt.Errorf("failed to create area: %w", err)
	}
	return nil
}

// Update updates an existing area with tenant and camp validation
func (r *AreasRepository) Update(ctx context.Context, tenantID, campID uuid.UUID, area *domain.Area) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Model(&domain.Area{}).
		Where("id = ?", area.ID).
		Updates(map[string]interface{}{
			"name":        area.Name,
			"description": area.Description,
			"capacity":    area.Capacity,
			"equipment":   area.Equipment,
			"notes":       area.Notes,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to update area: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("area not found or unauthorized")
	}

	return nil
}

// Delete soft deletes an area by ID with tenant and camp validation
func (r *AreasRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		Delete(&domain.Area{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete area: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("area not found or unauthorized")
	}

	return nil
}
