package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/tbechar/camp-manager-backend/internal/domain"
	"github.com/tbechar/camp-manager-backend/pkg/errors"
)

// ContextKey is a type for context keys to avoid collisions
type ContextKey string

const (
	// UserIDKey is the context key for the user ID
	UserIDKey ContextKey = "userID"
	// TenantIDKey is the context key for the tenant ID
	TenantIDKey ContextKey = "tenantID"
	// EmailKey is the context key for the user email
	EmailKey ContextKey = "email"
)

// AuthMiddleware validates JWT tokens and adds user information to the request context
type AuthMiddleware struct {
	jwtService *domain.JWTService
}

// NewAuthMiddleware creates a new authentication middleware
func NewAuthMiddleware(jwtService *domain.JWTService) *AuthMiddleware {
	return &AuthMiddleware{
		jwtService: jwtService,
	}
}

// Authenticate is the middleware handler that validates JWT tokens
func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extract token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			errors.WriteError(w, errors.Unauthorized("Missing authorization header", nil))
			return
		}

		// Check for Bearer token format
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			errors.WriteError(w, errors.Unauthorized("Invalid authorization header format", nil))
			return
		}

		token := parts[1]

		// Validate and parse the token
		claims, err := m.jwtService.ValidateToken(token)
		if err != nil {
			errors.WriteError(w, errors.Unauthorized("Invalid or expired token", err))
			return
		}

		// Add user information to the request context
		ctx := r.Context()
		ctx = context.WithValue(ctx, UserIDKey, claims.UserID)
		ctx = context.WithValue(ctx, TenantIDKey, claims.TenantID)
		ctx = context.WithValue(ctx, EmailKey, claims.Email)

		// Call the next handler with the updated context
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserID extracts the user ID from the request context
func GetUserID(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(UserIDKey).(string)
	return userID, ok
}

// GetTenantID extracts the tenant ID from the request context
func GetTenantID(ctx context.Context) (string, bool) {
	tenantID, ok := ctx.Value(TenantIDKey).(string)
	return tenantID, ok
}

// GetEmail extracts the email from the request context
func GetEmail(ctx context.Context) (string, bool) {
	email, ok := ctx.Value(EmailKey).(string)
	return email, ok
}
