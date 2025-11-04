package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a user account with authentication
type User struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_users_tenant_id" json:"tenantId"`
	Email         string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash  string         `gorm:"type:varchar(255);not null" json:"-"` // Never expose in JSON
	FirstName     string         `gorm:"type:varchar(100)" json:"firstName,omitempty"`
	LastName      string         `gorm:"type:varchar(100)" json:"lastName,omitempty"`
	Role          string         `gorm:"type:varchar(50);not null;default:'staff'" json:"role"` // tenant_admin, camp_admin, staff, parent
	IsActive      bool           `gorm:"default:true" json:"isActive"`
	EmailVerified bool           `gorm:"default:false" json:"emailVerified"`
	LastLoginAt   *time.Time     `gorm:"type:timestamp" json:"lastLoginAt,omitempty"`
	CreatedAt     time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`

	// Relations
	Tenant       Tenant        `gorm:"foreignKey:TenantID;constraint:OnDelete:CASCADE" json:"-"`
	AccessRules  []AccessRule  `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"accessRules,omitempty"`
	RefreshTokens []RefreshToken `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName overrides the default table name
func (User) TableName() string {
	return "users"
}

// BeforeCreate sets the UUID before creating a user
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// RefreshToken represents a JWT refresh token
type RefreshToken struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID  `gorm:"type:uuid;not null;index:idx_refresh_tokens_user_id" json:"userId"`
	TokenHash string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"-"`
	ExpiresAt time.Time  `gorm:"type:timestamp;not null" json:"expiresAt"`
	Revoked   bool       `gorm:"default:false;index:idx_refresh_tokens_active" json:"revoked"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"createdAt"`

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName overrides the default table name
func (RefreshToken) TableName() string {
	return "refresh_tokens"
}

// BeforeCreate sets the UUID before creating a refresh token
func (rt *RefreshToken) BeforeCreate(tx *gorm.DB) error {
	if rt.ID == uuid.Nil {
		rt.ID = uuid.New()
	}
	return nil
}

// IsValid checks if the refresh token is still valid
func (rt *RefreshToken) IsValid() bool {
	return !rt.Revoked && time.Now().Before(rt.ExpiresAt)
}

