package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// Area represents a physical area within a camp
type Area struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID    uuid.UUID      `gorm:"type:uuid;not null;index:idx_areas_tenant_id" json:"tenantId"`
	CampID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_areas_camp_id" json:"campId"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	Capacity    int            `gorm:"type:integer" json:"capacity"`
	Equipment   []string       `gorm:"type:jsonb;serializer:json" json:"equipment,omitempty"`
	Notes       string         `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

// TableName overrides the default table name
func (Area) TableName() string {
	return "areas"
}

// BeforeCreate sets the UUID before creating an area
func (a *Area) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain Area to an API Area representation
func (a *Area) ToAPI() api.Area {
	return api.Area{
		Meta: api.EntityMeta{
			Id:          a.ID,
			TenantId:    a.TenantID,
			CampId:      a.CampID,
			Name:        a.Name,
			Description: utils.StringToPtr(a.Description),
			CreatedAt:   a.CreatedAt,
			UpdatedAt:   a.UpdatedAt,
		},
		Spec: api.AreaSpec{
			Capacity:  utils.IntToPtr(a.Capacity),
			Equipment: &a.Equipment,
			Notes:     utils.StringToPtr(a.Notes),
		},
	}
}
