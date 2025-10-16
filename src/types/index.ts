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
export type Camper = components["schemas"]["Camper"];
export type StaffMember = components["schemas"]["StaffMember"];
export type Location = components["schemas"]["Location"];
export type HousingRoom = components["schemas"]["HousingRoom"];
export type Event = components["schemas"]["Event"];
export type Conflict = components["schemas"]["Conflict"];
export type Area = components["schemas"]["Area"];
export type Label = components["schemas"]["Label"];
export type CamperGroupFilter = components["schemas"]["CamperGroupFilter"];
export type CamperGroup = components["schemas"]["CamperGroup"];
export type FamilyGroup = components["schemas"]["FamilyGroup"];
export type Activity = components["schemas"]["Activity"];
export type Program = components["schemas"]["Program"];
export type Certification = components["schemas"]["Certification"];
export type CampColor = components["schemas"]["CampColor"];
export type CampSession = components["schemas"]["CampSession"];

// Re-export the components type for advanced usage
export type { components };

