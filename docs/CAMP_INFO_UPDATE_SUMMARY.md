# Camp Info Subsection Update Summary

## Overview
This update introduces a comprehensive camp information management system with new entities (Locations and Certifications) and reorganizes the sidebar to group pre-camp setup items under a dedicated "Camp Info" subsection.

## What Was Changed

### 1. New Data Types

#### **Location** (`Location`)
- Represents physical locations within the camp
- Types: `indoor`, `outdoor`, `facility`, `field`, `water`, `other`
- Tracks capacity, equipment, and notes
- Has expiration tracking for time-sensitive certifications

#### **Certification** (`Certification`)
- Represents staff certifications/qualifications
- Supports expiration tracking with validity periods
- Can be permanent or time-limited

### 2. Enhanced Existing Types

#### **Room** (Activity Rooms)
- Added `locationId` field to reference Location entities
- Keeps `location` string field for backward compatibility

#### **SleepingRoom** (Cabins)
- Added `locationId` field to reference Location entities
- Keeps `location` string field for backward compatibility

#### **StaffMember**
- Added `certificationIds` array to reference Certification entities
- Keeps `certifications` string array for backward compatibility

### 3. Mock Data Updates

#### **12 New Locations**
1. Main Building A (indoor, capacity: 100)
2. Arts & Crafts Building B (indoor, capacity: 50)
3. Education Building C (indoor, capacity: 60)
4. Sports Field Alpha (field, capacity: 50)
5. Recreation Center (facility, capacity: 80)
6. Central Plaza (outdoor, capacity: 100)
7. Basketball Court (outdoor, capacity: 30)
8. North Cabin Area (indoor, capacity: 20)
9. North Cabin Area - Upper (indoor, capacity: 20)
10. South Cabin Area (indoor, capacity: 20)
11. South Cabin Area - Upper (indoor, capacity: 20)
12. Lakefront (water, capacity: 40)

#### **10 New Certifications**
1. First Aid (24 months validity)
2. CPR (24 months validity)
3. Wilderness First Aid (36 months validity)
4. Lifeguard (24 months validity)
5. Swimming Instructor (36 months validity)
6. Climbing Instructor (24 months validity)
7. Archery Instructor (36 months validity)
8. Ropes Course Instructor (24 months validity)
9. Boat Driver (60 months validity)
10. Food Handler (36 months validity)

#### **Updated Relationships**
- All 10 Activity Rooms now reference Locations via `locationId`
- All 6 Sleeping Rooms (Cabins) now reference Locations via `locationId`
- All 9 Staff Members now reference Certifications via `certificationIds`

### 4. New Views & Components

#### **Locations View** (`/locations`)
- Grid and table view modes
- Filter by location type
- Search functionality
- Full CRUD operations

#### **Certifications View** (`/certifications`)
- Grid and table view modes
- Filter by expiration type (time-limited vs permanent)
- Search functionality
- Full CRUD operations

#### **Supporting Components**
- `LocationCard.vue` - Card display for locations
- `CertificationCard.vue` - Card display for certifications
- `LocationFormModal.vue` - Create/edit locations
- `LocationDetailModal.vue` - View location details
- `CertificationFormModal.vue` - Create/edit certifications
- `CertificationDetailModal.vue` - View certification details

### 5. Sidebar Reorganization

The sidebar now features a **"Camp Info"** collapsible subsection containing:
- **Locations** (new)
- **Activity Rooms** (moved from main nav)
- **Cabins** (moved from main nav)
- **Certifications** (new)

**Rationale**: These are all one-time setup items configured before the camp starts and shouldn't need frequent changes during camp operations.

### 6. Store & Service Updates

#### **Camp Store** (`campStore.ts`)
- Added `locations` and `certifications` state arrays
- Added getters: `getLocationById`, `getCertificationById`
- Added CRUD actions for both entities
- Integrated into `loadAll()` method

#### **Storage Service** (`storage.ts`)
- Added CRUD methods for locations
- Added CRUD methods for certifications
- Updated `seedData()` to accept locations and certifications
- Added localStorage keys for both entities

## Usage Examples

### Adding a New Location
```typescript
await store.addLocation({
  id: crypto.randomUUID(),
  name: 'New Outdoor Pavilion',
  description: 'Covered outdoor space',
  type: 'outdoor',
  capacity: 60,
  equipment: ['Picnic Tables', 'Grills'],
  notes: 'Great for BBQ events',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

### Adding a New Certification
```typescript
await store.addCertification({
  id: crypto.randomUUID(),
  name: 'Yoga Instructor',
  description: 'Certified yoga teaching credential',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

### Linking a Room to a Location
```typescript
const room: Room = {
  id: crypto.randomUUID(),
  name: 'New Activity Room',
  capacity: 25,
  type: 'activity',
  location: 'Building A', // String for display
  locationId: 'location-001', // Reference to Location entity
  equipment: ['Chairs', 'Tables'],
};
```

### Linking Staff to Certifications
```typescript
const staffMember: StaffMember = {
  id: crypto.randomUUID(),
  firstName: 'John',
  lastName: 'Doe',
  role: 'instructor',
  certifications: ['First Aid', 'CPR'], // Strings for display
  certificationIds: ['cert-001', 'cert-002'], // References to Certification entities
  email: 'john.doe@camp.com',
};
```

## Benefits

1. **Better Organization**: Camp setup items are grouped together in the sidebar
2. **Data Normalization**: Certifications and locations are now centralized entities
3. **Easier Management**: Camp managers can prepare locations and certifications lists once
4. **Consistency**: Staff certifications and location references are standardized
5. **Scalability**: Easy to add new certifications and locations as the camp grows
6. **Tracking**: Certification expiration tracking helps maintain compliance

## Migration Notes

- **Backward Compatible**: Existing string fields (`location`, `certifications`) are preserved
- **Automatic Seeding**: Mock data includes all new entities and relationships
- **No Breaking Changes**: Existing functionality remains intact

## Future Enhancements

Possible future improvements:
- Certification expiration date tracking per staff member
- Location capacity conflict detection
- Automated reports on staff certification status
- Location utilization analytics
- Bulk import/export of certifications and locations

