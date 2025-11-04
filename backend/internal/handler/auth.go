package handler

import (
	"net/http"

	"github.com/tbechar/camp-manager-backend/internal/service"
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
	// TODO: Implement login handler
	// 1. Parse request body into LoginRequest
	// 2. Call service.Login()
	// 3. Handle errors appropriately (401 for invalid credentials)
	// 4. Return LoginResponse with user and token
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
	// TODO: Implement get current user handler
	// 1. Extract user ID from context (set by auth middleware)
	// 2. Call service.GetCurrentUser()
	// 3. Handle errors appropriately (401 if not authenticated)
	// 4. Return AuthMe response with user information
}

// Logout handles POST /api/v1/auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement logout handler
	// 1. Extract user ID from context (set by auth middleware)
	// 2. Call service.Logout()
	// 3. Handle errors appropriately (401 if not authenticated)
	// 4. Return success response
}

