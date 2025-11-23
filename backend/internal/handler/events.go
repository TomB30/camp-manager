package handler

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
	pkgcontext "github.com/tbechar/camp-manager-backend/pkg/context"
	"github.com/tbechar/camp-manager-backend/pkg/errors"
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
	// Extract tenant ID from context
	tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
	if err != nil {
		errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
		return
	}

	tenantID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
		return
	}

	campUUID := uuid.UUID(campId)

	// Set default pagination values
	limit := 50
	offset := 0

	if params.Limit != nil {
		limit = *params.Limit
	}
	if params.Offset != nil {
		offset = *params.Offset
	}

	// Extract filter and sort parameters
	filterStrings := []string{}
	if params.FilterBy != nil {
		filterStrings = *params.FilterBy
	}

	sortOrder := "asc"
	if params.SortOrder != nil {
		sortOrder = string(*params.SortOrder)
	}

	sortBy := ""
	if params.SortBy != nil {
		sortBy = string(*params.SortBy)
	}

	// Call service
	response, err := h.service.List(r.Context(), tenantID, campUUID, limit, offset, params.Search, filterStrings, &sortBy, sortOrder)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, response); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// CreateEvent handles POST /api/v1/camps/{camp_id}/events
func (h *EventsHandler) CreateEvent(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	// Extract tenant ID from context
	tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
	if err != nil {
		errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
		return
	}

	tenantID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
		return
	}

	campUUID := uuid.UUID(campId)

	// Parse request body
	var req api.EventCreationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	// Check if this is a recurring event (based on recurrenceRule in spec)
	if req.Spec.RecurrenceRule != nil {
		// Create recurring series
		events, err := h.service.CreateRecurringSeries(
			r.Context(),
			tenantID,
			campUUID,
			&req,
			req.Spec.StartDate,
			req.Spec.EndDate,
		)
		if err != nil {
			errors.WriteError(w, err)
			return
		}

		// Return all created events
		if err := errors.WriteJSON(w, http.StatusCreated, events); err != nil {
			errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
			return
		}
		return
	}

	// Create single event
	event, err := h.service.Create(r.Context(), tenantID, campUUID, &req)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	if err := errors.WriteJSON(w, http.StatusCreated, event); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// GetEventById handles GET /api/v1/camps/{camp_id}/events/{id}
func (h *EventsHandler) GetEventById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// Extract tenant ID from context
	tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
	if err != nil {
		errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
		return
	}

	tenantID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
		return
	}

	campUUID := uuid.UUID(campId)

	eventID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid event ID", err))
		return
	}

	// Call service
	event, err := h.service.GetByID(r.Context(), tenantID, campUUID, eventID)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, event); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// UpdateEventById handles PUT /api/v1/camps/{camp_id}/events/{id}
func (h *EventsHandler) UpdateEventById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id, params api.UpdateEventByIdParams) {
	// Extract tenant ID from context
	tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
	if err != nil {
		errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
		return
	}

	tenantID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
		return
	}

	campUUID := uuid.UUID(campId)

	eventID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid event ID", err))
		return
	}

	// Get updateScope from params
	updateScope := "single"
	if params.UpdateScope != nil {
		updateScope = string(*params.UpdateScope)
	}

	// Parse request body
	var req api.EventUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	// Call service
	event, err := h.service.Update(r.Context(), tenantID, campUUID, eventID, &req, updateScope)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, event); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// DeleteEventById handles DELETE /api/v1/camps/{camp_id}/events/{id}
func (h *EventsHandler) DeleteEventById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id, params api.DeleteEventByIdParams) {
	// Extract tenant ID from context
	tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
	if err != nil {
		errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
		return
	}

	tenantID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
		return
	}

	campUUID := uuid.UUID(campId)

	eventID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid event ID", err))
		return
	}

	// Get deleteScope from params
	deleteScope := "single"
	if params.DeleteScope != nil {
		deleteScope = string(*params.DeleteScope)
	}

	// Call service
	if err := h.service.Delete(r.Context(), tenantID, campUUID, eventID, deleteScope); err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write no content response
	w.WriteHeader(http.StatusNoContent)
}
