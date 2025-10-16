# API Quick Start Guide

## 🚀 Common Commands

```bash
# View the API documentation in your browser
npm run api:serve
# → Open http://localhost:8080/swagger-ui.html

# Validate your changes
npm run api:validate

# Lint with detailed feedback
npm run api:lint

# Bundle into single file
npm run api:bundle

# Generate TypeScript types
npm run api:generate-types

# Lint and bundle (pre-commit check)
npm run api:build
```

## 📝 Common Workflows

### Adding a New Entity

1. Create schema file: `api/schemas/MyEntity.yaml`
2. Define the entity properties
3. Add reference in `api/openapi.yaml`:
   ```yaml
   components:
     schemas:
       MyEntity:
         $ref: './schemas/MyEntity.yaml'
   ```
4. Validate: `npm run api:validate`

### Adding a New Endpoint

1. Create path file: `api/paths/my-endpoint.yaml`
2. Define operations (GET, POST, etc.)
3. Add reference in `api/openapi.yaml`:
   ```yaml
   paths:
     /my-endpoint:
       $ref: './paths/my-endpoint.yaml'
   ```
4. Validate: `npm run api:validate`

### Using a Reusable Parameter

In your path file:
```yaml
parameters:
  - $ref: '../parameters/id.yaml'
get:
  summary: Get item by ID
  # ...
```

### Before Committing

```bash
# Run this to ensure everything is valid
npm run api:build

# Optionally regenerate TypeScript types
npm run api:generate-types
```

## 🎯 File Naming Conventions

- **Schemas**: PascalCase (e.g., `Camper.yaml`, `StaffMember.yaml`)
- **Paths (collections)**: kebab-case (e.g., `campers.yaml`, `staff-members.yaml`)
- **Paths (by ID)**: kebab-case + ById (e.g., `campersById.yaml`, `staff-membersById.yaml`)
- **Parameters**: lowercase (e.g., `id.yaml`, `page.yaml`)

## 📂 Directory Structure

```
api/
├── openapi.yaml          ← Main entry point
├── schemas/              ← Entity definitions
├── parameters/           ← Reusable parameters
└── paths/                ← API endpoints
```

## 🔍 Viewing Documentation

**Option 1: Local Swagger UI** (Recommended)
```bash
npm run api:serve
# Open http://localhost:8080/swagger-ui.html
```

**Option 2: Online Swagger Editor**
- Go to https://editor.swagger.io/
- File → Import URL → paste your `openapi.yaml` content

**Option 3: VS Code Extension**
- Install "OpenAPI (Swagger) Editor" extension
- Open any `.yaml` file in `api/` folder
- Right-click → "Preview Swagger"

## 🛠️ Troubleshooting

**Error: "cannot find module"**
- Solution: The scripts use `npx` which downloads packages automatically
- First run might be slower while packages download

**Error: "invalid $ref"**
- Check that file paths are correct (relative to the referencing file)
- Schemas: `../schemas/EntityName.yaml`
- Parameters: `../parameters/paramName.yaml`

**Python server won't start**
- Make sure Python 3 is installed: `python3 --version`
- Alternative: `cd api && npx http-server -p 8080`

## 📚 More Information

See the full [README.md](./README.md) for detailed documentation.

