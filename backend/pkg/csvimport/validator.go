package csvimport

import (
	"context"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/domain"
)

// EntityValidator defines the interface for validating CSV rows for a specific entity type
type EntityValidator interface {
	// ValidateRow validates a single CSV row and returns an error if invalid
	ValidateRow(ctx context.Context, row map[string]string, rowNumber int, tenantID, campID uuid.UUID) []domain.ValidationError

	// GetRequiredColumns returns the list of required column names
	GetRequiredColumns() []string

	// GetOptionalColumns returns the list of optional column names
	GetOptionalColumns() []string
}

// ValidateCSV validates all rows in the CSV using the provided validator
func ValidateCSV(ctx context.Context, rows []map[string]string, headers []string, validator EntityValidator, tenantID, campID uuid.UUID) []domain.ValidationError {
	var allErrors []domain.ValidationError

	// Validate headers
	if err := ValidateHeaders(headers, validator.GetRequiredColumns(), validator.GetOptionalColumns()); err != nil {
		allErrors = append(allErrors, domain.ValidationError{
			Row:     0,
			Field:   "headers",
			Message: err.Error(),
		})
		return allErrors
	}

	// Validate each row
	for i, row := range rows {
		rowNumber := i + 2 // +2 because: 1 for header, 1 for 1-based indexing
		rowErrors := validator.ValidateRow(ctx, row, rowNumber, tenantID, campID)
		allErrors = append(allErrors, rowErrors...)
	}

	return allErrors
}

