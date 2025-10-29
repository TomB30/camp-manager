# ✨ API Client Auto-Generation Setup Complete!

Your project now automatically generates **TypeScript types AND API functions** from your OpenAPI specification!

## 🎉 What You Get

### 1. **Clean TypeScript Types** (No More Manual Aliases!)

Instead of:
```typescript
export type Camper = components["schemas"]["Camper"];
```

You now get:
```typescript
import { type Camper } from '@/generated/api';
// Direct, clean types!
```

### 2. **Ready-to-Use API Functions**

All CRUD operations generated automatically:

```typescript
import { getCampers, postCampers, getCampersById } from '@/generated/api';

// List all campers
const { data } = await getCampers();

// Create a camper
const { data: newCamper } = await postCampers({
  body: {
    meta: { name: 'John Doe' },
    spec: {
      age: 12,
      gender: 'male',
      sessionId: 'session-123'
    }
  }
});

// Get by ID
const { data: camper } = await getCampersById({
  path: { id: '123' }
});
```

### 3. **Full Type Safety**

- ✅ Request bodies validated at compile time
- ✅ Path parameters typed
- ✅ Query parameters typed
- ✅ Response types automatic
- ✅ Autocomplete everywhere

## 🚀 Quick Start

### Step 1: Generate the Client

Every time you update `api/openapi.yaml`, run:

```bash
npm run generate-client
```

This creates fresh types and functions in `src/generated/api/`

### Step 2: Configure Base URL

Add to your `src/main.ts`:

```typescript
import { client } from '@/generated/api/client.gen';

client.setConfig({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
});
```

### Step 3: Use It!

```typescript
import { getCampers, type Camper } from '@/generated/api';

async function loadCampers() {
  const { data, error } = await getCampers();
  if (error) {
    console.error('Failed:', error);
    return;
  }
  console.log('Campers:', data);
}
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run generate-client` | Generate API client from OpenAPI spec |
| `npm run api:bundle` | Bundle OpenAPI YAML files |
| `npm run api:lint` | Lint OpenAPI specification |
| `npm run api:validate` | Validate OpenAPI specification |

## 📚 Documentation

- **Full Usage Guide:** `docs/API_CLIENT_USAGE.md`
- **Example Code:** `src/services/campersService.example.ts`
- **Generated Client:** `src/generated/api/` (auto-generated, don't edit)

## 🔄 Workflow

1. Update your OpenAPI spec: `api/openapi.yaml`
2. Run: `npm run generate-client`
3. Import and use the generated functions
4. Enjoy full type safety!

## 📦 What Was Installed

- **@hey-api/openapi-ts** - Modern OpenAPI code generator
  - Generates clean TypeScript types
  - Generates typed API functions
  - Uses native `fetch` (lightweight, no dependencies)

## 🎯 Generated API Functions

For every endpoint in your OpenAPI spec, you get functions like:

**Campers:**
- `getCampers()` - List all
- `postCampers(options)` - Create
- `getCampersById(options)` - Get one
- `putCampersById(options)` - Update
- `deleteCampersById(options)` - Delete

**Staff Members:**
- `getStaffMembers()`
- `postStaffMembers(options)`
- `getStaffMembersById(options)`
- `putStaffMembersById(options)`
- `deleteStaffMembersById(options)`

**And all other entities** (Events, Groups, Locations, Programs, etc.)

## 💡 Key Benefits

### Before (Manual):
```typescript
// ❌ Verbose type imports
import type { components } from '@/types/api';
type Camper = components["schemas"]["Camper"];

// ❌ Manual fetch calls
async function getCampers() {
  const response = await fetch('/api/campers');
  return response.json();
}

// ❌ No type safety
// ❌ No autocomplete
```

### After (Auto-Generated):
```typescript
// ✅ Clean imports
import { getCampers, type Camper } from '@/generated/api';

// ✅ One line, fully typed
const { data } = await getCampers();

// ✅ Full type safety
// ✅ Complete autocomplete
// ✅ Compile-time validation
```

## 🔍 Example: Full CRUD Operations

See `src/services/campersService.example.ts` for complete examples of:
- Listing resources
- Creating with validation
- Updating with path params + body
- Deleting with error handling
- Type-safe responses

## ⚙️ Configuration Files Updated

- ✅ `package.json` - Added `generate-client` script
- ✅ `.gitignore` - Excluded `src/generated/` (auto-generated files)
- ✅ Created documentation and examples

## 🎓 Learning Resources

1. Read `docs/API_CLIENT_USAGE.md` for detailed usage
2. Check `src/services/campersService.example.ts` for code examples
3. Explore `src/generated/api/` to see what was generated
4. Try it: Make a small change to `api/openapi.yaml` and regenerate!

## 🚧 Migration Path

To switch from localStorage to real API:

1. **Keep your current services** - They work as-is
2. **Configure the base URL** when ready
3. **Replace service implementations** one at a time:
   ```typescript
   // Change from:
   await storageService.getAll(STORAGE_KEYS.CAMPERS)
   
   // To:
   const { data } = await getCampers()
   ```
4. **Test each endpoint** as you migrate
5. **Remove localStorage code** when done

## 🎉 You're All Set!

Now you can:
1. Focus on writing your OpenAPI spec
2. Run `npm run generate-client`
3. Get fully typed API client automatically
4. Never manually write type aliases again!

Happy coding! 🚀

