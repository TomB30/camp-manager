# OpenAPI Entity Meta Refactoring

## Overview

Successfully refactored all OpenAPI entity schemas to use a common `EntityMeta.yaml` base schema containing shared meta fields.

## EntityMeta Schema

Created `/api/schemas/EntityMeta.yaml` with the following structure:

```yaml
type: object
required:
  - id
  - createdAt
  - updatedAt
properties:
  id:
    type: string
    format: uuid
  name:
    type: string
  description:
    type: string
  createdAt:
    type: string
    format: date-time
  updatedAt:
    type: string
    format: date-time
```

## Key Design Decisions

1. **Single Schema Approach**: All common meta fields are in one schema (`EntityMeta.yaml`)
2. **Optional Name/Description**: `name` and `description` are optional in the base schema, allowing flexibility for entities with different naming patterns
3. **Required Timestamps**: All entities now have `createdAt` and `updatedAt` timestamps
4. **Composition with allOf**: All entity schemas use OpenAPI's `allOf` to compose EntityMeta with entity-specific properties

## Refactored Entities

### Standard Entities (with name + description)
- Program
- Role  
- Activity
- Session
- Area
- Color
- Group
- Certification
- DurationPreset
- Camp
- HousingRoom
- Location

### Special Naming Pattern Entities
- **Camper**: Uses `firstName`/`lastName` instead of `name`
- **StaffMember**: Uses `firstName`/`lastName` instead of `name`
- **Event**: Uses `title` instead of `name`

## Example Schema Pattern

**Before:**
```yaml
type: object
required:
  - id
  - name
properties:
  id:
    type: string
    format: uuid
  name:
    type: string
  description:
    type: string
  # entity-specific properties
```

**After:**
```yaml
allOf:
  - $ref: "./EntityMeta.yaml"
  - type: object
    required:
      - name
    properties:
      # only entity-specific properties
```

## Benefits

1. **DRY Principle**: Common fields defined once and reused across all entities
2. **Consistency**: All entities now have timestamps (`createdAt`, `updatedAt`)
3. **Maintainability**: Changes to common fields only need to be made in one place
4. **Clarity**: Entity-specific schemas are now more focused and easier to understand
5. **API Best Practices**: All entities follow consistent patterns with proper audit fields

## Files Modified

### Created
- `/api/schemas/EntityMeta.yaml`

### Modified  
- `/api/openapi.yaml` - Registered EntityMeta schema
- `/api/schemas/Activity.yaml`
- `/api/schemas/Area.yaml`
- `/api/schemas/Camp.yaml`
- `/api/schemas/Camper.yaml`
- `/api/schemas/Certification.yaml`
- `/api/schemas/Color.yaml`
- `/api/schemas/DurationPreset.yaml`
- `/api/schemas/Event.yaml`
- `/api/schemas/Group.yaml`
- `/api/schemas/HousingRoom.yaml`
- `/api/schemas/Location.yaml`
- `/api/schemas/Program.yaml`
- `/api/schemas/Role.yaml`
- `/api/schemas/Session.yaml`
- `/api/schemas/StaffMember.yaml`

## Usage in Other Schemas

When creating new entity schemas in the future, follow this pattern:

```yaml
allOf:
  - $ref: "./EntityMeta.yaml"
  - type: object
    required:
      - name  # Add if name should be required
      # other required fields specific to this entity
    properties:
      # entity-specific properties only
      # do NOT repeat id, name, description, createdAt, updatedAt
```

## Timestamps Added

The following entities previously lacked timestamps and now include them via EntityMeta:
- Camper
- StaffMember  
- Event
- Location

All other entities already had timestamps which were preserved during the refactoring.

