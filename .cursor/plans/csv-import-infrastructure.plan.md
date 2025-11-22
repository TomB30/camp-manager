<!-- f62595c0-d6fe-492a-b911-3f65dfc127bc add67365-ec2c-46e2-90ea-9fc2ec43f50d -->
# CSV Import API Infrastructure

## Architecture Overview

Build a generic, asynchronous CSV import system that:

- Starts with 3 MVP entities: campers, staff members, groups
- Validates CSV files before importing (dry-run mode)
- Supports both create-only and upsert modes
- Processes imports in background jobs
- Provides job status tracking
- Is easily extensible to all other entities

## Core Components

### 1. Domain Models (`backend/internal/domain/`)

**New file: `import_job.go`**

- `ImportJob` struct for tracking async import operations
  - Fields: ID, TenantID, CampID, EntityType, Status (pending/validating/validated/importing/completed/failed), Mode (create/upsert), FilePath, TotalRows, ProcessedRows, SuccessCount, ErrorCount, ValidationErrors (JSON), CreatedAt, UpdatedAt
  - Status enum: pending → validating → validated/failed → importing → completed/failed

### 2. Repository Layer (`backend/internal/repository/`)

**New file: `import_jobs.go`**

- `ImportJobsRepository` interface and implementation
  - CRUD operations for import jobs
  - Status updates with atomic operations

### 3. CSV Parser & Validator (`backend/pkg/csvimport/`)

**New package structure:**

- `parser.go`: Generic CSV parsing with validation
  - `ParseCSV(file io.Reader) ([]map[string]string, error)`
  - Header validation

- `validator.go`: Generic validation interface
  - `EntityValidator` interface: `ValidateRow(row map[string]string, mode ImportMode) error`

- `mapper.go`: Generic mapper interface
  - `EntityMapper` interface: `MapRowToEntity(row map[string]string) (interface{}, error)`

### 4. Entity-Specific Implementations (`backend/pkg/csvimport/entities/`)

**For each entity (campers, staff_members, groups):**

- Validator implementation (validates required fields, formats, relationships)
- Mapper implementation (converts CSV row to CreationRequest)
- CSV template definition (required/optional columns)

**Example for `camper_import.go`:**

- Required columns: name, birthday, gender, sessionId (or session name for lookup)
- Optional columns: description, groupIds (comma-separated names or IDs)
- Validate: birthday format, gender enum, session existence, groups existence
- Support lookup by name for foreign keys (e.g., session name → session ID)

### 5. Import Service (`backend/internal/service/`)

**New file: `import_service.go`**

- `ImportService` interface with:
  - `StartImport(ctx, tenantID, campID, entityType, file, mode) (*ImportJob, error)` - initiates async job
  - `GetImportStatus(ctx, tenantID, jobID) (*ImportJob, error)` - returns job status
  - `ValidateImport(ctx, tenantID, campID, entityType, file) (*ValidationResult, error)` - dry-run validation

- `importService` implementation:
  - Registry pattern for entity-specific validators/mappers
  - Coordinates validation phase
  - Queues background job for actual import
  - Updates job status

### 6. Background Worker (`backend/internal/worker/`)

**New file: `import_worker.go`**

- Goroutine-based worker (future: can be Redis queue, etc.)
- Polls for pending import jobs
- Executes import using entity service (reuses existing Create/Update logic)
- Batch processing with transaction management
- Updates job progress and status
- Handles errors and rollback

### 7. Handler Layer (`backend/internal/handler/`)

**New file: `imports.go`**

- `ImportsHandler` with endpoints:
  - `POST /api/v1/camps/{camp_id}/imports/{entity_type}/validate` - validate CSV without importing
  - `POST /api/v1/camps/{camp_id}/imports/{entity_type}` - upload and start async import
    - Query param: `mode=create|upsert` (default: create)
  - `GET /api/v1/camps/{camp_id}/imports/{job_id}` - get import job status
  - `GET /api/v1/camps/{camp_id}/imports/{entity_type}/template` - download CSV template

### 8. Database Migration

**New migration: `add_import_jobs_table.sql`**

- Create `import_jobs` table with proper indexes on tenant_id, camp_id, status

### 9. API Schema (`api/schemas/`)

**New schemas:**

- `ImportJob.yaml` - import job response
- `ImportMode.yaml` - enum (create, upsert)
- `ImportEntityType.yaml` - enum (campers, staff_members, groups)
- `ImportValidationResult.yaml` - validation response with errors per row
- `ImportJobStatus.yaml` - enum for job status

**New paths (`api/paths/imports/`):**

- `validate.yaml` - POST validate endpoint
- `create.yaml` - POST import endpoint
- `status.yaml` - GET status endpoint
- `template.yaml` - GET template endpoint

### 10. Frontend Support (Optional in plan)

Will need updates in `frontend/src/` for UI to upload CSV and track import progress, but backend-first approach.

## Import Flow

1. **Validation Phase:**

   - User uploads CSV via POST validate endpoint
   - Parse CSV and validate all rows
   - Return detailed errors (row number, field, error message)
   - No database changes

2. **Import Phase:**

   - User uploads CSV via POST import endpoint
   - Create ImportJob (status: pending)
   - Save file temporarily
   - Return job ID immediately
   - Background worker picks up job:
     - Set status to validating
     - Validate all rows (set status to validated or failed)
     - If validated, set status to importing
     - Process rows in batches with transactions
     - Update progress (processed count, success count, error count)
     - Set final status (completed or failed)

3. **Status Check:**

   - User polls GET status endpoint
   - Returns current job status, progress, and any errors

## Extensibility

To add new entity CSV import:

1. Create `{entity}_import.go` in `pkg/csvimport/entities/`
2. Implement `EntityValidator` and `EntityMapper` interfaces
3. Register in import service registry
4. Add entity type to `ImportEntityType` enum
5. No changes needed to core infrastructure

## CSV Format Examples

**Campers CSV:**

```
name,description,birthday,gender,sessionName,groupNames
John Doe,Returning camper,2010-05-15,male,Session 1,"Group A,Group B"
Jane Smith,,2011-08-22,female,Session 1,Group A
```

**Staff Members CSV:**

```
name,description,birthday,gender,roleName,phone,certificationNames,groupNames
Alice Johnson,Head counselor,1995-03-10,female,Counselor,555-0100,"CPR,First Aid",Group A
```

**Groups CSV:**

```
name,description,sessionName,housingRoomName
Cabin 1,Boys cabin,Session 1,Room 101
Activity Group A,Swimming group,Session 1,
```

### To-dos

- [ ] Create ImportJob domain model with status tracking
- [ ] Add import_jobs table migration
- [ ] Implement ImportJobsRepository for job persistence
- [ ] Build generic CSV parser and validator interfaces
- [ ] Implement validators/mappers for campers, staff, groups
- [ ] Create ImportService with registry pattern
- [ ] Build async worker for processing import jobs
- [ ] Add ImportsHandler with validate/import/status endpoints
- [ ] Define OpenAPI schemas for import endpoints
- [ ] Wire up dependencies in main.go and router
- [ ] Test CSV import flow end-to-end for all entities