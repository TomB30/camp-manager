package domain

import (
	"fmt"
	"strings"
)

// FilterOperator represents a filter comparison operator
type FilterOperator string

const (
	OpEqual            FilterOperator = "=="
	OpNotEqual         FilterOperator = "!="
	OpLessThanEqual    FilterOperator = "<="
	OpGreaterThanEqual FilterOperator = ">="
	OpContains         FilterOperator = "=@"
	OpNotContains      FilterOperator = "!@"
	OpStartsWith       FilterOperator = "=^"
	OpEndsWith         FilterOperator = "=~"
)

// FieldType represents the data type of a field
type FieldType string

const (
	FieldTypeText   FieldType = "text"
	FieldTypeNumber FieldType = "number"
	FieldTypeDate   FieldType = "date"
	FieldTypeUUID   FieldType = "uuid"
)

// SortOrder represents the sort direction
type SortOrder string

const (
	SortOrderAsc  SortOrder = "asc"
	SortOrderDesc SortOrder = "desc"
)

// Filter represents a single filter condition
type Filter struct {
	Field    string
	Operator FilterOperator
	Value    string
}

// AllOperators returns all valid operators
func AllOperators() []FilterOperator {
	return []FilterOperator{
		OpEqual, OpNotEqual, OpLessThanEqual, OpGreaterThanEqual,
		OpContains, OpNotContains, OpStartsWith, OpEndsWith,
	}
}

// TextOperators returns operators valid for text fields
func TextOperators() []FilterOperator {
	return []FilterOperator{
		OpEqual, OpNotEqual, OpLessThanEqual, OpGreaterThanEqual,
		OpContains, OpNotContains, OpStartsWith, OpEndsWith,
	}
}

// ComparisonOperators returns operators valid for numbers and dates
func ComparisonOperators() []FilterOperator {
	return []FilterOperator{OpEqual, OpNotEqual, OpLessThanEqual, OpGreaterThanEqual}
}

// EqualityOperators returns operators valid for UUIDs
func EqualityOperators() []FilterOperator {
	return []FilterOperator{OpEqual, OpNotEqual}
}

// IsValidOperatorForFieldType checks if an operator is valid for a given field type
func IsValidOperatorForFieldType(operator FilterOperator, fieldType FieldType) bool {
	switch fieldType {
	case FieldTypeText:
		for _, op := range TextOperators() {
			if op == operator {
				return true
			}
		}
	case FieldTypeNumber, FieldTypeDate:
		for _, op := range ComparisonOperators() {
			if op == operator {
				return true
			}
		}
	case FieldTypeUUID:
		for _, op := range EqualityOperators() {
			if op == operator {
				return true
			}
		}
	}
	return false
}

// GetValidOperatorsForFieldType returns a human-readable string of valid operators
func GetValidOperatorsForFieldType(fieldType FieldType) string {
	switch fieldType {
	case FieldTypeText:
		return "==, !=, <=, >=, =@, !@, =^, =~"
	case FieldTypeNumber, FieldTypeDate:
		return "==, !=, <=, >="
	case FieldTypeUUID:
		return "==, !="
	default:
		return "no operators"
	}
}

// ParseFilter parses a filter string in the format "field operator value"
func ParseFilter(filterString string) (*Filter, error) {
	if filterString == "" {
		return nil, fmt.Errorf("filter string is empty")
	}

	// Try to match operators in order of length (longest first to avoid partial matches)
	// Order matters: we need to check <= before <, >= before >, etc.
	operators := []string{"==", "!=", "<=", ">=", "=@", "!@", "=^", "=~"}

	for _, op := range operators {
		if idx := strings.Index(filterString, op); idx > 0 {
			field := strings.TrimSpace(filterString[:idx])
			value := strings.TrimSpace(filterString[idx+len(op):])

			if field == "" {
				return nil, fmt.Errorf("field name is empty in filter: %s", filterString)
			}
			if value == "" {
				return nil, fmt.Errorf("value is empty in filter: %s", filterString)
			}

			return &Filter{
				Field:    field,
				Operator: FilterOperator(op),
				Value:    value,
			}, nil
		}
	}

	return nil, fmt.Errorf("no valid operator found in filter: %s (expected one of: ==, !=, <=, >=, =@, !@, =^, =~)", filterString)
}

// ValidateSortOrder validates that a sort order is valid
func ValidateSortOrder(sortOrder string) error {
	if sortOrder == "" {
		return nil // empty is allowed (will use default)
	}

	normalized := strings.ToLower(sortOrder)
	if normalized != string(SortOrderAsc) && normalized != string(SortOrderDesc) {
		return fmt.Errorf("invalid sort order '%s': must be 'asc' or 'desc'", sortOrder)
	}

	return nil
}

// NormalizeSortOrder normalizes and returns the sort order, defaulting to asc
func NormalizeSortOrder(sortOrder string) string {
	if sortOrder == "" {
		return string(SortOrderAsc)
	}
	return strings.ToUpper(sortOrder)
}
