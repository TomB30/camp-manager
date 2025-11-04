package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
)

// LocationsHandler handles location-related HTTP requests
type LocationsHandler struct {
	service service.LocationsService
}

// NewLocationsHandler creates a new locations handler
func NewLocationsHandler(service service.LocationsService) *LocationsHandler {
	return &LocationsHandler{
		service: service,
	}
}

// ListLocations handles GET /api/v1/camps/{camp_id}/locations
func (h *LocationsHandler) ListLocations(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListLocationsParams) {
	// TODO: Implement listing locations with pagination and search
	// Use campId to filter locations for the specific camp
}

// CreateLocation handles POST /api/v1/camps/{camp_id}/locations
func (h *LocationsHandler) CreateLocation(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	// TODO: Implement location creation
	// Use campId to associate location with the specific camp
}

// GetLocationById handles GET /api/v1/camps/{camp_id}/locations/{id}
func (h *LocationsHandler) GetLocationById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement get location by ID
	// Use campId to ensure location belongs to the specified camp
}

// UpdateLocationById handles PUT /api/v1/camps/{camp_id}/locations/{id}
func (h *LocationsHandler) UpdateLocationById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement location update
	// Use campId to ensure location belongs to the specified camp
}

// DeleteLocationById handles DELETE /api/v1/camps/{camp_id}/locations/{id}
func (h *LocationsHandler) DeleteLocationById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement location deletion
	// Use campId to ensure location belongs to the specified camp
}
