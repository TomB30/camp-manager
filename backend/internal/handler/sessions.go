package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
)

// SessionsHandler handles session-related HTTP requests
type SessionsHandler struct {
	service service.SessionsService
}

// NewSessionsHandler creates a new sessions handler
func NewSessionsHandler(service service.SessionsService) *SessionsHandler {
	return &SessionsHandler{
		service: service,
	}
}

// ListSessions handles GET /api/v1/camps/{camp_id}/sessions
func (h *SessionsHandler) ListSessions(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListSessionsParams) {
	// TODO: Implement listing sessions with pagination and search
	// Use campId to filter sessions for the specific camp
}

// CreateSession handles POST /api/v1/camps/{camp_id}/sessions
func (h *SessionsHandler) CreateSession(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	// TODO: Implement session creation
	// Use campId to associate session with the specific camp
}

// GetSessionById handles GET /api/v1/camps/{camp_id}/sessions/{id}
func (h *SessionsHandler) GetSessionById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement get session by ID
	// Use campId to ensure session belongs to the specified camp
}

// UpdateSessionById handles PUT /api/v1/camps/{camp_id}/sessions/{id}
func (h *SessionsHandler) UpdateSessionById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement session update
	// Use campId to ensure session belongs to the specified camp
}

// DeleteSessionById handles DELETE /api/v1/camps/{camp_id}/sessions/{id}
func (h *SessionsHandler) DeleteSessionById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement session deletion
	// Use campId to ensure session belongs to the specified camp
}

