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

// ListAreas handles GET /areas
func (h *AreasHandler) ListAreas(w http.ResponseWriter, r *http.Request, params api.ListAreasParams) {
	// TODO: Implement listing areas with pagination and search
}

// CreateArea handles POST /areas
func (h *AreasHandler) CreateArea(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement area creation
}

// GetAreaById handles GET /areas/{id}
func (h *AreasHandler) GetAreaById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement get area by ID
}

// UpdateAreaById handles PUT /areas/{id}
func (h *AreasHandler) UpdateAreaById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement area update
}

// DeleteAreaById handles DELETE /areas/{id}
func (h *AreasHandler) DeleteAreaById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement area deletion
}

