package csvimport

import (
	"context"

	"github.com/google/uuid"
)

// EntityMapper defines the interface for mapping CSV rows to entity creation requests
type EntityMapper interface {
	// MapRowToEntity converts a CSV row to an entity that can be created
	// Returns the entity and any error encountered during mapping
	MapRowToEntity(ctx context.Context, row map[string]string, tenantID, campID uuid.UUID) (interface{}, error)
}

