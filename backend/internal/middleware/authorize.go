package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	pkgcontext "github.com/tbechar/camp-manager-backend/pkg/context"
	"github.com/tbechar/camp-manager-backend/pkg/errors"
)

// AuthorizationMiddleware handles authorization checks based on user roles and scopes
type AuthorizationMiddleware struct{}

// NewAuthorizationMiddleware creates a new authorization middleware
func NewAuthorizationMiddleware() *AuthorizationMiddleware {
	return &AuthorizationMiddleware{}
}

// Authorize checks if the user has the required role and scope for the operation
func (m *AuthorizationMiddleware) Authorize(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		// Extract operation ID from the route pattern
		// This is a simplified approach - you might need to adjust based on your routing
		operationID := getOperationID(r)

		// Skip authorization for public endpoints
		if operationID == "" || isPublicEndpoint(operationID) {
			next.ServeHTTP(w, r)
			return
		}

		// Get required roles for this operation
		requiredRoles, exists := OperationRoles[operationID]
		if !exists {
			// If operation not found in rules, deny access by default
			errors.WriteError(w, errors.Forbidden("Access denied", nil))
			return
		}

		// Extract user's access rules from context
		accessRules, err := pkgcontext.ExtractAccessRules(ctx)
		if err != nil {
			errors.WriteError(w, errors.Unauthorized("Authentication required", err))
			return
		}

		// Check for system scope access - super admin bypasses all checks
		if hasSystemScopeAccess(accessRules) {
			next.ServeHTTP(w, r)
			return
		}

		// Extract scope identifiers from the request
		campID := extractCampID(r)
		tenantID, _ := pkgcontext.ExtractTenantID(ctx)

		// Special check: Camp creation and deletion require tenant-scope admin access only
		if isCampManagementOperation(operationID) {
			if !hasTenantScopeAdmin(accessRules, tenantID) {
				errors.WriteError(w, errors.Forbidden("Camp management requires tenant-level admin access", nil))
				return
			}
		} else if isTenantLevelListOperation(operationID) {
			// For tenant-level list operations (like getCamps), just check if user has any access to the tenant
			// The actual filtering of which camps they can see happens in the service/repository layer
			if !hasAnyTenantAccess(accessRules, tenantID) {
				errors.WriteError(w, errors.Forbidden("No access to this tenant", nil))
				return
			}
		} else {
			// For camp-scoped operations, check if user has any of the required roles in the appropriate scope
			if !hasRequiredAccess(accessRules, requiredRoles, campID, tenantID) {
				errors.WriteError(w, errors.Forbidden("Insufficient permissions", nil))
				return
			}
		}

		// All checks passed, proceed to handler
		next.ServeHTTP(w, r)
	})
}

// getOperationID extracts the operation ID from the request
// This is a simplified implementation - you may need to enhance this
func getOperationID(r *http.Request) string {
	// Get the route pattern from chi
	rctx := chi.RouteContext(r.Context())
	if rctx == nil {
		return ""
	}

	// Map route patterns to operation IDs based on method and path
	path := rctx.RoutePattern()
	method := r.Method

	return mapRouteToOperationID(method, path)
}

// mapRouteToOperationID maps HTTP method and route pattern to operation ID
func mapRouteToOperationID(method, path string) string {
	// Auth endpoints
	if path == "/api/v1/auth/login" && method == "POST" {
		return "login"
	}
	if path == "/api/v1/auth/signup" && method == "POST" {
		return "signup"
	}
	if path == "/api/v1/auth/me" && method == "GET" {
		return "getCurrentUser"
	}
	if path == "/api/v1/auth/logout" && method == "POST" {
		return "logout"
	}

	// Tenant endpoints
	if path == "/api/v1/tenants" && method == "GET" {
		return "getTenants"
	}
	if path == "/api/v1/tenants/{id}" && method == "GET" {
		return "getTenantById"
	}

	// Camp endpoints
	if path == "/api/v1/camps" && method == "GET" {
		return "getCamps"
	}
	if path == "/api/v1/camps" && method == "POST" {
		return "createCamp"
	}
	if path == "/api/v1/camps/{id}" && method == "GET" {
		return "getCampById"
	}
	if path == "/api/v1/camps/{id}" && method == "PUT" {
		return "updateCampById"
	}
	if path == "/api/v1/camps/{id}" && method == "DELETE" {
		return "deleteCampById"
	}

	// Camp-scoped resources
	if strings.Contains(path, "/camps/{camp_id}/") {
		return mapCampScopedRoute(method, path)
	}

	return ""
}

// mapCampScopedRoute maps camp-scoped routes to operation IDs
func mapCampScopedRoute(method, path string) string {
	// Extract resource type and check if it's a detail route
	isDetailRoute := strings.HasSuffix(path, "/{id}")

	// Programs
	if strings.Contains(path, "/programs") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getProgramById"
			case "PUT":
				return "updateProgramById"
			case "DELETE":
				return "deleteProgramById"
			}
		} else {
			switch method {
			case "GET":
				return "listPrograms"
			case "POST":
				return "createProgram"
			}
		}
	}

	// Activities
	if strings.Contains(path, "/activities") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getActivityById"
			case "PUT":
				return "updateActivityById"
			case "DELETE":
				return "deleteActivityById"
			}
		} else {
			switch method {
			case "GET":
				return "listActivities"
			case "POST":
				return "createActivity"
			}
		}
	}

	// Events
	if strings.Contains(path, "/events") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getEventById"
			case "PUT":
				return "updateEventById"
			case "DELETE":
				return "deleteEventById"
			}
		} else {
			switch method {
			case "GET":
				return "listEvents"
			case "POST":
				return "createEvent"
			}
		}
	}

	// Campers
	if strings.Contains(path, "/campers") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getCamperById"
			case "PUT":
				return "updateCamperById"
			case "DELETE":
				return "deleteCamperById"
			}
		} else {
			switch method {
			case "GET":
				return "listCampers"
			case "POST":
				return "createCamper"
			}
		}
	}

	// Staff Members
	if strings.Contains(path, "/staff-members") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getStaffMemberById"
			case "PUT":
				return "updateStaffMemberById"
			case "DELETE":
				return "deleteStaffMemberById"
			}
		} else {
			switch method {
			case "GET":
				return "listStaffMembers"
			case "POST":
				return "createStaffMember"
			}
		}
	}

	// Areas
	if strings.Contains(path, "/areas") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getAreaById"
			case "PUT":
				return "updateAreaById"
			case "DELETE":
				return "deleteAreaById"
			}
		} else {
			switch method {
			case "GET":
				return "listAreas"
			case "POST":
				return "createArea"
			}
		}
	}

	// Locations
	if strings.Contains(path, "/locations") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getLocationById"
			case "PUT":
				return "updateLocationById"
			case "DELETE":
				return "deleteLocationById"
			}
		} else {
			switch method {
			case "GET":
				return "listLocations"
			case "POST":
				return "createLocation"
			}
		}
	}

	// Colors
	if strings.Contains(path, "/colors") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getColorById"
			case "PUT":
				return "updateColorById"
			case "DELETE":
				return "deleteColorById"
			}
		} else {
			switch method {
			case "GET":
				return "listColors"
			case "POST":
				return "createColor"
			}
		}
	}

	// Roles
	if strings.Contains(path, "/roles") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getRoleById"
			case "PUT":
				return "updateRoleById"
			case "DELETE":
				return "deleteRoleById"
			}
		} else {
			switch method {
			case "GET":
				return "listRoles"
			case "POST":
				return "createRole"
			}
		}
	}

	// Certifications
	if strings.Contains(path, "/certifications") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getCertificationById"
			case "PUT":
				return "updateCertificationById"
			case "DELETE":
				return "deleteCertificationById"
			}
		} else {
			switch method {
			case "GET":
				return "listCertifications"
			case "POST":
				return "createCertification"
			}
		}
	}

	// Housing Rooms
	if strings.Contains(path, "/housing-rooms") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getHousingRoomById"
			case "PUT":
				return "updateHousingRoomById"
			case "DELETE":
				return "deleteHousingRoomById"
			}
		} else {
			switch method {
			case "GET":
				return "listHousingRooms"
			case "POST":
				return "createHousingRoom"
			}
		}
	}

	// Sessions
	if strings.Contains(path, "/sessions") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getSessionById"
			case "PUT":
				return "updateSessionById"
			case "DELETE":
				return "deleteSessionById"
			}
		} else {
			switch method {
			case "GET":
				return "listSessions"
			case "POST":
				return "createSession"
			}
		}
	}

	// Groups
	if strings.Contains(path, "/groups") {
		if isDetailRoute {
			switch method {
			case "GET":
				return "getGroupById"
			case "PUT":
				return "updateGroupById"
			case "DELETE":
				return "deleteGroupById"
			}
		} else {
			switch method {
			case "GET":
				return "listGroups"
			case "POST":
				return "createGroup"
			}
		}
	}

	return ""
}

// isPublicEndpoint checks if an operation ID is for a public endpoint
func isPublicEndpoint(operationID string) bool {
	publicEndpoints := map[string]bool{
		"login":  true,
		"signup": true,
	}
	return publicEndpoints[operationID]
}

// hasSystemScopeAccess checks if the user has system-level access (super admin)
func hasSystemScopeAccess(accessRules []domain.AccessRule) bool {
	for _, rule := range accessRules {
		if rule.IsSystemScope() {
			return true
		}
	}
	return false
}

// extractCampID extracts the camp ID from the URL path parameter
func extractCampID(r *http.Request) string {
	return chi.URLParam(r, "camp_id")
}

// hasRequiredAccess checks if user has any of the required roles in the appropriate scope
func hasRequiredAccess(accessRules []domain.AccessRule, requiredRoles []string, campID, tenantID string) bool {
	// If no roles required, allow access (shouldn't happen in practice)
	if len(requiredRoles) == 0 {
		return true
	}

	// Build a map of user's roles by scope for efficient lookup
	userRolesByScope := buildRolesByScope(accessRules)

	// Check each required role
	for _, requiredRole := range requiredRoles {
		// Check if user has this role in the appropriate scope
		if hasRoleInScope(userRolesByScope, requiredRole, campID, tenantID) {
			return true
		}
	}

	return false
}

// RoleScope represents a role in a specific scope
type RoleScope struct {
	Role      string
	ScopeType string
	ScopeID   string
}

// buildRolesByScope builds a map of user's roles organized by scope
func buildRolesByScope(accessRules []domain.AccessRule) []RoleScope {
	result := make([]RoleScope, 0, len(accessRules))
	for _, rule := range accessRules {
		scopeID := ""
		if rule.ScopeID != nil {
			scopeID = rule.ScopeID.String()
		}
		result = append(result, RoleScope{
			Role:      rule.Role,
			ScopeType: rule.ScopeType,
			ScopeID:   scopeID,
		})
	}
	return result
}

// hasRoleInScope checks if user has a specific role in the appropriate scope
// Implements scope hierarchy: tenant access grants access to all camps in that tenant
func hasRoleInScope(userRoles []RoleScope, role, campID, tenantID string) bool {
	for _, userRole := range userRoles {
		// Must have the matching role
		if userRole.Role != role {
			continue
		}

		// System scope - has access to everything
		if userRole.ScopeType == "system" {
			return true
		}

		// Tenant scope - has access to all camps in this tenant
		if userRole.ScopeType == "tenant" && userRole.ScopeID == tenantID {
			return true
		}

		// Camp scope - check if it matches the requested camp
		if userRole.ScopeType == "camp" && campID != "" && userRole.ScopeID == campID {
			return true
		}

		// For non-camp-scoped operations (like camp list), tenant scope is sufficient
		if userRole.ScopeType == "tenant" && userRole.ScopeID == tenantID && campID == "" {
			return true
		}
	}

	return false
}

// isCampManagementOperation checks if the operation is camp creation or deletion
func isCampManagementOperation(operationID string) bool {
	campManagementOps := map[string]bool{
		"createCamp":     true,
		"deleteCampById": true,
	}
	return campManagementOps[operationID]
}

// isTenantLevelListOperation checks if the operation is a tenant-level list operation
// These operations don't have a camp_id parameter and return filtered results
func isTenantLevelListOperation(operationID string) bool {
	tenantLevelOps := map[string]bool{
		"getCamps":       true,
		"getCampById":    true,
		"updateCampById": true,
	}
	return tenantLevelOps[operationID]
}

// hasAnyTenantAccess checks if the user has any access to the tenant (any role, any scope in that tenant)
// For tenant-level operations, this checks if the user belongs to the tenant and has any access rules
func hasAnyTenantAccess(accessRules []domain.AccessRule, requestedTenantID string) bool {
	// System scope users can access any tenant
	for _, rule := range accessRules {
		if rule.IsSystemScope() {
			return true
		}
	}

	// For tenant and camp scope, check if any rule has a scope ID matching the requested tenant
	// or if the user's tenant context matches (for camp-scoped users in the same tenant)
	for _, rule := range accessRules {
		// Tenant scope - check if it matches the requested tenant
		if rule.IsTenantScope() && rule.ScopeID != nil && rule.ScopeID.String() == requestedTenantID {
			return true
		}

		// Camp scope - we allow access if the user has camp-level access
		// The JWT contains the user's tenant ID, and camp-scoped access rules are always within that tenant
		// The service layer will filter to only show camps the user has access to
		if rule.IsCampScope() && rule.ScopeID != nil {
			// Allow camp-scoped users to call getCamps - service layer will filter results
			return true
		}
	}
	return false
}

// hasTenantScopeAdmin checks if the user has admin role with tenant scope
func hasTenantScopeAdmin(accessRules []domain.AccessRule, tenantID string) bool {
	for _, rule := range accessRules {
		// Must be admin role
		if rule.Role != "admin" {
			continue
		}

		// System scope - has access to everything
		if rule.IsSystemScope() {
			return true
		}

		// Tenant scope - check if it matches the requested tenant
		if rule.IsTenantScope() && rule.ScopeID != nil && rule.ScopeID.String() == tenantID {
			return true
		}
	}
	return false
}

// CheckPermission is a helper function that can be called from handlers
// for additional authorization checks
func CheckPermission(ctx context.Context, requiredRole string, scopeType string, scopeID *uuid.UUID) error {
	accessRules, err := pkgcontext.ExtractAccessRules(ctx)
	if err != nil {
		return errors.Unauthorized("Authentication required", err)
	}

	// Check for system scope - super admin
	if hasSystemScopeAccess(accessRules) {
		return nil
	}

	// Check for matching access rule
	for _, rule := range accessRules {
		if rule.Role == requiredRole && rule.ScopeType == scopeType {
			// For system scope
			if scopeType == "system" && rule.ScopeID == nil {
				return nil
			}
			// For tenant or camp scope
			if scopeID != nil && rule.ScopeID != nil && *rule.ScopeID == *scopeID {
				return nil
			}
		}
	}

	return errors.Forbidden("Insufficient permissions", nil)
}
