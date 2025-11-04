package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Tenant represents the top-level organization entity
// Can represent a single camp or multi-camp organization
type Tenant struct {
	ID               uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name             string         `gorm:"type:varchar(255);not null;index" json:"name"`
	Description      string         `gorm:"type:text" json:"description,omitempty"`
	Slug             string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"slug"`
	SubscriptionTier string         `gorm:"type:varchar(50);not null;default:'free'" json:"subscriptionTier"`
	MaxCamps         int            `gorm:"type:int;not null;default:1" json:"maxCamps"`
	Settings         []byte         `gorm:"type:jsonb" json:"settings,omitempty"`
	CreatedAt        time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt        time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`

	// Relations
	Camps []Camp `gorm:"foreignKey:TenantID;constraint:OnDelete:CASCADE" json:"-"`
	Users []User `gorm:"foreignKey:TenantID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName overrides the default table name
func (Tenant) TableName() string {
	return "tenants"
}

// BeforeCreate sets the UUID before creating a tenant
func (t *Tenant) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

