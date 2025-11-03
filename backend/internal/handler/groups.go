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

// ListGroups handles GET /groups
func (h *GroupsHandler) ListGroups(w http.ResponseWriter, r *http.Request, params api.ListGroupsParams) {
	// TODO: Implement listing groups with pagination and search
}

// CreateGroup handles POST /groups
func (h *GroupsHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement group creation
}

// GetGroupById handles GET /groups/{id}
func (h *GroupsHandler) GetGroupById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement get group by ID
}

// UpdateGroupById handles PUT /groups/{id}
func (h *GroupsHandler) UpdateGroupById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement group update
}

// DeleteGroupById handles DELETE /groups/{id}
func (h *GroupsHandler) DeleteGroupById(w http.ResponseWriter, r *http.Request, id api.Id) {
	// TODO: Implement group deletion
}
