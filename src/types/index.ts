/**
 * Type exports for the camp manager application.
 * This file provides convenient type aliases for the OpenAPI-generated types.
 *
 * When you regenerate api.ts, this file doesn't need to be touched.
 * Just run: npx openapi-typescript openapi.yaml -o src/types/api.ts
 */

import type { components } from "./api";

// OpenAPI Schema Type Aliases
// These make it easier to import types without the verbose components["schemas"]["..."] syntax
// Camper types
export type Camper = components["schemas"]["Camper"];
export type CamperCreationRequest =
  components["schemas"]["CamperCreationRequest"];
export type CamperUpdateRequest = components["schemas"]["CamperUpdateRequest"];

// Staff member types
export type StaffMember = components["schemas"]["StaffMember"];
export type StaffMemberCreationRequest =
  components["schemas"]["StaffMemberCreationRequest"];
export type StaffMemberUpdateRequest =
  components["schemas"]["StaffMemberUpdateRequest"];
// Location types
export type Location = components["schemas"]["Location"];
export type LocationCreationRequest =
  components["schemas"]["LocationCreationRequest"];
export type LocationUpdateRequest =
  components["schemas"]["LocationUpdateRequest"];
// Housing room types
export type HousingRoom = components["schemas"]["HousingRoom"];
export type HousingRoomCreationRequest =
  components["schemas"]["HousingRoomCreationRequest"];
export type HousingRoomUpdateRequest =
  components["schemas"]["HousingRoomUpdateRequest"];
// Event types
export type Event = components["schemas"]["Event"];
export type EventCreationRequest =
  components["schemas"]["EventCreationRequest"];
export type EventUpdateRequest = components["schemas"]["EventUpdateRequest"];
// Area types
export type Area = components["schemas"]["Area"];
export type AreaCreationRequest = components["schemas"]["AreaCreationRequest"];
export type AreaUpdateRequest = components["schemas"]["AreaUpdateRequest"];
// Activity types
export type Activity = components["schemas"]["Activity"];
export type ActivityCreationRequest =
  components["schemas"]["ActivityCreationRequest"];
export type ActivityUpdateRequest =
  components["schemas"]["ActivityUpdateRequest"];
// Program types
export type Program = components["schemas"]["Program"];
export type ProgramCreationRequest =
  components["schemas"]["ProgramCreationRequest"];
export type ProgramUpdateRequest =
  components["schemas"]["ProgramUpdateRequest"];
// Certification types
export type Certification = components["schemas"]["Certification"];
export type CertificationCreationRequest =
  components["schemas"]["CertificationCreationRequest"];
export type CertificationUpdateRequest =
  components["schemas"]["CertificationUpdateRequest"];
// Camp color types
export type Color = components["schemas"]["Color"];
export type ColorCreationRequest =
  components["schemas"]["ColorCreationRequest"];
export type ColorUpdateRequest = components["schemas"]["ColorUpdateRequest"];
// Camp session types
export type Session = components["schemas"]["Session"];
export type SessionCreationRequest =
  components["schemas"]["SessionCreationRequest"];
export type SessionUpdateRequest =
  components["schemas"]["SessionUpdateRequest"];
// Roles
export type Role = components["schemas"]["Role"];
export type RoleCreationRequest = components["schemas"]["RoleCreationRequest"];
export type RoleUpdateRequest = components["schemas"]["RoleUpdateRequest"];
// Unified Group types (new)
export type Group = components["schemas"]["Group"];
export type GroupStaffFilters =
  components["schemas"]["Group"]["spec"]["staffFilters"];
export type GroupCamperFilters =
  components["schemas"]["Group"]["spec"]["camperFilters"];
export type GroupCreationRequest =
  components["schemas"]["GroupCreationRequest"];
export type GroupUpdateRequest = components["schemas"]["GroupUpdateRequest"];
// Camp types
export type Camp = components["schemas"]["Camp"];
export type CampCreationRequest = components["schemas"]["CampCreationRequest"];
export type CampUpdateRequest = components["schemas"]["CampUpdateRequest"];
// Duration Preset types
export type DurationPreset = components["schemas"]["DurationPreset"];
export type DurationPresetCreationRequest =
  components["schemas"]["DurationPresetCreationRequest"];
export type DurationPresetUpdateRequest =
  components["schemas"]["DurationPresetUpdateRequest"];
// Re-export the components type for advanced usage
export type { components };

// Label types
// export type Label = components["schemas"]["Label"];
export type Label = {
  meta: {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
  spec: {};
};
// Conflict types
// export type Conflict = components["schemas"]["Conflict"];
export type Conflict = {
  type:
    | "event_overcapacity"
    | "room_overcapacity"
    | "camper_double_booked"
    | "staff_double_booked"
    | "missing_certification";
  message: string;
  entityId: string;
  conflictingIds: string[];
};
