package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	pkgerrors "github.com/tbechar/camp-manager-backend/pkg/errors"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// SessionsService defines the interface for session business logic
type SessionsService interface {
	// List retrieves sessions with pagination and optional search
	List(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, limit int, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.SessionsListResponse, error)

	// GetByID retrieves a single session by ID
	GetByID(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) (*api.Session, error)

	// Create creates a new session
	Create(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, req *api.SessionCreationRequest) (*api.Session, error)

	// Update updates an existing session
	Update(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID, req *api.SessionUpdateRequest) (*api.Session, error)

	// Delete deletes a session by ID
	Delete(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, id uuid.UUID) error
}

// sessionsService implements SessionsService
type sessionsService struct {
	repo SessionsRepository
}

// NewSessionsService creates a new sessions service
func NewSessionsService(repo SessionsRepository) SessionsService {
	return &sessionsService{
		repo: repo,
	}
}

// List retrieves sessions with pagination and optional search
func (s *sessionsService) List(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.SessionsListResponse, error) {
	sessions, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search, filterStrings, sortBy, sortOrder)
	if err != nil {
		return nil, pkgerrors.BadRequest("Failed to list sessions", err)
	}

	// Convert domain sessions to API sessions
	apiSessions := make([]api.Session, len(sessions))
	for i, session := range sessions {
		apiSessions[i] = session.ToAPI()
	}

	return &api.SessionsListResponse{
		Items:  apiSessions,
		Limit:  limit,
		Offset: offset,
		Total:  int(total),
	}, nil
}

// GetByID retrieves a single session by ID
func (s *sessionsService) GetByID(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID) (*api.Session, error) {
	session, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Session not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get session", err)
	}

	apiSession := session.ToAPI()
	return &apiSession, nil
}

// Create creates a new session
func (s *sessionsService) Create(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, req *api.SessionCreationRequest) (*api.Session, error) {
	// Get dates from request
	startDate := req.Spec.StartDate.Time
	endDate := req.Spec.EndDate.Time

	// Validate date range
	if endDate.Before(startDate) {
		return nil, pkgerrors.BadRequest("End date must be after or equal to start date", nil)
	}

	// Create domain session from request
	session := &domain.Session{
		TenantID:    tenantId,
		CampID:      campId,
		Name:        req.Meta.Name,
		Description: utils.PtrToString(req.Meta.Description),
		StartDate:   startDate,
		EndDate:     endDate,
	}

	// Save to database
	if err := s.repo.Create(ctx, session); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to create session", err)
	}

	apiSession := session.ToAPI()
	return &apiSession, nil
}

// Update updates an existing session
func (s *sessionsService) Update(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID, req *api.SessionUpdateRequest) (*api.Session, error) {
	// Check if session exists and belongs to tenant/camp
	existingSession, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, pkgerrors.NotFound("Session not found", err)
		}
		return nil, pkgerrors.InternalServerError("Failed to get session", err)
	}

	// Get dates from request
	startDate := req.Spec.StartDate.Time
	endDate := req.Spec.EndDate.Time

	// Validate date range
	if endDate.Before(startDate) {
		return nil, pkgerrors.BadRequest("End date must be after or equal to start date", nil)
	}

	// Update fields
	existingSession.Name = req.Meta.Name
	existingSession.Description = utils.PtrToString(req.Meta.Description)
	existingSession.StartDate = startDate
	existingSession.EndDate = endDate

	// Save updates
	if err := s.repo.Update(ctx, tenantID, campID, existingSession); err != nil {
		return nil, pkgerrors.InternalServerError("Failed to update session", err)
	}

	// Fetch updated session to get latest timestamps
	updatedSession, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		return nil, pkgerrors.InternalServerError("Failed to get updated session", err)
	}

	apiSession := updatedSession.ToAPI()
	return &apiSession, nil
}

// Delete deletes a session by ID
func (s *sessionsService) Delete(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, id uuid.UUID) error {
	// Check if session exists
	_, err := s.repo.GetByID(ctx, tenantID, campID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pkgerrors.NotFound("Session not found", err)
		}
		return pkgerrors.InternalServerError("Failed to get session", err)
	}

	// Delete the session
	if err := s.repo.Delete(ctx, tenantID, campID, id); err != nil {
		return pkgerrors.InternalServerError("Failed to delete session", err)
	}

	return nil
}
