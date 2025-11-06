package domain

import (
	"time"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// Session represents a time period within a camp
type Session struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID    uuid.UUID      `gorm:"type:uuid;not null;index:idx_sessions_tenant_id" json:"tenantId"`
	CampID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_sessions_camp_id" json:"campId"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	StartDate   time.Time      `gorm:"type:date;not null" json:"startDate"`
	EndDate     time.Time      `gorm:"type:date;not null" json:"endDate"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

// TableName overrides the default table name
func (Session) TableName() string {
	return "sessions"
}

// BeforeCreate sets the UUID before creating a session
func (s *Session) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain Session to an API Session representation
func (s *Session) ToAPI() api.Session {
	return api.Session{
		Meta: api.EntityMeta{
			Id:          s.ID,
			TenantId:    s.TenantID,
			CampId:      s.CampID,
			Name:        s.Name,
			Description: utils.StringToPtr(s.Description),
			CreatedAt:   s.CreatedAt,
			UpdatedAt:   s.UpdatedAt,
		},
		Spec: api.SessionSpec{
			StartDate: openapi_types.Date{Time: s.StartDate},
			EndDate:   openapi_types.Date{Time: s.EndDate},
		},
	}
}
