package repository

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/database"
)

// ActivitiesRepository handles database operations for activities
type ActivitiesRepository struct {
	db *database.Database
}

// NewActivitiesRepository creates a new activities repository
func NewActivitiesRepository(db *database.Database) *ActivitiesRepository {
	return &ActivitiesRepository{db: db}
}

// List retrieves a paginated list of activities
func (r *ActivitiesRepository) List(ctx context.Context, limit, offset int, search *string) ([]api.Activity, int, error) {
	// TODO: Implement query with pagination and search
	// Query should support full-text search on name and description
	return nil, 0, nil
}

// GetByID retrieves a single activity by ID
func (r *ActivitiesRepository) GetByID(ctx context.Context, id uuid.UUID) (*api.Activity, error) {
	// TODO: Implement single row query
	// Handle sql.ErrNoRows appropriately
	return nil, nil
}

// Create inserts a new activity
func (r *ActivitiesRepository) Create(ctx context.Context, activity *api.Activity) error {
	// TODO: Implement INSERT query
	// Generate UUID and timestamps
	// Handle JSONB fields for arrays
	return nil
}

// Update updates an existing activity
func (r *ActivitiesRepository) Update(ctx context.Context, id uuid.UUID, activity *api.Activity) error {
	// TODO: Implement UPDATE query
	// Update updatedAt timestamp
	// Check if rows were affected
	return nil
}

// Delete removes an activity by ID
func (r *ActivitiesRepository) Delete(ctx context.Context, id uuid.UUID) error {
	// TODO: Implement DELETE query
	// Check if rows were affected (return error if not found)
	return nil
}

// Helper methods

// scanActivity scans a database row into an Activity struct
func (r *ActivitiesRepository) scanActivity(row *sql.Row) (*api.Activity, error) {
	// TODO: Implement row scanning
	// Handle JSONB arrays and nullable fields
	return nil, nil
}

// scanActivities scans multiple database rows into Activity structs
func (r *ActivitiesRepository) scanActivities(rows *sql.Rows) ([]api.Activity, error) {
	// TODO: Implement rows scanning
	// Handle JSONB arrays and nullable fields
	return nil, nil
}
