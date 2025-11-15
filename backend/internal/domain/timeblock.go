package domain

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// TimeBlock represents a time block with specific days of the week
type TimeBlock struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID    uuid.UUID      `gorm:"type:uuid;not null;index:idx_timeblocks_tenant_id" json:"tenantId"`
	CampID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_timeblocks_camp_id" json:"campId"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	StartTime   string         `gorm:"type:varchar(5);not null" json:"startTime"` // Format: HH:MM
	EndTime     string         `gorm:"type:varchar(5);not null" json:"endTime"`   // Format: HH:MM
	DaysOfWeek  DaysOfWeek     `gorm:"type:jsonb" json:"daysOfWeek"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

// DaysOfWeek is a custom type to handle the array of days
type DaysOfWeek []string

// Scan implements the Scanner interface for reading from the database
func (d *DaysOfWeek) Scan(value interface{}) error {
	if value == nil {
		*d = []string{}
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, d)
}

// Value implements the Valuer interface for writing to the database
func (d DaysOfWeek) Value() (driver.Value, error) {
	if len(d) == 0 {
		return nil, nil
	}
	return json.Marshal(d)
}

// TableName overrides the default table name
func (TimeBlock) TableName() string {
	return "time_blocks"
}

// BeforeCreate sets the UUID before creating a time block
func (t *TimeBlock) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain TimeBlock to an API TimeBlock representation
func (t *TimeBlock) ToAPI() api.TimeBlock {
	var daysOfWeek *[]api.TimeBlockSpecDaysOfWeek
	if len(t.DaysOfWeek) > 0 {
		days := make([]api.TimeBlockSpecDaysOfWeek, len(t.DaysOfWeek))
		for i, day := range t.DaysOfWeek {
			days[i] = api.TimeBlockSpecDaysOfWeek(day)
		}
		daysOfWeek = &days
	}

	return api.TimeBlock{
		Meta: api.EntityMeta{
			Id:          t.ID,
			TenantId:    t.TenantID,
			CampId:      t.CampID,
			Name:        t.Name,
			Description: utils.StringToPtr(t.Description),
			CreatedAt:   t.CreatedAt,
			UpdatedAt:   t.UpdatedAt,
		},
		Spec: api.TimeBlockSpec{
			StartTime:  t.StartTime,
			EndTime:    t.EndTime,
			DaysOfWeek: daysOfWeek,
		},
	}
}

