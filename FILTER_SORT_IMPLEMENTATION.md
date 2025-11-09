# Generic Filter and Sort Implementation

## Overview

This document describes the generic filter and sort mechanism implemented for the Camp Manager API. The implementation allows filtering and sorting on list endpoints using a URL-friendly string-based format with proper field-to-column mapping.

## Implementation Status

### ✅ Completed (Infrastructure + Locations Example)

1. **Domain Layer** (`backend/internal/domain/filter.go`)
   - Filter struct with Field, Operator, Value
   - FilterOperator constants (==, !=, <=, >=, =@, !@, =^, =~)
   - FieldType constants (text, number, date, uuid)
   - Operator validation per field type
   - Filter string parsing

2. **Repository Helpers** (`backend/internal/repository/helpers.go`)
   - `ParseFilterStrings()` - Parse filter string array to Filter structs
   - `ApplyFilters()` - Apply filters to GORM query with field-to-column mapping
   - `ApplySorting()` - Apply sorting to GORM query with field-to-column mapping
   - Validation of operators vs field types

3. **OpenAPI Parameters**
   - `LocationsFilterBy.yaml` - Entity-specific filter parameter with regex validation
   - `LocationsSortBy.yaml` - Entity-specific sort parameter with enum values
   - `sortOrder.yaml` - Shared sort order parameter (asc/desc)

4. **Locations Endpoint** (Complete Example)
   - Repository: Field type map, field-to-column map, updated List method
   - Service: Updated interface and implementation
   - Handler: Parameter extraction (needs API regeneration)
   - Path: Added parameter references

## Filter Format

### Operators

| Operator | Description | Valid For |
|----------|-------------|-----------|
| `==` | Equals | All types |
| `!=` | Not equals | All types |
| `<=` | Less than or equal | Number, Date, Text |
| `>=` | Greater than or equal | Number, Date, Text |
| `=@` | Contains (case-insensitive) | Text only |
| `!@` | Does not contain (case-insensitive) | Text only |
| `=^` | Starts with (case-insensitive) | Text only |
| `=~` | Ends with (case-insensitive) | Text only |

### Examples

```bash
# Single filter
?filterBy=name=@Conference

# Multiple filters (AND logic)
?filterBy=name=@Conference&filterBy=areaId==123e4567-e89b-12d3-a456-426614174000

# With sorting
?filterBy=name=@Conference&sortBy=name&sortOrder=desc

# Sort only
?sortBy=createdAt&sortOrder=desc
```

## Field-to-Column Mapping

API uses camelCase field names, database uses snake_case columns:

```go
var locationFieldToColumn = map[string]string{
    "name":      "name",
    "areaId":    "area_id",
    "createdAt": "created_at",
}
```

## Next Steps to Complete Implementation

### 1. Bundle OpenAPI Specification

```bash
cd /Users/tbechar/personal/camp-manager
make api-bundle
```

This will bundle all OpenAPI YAML files into `api/openapi-bundled.yaml`.

### 2. Regenerate Go API Types

```bash
cd /Users/tbechar/personal/camp-manager/backend
make generate-client
```

This will generate updated types in `internal/api/types.gen.go` with the new FilterBy, SortBy, and SortOrder parameters.

### 3. Verify Locations Implementation

After regeneration, the locations handler should compile and work correctly:

```bash
cd /Users/tbechar/personal/camp-manager/backend
go build ./...
```

Test the locations endpoint:
```bash
# List with filter
curl "http://localhost:8080/api/v1/camps/{camp_id}/locations?filterBy=name=@Room"

# List with sort
curl "http://localhost:8080/api/v1/camps/{camp_id}/locations?sortBy=name&sortOrder=asc"
```

### 4. Apply to Remaining 13 Entities

For each entity, create:

1. **OpenAPI Parameters** (`api/parameters/`):
   - `{Entity}FilterBy.yaml` - with regex pattern for allowed fields
   - `{Entity}SortBy.yaml` - with enum of sortable fields

2. **Update Path** (`api/paths/{Entity}.yaml`):
   - Add parameter references for filterBy, sortBy, sortOrder

3. **Repository** (`backend/internal/repository/{entity}.go`):
   ```go
   // Field type map (API field names)
   var {entity}Fields = map[string]domain.FieldType{
       "field1": domain.FieldTypeText,
       "field2": domain.FieldTypeUUID,
   }
   
   // Field-to-column mapping
   var {entity}FieldToColumn = map[string]string{
       "field1": "field1",
       "field2": "field_2",
       "createdAt": "created_at",
   }
   
   // Sortable fields
   var {entity}SortableFields = []string{"field1", "field2", "createdAt"}
   
   // Update List method signature and implementation
   ```

4. **Service** (`backend/internal/service/{entity}.go`):
   - Update interface and implementation to pass parameters through

5. **Service Repository Interface** (`backend/internal/service/repository.go`):
   - Update repository interface with new parameters

6. **Handler** (`backend/internal/handler/{entity}.go`):
   - Extract and pass filterBy, sortBy, sortOrder parameters

## Remaining Entities

- Campers
- StaffMembers
- Events
- Sessions
- Groups
- Programs
- Activities
- Areas
- HousingRooms
- Roles
- Certifications
- Colors
- Camps

## Validation Features

- Field name validation against allow-list
- Operator validation per field type (returns helpful error messages)
- Field-to-column mapping validation
- Sort order validation (asc/desc)
- Descriptive error messages like: "Operator '=@' is not valid for date field 'birthday'. Use ==, !=, <=, or >="

