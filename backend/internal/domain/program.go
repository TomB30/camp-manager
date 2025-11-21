package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/api"
	"github.com/tbechar/camp-manager-backend/pkg/utils"
	"gorm.io/gorm"
)

// Program represents a program that organizes activities and staff groups
type Program struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID    uuid.UUID      `gorm:"type:uuid;not null;index:idx_programs_tenant_id" json:"tenantId"`
	CampID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_programs_camp_id" json:"campId"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	ColorID     *uuid.UUID     `gorm:"type:uuid;index:idx_programs_color_id" json:"colorId,omitempty"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`

	// Many-to-many relationships (loaded separately)
	ActivityIDs     []uuid.UUID `gorm:"-" json:"activityIds,omitempty"`
	StaffGroupIDs   []uuid.UUID `gorm:"-" json:"staffGroupIds,omitempty"`
	LocationIDs     []uuid.UUID `gorm:"-" json:"locationIds,omitempty"`
}

// TableName overrides the default table name
func (Program) TableName() string {
	return "programs"
}

// BeforeCreate sets the UUID before creating a program
func (p *Program) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// ToAPI converts the domain Program to an API Program representation
func (p *Program) ToAPI() api.Program {
	return api.Program{
		Meta: api.EntityMeta{
			Id:          p.ID,
			TenantId:    p.TenantID,
			CampId:      p.CampID,
			Name:        p.Name,
			Description: utils.StringToPtr(p.Description),
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
		},
		Spec: api.ProgramSpec{
			ColorId:       p.ColorID,
			ActivityIds:   &p.ActivityIDs,
			StaffGroupIds: &p.StaffGroupIDs,
			LocationIds:   &p.LocationIDs,
		},
	}
}

