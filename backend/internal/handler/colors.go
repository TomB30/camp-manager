package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
)

// ColorsHandler handles color-related HTTP requests
type ColorsHandler struct {
	service service.ColorsService
}

// NewColorsHandler creates a new colors handler
func NewColorsHandler(service service.ColorsService) *ColorsHandler {
	return &ColorsHandler{
		service: service,
	}
}

// ListColors handles GET /api/v1/camps/{camp_id}/colors
func (h *ColorsHandler) ListColors(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListColorsParams) {
	// TODO: Implement listing colors with pagination and search
	// Use campId to filter colors for the specific camp
}

// CreateColor handles POST /api/v1/camps/{camp_id}/colors
func (h *ColorsHandler) CreateColor(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	// TODO: Implement color creation
	// Use campId to associate color with the specific camp
}

// GetColorById handles GET /api/v1/camps/{camp_id}/colors/{id}
func (h *ColorsHandler) GetColorById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement get color by ID
	// Use campId to ensure color belongs to the specified camp
}

// UpdateColorById handles PUT /api/v1/camps/{camp_id}/colors/{id}
func (h *ColorsHandler) UpdateColorById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement color update
	// Use campId to ensure color belongs to the specified camp
}

// DeleteColorById handles DELETE /api/v1/camps/{camp_id}/colors/{id}
func (h *ColorsHandler) DeleteColorById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement color deletion
	// Use campId to ensure color belongs to the specified camp
}

