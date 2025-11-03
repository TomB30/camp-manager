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

// ListCampers handles GET /campers
func (h *CampersHandler) ListCampers(w http.ResponseWriter, r *http.Request, params api.ListCampersParams) {
	// TODO: Implement listing campers with pagination and search
}

// CreateCamper handles POST /campers
func (h *CampersHandler) CreateCamper(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement camper creation
}

// GetCamperById handles GET /campers/{id}
func (h *CampersHandler) GetCamperById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement get camper by ID
}

// UpdateCamperById handles PUT /campers/{id}
func (h *CampersHandler) UpdateCamperById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement camper update
}

// DeleteCamperById handles DELETE /campers/{id}
func (h *CampersHandler) DeleteCamperById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement camper deletion
}

