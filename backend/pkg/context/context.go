package context

import (
	"context"
	"fmt"
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

// ExtractUserID extracts the user ID from the context
// Returns an error if the user ID is not found or is empty
func ExtractUserID(ctx context.Context) (string, error) {
	userID, ok := ctx.Value(UserIDKey).(string)
	if !ok {
		return "", fmt.Errorf("user ID not found in context")
	}
	return userID, nil
}

// ExtractTenantID extracts the tenant ID from the context
// Returns an error if the tenant ID is not found or is empty
func ExtractTenantID(ctx context.Context) (string, error) {
	tenantID, ok := ctx.Value(TenantIDKey).(string)
	if !ok {
		return "", fmt.Errorf("tenant ID not found in context")
	}
	return tenantID, nil
}

// ExtractEmail extracts the email from the context
// Returns an error if the email is not found or is empty
func ExtractEmail(ctx context.Context) (string, error) {
	email, ok := ctx.Value(EmailKey).(string)
	if !ok {
		return "", fmt.Errorf("email not found in context")
	}
	return email, nil
}

// WithUserID adds a user ID to the context
func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, UserIDKey, userID)
}

// WithTenantID adds a tenant ID to the context
func WithTenantID(ctx context.Context, tenantID string) context.Context {
	return context.WithValue(ctx, TenantIDKey, tenantID)
}

// WithEmail adds an email to the context
func WithEmail(ctx context.Context, email string) context.Context {
	return context.WithValue(ctx, EmailKey, email)
}

// WithUserContext adds user ID, tenant ID, and email to the context
func WithUserContext(ctx context.Context, userID, tenantID, email string) context.Context {
	ctx = WithUserID(ctx, userID)
	ctx = WithTenantID(ctx, tenantID)
	ctx = WithEmail(ctx, email)
	return ctx
}
