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

// TimeBlocksHandler handles time block-related HTTP requests
type TimeBlocksHandler struct {
	service service.TimeBlocksService
}

// NewTimeBlocksHandler creates a new time blocks handler
func NewTimeBlocksHandler(service service.TimeBlocksService) *TimeBlocksHandler {
	return &TimeBlocksHandler{
		service: service,
	}
}

// ListTimeBlocks handles GET /api/v1/camps/{camp_id}/time-blocks
func (h *TimeBlocksHandler) ListTimeBlocks(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListTimeBlocksParams) {
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

// CreateTimeBlock handles POST /api/v1/camps/{camp_id}/time-blocks
func (h *TimeBlocksHandler) CreateTimeBlock(w http.ResponseWriter, r *http.Request, campId api.CampId) {
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
	var req api.TimeBlockCreationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	// Call service
	timeBlock, err := h.service.Create(r.Context(), tenantID, campUUID, &req)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusCreated, timeBlock); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// GetTimeBlockById handles GET /api/v1/camps/{camp_id}/time-blocks/{id}
func (h *TimeBlocksHandler) GetTimeBlockById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
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

	timeBlockID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid time block ID", err))
		return
	}

	// Call service
	timeBlock, err := h.service.GetByID(r.Context(), tenantID, campUUID, timeBlockID)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, timeBlock); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// UpdateTimeBlockById handles PUT /api/v1/camps/{camp_id}/time-blocks/{id}
func (h *TimeBlocksHandler) UpdateTimeBlockById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
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

	timeBlockID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid time block ID", err))
		return
	}

	// Parse request body
	var req api.TimeBlockUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	// Call service
	timeBlock, err := h.service.Update(r.Context(), tenantID, campUUID, timeBlockID, &req)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, timeBlock); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// DeleteTimeBlockById handles DELETE /api/v1/camps/{camp_id}/time-blocks/{id}
func (h *TimeBlocksHandler) DeleteTimeBlockById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
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

	timeBlockID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid time block ID", err))
		return
	}

	// Call service
	if err := h.service.Delete(r.Context(), tenantID, campUUID, timeBlockID); err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write no content response
	w.WriteHeader(http.StatusNoContent)
}

