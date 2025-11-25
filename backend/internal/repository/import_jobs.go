package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"gorm.io/gorm"
)

// ImportJobsRepository handles database operations for import jobs
type ImportJobsRepository struct {
	db *database.Database
}

// NewImportJobsRepository creates a new import jobs repository
func NewImportJobsRepository(db *database.Database) *ImportJobsRepository {
	return &ImportJobsRepository{db: db}
}

// Create inserts a new import job
func (r *ImportJobsRepository) Create(ctx context.Context, job *domain.ImportJob) error {
	if err := r.db.WithContext(ctx).Create(job).Error; err != nil {
		return fmt.Errorf("failed to create import job: %w", err)
	}
	return nil
}

// GetByID retrieves a single import job by ID
func (r *ImportJobsRepository) GetByID(ctx context.Context, tenantID, id uuid.UUID) (*domain.ImportJob, error) {
	var job domain.ImportJob

	err := r.db.WithContext(ctx).
		Where("id = ? AND tenant_id = ?", id, tenantID).
		First(&job).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("import job not found")
		}
		return nil, fmt.Errorf("failed to get import job: %w", err)
	}

	return &job, nil
}

// List retrieves all import jobs for a camp
func (r *ImportJobsRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int) ([]domain.ImportJob, int64, error) {
	var jobs []domain.ImportJob
	var total int64

	query := r.db.WithContext(ctx).
		Where("tenant_id = ? AND camp_id = ?", tenantID, campID)

	// Get total count
	if err := query.Model(&domain.ImportJob{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count import jobs: %w", err)
	}

	// Get paginated results, ordered by created_at DESC
	if err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&jobs).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list import jobs: %w", err)
	}

	return jobs, total, nil
}

// UpdateStatus updates the status of an import job atomically
func (r *ImportJobsRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status domain.ImportJobStatus) error {
	result := r.db.WithContext(ctx).
		Model(&domain.ImportJob{}).
		Where("id = ?", id).
		Update("status", string(status))

	if result.Error != nil {
		return fmt.Errorf("failed to update import job status: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("import job not found")
	}

	return nil
}

// UpdateProgress updates the progress counters of an import job atomically
func (r *ImportJobsRepository) UpdateProgress(ctx context.Context, id uuid.UUID, processedRows, successCount, errorCount int) error {
	updates := map[string]interface{}{
		"processed_rows": processedRows,
		"success_count":  successCount,
		"error_count":    errorCount,
	}

	result := r.db.WithContext(ctx).
		Model(&domain.ImportJob{}).
		Where("id = ?", id).
		Updates(updates)

	if result.Error != nil {
		return fmt.Errorf("failed to update import job progress: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("import job not found")
	}

	return nil
}

// UpdateValidationErrors updates the validation errors for an import job
func (r *ImportJobsRepository) UpdateValidationErrors(ctx context.Context, id uuid.UUID, errors domain.ValidationErrors) error {
	result := r.db.WithContext(ctx).
		Model(&domain.ImportJob{}).
		Where("id = ?", id).
		Update("validation_errors", errors)

	if result.Error != nil {
		return fmt.Errorf("failed to update import job validation errors: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("import job not found")
	}

	return nil
}

// SetTotalRows sets the total number of rows to be processed
func (r *ImportJobsRepository) SetTotalRows(ctx context.Context, id uuid.UUID, totalRows int) error {
	result := r.db.WithContext(ctx).
		Model(&domain.ImportJob{}).
		Where("id = ?", id).
		Update("total_rows", totalRows)

	if result.Error != nil {
		return fmt.Errorf("failed to update import job total rows: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("import job not found")
	}

	return nil
}

// GetPendingJobs retrieves all pending import jobs (for worker polling)
func (r *ImportJobsRepository) GetPendingJobs(ctx context.Context) ([]domain.ImportJob, error) {
	var jobs []domain.ImportJob

	err := r.db.WithContext(ctx).
		Where("status = ?", string(domain.ImportJobStatusPending)).
		Order("created_at ASC").
		Find(&jobs).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get pending import jobs: %w", err)
	}

	return jobs, nil
}

// GetOldCompletedJobs retrieves import jobs that are completed and older than the retention period
func (r *ImportJobsRepository) GetOldCompletedJobs(ctx context.Context, olderThan time.Time) ([]domain.ImportJob, error) {
	var jobs []domain.ImportJob

	err := r.db.WithContext(ctx).
		Where("status = ? AND updated_at < ?", string(domain.ImportJobStatusCompleted), olderThan).
		Order("updated_at ASC").
		Find(&jobs).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get old completed import jobs: %w", err)
	}

	return jobs, nil
}

// GetOldFailedJobs retrieves import jobs that are failed and older than the retention period
func (r *ImportJobsRepository) GetOldFailedJobs(ctx context.Context, olderThan time.Time) ([]domain.ImportJob, error) {
	var jobs []domain.ImportJob

	err := r.db.WithContext(ctx).
		Where("status = ? AND updated_at < ?", string(domain.ImportJobStatusFailed), olderThan).
		Order("updated_at ASC").
		Find(&jobs).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get old failed import jobs: %w", err)
	}

	return jobs, nil
}

// Delete removes an import job from the database
func (r *ImportJobsRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).
		Where("id = ?", id).
		Delete(&domain.ImportJob{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete import job: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("import job not found")
	}

	return nil
}

