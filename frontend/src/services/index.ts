/**
 * Services Index
 * Central export point for all services
 */

// Authentication - example of using the generated API client directly
export { authService } from "./authService";

// Core infrastructure
export { storageService } from "./storage";
export { STORAGE_KEYS } from "./storageKeys";

// Entity services
export { campersService } from "./campersService";
export { staffMembersService } from "./staffMembersService";
export { eventsService } from "./eventsService";
export { locationsService } from "./locationsService";
export { housingRoomsService } from "./housingRoomsService";
export { groupsService } from "./groupsService";
export { programsService } from "./programsService";
export { activitiesService } from "./activitiesService";
export { areasService } from "./areasService";
export { certificationsService } from "./certificationsService";
export { rolesService } from "./rolesService";
export { colorsService } from "./colorsService";
export { sessionsService } from "./sessionsService";
export {
  labelsService,
} from "./labelsService";
export type { LabelCreationRequest, LabelUpdateRequest } from "./labelsStorage";
export { campService } from "./campService";
export { timeBlocksService } from "./timeBlocksService";

// Other services
export { conflictDetector } from "./conflicts";
