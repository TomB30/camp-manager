package handler

import (
	"net/http"
	"time"

	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/pkg/errors"
)

// HealthHandler handles health check requests
type HealthHandler struct {
	db *database.Database
}

// NewHealthHandler creates a new health check handler
func NewHealthHandler(db *database.Database) *HealthHandler {
	return &HealthHandler{db: db}
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string    `json:"status"`
	Database  string    `json:"database"`
	Timestamp time.Time `json:"timestamp"`
	Error     string    `json:"error,omitempty"`
}

// Handle processes the health check request
func (h *HealthHandler) Handle(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Timestamp: time.Now().UTC(),
	}

	// Check database connection
	if err := h.db.Health(); err != nil {
		response.Status = "unhealthy"
		response.Database = "disconnected"
		response.Error = err.Error()
		errors.WriteJSON(w, http.StatusServiceUnavailable, response)
		return
	}

	response.Status = "healthy"
	response.Database = "connected"
	errors.WriteJSON(w, http.StatusOK, response)
}

