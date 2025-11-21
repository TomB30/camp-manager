package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// Activity represents an activity that belongs to a program
type Activity struct {
	ID                uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID          uuid.UUID      `gorm:"type:uuid;not null;index:idx_activities_tenant_id" json:"tenantId"`
	CampID            uuid.UUID      `gorm:"type:uuid;not null;index:idx_activities_camp_id" json:"campId"`
	Name              string         `gorm:"type:varchar(255);not null" json:"name"`
	Description       string         `gorm:"type:text" json:"description,omitempty"`
	ProgramID         uuid.UUID      `gorm:"type:uuid;not null;index:idx_activities_program_id" json:"programId"`
	DefaultLocationID *uuid.UUID     `gorm:"type:uuid;index:idx_activities_default_location_id" json:"defaultLocationId,omitempty"`
	Duration          *int           `gorm:"type:integer" json:"duration,omitempty"`
	FixedTime         json.RawMessage `gorm:"type:jsonb" json:"fixedTime,omitempty"`
	TimeBlockID       *uuid.UUID     `gorm:"type:uuid;index:idx_activities_time_block_id" json:"timeBlockId,omitempty"`
	RequiredStaff     json.RawMessage `gorm:"type:jsonb" json:"requiredStaff,omitempty"`
	ActivityConflicts json.RawMessage `gorm:"type:jsonb" json:"activityConflicts,omitempty"`
	CreatedAt         time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt         time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

// TableName overrides the default table name
func (Activity) TableName() string {
	return "activities"
}

// BeforeCreate sets the UUID before creating an activity
func (a *Activity) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain Activity to an API Activity representation
func (a *Activity) ToAPI() api.Activity {
	spec := api.ActivitySpec{
		ProgramId:         a.ProgramID,
		DefaultLocationId: a.DefaultLocationID,
		Duration:          a.Duration,
		TimeBlockId:       a.TimeBlockID,
	}

	// Unmarshal FixedTime if present
	if len(a.FixedTime) > 0 && string(a.FixedTime) != "null" {
		var ft api.ActivityFixedTime
		if err := json.Unmarshal(a.FixedTime, &ft); err == nil {
			spec.FixedTime = &ft
		}
	}

	// Unmarshal RequiredStaff if present
	if len(a.RequiredStaff) > 0 && string(a.RequiredStaff) != "null" {
		var rs []api.ActivityRequiredStaffPosition
		if err := json.Unmarshal(a.RequiredStaff, &rs); err == nil {
			spec.RequiredStaff = &rs
		}
	}

	// Unmarshal ActivityConflicts if present
	if len(a.ActivityConflicts) > 0 && string(a.ActivityConflicts) != "null" {
		var ac api.ActivityConflicts
		if err := json.Unmarshal(a.ActivityConflicts, &ac); err == nil {
			spec.ActivityConflicts = &ac
		}
	}

	return api.Activity{
		Meta: api.EntityMeta{
			Id:          a.ID,
			TenantId:    a.TenantID,
			CampId:      a.CampID,
			Name:        a.Name,
			Description: utils.StringToPtr(a.Description),
			CreatedAt:   a.CreatedAt,
			UpdatedAt:   a.UpdatedAt,
		},
		Spec: spec,
	}
}

