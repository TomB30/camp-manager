package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
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

// ParseFilterStrings parses an array of filter strings into Filter structs
func ParseFilterStrings(filterStrings []string) ([]domain.Filter, error) {
	if len(filterStrings) == 0 {
		return []domain.Filter{}, nil
	}

	filters := make([]domain.Filter, 0, len(filterStrings))
	for _, filterStr := range filterStrings {
		filter, err := domain.ParseFilter(filterStr)
		if err != nil {
			return nil, fmt.Errorf("invalid filter '%s': %w", filterStr, err)
		}
		filters = append(filters, *filter)
	}

	return filters, nil
}

// ApplyFilters applies an array of filters to a GORM query with validation
// allowedFields is a map of API field name to field type (text, number, date, uuid)
// fieldToColumn is a map of API field name to database column name
func ApplyFilters(query *gorm.DB, filters []domain.Filter, allowedFields map[string]domain.FieldType, fieldToColumn map[string]string) (*gorm.DB, error) {
	if len(filters) == 0 {
		return query, nil
	}

	for _, filter := range filters {
		// Validate field name
		fieldType, exists := allowedFields[filter.Field]
		if !exists {
			return nil, fmt.Errorf("invalid field '%s': field is not filterable", filter.Field)
		}

		// Get database column name
		columnName, exists := fieldToColumn[filter.Field]
		if !exists {
			return nil, fmt.Errorf("invalid field '%s': no column mapping found", filter.Field)
		}

		// Validate operator compatibility with field type
		if !domain.IsValidOperatorForFieldType(filter.Operator, fieldType) {
			return nil, fmt.Errorf(
				"operator '%s' is not valid for %s field '%s'. Use %s",
				filter.Operator,
				fieldType,
				filter.Field,
				domain.GetValidOperatorsForFieldType(fieldType),
			)
		}

		// Apply the filter based on operator using the column name
		switch filter.Operator {
		case domain.OpEqual:
			query = query.Where(columnName+" = ?", filter.Value)
		case domain.OpNotEqual:
			query = query.Where(columnName+" != ?", filter.Value)
		case domain.OpLessThanEqual:
			query = query.Where(columnName+" <= ?", filter.Value)
		case domain.OpGreaterThanEqual:
			query = query.Where(columnName+" >= ?", filter.Value)
		case domain.OpContains:
			query = query.Where(columnName+" ILIKE ?", "%"+filter.Value+"%")
		case domain.OpNotContains:
			query = query.Where(columnName+" NOT ILIKE ?", "%"+filter.Value+"%")
		case domain.OpStartsWith:
			query = query.Where(columnName+" ILIKE ?", filter.Value+"%")
		case domain.OpEndsWith:
			query = query.Where(columnName+" ILIKE ?", "%"+filter.Value)
		default:
			return nil, fmt.Errorf("unsupported operator: %s", filter.Operator)
		}
	}

	return query, nil
}

// ApplySorting applies sorting to a GORM query with validation
// allowedFields is a slice of API field names that are allowed for sorting
// fieldToColumn is a map of API field name to database column name
// sortOrder should be "asc" or "desc" (case-insensitive)
// If sortBy is nil, no sorting is applied and the query is returned unchanged
func ApplySorting(query *gorm.DB, sortBy *string, sortOrder string, allowedFields []string, fieldToColumn map[string]string) (*gorm.DB, error) {
	// If no sort field specified, return query unchanged
	if sortBy == nil || *sortBy == "" {
		return query, nil
	}

	// Validate field name
	fieldAllowed := false
	for _, field := range allowedFields {
		if field == *sortBy {
			fieldAllowed = true
			break
		}
	}
	if !fieldAllowed {
		return nil, fmt.Errorf("invalid sort field '%s': field is not sortable", *sortBy)
	}

	// Get database column name
	columnName, exists := fieldToColumn[*sortBy]
	if !exists {
		return nil, fmt.Errorf("invalid sort field '%s': no column mapping found", *sortBy)
	}

	// Validate and normalize sort order
	if err := domain.ValidateSortOrder(sortOrder); err != nil {
		return nil, err
	}
	normalizedOrder := domain.NormalizeSortOrder(sortOrder)

	// Apply sorting using column name
	query = query.Order(columnName + " " + normalizedOrder)

	return query, nil
}
