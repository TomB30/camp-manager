package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
)

// RolesHandler handles role-related HTTP requests
type RolesHandler struct {
	service service.RolesService
}

// NewRolesHandler creates a new roles handler
func NewRolesHandler(service service.RolesService) *RolesHandler {
	return &RolesHandler{
		service: service,
	}
}

// ListRoles handles GET /api/v1/camps/{camp_id}/roles
func (h *RolesHandler) ListRoles(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListRolesParams) {
	// TODO: Implement listing roles with pagination and search
	// Use campId to filter roles for the specific camp
}

// CreateRole handles POST /api/v1/camps/{camp_id}/roles
func (h *RolesHandler) CreateRole(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	// TODO: Implement role creation
	// Use campId to associate role with the specific camp
}

// GetRoleById handles GET /api/v1/camps/{camp_id}/roles/{id}
func (h *RolesHandler) GetRoleById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement get role by ID
	// Use campId to ensure role belongs to the specified camp
}

// UpdateRoleById handles PUT /api/v1/camps/{camp_id}/roles/{id}
func (h *RolesHandler) UpdateRoleById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement role update
	// Use campId to ensure role belongs to the specified camp
}

// DeleteRoleById handles DELETE /api/v1/camps/{camp_id}/roles/{id}
func (h *RolesHandler) DeleteRoleById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement role deletion
	// Use campId to ensure role belongs to the specified camp
}

