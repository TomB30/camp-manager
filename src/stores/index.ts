/**
 * Stores Index
 * Central export point for all Pinia stores
 */

// Entity stores
export { useCampersStore } from './campersStore';
export { useStaffMembersStore } from './staffMembersStore';
export { useEventsStore } from './eventsStore';
export { useLocationsStore } from './locationsStore';
export { useHousingRoomsStore } from './housingRoomsStore';
export { useGroupsStore } from './groupsStore';
export { useFamilyGroupsStore } from './familyGroupsStore';
export { useProgramsStore } from './programsStore';
export { useActivitiesStore } from './activitiesStore';
export { useAreasStore } from './areasStore';
export { useCertificationsStore } from './certificationsStore';
export { useColorsStore } from './colorsStore';
export { useSessionsStore } from './sessionsStore';
export { useLabelsStore } from './labelsStore';

// Main coordinating store
export { useMainStore } from './mainStore';

// Other stores
export { useToastStore } from './toastStore';
