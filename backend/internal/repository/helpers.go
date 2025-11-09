package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"gorm.io/gorm"
)

// ScopedQuery returns a query scoped to a specific tenant and camp.
// This should be used by all camp-scoped repositories to ensure proper data isolation.
func ScopedQuery(db *database.Database, ctx context.Context, tenantID, campID uuid.UUID) *gorm.DB {
	return db.WithContext(ctx).Where("tenant_id = ? AND camp_id = ?", tenantID, campID)
}

// ScopedQueryByTenant returns a query scoped to a specific tenant only.
// This should be used for tenant-level resources that are not camp-specific.
func ScopedQueryByTenant(db *database.Database, ctx context.Context, tenantID uuid.UUID) *gorm.DB {
	return db.WithContext(ctx).Where("tenant_id = ?", tenantID)
}

// ScopedTxQuery returns a scoped query for use within a transaction.
// This is the transaction-aware version of ScopedQuery.
func ScopedTxQuery(tx *gorm.DB, tenantID, campID uuid.UUID) *gorm.DB {
	return tx.Where("tenant_id = ? AND camp_id = ?", tenantID, campID)
}

// ApplySearchFilter adds a case-insensitive search filter to the query for one or more fields.
// If search is nil or empty, the query is returned unchanged.
// For single field: ApplySearchFilter(query, search, "name")
// For multiple fields: ApplySearchFilter(query, search, "name", "description")
func ApplySearchFilter(query *gorm.DB, search *string, fields ...string) *gorm.DB {
	// Return unchanged query if search is not provided or empty
	if search == nil || *search == "" || len(fields) == 0 {
		return query
	}

	// Create the search pattern with wildcards
	// Note: We add % wildcards for partial matching
	searchPattern := "%" + *search + "%"

	// Build the WHERE clause based on number of fields
	if len(fields) == 1 {
		// Single field search
		return query.Where(fields[0]+" ILIKE ?", searchPattern)
	}

	// Multiple field search (OR condition)
	var whereClauses string
	var args []interface{}
	for i, field := range fields {
		if i > 0 {
			whereClauses += " OR "
		}
		whereClauses += field + " ILIKE ?"
		args = append(args, searchPattern)
	}

	return query.Where(whereClauses, args...)
}
