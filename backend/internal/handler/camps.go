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

// CampsHandler handles camp-related HTTP requests
type CampsHandler struct {
	service service.CampsService
}

// NewCampsHandler creates a new camps handler
func NewCampsHandler(service service.CampsService) *CampsHandler {
	return &CampsHandler{
		service: service,
	}
}

// GetCamps handles GET /api/v1/camps
func (h *CampsHandler) GetCamps(w http.ResponseWriter, r *http.Request, params api.GetCampsParams) {
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
	response, err := h.service.List(r.Context(), tenantID, limit, offset, params.Search, filterStrings, &sortBy, sortOrder)
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

// CreateCamp handles POST /api/v1/camps
func (h *CampsHandler) CreateCamp(w http.ResponseWriter, r *http.Request) {
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

	// Parse request body
	var req api.CampCreationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	// Call service
	camp, err := h.service.Create(r.Context(), tenantID, &req)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusCreated, camp); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// GetCampById handles GET /api/v1/camps/{id}
func (h *CampsHandler) GetCampById(w http.ResponseWriter, r *http.Request, id api.Id) {
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

	campID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid camp ID", err))
		return
	}

	// Call service
	camp, err := h.service.GetByID(r.Context(), tenantID, campID)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, camp); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// UpdateCampById handles PUT /api/v1/camps/{id}
func (h *CampsHandler) UpdateCampById(w http.ResponseWriter, r *http.Request, id api.Id) {
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

	campID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid camp ID", err))
		return
	}

	// Parse request body
	var req api.CampUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	// Call service
	camp, err := h.service.Update(r.Context(), tenantID, campID, &req)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, camp); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// DeleteCampById handles DELETE /api/v1/camps/{id}
func (h *CampsHandler) DeleteCampById(w http.ResponseWriter, r *http.Request, id api.Id) {
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

	campID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid camp ID", err))
		return
	}

	// Call service
	if err := h.service.Delete(r.Context(), tenantID, campID); err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write no content response
	w.WriteHeader(http.StatusNoContent)
}
