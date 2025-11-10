package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// CertificationsRepository handles database operations for certifications
type CertificationsRepository struct {
	db *database.Database
}

// NewCertificationsRepository creates a new certifications repository
func NewCertificationsRepository(db *database.Database) *CertificationsRepository {
	return &CertificationsRepository{db: db}
}

// certificationFields defines the filterable fields and their types for certifications (API field names)
var certificationFields = map[string]domain.FieldType{
	"name": domain.FieldTypeText,
}

// certificationFieldToColumn maps API field names to database column names
var certificationFieldToColumn = map[string]string{
	"name": "name",
}

// certificationSortableFields defines the sortable fields for certifications (API field names)
var certificationSortableFields = []string{"name"}

// List retrieves a paginated list of certifications
func (r *CertificationsRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.Certification, int64, error) {
	// TODO: Implement query with pagination and search
	var certifications []domain.Certification
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

	query, err = ApplyFilters(query, filters, certificationFields, certificationFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply filters: %w", err)
	}

	// Get total count
	if err := query.Model(&domain.Certification{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count certifications: %w", err)
	}

	// Apply sorting
	query, err = ApplySorting(query, sortBy, sortOrder, certificationSortableFields, certificationFieldToColumn)
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
		Find(&certifications).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list certifications: %w", err)
	}

	return certifications, total, nil
}

// GetByID retrieves a single certification by ID with tenant and camp validation
func (r *CertificationsRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Certification, error) {
	var certification domain.Certification

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		First(&certification).Error

	if err != nil {
		return nil, err
	}

	return &certification, nil
}

// Create inserts a new certification
func (r *CertificationsRepository) Create(ctx context.Context, certification *domain.Certification) error {
	if err := r.db.WithContext(ctx).Create(certification).Error; err != nil {
		return fmt.Errorf("failed to create certification: %w", err)
	}
	return nil
}

// Update updates an existing certification with tenant and camp validation
func (r *CertificationsRepository) Update(ctx context.Context, tenantID, campID uuid.UUID, certification *domain.Certification) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Model(&domain.Certification{}).
		Where("id = ?", certification.ID).
		Updates(map[string]interface{}{
			"name":        certification.Name,
			"description": certification.Description,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to update certification: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("certification not found or unauthorized")
	}

	return nil
}

// Delete soft deletes a certification by ID with tenant and camp validation
func (r *CertificationsRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		Delete(&domain.Certification{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete certification: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("certification not found or unauthorized")
	}

	return nil
}
