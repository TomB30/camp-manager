package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
)

// AreasHandler handles area-related HTTP requests
type AreasHandler struct {
	service service.AreasService
}

// NewAreasHandler creates a new areas handler
func NewAreasHandler(service service.AreasService) *AreasHandler {
	return &AreasHandler{
		service: service,
	}
}

// ListAreas handles GET /api/v1/camps/{camp_id}/areas
func (h *AreasHandler) ListAreas(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListAreasParams) {
	// TODO: Implement listing areas with pagination and search
	// Use campId to filter areas for the specific camp
}

// CreateArea handles POST /api/v1/camps/{camp_id}/areas
func (h *AreasHandler) CreateArea(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	// TODO: Implement area creation
	// Use campId to associate area with the specific camp
}

// GetAreaById handles GET /api/v1/camps/{camp_id}/areas/{id}
func (h *AreasHandler) GetAreaById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement get area by ID
	// Use campId to ensure area belongs to the specified camp
}

// UpdateAreaById handles PUT /api/v1/camps/{camp_id}/areas/{id}
func (h *AreasHandler) UpdateAreaById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement area update
	// Use campId to ensure area belongs to the specified camp
}

// DeleteAreaById handles DELETE /api/v1/camps/{camp_id}/areas/{id}
func (h *AreasHandler) DeleteAreaById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement area deletion
	// Use campId to ensure area belongs to the specified camp
}

