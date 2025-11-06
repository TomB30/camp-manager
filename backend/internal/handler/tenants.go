package handler

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/errors"
)

// TenantsService defines the interface for tenant business logic
type TenantsService interface {
	// TODO: Define service interface methods once API types are confirmed
}

// TenantsHandler handles tenant-related HTTP requests
type TenantsHandler struct {
	service TenantsService
}

// NewTenantsHandler creates a new tenants handler
func NewTenantsHandler(service TenantsService) *TenantsHandler {
	return &TenantsHandler{
		service: service,
	}
}

// GetTenants handles GET /api/v1/tenants
func (h *TenantsHandler) GetTenants(w http.ResponseWriter, r *http.Request) {
	// TODO: Extract query parameters (limit, offset)
	// TODO: Call service
	// TODO: Write response

	errors.WriteError(w, errors.InternalServerError("Not implemented", nil))
}

// GetTenantById handles GET /api/v1/tenants/{id}
func (h *TenantsHandler) GetTenantById(w http.ResponseWriter, r *http.Request, id api.Id) {
	tenantID, err := uuid.Parse(id)
	if err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
		return
	}

	// TODO: Call service
	// TODO: Write response

	_ = tenantID
	errors.WriteError(w, errors.InternalServerError("Not implemented", nil))
}

