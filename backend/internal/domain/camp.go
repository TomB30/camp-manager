package domain

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"gorm.io/gorm"
)

// Camp represents a camp within a tenant
type Camp struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID    uuid.UUID `gorm:"type:uuid;not null;index:idx_camps_tenant_id" json:"tenantId"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description,omitempty"`

	// Spec fields
	StartDate      time.Time `gorm:"type:date;not null" json:"startDate"`
	EndDate        time.Time `gorm:"type:date;not null" json:"endDate"`
	DailyStartTime string    `gorm:"type:varchar(5);not null" json:"dailyStartTime"` // HH:MM format
	DailyEndTime   string    `gorm:"type:varchar(5);not null" json:"dailyEndTime"`   // HH:MM format
	Address        Address   `gorm:"type:jsonb" json:"address,omitempty"`
	ContactInfo    Contact   `gorm:"type:jsonb" json:"contactInfo,omitempty"`
	LogoURL        string    `gorm:"type:varchar(500)" json:"logoUrl,omitempty"`
	Timezone       string    `gorm:"type:varchar(100);default:'America/New_York'" json:"timezone,omitempty"`
	Settings       []byte    `gorm:"type:jsonb" json:"settings,omitempty"`

	CreatedAt time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`

	// Relations
	Tenant      Tenant       `gorm:"foreignKey:TenantID;constraint:OnDelete:CASCADE" json:"-"`
	AccessRules []AccessRule `gorm:"foreignKey:ScopeID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName overrides the default table name
func (Camp) TableName() string {
	return "camps"
}

// BeforeCreate sets the UUID before creating a camp
func (c *Camp) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain Camp to an API Camp representation
func (c *Camp) ToAPI() api.Camp {
	var address *struct {
		City    *string `json:"city,omitempty"`
		Country *string `json:"country,omitempty"`
		State   *string `json:"state,omitempty"`
		Street  *string `json:"street,omitempty"`
		ZipCode *string `json:"zipCode,omitempty"`
	}

	// Convert Address if not empty
	if c.Address != (Address{}) {
		address = &struct {
			City    *string `json:"city,omitempty"`
			Country *string `json:"country,omitempty"`
			State   *string `json:"state,omitempty"`
			Street  *string `json:"street,omitempty"`
			ZipCode *string `json:"zipCode,omitempty"`
		}{
			Street:  StringToPtr(c.Address.Street),
			City:    StringToPtr(c.Address.City),
			State:   StringToPtr(c.Address.State),
			ZipCode: StringToPtr(c.Address.ZipCode),
			Country: StringToPtr(c.Address.Country),
		}
	}

	var contactInfo *struct {
		Email   *openapi_types.Email `json:"email,omitempty"`
		Phone   *string              `json:"phone,omitempty"`
		Website *string              `json:"website,omitempty"`
	}

	// Convert ContactInfo if not empty
	if c.ContactInfo != (Contact{}) {
		contactInfo = &struct {
			Email   *openapi_types.Email `json:"email,omitempty"`
			Phone   *string              `json:"phone,omitempty"`
			Website *string              `json:"website,omitempty"`
		}{
			Phone:   StringToPtr(c.ContactInfo.Phone),
			Email:   (*openapi_types.Email)(StringToPtr(c.ContactInfo.Email)),
			Website: StringToPtr(c.ContactInfo.Website),
		}
	}

	return api.Camp{
		Meta: struct {
			CreatedAt   time.Time `json:"createdAt"`
			Description *string   `json:"description,omitempty"`
			Id          uuid.UUID `json:"id"`
			Name        string    `json:"name"`
			TenantId    uuid.UUID `json:"tenantId"`
			UpdatedAt   time.Time `json:"updatedAt"`
		}{
			Id:          c.ID,
			TenantId:    c.TenantID,
			Name:        c.Name,
			Description: StringToPtr(c.Description),
			CreatedAt:   c.CreatedAt,
			UpdatedAt:   c.UpdatedAt,
		},
		Spec: api.CampSpec{
			StartDate:      openapi_types.Date{Time: c.StartDate},
			EndDate:        openapi_types.Date{Time: c.EndDate},
			DailyStartTime: c.DailyStartTime,
			DailyEndTime:   c.DailyEndTime,
			Address:        address,
			ContactInfo:    contactInfo,
			LogoUrl:        StringToPtr(c.LogoURL),
		},
	}
}

// StringToPtr converts a string to a pointer, returning nil if empty
func StringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// Address represents a physical address (stored as JSONB)
type Address struct {
	Street  string `json:"street,omitempty"`
	City    string `json:"city,omitempty"`
	State   string `json:"state,omitempty"`
	ZipCode string `json:"zipCode,omitempty"`
	Country string `json:"country,omitempty"`
}

// Contact represents contact information (stored as JSONB)
type Contact struct {
	Phone   string `json:"phone,omitempty"`
	Email   string `json:"email,omitempty"`
	Website string `json:"website,omitempty"`
}

// Scan implements the sql.Scanner interface for Address
func (a *Address) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, a)
}

// Value implements the driver.Valuer interface for Address
func (a Address) Value() (driver.Value, error) {
	if a == (Address{}) {
		return nil, nil
	}
	return json.Marshal(a)
}

// Scan implements the sql.Scanner interface for Contact
func (c *Contact) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, c)
}

// Value implements the driver.Valuer interface for Contact
func (c Contact) Value() (driver.Value, error) {
	if c == (Contact{}) {
		return nil, nil
	}
	return json.Marshal(c)
}
