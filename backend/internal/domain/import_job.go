package domain

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ImportJobStatus represents the status of an import job
type ImportJobStatus string

const (
	ImportJobStatusPending    ImportJobStatus = "pending"
	ImportJobStatusValidating ImportJobStatus = "validating"
	ImportJobStatusValidated  ImportJobStatus = "validated"
	ImportJobStatusImporting  ImportJobStatus = "importing"
	ImportJobStatusCompleted  ImportJobStatus = "completed"
	ImportJobStatusFailed     ImportJobStatus = "failed"
)

// ImportMode represents the mode of import operation
type ImportMode string

const (
	ImportModeCreate ImportMode = "create"
	ImportModeUpsert ImportMode = "upsert"
)

// ImportEntityType represents the type of entity being imported
type ImportEntityType string

const (
	ImportEntityTypeCampers      ImportEntityType = "campers"
	ImportEntityTypeStaffMembers ImportEntityType = "staff_members"
	ImportEntityTypeGroups       ImportEntityType = "groups"
)

// ValidationError represents a single validation error for a row
type ValidationError struct {
	Row     int    `json:"row"`
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationErrors is a slice of validation errors with custom database serialization
type ValidationErrors []ValidationError

// Scan implements sql.Scanner for database reads
func (v *ValidationErrors) Scan(value interface{}) error {
	if value == nil {
		*v = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	var errors []ValidationError
	if err := json.Unmarshal(bytes, &errors); err != nil {
		return err
	}
	*v = errors
	return nil
}

// Value implements driver.Valuer for database writes
func (v ValidationErrors) Value() (driver.Value, error) {
	if len(v) == 0 {
		return nil, nil
	}
	return json.Marshal(v)
}

// ImportJob represents an asynchronous CSV import operation
type ImportJob struct {
	ID               uuid.UUID        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID         uuid.UUID        `gorm:"type:uuid;not null;index:idx_import_jobs_tenant_id" json:"tenantId"`
	CampID           uuid.UUID        `gorm:"type:uuid;not null;index:idx_import_jobs_camp_id" json:"campId"`
	EntityType       string           `gorm:"type:varchar(50);not null" json:"entityType"`
	Status           string           `gorm:"type:varchar(50);not null;index:idx_import_jobs_status" json:"status"`
	Mode             string           `gorm:"type:varchar(50);not null" json:"mode"`
	FilePath         string           `gorm:"type:text;not null" json:"filePath"`
	TotalRows        int              `gorm:"default:0" json:"totalRows"`
	ProcessedRows    int              `gorm:"default:0" json:"processedRows"`
	SuccessCount     int              `gorm:"default:0" json:"successCount"`
	ErrorCount       int              `gorm:"default:0" json:"errorCount"`
	ValidationErrors ValidationErrors `gorm:"type:jsonb" json:"validationErrors,omitempty"`
	CreatedAt        time.Time        `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt        time.Time        `gorm:"autoUpdateTime" json:"updatedAt"`
}

// TableName overrides the default table name
func (ImportJob) TableName() string {
	return "import_jobs"
}

// BeforeCreate sets the UUID before creating an import job
func (j *ImportJob) BeforeCreate(tx *gorm.DB) error {
	if j.ID == uuid.Nil {
		j.ID = uuid.New()
	}
	return nil
}

