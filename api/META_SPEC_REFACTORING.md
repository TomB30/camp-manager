# OpenAPI Meta/Spec Structure Refactoring

## Overview

Successfully refactored all OpenAPI entity and request schemas to follow a structured meta/spec pattern, separating metadata fields from specification fields. This follows Kubernetes-style API design patterns.

## Architecture

### Base Schemas

#### EntityMeta.yaml (for entity responses)
Contains metadata fields for all entities:
- `id` (required, UUID) - Unique identifier
- `name` (optional, string) - Entity name
- `description` (optional, string) - Entity description
- `createdAt` (required, date-time) - Creation timestamp
- `updatedAt` (required, date-time) - Last update timestamp

#### EntityCreationRequestMeta.yaml (for creation/update requests)
Contains metadata fields for request payloads:
- `name` (optional, string) - Entity name
- `description` (optional, string) - Entity description

Note: No `id` or timestamps in request schemas as these are server-generated.

## Schema Structure

### Entity Response Schema Pattern

All entity response schemas now follow this structure:

```yaml
type: object
required:
  - meta
  - spec
properties:
  meta:
    $ref: "./EntityMeta.yaml"
  spec:
    type: object
    required:
      - name  # if applicable
      # entity-specific required fields
    properties:
      # entity-specific properties only
```

### Creation/Update Request Schema Pattern

All request schemas follow this structure:

```yaml
type: object
required:
  - meta
  - spec
properties:
  meta:
    $ref: "./EntityCreationRequestMeta.yaml"
  spec:
    type: object
    required:
      # entity-specific required fields
    properties:
      # entity-specific properties only
```

## Refactored Schemas

### Entity Schemas (15 total)
All now use `meta` and `spec` fields:
- Activity
- Area
- Camp
- Camper
- Certification
- Color
- DurationPreset
- Event
- Group
- HousingRoom
- Location
- Program
- Role
- Session
- StaffMember

### Request Schemas (30 total)
All creation and update request schemas refactored:
- 15 Creation Request schemas (e.g., `ProgramCreationRequest.yaml`)
- 15 Update Request schemas (e.g., `ProgramUpdateRequest.yaml`)

## Example: Program Entity

### Before Refactoring
```yaml
allOf:
  - $ref: "./EntityMeta.yaml"
  - type: object
    required:
      - name
    properties:
      colorId:
        type: string
        format: uuid
      # other properties...
```

### After Refactoring
```yaml
type: object
required:
  - meta
  - spec
properties:
  meta:
    $ref: "./EntityMeta.yaml"
  spec:
    type: object
    required:
      - name
    properties:
      colorId:
        type: string
        format: uuid
      # other properties...
```

## JSON Response Structure

With this refactoring, API responses now have a clear separation:

```json
{
  "meta": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Swimming Program",
    "description": "Water activities and swimming lessons",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  },
  "spec": {
    "colorId": "660e8400-e29b-41d4-a716-446655440001",
    "activityIds": ["770e8400-e29b-41d4-a716-446655440002"],
    "staffMemberIds": ["880e8400-e29b-41d4-a716-446655440003"],
    "locationIds": ["990e8400-e29b-41d4-a716-446655440004"]
  }
}
```

## JSON Request Structure

Request payloads follow the same pattern (without id/timestamps):

```json
{
  "meta": {
    "name": "Swimming Program",
    "description": "Water activities and swimming lessons"
  },
  "spec": {
    "colorId": "660e8400-e29b-41d4-a716-446655440001",
    "activityIds": ["770e8400-e29b-41d4-a716-446655440002"],
    "staffMemberIds": ["880e8400-e29b-41d4-a716-446655440003"],
    "locationIds": ["990e8400-e29b-41d4-a716-446655440004"]
  }
}
```

## Special Cases

### Entities with Alternative Naming

Some entities use different naming patterns in their `spec`:

1. **Camper** & **StaffMember**: Use `firstName`/`lastName` in spec
   - `meta.name` is optional (for future migration)
   - `spec.firstName` and `spec.lastName` are required

2. **Event**: Uses `title` in spec instead of name
   - `meta.name` is optional (for future migration)
   - `spec.title` is required

These will be normalized to use `meta.name` in a future update.

## Benefits

1. **Clear Separation of Concerns**
   - Metadata (id, name, description, timestamps) separated from business logic
   - Follows industry best practices (Kubernetes API pattern)

2. **Consistency**
   - All entities follow the exact same structure
   - Request and response patterns are uniform

3. **Maintainability**
   - Metadata changes only require updating base schemas
   - Easy to add new metadata fields to all entities at once

4. **Extensibility**
   - Clear place for adding new metadata fields
   - Business logic fields isolated in `spec`

5. **API Versioning Ready**
   - Meta/spec pattern supports API evolution
   - Can add `apiVersion` and `kind` fields to meta for versioning

## Migration Notes

### For API Consumers

API clients will need to update to access fields through the new structure:

**Before:**
```javascript
const programName = response.name;
const colorId = response.colorId;
```

**After:**
```javascript
const programName = response.meta.name;
const colorId = response.spec.colorId;
```

### For API Producers

Backend services should structure responses with meta/spec fields as defined in the schemas.

## Future Enhancements

1. **Naming Normalization**: Migrate `Camper.firstName/lastName` and `Event.title` to use `meta.name`
2. **API Versioning**: Add `apiVersion` field to `EntityMeta`
3. **Resource Type**: Add `kind` field to `EntityMeta` (e.g., "Program", "Activity")
4. **Labels & Annotations**: Add `labels` and `annotations` maps to `EntityMeta` for extensibility

## Files Created

- `/api/schemas/EntityMeta.yaml` - Base metadata for entity responses
- `/api/schemas/EntityCreationRequestMeta.yaml` - Base metadata for requests

## Files Modified

- `/api/openapi.yaml` - Registered new base schemas
- All 15 entity schemas
- All 30 request schemas (15 creation + 15 update)

## Validation

✅ No linting errors
✅ All schemas follow consistent pattern
✅ Request and response schemas properly separated
✅ All entity-specific fields moved to `spec`
✅ All metadata fields in `meta`

