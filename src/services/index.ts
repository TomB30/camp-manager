/**
 * Services Index
 * Central export point for all services
 */

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
export { labelsService, type LabelCreationRequest, type LabelUpdateRequest } from "./labelsService";

// Other services
export { conflictDetector } from "./conflicts";
