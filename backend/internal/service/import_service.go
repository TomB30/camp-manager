package service

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	pkgerrors "github.com/tbechar/camp-manager-backend/pkg/errors"
	"github.com/tbechar/camp-manager-backend/pkg/csvimport"
)

// ImportJobsRepository interface for import jobs persistence
type ImportJobsRepository interface {
	Create(ctx context.Context, job *domain.ImportJob) error
	GetByID(ctx context.Context, tenantID, id uuid.UUID) (*domain.ImportJob, error)
	List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int) ([]domain.ImportJob, int64, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status domain.ImportJobStatus) error
	UpdateProgress(ctx context.Context, id uuid.UUID, processedRows, successCount, errorCount int) error
	UpdateValidationErrors(ctx context.Context, id uuid.UUID, errors domain.ValidationErrors) error
	SetTotalRows(ctx context.Context, id uuid.UUID, totalRows int) error
	GetPendingJobs(ctx context.Context) ([]domain.ImportJob, error)
}

// ImportService defines the interface for CSV import business logic
type ImportService interface {
	// StartImport initiates an async import job
	StartImport(ctx context.Context, tenantID, campID uuid.UUID, entityType domain.ImportEntityType, mode domain.ImportMode, file io.Reader, fileName string) (*domain.ImportJob, error)

	// GetImportStatus returns the status of an import job
	GetImportStatus(ctx context.Context, tenantID, jobID uuid.UUID) (*domain.ImportJob, error)

	// ValidateImport validates a CSV file without importing (dry-run)
	ValidateImport(ctx context.Context, tenantID, campID uuid.UUID, entityType domain.ImportEntityType, file io.Reader) (*domain.ImportJob, error)

	// ListImportJobs lists all import jobs for a camp
	ListImportJobs(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int) ([]domain.ImportJob, int64, error)
}

// importService implements ImportService
type importService struct {
	repo       ImportJobsRepository
	validators map[domain.ImportEntityType]csvimport.EntityValidator
	mappers    map[domain.ImportEntityType]csvimport.EntityMapper
	uploadDir  string
}

// ImportServiceConfig holds configuration for the import service
type ImportServiceConfig struct {
	UploadDir string // Directory to store uploaded CSV files
}

// NewImportService creates a new import service with registered validators and mappers
func NewImportService(
	repo ImportJobsRepository,
	config ImportServiceConfig,
	validators map[domain.ImportEntityType]csvimport.EntityValidator,
	mappers map[domain.ImportEntityType]csvimport.EntityMapper,
) ImportService {
	// Ensure upload directory exists
	if config.UploadDir == "" {
		config.UploadDir = "./uploads/imports"
	}
	os.MkdirAll(config.UploadDir, 0755)

	return &importService{
		repo:       repo,
		validators: validators,
		mappers:    mappers,
		uploadDir:  config.UploadDir,
	}
}

// ValidateImport validates a CSV file without importing (dry-run)
func (s *importService) ValidateImport(ctx context.Context, tenantID, campID uuid.UUID, entityType domain.ImportEntityType, file io.Reader) (*domain.ImportJob, error) {
	// Check if validator is registered
	validator, ok := s.validators[entityType]
	if !ok {
		return nil, pkgerrors.BadRequest(fmt.Sprintf("no validator registered for entity type: %s", entityType), nil)
	}

	// Parse CSV
	rows, headers, err := csvimport.ParseCSV(file)
	if err != nil {
		return nil, pkgerrors.BadRequest(fmt.Sprintf("failed to parse CSV: %v", err), err)
	}

	// Validate CSV
	validationErrors := csvimport.ValidateCSV(ctx, rows, headers, validator, tenantID, campID)

	// Create a validation result (not persisted)
	result := &domain.ImportJob{
		TenantID:         tenantID,
		CampID:           campID,
		EntityType:       string(entityType),
		Status:           string(domain.ImportJobStatusValidated),
		TotalRows:        len(rows),
		ValidationErrors: validationErrors,
	}

	if len(validationErrors) > 0 {
		result.Status = string(domain.ImportJobStatusFailed)
		result.ErrorCount = len(validationErrors)
	}

	return result, nil
}

// StartImport initiates an async import job
func (s *importService) StartImport(ctx context.Context, tenantID, campID uuid.UUID, entityType domain.ImportEntityType, mode domain.ImportMode, file io.Reader, fileName string) (*domain.ImportJob, error) {
	// Check if validator and mapper are registered
	if _, ok := s.validators[entityType]; !ok {
		return nil, pkgerrors.BadRequest(fmt.Sprintf("no validator registered for entity type: %s", entityType), nil)
	}
	if _, ok := s.mappers[entityType]; !ok {
		return nil, pkgerrors.BadRequest(fmt.Sprintf("no mapper registered for entity type: %s", entityType), nil)
	}

	// Save file to disk
	filePath, err := s.saveUploadedFile(file, tenantID, campID, entityType, fileName)
	if err != nil {
		return nil, pkgerrors.InternalServerError("failed to save uploaded file", err)
	}

	// Create import job
	job := &domain.ImportJob{
		TenantID:   tenantID,
		CampID:     campID,
		EntityType: string(entityType),
		Status:     string(domain.ImportJobStatusPending),
		Mode:       string(mode),
		FilePath:   filePath,
	}

	// Persist job
	if err := s.repo.Create(ctx, job); err != nil {
		// Clean up file if job creation fails
		os.Remove(filePath)
		return nil, pkgerrors.InternalServerError("failed to create import job", err)
	}

	return job, nil
}

// GetImportStatus returns the status of an import job
func (s *importService) GetImportStatus(ctx context.Context, tenantID, jobID uuid.UUID) (*domain.ImportJob, error) {
	job, err := s.repo.GetByID(ctx, tenantID, jobID)
	if err != nil {
		return nil, pkgerrors.NotFound("import job not found", err)
	}

	return job, nil
}

// ListImportJobs lists all import jobs for a camp
func (s *importService) ListImportJobs(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int) ([]domain.ImportJob, int64, error) {
	jobs, total, err := s.repo.List(ctx, tenantID, campID, limit, offset)
	if err != nil {
		return nil, 0, pkgerrors.InternalServerError("failed to list import jobs", err)
	}

	return jobs, total, nil
}

// saveUploadedFile saves the uploaded file to disk and returns the file path
func (s *importService) saveUploadedFile(file io.Reader, tenantID, campID uuid.UUID, entityType domain.ImportEntityType, fileName string) (string, error) {
	// Create subdirectory for tenant/camp
	dir := filepath.Join(s.uploadDir, tenantID.String(), campID.String())
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Generate unique file name
	uniqueFileName := fmt.Sprintf("%s_%s_%s", entityType, uuid.New().String(), filepath.Base(fileName))
	filePath := filepath.Join(dir, uniqueFileName)

	// Create file
	outFile, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer outFile.Close()

	// Copy data
	if _, err := io.Copy(outFile, file); err != nil {
		os.Remove(filePath)
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	return filePath, nil
}

