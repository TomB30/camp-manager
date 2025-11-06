package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// Color represents a color used for events and visual organization
type Color struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID    uuid.UUID      `gorm:"type:uuid;not null;index:idx_colors_tenant_id" json:"tenantId"`
	CampID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_colors_camp_id" json:"campId"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	HexValue    string         `gorm:"type:varchar(7);not null" json:"hexValue"`
	Default     bool           `gorm:"column:default;default:false" json:"default"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

// TableName overrides the default table name
func (Color) TableName() string {
	return "colors"
}

// BeforeCreate sets the UUID before creating a color
func (c *Color) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain Color to an API Color representation
func (c *Color) ToAPI() api.Color {
	return api.Color{
		Meta: api.EntityMeta{
			Id:          c.ID,
			TenantId:    c.TenantID,
			CampId:      c.CampID,
			Name:        c.Name,
			Description: utils.StringToPtr(c.Description),
			CreatedAt:   c.CreatedAt,
			UpdatedAt:   c.UpdatedAt,
		},
		Spec: api.ColorSpec{
			HexValue: c.HexValue,
			Default:  utils.BoolToPtr(c.Default),
		},
	}
}
