package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
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
	// TODO: Implement listing groups with pagination and search
	// Use campId to filter groups for the specific camp
}

// CreateGroup handles POST /api/v1/camps/{camp_id}/groups
func (h *GroupsHandler) CreateGroup(w http.ResponseWriter, r *http.Request, campId api.CampId) {
	// TODO: Implement group creation
	// Use campId to associate group with the specific camp
}

// GetGroupById handles GET /api/v1/camps/{camp_id}/groups/{id}
func (h *GroupsHandler) GetGroupById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement get group by ID
	// Use campId to ensure group belongs to the specified camp
}

// UpdateGroupById handles PUT /api/v1/camps/{camp_id}/groups/{id}
func (h *GroupsHandler) UpdateGroupById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement group update
	// Use campId to ensure group belongs to the specified camp
}

// DeleteGroupById handles DELETE /api/v1/camps/{camp_id}/groups/{id}
func (h *GroupsHandler) DeleteGroupById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
	// TODO: Implement group deletion
	// Use campId to ensure group belongs to the specified camp
}
