package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// Group represents a group of campers, staff members, or nested groups
type Group struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_groups_tenant_id" json:"tenantId"`
	CampID        uuid.UUID      `gorm:"type:uuid;not null;index:idx_groups_camp_id" json:"campId"`
	Name          string         `gorm:"type:varchar(255);not null" json:"name"`
	Description   string         `gorm:"type:text" json:"description,omitempty"`
	SessionID     *uuid.UUID     `gorm:"type:uuid;index:idx_groups_session_id" json:"sessionId,omitempty"`
	HousingRoomID *uuid.UUID     `gorm:"type:uuid;index:idx_groups_housing_room_id" json:"housingRoomId,omitempty"`
	CreatedAt     time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`

	// Relationships (for preloading junction table data)
	GroupCampers      []GroupCamper      `gorm:"foreignKey:GroupID" json:"-"`
	GroupStaffMembers []GroupStaffMember `gorm:"foreignKey:GroupID" json:"-"`
	ChildGroups       []GroupGroup       `gorm:"foreignKey:ParentGroupID" json:"-"`
}

// GroupGroup represents the junction table for nested groups (parent-child relationships)
type GroupGroup struct {
	ParentGroupID uuid.UUID `gorm:"type:uuid;primaryKey" json:"parentGroupId"`
	ChildGroupID  uuid.UUID `gorm:"type:uuid;primaryKey" json:"childGroupId"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// TableName overrides the default table name for GroupGroup
func (GroupGroup) TableName() string {
	return "group_groups"
}

// TableName overrides the default table name
func (Group) TableName() string {
	return "groups"
}

// BeforeCreate sets the UUID before creating a group
func (g *Group) BeforeCreate(tx *gorm.DB) error {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain Group to an API Group representation
func (g *Group) ToAPI() api.Group {
	// Extract camper IDs from junction table data
	var camperIDs []uuid.UUID
	for _, gc := range g.GroupCampers {
		camperIDs = append(camperIDs, gc.CamperID)
	}

	// Extract staff member IDs from junction table data
	var staffIDs []uuid.UUID
	for _, gsm := range g.GroupStaffMembers {
		staffIDs = append(staffIDs, gsm.StaffMemberID)
	}

	// Extract child group IDs from junction table data
	var groupIDs []uuid.UUID
	for _, gg := range g.ChildGroups {
		groupIDs = append(groupIDs, gg.ChildGroupID)
	}

	// Only populate the arrays that have data (for mutual exclusivity)
	var camperIDsPtr *[]uuid.UUID
	var staffIDsPtr *[]uuid.UUID
	var groupIDsPtr *[]uuid.UUID

	if len(camperIDs) > 0 {
		camperIDsPtr = &camperIDs
	}
	if len(staffIDs) > 0 {
		staffIDsPtr = &staffIDs
	}
	if len(groupIDs) > 0 {
		groupIDsPtr = &groupIDs
	}

	return api.Group{
		Meta: api.EntityMeta{
			Id:          g.ID,
			TenantId:    g.TenantID,
			CampId:      g.CampID,
			Name:        g.Name,
			Description: utils.StringToPtr(g.Description),
			CreatedAt:   g.CreatedAt,
			UpdatedAt:   g.UpdatedAt,
		},
		Spec: api.GroupSpec{
			SessionId:     g.SessionID,
			HousingRoomId: g.HousingRoomID,
			CamperIds:     camperIDsPtr,
			StaffIds:      staffIDsPtr,
			GroupIds:      groupIDsPtr,
		},
	}
}
