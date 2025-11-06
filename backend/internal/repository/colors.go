package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// ColorsRepository handles database operations for colors
type ColorsRepository struct {
	db *database.Database
}

// NewColorsRepository creates a new colors repository
func NewColorsRepository(db *database.Database) *ColorsRepository {
	return &ColorsRepository{db: db}
}

// List retrieves a paginated list of colors filtered by tenant and camp
func (r *ColorsRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) ([]domain.Color, int64, error) {
	var colors []domain.Color
	var total int64

	// Build the base query with tenant and camp filtering
	query := ScopedQuery(r.db, ctx, tenantID, campID)

	// Add search filter if provided
	if search != nil && *search != "" {
		searchPattern := fmt.Sprintf("%%%s%%", *search)
		query = query.Where("name ILIKE ?", searchPattern)
	}

	// Get total count
	if err := query.Model(&domain.Color{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count colors: %w", err)
	}

	// Get paginated results
	if err := query.
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&colors).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list colors: %w", err)
	}

	return colors, total, nil
}

// GetByID retrieves a single color by ID with tenant and camp validation
func (r *ColorsRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Color, error) {
	var color domain.Color

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		First(&color).Error

	if err != nil {
		return nil, err
	}

	return &color, nil
}

// Create inserts a new color
func (r *ColorsRepository) Create(ctx context.Context, color *domain.Color) error {
	if err := r.db.WithContext(ctx).Create(color).Error; err != nil {
		return fmt.Errorf("failed to create color: %w", err)
	}
	return nil
}

// Update updates an existing color with tenant and camp validation
func (r *ColorsRepository) Update(ctx context.Context, tenantID, campID uuid.UUID, color *domain.Color) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Model(&domain.Color{}).
		Where("id = ?", color.ID).
		Updates(map[string]interface{}{
			"name":        color.Name,
			"description": color.Description,
			"hex_value":   color.HexValue,
			"default":     color.Default,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to update color: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("color not found or unauthorized")
	}

	return nil
}

// Delete soft deletes a color by ID with tenant and camp validation
func (r *ColorsRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		Delete(&domain.Color{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete color: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("color not found or unauthorized")
	}

	return nil
}
