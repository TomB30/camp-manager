<!-- 9f5f9348-17c4-44b1-b07a-36ae1a066e9e 082b9324-6a65-4a1b-822e-ec268a8d6ac7 -->
# Groups, Campers, and Staff Database Implementation

## Database Schema Design

### Main Tables

Create three main tables with EntityMeta fields (id, name, description, tenant_id, camp_id, created_at, updated_at, deleted_at):

1. **`campers`** - stores camper metadata and spec fields

- Columns: birthday, gender, session_id, housing_group_id
- No `group_ids` column (populated from junction table)

2. **`staff_members`** - stores staff metadata and spec fields

- Columns: birthday, gender, role_id, phone, housing_group_id
- No `group_ids` or `certification_ids` columns (populated from junction tables)

3. **`groups`** - stores group metadata and spec fields

- Columns: session_id, housing_room_id
- No `camper_ids`, `staff_ids`, or `group_ids` columns (populated from junction tables)

### Junction Tables

Create four junction tables for many-to-many relationships:

1. **`group_campers`** - links groups to campers

- Columns: group_id (UUID, FK), camper_id (UUID, FK), created_at
- Composite primary key: (group_id, camper_id)
- ON DELETE CASCADE for both foreign keys

2. **`group_staff_members`** - links groups to staff members

- Columns: group_id (UUID, FK), staff_member_id (UUID, FK), created_at
- Composite primary key: (group_id, staff_member_id)
- ON DELETE CASCADE for both foreign keys

3. **`group_groups`** - links parent groups to child groups (nested groups)

- Columns: parent_group_id (UUID, FK), child_group_id (UUID, FK), created_at
- Composite primary key: (parent_group_id, child_group_id)
- ON DELETE CASCADE for both foreign keys
- CHECK constraint: parent_group_id != child_group_id (prevent self-reference)

4. **`staff_member_certifications`** - links staff members to certifications

- Columns: staff_member_id (UUID, FK), certification_id (UUID, FK), created_at
- Composite primary key: (staff_member_id, certification_id)
- ON DELETE CASCADE for both foreign keys

### Key Design Benefits

**Easy Deletions:**

- Delete a group → junction tables automatically cascade, no loops needed
- Delete a camper/staff → junction tables automatically cascade, no group updates needed

**API Response Population:**

- Always fetch and populate relationship arrays from junction tables
- Use SQL JOINs or separate queries to build complete API responses

**Mutual Exclusivity Enforcement:**

- Validate in service layer: group cannot have entries in both `group_groups` AND (`group_campers` OR `group_staff_members`)

## Domain Layer

Create three domain structs following the pattern in `/Users/tbechar/personal/camp-manager/backend/internal/domain/area.go`:

1. **`Camper`** - with GORM tags and `ToAPI()` method
2. **`StaffMember`** - with GORM tags and `ToAPI()` method  
3. **`Group`** - with GORM tags and `ToAPI()` method

Each domain struct:

- Flattens meta + spec into single struct for database efficiency
- Includes `ToAPI()` method to convert to API format (meta + spec structure)
- Populates relationship IDs from preloaded junction table data

## Repository Layer

Implement repositories following pattern in `/Users/tbechar/personal/camp-manager/backend/internal/repository/certifications.go`:

### Core Methods (all three repositories)

- `List()` - with pagination, search, and preloaded relationships
- `GetByID()` - with preloaded relationships
- `Create()` - with transaction to insert main record + junction entries
- `Update()` - with transaction to update main record + sync junction entries using delete-all-and-recreate
- `Delete()` - soft delete (CASCADE handles junction cleanup automatically)

### Junction Table Update Strategy (Delete-All-And-Recreate)

For `Create()` and `Update()` operations on all entities with relationships:

**Campers** - updating `groupIds`:

```
In transaction:
1. INSERT/UPDATE campers table
2. DELETE FROM group_campers WHERE camper_id = ?
3. INSERT INTO group_campers (group_id, camper_id) VALUES (?, ?)... for each groupId
```

**Staff Members** - updating `groupIds` and `certificationIds`:

```
In transaction:
1. INSERT/UPDATE staff_members table
2. DELETE FROM group_staff_members WHERE staff_member_id = ?
3. INSERT INTO group_staff_members (group_id, staff_member_id) VALUES (?, ?)...
4. DELETE FROM staff_member_certifications WHERE staff_member_id = ?
5. INSERT INTO staff_member_certifications (certification_id, staff_member_id) VALUES (?, ?)...
```

**Groups** - updating `camperIds`, `staffIds`, or `groupIds` (mutually exclusive):

```
In transaction:
1. INSERT/UPDATE groups table
2. Validate mutual exclusivity (only one type can have values)
3. DELETE FROM group_campers WHERE group_id = ?
4. DELETE FROM group_staff_members WHERE group_id = ?
5. DELETE FROM group_groups WHERE parent_group_id = ?
6. INSERT into appropriate junction table based on group type
```

**Benefits:**

- Simple atomic operation within transaction
- Handles additions, removals, and unchanged relationships uniformly
- No complex diffing logic required
- Guaranteed synchronization between API arrays and database state

### Helper Methods

- `syncGroupCampers(tx, groupID, camperIDs)` - internal helper for junction sync
- `syncGroupStaff(tx, groupID, staffIDs)` - internal helper for junction sync
- `syncNestedGroups(tx, parentGroupID, childGroupIDs)` - internal helper for junction sync
- `syncStaffCertifications(tx, staffID, certificationIDs)` - internal helper for junction sync
- `ValidateGroupType()` - ensure mutual exclusivity for groups

### Relationship Population

- Use GORM preloading: `Preload("GroupCampers")`, `Preload("GroupStaffMembers")`, etc.
- In `ToAPI()` methods, extract IDs from preloaded junction data into arrays

## Junction Table Update Strategy (Delete-All-And-Recreate)

For `Create()` and `Update()` operations on all entities with relationships:

**Campers** - updating `groupIds`:

```
In transaction:
1. INSERT/UPDATE campers table
2. DELETE FROM group_campers WHERE camper_id = ?
3. INSERT INTO group_campers (group_id, camper_id) VALUES (?, ?)... for each groupId
```

**Staff Members** - updating `groupIds` and `certificationIds`:

```
In transaction:
1. INSERT/UPDATE staff_members table
2. DELETE FROM group_staff_members WHERE staff_member_id = ?
3. INSERT INTO group_staff_members (group_id, staff_member_id) VALUES (?, ?)...
4. DELETE FROM staff_member_certifications WHERE staff_member_id = ?
5. INSERT INTO staff_member_certifications (certification_id, staff_member_id) VALUES (?, ?)...
```

**Groups** - updating `camperIds`, `staffIds`, or `groupIds` (mutually exclusive):

```
In transaction:
1. INSERT/UPDATE groups table
2. Validate mutual exclusivity (only one type can have values)
3. DELETE FROM group_campers WHERE group_id = ?
4. DELETE FROM group_staff_members WHERE group_id = ?
5. DELETE FROM group_groups WHERE parent_group_id = ?
6. INSERT into appropriate junction table based on group type
```

**Benefits:**

- Simple atomic operation within transaction
- Handles additions, removals, and unchanged relationships uniformly
- No complex diffing logic required
- Guaranteed synchronization between API arrays and database state

## Migration File

Append to existing migration file `/Users/tbechar/personal/camp-manager/backend/internal/database/migrations/up/001_init_tenants_camps_users.up.sql`:

- Three main tables (campers, staff_members, groups)
- Four junction tables (group_campers, group_staff_members, group_groups, staff_member_certifications)
- Indexes on foreign keys and composite keys
- Triggers for updated_at on main tables
- Comments for documentation

Also update down migration `/Users/tbechar/personal/camp-manager/backend/internal/database/migrations/down/001_init_tenants_camps_users.down.sql` to drop the new tables

### To-dos

- [ ] Create migration SQL file with campers, staff_members, groups tables and 4 junction tables
- [ ] Create domain/camper.go with struct, TableName, BeforeCreate, ToAPI methods
- [ ] Create domain/staff_member.go with struct, TableName, BeforeCreate, ToAPI methods
- [ ] Create domain/group.go with struct, TableName, BeforeCreate, ToAPI methods
- [ ] Implement repository/campers.go with List, GetByID, Create, Update, Delete with junction table handling
- [ ] Implement repository/staff_members.go with List, GetByID, Create, Update, Delete with junction table handling
- [ ] Implement repository/groups.go with List, GetByID, Create, Update, Delete with junction table handling and validation