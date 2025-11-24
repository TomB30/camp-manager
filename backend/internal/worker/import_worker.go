package worker

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"github.com/tbechar/camp-manager-backend/pkg/csvimport"
)

// ImportJobsRepository interface for import jobs persistence
type ImportJobsRepository interface {
	GetPendingJobs(ctx context.Context) ([]domain.ImportJob, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status domain.ImportJobStatus) error
	UpdateProgress(ctx context.Context, id uuid.UUID, processedRows, successCount, errorCount int) error
	UpdateValidationErrors(ctx context.Context, id uuid.UUID, errors domain.ValidationErrors) error
	SetTotalRows(ctx context.Context, id uuid.UUID, totalRows int) error
}

// CampersService interface for creating campers
type CampersService interface {
	Create(ctx context.Context, tenantId, campId uuid.UUID, req *api.CamperCreationRequest) (*api.Camper, error)
}


// ImportWorker processes import jobs asynchronously
type ImportWorker struct {
	repo       ImportJobsRepository
	validators map[domain.ImportEntityType]csvimport.EntityValidator
	mappers    map[domain.ImportEntityType]csvimport.EntityMapper
	// Entity-specific services
	campersService CampersService
	// Worker configuration
	pollInterval time.Duration
	batchSize    int
	stopChan     chan bool
}

// ImportWorkerConfig holds configuration for the import worker
type ImportWorkerConfig struct {
	PollInterval time.Duration // How often to poll for new jobs
	BatchSize    int           // How many rows to process per transaction
}

// NewImportWorker creates a new import worker
func NewImportWorker(
	repo ImportJobsRepository,
	validators map[domain.ImportEntityType]csvimport.EntityValidator,
	mappers map[domain.ImportEntityType]csvimport.EntityMapper,
	campersService CampersService,
	config ImportWorkerConfig,
) *ImportWorker {
	if config.PollInterval == 0 {
		config.PollInterval = 10 * time.Second
	}
	if config.BatchSize == 0 {
		config.BatchSize = 100
	}

	return &ImportWorker{
		repo:           repo,
		validators:     validators,
		mappers:        mappers,
		campersService: campersService,
		pollInterval:   config.PollInterval,
		batchSize:      config.BatchSize,
		stopChan:       make(chan bool),
	}
}

// Start begins the worker's polling loop
func (w *ImportWorker) Start(ctx context.Context) {
	log.Println("Import worker started")

	ticker := time.NewTicker(w.pollInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Import worker stopped (context done)")
			return
		case <-w.stopChan:
			log.Println("Import worker stopped (stop signal)")
			return
		case <-ticker.C:
			w.processJobs(ctx)
		}
	}
}

// Stop signals the worker to stop
func (w *ImportWorker) Stop() {
	close(w.stopChan)
}

// processJobs fetches and processes all pending jobs
func (w *ImportWorker) processJobs(ctx context.Context) {
	jobs, err := w.repo.GetPendingJobs(ctx)
	if err != nil {
		log.Printf("Failed to fetch pending jobs: %v", err)
		return
	}

	for _, job := range jobs {
		if err := w.processJob(ctx, &job); err != nil {
			log.Printf("Failed to process job %s: %v", job.ID, err)
			// Update job status to failed
			w.repo.UpdateStatus(ctx, job.ID, domain.ImportJobStatusFailed)
		}
	}
}

// processJob processes a single import job
func (w *ImportWorker) processJob(ctx context.Context, job *domain.ImportJob) error {
	log.Printf("Processing import job %s for entity type %s", job.ID, job.EntityType)

	entityType := domain.ImportEntityType(job.EntityType)

	// Get validator and mapper
	validator, ok := w.validators[entityType]
	if !ok {
		return fmt.Errorf("no validator registered for entity type: %s", entityType)
	}
	mapper, ok := w.mappers[entityType]
	if !ok {
		return fmt.Errorf("no mapper registered for entity type: %s", entityType)
	}

	// Update status to validating
	if err := w.repo.UpdateStatus(ctx, job.ID, domain.ImportJobStatusValidating); err != nil {
		return fmt.Errorf("failed to update status to validating: %w", err)
	}

	// Open and parse CSV file
	file, err := os.Open(job.FilePath)
	if err != nil {
		return fmt.Errorf("failed to open CSV file: %w", err)
	}
	defer file.Close()

	rows, headers, err := csvimport.ParseCSV(file)
	if err != nil {
		validationErrors := domain.ValidationErrors{
			{Row: 0, Field: "file", Message: fmt.Sprintf("failed to parse CSV: %v", err)},
		}
		w.repo.UpdateValidationErrors(ctx, job.ID, validationErrors)
		w.repo.UpdateStatus(ctx, job.ID, domain.ImportJobStatusFailed)
		return fmt.Errorf("failed to parse CSV: %w", err)
	}

	// Set total rows
	if err := w.repo.SetTotalRows(ctx, job.ID, len(rows)); err != nil {
		return fmt.Errorf("failed to set total rows: %w", err)
	}

	// Validate all rows
	validationErrors := csvimport.ValidateCSV(ctx, rows, headers, validator, job.TenantID, job.CampID)
	if len(validationErrors) > 0 {
		w.repo.UpdateValidationErrors(ctx, job.ID, validationErrors)
		w.repo.UpdateStatus(ctx, job.ID, domain.ImportJobStatusFailed)
		return fmt.Errorf("validation failed with %d errors", len(validationErrors))
	}

	// Update status to validated
	if err := w.repo.UpdateStatus(ctx, job.ID, domain.ImportJobStatusValidated); err != nil {
		return fmt.Errorf("failed to update status to validated: %w", err)
	}

	// Update status to importing
	if err := w.repo.UpdateStatus(ctx, job.ID, domain.ImportJobStatusImporting); err != nil {
		return fmt.Errorf("failed to update status to importing: %w", err)
	}

	// Process rows
	successCount := 0
	errorCount := 0
	var importErrors domain.ValidationErrors

	for i, row := range rows {
		rowNumber := i + 2 // +2 for header and 1-based indexing

		// Map row to entity
		entity, err := mapper.MapRowToEntity(ctx, row, job.TenantID, job.CampID)
		if err != nil {
			errorCount++
			importErrors = append(importErrors, domain.ValidationError{
				Row:     rowNumber,
				Field:   "mapping",
				Message: fmt.Sprintf("failed to map row: %v", err),
			})
			continue
		}

		// Create entity using appropriate service
		if err := w.createEntity(ctx, job.TenantID, job.CampID, entityType, entity); err != nil {
			errorCount++
			importErrors = append(importErrors, domain.ValidationError{
				Row:     rowNumber,
				Field:   "creation",
				Message: fmt.Sprintf("failed to create entity: %v", err),
			})
			continue
		}

		successCount++

		// Update progress periodically
		if (i+1)%w.batchSize == 0 {
			w.repo.UpdateProgress(ctx, job.ID, i+1, successCount, errorCount)
		}
	}

	// Final progress update
	w.repo.UpdateProgress(ctx, job.ID, len(rows), successCount, errorCount)

	// Update validation errors if any occurred during import
	if len(importErrors) > 0 {
		w.repo.UpdateValidationErrors(ctx, job.ID, importErrors)
	}

	// Update final status
	if errorCount > 0 {
		w.repo.UpdateStatus(ctx, job.ID, domain.ImportJobStatusFailed)
	} else {
		w.repo.UpdateStatus(ctx, job.ID, domain.ImportJobStatusCompleted)
	}

	log.Printf("Completed import job %s: %d succeeded, %d failed", job.ID, successCount, errorCount)

	return nil
}

// createEntity creates an entity using the appropriate service
func (w *ImportWorker) createEntity(ctx context.Context, tenantID, campID uuid.UUID, entityType domain.ImportEntityType, entity interface{}) error {
	switch entityType {
	case domain.ImportEntityTypeCampers:
		req, ok := entity.(*api.CamperCreationRequest)
		if !ok {
			return fmt.Errorf("invalid entity type for camper")
		}
		_, err := w.campersService.Create(ctx, tenantID, campID, req)
		return err
	default:
		return fmt.Errorf("unsupported entity type: %s", entityType)
	}
}

