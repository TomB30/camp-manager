package middleware

import (
	"net/http"
	"strings"

	"github.com/tbechar/camp-manager-backend/internal/domain"
	pkgcontext "github.com/tbechar/camp-manager-backend/pkg/context"
	"github.com/tbechar/camp-manager-backend/pkg/errors"
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
		ctx = pkgcontext.WithUserContext(ctx, claims.UserID, claims.TenantID, claims.Email)

		// Call the next handler with the updated context
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
