package service

import (
	"context"
	"fmt"
	"strings"

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

	// 4. Generate JWT token
	token, err := s.jwtService.GenerateToken(
		user.ID.String(),
		user.TenantID.String(),
		user.Email,
	)
	if err != nil {
		return nil, errors.InternalServerError("Failed to generate token", err)
	}

	// 5. Update last login timestamp
	if err := s.usersRepo.UpdateLastLogin(ctx, user.ID); err != nil {
		// Log the error but don't fail the login
		// This is a non-critical operation
		// TODO: Add proper logging here
	}

	// 6. Get user with access rules for response
	apiUser, err := s.usersRepo.GetUserWithAccessRules(ctx, user.ID.String())
	if err != nil {
		return nil, errors.InternalServerError("Failed to retrieve user details", err)
	}

	// 7. Return user and token
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
	// TODO: Implement signup logic
	// 1. Validate email, password, and tenantId
	// 2. Check if user already exists
	// 3. Verify tenant exists
	// 4. Hash password
	// 5. Create user in database
	// 6. Generate JWT token
	// 7. Return user and token
	return nil, nil
}

// GetCurrentUser retrieves the current authenticated user's information
func (s *authService) GetCurrentUser(ctx context.Context, userID string) (*api.AuthMe, error) {
	// TODO: Implement get current user logic
	// 1. Extract user ID from context (set by auth middleware)
	// 2. Fetch user details from database
	// 3. Return user information
	return nil, nil
}

// Logout logs out the current user
func (s *authService) Logout(ctx context.Context, userID string) error {
	// TODO: Implement logout logic
	// 1. Invalidate token (if using token blacklist)
	// 2. Clear any server-side session data
	// 3. Return success
	return nil
}
