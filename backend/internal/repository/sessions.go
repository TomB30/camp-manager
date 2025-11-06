package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// SessionsRepository handles database operations for sessions
type SessionsRepository struct {
	db *database.Database
}

// NewSessionsRepository creates a new sessions repository
func NewSessionsRepository(db *database.Database) *SessionsRepository {
	return &SessionsRepository{db: db}
}

// List retrieves a paginated list of sessions filtered by tenant and camp
func (r *SessionsRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) ([]domain.Session, int64, error) {
	var sessions []domain.Session
	var total int64

	// Build the base query with tenant and camp filtering
	query := ScopedQuery(r.db, ctx, tenantID, campID)

	// Add search filter if provided
	if search != nil && *search != "" {
		searchPattern := fmt.Sprintf("%%%s%%", *search)
		query = query.Where("name ILIKE ?", searchPattern)
	}

	// Get total count
	if err := query.Model(&domain.Session{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count sessions: %w", err)
	}

	// Get paginated results
	if err := query.
		Limit(limit).
		Offset(offset).
		Order("start_date DESC, created_at DESC").
		Find(&sessions).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list sessions: %w", err)
	}

	return sessions, total, nil
}

// GetByID retrieves a single session by ID with tenant and camp validation
func (r *SessionsRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Session, error) {
	var session domain.Session

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		First(&session).Error

	if err != nil {
		return nil, err
	}

	return &session, nil
}

// Create inserts a new session
func (r *SessionsRepository) Create(ctx context.Context, session *domain.Session) error {
	if err := r.db.WithContext(ctx).Create(session).Error; err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}
	return nil
}

// Update updates an existing session with tenant and camp validation
func (r *SessionsRepository) Update(ctx context.Context, tenantID, campID uuid.UUID, session *domain.Session) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Model(&domain.Session{}).
		Where("id = ?", session.ID).
		Updates(map[string]interface{}{
			"name":        session.Name,
			"description": session.Description,
			"start_date":  session.StartDate,
			"end_date":    session.EndDate,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to update session: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("session not found or unauthorized")
	}

	return nil
}

// Delete soft deletes a session by ID with tenant and camp validation
func (r *SessionsRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		Delete(&domain.Session{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete session: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("session not found or unauthorized")
	}

	return nil
}
