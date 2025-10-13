# Staff Certifications Refactoring

## Overview
Removed redundant `certifications` field from `StaffMember` type and standardized on using only `certificationIds` with proper relational lookups.

## Problem Statement

The `StaffMember` type had two fields for storing certifications:
- `certifications?: string[]` - Array of certification names
- `certificationIds?: string[]` - Array of certification IDs

This violated database normalization principles and created several issues:

### Issues with Dual Fields:
1. **Data Duplication** - Same information stored twice
2. **Inconsistency Risk** - Fields could get out of sync
3. **Maintenance Burden** - Both fields needed updating when certifications changed
4. **Code Complexity** - Logic had to check both fields with fallbacks
5. **Poor Data Modeling** - Didn't follow relational database best practices

## Solution

**Standardized on `certificationIds` only** - Single source of truth with relational lookups.

### Benefits:
✅ Single source of truth  
✅ Cannot get out of sync  
✅ Easy to update certification details (name, expiration, etc.)  
✅ Proper relational data model  
✅ Follows database best practices  
✅ Cleaner, simpler code  

## Changes Made

### 1. OpenAPI Schema (`openapi.yaml`)
**Before:**
```yaml
certifications:
  type: array
  items:
    type: string
```

**After:**
```yaml
certificationIds:
  type: array
  items:
    type: string
    format: uuid
  description: IDs of certifications this staff member holds
```

### 2. Mock Data (`src/data/mockData.ts`)
Removed `certifications` field from all staff objects:

**Before:**
```typescript
staff.push({
  id: generateId('staff', 1),
  firstName: 'Sarah',
  lastName: 'Connor',
  certifications: ['First Aid', 'CPR', 'Wilderness First Aid'],
  certificationIds: [generateId('cert', 1), generateId('cert', 2), generateId('cert', 3)],
  // ...
});
```

**After:**
```typescript
staff.push({
  id: generateId('staff', 1),
  firstName: 'Sarah',
  lastName: 'Connor',
  certificationIds: [generateId('cert', 1), generateId('cert', 2), generateId('cert', 3)],
  // ...
});
```

### 3. Conflict Detection (`src/services/conflicts.ts`)
Removed backward compatibility fallback:

**Before:**
```typescript
// Support both certificationIds and certifications
if (staff.certificationIds && staff.certificationIds.length > 0) {
  staff.certificationIds.forEach(certId => {
    const cert = certifications.find(c => c.id === certId);
    if (cert) allCertifications.add(cert.name);
  });
}
// Fallback to certifications string array
else if (staff.certifications) {
  staff.certifications.forEach(certName => allCertifications.add(certName));
}
```

**After:**
```typescript
// Only use certificationIds
if (staff.certificationIds && staff.certificationIds.length > 0) {
  staff.certificationIds.forEach(certId => {
    const cert = certifications.find(c => c.id === certId);
    if (cert) allCertifications.add(cert.name);
  });
}
```

### 4. UI Components

#### StaffMemberDetailModal.vue
Simplified computed property:

**Before:**
```typescript
certificationNames(): string[] {
  if (!this.member) return [];
  
  if (this.member.certificationIds) {
    return this.member.certificationIds
      .map(id => {
        const cert = this.store.getCertificationById(id);
        return cert ? cert.name : '';
      })
      .filter(name => name.length > 0);
  }
  
  return this.member.certifications || []; // Fallback
}
```

**After:**
```typescript
certificationNames(): string[] {
  if (!this.member || !this.member.certificationIds) return [];
  
  return this.member.certificationIds
    .map(id => {
      const cert = this.store.getCertificationById(id);
      return cert ? cert.name : '';
    })
    .filter(name => name.length > 0);
}
```

#### StaffCard.vue
Simplified to one-liner:

**Before:**
```typescript
certificationCount(): number {
  if (this.member.certificationIds) {
    return this.member.certificationIds.length;
  }
  if (this.member.certifications) {
    return this.member.certifications.length;
  }
  return 0;
}
```

**After:**
```typescript
certificationCount(): number {
  return this.member.certificationIds?.length || 0;
}
```

#### Programs.vue
Added helper method for consistent lookups:

**Added:**
```typescript
getStaffCertificationNames(staff: any): string[] {
  if (!staff.certificationIds) return [];
  return staff.certificationIds
    .map((id: string) => {
      const cert = this.store.getCertificationById(id);
      return cert ? cert.name : '';
    })
    .filter((name: string) => name.length > 0);
}
```

**Template updated:**
```vue
<template v-if="getStaffCertificationNames(staff).length > 0" #metadata>
  <div class="staff-certifications">
    <span
      v-for="cert in getStaffCertificationNames(staff)"
      :key="cert"
      class="certification-badge"
    >
      {{ cert }}
    </span>
  </div>
</template>
```

#### StaffMembers.vue
Removed fallback checks:

**Before:**
```vue
<span v-if="item.certificationIds && item.certificationIds.length > 0">
  {{ item.certificationIds.length }} cert(s)
</span>
<span v-else-if="item.certifications && item.certifications.length > 0">
  {{ item.certifications.length }} cert(s)
</span>
```

**After:**
```vue
<span v-if="item.certificationIds && item.certificationIds.length > 0">
  {{ item.certificationIds.length }} cert(s)
</span>
```

**Filter updated:**
```typescript
if (this.filterCertification) {
  members = members.filter((member: StaffMember) => {
    if (!member.certificationIds) return false;
    return member.certificationIds.some(id => {
      const cert = this.store.getCertificationById(id);
      return cert && cert.name === this.filterCertification;
    });
  });
}
```

## Migration Notes

### For Future API Implementation
When implementing a real backend API:

1. **Database Schema**: Only store `certification_ids` in the `staff_members` table
2. **API Responses**: Return only `certificationIds` array
3. **Joins**: Perform certification lookups on the backend if needed for efficiency
4. **Legacy Data**: If migrating from old schema, drop the `certifications` column

### Breaking Changes
- Any code expecting `staff.certifications` will no longer work
- Must use `staff.certificationIds` and look up names via store

## Files Modified

1. `openapi.yaml` - Updated StaffMember schema
2. `src/data/mockData.ts` - Removed certifications from all staff
3. `src/services/conflicts.ts` - Removed backward compatibility
4. `src/components/modals/StaffMemberDetailModal.vue` - Simplified computed
5. `src/components/cards/StaffCard.vue` - Simplified computed
6. `src/views/Programs.vue` - Added helper method
7. `src/views/StaffMembers.vue` - Removed fallbacks

## Testing Checklist

✅ Staff cards display certification count correctly  
✅ Staff detail modal shows certification names  
✅ Programs view shows staff certifications  
✅ Staff members list shows certification count  
✅ Filtering by certification works  
✅ Conflict detection for missing certifications works  
✅ No linting errors  

## Future Improvements

1. **Caching** - Consider caching certification lookups for better performance
2. **Bulk Lookups** - Add a helper to look up multiple certifications at once
3. **Computed Properties** - Add to Pinia store for common certification operations
4. **Expiration Tracking** - Add logic to track certification expiration dates

