package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
)

// ActivitiesHandler handles activity-related HTTP requests
type ActivitiesHandler struct {
	service service.ActivitiesService
}

// NewActivitiesHandler creates a new activities handler
func NewActivitiesHandler(service service.ActivitiesService) *ActivitiesHandler {
	return &ActivitiesHandler{
		service: service,
	}
}

// ListActivities handles GET /activities
func (h *ActivitiesHandler) ListActivities(w http.ResponseWriter, r *http.Request, params api.ListActivitiesParams) {
	// TODO: Implement listing activities with pagination and search
}

// CreateActivity handles POST /activities
func (h *ActivitiesHandler) CreateActivity(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement activity creation
}

// GetActivityById handles GET /activities/{id}
func (h *ActivitiesHandler) GetActivityById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement get activity by ID
}

// UpdateActivityById handles PUT /activities/{id}
func (h *ActivitiesHandler) UpdateActivityById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement activity update
}

// DeleteActivityById handles DELETE /activities/{id}
func (h *ActivitiesHandler) DeleteActivityById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement activity deletion
}

