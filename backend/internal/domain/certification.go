package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

type Certification struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID    uuid.UUID      `gorm:"type:uuid;not null;index:idx_certifications_tenant_id" json:"tenantId"`
	CampID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_certifications_camp_id" json:"campId"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

// TableName overrides the default table name
func (Certification) TableName() string {
	return "certifications"
}

// BeforeCreate sets the UUID before creating a certification
func (c *Certification) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain Certification to an API Certification representation
func (c *Certification) ToAPI() api.Certification {
	return api.Certification{
		Meta: api.EntityMeta{
			Id:          c.ID,
			TenantId:    c.TenantID,
			CampId:      c.CampID,
			Name:        c.Name,
			Description: utils.StringToPtr(c.Description),
			CreatedAt:   c.CreatedAt,
			UpdatedAt:   c.UpdatedAt,
		},
	}
}
