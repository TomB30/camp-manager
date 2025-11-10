package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/tbechar/camp-manager-backend/internal/database"
	"github.com/tbechar/camp-manager-backend/internal/domain"
	"gorm.io/gorm"
)

// GroupsRepository handles database operations for groups
type GroupsRepository struct {
	db *database.Database
}

const (
	InvalidCamperId              = `insert or update on table "group_campers" violates foreign key constraint "group_campers_camper_id_fkey"`
	InvalidStaffMemberId         = `insert or update on table "group_staff_members" violates foreign key constraint "group_staff_members_staff_member_id_fkey"`
	InvalidNestedGroupId         = `insert or update on table "group_groups" violates foreign key constraint "group_groups_child_group_id_fkey"`
	InvalidParentGroupId         = `insert or update on table "group_groups" violates foreign key constraint "group_groups_parent_group_id_fkey"`
	InvalidCamperIdErrorMsg      = "invalid camper id values"
	InvalidStaffMemberIdErrorMsg = "invalid staff member id values"
	InvalidNestedGroupIdErrorMsg = "invalid nested group id values"
	InvalidParentGroupIdErrorMsg = "invalid parent group id values"
)

// NewGroupsRepository creates a new groups repository
func NewGroupsRepository(db *database.Database) *GroupsRepository {
	return &GroupsRepository{db: db}
}

// groupFields defines the filterable fields and their types for groups (API field names)
var groupFields = map[string]domain.FieldType{
	"name":          domain.FieldTypeText,
	"sessionId":     domain.FieldTypeUUID,
	"housingRoomId": domain.FieldTypeUUID,
}

// groupFieldToColumn maps API field names to database column names
var groupFieldToColumn = map[string]string{
	"name":          "name",
	"sessionId":     "session_id",
	"housingRoomId": "housing_room_id",
}

// groupSortableFields defines the sortable fields for groups (API field names)
var groupSortableFields = []string{"name", "sessionId", "housingRoomId"}

// List retrieves a paginated list of groups
func (r *GroupsRepository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.Group, int64, error) {
	var groups []domain.Group
	var total int64

	// Build the base query with tenant and camp filtering
	query := ScopedQuery(r.db, ctx, tenantID, campID)

	// Add search filter if provided
	query = ApplySearchFilter(query, search, "name")

	// Parse and apply filters
	filters, err := ParseFilterStrings(filterStrings)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to parse filters: %w", err)
	}

	query, err = ApplyFilters(query, filters, groupFields, groupFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply filters: %w", err)
	}

	// Get total count
	if err := query.Model(&domain.Group{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count groups: %w", err)
	}

	// Apply sorting
	query, err = ApplySorting(query, sortBy, sortOrder, groupSortableFields, groupFieldToColumn)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to apply sorting: %w", err)
	}

	// If no sorting was specified, use default
	if sortBy == nil || *sortBy == "" {
		query = query.Order("created_at DESC")
	}

	// Get paginated results with preloaded relationships
	if err := query.
		Preload("GroupCampers").
		Preload("GroupStaffMembers").
		Preload("ChildGroups").
		Limit(limit).
		Offset(offset).
		Find(&groups).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list groups: %w", err)
	}

	return groups, total, nil
}

// GetByID retrieves a single group by ID
func (r *GroupsRepository) GetByID(ctx context.Context, tenantID, campID, id uuid.UUID) (*domain.Group, error) {
	var group domain.Group

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Preload("GroupCampers").
		Preload("GroupStaffMembers").
		Preload("ChildGroups").
		Where("id = ?", id).
		First(&group).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("group not found")
		}
		return nil, fmt.Errorf("failed to get group: %w", err)
	}

	return &group, nil
}

// GetByIDs retrieves multiple groups by their IDs
func (r *GroupsRepository) GetByIDs(ctx context.Context, tenantID, campID uuid.UUID, ids []uuid.UUID) ([]domain.Group, error) {
	if len(ids) == 0 {
		return []domain.Group{}, nil
	}

	var groups []domain.Group

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("id IN ?", ids).
		Find(&groups).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get groups by IDs: %w", err)
	}

	return groups, nil
}

// FindByHousingRoomAndSession retrieves a group by housing room and session
func (r *GroupsRepository) FindByHousingRoomAndSession(ctx context.Context, tenantID, campID, housingRoomID, sessionID uuid.UUID) (*domain.Group, error) {
	var group domain.Group

	err := ScopedQuery(r.db, ctx, tenantID, campID).
		Where("housing_room_id = ? AND session_id = ?", housingRoomID, sessionID).
		First(&group).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, fmt.Errorf("failed to find group by housing room and session: %w", err)
	}

	return &group, nil
}

// Create inserts a new group
func (r *GroupsRepository) Create(ctx context.Context, group *domain.Group) error {
	// Validate mutual exclusivity
	if err := validateGroupType(group); err != nil {
		return err
	}

	// Start a transaction
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		domainGroup := domain.Group{
			TenantID:      group.TenantID,
			CampID:        group.CampID,
			Name:          group.Name,
			Description:   "",
			SessionID:     group.SessionID,
			HousingRoomID: group.HousingRoomID,
		}

		if group.Description != "" {
			domainGroup.Description = group.Description
		}

		// Insert the group
		if err := tx.Create(&domainGroup).Error; err != nil {
			return fmt.Errorf("failed to create group: %w", err)
		}

		// Sync relationships based on group type
		if err := syncGroupRelationships(tx, domainGroup.ID, group); err != nil {
			errMsg, found := handleForeignKeyViolation(err)
			if found {
				return fmt.Errorf("%s", errMsg)
			}
			return err
		}

		group.ID = domainGroup.ID
		group.CreatedAt = domainGroup.CreatedAt
		group.UpdatedAt = domainGroup.UpdatedAt

		return nil
	})
}

// Update updates an existing group
func (r *GroupsRepository) Update(ctx context.Context, tenantID, campID, id uuid.UUID, group *domain.Group) error {
	// Validate mutual exclusivity
	if err := validateGroupType(group); err != nil {
		return err
	}

	// Start a transaction
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Check if group exists and belongs to tenant/camp
		var existing domain.Group
		if err := tx.Where("id = ? AND tenant_id = ? AND camp_id = ?", id, tenantID, campID).
			First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return fmt.Errorf("group not found or unauthorized")
			}
			return fmt.Errorf("failed to find group: %w", err)
		}

		// Update the group fields
		updates := map[string]interface{}{
			"name":            group.Name,
			"session_id":      group.SessionID,
			"housing_room_id": group.HousingRoomID,
		}

		if group.Description != "" {
			updates["description"] = group.Description
		} else {
			updates["description"] = ""
		}

		result := ScopedTxQuery(tx, tenantID, campID).
			Model(&domain.Group{}).
			Where("id = ?", id).
			Updates(updates)

		if result.Error != nil {
			return fmt.Errorf("failed to update group: %w", result.Error)
		}

		if result.RowsAffected == 0 {
			return fmt.Errorf("group not found or unauthorized")
		}

		// Sync relationships based on group type using delete-all-and-recreate strategy
		if err := syncGroupRelationships(tx, id, group); err != nil {
			errMsg, found := handleForeignKeyViolation(err)
			if found {
				return fmt.Errorf("%s", errMsg)
			}
			return err
		}

		return nil
	})
}

// Delete soft deletes a group by ID
func (r *GroupsRepository) Delete(ctx context.Context, tenantID, campID, id uuid.UUID) error {
	// Start a transaction to handle soft delete and junction table cleanup
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// First, hard delete all junction table entries for this group
		// (junction tables don't use soft delete)
		if err := tx.Where("group_id = ?", id).Delete(&domain.GroupCamper{}).Error; err != nil {
			return fmt.Errorf("failed to delete camper associations: %w", err)
		}

		if err := tx.Where("group_id = ?", id).Delete(&domain.GroupStaffMember{}).Error; err != nil {
			return fmt.Errorf("failed to delete staff associations: %w", err)
		}

		// Delete both parent and child relationships for nested groups
		if err := tx.Where("parent_group_id = ?", id).Delete(&domain.GroupGroup{}).Error; err != nil {
			return fmt.Errorf("failed to delete parent group associations: %w", err)
		}

		if err := tx.Where("child_group_id = ?", id).Delete(&domain.GroupGroup{}).Error; err != nil {
			return fmt.Errorf("failed to delete child group associations: %w", err)
		}

		// Then soft delete the group using scoped query
		result := ScopedTxQuery(tx, tenantID, campID).
			Where("id = ?", id).
			Delete(&domain.Group{})

		if result.Error != nil {
			return fmt.Errorf("failed to delete group: %w", result.Error)
		}

		if result.RowsAffected == 0 {
			return fmt.Errorf("group not found or unauthorized")
		}

		return nil
	})
}

// validateGroupType ensures mutual exclusivity between nested groups and manual member selection
func validateGroupType(group *domain.Group) error {
	hasNestedGroups := len(group.ChildGroups) > 0
	hasManualMembers := len(group.GroupCampers) > 0 || len(group.GroupStaffMembers) > 0

	if hasNestedGroups && hasManualMembers {
		return fmt.Errorf("group cannot have both nested groups (groupIds) and manual member selection (camperIds/staffIds)")
	}

	return nil
}

// syncGroupRelationships syncs all group relationships using delete-all-and-recreate strategy
func syncGroupRelationships(tx *gorm.DB, groupID uuid.UUID, group *domain.Group) error {
	// Delete all existing relationships
	if err := tx.Where("group_id = ?", groupID).Delete(&domain.GroupCamper{}).Error; err != nil {
		return fmt.Errorf("failed to delete existing camper associations: %w", err)
	}
	if err := tx.Where("group_id = ?", groupID).Delete(&domain.GroupStaffMember{}).Error; err != nil {
		return fmt.Errorf("failed to delete existing staff associations: %w", err)
	}
	if err := tx.Where("parent_group_id = ?", groupID).Delete(&domain.GroupGroup{}).Error; err != nil {
		return fmt.Errorf("failed to delete existing nested group associations: %w", err)
	}

	// Insert new camper associations if provided
	if len(group.GroupCampers) > 0 {
		for _, groupCamper := range group.GroupCampers {
			groupCamper := domain.GroupCamper{
				GroupID:  groupID,
				CamperID: groupCamper.CamperID,
			}
			if err := tx.Create(&groupCamper).Error; err != nil {
				return fmt.Errorf("failed to create camper association: %w", err)
			}
		}
	}

	// Insert new staff associations if provided
	if len(group.GroupStaffMembers) > 0 {
		for _, groupStaffMember := range group.GroupStaffMembers {
			groupStaff := domain.GroupStaffMember{
				GroupID:       groupID,
				StaffMemberID: groupStaffMember.StaffMemberID,
			}
			if err := tx.Create(&groupStaff).Error; err != nil {
				return fmt.Errorf("failed to create staff association: %w", err)
			}
		}
	}

	// Insert new nested group associations if provided
	if len(group.ChildGroups) > 0 {
		for _, groupGroup := range group.ChildGroups {
			groupGroup := domain.GroupGroup{
				ParentGroupID: groupID,
				ChildGroupID:  groupGroup.ChildGroupID,
			}
			if err := tx.Create(&groupGroup).Error; err != nil {
				return fmt.Errorf("failed to create nested group association: %w", err)
			}
		}
	}

	return nil
}

func handleForeignKeyViolation(err error) (string, bool) {
	invalidForeignKeys := []string{InvalidCamperId, InvalidStaffMemberId, InvalidNestedGroupId, InvalidParentGroupId}
	invalidForeignKeysErrorMsgs := []string{InvalidCamperIdErrorMsg, InvalidStaffMemberIdErrorMsg, InvalidNestedGroupIdErrorMsg, InvalidParentGroupIdErrorMsg}
	for index, invalidForeignKey := range invalidForeignKeys {
		if strings.Contains(err.Error(), invalidForeignKey) {
			return invalidForeignKeysErrorMsgs[index], true
		}
	}
	return "", false
}
