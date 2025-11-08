package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// StaffMember represents a staff member working at the camp
type StaffMember struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID       uuid.UUID      `gorm:"type:uuid;not null;index:idx_staff_members_tenant_id" json:"tenantId"`
	CampID         uuid.UUID      `gorm:"type:uuid;not null;index:idx_staff_members_camp_id" json:"campId"`
	Name           string         `gorm:"type:varchar(255);not null" json:"name"`
	Description    string         `gorm:"type:text" json:"description,omitempty"`
	Birthday       time.Time      `gorm:"type:date;not null" json:"birthday"`
	Gender         string         `gorm:"type:varchar(50);not null" json:"gender"`
	RoleID         uuid.UUID      `gorm:"type:uuid;not null;index:idx_staff_members_role_id" json:"roleId"`
	Phone          string         `gorm:"type:varchar(50)" json:"phone,omitempty"`
	HousingGroupID *uuid.UUID     `gorm:"type:uuid;index:idx_staff_members_housing_group_id" json:"housingGroupId,omitempty"`
	CreatedAt      time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt      time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`

	// Relationships (for preloading junction table data)
	GroupStaffMembers   []GroupStaffMember   `gorm:"foreignKey:StaffMemberID" json:"-"`
	StaffCertifications []StaffCertification `gorm:"foreignKey:StaffMemberID" json:"-"`
}

// GroupStaffMember represents the junction table between groups and staff members
type GroupStaffMember struct {
	GroupID       uuid.UUID `gorm:"type:uuid;primaryKey" json:"groupId"`
	StaffMemberID uuid.UUID `gorm:"type:uuid;primaryKey" json:"staffMemberId"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// TableName overrides the default table name for GroupStaffMember
func (GroupStaffMember) TableName() string {
	return "group_staff_members"
}

// StaffCertification represents the junction table between staff members and certifications
type StaffCertification struct {
	StaffMemberID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"staffMemberId"`
	CertificationID uuid.UUID `gorm:"type:uuid;primaryKey" json:"certificationId"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// TableName overrides the default table name for StaffCertification
func (StaffCertification) TableName() string {
	return "staff_member_certifications"
}

// TableName overrides the default table name
func (StaffMember) TableName() string {
	return "staff_members"
}

// BeforeCreate sets the UUID before creating a staff member
func (s *StaffMember) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain StaffMember to an API StaffMember representation
func (s *StaffMember) ToAPI() api.StaffMember {
	// Extract group IDs from junction table data
	var groupIDs []uuid.UUID
	for _, gsm := range s.GroupStaffMembers {
		groupIDs = append(groupIDs, gsm.GroupID)
	}

	// Extract certification IDs from junction table data
	var certificationIDs []uuid.UUID
	for _, sc := range s.StaffCertifications {
		certificationIDs = append(certificationIDs, sc.CertificationID)
	}

	return api.StaffMember{
		Meta: api.EntityMeta{
			Id:          s.ID,
			TenantId:    s.TenantID,
			CampId:      s.CampID,
			Name:        s.Name,
			Description: utils.StringToPtr(s.Description),
			CreatedAt:   s.CreatedAt,
			UpdatedAt:   s.UpdatedAt,
		},
		Spec: api.StaffMemberSpec{
			Birthday:         api.Birthday{Time: s.Birthday},
			Gender:           api.Gender(s.Gender),
			RoleId:           s.RoleID,
			Phone:            utils.StringToPtr(s.Phone),
			HousingGroupId:   s.HousingGroupID,
			GroupIds:         &groupIDs,
			CertificationIds: &certificationIDs,
		},
	}
}
