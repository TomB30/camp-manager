package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// Camper represents a camper registered for a camp session
type Camper struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID       uuid.UUID      `gorm:"type:uuid;not null;index:idx_campers_tenant_id" json:"tenantId"`
	CampID         uuid.UUID      `gorm:"type:uuid;not null;index:idx_campers_camp_id" json:"campId"`
	Name           string         `gorm:"type:varchar(255);not null" json:"name"`
	Description    string         `gorm:"type:text" json:"description,omitempty"`
	Birthday       time.Time      `gorm:"type:date;not null" json:"birthday"`
	Gender         string         `gorm:"type:varchar(50);not null" json:"gender"`
	SessionID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_campers_session_id" json:"sessionId"`
	HousingGroupID *uuid.UUID     `gorm:"type:uuid;index:idx_campers_housing_group_id" json:"housingGroupId,omitempty"`
	CreatedAt      time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt      time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`

	// Relationships (for preloading junction table data)
	GroupCampers []GroupCamper `gorm:"foreignKey:CamperID" json:"-"`
}

// GroupCamper represents the junction table between groups and campers
type GroupCamper struct {
	GroupID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"groupId"`
	CamperID  uuid.UUID `gorm:"type:uuid;primaryKey" json:"camperId"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// TableName overrides the default table name for GroupCamper
func (GroupCamper) TableName() string {
	return "group_campers"
}

// TableName overrides the default table name
func (Camper) TableName() string {
	return "campers"
}

// BeforeCreate sets the UUID before creating a camper
func (c *Camper) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain Camper to an API Camper representation
func (c *Camper) ToAPI() api.Camper {
	// Extract group IDs from junction table data
	var groupIDs []uuid.UUID
	for _, gc := range c.GroupCampers {
		groupIDs = append(groupIDs, gc.GroupID)
	}

	return api.Camper{
		Meta: api.EntityMeta{
			Id:          c.ID,
			TenantId:    c.TenantID,
			CampId:      c.CampID,
			Name:        c.Name,
			Description: utils.StringToPtr(c.Description),
			CreatedAt:   c.CreatedAt,
			UpdatedAt:   c.UpdatedAt,
		},
		Spec: api.CamperSpec{
			Birthday:       api.Birthday{Time: c.Birthday},
			Gender:         api.Gender(c.Gender),
			SessionId:      c.SessionID,
			HousingGroupId: c.HousingGroupID,
			GroupIds:       &groupIDs,
		},
	}
}
