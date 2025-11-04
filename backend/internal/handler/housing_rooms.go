package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
)

// HousingRoomsHandler handles housing room-related HTTP requests
type HousingRoomsHandler struct {
	service service.HousingRoomsService
}

// NewHousingRoomsHandler creates a new housing rooms handler
func NewHousingRoomsHandler(service service.HousingRoomsService) *HousingRoomsHandler {
	return &HousingRoomsHandler{
		service: service,
	}
}

// ListHousingRooms handles GET /api/v1/camps/{camp_id}/housing-rooms
func (h *HousingRoomsHandler) ListHousingRooms(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListHousingRoomsParams) {
	// TODO: Implement listing housing rooms with pagination and search
	// Use campId to filter housing rooms for the specific camp
}

// CreateHousingRoom handles POST /api/v1/camps/{camp_id}/housing-rooms
func (h *HousingRoomsHandler) CreateHousingRoom(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	// TODO: Implement housing room creation
	// Use campId to associate housing room with the specific camp
}

// GetHousingRoomById handles GET /api/v1/camps/{camp_id}/housing-rooms/{id}
func (h *HousingRoomsHandler) GetHousingRoomById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement get housing room by ID
	// Use campId to ensure housing room belongs to the specified camp
}

// UpdateHousingRoomById handles PUT /api/v1/camps/{camp_id}/housing-rooms/{id}
func (h *HousingRoomsHandler) UpdateHousingRoomById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement housing room update
	// Use campId to ensure housing room belongs to the specified camp
}

// DeleteHousingRoomById handles DELETE /api/v1/camps/{camp_id}/housing-rooms/{id}
func (h *HousingRoomsHandler) DeleteHousingRoomById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement housing room deletion
	// Use campId to ensure housing room belongs to the specified camp
}
