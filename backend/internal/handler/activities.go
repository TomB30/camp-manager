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

// ListActivities handles GET /api/v1/camps/{camp_id}/activities
func (h *ActivitiesHandler) ListActivities(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListActivitiesParams) {
	// TODO: Implement listing activities with pagination and search
	// Use campId to filter activities for the specific camp
}

// CreateActivity handles POST /api/v1/camps/{camp_id}/activities
func (h *ActivitiesHandler) CreateActivity(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	// TODO: Implement activity creation
	// Use campId to associate activity with the specific camp
}

// GetActivityById handles GET /api/v1/camps/{camp_id}/activities/{id}
func (h *ActivitiesHandler) GetActivityById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement get activity by ID
	// Use campId to ensure activity belongs to the specified camp
}

// UpdateActivityById handles PUT /api/v1/camps/{camp_id}/activities/{id}
func (h *ActivitiesHandler) UpdateActivityById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement activity update
	// Use campId to ensure activity belongs to the specified camp
}

// DeleteActivityById handles DELETE /api/v1/camps/{camp_id}/activities/{id}
func (h *ActivitiesHandler) DeleteActivityById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement activity deletion
	// Use campId to ensure activity belongs to the specified camp
}
