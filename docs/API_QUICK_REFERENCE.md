# API Client Quick Reference

## 🔄 Generate Client

```bash
npm run generate-client
```

Run this every time you update `api/openapi.yaml`

## 📦 Import

```typescript
// Import functions and types together
import { getCampers, postCampers, type Camper } from '@/generated/api';
```

## ⚙️ Configure (Once at App Startup)

```typescript
// In src/main.ts or before first API call
import { client } from '@/generated/api/client.gen';

client.setConfig({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
});
```

## 📖 Common Patterns

### GET List
```typescript
const { data, error } = await getCampers();
if (error) { /* handle error */ }
// data is Camper[] | undefined
```

### GET by ID
```typescript
const { data, error } = await getCampersById({
  path: { id: '123' }
});
```

### POST (Create)
```typescript
const { data, error } = await postCampers({
  body: {
    meta: { name: 'John' },
    spec: { age: 12, gender: 'male', sessionId: 'session-1' }
  }
});
```

### PUT (Update)
```typescript
const { data, error } = await putCampersById({
  path: { id: '123' },
  body: { 
    meta: { name: 'John Updated' },
    spec: { age: 13, gender: 'male', sessionId: 'session-1' }
  }
});
```

### DELETE
```typescript
const { error } = await deleteCampersById({
  path: { id: '123' }
});
```

## 🎯 All Available Functions

Replace `Campers` with any entity:

- `getCampers()` / `getStaffMembers()` / `getEvents()` / etc.
- `postCampers()` / `postStaffMembers()` / `postEvents()` / etc.
- `getCampersById()` / `getStaffMembersById()` / `getEventsById()` / etc.
- `putCampersById()` / `putStaffMembersById()` / `putEventsById()` / etc.
- `deleteCampersById()` / `deleteStaffMembersById()` / `deleteEventsById()` / etc.

Available for: Campers, StaffMembers, Events, Groups, Locations, HousingRooms, Programs, Activities, Areas, Certifications, Roles, Colors, Sessions

## 🛡️ Error Handling

### Option 1: Manual
```typescript
const { data, error } = await getCampers();
if (error) {
  console.error('Failed:', error);
  throw new Error('Failed to fetch campers');
}
return data!;
```

### Option 2: Throw on Error
```typescript
try {
  const { data } = await getCampers<true>();
  return data; // never undefined
} catch (error) {
  console.error('Failed:', error);
}
```

## 📝 Type Imports

```typescript
// Import types directly - no more components["schemas"]["..."]
import type { 
  Camper,
  CamperCreationRequest,
  CamperUpdateRequest,
  StaffMember,
  Event,
  // ... all other types
} from '@/generated/api';
```

## 🔧 Advanced: Custom Client

```typescript
import { createClient } from '@/generated/api/client.gen';

const customClient = createClient({
  baseUrl: 'https://different-api.com'
});

// Use with specific calls
const { data } = await getCampers({ 
  client: customClient 
});
```

## 🎨 In Vue Components

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { getCampers, type Camper } from '@/generated/api';

const campers = ref<Camper[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function loadCampers() {
  loading.value = true;
  error.value = null;
  
  const result = await getCampers();
  
  if (result.error) {
    error.value = 'Failed to load campers';
  } else {
    campers.value = result.data || [];
  }
  
  loading.value = false;
}
</script>
```

## 🏪 In Pinia Stores

```typescript
import { defineStore } from 'pinia';
import { getCampers, postCampers, type Camper } from '@/generated/api';

export const useCampersStore = defineStore('campers', {
  state: () => ({
    campers: [] as Camper[]
  }),
  
  actions: {
    async fetchCampers() {
      const { data } = await getCampers();
      if (data) this.campers = data;
    },
    
    async addCamper(camper: CamperCreationRequest) {
      const { data } = await postCampers({ body: camper });
      if (data) this.campers.push(data);
    }
  }
});
```

## 📚 More Info

- Full guide: `docs/API_CLIENT_USAGE.md`
- Examples: `src/services/campersService.example.ts`
- Generated code: `src/generated/api/`

