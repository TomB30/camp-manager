# API Documentation

This folder contains the OpenAPI specification for the Summer Camp Manager API, organized into modular files for better maintainability.

> 🚀 **Quick Start**: See [QUICK_START.md](./QUICK_START.md) for common commands and workflows.

## Structure

```
api/
├── openapi.yaml          # Main OpenAPI file (entry point)
├── schemas/              # Entity schema definitions
│   ├── Activity.yaml
│   ├── Area.yaml
│   ├── Camper.yaml
│   ├── CamperGroup.yaml
│   ├── CamperGroupFilter.yaml
│   ├── CampColor.yaml
│   ├── CampSession.yaml
│   ├── Certification.yaml
│   ├── Conflict.yaml
│   ├── Event.yaml
│   ├── FamilyGroup.yaml
│   ├── HousingRoom.yaml
│   ├── Label.yaml
│   ├── Location.yaml
│   ├── Program.yaml
│   └── StaffMember.yaml
├── parameters/           # Reusable parameter definitions
│   └── id.yaml
└── paths/                # API endpoint definitions
    ├── areas.yaml
    ├── areasById.yaml
    ├── campers.yaml
    ├── campersById.yaml
    ├── conflicts.yaml
    ├── events.yaml
    ├── eventsById.yaml
    ├── eventsByIdEnroll.yaml
    ├── eventsByIdUnenroll.yaml
    ├── rooms.yaml
    ├── roomsById.yaml
    ├── sleeping-rooms.yaml
    ├── sleeping-roomsById.yaml
    ├── staff-members.yaml
    └── staff-membersById.yaml
```

## Usage

The main entry point is `openapi.yaml`, which references all schema and path definitions using `$ref` directives.

### Viewing the API Spec

You can use various tools to view and work with this specification:

- **Local Swagger UI**: Open `swagger-ui.html` in your browser (requires a local server)
  ```bash
  # Using npm script (recommended)
  npm run api:serve
  # Then open http://localhost:8080/swagger-ui.html
  
  # Or manually
  cd api
  python3 -m http.server 8080
  ```
- **Swagger Editor**: Use the [Swagger Editor](https://editor.swagger.io/) - paste the contents or upload `openapi.yaml`
- **Redoc**: Generate beautiful documentation with [Redoc](https://github.com/Redocly/redoc)
- **VS Code**: Install the "OpenAPI (Swagger) Editor" extension for inline validation and preview

### Bundling for Distribution

To create a single-file version of the API spec:

```bash
# Using npm script (recommended)
npm run api:bundle

# Or directly
npx @redocly/cli bundle api/openapi.yaml -o api/openapi-bundled.yaml
```

This combines all the split files into one file, which is useful for:
- Sharing with external teams
- Using with tools that don't support `$ref` to external files
- Distribution in environments where multiple files aren't practical

### Editing the Spec

To modify the API specification:

1. **Add a new entity**: Create a new YAML file in `schemas/` and reference it in `openapi.yaml`
2. **Add a new endpoint**: Create a new YAML file in `paths/` and reference it in `openapi.yaml`
3. **Add a reusable parameter**: Create a new YAML file in `parameters/` and reference it in path files
4. **Modify existing definitions**: Edit the corresponding file in `schemas/`, `paths/`, or `parameters/`

### Benefits of This Structure

- **Easier to navigate**: Find specific entities or endpoints quickly
- **Better Git diffs**: Changes are localized to specific files
- **Team collaboration**: Multiple people can work on different entities without merge conflicts
- **Reusability**: Schemas and parameters can reference each other using relative paths
- **DRY principle**: Common parameters (like `id`) are defined once and reused everywhere
- **Maintainability**: Each file is focused on a single concern

## NPM Scripts

The following npm scripts are available for working with the API specification:

```bash
# Validate the OpenAPI spec
npm run api:validate

# Lint the OpenAPI spec (with detailed feedback)
npm run api:lint

# Bundle all split files into a single file
npm run api:bundle

# Start local server to view Swagger UI
npm run api:serve
# Then open http://localhost:8080/swagger-ui.html

# Generate TypeScript types from the OpenAPI spec
npm run api:generate-types

# Lint and bundle (useful before committing)
npm run api:build
```

## Validation

You can also run validation tools directly:

```bash
# Using swagger-cli
npx swagger-cli validate api/openapi.yaml

# Using Redocly CLI
npx @redocly/cli lint api/openapi.yaml
```

## Code Generation

This specification can be used to generate client SDKs and server stubs:

```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i api/openapi.yaml \
  -g typescript-axios \
  -o generated/client

# Generate server stubs
npx @openapitools/openapi-generator-cli generate \
  -i api/openapi.yaml \
  -g nodejs-express-server \
  -o generated/server
```

