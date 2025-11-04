package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
)

// EventsHandler handles event-related HTTP requests
type EventsHandler struct {
	service service.EventsService
}

// NewEventsHandler creates a new events handler
func NewEventsHandler(service service.EventsService) *EventsHandler {
	return &EventsHandler{
		service: service,
	}
}

// ListEvents handles GET /api/v1/camps/{camp_id}/events
func (h *EventsHandler) ListEvents(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListEventsParams) {
	// TODO: Implement listing events with pagination and search
	// Use campId to filter events for the specific camp
}

// CreateEvent handles POST /api/v1/camps/{camp_id}/events
func (h *EventsHandler) CreateEvent(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	// TODO: Implement event creation
	// Use campId to associate event with the specific camp
}

// GetEventById handles GET /api/v1/camps/{camp_id}/events/{id}
func (h *EventsHandler) GetEventById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement get event by ID
	// Use campId to ensure event belongs to the specified camp
}

// UpdateEventById handles PUT /api/v1/camps/{camp_id}/events/{id}
func (h *EventsHandler) UpdateEventById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement event update
	// Use campId to ensure event belongs to the specified camp
}

// DeleteEventById handles DELETE /api/v1/camps/{camp_id}/events/{id}
func (h *EventsHandler) DeleteEventById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement event deletion
	// Use campId to ensure event belongs to the specified camp
}
