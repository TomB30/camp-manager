# API Client Usage Guide

This project uses **@hey-api/openapi-ts** to automatically generate TypeScript types and API client functions from the OpenAPI specification.

## 📦 What Gets Generated

When you run `npm run generate-client`, it creates:

### 1. **Direct TypeScript Types** (`types.gen.ts`)
No more `components["schemas"]["..."]` - just clean interfaces:

```typescript
export type Camper = {
  meta: EntityMeta;
  spec: {
    age: number;
    gender: 'male' | 'female';
    sessionId?: string;
    // ...
  };
};

export type CamperCreationRequest = {
  meta: EntityCreationRequestMeta;
  spec: {
    age: number;
    gender: 'male' | 'female';
    sessionId: string;
    // ...
  };
};
```

### 2. **Ready-to-Use API Functions** (`sdk.gen.ts`)
Fully typed functions for every endpoint:

```typescript
export const getCampers = (options?) => { ... }
export const postCampers = (options) => { ... }
export const getCampersById = (options) => { ... }
export const putCampersById = (options) => { ... }
export const deleteCampersById = (options) => { ... }
```

### 3. **HTTP Client** (`client.gen.ts`)
Pre-configured fetch-based HTTP client with type safety.

## 🚀 How to Use

### Basic Usage

```typescript
import { getCampers, postCampers, getCampersById } from '@/generated/api';

// List all campers
const { data, error } = await getCampers();
if (data) {
  console.log(data); // Type: Camper[]
}

// Get a specific camper
const { data: camper } = await getCampersById({
  path: { id: '123' }
});

// Create a new camper
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
```

### Configuring the Base URL

Create a client configuration file:

```typescript
// src/services/apiConfig.ts
import { client } from '@/generated/api/client.gen';

// Set the base URL for all API calls
client.setConfig({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
});

// Optional: Add authentication
export function setAuthToken(token: string) {
  client.interceptors.request.use((request) => {
    request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  });
}
```

Then import this config file early in your app (e.g., in `main.ts`):

```typescript
// src/main.ts
import './services/apiConfig'; // Configure API client
import { createApp } from 'vue';
// ...
```

### Using in a Service Layer

You can wrap the generated functions in your own service layer:

```typescript
// src/services/campersService.ts
import { 
  getCampers, 
  postCampers, 
  getCampersById,
  putCampersById,
  deleteCampersById 
} from '@/generated/api';
import type { Camper, CamperCreationRequest, CamperUpdateRequest } from '@/generated/api';

export const campersService = {
  async listCampers(): Promise<Camper[]> {
    const { data, error } = await getCampers();
    if (error) throw new Error('Failed to fetch campers');
    return data || [];
  },

  async createCamper(camper: CamperCreationRequest): Promise<Camper> {
    const { data, error } = await postCampers({
      body: camper
    });
    if (error) throw new Error('Failed to create camper');
    return data!;
  },

  async updateCamper(id: string, camper: CamperUpdateRequest): Promise<Camper> {
    const { data, error } = await putCampersById({
      path: { id },
      body: camper
    });
    if (error) throw new Error('Failed to update camper');
    return data!;
  },

  async deleteCamper(id: string): Promise<void> {
    const { error } = await deleteCampersById({
      path: { id }
    });
    if (error) throw new Error('Failed to delete camper');
  },

  async getCamperById(id: string): Promise<Camper | null> {
    const { data, error } = await getCampersById({
      path: { id }
    });
    if (error) return null;
    return data || null;
  }
};
```

### Using in Pinia Stores

```typescript
// src/stores/campers.ts
import { defineStore } from 'pinia';
import { getCampers, postCampers, deleteCampersById } from '@/generated/api';
import type { Camper, CamperCreationRequest } from '@/generated/api';

export const useCampersStore = defineStore('campers', {
  state: () => ({
    campers: [] as Camper[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchCampers() {
      this.loading = true;
      this.error = null;
      
      const { data, error } = await getCampers();
      
      if (error) {
        this.error = 'Failed to fetch campers';
        this.loading = false;
        return;
      }
      
      this.campers = data || [];
      this.loading = false;
    },

    async addCamper(camper: CamperCreationRequest) {
      const { data, error } = await postCampers({ body: camper });
      
      if (error) {
        throw new Error('Failed to create camper');
      }
      
      if (data) {
        this.campers.push(data);
      }
    },

    async removeCamper(id: string) {
      const { error } = await deleteCampersById({ path: { id } });
      
      if (error) {
        throw new Error('Failed to delete camper');
      }
      
      this.campers = this.campers.filter(c => c.meta.id !== id);
    }
  }
});
```

## 🔄 Regenerating the Client

Every time you update your OpenAPI specification (`api/openapi.yaml`), run:

```bash
npm run generate-client
```

This will:
1. Bundle your OpenAPI YAML files
2. Generate fresh TypeScript types
3. Generate fresh API functions
4. Overwrite the `src/generated/api/` directory

**Important:** Don't edit files in `src/generated/api/` manually - they'll be overwritten!

## 📝 Import Aliases

You can simplify imports by adding to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/generated/*": ["./src/generated/*"]
    }
  }
}
```

Then import like:
```typescript
import { getCampers, type Camper } from '@/generated/api';
```

## 🎯 Type Safety Examples

### Request Validation
The generated functions validate your requests at compile time:

```typescript
// ✅ Valid
await postCampers({
  body: {
    meta: { name: 'John' },
    spec: {
      age: 12,
      gender: 'male',
      sessionId: 'session-1'
    }
  }
});

// ❌ TypeScript error - missing required fields
await postCampers({
  body: {
    meta: { name: 'John' },
    spec: {
      age: 12
      // Missing: gender, sessionId
    }
  }
});

// ❌ TypeScript error - wrong type
await postCampers({
  body: {
    meta: { name: 'John' },
    spec: {
      age: '12', // Should be number
      gender: 'male',
      sessionId: 'session-1'
    }
  }
});
```

### Response Types
Response data is automatically typed:

```typescript
const { data } = await getCampers();
// data is typed as Camper[] | undefined

if (data) {
  data.forEach(camper => {
    console.log(camper.meta.name);     // ✅ Type-safe
    console.log(camper.spec.age);      // ✅ Type-safe
    console.log(camper.invalidField);  // ❌ TypeScript error
  });
}
```

## 🛠️ Advanced Configuration

### Custom Client Instance

```typescript
import { createClient } from '@/generated/api/client.gen';
import { getCampers } from '@/generated/api';

const customClient = createClient({
  baseUrl: 'https://api.production.com'
});

// Use custom client for specific calls
const { data } = await getCampers({ client: customClient });
```

### Error Handling with throwOnError

```typescript
try {
  // This will throw an exception on error instead of returning it
  const { data } = await getCampers<true>();
  console.log(data); // data is never undefined here
} catch (error) {
  console.error('API error:', error);
}
```

## 📚 Available Endpoints

All endpoints from your OpenAPI spec are generated. Common patterns:

- **GET `/resource`** → `getResource()`
- **POST `/resource`** → `postResource(options)`
- **GET `/resource/{id}`** → `getResourceById(options)`
- **PUT `/resource/{id}`** → `putResourceById(options)`
- **DELETE `/resource/{id}`** → `deleteResourceById(options)`

Examples for your API:
- `getCampers()`, `postCampers()`, `getCampersById()`, etc.
- `getStaffMembers()`, `postStaffMembers()`, `getStaffMembersById()`, etc.
- `getEvents()`, `postEvents()`, `getEventsById()`, etc.
- `getGroups()`, `postGroups()`, `getGroupsById()`, etc.
- And all other entities in your OpenAPI spec!

## 🎨 Migration from localStorage

To migrate from your current localStorage-based services:

1. Run `npm run generate-client`
2. Update your service files to use the generated functions
3. Configure the base URL in your environment variables
4. Test each endpoint
5. Remove localStorage code when ready

Example migration:

```typescript
// Before (localStorage)
async function listCampers(): Promise<Camper[]> {
  return storageService.getAll<Camper>(STORAGE_KEYS.CAMPERS);
}

// After (API)
async function listCampers(): Promise<Camper[]> {
  const { data, error } = await getCampers();
  if (error) throw new Error('Failed to fetch campers');
  return data || [];
}
```

## 🔗 Related Files

- OpenAPI Spec: `api/openapi.yaml`
- Generated Client: `src/generated/api/`
- Package Script: `npm run generate-client` (in `package.json`)

