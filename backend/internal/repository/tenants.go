package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"gorm.io/gorm"
)

// TenantsRepository handles database operations for tenants
type TenantsRepository struct {
	db *database.Database
}

// NewTenantsRepository creates a new tenants repository
func NewTenantsRepository(db *database.Database) *TenantsRepository {
	return &TenantsRepository{
		db: db,
	}
}

// List returns a paginated list of tenants
func (r *TenantsRepository) List(ctx context.Context, limit, offset int) ([]domain.Tenant, int64, error) {
	// TODO: Implement
	return nil, 0, nil
}

// GetByID returns a single tenant by ID
func (r *TenantsRepository) GetByID(ctx context.Context, tenantID uuid.UUID) (*domain.Tenant, error) {
	var tenant domain.Tenant
	err := r.db.DB.WithContext(ctx).Where("id = ?", tenantID).First(&tenant).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("tenant not found")
		}
		return nil, fmt.Errorf("failed to find tenant by ID: %w", err)
	}

	return &tenant, nil
}

// GetBySlug returns a tenant by slug
func (r *TenantsRepository) GetBySlug(ctx context.Context, slug string) (*domain.Tenant, error) {
	var tenant domain.Tenant
	err := r.db.DB.WithContext(ctx).Where("slug = ?", slug).First(&tenant).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("tenant not found")
		}
		return nil, fmt.Errorf("failed to find tenant by slug: %w", err)
	}

	return &tenant, nil
}

// Create creates a new tenant
func (r *TenantsRepository) Create(ctx context.Context, tenant *domain.Tenant) error {
	err := r.db.DB.WithContext(ctx).Create(tenant).Error
	if err != nil {
		return fmt.Errorf("failed to create tenant: %w", err)
	}
	return nil
}

// Update updates an existing tenant
func (r *TenantsRepository) Update(ctx context.Context, tenant *domain.Tenant) error {
	err := r.db.DB.WithContext(ctx).Save(tenant).Error
	if err != nil {
		return fmt.Errorf("failed to update tenant: %w", err)
	}
	return nil
}

// Delete soft deletes a tenant
func (r *TenantsRepository) Delete(ctx context.Context, tenantID uuid.UUID) error {
	err := r.db.DB.WithContext(ctx).Delete(&domain.Tenant{}, "id = ?", tenantID).Error
	if err != nil {
		return fmt.Errorf("failed to delete tenant: %w", err)
	}
	return nil
}
