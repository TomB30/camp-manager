package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// Role represents a staff role within a camp
type Role struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID    uuid.UUID      `gorm:"type:uuid;not null;index:idx_roles_tenant_id" json:"tenantId"`
	CampID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_roles_camp_id" json:"campId"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

// TableName overrides the default table name
func (Role) TableName() string {
	return "roles"
}

// BeforeCreate sets the UUID before creating a role
func (r *Role) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain Role to an API Role representation
func (r *Role) ToAPI() api.Role {
	return api.Role{
		Meta: api.EntityMeta{
			Id:          r.ID,
			TenantId:    r.TenantID,
			CampId:      r.CampID,
			Name:        r.Name,
			Description: utils.StringToPtr(r.Description),
			CreatedAt:   r.CreatedAt,
			UpdatedAt:   r.UpdatedAt,
		},
		Spec: api.RoleSpec{},
	}
}

