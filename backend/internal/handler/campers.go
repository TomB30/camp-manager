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

// ListCampers handles GET /api/v1/camps/{camp_id}/campers
func (h *CampersHandler) ListCampers(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListCampersParams) {
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

// CreateCamper handles POST /api/v1/camps/{camp_id}/campers
func (h *CampersHandler) CreateCamper(w http.ResponseWriter, r *http.Request, campId api.CampId) {
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
	var req api.CamperCreationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	// Call service
	camper, err := h.service.Create(r.Context(), tenantID, campUUID, &req)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusCreated, camper); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// GetCamperById handles GET /api/v1/camps/{camp_id}/campers/{id}
func (h *CampersHandler) GetCamperById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
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
	// Use campId to ensure camper belongs to the specified camp
	camperID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid camper ID", err))
		return
	}

	camper, err := h.service.GetByID(r.Context(), tenantID, campUUID, camperID)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, camper); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// UpdateCamperById handles PUT /api/v1/camps/{camp_id}/campers/{id}
func (h *CampersHandler) UpdateCamperById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
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
	camperID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid camper ID", err))
		return
	}

	var req api.CamperUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	camper, err := h.service.Update(r.Context(), tenantID, campUUID, camperID, &req)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, camper); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// DeleteCamperById handles DELETE /api/v1/camps/{camp_id}/campers/{id}
func (h *CampersHandler) DeleteCamperById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
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
	camperID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid camper ID", err))
		return
	}

	// Call service
	if err := h.service.Delete(r.Context(), tenantID, campUUID, camperID); err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write no content response
	w.WriteHeader(http.StatusNoContent)
}
