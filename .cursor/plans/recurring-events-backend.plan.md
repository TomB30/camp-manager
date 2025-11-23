<!-- c4976d5f-a402-4d0e-bedb-e5641d0634de 0285601c-f389-4b3b-955f-c0c7167180ec -->
# Backend Implementation Plan: Recurring Events

## Database Schema

### Add Events Table to Existing Migration

Add to `backend/internal/database/migrations/up/001_init_tenants_camps_users.up.sql` at the end (before comments section):

```sql
-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Spec fields
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    capacity INTEGER,
    color_id UUID REFERENCES colors(id) ON DELETE SET NULL,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    
    -- Group assignments (JSONB arrays)
    group_ids JSONB,
    exclude_staff_ids JSONB,
    exclude_camper_ids JSONB,
    
    -- Required staff (JSONB array of objects)
    required_staff JSONB,
    
    -- Recurrence fields
    recurrence_id UUID,
    is_recurrence_parent BOOLEAN DEFAULT false,
    recurrence_rule JSONB,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_camp_id ON events(camp_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);
CREATE INDEX IF NOT EXISTS idx_events_location_id ON events(location_id);
CREATE INDEX IF NOT EXISTS idx_events_program_id ON events(program_id);
CREATE INDEX IF NOT EXISTS idx_events_activity_id ON events(activity_id);
CREATE INDEX IF NOT EXISTS idx_events_recurrence_id ON events(recurrence_id);
CREATE INDEX IF NOT EXISTS idx_events_date_range ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON events(deleted_at);
CREATE INDEX IF NOT EXISTS idx_events_tenant_id_camp_id ON events(tenant_id, camp_id);

-- Trigger for events
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE events IS 'Events scheduled at the camp, optionally linked to activities and programs';
COMMENT ON COLUMN events.capacity IS 'Optional maximum capacity for the event';
COMMENT ON COLUMN events.activity_id IS 'Optional activity template this event was created from';
COMMENT ON COLUMN events.program_id IS 'Optional program this event belongs to';
COMMENT ON COLUMN events.recurrence_id IS 'Links events in a recurring series together';
COMMENT ON COLUMN events.is_recurrence_parent IS 'True for the first event in a recurring series';
COMMENT ON COLUMN events.recurrence_rule IS 'Original recurrence rule (only stored in parent event)';
```

## Domain Model

### Create `backend/internal/domain/event.go`

Following conventions from other entities:

```go
package domain

import (
    "encoding/json"
    "time"
    
    "github.com/google/uuid"
    "github.com/tbechar/camp-manager-backend/internal/api"
    "github.com/tbechar/camp-manager-backend/pkg/utils"
    "gorm.io/gorm"
)

type Event struct {
    ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    TenantID    uuid.UUID      `gorm:"type:uuid;not null;index:idx_events_tenant_id" json:"tenantId"`
    CampID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_events_camp_id" json:"campId"`
    Name        string         `gorm:"type:varchar(255);not null" json:"name"`
    Description string         `gorm:"type:text" json:"description,omitempty"`
    
    // Spec fields
    StartDate   time.Time      `gorm:"type:timestamp;not null;index:idx_events_start_date" json:"startDate"`
    EndDate     time.Time      `gorm:"type:timestamp;not null;index:idx_events_end_date" json:"endDate"`
    LocationID  *uuid.UUID     `gorm:"type:uuid" json:"locationId,omitempty"`
    Capacity    *int           `gorm:"type:integer" json:"capacity,omitempty"`
    ColorID     *uuid.UUID     `gorm:"type:uuid" json:"colorId,omitempty"`
    ProgramID   *uuid.UUID     `gorm:"type:uuid;index:idx_events_program_id" json:"programId,omitempty"`
    ActivityID  *uuid.UUID     `gorm:"type:uuid;index:idx_events_activity_id" json:"activityId,omitempty"`
    
    // JSONB fields
    GroupIDs         json.RawMessage `gorm:"type:jsonb" json:"groupIds,omitempty"`
    ExcludeStaffIDs  json.RawMessage `gorm:"type:jsonb" json:"excludeStaffIds,omitempty"`
    ExcludeCamperIDs json.RawMessage `gorm:"type:jsonb" json:"excludeCamperIds,omitempty"`
    RequiredStaff    json.RawMessage `gorm:"type:jsonb" json:"requiredStaff,omitempty"`
    
    // Recurrence fields
    RecurrenceID       *uuid.UUID      `gorm:"type:uuid;index:idx_events_recurrence_id" json:"recurrenceId,omitempty"`
    IsRecurrenceParent bool            `gorm:"default:false" json:"isRecurrenceParent"`
    RecurrenceRule     json.RawMessage `gorm:"type:jsonb" json:"recurrenceRule,omitempty"`
    
    CreatedAt time.Time      `gorm:"autoCreateTime" json:"createdAt"`
    UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Event) TableName() string {
    return "events"
}

func (e *Event) BeforeCreate(tx *gorm.DB) error {
    if e.ID == uuid.Nil {
        e.ID = uuid.New()
    }
    return nil
}

func (e *Event) ToAPI() api.Event {
    spec := api.EventSpec{
        StartDate:    e.StartDate,
        EndDate:      e.EndDate,
        LocationId:   e.LocationID,
        Capacity:     e.Capacity,
        ColorId:      e.ColorID,
        ProgramId:    e.ProgramID,
        ActivityId:   e.ActivityID,
        RecurrenceId: e.RecurrenceID,
        IsRecurrenceParent: &e.IsRecurrenceParent,
    }
    
    // Unmarshal JSONB arrays
    if len(e.GroupIDs) > 0 && string(e.GroupIDs) != "null" {
        var groupIds []uuid.UUID
        if err := json.Unmarshal(e.GroupIDs, &groupIds); err == nil {
            spec.GroupIds = &groupIds
        }
    }
    
    if len(e.ExcludeStaffIDs) > 0 && string(e.ExcludeStaffIDs) != "null" {
        var excludeIds []uuid.UUID
        if err := json.Unmarshal(e.ExcludeStaffIDs, &excludeIds); err == nil {
            spec.ExcludeStaffIds = &excludeIds
        }
    }
    
    if len(e.ExcludeCamperIDs) > 0 && string(e.ExcludeCamperIDs) != "null" {
        var excludeIds []uuid.UUID
        if err := json.Unmarshal(e.ExcludeCamperIDs, &excludeIds); err == nil {
            spec.ExcludeCamperIds = &excludeIds
        }
    }
    
    if len(e.RequiredStaff) > 0 && string(e.RequiredStaff) != "null" {
        var rs []api.EventSpecRequiredStaff
        if err := json.Unmarshal(e.RequiredStaff, &rs); err == nil {
            spec.RequiredStaff = &rs
        }
    }
    
    if len(e.RecurrenceRule) > 0 && string(e.RecurrenceRule) != "null" {
        var rule api.RecurrenceRule
        if err := json.Unmarshal(e.RecurrenceRule, &rule); err == nil {
            spec.RecurrenceRule = &rule
        }
    }
    
    return api.Event{
        Meta: api.EntityMeta{
            Id:          e.ID,
            TenantId:    e.TenantID,
            CampId:      e.CampID,
            Name:        e.Name,
            Description: utils.StringToPtr(e.Description),
            CreatedAt:   e.CreatedAt,
            UpdatedAt:   e.UpdatedAt,
        },
        Spec: spec,
    }
}
```

## Repository Layer

### Create `backend/internal/repository/events.go`

Following the exact conventions from activities.go and programs.go:

```go
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

type EventsRepository struct {
    db *database.Database
}

func NewEventsRepository(db *database.Database) *EventsRepository {
    return &EventsRepository{db: db}
}

// Field definitions for filtering and sorting
var eventFields = map[string]domain.FieldType{
    "name":      domain.FieldTypeText,
    "startDate": domain.FieldTypeDate,
    "endDate":   domain.FieldTypeDate,
}

var eventFieldToColumn = map[string]string{
    "name":      "name",
    "startDate": "start_date",
    "endDate":   "end_date",
}

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
            "name":                  event.Name,
            "description":           event.Description,
            "start_date":            event.StartDate,
            "end_date":              event.EndDate,
            "location_id":           event.LocationID,
            "capacity":              event.Capacity,
            "color_id":              event.ColorID,
            "program_id":            event.ProgramID,
            "activity_id":           event.ActivityID,
            "group_ids":             event.GroupIDs,
            "exclude_staff_ids":     event.ExcludeStaffIDs,
            "exclude_camper_ids":    event.ExcludeCamperIDs,
            "required_staff":        event.RequiredStaff,
            "recurrence_id":         event.RecurrenceID,
            "is_recurrence_parent":  event.IsRecurrenceParent,
            "recurrence_rule":       event.RecurrenceRule,
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
```

### Update Service Interfaces

Add `EventsRepository` to `backend/internal/service/interfaces.go`:

```go
type EventsRepository interface {
    List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.Event, int64, error)
    GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Event, error)
    Create(ctx context.Context, event *domain.Event) error
    CreateBatch(ctx context.Context, events []*domain.Event) error
    Update(ctx context.Context, tenantID, campID uuid.UUID, event *domain.Event) error
    Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error
    GetByRecurrenceID(ctx context.Context, tenantID, campID, recurrenceID uuid.UUID) ([]domain.Event, error)
    DeleteByRecurrenceID(ctx context.Context, tenantID, campID, recurrenceID uuid.UUID) error
    DeleteByRecurrenceIDAfterDate(ctx context.Context, tenantID, campID, recurrenceID uuid.UUID, afterDate time.Time) error
    GetByActivityID(ctx context.Context, tenantID, campID, activityID uuid.UUID) ([]domain.Event, error)
    DeleteByActivityID(ctx context.Context, tenantID, campID, activityID uuid.UUID) error
    GetByProgramID(ctx context.Context, tenantID, campID, programID uuid.UUID) ([]domain.Event, error)
    DeleteByProgramID(ctx context.Context, tenantID, campID, programID uuid.UUID) error
}
```

## Service Layer

### Create `backend/internal/service/events.go`

Following conventions from activities.go (validation, error handling, etc.):

```go
package service

import (
    "context"
    "encoding/json"
    "errors"
    "fmt"
    "time"
    
    "github.com/google/uuid"
    "github.com/tbechar/camp-manager-backend/internal/api"
    "github.com/tbechar/camp-manager-backend/internal/domain"
    pkgerrors "github.com/tbechar/camp-manager-backend/pkg/errors"
    "github.com/tbechar/camp-manager-backend/pkg/utils"
    "gorm.io/gorm"
)

type EventsService interface {
    List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.EventsListResponse, error)
    GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Event, error)
    Create(ctx context.Context, tenantID, campID uuid.UUID, req *api.EventCreationRequest) (*api.Event, error)
    CreateRecurringSeries(ctx context.Context, tenantID, campID uuid.UUID, req *api.EventCreationRequest, rule *api.RecurrenceRule, startDate, endDate time.Time) ([]api.Event, error)
    Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.EventUpdateRequest, updateScope string) (*api.Event, error)
    Delete(ctx context.Context, tenantID, campID, id uuid.UUID, deleteScope string) error
}

type eventsService struct {
    repo               EventsRepository
    activitiesRepo     ActivitiesRepository
    programsRepo       ProgramsRepository
    locationsRepo      LocationsRepository
    groupsRepo         GroupsRepository
}

func NewEventsService(repo EventsRepository, activitiesRepo ActivitiesRepository, programsRepo ProgramsRepository, locationsRepo LocationsRepository, groupsRepo GroupsRepository) EventsService {
    return &eventsService{
        repo:           repo,
        activitiesRepo: activitiesRepo,
        programsRepo:   programsRepo,
        locationsRepo:  locationsRepo,
        groupsRepo:     groupsRepo,
    }
}

func (s *eventsService) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.EventsListResponse, error) {
    events, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search, filterStrings, sortBy, sortOrder)
    if err != nil {
        return nil, pkgerrors.BadRequest("Failed to list events", err)
    }
    
    // Convert domain events to API events
    apiEvents := make([]api.Event, len(events))
    for i, event := range events {
        apiEvents[i] = event.ToAPI()
    }
    
    return &api.EventsListResponse{
        Items:  apiEvents,
        Limit:  limit,
        Offset: offset,
        Total:  int(total),
    }, nil
}

func (s *eventsService) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*api.Event, error) {
    event, err := s.repo.GetByID(ctx, tenantID, campID, id)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, pkgerrors.NotFound("Event not found", err)
        }
        return nil, pkgerrors.InternalServerError("Failed to get event", err)
    }
    
    apiEvent := event.ToAPI()
    return &apiEvent, nil
}

func (s *eventsService) Create(ctx context.Context, tenantID, campID uuid.UUID, req *api.EventCreationRequest) (*api.Event, error) {
    // Validate dates
    if req.Spec.EndDate.Before(req.Spec.StartDate) {
        return nil, pkgerrors.BadRequest("End date must be after start date", nil)
    }
    
    // Validate activity exists if provided
    if req.Spec.ActivityId != nil {
        if _, err := s.activitiesRepo.GetByID(ctx, tenantID, campID, *req.Spec.ActivityId); err != nil {
            if errors.Is(err, gorm.ErrRecordNotFound) {
                return nil, pkgerrors.BadRequest("Activity not found", err)
            }
            return nil, pkgerrors.InternalServerError("Failed to validate activity", err)
        }
    }
    
    // Validate program exists if provided
    if req.Spec.ProgramId != nil {
        if _, err := s.programsRepo.GetByID(ctx, tenantID, campID, *req.Spec.ProgramId); err != nil {
            if errors.Is(err, gorm.ErrRecordNotFound) {
                return nil, pkgerrors.BadRequest("Program not found", err)
            }
            return nil, pkgerrors.InternalServerError("Failed to validate program", err)
        }
    }
    
    // Validate location exists if provided
    if req.Spec.LocationId != nil {
        if _, err := s.locationsRepo.GetByID(ctx, tenantID, campID, *req.Spec.LocationId); err != nil {
            if errors.Is(err, gorm.ErrRecordNotFound) {
                return nil, pkgerrors.BadRequest("Location not found", err)
            }
            return nil, pkgerrors.InternalServerError("Failed to validate location", err)
        }
    }
    
    // Serialize JSONB fields
    groupIDsJSON, _ := json.Marshal(req.Spec.GroupIds)
    excludeStaffIDsJSON, _ := json.Marshal(req.Spec.ExcludeStaffIds)
    excludeCamperIDsJSON, _ := json.Marshal(req.Spec.ExcludeCamperIds)
    requiredStaffJSON, _ := json.Marshal(req.Spec.RequiredStaff)
    recurrenceRuleJSON, _ := json.Marshal(req.Spec.RecurrenceRule)
    
    // Create domain event
    event := &domain.Event{
        TenantID:           tenantID,
        CampID:             campID,
        Name:               req.Meta.Name,
        Description:        utils.PtrToString(req.Meta.Description),
        StartDate:          req.Spec.StartDate,
        EndDate:            req.Spec.EndDate,
        LocationID:         req.Spec.LocationId,
        Capacity:           req.Spec.Capacity,
        ColorID:            req.Spec.ColorId,
        ProgramID:          req.Spec.ProgramId,
        ActivityID:         req.Spec.ActivityId,
        GroupIDs:           groupIDsJSON,
        ExcludeStaffIDs:    excludeStaffIDsJSON,
        ExcludeCamperIDs:   excludeCamperIDsJSON,
        RequiredStaff:      requiredStaffJSON,
        RecurrenceID:       req.Spec.RecurrenceId,
        IsRecurrenceParent: req.Spec.IsRecurrenceParent != nil && *req.Spec.IsRecurrenceParent,
        RecurrenceRule:     recurrenceRuleJSON,
    }
    
    if err := s.repo.Create(ctx, event); err != nil {
        return nil, pkgerrors.InternalServerError("Failed to create event", err)
    }
    
    apiEvent := event.ToAPI()
    return &apiEvent, nil
}

// CreateRecurringSeries creates a series of recurring events
func (s *eventsService) CreateRecurringSeries(ctx context.Context, tenantID, campID uuid.UUID, req *api.EventCreationRequest, rule *api.RecurrenceRule, startDate, endDate time.Time) ([]api.Event, error) {
    // Generate recurrence ID for the series
    recurrenceID := uuid.New()
    duration := endDate.Sub(startDate)
    
    // Generate occurrence dates (use frontend logic or implement here)
    occurrenceDates := generateRecurrenceDates(startDate, rule)
    
    // Create events batch
    events := make([]*domain.Event, len(occurrenceDates))
    for i, occStart := range occurrenceDates {
        occEnd := occStart.Add(duration)
        
        // Serialize JSONB fields
        groupIDsJSON, _ := json.Marshal(req.Spec.GroupIds)
        excludeStaffIDsJSON, _ := json.Marshal(req.Spec.ExcludeStaffIds)
        excludeCamperIDsJSON, _ := json.Marshal(req.Spec.ExcludeCamperIds)
        requiredStaffJSON, _ := json.Marshal(req.Spec.RequiredStaff)
        
        var recurrenceRuleJSON json.RawMessage
        if i == 0 {
            // Only parent stores the rule
            recurrenceRuleJSON, _ = json.Marshal(rule)
        }
        
        events[i] = &domain.Event{
            TenantID:           tenantID,
            CampID:             campID,
            Name:               req.Meta.Name,
            Description:        utils.PtrToString(req.Meta.Description),
            StartDate:          occStart,
            EndDate:            occEnd,
            LocationID:         req.Spec.LocationId,
            Capacity:           req.Spec.Capacity,
            ColorID:            req.Spec.ColorId,
            ProgramID:          req.Spec.ProgramId,
            ActivityID:         req.Spec.ActivityId,
            GroupIDs:           groupIDsJSON,
            ExcludeStaffIDs:    excludeStaffIDsJSON,
            ExcludeCamperIDs:   excludeCamperIDsJSON,
            RequiredStaff:      requiredStaffJSON,
            RecurrenceID:       &recurrenceID,
            IsRecurrenceParent: i == 0,
            RecurrenceRule:     recurrenceRuleJSON,
        }
    }
    
    // Save batch
    if err := s.repo.CreateBatch(ctx, events); err != nil {
        return nil, pkgerrors.InternalServerError("Failed to create recurring events", err)
    }
    
    // Convert to API format
    apiEvents := make([]api.Event, len(events))
    for i, event := range events {
        apiEvents[i] = event.ToAPI()
    }
    
    return apiEvents, nil
}

// Update updates event(s) based on scope
func (s *eventsService) Update(ctx context.Context, tenantID, campID, id uuid.UUID, req *api.EventUpdateRequest, updateScope string) (*api.Event, error) {
    // Get existing event
    existingEvent, err := s.repo.GetByID(ctx, tenantID, campID, id)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, pkgerrors.NotFound("Event not found", err)
        }
        return nil, pkgerrors.InternalServerError("Failed to get event", err)
    }
    
    // Handle different scopes
    switch updateScope {
    case "single":
        return s.updateSingleEvent(ctx, tenantID, campID, existingEvent, req)
    case "all":
        return s.updateAllInSeries(ctx, tenantID, campID, existingEvent, req)
    case "future":
        return s.updateFutureInSeries(ctx, tenantID, campID, existingEvent, req)
    default:
        return nil, pkgerrors.BadRequest("Invalid update scope", nil)
    }
}

// Delete deletes event(s) based on scope
func (s *eventsService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID, deleteScope string) error {
    // Get existing event
    existingEvent, err := s.repo.GetByID(ctx, tenantID, campID, id)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return pkgerrors.NotFound("Event not found", err)
        }
        return pkgerrors.InternalServerError("Failed to get event", err)
    }
    
    // Handle different scopes
    switch deleteScope {
    case "single":
        return s.repo.Delete(ctx, tenantID, campID, id)
    case "all":
        if existingEvent.RecurrenceID != nil {
            return s.repo.DeleteByRecurrenceID(ctx, tenantID, campID, *existingEvent.RecurrenceID)
        }
        return s.repo.Delete(ctx, tenantID, campID, id)
    case "future":
        if existingEvent.RecurrenceID != nil {
            return s.repo.DeleteByRecurrenceIDAfterDate(ctx, tenantID, campID, *existingEvent.RecurrenceID, existingEvent.StartDate)
        }
        return s.repo.Delete(ctx, tenantID, campID, id)
    default:
        return pkgerrors.BadRequest("Invalid delete scope", nil)
    }
}

// Helper methods for update scopes (implementation details)
func (s *eventsService) updateSingleEvent(ctx context.Context, tenantID, campID uuid.UUID, existing *domain.Event, req *api.EventUpdateRequest) (*api.Event, error) {
    // Break recurrence link if not parent
    if !existing.IsRecurrenceParent {
        existing.RecurrenceID = nil
    }
    
    // Apply updates
    existing.Name = req.Meta.Name
    existing.Description = utils.PtrToString(req.Meta.Description)
    existing.StartDate = req.Spec.StartDate
    existing.EndDate = req.Spec.EndDate
    // ... update other fields
    
    if err := s.repo.Update(ctx, tenantID, campID, existing); err != nil {
        return nil, pkgerrors.InternalServerError("Failed to update event", err)
    }
    
    apiEvent := existing.ToAPI()
    return &apiEvent, nil
}

// Similar implementations for updateAllInSeries and updateFutureInSeries...
```

### Update `backend/internal/service/activities.go`

Add cascade deletion logic:

```go
func (s *activitiesService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID, force bool) error {
    // Check if activity exists
    _, err := s.repo.GetByID(ctx, tenantID, campID, id)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return pkgerrors.NotFound("Activity not found", err)
        }
        return pkgerrors.InternalServerError("Failed to get activity", err)
    }
    
    // Check if any events reference this activity
    events, err := s.eventsRepo.GetByActivityID(ctx, tenantID, campID, id)
    if err != nil {
        return pkgerrors.InternalServerError("Failed to check events", err)
    }
    
    if len(events) > 0 {
        if !force {
            return pkgerrors.Conflict(fmt.Sprintf("Cannot delete activity: %d event(s) are using this activity. Use force=true to cascade delete", len(events)), nil)
        }
        
        // Cascade delete all events
        if err := s.eventsRepo.DeleteByActivityID(ctx, tenantID, campID, id); err != nil {
            return pkgerrors.InternalServerError("Failed to cascade delete events", err)
        }
    }
    
    // Delete the activity
    if err := s.repo.Delete(ctx, tenantID, campID, id); err != nil {
        return pkgerrors.InternalServerError("Failed to delete activity", err)
    }
    
    return nil
}
```

### Update `backend/internal/service/programs.go`

Add cascade deletion for programs:

```go
func (s *programsService) Delete(ctx context.Context, tenantID, campID, id uuid.UUID, force bool) error {
    // Similar pattern: check events, check activities, cascade if force=true
    // Delete events by program ID
    // Delete activities by program ID
    // Delete program
}
```

## Handler Layer

### Update `backend/internal/handler/events.go`

Following exact conventions from activities.go:

```go
package handler

import (
    "encoding/json"
    "net/http"
    "time"
    
    "github.com/google/uuid"
    "github.com/tbechar/camp-manager-backend/internal/api"
    "github.com/tbechar/camp-manager-backend/internal/service"
    pkgcontext "github.com/tbechar/camp-manager-backend/pkg/context"
    "github.com/tbechar/camp-manager-backend/pkg/errors"
)

type EventsHandler struct {
    service service.EventsService
}

func NewEventsHandler(service service.EventsService) *EventsHandler {
    return &EventsHandler{service: service}
}

func (h *EventsHandler) ListEvents(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.ListEventsParams) {
    // Extract tenant ID from context
    tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
    if err != nil {
        errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
        return
    }
    
    tenantID, err := uuid.Parse(tenantIDStr)
    if err != nil {
        errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
        return
    }
    
    campUUID := uuid.UUID(campId)
    
    // Set default pagination values
    limit := 50
    offset := 0
    
    if params.Limit != nil {
        limit = *params.Limit
    }
    if params.Offset != nil {
        offset = *params.Offset
    }
    
    // Extract filter and sort parameters
    filterStrings := []string{}
    if params.FilterBy != nil {
        filterStrings = *params.FilterBy
    }
    
    sortOrder := "asc"
    if params.SortOrder != nil {
        sortOrder = string(*params.SortOrder)
    }
    
    sortBy := ""
    if params.SortBy != nil {
        sortBy = string(*params.SortBy)
    }
    
    // Call service
    response, err := h.service.List(r.Context(), tenantID, campUUID, limit, offset, params.Search, filterStrings, &sortBy, sortOrder)
    if err != nil {
        errors.WriteError(w, err)
        return
    }
    
    // Write response
    if err := errors.WriteJSON(w, http.StatusOK, response); err != nil {
        errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
        return
    }
}

func (h *EventsHandler) CreateEvent(w http.ResponseWriter, r *http.Request, campId api.CampId) {
    // Extract tenant ID
    tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
    if err != nil {
        errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
        return
    }
    
    tenantID, err := uuid.Parse(tenantIDStr)
    if err != nil {
        errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
        return
    }
    
    campUUID := uuid.UUID(campId)
    
    // Parse request body
    var req api.EventCreationRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        errors.WriteError(w, errors.BadRequest("Invalid request body", err))
        return
    }
    
    // Check if this is a recurring event (based on recurrenceRule in spec)
    if req.Spec.RecurrenceRule != nil {
        // Create recurring series
        events, err := h.service.CreateRecurringSeries(
            r.Context(),
            tenantID,
            campUUID,
            &req,
            req.Spec.RecurrenceRule,
            req.Spec.StartDate,
            req.Spec.EndDate,
        )
        if err != nil {
            errors.WriteError(w, err)
            return
        }
        
        // Return first event or all events
        if err := errors.WriteJSON(w, http.StatusCreated, events); err != nil {
            errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
            return
        }
        return
    }
    
    // Create single event
    event, err := h.service.Create(r.Context(), tenantID, campUUID, &req)
    if err != nil {
        errors.WriteError(w, err)
        return
    }
    
    if err := errors.WriteJSON(w, http.StatusCreated, event); err != nil {
        errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
        return
    }
}

func (h *EventsHandler) GetEventById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
    tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
    if err != nil {
        errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
        return
    }
    
    tenantID, err := uuid.Parse(tenantIDStr)
    if err != nil {
        errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
        return
    }
    
    campUUID := uuid.UUID(campId)
    eventID, err := uuid.Parse(id)
    if err != nil {
        errors.WriteError(w, errors.BadRequest("Invalid event ID", err))
        return
    }
    
    event, err := h.service.GetByID(r.Context(), tenantID, campUUID, eventID)
    if err != nil {
        errors.WriteError(w, err)
        return
    }
    
    if err := errors.WriteJSON(w, http.StatusOK, event); err != nil {
        errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
        return
    }
}

func (h *EventsHandler) UpdateEventById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
    tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
    if err != nil {
        errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
        return
    }
    
    tenantID, err := uuid.Parse(tenantIDStr)
    if err != nil {
        errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
        return
    }
    
    campUUID := uuid.UUID(campId)
    eventID, err := uuid.Parse(id)
    if err != nil {
        errors.WriteError(w, errors.BadRequest("Invalid event ID", err))
        return
    }
    
    // Get updateScope from query parameter
    updateScope := r.URL.Query().Get("updateScope")
    if updateScope == "" {
        updateScope = "single"
    }
    
    var req api.EventUpdateRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        errors.WriteError(w, errors.BadRequest("Invalid request body", err))
        return
    }
    
    event, err := h.service.Update(r.Context(), tenantID, campUUID, eventID, &req, updateScope)
    if err != nil {
        errors.WriteError(w, err)
        return
    }
    
    if err := errors.WriteJSON(w, http.StatusOK, event); err != nil {
        errors.WriteError(w, errors.InternalServerError("Failed to write response", err))
        return
    }
}

func (h *EventsHandler) DeleteEventById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
    tenantIDStr, err := pkgcontext.ExtractTenantID(r.Context())
    if err != nil {
        errors.WriteError(w, errors.Unauthorized("Tenant ID not found in context", err))
        return
    }
    
    tenantID, err := uuid.Parse(tenantIDStr)
    if err != nil {
        errors.WriteError(w, errors.BadRequest("Invalid tenant ID", err))
        return
    }
    
    campUUID := uuid.UUID(campId)
    eventID, err := uuid.Parse(id)
    if err != nil {
        errors.WriteError(w, errors.BadRequest("Invalid event ID", err))
        return
    }
    
    // Get deleteScope from query parameter
    deleteScope := r.URL.Query().Get("deleteScope")
    if deleteScope == "" {
        deleteScope = "single"
    }
    
    if err := h.service.Delete(r.Context(), tenantID, campUUID, eventID, deleteScope); err != nil {
        errors.WriteError(w, err)
        return
    }
    
    w.WriteHeader(http.StatusNoContent)
}
```

### Update Activities Handler for force parameter

In `backend/internal/handler/activities.go`, update DeleteActivityById:

```go
func (h *ActivitiesHandler) DeleteActivityById(w http.ResponseWriter, r *http.Request, campId api.CampId, id api.Id) {
    // ... existing tenant/camp/id extraction ...
    
    // Get force parameter
    force := r.URL.Query().Get("force") == "true"
    
    if err := h.service.Delete(r.Context(), tenantID, campUUID, activityID, force); err != nil {
        errors.WriteError(w, err)
        return
    }
    
    w.WriteHeader(http.StatusNoContent)
}
```

## API Schema Updates

Update `api/schemas/EventSpec.yaml` to make capacity optional and add recurrenceRule (already shown in earlier plan).

Create parameter files:

- `api/parameters/update_scope.yaml`
- `api/parameters/delete_scope.yaml`  
- `api/parameters/force.yaml`

Update path files to include new parameters.

## Implementation Order

1. Add events table SQL to existing migration
2. Create domain model (event.go)
3. Create repository (events.go) with all methods
4. Add EventsRepository to service interfaces
5. Create events service
6. Update activities service with force delete
7. Update programs service with cascade logic
8. Implement events handler
9. Update activities/programs handlers for force parameter
10. Update OpenAPI specs (schemas, parameters, paths)
11. Wire up in main.go
12. Test all operations

### To-dos

- [ ] Create database migration for events table with recurrence support
- [ ] Create Event domain model in backend/internal/domain/event.go
- [ ] Implement basic CRUD methods in events repository
- [ ] Add recurrence-specific repository methods
- [ ] Implement basic event service methods (single events)
- [ ] Implement recurring event series creation and management
- [ ] Add update/delete scope handling (single, future, all)
- [ ] Implement HTTP handlers for all event endpoints
- [ ] Add activity deletion validation and cascade logic
- [ ] Update OpenAPI specs with recurrence rule schema and query params
- [ ] Update frontend event service with scope parameters
- [ ] Add update/delete scope selection dialogs in frontend