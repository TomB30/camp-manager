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
