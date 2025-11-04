package service

import (
	"context"

	"github.com/tbechar/camp-manager-backend/internal/api"
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
	// TODO: Add more dependencies like password hasher, JWT service, etc.
}

// NewAuthService creates a new auth service
func NewAuthService(usersRepo UsersRepository, tenantsRepo TenantsRepository) AuthService {
	return &authService{
		usersRepo:   usersRepo,
		tenantsRepo: tenantsRepo,
	}
}

// Login authenticates a user with email and password
func (s *authService) Login(ctx context.Context, req *api.LoginRequest) (*api.LoginResponse, error) {
	// TODO: Implement login logic
	// 1. Validate email and password format
	// 2. Find user by email
	// 3. Verify password
	// 4. Generate JWT token
	// 5. Return user and token
	return nil, nil
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
