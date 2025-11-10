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

// AreasHandler handles area-related HTTP requests
type AreasHandler struct {
	service service.AreasService
}

// NewAreasHandler creates a new areas handler
func NewAreasHandler(service service.AreasService) *AreasHandler {
	return &AreasHandler{
		service: service,
	}
}

// ListAreas handles GET /api/v1/camps/{camp_id}/areas
func (h *AreasHandler) ListAreas(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListAreasParams) {
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

// CreateArea handles POST /api/v1/camps/{camp_id}/areas
func (h *AreasHandler) CreateArea(w http.ResponseWriter, r *http.Request, campId api.CampId) {
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
	var req api.AreaCreationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	// Call service
	area, err := h.service.Create(r.Context(), tenantID, campUUID, &req)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusCreated, area); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// GetAreaById handles GET /api/v1/camps/{camp_id}/areas/{id}
func (h *AreasHandler) GetAreaById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
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

	areaID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid area ID", err))
		return
	}

	// Call service
	area, err := h.service.GetByID(r.Context(), tenantID, campUUID, areaID)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, area); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// UpdateAreaById handles PUT /api/v1/camps/{camp_id}/areas/{id}
func (h *AreasHandler) UpdateAreaById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
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

	areaID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid area ID", err))
		return
	}

	// Parse request body
	var req api.AreaUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	// Call service
	area, err := h.service.Update(r.Context(), tenantID, campUUID, areaID, &req)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, area); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// DeleteAreaById handles DELETE /api/v1/camps/{camp_id}/areas/{id}
func (h *AreasHandler) DeleteAreaById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
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

	areaID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid area ID", err))
		return
	}

	// Call service
	if err := h.service.Delete(r.Context(), tenantID, campUUID, areaID); err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write no content response
	w.WriteHeader(http.StatusNoContent)
}
