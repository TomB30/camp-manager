/**
 * Type exports for the camp manager application.
 * This file provides convenient type aliases for the OpenAPI-generated types.
 * 
 * When you regenerate api.ts, this file doesn't need to be touched.
 * Just run: npx openapi-typescript openapi.yaml -o src/types/api.ts
 */

import type { components } from './api';

// OpenAPI Schema Type Aliases
// These make it easier to import types without the verbose components["schemas"]["..."] syntax
// Camper types
export type Camper = components["schemas"]["Camper"];

// Staff member types
export type StaffMember = components["schemas"]["StaffMember"];

// Location types
export type Location = components["schemas"]["Location"];

// Housing room types
export type HousingRoom = components["schemas"]["HousingRoom"];

// Event types
export type Event = components["schemas"]["Event"];
export type EventCreationRequest = components["schemas"]["EventCreationRequest"];

// Conflict types
export type Conflict = components["schemas"]["Conflict"];

// Area types
export type Area = components["schemas"]["Area"];

// Label types
export type Label = components["schemas"]["Label"];

// Camper group filter types
export type CamperGroupFilter = components["schemas"]["CamperGroupFilter"];

// Camper group types
export type CamperGroup = components["schemas"]["CamperGroup"];

// Family group types
export type FamilyGroup = components["schemas"]["FamilyGroup"];

// Activity types
export type Activity = components["schemas"]["Activity"];

// Program types
export type Program = components["schemas"]["Program"];

// Certification types
export type Certification = components["schemas"]["Certification"];

// Camp color types
export type CampColor = components["schemas"]["CampColor"];

// Camp session types
export type CampSession = components["schemas"]["CampSession"];


// Re-export the components type for advanced usage
export type { components };

