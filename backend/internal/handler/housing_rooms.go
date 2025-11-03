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

// ListHousingRooms handles GET /housing-rooms
func (h *HousingRoomsHandler) ListHousingRooms(w http.ResponseWriter, r *http.Request, params api.ListHousingRoomsParams) {
	// TODO: Implement listing housing rooms with pagination and search
}

// CreateHousingRoom handles POST /housing-rooms
func (h *HousingRoomsHandler) CreateHousingRoom(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement housing room creation
}

// GetHousingRoomById handles GET /housing-rooms/{id}
func (h *HousingRoomsHandler) GetHousingRoomById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement get housing room by ID
}

// UpdateHousingRoomById handles PUT /housing-rooms/{id}
func (h *HousingRoomsHandler) UpdateHousingRoomById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement housing room update
}

// DeleteHousingRoomById handles DELETE /housing-rooms/{id}
func (h *HousingRoomsHandler) DeleteHousingRoomById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement housing room deletion
}
