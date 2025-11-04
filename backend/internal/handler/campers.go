package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
)

// CampersHandler handles camper-related HTTP requests
type CampersHandler struct {
	service service.CampersService
}

// NewCampersHandler creates a new campers handler
func NewCampersHandler(service service.CampersService) *CampersHandler {
	return &CampersHandler{
		service: service,
	}
}

// ListCampers handles GET /api/v1/camps/{camp_id}/campers
func (h *CampersHandler) ListCampers(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListCampersParams) {
	// TODO: Implement listing campers with pagination and search
	// Use campId to filter campers for the specific camp
}

// CreateCamper handles POST /api/v1/camps/{camp_id}/campers
func (h *CampersHandler) CreateCamper(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	// TODO: Implement camper creation
	// Use campId to associate camper with the specific camp
}

// GetCamperById handles GET /api/v1/camps/{camp_id}/campers/{id}
func (h *CampersHandler) GetCamperById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement get camper by ID
	// Use campId to ensure camper belongs to the specified camp
}

// UpdateCamperById handles PUT /api/v1/camps/{camp_id}/campers/{id}
func (h *CampersHandler) UpdateCamperById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement camper update
	// Use campId to ensure camper belongs to the specified camp
}

// DeleteCamperById handles DELETE /api/v1/camps/{camp_id}/campers/{id}
func (h *CampersHandler) DeleteCamperById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement camper deletion
	// Use campId to ensure camper belongs to the specified camp
}

