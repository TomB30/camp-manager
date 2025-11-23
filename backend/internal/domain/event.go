package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// Event represents an event scheduled at the camp
type Event struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID    uuid.UUID `gorm:"type:uuid;not null;index:idx_events_tenant_id" json:"tenantId"`
	CampID      uuid.UUID `gorm:"type:uuid;not null;index:idx_events_camp_id" json:"campId"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description,omitempty"`

	// Spec fields
	StartDate  time.Time  `gorm:"type:timestamp;not null;index:idx_events_start_date" json:"startDate"`
	EndDate    time.Time  `gorm:"type:timestamp;not null;index:idx_events_end_date" json:"endDate"`
	LocationID *uuid.UUID `gorm:"type:uuid" json:"locationId,omitempty"`
	Capacity   *int       `gorm:"type:integer" json:"capacity,omitempty"`
	ColorID    *uuid.UUID `gorm:"type:uuid" json:"colorId,omitempty"`
	ProgramID  *uuid.UUID `gorm:"type:uuid;index:idx_events_program_id" json:"programId,omitempty"`
	ActivityID *uuid.UUID `gorm:"type:uuid;index:idx_events_activity_id" json:"activityId,omitempty"`

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

// TableName overrides the default table name
func (Event) TableName() string {
	return "events"
}

// BeforeCreate sets the UUID before creating an event
func (e *Event) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain Event to an API Event representation
func (e *Event) ToAPI() api.Event {
	spec := api.EventSpec{
		StartDate:          e.StartDate,
		EndDate:            e.EndDate,
		LocationId:         e.LocationID,
		Capacity:           e.Capacity,
		ColorId:            e.ColorID,
		ProgramId:          e.ProgramID,
		ActivityId:         e.ActivityID,
		RecurrenceId:       e.RecurrenceID,
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
		var rs []api.EventRequiredStaffPosition
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
