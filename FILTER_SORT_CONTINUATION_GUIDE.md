# Filter and Sort Implementation - Continuation Guide

## Context & Current State

This project is implementing a **generic filter and sort mechanism** for all list endpoints in the Camp Manager API. The implementation uses a string-based format (e.g., `name=@John`) that is URL-friendly and follows OpenAPI conventions.

### Design Decisions Made:
1. **String-based filter format**: `field operator value` (e.g., `name=@Conference`, `capacity>=10`)
2. **Field-to-column mapping**: API uses camelCase (e.g., `areaId`), DB uses snake_case (e.g., `area_id`)
3. **Operator validation by field type**: Text fields support all operators, dates/numbers only support comparison operators
4. **Separate sortBy and sortOrder parameters**: `?sortBy=name&sortOrder=desc`

### Infrastructure Status: ✅ COMPLETE

All core infrastructure has been implemented:

1. **Domain layer** (`backend/internal/domain/filter.go`):
   - Filter struct, operators, field types
   - Parsing and validation functions
   - ✅ Complete - no changes needed

2. **Repository helpers** (`backend/internal/repository/helpers.go`):
   - `ParseFilterStrings()`, `ApplyFilters()`, `ApplySorting()`
   - Field-to-column mapping support
   - ✅ Complete - no changes needed

3. **Shared parameter** (`api/parameters/sortOrder.yaml`):
   - ✅ Complete - reused across all endpoints

### Example Implementation: ✅ Locations Endpoint COMPLETE

The **Locations** endpoint serves as a complete reference implementation. Use it as a template for all other endpoints.

Files modified:
- `api/parameters/LocationsFilterBy.yaml`
- `api/parameters/LocationsSortBy.yaml`
- `api/paths/Locations.yaml`
- `backend/internal/repository/locations.go`
- `backend/internal/service/locations.go`
- `backend/internal/service/repository.go` (LocationsRepository interface)
- `backend/internal/handler/locations.go`

## What Remains: 13 Entities to Implement

Each of the following entities needs the same treatment as Locations:

1. **Campers**
2. **StaffMembers** (staff_members table)
3. **Events**
4. **Sessions**
5. **Groups**
6. **Programs**
7. **Activities**
8. **Areas**
9. **HousingRooms** (housing_rooms table)
10. **Roles**
11. **Certifications**
12. **Colors**
13. **Camps**

### Field Mappings Reference

Here are the filterable fields for each entity (to save time looking them up):

**Campers** (`api/schemas/CamperSpec.yaml`):
- name (text), birthday (date), gender (text), sessionId (uuid), housingGroupId (uuid)

**StaffMembers** (`api/schemas/StaffMemberSpec.yaml`):
- name (text), gender (text), roleId (uuid), certificationId (uuid), phone (text)

**Events** (`api/schemas/EventSpec.yaml`):
- name (text), startDate (date), endDate (date), capacity (number), locationId (uuid), programId (uuid), activityId (uuid), colorId (uuid)

**Sessions** (`api/schemas/SessionSpec.yaml`):
- name (text), startDate (date), endDate (date)

**Groups** (`api/schemas/GroupSpec.yaml`):
- name (text), sessionId (uuid), housingRoomId (uuid)

**Programs** (`api/schemas/ProgramSpec.yaml`):
- name (text)

**Activities** (`api/schemas/ActivitySpec.yaml`):
- name (text), programId (uuid)

**Areas** (`api/schemas/AreaSpec.yaml`):
- name (text)

**HousingRooms** (`api/schemas/HousingRoomSpec.yaml`):
- name (text), capacity (number)

**Roles** (`api/schemas/RoleSpec.yaml`):
- name (text)

**Certifications** (`api/schemas/CertificationSpec.yaml`):
- name (text)

**Colors** (`api/schemas/ColorSpec.yaml`):
- name (text), hexCode (text)

**Camps** (`api/schemas/CampSpec.yaml`):
- name (text)

## Step-by-Step Implementation for Each Entity

For each entity, follow these 6 steps:

### Step 1: Create FilterBy Parameter (`api/parameters/{Entity}FilterBy.yaml`)

Copy `api/parameters/LocationsFilterBy.yaml` and modify:

```yaml
name: filterBy
in: query
required: false
description: |
  Filter results by parameters. Format: field operator value
  Operators: == (equals), != (not equals), <= (less/equal), >= (greater/equal),
  =@ (contains), !@ (not contains), =^ (starts with), =~ (ends with)
  Dates in ISO 8601 format. Text filters are case-insensitive.
  Note: Text operators (=@, !@, =^, =~) only work with text fields.
schema:
  type: array
  items:
    type: string
    pattern: "^(field1|field2|field3)(==|!=|<=|>=|=@|!@|=\\^|=~).+$"
  example: ["name=@John", "field2==value"]
explode: false
```

**Replace**: 
- Pattern with actual field names from field mappings above
- Example with realistic examples

### Step 2: Create SortBy Parameter (`api/parameters/{Entity}SortBy.yaml`)

Copy `api/parameters/LocationsSortBy.yaml`:

```yaml
name: sortBy
in: query
required: false
description: Field name to sort by
schema:
  type: string
  enum: [field1, field2, field3, createdAt]
  example: name
```

**Replace**: Enum with actual sortable fields (usually same as filterable + createdAt)

### Step 3: Update Path (`api/paths/{Entity}.yaml`)

Add three parameter references to the GET endpoint:

```yaml
get:
  summary: List all {entities}
  operationId: list{Entities}
  parameters:
    - $ref: "../parameters/camp_id.yaml"  # or tenant_id for Camps/Tenants
    - $ref: "../parameters/limit.yaml"
    - $ref: "../parameters/offset.yaml"
    - $ref: "../parameters/search.yaml"
    - $ref: "../parameters/{Entity}FilterBy.yaml"      # ADD THIS
    - $ref: "../parameters/{Entity}SortBy.yaml"        # ADD THIS
    - $ref: "../parameters/sortOrder.yaml"             # ADD THIS
```

### Step 4: Update Repository (`backend/internal/repository/{entity}.go`)

Add field maps and update List method signature. **Use `locations.go` as reference!**

```go
// {entity}Fields defines the filterable fields (API field names)
var {entity}Fields = map[string]domain.FieldType{
    "name":    domain.FieldTypeText,
    "field2":  domain.FieldTypeUUID,
    "field3":  domain.FieldTypeDate,
    // Add all fields from mapping reference above
}

// {entity}FieldToColumn maps API names to database columns
var {entity}FieldToColumn = map[string]string{
    "name":       "name",
    "field2":     "field_2",        // camelCase -> snake_case
    "field3":     "field_3",
    "createdAt":  "created_at",
}

// {entity}SortableFields defines sortable fields
var {entity}SortableFields = []string{"name", "field2", "field3", "createdAt"}

// List method signature - ADD NEW PARAMETERS
func (r *{Entity}Repository) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.{Entity}, int64, error) {
    var {entities} []domain.{Entity}
    var total int64

    query := ScopedQuery(r.db, ctx, tenantID, campID)
    query = ApplySearchFilter(query, search, "name")

    // Parse and apply filters
    filters, err := ParseFilterStrings(filterStrings)
    if err != nil {
        return nil, 0, fmt.Errorf("failed to parse filters: %w", err)
    }

    query, err = ApplyFilters(query, filters, {entity}Fields, {entity}FieldToColumn)
    if err != nil {
        return nil, 0, fmt.Errorf("failed to apply filters: %w", err)
    }

    // Get total count
    if err := query.Model(&domain.{Entity}{}).Count(&total).Error; err != nil {
        return nil, 0, fmt.Errorf("failed to count {entities}: %w", err)
    }

    // Apply sorting
    query, err = ApplySorting(query, sortBy, sortOrder, {entity}SortableFields, {entity}FieldToColumn)
    if err != nil {
        return nil, 0, fmt.Errorf("failed to apply sorting: %w", err)
    }

    // If no sorting specified, use default
    if sortBy == nil || *sortBy == "" {
        query = query.Order("created_at DESC")
    }

    // Get paginated results
    if err := query.
        Limit(limit).
        Offset(offset).
        Find(&{entities}).Error; err != nil {
        return nil, 0, fmt.Errorf("failed to list {entities}: %w", err)
    }

    return {entities}, total, nil
}
```

**Important**: 
- Replace `{Entity}` with actual entity name (e.g., `Camper`, `StaffMember`)
- Replace `{entity}` with lowercase (e.g., `camper`, `staffMember`)
- For table names with underscores (staff_members, housing_rooms), still use camelCase in Go

### Step 5: Update Service Interface (`backend/internal/service/repository.go`)

Find the repository interface and update List signature:

```go
type {Entity}Repository interface {
    List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) ([]domain.{Entity}, int64, error)
    // ... other methods unchanged
}
```

### Step 6: Update Service Implementation (`backend/internal/service/{entity}.go`)

Update both the interface and implementation:

```go
// Interface
type {Entity}Service interface {
    List(ctx context.Context, tenantID uuid.UUID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.{Entity}ListResponse, error)
    // ... other methods unchanged
}

// Implementation
func (s *{entity}Service) List(ctx context.Context, tenantID, campID uuid.UUID, limit, offset int, search *string, filterStrings []string, sortBy *string, sortOrder string) (*api.{Entity}ListResponse, error) {
    {entities}, total, err := s.repo.List(ctx, tenantID, campID, limit, offset, search, filterStrings, sortBy, sortOrder)
    if err != nil {
        return nil, pkgerrors.BadRequest("Failed to list {entities}", err)
    }
    // ... rest unchanged
}
```

### Step 7: Update Handler (`backend/internal/handler/{entity}.go`)

Update the List handler to extract and pass parameters:

```go
func (h *{Entity}Handler) List{Entities}(w http.ResponseWriter, r *http.Request, campId api.CampId, params api.List{Entities}Params) {
    // ... tenant extraction unchanged ...
    
    limit := 50
    offset := 0
    if params.Limit != nil {
        limit = *params.Limit
    }
    if params.Offset != nil {
        offset = *params.Offset
    }

    // ADD THIS: Extract filter and sort parameters
    filterStrings := []string{}
    if params.FilterBy != nil {
        filterStrings = *params.FilterBy
    }

    sortOrder := "asc"
    if params.SortOrder != nil {
        sortOrder = *params.SortOrder
    }

    // UPDATE THIS: Add new parameters to service call
    response, err := h.service.List(r.Context(), tenantID, campUUID, limit, offset, params.Search, filterStrings, params.SortBy, sortOrder)
    if err != nil {
        errors.WriteError(w, err)
        return
    }

    // ... response writing unchanged ...
}
```

## After Completing All Entities

### 1. Bundle OpenAPI Spec

```bash
cd /Users/tbechar/personal/camp-manager
make api-bundle
```

This bundles all YAML files into `api/openapi-bundled.yaml`.

### 2. Regenerate Go API Types

```bash
cd /Users/tbechar/personal/camp-manager/backend
make generate-client
```

This generates `internal/api/types.gen.go` with FilterBy, SortBy, SortOrder parameters.

### 3. Verify Compilation

```bash
cd /Users/tbechar/personal/camp-manager/backend
go build ./...
```

All handlers should now compile without errors.

### 4. Test Each Endpoint

Example tests:

```bash
# Filter by text (contains)
curl "http://localhost:8080/api/v1/camps/{camp_id}/campers?filterBy=name=@John"

# Filter by date (greater than)
curl "http://localhost:8080/api/v1/camps/{camp_id}/campers?filterBy=birthday>=2010-01-01"

# Multiple filters (AND logic)
curl "http://localhost:8080/api/v1/camps/{camp_id}/campers?filterBy=name=@John&filterBy=gender==male"

# Sort descending
curl "http://localhost:8080/api/v1/camps/{camp_id}/campers?sortBy=name&sortOrder=desc"

# Filter + Sort
curl "http://localhost:8080/api/v1/camps/{camp_id}/campers?filterBy=gender==female&sortBy=birthday&sortOrder=asc"
```

## Quick Reference: Operator Support by Type

| Field Type | Supported Operators |
|------------|---------------------|
| Text | ==, !=, <=, >=, =@, !@, =^, =~ |
| Number | ==, !=, <=, >= |
| Date | ==, !=, <=, >= |
| UUID | ==, != |

## Common Field Name Mappings

| API (camelCase) | Database (snake_case) |
|-----------------|------------------------|
| sessionId | session_id |
| housingGroupId | housing_group_id |
| housingRoomId | housing_room_id |
| programId | program_id |
| activityId | activity_id |
| locationId | location_id |
| areaId | area_id |
| roleId | role_id |
| colorId | color_id |
| startDate | start_date |
| endDate | end_date |
| createdAt | created_at |
| hexCode | hex_code |

## Troubleshooting

### Compilation Errors After Handler Update
**Cause**: API types not regenerated yet  
**Solution**: Run `make api-bundle` then `cd backend && make generate-client`

### Filter Validation Error "field is not filterable"
**Cause**: Field name in filter doesn't match field map  
**Solution**: Check spelling, ensure field is in `{entity}Fields` map

### Filter Validation Error "no column mapping found"
**Cause**: Field not in fieldToColumn map  
**Solution**: Add mapping to `{entity}FieldToColumn`

### Operator Validation Error
**Cause**: Using text operator (=@) on non-text field  
**Solution**: This is correct behavior - use appropriate operator for field type

## Progress Tracking

### ✅ Complete
- [x] Core infrastructure (domain, helpers)
- [x] Locations endpoint (all layers)
- [x] sortOrder.yaml shared parameter

### 🔄 In Progress (13 entities remaining)
- [ ] Campers
- [ ] StaffMembers
- [ ] Events
- [ ] Sessions
- [ ] Groups
- [ ] Programs
- [ ] Activities
- [ ] Areas
- [ ] HousingRooms
- [ ] Roles
- [ ] Certifications
- [ ] Colors
- [ ] Camps

### 📝 Final Steps
- [ ] Bundle OpenAPI spec
- [ ] Regenerate Go API types
- [ ] Verify compilation
- [ ] Test all endpoints

## Files to Reference

**Complete example**: All files modified for Locations endpoint  
**Field mappings**: See "Field Mappings Reference" section above  
**Infrastructure**: `backend/internal/repository/helpers.go`, `backend/internal/domain/filter.go`

---

**Estimated time per entity**: 10-15 minutes  
**Total remaining work**: ~3-4 hours for all 13 entities

