package repository

import (
	"context"

	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/database"
)

// UsersRepository handles database operations for users
type UsersRepository struct {
	db *database.Database
}

// NewUsersRepository creates a new users repository
func NewUsersRepository(db *database.Database) *UsersRepository {
	return &UsersRepository{db: db}
}

// FindByEmail retrieves a user by email address
func (r *UsersRepository) FindByEmail(ctx context.Context, email string) (*api.User, error) {
	// TODO: Implement query to find user by email
	// Handle case when user is not found (return nil, nil or specific error)
	return nil, nil
}

// FindByID retrieves a user by ID
func (r *UsersRepository) FindByID(ctx context.Context, id string) (*api.User, error) {
	// TODO: Implement query to find user by ID
	// Handle case when user is not found
	return nil, nil
}

// Create inserts a new user
func (r *UsersRepository) Create(ctx context.Context, user *api.User) error {
	// TODO: Implement INSERT query
	// Generate UUID and timestamps
	// Store hashed password
	// Handle tenant relationship
	return nil
}

// Update updates an existing user
func (r *UsersRepository) Update(ctx context.Context, id string, user *api.User) error {
	// TODO: Implement UPDATE query
	// Update updatedAt timestamp
	// Check if rows were affected
	return nil
}

// Delete removes a user by ID
func (r *UsersRepository) Delete(ctx context.Context, id string) error {
	// TODO: Implement DELETE query
	// Consider soft delete vs hard delete
	// Check if rows were affected
	return nil
}

// GetUserWithAccessRules retrieves a user with their access rules populated
func (r *UsersRepository) GetUserWithAccessRules(ctx context.Context, id string) (*api.User, error) {
	// TODO: Implement query with JOIN to load access rules
	// This is useful for the /auth/me endpoint
	return nil, nil
}
