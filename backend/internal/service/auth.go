package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"github.com/tbechar/camp-manager-backend/pkg/errors"
)

// AuthService defines the interface for authentication business logic
type AuthService interface {
	// Login authenticates a user with email and password
	Login(ctx context.Context, req *api.LoginRequest) (*api.LoginResponse, error)

	// Signup registers a new user
	Signup(ctx context.Context, req *api.SignupRequest) (*api.LoginResponse, error)

	// GetCurrentUser retrieves the current authenticated user's information
	GetCurrentUser(ctx context.Context, userID string) (*api.AuthMe, error)

	// Logout logs out the current user
	Logout(ctx context.Context, userID string) error
}

// authService implements AuthService
type authService struct {
	usersRepo   UsersRepository
	tenantsRepo TenantsRepository
	jwtService  *domain.JWTService
}

// NewAuthService creates a new auth service
func NewAuthService(usersRepo UsersRepository, tenantsRepo TenantsRepository, jwtService *domain.JWTService) AuthService {
	return &authService{
		usersRepo:   usersRepo,
		tenantsRepo: tenantsRepo,
		jwtService:  jwtService,
	}
}

// Login authenticates a user with email and password
func (s *authService) Login(ctx context.Context, req *api.LoginRequest) (*api.LoginResponse, error) {
	// 1. Validate email and password format
	if err := s.validateLoginRequest(req); err != nil {
		return nil, errors.BadRequest("Invalid login request", err)
	}

	// 2. Find user by email
	user, err := s.usersRepo.FindByEmail(ctx, string(req.Email))
	if err != nil {
		// Don't reveal if user exists or not for security
		return nil, errors.Unauthorized("Invalid email or password", nil)
	}

	// 3. Verify password
	if err := domain.CheckPassword(req.Password, user.PasswordHash); err != nil {
		return nil, errors.Unauthorized("Invalid email or password", nil)
	}

	// Check if user is active
	if !user.IsActive {
		return nil, errors.Unauthorized("Account is inactive", nil)
	}

	// 4. Get user with access rules for JWT and response
	apiUser, err := s.usersRepo.GetUserWithAccessRules(ctx, user.ID.String())
	if err != nil {
		return nil, errors.InternalServerError("Failed to retrieve user details", err)
	}

	// 5. Convert API access rules to domain access rules for JWT
	accessRules := make([]domain.AccessRule, len(apiUser.AccessRules))
	for i, ar := range apiUser.AccessRules {
		accessRules[i] = domain.AccessRule{
			Role:      string(ar.Role),
			ScopeType: string(ar.ScopeType),
		}
		if ar.ScopeId != nil {
			scopeIDPtr := new(uuid.UUID)
			parsed, err := uuid.Parse(*ar.ScopeId)
			if err == nil {
				*scopeIDPtr = parsed
				accessRules[i].ScopeID = scopeIDPtr
			}
		}
	}

	// 6. Generate JWT token with access rules
	token, err := s.jwtService.GenerateToken(
		user.ID.String(),
		user.TenantID.String(),
		user.Email,
		accessRules,
	)
	if err != nil {
		return nil, errors.InternalServerError("Failed to generate token", err)
	}

	// 7. Update last login timestamp
	if err := s.usersRepo.UpdateLastLogin(ctx, user.ID); err != nil {
		// Log the error but don't fail the login
		// This is a non-critical operation
		// TODO: Add proper logging here
	}

	// 8. Return user and token
	return &api.LoginResponse{
		Token: token,
		User:  *apiUser,
	}, nil
}

// validateLoginRequest validates the login request
func (s *authService) validateLoginRequest(req *api.LoginRequest) error {
	if req == nil {
		return fmt.Errorf("request cannot be nil")
	}

	email := strings.TrimSpace(string(req.Email))
	if email == "" {
		return fmt.Errorf("email is required")
	}

	if req.Password == "" {
		return fmt.Errorf("password is required")
	}

	if len(req.Password) < 6 {
		return fmt.Errorf("password must be at least 6 characters")
	}

	return nil
}

// Signup registers a new user
func (s *authService) Signup(ctx context.Context, req *api.SignupRequest) (*api.LoginResponse, error) {
	// 1. Validate signup request
	if err := s.validateSignupRequest(req); err != nil {
		return nil, errors.BadRequest("Invalid signup request", err)
	}

	// 2. Parse tenant ID
	tenantID, err := uuid.Parse(req.TenantId)
	if err != nil {
		return nil, errors.BadRequest("Invalid tenant ID", err)
	}

	// 3. Verify tenant exists
	tenant, err := s.tenantsRepo.GetByID(ctx, tenantID)
	if err != nil {
		return nil, errors.NotFound("Tenant not found", err)
	}

	// 4. Check if user already exists
	existingUser, err := s.usersRepo.FindByEmail(ctx, string(req.Email))
	if err == nil && existingUser != nil {
		return nil, errors.BadRequest("User with this email already exists", nil)
	}

	// 5. Hash password
	passwordHash, err := domain.HashPassword(req.Password)
	if err != nil {
		return nil, errors.InternalServerError("Failed to hash password", err)
	}

	// 6. Create user object
	user := &domain.User{
		TenantID:     tenant.ID,
		Email:        string(req.Email),
		PasswordHash: passwordHash,
		IsActive:     true,
	}

	// 7. Check if this is the first user in the tenant
	userCount, err := s.usersRepo.CountByTenantID(ctx, tenant.ID)
	if err != nil {
		return nil, errors.InternalServerError("Failed to check user count", err)
	}

	fmt.Println("userCount", userCount)

	// 8. Create access rules - first user gets admin access
	var accessRules []domain.AccessRule
	if userCount == 0 {
		// First user gets admin access at tenant scope
		accessRules = []domain.AccessRule{
			{
				Role:      "admin",
				ScopeType: "tenant",
				ScopeID:   &tenant.ID,
			},
		}
	}

	fmt.Println("accessRules", accessRules)

	// 9. Create user with access rules in database
	if err := s.usersRepo.CreateWithAccessRules(ctx, user, accessRules); err != nil {
		return nil, errors.InternalServerError("Failed to create user", err)
	}

	// 10. Get user with access rules for JWT and response
	apiUser, err := s.usersRepo.GetUserWithAccessRules(ctx, user.ID.String())
	if err != nil {
		return nil, errors.InternalServerError("Failed to retrieve user details", err)
	}

	// 11. Convert API access rules to domain access rules for JWT
	fmt.Println("apiUser", apiUser)
	domainAccessRules := make([]domain.AccessRule, len(apiUser.AccessRules))
	for i, ar := range apiUser.AccessRules {
		domainAccessRules[i] = domain.AccessRule{
			Role:      string(ar.Role),
			ScopeType: string(ar.ScopeType),
		}
		if ar.ScopeId != nil {
			scopeIDPtr := new(uuid.UUID)
			parsed, err := uuid.Parse(*ar.ScopeId)
			if err == nil {
				*scopeIDPtr = parsed
				domainAccessRules[i].ScopeID = scopeIDPtr
			}
		}
	}

	fmt.Println("domainAccessRules", domainAccessRules)

	// 12. Generate JWT token with access rules
	token, err := s.jwtService.GenerateToken(
		user.ID.String(),
		user.TenantID.String(),
		user.Email,
		domainAccessRules,
	)
	if err != nil {
		return nil, errors.InternalServerError("Failed to generate token", err)
	}

	// 13. Return user and token
	return &api.LoginResponse{
		Token: token,
		User:  *apiUser,
	}, nil
}

// validateSignupRequest validates the signup request
func (s *authService) validateSignupRequest(req *api.SignupRequest) error {
	if req == nil {
		return fmt.Errorf("request cannot be nil")
	}

	email := strings.TrimSpace(string(req.Email))
	if email == "" {
		return fmt.Errorf("email is required")
	}

	if req.Password == "" {
		return fmt.Errorf("password is required")
	}

	if len(req.Password) < 6 {
		return fmt.Errorf("password must be at least 6 characters")
	}

	if req.TenantId == "" {
		return fmt.Errorf("tenant ID is required")
	}

	return nil
}

// GetCurrentUser retrieves the current authenticated user's information
func (s *authService) GetCurrentUser(ctx context.Context, userID string) (*api.AuthMe, error) {
	// 1. Validate user ID
	if userID == "" {
		return nil, errors.Unauthorized("User ID is required", nil)
	}

	// 2. Fetch user with access rules from database
	user, err := s.usersRepo.GetUserWithAccessRules(ctx, userID)
	if err != nil {
		return nil, errors.NotFound("User not found", err)
	}

	// 3. Return user information
	return &api.AuthMe{
		User: *user,
	}, nil
}

// Logout logs out the current user
func (s *authService) Logout(ctx context.Context, userID string) error {
	// 1. Validate user ID
	if userID == "" {
		return errors.Unauthorized("User ID is required", nil)
	}

	// 2. Verify user exists
	_, err := s.usersRepo.FindByID(ctx, userID)
	if err != nil {
		return errors.NotFound("User not found", err)
	}

	// 3. Token invalidation
	// Note: With JWT, tokens are stateless and cannot be invalidated server-side
	// unless we implement a token blacklist. For now, the client is responsible
	// for discarding the token. In the future, we can:
	// - Implement a token blacklist in Redis
	// - Store refresh tokens in the database and revoke them
	// - Use short-lived tokens with refresh token rotation

	// 4. Future: Clear any server-side session data, revoke refresh tokens, etc.
	// TODO: Implement token blacklist or refresh token revocation

	// For now, logout is successful once we verify the user exists
	return nil
}
