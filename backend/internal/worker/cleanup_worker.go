package worker

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// CleanupJobsRepository defines the repository interface for cleanup operations
type CleanupJobsRepository interface {
	GetOldCompletedJobs(ctx context.Context, olderThan time.Time) ([]domain.ImportJob, error)
	GetOldFailedJobs(ctx context.Context, olderThan time.Time) ([]domain.ImportJob, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

// CleanupWorker handles cleanup of old import files and job records
type CleanupWorker struct {
	repo                 CleanupJobsRepository
	pollInterval         time.Duration
	successRetentionDays int
	failedRetentionDays  int
	stopChan             chan bool
}

// CleanupWorkerConfig holds configuration for the cleanup worker
type CleanupWorkerConfig struct {
	PollInterval         time.Duration
	SuccessRetentionDays int
	FailedRetentionDays  int
}

// NewCleanupWorker creates a new cleanup worker
func NewCleanupWorker(
	repo CleanupJobsRepository,
	config CleanupWorkerConfig,
) *CleanupWorker {
	if config.PollInterval == 0 {
		config.PollInterval = 24 * time.Hour
	}
	if config.SuccessRetentionDays == 0 {
		config.SuccessRetentionDays = 30
	}
	if config.FailedRetentionDays == 0 {
		config.FailedRetentionDays = 90
	}

	return &CleanupWorker{
		repo:                 repo,
		pollInterval:         config.PollInterval,
		successRetentionDays: config.SuccessRetentionDays,
		failedRetentionDays:  config.FailedRetentionDays,
		stopChan:             make(chan bool),
	}
}

// Start begins the worker's polling loop
func (w *CleanupWorker) Start(ctx context.Context) {
	log.Println("Cleanup worker started")

	// Run cleanup immediately on start
	w.runCleanup(ctx)

	ticker := time.NewTicker(w.pollInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Cleanup worker stopped (context done)")
			return
		case <-w.stopChan:
			log.Println("Cleanup worker stopped (stop signal)")
			return
		case <-ticker.C:
			w.runCleanup(ctx)
		}
	}
}

// Stop signals the worker to stop
func (w *CleanupWorker) Stop() {
	close(w.stopChan)
}

// runCleanup performs the cleanup operation
func (w *CleanupWorker) runCleanup(ctx context.Context) {
	log.Println("Starting cleanup of old import jobs...")

	var totalDeleted, totalFilesDeleted, totalErrors int

	// Cleanup old completed jobs
	successCutoff := time.Now().AddDate(0, 0, -w.successRetentionDays)
	completedJobs, err := w.repo.GetOldCompletedJobs(ctx, successCutoff)
	if err != nil {
		log.Printf("Failed to fetch old completed jobs: %v", err)
	} else {
		deleted, filesDeleted, errors := w.cleanupJobs(ctx, completedJobs, "completed")
		totalDeleted += deleted
		totalFilesDeleted += filesDeleted
		totalErrors += errors
	}

	// Cleanup old failed jobs
	failedCutoff := time.Now().AddDate(0, 0, -w.failedRetentionDays)
	failedJobs, err := w.repo.GetOldFailedJobs(ctx, failedCutoff)
	if err != nil {
		log.Printf("Failed to fetch old failed jobs: %v", err)
	} else {
		deleted, filesDeleted, errors := w.cleanupJobs(ctx, failedJobs, "failed")
		totalDeleted += deleted
		totalFilesDeleted += filesDeleted
		totalErrors += errors
	}

	log.Printf("Cleanup completed: %d jobs deleted, %d files removed, %d errors",
		totalDeleted, totalFilesDeleted, totalErrors)
}

// cleanupJobs processes a batch of jobs for cleanup
func (w *CleanupWorker) cleanupJobs(ctx context.Context, jobs []domain.ImportJob, jobType string) (int, int, int) {
	var deleted, filesDeleted, errors int

	for _, job := range jobs {
		// Delete the file if it exists
		if job.FilePath != "" {
			if err := os.Remove(job.FilePath); err != nil {
				if !os.IsNotExist(err) {
					log.Printf("Failed to delete file %s for job %s: %v", job.FilePath, job.ID, err)
					errors++
				}
				// If file doesn't exist, that's OK - it's already gone
			} else {
				filesDeleted++
				log.Printf("Deleted file: %s (job %s)", job.FilePath, job.ID)
			}
		}

		// Delete the job record from database
		if err := w.repo.Delete(ctx, job.ID); err != nil {
			log.Printf("Failed to delete %s job %s from database: %v", jobType, job.ID, err)
			errors++
		} else {
			deleted++
			log.Printf("Deleted %s job: %s (created: %s)", jobType, job.ID, job.CreatedAt.Format("2006-01-02"))
		}
	}

	if len(jobs) > 0 {
		log.Printf("Cleaned up %d %s jobs (deleted %d jobs, %d files, %d errors)",
			len(jobs), jobType, deleted, filesDeleted, errors)
	}

	return deleted, filesDeleted, errors
}




