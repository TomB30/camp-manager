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

// ListLocations handles GET /locations
func (h *LocationsHandler) ListLocations(w http.ResponseWriter, r *http.Request, params api.ListLocationsParams) {
	// TODO: Implement listing locations with pagination and search
}

// CreateLocation handles POST /locations
func (h *LocationsHandler) CreateLocation(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement location creation
}

// GetLocationById handles GET /locations/{id}
func (h *LocationsHandler) GetLocationById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement get location by ID
}

// UpdateLocationById handles PUT /locations/{id}
func (h *LocationsHandler) UpdateLocationById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement location update
}

// DeleteLocationById handles DELETE /locations/{id}
func (h *LocationsHandler) DeleteLocationById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement location deletion
}
