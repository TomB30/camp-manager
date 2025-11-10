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

// GroupsHandler handles group-related HTTP requests
type GroupsHandler struct {
	service service.GroupsService
}

// NewGroupsHandler creates a new groups handler
func NewGroupsHandler(service service.GroupsService) *GroupsHandler {
	return &GroupsHandler{
		service: service,
	}
}

// ListGroups handles GET /api/v1/camps/{camp_id}/groups
func (h *GroupsHandler) ListGroups(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListGroupsParams) {
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

// CreateGroup handles POST /api/v1/camps/{camp_id}/groups
func (h *GroupsHandler) CreateGroup(w http.ResponseWriter, r *http.Request, campId api.CampId) {
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
	var req api.GroupCreationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	// Call service
	group, err := h.service.Create(r.Context(), tenantID, campUUID, &req)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusCreated, group); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// GetGroupById handles GET /api/v1/camps/{camp_id}/groups/{id}
func (h *GroupsHandler) GetGroupById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
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

	groupID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid group ID", err))
		return
	}

	group, err := h.service.GetByID(r.Context(), tenantID, campUUID, groupID)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, group); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// UpdateGroupById handles PUT /api/v1/camps/{camp_id}/groups/{id}
func (h *GroupsHandler) UpdateGroupById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
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

	groupID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid group ID", err))
		return
	}

	// Parse request body
	var req api.GroupUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	// Call service
	group, err := h.service.Update(r.Context(), tenantID, campUUID, groupID, &req)
	if err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write response
	if err := errors.WriteJSON(w, http.StatusOK, group); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// DeleteGroupById handles DELETE /api/v1/camps/{camp_id}/groups/{id}
func (h *GroupsHandler) DeleteGroupById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
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

	groupID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid group ID", err))
		return
	}

	// Call service
	if err := h.service.Delete(r.Context(), tenantID, campUUID, groupID); err != nil {
		errors.WriteError(w, err)
		return
	}

	// Write no content response
}
