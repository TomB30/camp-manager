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

// ListEvents handles GET /events
func (h *EventsHandler) ListEvents(w http.ResponseWriter, r *http.Request, params api.ListEventsParams) {
	// TODO: Implement listing events with pagination and search
}

// CreateEvent handles POST /events
func (h *EventsHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement event creation
}

// GetEventById handles GET /events/{id}
func (h *EventsHandler) GetEventById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement get event by ID
}

// UpdateEventById handles PUT /events/{id}
func (h *EventsHandler) UpdateEventById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement event update
}

// DeleteEventById handles DELETE /events/{id}
func (h *EventsHandler) DeleteEventById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement event deletion
}
