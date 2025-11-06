package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// Location represents a specific location within a camp, optionally within an area
type Location struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID    uuid.UUID      `gorm:"type:uuid;not null;index:idx_locations_tenant_id" json:"tenantId"`
	CampID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_locations_camp_id" json:"campId"`
	AreaID      *uuid.UUID     `gorm:"type:uuid;index:idx_locations_area_id" json:"areaId,omitempty"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	Capacity    int            `gorm:"type:integer" json:"capacity"`
	Equipment   []string       `gorm:"type:jsonb;serializer:json" json:"equipment,omitempty"`
	Notes       string         `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`

	// Relations
	Area *Area `gorm:"foreignKey:AreaID;constraint:OnDelete:SET NULL" json:"-"`
}

// TableName overrides the default table name
func (Location) TableName() string {
	return "locations"
}

// BeforeCreate sets the UUID before creating a location
func (l *Location) BeforeCreate(tx *gorm.DB) error {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain Location to an API Location representation
func (l *Location) ToAPI() api.Location {
	return api.Location{
		Meta: api.EntityMeta{
			Id:          l.ID,
			TenantId:    l.TenantID,
			CampId:      l.CampID,
			Name:        l.Name,
			Description: utils.StringToPtr(l.Description),
			CreatedAt:   l.CreatedAt,
			UpdatedAt:   l.UpdatedAt,
		},
		Spec: api.LocationSpec{
			AreaId:    l.AreaID,
			Capacity:  utils.IntToPtr(l.Capacity),
			Equipment: &l.Equipment,
			Notes:     utils.StringToPtr(l.Notes),
		},
	}
}
