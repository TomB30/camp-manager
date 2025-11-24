package entities

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
)

// SessionsRepository interface for session lookups
type SessionsRepository interface {
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Session, error)
	GetByName(ctx context.Context, tenantID, campID uuid.UUID, name string) (*domain.Session, error)
}

// GroupsRepository interface for group lookups
type GroupsRepository interface {
	GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Group, error)
	GetByName(ctx context.Context, tenantID, campID uuid.UUID, name string) (*domain.Group, error)
	GetByIDs(ctx context.Context, tenantID, campID uuid.UUID, ids []uuid.UUID) ([]domain.Group, error)
}

// CamperImportValidator validates camper CSV rows
type CamperImportValidator struct {
	sessionsRepo SessionsRepository
	groupsRepo   GroupsRepository
}

// NewCamperImportValidator creates a new camper validator
func NewCamperImportValidator(sessionsRepo SessionsRepository, groupsRepo GroupsRepository) *CamperImportValidator {
	return &CamperImportValidator{
		sessionsRepo: sessionsRepo,
		groupsRepo:   groupsRepo,
	}
}

// GetRequiredColumns returns required columns for camper CSV
func (v *CamperImportValidator) GetRequiredColumns() []string {
	return []string{"name", "birthday", "gender", "sessionName"}
}

// GetOptionalColumns returns optional columns for camper CSV
func (v *CamperImportValidator) GetOptionalColumns() []string {
	return []string{"description", "groupNames"}
}

// ValidateRow validates a single camper CSV row
func (v *CamperImportValidator) ValidateRow(ctx context.Context, row map[string]string, rowNumber int, tenantID, campID uuid.UUID) []domain.ValidationError {
	var errors []domain.ValidationError

	// Validate name
	name := strings.TrimSpace(row["name"])
	if name == "" {
		errors = append(errors, domain.ValidationError{
			Row:     rowNumber,
			Field:   "name",
			Message: "name is required and cannot be empty",
		})
	}

	// Validate birthday
	birthdayStr := strings.TrimSpace(row["birthday"])
	if birthdayStr == "" {
		errors = append(errors, domain.ValidationError{
			Row:     rowNumber,
			Field:   "birthday",
			Message: "birthday is required",
		})
	} else {
		// Try multiple date formats
		var birthday time.Time
		var err error
		formats := []string{"2006-01-02", "01/02/2006", "1/2/2006", "2006/01/02"}
		parsed := false
		for _, format := range formats {
			birthday, err = time.Parse(format, birthdayStr)
			if err == nil {
				parsed = true
				break
			}
		}
		if !parsed {
			errors = append(errors, domain.ValidationError{
				Row:     rowNumber,
				Field:   "birthday",
				Message: fmt.Sprintf("invalid birthday format: %s (expected YYYY-MM-DD)", birthdayStr),
			})
		} else {
			// Validate birthday is not in the future
			if birthday.After(time.Now()) {
				errors = append(errors, domain.ValidationError{
					Row:     rowNumber,
					Field:   "birthday",
					Message: "birthday cannot be in the future",
				})
			}
		}
	}

	// Validate gender
	gender := strings.TrimSpace(row["gender"])
	if gender == "" {
		errors = append(errors, domain.ValidationError{
			Row:     rowNumber,
			Field:   "gender",
			Message: "gender is required",
		})
	} else {
		validGenders := map[string]bool{
			"male":       true,
			"female":     true,
			"non-binary": true,
			"other":      true,
		}
		if !validGenders[strings.ToLower(gender)] {
			errors = append(errors, domain.ValidationError{
				Row:     rowNumber,
				Field:   "gender",
				Message: fmt.Sprintf("invalid gender: %s (must be one of: male, female, non-binary, other)", gender),
			})
		}
	}

	// Validate session
	sessionName := strings.TrimSpace(row["sessionName"])
	if sessionName == "" {
		errors = append(errors, domain.ValidationError{
			Row:     rowNumber,
			Field:   "sessionName",
			Message: "sessionName is required",
		})
	} else {
		// Check if session exists
		_, err := v.sessionsRepo.GetByName(ctx, tenantID, campID, sessionName)
		if err != nil {
			errors = append(errors, domain.ValidationError{
				Row:     rowNumber,
				Field:   "sessionName",
				Message: fmt.Sprintf("session not found: %s", sessionName),
			})
		}
	}

	// Validate groups (optional)
	groupNamesStr := strings.TrimSpace(row["groupNames"])
	if groupNamesStr != "" {
		groupNames := strings.Split(groupNamesStr, ",")
		for _, groupName := range groupNames {
			groupName = strings.TrimSpace(groupName)
			if groupName != "" {
				_, err := v.groupsRepo.GetByName(ctx, tenantID, campID, groupName)
				if err != nil {
					errors = append(errors, domain.ValidationError{
						Row:     rowNumber,
						Field:   "groupNames",
						Message: fmt.Sprintf("group not found: %s", groupName),
					})
				}
			}
		}
	}

	return errors
}

// CamperImportMapper maps camper CSV rows to creation requests
type CamperImportMapper struct {
	sessionsRepo SessionsRepository
	groupsRepo   GroupsRepository
}

// NewCamperImportMapper creates a new camper mapper
func NewCamperImportMapper(sessionsRepo SessionsRepository, groupsRepo GroupsRepository) *CamperImportMapper {
	return &CamperImportMapper{
		sessionsRepo: sessionsRepo,
		groupsRepo:   groupsRepo,
	}
}

// MapRowToEntity converts a CSV row to a camper domain object
func (m *CamperImportMapper) MapRowToEntity(ctx context.Context, row map[string]string, tenantID, campID uuid.UUID) (interface{}, error) {
	// Parse birthday
	birthdayStr := strings.TrimSpace(row["birthday"])
	var birthday time.Time
	var err error
	formats := []string{"2006-01-02", "01/02/2006", "1/2/2006", "2006/01/02"}
	for _, format := range formats {
		birthday, err = time.Parse(format, birthdayStr)
		if err == nil {
			break
		}
	}
	if err != nil {
		return nil, fmt.Errorf("invalid birthday format: %s", birthdayStr)
	}

	// Look up session
	sessionName := strings.TrimSpace(row["sessionName"])
	session, err := m.sessionsRepo.GetByName(ctx, tenantID, campID, sessionName)
	if err != nil {
		return nil, fmt.Errorf("session not found: %s", sessionName)
	}

	// Look up groups (optional)
	var groupIDs []uuid.UUID
	groupNamesStr := strings.TrimSpace(row["groupNames"])
	if groupNamesStr != "" {
		groupNames := strings.Split(groupNamesStr, ",")
		for _, groupName := range groupNames {
			groupName = strings.TrimSpace(groupName)
			if groupName != "" {
				group, err := m.groupsRepo.GetByName(ctx, tenantID, campID, groupName)
				if err != nil {
					return nil, fmt.Errorf("group not found: %s", groupName)
				}
				groupIDs = append(groupIDs, group.ID)
			}
		}
	}

	// Create the API creation request
	req := &api.CamperCreationRequest{
		Meta: api.EntityCreationRequestMeta{
			Name:        strings.TrimSpace(row["name"]),
			Description: utils.StringToPtr(strings.TrimSpace(row["description"])),
		},
		Spec: api.CamperMutationSpec{
			Birthday:  api.Birthday{Time: birthday},
			Gender:    api.Gender(strings.ToLower(strings.TrimSpace(row["gender"]))),
			SessionId: session.ID,
			GroupIds:  &groupIDs,
		},
	}

	return req, nil
}

