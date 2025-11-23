package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"gorm.io/gorm"
)

// EventsRepository handles database operations for events
type EventsRepository struct {
	db *database.Database
}

// NewEventsRepository creates a new events repository
func NewEventsRepository(db *database.Database) *EventsRepository {
	return &EventsRepository{db: db}
}

// eventFields defines the filterable fields and their types for events (API field names)
var eventFields = map[string]domain.FieldType{
	"name":      domain.FieldTypeText,
	"startDate": domain.FieldTypeDate,
	"endDate":   domain.FieldTypeDate,
}

// eventFieldToColumn maps API field names to database column names
var eventFieldToColumn = map[string]string{
	"name":      "name",
	"startDate": "start_date",
	"endDate":   "end_date",
}

// eventSortableFields defines the sortable fields for events (API field names)
var eventSortableFields = []string{"name", "startDate", "endDate"}

// List retrieves a paginated list of events filtered by tenant and camp
func (r *EventsRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.Event, int64, error) {
	var events []domain.Event
	var total int64

	// Build the base query with tenant and camp filtering
	query := ScopedQuery(r.db, ctx, tenantID, campID)

	// Add search filter if provided
	query = ApplySearchFilter(query, search, "name", "description")

	// Parse and apply filters
	filters, err := ParseFilterStrings(filterStrings)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to parse filters: %w", err)
	}

	query, err = ApplyFilters(query, filters, eventFields, eventFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply filters: %w", err)
	}

	// Get total count
	if err := query.Model(&domain.Event{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count events: %w", err)
	}

	// Apply sorting
	query, err = ApplySorting(query, sortBy, sortOrder, eventSortableFields, eventFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply sorting: %w", err)
	}

	// If no sorting was specified, use default (most recent first)
	if sortBy == nil || *sortBy == "" {
		query = query.Order("start_date DESC, created_at DESC")
	}

	// Get paginated results
	if err := query.
		Limit(limit).
		Offset(offset).
		Find(&events).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list events: %w", err)
	}

	return events, total, nil
}

// GetByID retrieves a single event by ID with tenant and camp validation
func (r *EventsRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Event, error) {
	var event domain.Event

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		First(&event).Error

	if err != nil {
		return nil, err
	}

	return &event, nil
}

// Create inserts a new event
func (r *EventsRepository) Create(ctx context.Context, event *domain.Event) error {
	if err := r.validateAndSerializeJSONB(event); err != nil {
		return fmt.Errorf("failed to validate/serialize JSONB fields: %w", err)
	}

	if err := r.db.WithContext(ctx).Create(event).Error; err != nil {
		return fmt.Errorf("failed to create event: %w", err)
	}
	return nil
}

// CreateBatch inserts multiple events in a single transaction
func (r *EventsRepository) CreateBatch(ctx context.Context, events []*domain.Event) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, event := range events {
			if err := r.validateAndSerializeJSONB(event); err != nil {
				return fmt.Errorf("failed to validate/serialize JSONB fields: %w", err)
			}
			if err := tx.Create(event).Error; err != nil {
				return fmt.Errorf("failed to create event: %w", err)
			}
		}
		return nil
	})
}

// Update updates an existing event with tenant and camp validation
func (r *EventsRepository) Update(ctx context.Context, tenantID, campID uuid.UUID, event *domain.Event) error {
	if err := r.validateAndSerializeJSONB(event); err != nil {
		return fmt.Errorf("failed to validate/serialize JSONB fields: %w", err)
	}

	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Model(&domain.Event{}).
		Where("id = ?", event.ID).
		Updates(map[string]interface{}{
			"name":                 event.Name,
			"description":          event.Description,
			"start_date":           event.StartDate,
			"end_date":             event.EndDate,
			"location_id":          event.LocationID,
			"capacity":             event.Capacity,
			"color_id":             event.ColorID,
			"program_id":           event.ProgramID,
			"activity_id":          event.ActivityID,
			"group_ids":            event.GroupIDs,
			"exclude_staff_ids":    event.ExcludeStaffIDs,
			"exclude_camper_ids":   event.ExcludeCamperIDs,
			"required_staff":       event.RequiredStaff,
			"recurrence_id":        event.RecurrenceID,
			"is_recurrence_parent": event.IsRecurrenceParent,
			"recurrence_rule":      event.RecurrenceRule,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to update event: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("event not found or unauthorized")
	}

	return nil
}

// Delete soft deletes an event by ID with tenant and camp validation
func (r *EventsRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id = ?", id).
		Delete(&domain.Event{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete event: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("event not found or unauthorized")
	}

	return nil
}

// GetByRecurrenceID retrieves all events in a recurrence series
func (r *EventsRepository) GetByRecurrenceID(ctx context.Context, tenantID, campID uuid.UUID, recurrenceID uuid.UUID) ([]domain.Event, error) {
	var events []domain.Event

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("recurrence_id = ?", recurrenceID).
		Order("start_date ASC").
		Find(&events).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get events by recurrence ID: %w", err)
	}

	return events, nil
}

// DeleteByRecurrenceID soft deletes entire recurrence series
func (r *EventsRepository) DeleteByRecurrenceID(ctx context.Context, tenantID, campID uuid.UUID, recurrenceID uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("recurrence_id = ?", recurrenceID).
		Delete(&domain.Event{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete events by recurrence ID: %w", result.Error)
	}

	return nil
}

// DeleteByRecurrenceIDAfterDate soft deletes events in series on or after given date
func (r *EventsRepository) DeleteByRecurrenceIDAfterDate(ctx context.Context, tenantID, campID uuid.UUID, recurrenceID uuid.UUID, afterDate time.Time) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("recurrence_id = ? AND start_date >= ?", recurrenceID, afterDate).
		Delete(&domain.Event{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete events after date: %w", result.Error)
	}

	return nil
}

// GetByActivityID retrieves all events created from an activity template
func (r *EventsRepository) GetByActivityID(ctx context.Context, tenantID, campID, activityID uuid.UUID) ([]domain.Event, error) {
	var events []domain.Event

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("activity_id = ?", activityID).
		Find(&events).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get events by activity ID: %w", err)
	}

	return events, nil
}

// DeleteByActivityID soft deletes all events created from an activity
func (r *EventsRepository) DeleteByActivityID(ctx context.Context, tenantID, campID, activityID uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("activity_id = ?", activityID).
		Delete(&domain.Event{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete events by activity ID: %w", result.Error)
	}

	return nil
}

// GetByProgramID retrieves all events for a program
func (r *EventsRepository) GetByProgramID(ctx context.Context, tenantID, campID, programID uuid.UUID) ([]domain.Event, error) {
	var events []domain.Event

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("program_id = ?", programID).
		Find(&events).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get events by program ID: %w", err)
	}

	return events, nil
}

// DeleteByProgramID soft deletes all events for a program
func (r *EventsRepository) DeleteByProgramID(ctx context.Context, tenantID, campID, programID uuid.UUID) error {
	result := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("program_id = ?", programID).
		Delete(&domain.Event{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete events by program ID: %w", result.Error)
	}

	return nil
}

// validateAndSerializeJSONB validates and ensures JSONB fields are properly serialized
func (r *EventsRepository) validateAndSerializeJSONB(event *domain.Event) error {
	// Ensure empty slices/objects are properly serialized as null or empty JSON
	if len(event.GroupIDs) == 0 {
		event.GroupIDs = nil
	}
	if len(event.ExcludeStaffIDs) == 0 {
		event.ExcludeStaffIDs = nil
	}
	if len(event.ExcludeCamperIDs) == 0 {
		event.ExcludeCamperIDs = nil
	}
	if len(event.RequiredStaff) == 0 {
		event.RequiredStaff = nil
	}
	if len(event.RecurrenceRule) == 0 {
		event.RecurrenceRule = nil
	}

	// Validate that JSONB fields are valid JSON
	jsonFields := []struct {
		name string
		data json.RawMessage
	}{
		{"groupIds", event.GroupIDs},
		{"excludeStaffIds", event.ExcludeStaffIDs},
		{"excludeCamperIds", event.ExcludeCamperIDs},
		{"requiredStaff", event.RequiredStaff},
		{"recurrenceRule", event.RecurrenceRule},
	}

	for _, field := range jsonFields {
		if len(field.data) > 0 && !json.Valid(field.data) {
			return fmt.Errorf("invalid JSON in %s field", field.name)
		}
	}

	return nil
}
