package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"gorm.io/gorm"
)

// StaffMembersRepository handles database operations for staff members
type StaffMembersRepository struct {
	db *database.Database
}

// NewStaffMembersRepository creates a new staff members repository
func NewStaffMembersRepository(db *database.Database) *StaffMembersRepository {
	return &StaffMembersRepository{db: db}
}

// List retrieves a paginated list of staff members
func (r *StaffMembersRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string) ([]domain.StaffMember, int64, error) {
	var staffMembers []domain.StaffMember
	var total int64

	// Build the base query with tenant and camp filtering
	query := ScopedQuery(r.db, ctx, tenantID, campID)

	// Add search filter if provided
	if search != nil && *search != "" {
		searchPattern := fmt.Sprintf("%%%s%%", *search)
		query = query.Where("name ILIKE ?", searchPattern)
	}

	// Get total count
	if err := query.Model(&domain.StaffMember{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count staff members: %w", err)
	}

	// Get paginated results with preloaded relationships
	if err := query.
		Preload("GroupStaffMembers").
		Preload("StaffCertifications").
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&staffMembers).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list staff members: %w", err)
	}

	return staffMembers, total, nil
}

// GetByID retrieves a single staff member by ID
func (r *StaffMembersRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.StaffMember, error) {
	var staffMember domain.StaffMember

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Preload("GroupStaffMembers").
		Preload("StaffCertifications").
		Where("id = ?", id).
		First(&staffMember).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("staff member not found")
		}
		return nil, fmt.Errorf("failed to get staff member: %w", err)
	}

	return &staffMember, nil
}

// Create inserts a new staff member
func (r *StaffMembersRepository) Create(ctx context.Context, tenantId uuid.UUID, campId uuid.UUID, staffMember *domain.StaffMember) error {
	// Start a transaction
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Convert API staff member to domain staff member
		domainStaffMember := domain.StaffMember{
			TenantID:       tenantId,
			CampID:         campId,
			Name:           staffMember.Name,
			Description:    "",
			Birthday:       staffMember.Birthday,
			Gender:         staffMember.Gender,
			RoleID:         staffMember.RoleID,
			Phone:          staffMember.Phone,
			HousingGroupID: staffMember.HousingGroupID,
		}

		// Insert the staff member
		if err := tx.Create(&domainStaffMember).Error; err != nil {
			return fmt.Errorf("failed to create staff member: %w", err)
		}

		// Sync group relationships
		if err := syncGroupStaffMembers(tx, domainStaffMember.ID, &staffMember.GroupStaffMembers); err != nil {
			return err
		}

		// Sync certification relationships
		if err := syncStaffCertifications(tx, domainStaffMember.ID, &staffMember.StaffCertifications); err != nil {
			return err
		}

		staffMember.ID = domainStaffMember.ID
		staffMember.CreatedAt = domainStaffMember.CreatedAt
		staffMember.UpdatedAt = domainStaffMember.UpdatedAt

		return nil
	})
}

// Update updates an existing staff member
func (r *StaffMembersRepository) Update(ctx context.Context, tenantID, campID, id uuid.UUID, staffMember *domain.StaffMember) error {
	// Start a transaction
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Check if staff member exists and belongs to tenant/camp
		var existing domain.StaffMember
		if err := tx.Where("id = ? AND tenant_id = ? AND camp_id = ?", id, tenantID, campID).
			First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return fmt.Errorf("staff member not found or unauthorized")
			}
			return fmt.Errorf("failed to find staff member: %w", err)
		}

		// Update the staff member fields
		updates := map[string]interface{}{
			"name":             staffMember.Name,
			"birthday":         staffMember.Birthday,
			"gender":           staffMember.Gender,
			"role_id":          staffMember.RoleID,
			"housing_group_id": staffMember.HousingGroupID,
		}

		if staffMember.Description != "" {
			updates["description"] = staffMember.Description
		} else {
			updates["description"] = ""
		}

		if staffMember.Phone != "" {
			updates["phone"] = staffMember.Phone
		} else {
			updates["phone"] = ""
		}

		result := tx.Model(&domain.StaffMember{}).
			Where("id = ? AND tenant_id = ? AND camp_id = ?", id, tenantID, campID).
			Updates(updates)

		if result.Error != nil {
			return fmt.Errorf("failed to update staff member: %w", result.Error)
		}

		if result.RowsAffected == 0 {
			return fmt.Errorf("staff member not found or unauthorized")
		}

		// Sync group relationships using delete-all-and-recreate strategy
		if err := syncGroupStaffMembers(tx, id, &staffMember.GroupStaffMembers); err != nil {
			return err
		}

		// Sync certification relationships using delete-all-and-recreate strategy
		if err := syncStaffCertifications(tx, id, &staffMember.StaffCertifications); err != nil {
			return err
		}

		staffMember.UpdatedAt = time.Now()

		return nil
	})
}

// Delete soft deletes a staff member by ID
func (r *StaffMembersRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	// Start a transaction to handle soft delete and junction table cleanup
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// First, hard delete all junction table entries for this staff member
		// (junction tables don't use soft delete)
		if err := tx.Where("staff_member_id = ?", id).Delete(&domain.GroupStaffMember{}).Error; err != nil {
			return fmt.Errorf("failed to delete group associations: %w", err)
		}

		if err := tx.Where("staff_member_id = ?", id).Delete(&domain.StaffCertification{}).Error; err != nil {
			return fmt.Errorf("failed to delete certification associations: %w", err)
		}

		// Then soft delete the staff member using scoped query
		result := ScopedTxQuery(tx, tenantID, campID).
			Where("id = ?", id).
			Delete(&domain.StaffMember{})

		if result.Error != nil {
			return fmt.Errorf("failed to delete staff member: %w", result.Error)
		}

		if result.RowsAffected == 0 {
			return fmt.Errorf("staff member not found or unauthorized")
		}

		return nil
	})
}

// syncGroupStaffMembers syncs the group_staff_members junction table using delete-all-and-recreate strategy
func syncGroupStaffMembers(tx *gorm.DB, staffMemberID uuid.UUID, groupIDs *[]domain.GroupStaffMember) error {
	// Delete all existing group associations
	if err := tx.Where("staff_member_id = ?", staffMemberID).Delete(&domain.GroupStaffMember{}).Error; err != nil {
		return fmt.Errorf("failed to delete existing group associations: %w", err)
	}

	// Insert new associations if provided
	if groupIDs != nil && len(*groupIDs) > 0 {
		for _, groupStaffMember := range *groupIDs {
			groupStaffMember := domain.GroupStaffMember{
				GroupID:       groupStaffMember.GroupID,
				StaffMemberID: staffMemberID,
			}
			if err := tx.Create(&groupStaffMember).Error; err != nil {
				return fmt.Errorf("failed to create group association: %w", err)
			}
		}
	}

	return nil
}

// syncStaffCertifications syncs the staff_member_certifications junction table using delete-all-and-recreate strategy
func syncStaffCertifications(tx *gorm.DB, staffMemberID uuid.UUID, certificationIDs *[]domain.StaffCertification) error {
	// Delete all existing certification associations
	if err := tx.Where("staff_member_id = ?", staffMemberID).Delete(&domain.StaffCertification{}).Error; err != nil {
		return fmt.Errorf("failed to delete existing certification associations: %w", err)
	}

	// Insert new associations if provided
	if certificationIDs != nil && len(*certificationIDs) > 0 {
		for _, staffCertification := range *certificationIDs {
			staffCert := domain.StaffCertification{
				StaffMemberID:   staffMemberID,
				CertificationID: staffCertification.CertificationID,
			}
			if err := tx.Create(&staffCert).Error; err != nil {
				return fmt.Errorf("failed to create certification association: %w", err)
			}
		}
	}

	return nil
}
