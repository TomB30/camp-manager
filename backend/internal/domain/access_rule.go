package domain

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AccessRule represents a user's access to a specific scope (system, tenant, or camp)
// This maps to the user_camps relationship in the architecture plan
// and the accessRules array in the OpenAPI User schema
type AccessRule struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"-"`
	UserID    uuid.UUID  `gorm:"type:uuid;not null;index:idx_access_rules_user_id" json:"-"`
	Role      string     `gorm:"type:varchar(50);not null" json:"role"`                           // admin, program-admin, viewer
	ScopeType string     `gorm:"type:varchar(20);not null" json:"scopeType"`                      // system, tenant, camp
	ScopeID   *uuid.UUID `gorm:"type:uuid;index:idx_access_rules_scope" json:"scopeId,omitempty"` // null for system scope

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName overrides the default table name
func (AccessRule) TableName() string {
	return "access_rules"
}

// BeforeCreate sets the UUID before creating an access rule
func (ar *AccessRule) BeforeCreate(tx *gorm.DB) error {
	if ar.ID == uuid.Nil {
		ar.ID = uuid.New()
	}
	return nil
}

// IsSystemScope returns true if this is a system-level access rule
func (ar *AccessRule) IsSystemScope() bool {
	return ar.ScopeType == "system" && ar.ScopeID == nil
}

// IsTenantScope returns true if this is a tenant-level access rule
func (ar *AccessRule) IsTenantScope() bool {
	return ar.ScopeType == "tenant" && ar.ScopeID != nil
}

// IsCampScope returns true if this is a camp-level access rule
func (ar *AccessRule) IsCampScope() bool {
	return ar.ScopeType == "camp" && ar.ScopeID != nil
}
