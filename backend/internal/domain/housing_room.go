package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// HousingRoom represents a housing room within a camp, optionally within an area
type HousingRoom struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID    uuid.UUID      `gorm:"type:uuid;not null;index:idx_housing_rooms_tenant_id" json:"tenantId"`
	CampID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_housing_rooms_camp_id" json:"campId"`
	AreaID      *uuid.UUID     `gorm:"type:uuid;index:idx_housing_rooms_area_id" json:"areaId,omitempty"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	Beds        int            `gorm:"type:integer;not null" json:"beds"`
	Bathroom    string         `gorm:"type:varchar(20)" json:"bathroom,omitempty"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`

	// Relations
	Area *Area `gorm:"foreignKey:AreaID;constraint:OnDelete:SET NULL" json:"-"`
}

// TableName overrides the default table name
func (HousingRoom) TableName() string {
	return "housing_rooms"
}

// BeforeCreate sets the UUID before creating a housing room
func (h *HousingRoom) BeforeCreate(tx *gorm.DB) error {
	if h.ID == uuid.Nil {
		h.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain HousingRoom to an API HousingRoom representation
func (h *HousingRoom) ToAPI() api.HousingRoom {
	return api.HousingRoom{
		Meta: api.EntityMeta{
			Id:          h.ID,
			TenantId:    h.TenantID,
			CampId:      h.CampID,
			Name:        h.Name,
			Description: utils.StringToPtr(h.Description),
			CreatedAt:   h.CreatedAt,
			UpdatedAt:   h.UpdatedAt,
		},
		Spec: api.HousingRoomSpec{
			AreaId:   h.AreaID,
			Beds:     h.Beds,
			Bathroom: (*api.HousingRoomSpecBathroom)(utils.StringToPtr(h.Bathroom)),
		},
	}
}
