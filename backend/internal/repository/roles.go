package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// RolesRepository handles database operations for roles
type RolesRepository struct {
	db *database.Database
}

// NewRolesRepository creates a new roles repository
func NewRolesRepository(db *database.Database) *RolesRepository {
	return &RolesRepository{db: db}
}

// List retrieves a paginated list of roles filtered by tenant and camp
func (r *RolesRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) ([]domain.Role, int64, error) {
	var roles []domain.Role
	var total int64

	// Build the base query with tenant and camp filtering
	query := ScopedQuery(r.db, ctx, tenantID, campID)

	// Add search filter if provided
	if search != nil && *search != "" {
		searchPattern := fmt.Sprintf("%%%s%%", *search)
		query = query.Where("name ILIKE ?", searchPattern)
	}

	// Get total count
	if err := query.Model(&domain.Role{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count roles: %w", err)
	}

	// Get paginated results
	if err := query.
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&roles).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list roles: %w", err)
	}

	return roles, total, nil
}

// GetByID retrieves a single role by ID with tenant and camp validation
func (r *RolesRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Role, error) {
	var role domain.Role

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		First(&role).Error

	if err != nil {
		return nil, err
	}

	return &role, nil
}

// Create inserts a new role
func (r *RolesRepository) Create(ctx context.Context, role *domain.Role) error {
	if err := r.db.WithContext(ctx).Create(role).Error; err != nil {
		return fmt.Errorf("failed to create role: %w", err)
	}
	return nil
}

// Update updates an existing role with tenant and camp validation
func (r *RolesRepository) Update(ctx context.Context, tenantID, campID uuid.UUID, role *domain.Role) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Model(&domain.Role{}).
		Where("id = ?", role.ID).
		Updates(map[string]interface{}{
			"name":        role.Name,
			"description": role.Description,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to update role: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("role not found or unauthorized")
	}

	return nil
}

// Delete soft deletes a role by ID with tenant and camp validation
func (r *RolesRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		Delete(&domain.Role{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete role: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("role not found or unauthorized")
	}

	return nil
}
