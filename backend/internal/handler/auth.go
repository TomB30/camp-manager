package handler

import (
	"encoding/json"
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/service"
	pkgcontext "github.com/tbechar/camp-manager-backend/pkg/context"
	"github.com/tbechar/camp-manager-backend/pkg/errors"
)

// AuthHandler handles authentication-related HTTP requests
type AuthHandler struct {
	service service.AuthService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(service service.AuthService) *AuthHandler {
	return &AuthHandler{
		service: service,
	}
}

// Login handles POST /api/v1/auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	// 1. Parse request body into LoginRequest
	var req api.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteError(w, errors.BadRequest("Invalid request body", err))
		return
	}

	// 2. Call service.Login()
	response, err := h.service.Login(r.Context(), &req)
	if err != nil {
		// 3. Handle errors appropriately (401 for invalid credentials)
		errors.WriteError(w, err)
		return
	}

	// 4. Return LoginResponse with user and token
	if err := errors.WriteJSON(w, http.StatusOK, response); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// Signup handles POST /api/v1/auth/signup
func (h *AuthHandler) Signup(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement signup handler
	// 1. Parse request body into SignupRequest
	// 2. Call service.Signup()
	// 3. Handle errors appropriately (400 for validation errors or existing user)
	// 4. Return LoginResponse with user and token
}

// GetCurrentUser handles GET /api/v1/auth/me
func (h *AuthHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	// 1. Extract user ID from context (set by auth middleware)
	userID, err := pkgcontext.ExtractUserID(r.Context())
	if err != nil {
		errors.WriteError(w, errors.Unauthorized("User not authenticated", err))
		return
	}

	// 2. Call service.GetCurrentUser()
	response, err := h.service.GetCurrentUser(r.Context(), userID)
	if err != nil {
		// 3. Handle errors appropriately (401 if not authenticated)
		errors.WriteError(w, err)
		return
	}

	// 4. Return AuthMe response with user information
	if err := errors.WriteJSON(w, http.StatusOK, response); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}

// Logout handles POST /api/v1/auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// 1. Extract user ID from context (set by auth middleware)
	userID, err := pkgcontext.ExtractUserID(r.Context())
	if err != nil {
		errors.WriteError(w, errors.Unauthorized("User not authenticated", err))
		return
	}

	// 2. Call service.Logout()
	if err := h.service.Logout(r.Context(), userID); err != nil {
		// 3. Handle errors appropriately (401 if not authenticated)
		errors.WriteError(w, err)
		return
	}

	// 4. Return success response
	response := map[string]interface{}{
		"success": true,
		"message": "Successfully logged out",
	}

	if err := errors.WriteJSON(w, http.StatusOK, response); err != nil {
		errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
		return
	}
}
