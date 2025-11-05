package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"gorm.io/gorm"
)

// UsersRepository handles database operations for users
type UsersRepository struct {
	db *database.Database
}

// NewUsersRepository creates a new users repository
func NewUsersRepository(db *database.Database) *UsersRepository {
	return &UsersRepository{db: db}
}

// FindByEmail retrieves a user by email address (including password hash for authentication)
func (r *UsersRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	err := r.db.DB.WithContext(ctx).Where("email = ? AND is_active = ?", email, true).First(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to find user by email: %w", err)
	}

	return &user, nil
}

// FindByID retrieves a user by ID
func (r *UsersRepository) FindByID(ctx context.Context, id string) (*api.User, error) {
	userID, err := uuid.Parse(id)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	var user domain.User
	err = r.db.DB.WithContext(ctx).Where("id = ?", userID).First(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to find user by ID: %w", err)
	}

	return r.domainToAPI(&user, nil), nil
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
	userID, err := uuid.Parse(id)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	var user domain.User
	err = r.db.DB.WithContext(ctx).
		Preload("AccessRules").
		Where("id = ?", userID).
		First(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to find user with access rules: %w", err)
	}

	return r.domainToAPI(&user, user.AccessRules), nil
}

// UpdateLastLogin updates the user's last login timestamp
func (r *UsersRepository) UpdateLastLogin(ctx context.Context, userID uuid.UUID) error {
	now := time.Now()
	err := r.db.DB.WithContext(ctx).
		Model(&domain.User{}).
		Where("id = ?", userID).
		Update("last_login_at", now).Error

	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}

	return nil
}

// domainToAPI converts a domain.User to api.User
func (r *UsersRepository) domainToAPI(user *domain.User, accessRules []domain.AccessRule) *api.User {
	apiUser := &api.User{
		Id:       user.ID.String(),
		Email:    openapi_types.Email(user.Email),
		TenantId: user.TenantID.String(),
	}

	// Convert access rules if provided
	if accessRules != nil {
		apiUser.AccessRules = make([]api.AccessRule, len(accessRules))
		for i, rule := range accessRules {
			var scopeID *string
			if rule.ScopeID != nil {
				scopeIDStr := rule.ScopeID.String()
				scopeID = &scopeIDStr
			}

			apiUser.AccessRules[i] = api.AccessRule{
				Role:      api.AccessRuleRole(rule.Role),
				ScopeType: api.ScopeType(rule.ScopeType),
				ScopeId:   scopeID,
			}
		}
	} else {
		apiUser.AccessRules = []api.AccessRule{}
	}

	return apiUser
}
